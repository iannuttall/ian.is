import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ZodError } from 'zod'
import { loadConfig } from './config.js'

describe('loadConfig', () => {
  it('requires a positive provider send rate override', () => {
    assert.throws(
      () => loadConfig({ NODE_ENV: 'test', EMAIL_SEND_RATE_PER_SECOND: '0' }),
      ZodError,
    )
  })

  it('rejects placeholder secrets outside tests', () => {
    assert.throws(
      () => loadConfig({ API_TOKEN: 'replace-me' }),
      /API_TOKEN must not use a placeholder secret/,
    )
    assert.throws(
      () => loadConfig({ SWIPE_INVITE_SECRET: 'changeme' }),
      /SWIPE_INVITE_SECRET must not use a placeholder secret/,
    )
    assert.throws(
      () => loadConfig({ CONFIRMATION_SECRET: 'change-me' }),
      /CONFIRMATION_SECRET must not use a placeholder secret/,
    )
    assert.doesNotThrow(() => loadConfig({ NODE_ENV: 'test', API_TOKEN: 'replace-me' }))
  })

  it('enables double opt-in outside tests with a 72-hour confirmation window', () => {
    const config = loadConfig({})
    assert.equal(config.confirmation.doubleOptIn, true)
    assert.equal(config.confirmation.ttlHours, 72)
    assert.equal(config.confirmation.baseUrl, 'https://ian.is')
  })
})
