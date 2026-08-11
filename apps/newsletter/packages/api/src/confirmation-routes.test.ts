import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CoreEmailPlatform,
  createConfirmationToken,
  loadConfig,
  MemoryEmailStore,
  TestEmailProvider,
} from '@email/core'
import { createApp } from './index.js'

describe('confirmation API', () => {
  it('confirms a pending contact through the protected route', async () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      API_TOKEN: 'api-token',
      EMAIL_PROVIDER: 'test',
      EMAIL_FROM_EMAIL: 'email@ian.is',
      EMAIL_DOUBLE_OPT_IN: 'true',
      CONFIRMATION_SECRET: 'confirmation-secret',
      UNSUBSCRIBE_SECRET: 'unsubscribe-secret',
    })
    const store = new MemoryEmailStore()
    const platform = new CoreEmailPlatform({
      store,
      provider: new TestEmailProvider(),
      config,
    })
    const app = createApp({ config, platform })
    const signup = await platform.subscribe({ email: 'api@example.com' })
    const request = await store.confirmations.findRequest({
      contactId: signup.id,
      purpose: 'double_opt_in',
    })
    assert.ok(request)

    const response = await app.request('/api/confirmations/confirm', {
      method: 'POST',
      headers: {
        authorization: 'Bearer api-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        token: createConfirmationToken(request, 'confirmation-secret'),
        sourceUrl: 'https://ian.is/confirm',
      }),
    })

    assert.equal(response.status, 200)
    const result = (await response.json()) as { status?: string }
    assert.equal(result.status, 'confirmed')
  })
})
