import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { authorized, makeTestApp } from './index.test-helper.js'

describe('subscriber routes', () => {
  it('returns the active, unsuppressed subscriber count to authorized callers', async () => {
    const { app, store } = makeTestApp()

    assert.equal((await app.request('/api/subscribers/count')).status, 401)

    await authorized(app, '/api/subscribe', { email: 'active@example.com' })
    await authorized(app, '/api/subscribe', { email: 'blocked@example.com' })
    await store.addSuppression({
      email: 'blocked@example.com',
      reason: 'manual',
      source: 'test',
    })

    const response = await app.request('/api/subscribers/count', {
      headers: { 'x-api-token': 'api-token' },
    })

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { count: 1 })
  })
})
