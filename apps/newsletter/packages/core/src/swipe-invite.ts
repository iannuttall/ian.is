import crypto from 'node:crypto'
import type { AppConfig } from './config.js'
import { requireSecret } from './config.js'
import { isEmailLike, normalizeEmail } from './email-address.js'
import type { DraftRecord, EmailStore, MessageRecord } from './store.js'
import type { DraftInput } from './types.js'

export const swipeInviteUrlPlaceholder = '{{confirmationUrl}}'

interface SwipeInviteSettings {
  purpose: 'swipe_invite'
  batchKey: string
  expiresAt: Date
}

interface SwipeInviteTokenPayload {
  kind: 'swipe_invite'
  email: string
  batchKey: string
  expiresAt: string
}

const version = 'v1'
const aad = Buffer.from('swipe-invite:v1', 'utf8')
const nonceLength = 12

export function swipeInviteSettings(
  draft: Pick<DraftInput, 'metadata'>,
): SwipeInviteSettings | undefined {
  const raw = draft.metadata?.confirmation
  if (!raw || typeof raw !== 'object') return undefined
  const value = raw as Record<string, unknown>
  if (value.purpose !== 'swipe_invite') {
    throw new Error('Draft confirmation purpose must be swipe_invite')
  }
  if (
    typeof value.batchKey !== 'string' ||
    !/^[a-z0-9][a-z0-9_-]{2,79}$/i.test(value.batchKey)
  ) {
    throw new Error('Draft confirmation batchKey is invalid')
  }
  if (typeof value.expiresAt !== 'string') {
    throw new Error('Draft confirmation expiresAt is required')
  }
  const expiresAt = new Date(value.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error('Draft confirmation expiresAt must be an ISO date')
  }
  return { purpose: value.purpose, batchKey: value.batchKey, expiresAt }
}

export function personalizeSwipeInviteDraft(input: {
  config: AppConfig
  draft: DraftRecord
  message: MessageRecord
}): { draft: DraftInput; excludedTrackingPrefixes: string[] } {
  return personalizeSwipeInviteDraftForEmail({
    config: input.config,
    draft: input.draft,
    email: input.message.toEmail,
  })
}

export function personalizeSwipeInviteDraftForEmail(input: {
  config: AppConfig
  draft: DraftRecord
  email: string
}): { draft: DraftInput; excludedTrackingPrefixes: string[] } {
  const hasPlaceholder = input.draft.bodyMarkdown.includes(swipeInviteUrlPlaceholder)
  const settings = swipeInviteSettings(input.draft)
  if (!hasPlaceholder && !settings) {
    return { draft: input.draft, excludedTrackingPrefixes: [] }
  }
  if (!hasPlaceholder || !settings) {
    throw new Error(
      'Swipe invitation drafts require metadata.confirmation and {{confirmationUrl}}',
    )
  }
  if (settings.expiresAt.getTime() <= Date.now()) {
    throw new Error('Swipe invitation campaign has expired')
  }

  const token = createSwipeInviteToken(
    {
      email: input.email,
      batchKey: settings.batchKey,
      expiresAt: settings.expiresAt,
    },
    requireSecret(input.config.swipeInvite.secret, 'SWIPE_INVITE_SECRET'),
  )
  const baseUrl = input.config.swipeInvite.baseUrl.replace(/\/$/, '')
  const url = `${baseUrl}/confirm?token=${encodeURIComponent(token)}`
  return {
    draft: {
      ...input.draft,
      bodyMarkdown: input.draft.bodyMarkdown.replaceAll(swipeInviteUrlPlaceholder, url),
    },
    excludedTrackingPrefixes: [`${baseUrl}/confirm?token=`],
  }
}

export function previewSwipeInviteDraft(
  draft: DraftInput,
  config: AppConfig,
): DraftInput {
  if (!draft.bodyMarkdown.includes(swipeInviteUrlPlaceholder)) return draft
  swipeInviteSettings(draft)
  return {
    ...draft,
    bodyMarkdown: draft.bodyMarkdown.replaceAll(
      swipeInviteUrlPlaceholder,
      `${config.swipeInvite.baseUrl.replace(/\/$/, '')}/confirm?token=test-link`,
    ),
  }
}

export async function prepareSwipeInviteTestDraft(input: {
  config: AppConfig
  store: Pick<EmailStore, 'findContactByEmail' | 'isSuppressed'>
  draft: DraftRecord
  email: string
  live: boolean
}): Promise<DraftInput> {
  if (!input.live) return previewSwipeInviteDraft(input.draft, input.config)

  const contact = await input.store.findContactByEmail(input.email)
  if (contact?.status !== 'active') {
    throw new Error('Live Swipe invitation tests require an active contact')
  }
  if (await input.store.isSuppressed(input.email)) {
    throw new Error('Live Swipe invitation test recipient is suppressed')
  }
  if (!input.draft.bodyMarkdown.includes(swipeInviteUrlPlaceholder)) {
    throw new Error('Draft has no Swipe invitation placeholder')
  }
  return personalizeSwipeInviteDraftForEmail({
    config: input.config,
    draft: input.draft,
    email: input.email,
  }).draft
}

export function createSwipeInviteToken(
  input: { email: string; batchKey: string; expiresAt: Date },
  secret: string,
): string {
  const payload: SwipeInviteTokenPayload = {
    kind: 'swipe_invite',
    email: normalizeEmail(input.email),
    batchKey: input.batchKey,
    expiresAt: input.expiresAt.toISOString(),
  }
  if (!isSwipeInvitePayload(payload)) {
    throw new Error('Invalid Swipe invitation payload')
  }

  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const nonce = crypto
    .createHmac('sha256', secret)
    .update(aad)
    .update(plaintext)
    .digest()
    .subarray(0, nonceLength)
  const cipher = crypto.createCipheriv('aes-256-gcm', inviteKey(secret), nonce)
  cipher.setAAD(aad)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const body = Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]).toString(
    'base64url',
  )
  return `${version}.${body}`
}

function inviteKey(secret: string): Buffer {
  return crypto
    .createHash('sha256')
    .update('swipe-invite-encryption\0', 'utf8')
    .update(secret, 'utf8')
    .digest()
}

function isSwipeInvitePayload(value: SwipeInviteTokenPayload): boolean {
  return (
    value.kind === 'swipe_invite' &&
    value.email === normalizeEmail(value.email) &&
    isEmailLike(value.email) &&
    /^[a-z0-9][a-z0-9_-]{2,79}$/i.test(value.batchKey) &&
    !Number.isNaN(Date.parse(value.expiresAt))
  )
}
