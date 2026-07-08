import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseIssueSections, parseLinkItem } from './issue-parser.js'

describe('parseIssueSections', () => {
  it('parses directive blocks with attributes and prose between them', () => {
    const sections = parseIssueSections(
      [
        '::: hero color="#E999BE" image="https://example.com/head.jpg" title="Welcome to Issue 1!"',
        '> A quote worth reading.',
        ':::',
        '',
        'Plain intro paragraph.',
        '',
        '::: links title="Apps & Sites"',
        '[Passport Index](https://example.com)',
        'Explore the power of passports',
        '',
        'The description paragraph.',
        '---',
        '[Reproof](https://example.com/reproof)',
        'Collaborative writing app',
        '',
        'Second description.',
        ':::',
      ].join('\n'),
    )

    assert.deepEqual(
      sections.map((section) => section.type),
      ['hero', 'text', 'links'],
    )
    assert.equal(sections[0]?.attrs.color, '#E999BE')
    assert.equal(sections[0]?.attrs.title, 'Welcome to Issue 1!')
    assert.equal(sections[0]?.body, '> A quote worth reading.')
    assert.equal(sections[1]?.body, 'Plain intro paragraph.')
    assert.equal(sections[2]?.items.length, 2)
  })

  it('keeps unterminated blocks and ignores directives inside code fences', () => {
    const sections = parseIssueSections(
      ['```', '::: box color="pink"', '```', '', '::: quote', 'Still captured.'].join(
        '\n',
      ),
    )

    assert.deepEqual(
      sections.map((section) => section.type),
      ['text', 'quote'],
    )
    assert.match(sections[0]?.body ?? '', /::: box/)
    assert.equal(sections[1]?.body, 'Still captured.')
  })

  it('splits items on --- dividers only', () => {
    const sections = parseIssueSections(
      ['::: classifieds', 'First entry.', '---', 'Second entry.', ':::'].join('\n'),
    )
    assert.deepEqual(sections[0]?.items, ['First entry.', 'Second entry.'])
  })
})

describe('parseLinkItem', () => {
  it('extracts title link, tagline, and description', () => {
    const item = parseLinkItem(
      [
        '[Paku](https://example.com/paku)',
        'Air quality monitor',
        '',
        'As our planet warms, understanding the [AQI](https://example.com/aqi) matters.',
      ].join('\n'),
    )

    assert.equal(item.title, 'Paku')
    assert.equal(item.url, 'https://example.com/paku')
    assert.equal(item.tagline, 'Air quality monitor')
    assert.match(item.description, /AQI/)
  })

  it('handles heading-style titles without links', () => {
    const item = parseLinkItem('### Plain title\nTagline only')
    assert.equal(item.title, 'Plain title')
    assert.equal(item.url, '')
    assert.equal(item.tagline, 'Tagline only')
    assert.equal(item.description, '')
  })
})
