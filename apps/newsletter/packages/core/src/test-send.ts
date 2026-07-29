import type { AppConfig } from './config.js'
import type { EmailProvider } from './providers.js'
import { renderDraftEmail } from './render.js'
import type { DraftRecord, EmailStore } from './store.js'
import { prepareSwipeInviteTestDraft } from './swipe-invite.js'
import type { RecipientStatus } from './types.js'

export async function sendTestEmail(input: {
  config: AppConfig
  store: EmailStore
  provider: EmailProvider
  draft: DraftRecord
  to: string
  fromEmail: string
  status?: RecipientStatus
  liveSwipeInvite?: boolean
}): Promise<{ providerMessageId: string }> {
  const sendDraft = await prepareSwipeInviteTestDraft({
    config: input.config,
    store: input.store,
    draft: input.draft,
    email: input.to,
    live: input.liveSwipeInvite ?? false,
  })
  const rendered = await renderDraftEmail(
    sendDraft,
    input.status ? { status: input.status } : {},
  )
  const fromName = input.draft.fromName ?? input.config.email.fromName
  return input.provider.send({
    to: input.to,
    fromEmail: input.fromEmail,
    subject: `[TEST] ${rendered.subject}`,
    html: rendered.html.replaceAll('{{unsubscribeUrl}}', '#'),
    text: rendered.text,
    ...(fromName ? { fromName } : {}),
    ...(input.draft.replyTo ? { replyTo: input.draft.replyTo } : {}),
  })
}
