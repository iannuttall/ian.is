import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadConfig } from './config.js'
import { createConfirmationToken } from './confirmation-token.js'
import { MemoryEmailStore } from './memory-store.js'
import { CoreEmailPlatform } from './platform.js'
import {
  type ProviderSendInput,
  type ProviderSendResult,
  TestEmailProvider,
} from './providers.js'
import { welcomeEmailContent } from './welcome-template.js'

function setup(input: { provider?: TestEmailProvider } = {}) {
  const config = loadConfig({
    NODE_ENV: 'test',
    EMAIL_APP_NAME: "Ian's List",
    BASE_URL: 'https://list.ian.is',
    EMAIL_PROVIDER: 'test',
    EMAIL_FROM_EMAIL: 'email@ian.is',
    EMAIL_FROM_NAME: 'Ian Nuttall',
    EMAIL_DOUBLE_OPT_IN: 'true',
    EMAIL_CONFIRMATION_BASE_URL: 'https://ian.is',
    CONFIRMATION_SECRET: 'confirmation-secret',
    UNSUBSCRIBE_SECRET: 'unsubscribe-secret',
  })
  const store = new MemoryEmailStore()
  const provider = input.provider ?? new TestEmailProvider()
  const platform = new CoreEmailPlatform({ store, provider, config })
  return { config, store, provider, platform }
}

describe('double opt-in', () => {
  it('keeps a new contact pending until the signed request is confirmed', async () => {
    const { platform, provider, store } = setup()
    const signup = await platform.subscribe({
      email: 'reader@example.com',
      source: 'ian.is',
    })

    assert.equal(signup.status, 'pending')
    assert.equal(signup.confirmationSent, true)
    assert.equal(provider.sent.length, 1)
    assert.deepEqual(await store.listActiveContacts(), [])

    const request = await store.confirmations.findRequest({
      contactId: signup.id,
      purpose: 'double_opt_in',
    })
    assert.ok(request)
    const token = createConfirmationToken(request, 'confirmation-secret')
    const confirmed = await platform.confirmSubscription({
      token,
      ip: '192.0.2.1',
      userAgent: 'Test Browser',
      sourceUrl: 'https://ian.is/confirm?token=redacted',
    })

    assert.equal(confirmed.status, 'confirmed')
    assert.equal(confirmed.alreadyConfirmed, false)
    assert.equal((await store.findContactByEmail('reader@example.com'))?.status, 'active')
    assert.equal(
      store.events.some((event) => event.type === 'contact.confirmed'),
      true,
    )
    assert.equal(provider.sent.length, 2)
    const welcome = provider.sent[1]
    assert.equal(welcome?.subject, welcomeEmailContent.subject)
    assert.equal(welcome?.fromName, 'Ian Nuttall')
    assert.equal(welcome?.replyTo, 'email@ian.is')
    assert.match(welcome?.html ?? '', /Help the next email land in the right place/)
    assert.match(welcome?.html ?? '', /move it from Promotions to Primary/)
    assert.match(welcome?.html ?? '', /email@ian\.is/)
    assert.match(welcome?.html ?? '', /https:\/\/list\.ian\.is\/unsubscribe\//)
    assert.match(welcome?.html ?? '', /email-logo-light\.png/)
    assert.ok(
      welcome?.headers?.some(
        (header) =>
          header.name === 'List-Unsubscribe' &&
          header.value.startsWith('<https://list.ian.is/unsubscribe/'),
      ),
    )

    const repeated = await platform.confirmSubscription({ token })
    assert.equal(repeated.status, 'confirmed')
    assert.equal(repeated.alreadyConfirmed, true)
    assert.equal(provider.sent.length, 2)
  })

  it('does not send another confirmation to an active contact', async () => {
    const { config, store } = setup()
    const initialProvider = new TestEmailProvider()
    const initialPlatform = new CoreEmailPlatform({
      store,
      provider: initialProvider,
      config: loadConfig({
        NODE_ENV: 'test',
        EMAIL_PROVIDER: 'test',
        EMAIL_FROM_EMAIL: 'email@ian.is',
        EMAIL_DOUBLE_OPT_IN: 'false',
      }),
    })
    await initialPlatform.subscribe({ email: 'active@example.com' })

    const provider = new TestEmailProvider()
    const platform = new CoreEmailPlatform({ store, provider, config })
    const result = await platform.subscribe({ email: 'active@example.com' })

    assert.equal(result.status, 'active')
    assert.equal(result.confirmationSent, false)
    assert.equal(provider.sent.length, 0)
  })

  it('rejects expired and tampered confirmation tokens', async () => {
    const { platform, store } = setup()
    const signup = await platform.subscribe({ email: 'late@example.com' })
    const request = await store.confirmations.findRequest({
      contactId: signup.id,
      purpose: 'double_opt_in',
    })
    assert.ok(request)
    const token = createConfirmationToken(request, 'confirmation-secret')

    const expired = await platform.confirmSubscription({
      token,
      now: new Date(request.expiresAt.getTime() + 1),
    })
    assert.equal(expired.status, 'expired')

    const invalid = await platform.confirmSubscription({ token: `${token}x` })
    assert.equal(invalid.status, 'invalid')
  })

  it('keeps the confirmed subscription when the welcome email fails', async () => {
    const provider = new FailingWelcomeProvider()
    const { platform, store } = setup({ provider })
    const signup = await platform.subscribe({ email: 'reader@example.com' })
    const request = await store.confirmations.findRequest({
      contactId: signup.id,
      purpose: 'double_opt_in',
    })
    assert.ok(request)
    const token = createConfirmationToken(request, 'confirmation-secret')
    const originalConsoleError = console.error
    console.error = () => undefined

    try {
      const result = await platform.confirmSubscription({ token })

      assert.equal(result.confirmed, true)
      assert.equal(
        (await store.findContactByEmail('reader@example.com'))?.status,
        'active',
      )
      assert.equal(provider.sent.length, 2)
    } finally {
      console.error = originalConsoleError
    }
  })
})

class FailingWelcomeProvider extends TestEmailProvider {
  override async send(input: ProviderSendInput): Promise<ProviderSendResult> {
    const result = await super.send(input)
    if (this.sent.length === 2) throw new Error('Welcome send failed')
    return result
  }
}
