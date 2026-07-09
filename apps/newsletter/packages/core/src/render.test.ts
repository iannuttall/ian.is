import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { listEmailTemplates, renderDraft, renderDraftEmail } from './render.js'

describe('renderDraft', () => {
  it('sanitizes unsafe markdown html', () => {
    const rendered = renderDraft({
      subject: 'Hello',
      bodyMarkdown: '# Hi\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
    })

    assert.equal(rendered.subject, 'Hello')
    assert.match(rendered.html, /<h1>Hi<\/h1>/)
    assert.doesNotMatch(rendered.html, /script/)
    assert.doesNotMatch(rendered.html, /javascript:/)
  })

  it('renders the default React Email template from markdown', async () => {
    const rendered = await renderDraftEmail({
      subject: 'Default subject',
      preview: 'Preview text',
      bodyMarkdown: 'Hello [there](https://example.com?a=1&b=2).',
    })

    assert.equal(rendered.subject, 'Default subject')
    assert.match(rendered.html, /<!DOCTYPE html|<!doctype html/i)
    assert.match(rendered.html, /Preview text/)
    assert.match(rendered.html, /https:\/\/example.com\?a=1&b=2/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
    assert.match(rendered.html, /Inter, Helvetica, Arial, sans-serif/)
    assert.match(rendered.html, /Ian(&#x27;|')s List/)
    assert.match(rendered.text, /Hello/)
  })

  it('renders modular sections inside the default template', async () => {
    const rendered = await renderDraftEmail({
      subject: 'Welcome',
      template: 'default',
      bodyMarkdown: [
        '::: header name="Issue 001"',
        ':::',
        '',
        'Plain intro text.',
        '',
        '::: text title="What to expect"',
        '- Practical walkthroughs',
        '- Useful tools',
        ':::',
        '',
        '::: sponsor title="Sponsor Title" label-url="https://example.com"',
        'Sponsored copy.',
        ':::',
        '',
        '::: links title="Worth a Click"',
        '[Paku](https://example.com/paku)',
        'Air quality monitor',
        '',
        'Description text.',
        ':::',
        '',
        '::: classifieds title="Classifieds"',
        '[MicroSponsor](https://example.com/micro) helps builders reach useful readers.',
        ':::',
      ].join('\n'),
    })

    assert.match(rendered.html, /Plain intro text/)
    assert.match(rendered.html, /What to expect/)
    assert.match(rendered.html, />Sponsor Title</)
    assert.match(rendered.html, /#F1F1F1/)
    assert.match(rendered.html, /Issue 001/)
    assert.match(rendered.html, /Worth a Click/)
    assert.match(rendered.html, /Classifieds/)
    assert.match(rendered.html, /Advertise on Ian(&#x27;|')s List[\s\S]*Unsubscribe/)
    assert.doesNotMatch(rendered.html, /Browse older issues/)
    assert.match(rendered.html, /Book yours ↗︎/)
    assert.match(rendered.html, /\[if mso\]/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
  })

  it('lists available templates', () => {
    assert.deepEqual(
      listEmailTemplates().map((template) => template.key),
      ['default'],
    )
  })
})
