import crypto from 'node:crypto'
import type { AppConfig } from './config.js'
import { requireSecret } from './config.js'
import { confirmationTokenHash, createConfirmationToken } from './confirmation-token.js'
import type {
  ConfirmationRequestInput,
  ConfirmationRequestRecord,
} from './confirmation-types.js'
import type { EmailStore } from './store.js'

export async function usableOrNewRequest(input: {
  store: EmailStore
  config: AppConfig
  contactId: string
  source: string
  requestedAt: Date
  expiresAt: Date
}): Promise<ConfirmationRequestRecord> {
  const existing = await input.store.confirmations.findRequest({
    contactId: input.contactId,
    purpose: 'double_opt_in',
  })
  if (
    existing &&
    (existing.status === 'confirmed' ||
      (existing.status === 'pending' &&
        existing.expiresAt.getTime() > input.requestedAt.getTime()))
  ) {
    requestUrl(existing, input.config)
    return existing
  }
  if (existing?.status === 'pending') {
    await input.store.confirmations.expireRequest(existing.id)
  }
  const requestInput = newConfirmationRequest(input)
  await input.store.confirmations.createRequest(requestInput)
  const request = await input.store.confirmations.findByTokenHash(requestInput.tokenHash)
  if (!request) throw new Error('Failed to create confirmation request')
  return request
}

function newConfirmationRequest(input: {
  config: AppConfig
  contactId: string
  source: string
  requestedAt: Date
  expiresAt: Date
}): ConfirmationRequestInput {
  const request = {
    id: crypto.randomUUID(),
    contactId: input.contactId,
    purpose: 'double_opt_in' as const,
    expiresAt: input.expiresAt,
  }
  const token = createConfirmationToken(
    request,
    requireSecret(input.config.confirmation.secret, 'CONFIRMATION_SECRET'),
  )
  return {
    ...request,
    tokenHash: confirmationTokenHash(token),
    source: input.source,
    requestedAt: input.requestedAt,
  }
}

export function requestUrl(
  request: ConfirmationRequestRecord,
  config: AppConfig,
): string {
  const secret = requireSecret(config.confirmation.secret, 'CONFIRMATION_SECRET')
  const token = createConfirmationToken(request, secret)
  if (confirmationTokenHash(token) !== request.tokenHash) {
    throw new Error('Confirmation secret does not match the stored request')
  }
  return `${config.confirmation.baseUrl.replace(/\/$/, '')}/confirm?token=${encodeURIComponent(token)}`
}
