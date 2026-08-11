import type { AppConfig } from './config.js'
import { requireSecret } from './config.js'
import { requestUrl, usableOrNewRequest } from './confirmation-request.js'
import { doubleOptInEmail } from './confirmation-template.js'
import { confirmationTokenHash, verifyConfirmationToken } from './confirmation-token.js'
import type {
  ConfirmationPurpose,
  ConfirmationRequestRecord,
} from './confirmation-types.js'
import { subscribeContact } from './contact-consent.js'
import type { EmailProvider } from './providers.js'
import type { EmailStore } from './store.js'
import { createTrackingToken, ipHash } from './tracking.js'
import { welcomeEmail } from './welcome-template.js'

export async function subscribeWithConfirmation(
  deps: { store: EmailStore; provider: EmailProvider; config: AppConfig },
  input: { email: string; name?: string; source?: string },
): Promise<{
  id: string
  status: 'active' | 'pending'
  confirmationSent: boolean
}> {
  if (!deps.config.confirmation.doubleOptIn) {
    const result = await subscribeContact(deps.store, input)
    return { ...result, status: 'active', confirmationSent: false }
  }

  const suppressions = await deps.store.listActiveSuppressionsForEmail(input.email)
  if (suppressions.some((suppression) => suppression.reason !== 'unsubscribe')) {
    throw new Error('Email address is suppressed')
  }
  const contact = await deps.store.confirmations.upsertPendingContact(input)
  if (contact.status === 'active') {
    return { id: contact.id, status: 'active', confirmationSent: false }
  }

  const now = new Date()
  const request = await usableOrNewRequest({
    store: deps.store,
    config: deps.config,
    contactId: contact.id,
    source: input.source ?? 'signup',
    requestedAt: now,
    expiresAt: new Date(
      now.getTime() + deps.config.confirmation.ttlHours * 60 * 60 * 1000,
    ),
  })
  await deps.provider.send(
    await doubleOptInEmail({
      config: deps.config,
      email: contact.email,
      confirmationUrl: requestUrl(request, deps.config),
    }),
  )
  return { id: contact.id, status: 'pending', confirmationSent: true }
}

export async function confirmSubscription(
  deps: { store: EmailStore; provider: EmailProvider; config: AppConfig },
  input: {
    token: string
    ip?: string
    userAgent?: string
    sourceUrl?: string
    now?: Date
  },
): Promise<{
  confirmed: boolean
  alreadyConfirmed: boolean
  status: 'confirmed' | 'expired' | 'invalid'
  purpose?: ConfirmationPurpose
}> {
  const secret = requireSecret(deps.config.confirmation.secret, 'CONFIRMATION_SECRET')
  const payload = verifyConfirmationToken(input.token, secret)
  if (!payload) return invalid()
  const request = await deps.store.confirmations.findByTokenHash(
    confirmationTokenHash(input.token),
  )
  if (
    !request ||
    request.id !== payload.requestId ||
    request.contactId !== payload.contactId ||
    request.purpose !== payload.purpose ||
    request.expiresAt.toISOString() !== payload.expiresAt
  ) {
    return invalid()
  }
  return confirmStoredRequest(deps, input, request, secret)
}

async function confirmStoredRequest(
  deps: { store: EmailStore; provider: EmailProvider; config: AppConfig },
  input: {
    ip?: string
    userAgent?: string
    sourceUrl?: string
    now?: Date
  },
  request: ConfirmationRequestRecord,
  auditSecret: string,
) {
  if (request.status === 'confirmed') {
    return {
      confirmed: true,
      alreadyConfirmed: true,
      status: 'confirmed' as const,
      purpose: request.purpose,
    }
  }
  const now = input.now ?? new Date()
  if (request.status !== 'pending' || request.expiresAt.getTime() <= now.getTime()) {
    await deps.store.confirmations.expireRequest(request.id)
    return {
      confirmed: false,
      alreadyConfirmed: false,
      status: 'expired' as const,
      purpose: request.purpose,
    }
  }
  const confirmed = await deps.store.confirmations.confirmRequest({
    id: request.id,
    confirmedAt: now,
    ...(input.ip ? { confirmedIpHash: ipHash(input.ip, auditSecret) } : {}),
    ...(input.userAgent ? { confirmedUserAgent: input.userAgent.slice(0, 500) } : {}),
    ...(input.sourceUrl
      ? { confirmedSourceUrl: sanitizeConfirmationSourceUrl(input.sourceUrl) }
      : {}),
  })
  const success = confirmed.request?.status === 'confirmed'
  if (success && confirmed.newlyConfirmed && request.purpose === 'double_opt_in') {
    await sendWelcomeAfterConfirmation(deps, request.contactId)
  }
  return {
    confirmed: success,
    alreadyConfirmed: success && !confirmed.newlyConfirmed,
    status: success ? ('confirmed' as const) : ('invalid' as const),
    purpose: request.purpose,
  }
}

async function sendWelcomeAfterConfirmation(
  deps: { store: EmailStore; provider: EmailProvider; config: AppConfig },
  contactId: string,
): Promise<void> {
  try {
    const contact = await deps.store.getContact(contactId)
    if (contact?.status !== 'active') return

    const unsubscribeToken = createTrackingToken(
      { kind: 'unsubscribe', contactId },
      requireSecret(deps.config.unsubscribeSecret, 'UNSUBSCRIBE_SECRET'),
    )
    const unsubscribeUrl = `${deps.config.baseUrl.replace(/\/$/, '')}/unsubscribe/${unsubscribeToken}`

    await deps.provider.send(
      await welcomeEmail({
        config: deps.config,
        email: contact.email,
        unsubscribeUrl,
      }),
    )
  } catch (error) {
    console.error('Failed to send welcome email after confirmation', error)
  }
}

function invalid() {
  return {
    confirmed: false,
    alreadyConfirmed: false,
    status: 'invalid' as const,
  }
}

function sanitizeConfirmationSourceUrl(value: string): string {
  try {
    const url = new URL(value)
    url.pathname = '/confirm'
    url.search = ''
    url.hash = ''
    return url.toString().slice(0, 1_000)
  } catch {
    return 'invalid'
  }
}
