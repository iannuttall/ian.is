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

  it('renders React Email templates from markdown', async () => {
    const rendered = await renderDraftEmail({
      subject: 'React subject',
      preview: 'Preview text',
      template: 'react-newsletter',
      bodyMarkdown: 'Hello [there](https://example.com?a=1&b=2).',
    })

    assert.equal(rendered.subject, 'React subject')
    assert.match(rendered.html, /<!DOCTYPE html|<!doctype html/i)
    assert.match(rendered.html, /Preview text/)
    assert.match(rendered.html, /https:\/\/example.com\?a=1&b=2/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
    assert.match(rendered.html, /Inter, Helvetica, Arial, sans-serif/)
    assert.match(rendered.html, /Ian(&#x27;|')s List/)
    assert.match(rendered.text, /Hello/)
  })

  it('renders the modular issue template with sections', async () => {
    const rendered = await renderDraftEmail({
      subject: 'Issue 1',
      preview: 'Issue preview',
      template: 'react-issue',
      bodyMarkdown: [
        '::: hero color="#E999BE" image="https://example.com/head.jpg" title="Welcome to Issue 1!" online-url="https://example.com/issues/1"',
        '> A quote worth reading.',
        ':::',
        '',
        '::: sponsor title="Sponsor Title" image="https://example.com/sponsor.png"',
        'Sponsored copy with a ==highlighted deal== and a [link](https://example.com).',
        ':::',
        '',
        '::: poll question="Favourite tool?" results-url="https://example.com/polls"',
        '[Editor](https://example.com/vote-a)',
        '---',
        '[Terminal](https://example.com/vote-b)',
        ':::',
        '',
        '::: links title="Apps & Sites"',
        '[Passport Index](https://example.com/passports)',
        'Explore the power of passports',
        '',
        'The description paragraph.',
        ':::',
        '',
        '::: classifieds note="Paid ads." button="Book yours →" button-url="https://example.com/book"',
        'A classified entry.',
        ':::',
      ].join('\n'),
    })

    assert.match(rendered.html, /#E999BE/)
    assert.match(rendered.html, /logo-top\.png/)
    assert.match(rendered.html, /logo-bottom\.png/)
    assert.match(rendered.html, />Sponsor Title</)
    assert.match(rendered.html, /#F1F1F1/)
    assert.match(rendered.html, /border-left:26px solid/)
    assert.match(rendered.html, /Passport Index/)
    assert.match(rendered.html, /Book yours/)
    assert.match(rendered.html, /background-color:#FDF2B4/)
    assert.match(rendered.html, /Favourite tool\?/)
    assert.match(rendered.html, /Previous poll results/)
    assert.match(rendered.html, /#F1C755/)
    assert.match(rendered.html, /Advertise on Ian(&#x27;|')s List/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
    assert.match(rendered.html, /\[if mso\]/)
    assert.match(rendered.html, /<table[^>]*width="640"/)
    assert.match(rendered.text, /classified entry/)
  })

  it('renders the simple issue header with a color strip', async () => {
    const rendered = await renderDraftEmail({
      subject: 'Issue 2',
      template: 'react-issue',
      bodyMarkdown: [
        '::: header color="green" title="Issue 2" online-url="https://example.com/issues/2"',
        ':::',
        '',
        'Body text.',
      ].join('\n'),
    })

    assert.match(rendered.html, /#F1F6EF/)
    assert.match(rendered.html, /logo-mark\.png/)
    assert.match(rendered.html, /Ian(&#x27;|')s List/)
    assert.match(rendered.html, /Issue 2/)
    assert.doesNotMatch(rendered.html, /logo-top\.png/)
    assert.match(rendered.html, /Enjoyed this issue/)
  })

  it('renders issue sections inside the note template', async () => {
    const rendered = await renderDraftEmail({
      subject: 'Note',
      template: 'react-note',
      bodyMarkdown: [
        'Plain intro text.',
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
      ].join('\n'),
    })

    assert.match(rendered.html, /Plain intro text/)
    assert.match(rendered.html, />Sponsor Title</)
    assert.match(rendered.html, /#F1F1F1/)
    assert.match(rendered.html, /Worth a Click/)
    assert.match(rendered.html, /\[if mso\]/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
  })

  it('lists available templates', () => {
    assert.deepEqual(
      listEmailTemplates().map((template) => template.key),
      ['default', 'react-newsletter', 'react-minimal', 'react-note', 'react-issue'],
    )
  })
})
