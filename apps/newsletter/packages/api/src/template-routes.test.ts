import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { authorized, makeTestApp } from './index.test-helper.js'

describe('template routes', () => {
  it('lists and renders templates', async () => {
    const { app } = makeTestApp()
    const templatesResponse = await app.request('/api/templates', {
      headers: { 'x-api-token': 'api-token' },
    })
    assert.equal(templatesResponse.status, 200)
    const templates = (await templatesResponse.json()) as {
      templates: Array<{ key: string }>
    }
    assert.ok(templates.templates.some((template) => template.key === 'react-minimal'))
    assert.ok(templates.templates.some((template) => template.key === 'react-note'))

    const rendered = (await authorized(app, '/api/templates/render', {
      subject: 'Template QA',
      bodyMarkdown: 'Read [this](https://example.com).',
      template: 'react-newsletter',
      preview: 'Preview',
    })) as { html: string; text: string }
    assert.match(rendered.html, /https:\/\/example.com/)
    assert.match(rendered.html, /{{unsubscribeUrl}}/)
    assert.match(rendered.text, /Read/)
  })
})
