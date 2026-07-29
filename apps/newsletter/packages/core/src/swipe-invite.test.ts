import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadConfig } from './config.js'
import { CoreEmailPlatform } from './platform.js'
import { TestEmailProvider } from './providers.js'
import { MemoryEmailStore } from './store.js'

describe('Swipe invitations', () => {
  it('personalizes invitations without click tracking the consent URL', async () => {
    const store = new MemoryEmailStore()
    const provider = new TestEmailProvider()
    const platform = new CoreEmailPlatform({
      store,
      provider,
      config: loadConfig({
        NODE_ENV: 'test',
        BASE_URL: 'https://list.ian.is',
        EMAIL_FROM_EMAIL: 'ian@example.com',
        SWIPE_INVITE_BASE_URL: 'https://swipe.md',
        SWIPE_INVITE_SECRET: 'shared-swipe-invite-secret',
      }),
    })

    await platform.subscribe({ email: 'reader@example.com' })
    const draft = await platform.createDraft({
      subject: 'Move to Swipe',
      bodyMarkdown: '[Subscribe to Swipe]({{confirmationUrl}})',
      metadata: {
        confirmation: {
          purpose: 'swipe_invite',
          batchKey: 'ians-list-to-swipe-test',
          expiresAt: '2099-08-31T23:59:59.000Z',
        },
      },
    })
    await platform.createBroadcast({
      draftId: draft.id,
      scheduledAt: new Date(0),
    })
    await platform.sendDue(new Date('2026-07-29T00:00:00.000Z'))

    const html = provider.sent[0]?.html ?? ''
    const confirmationUrl = html.match(/https:\/\/swipe\.md\/confirm\?token=[^"]+/)?.[0]
    assert.ok(confirmationUrl)
    assert.doesNotMatch(confirmationUrl, /reader(?:%40|@)example\.com/)
    assert.doesNotMatch(confirmationUrl, /\/t\/click\//)
    assert.equal(
      Array.from(store.links.values()).some((link) =>
        link.originalUrl.startsWith('https://swipe.md/confirm?token='),
      ),
      false,
    )
  })
})
