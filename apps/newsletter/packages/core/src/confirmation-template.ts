import type { AppConfig } from './config.js'
import { requireSecret } from './config.js'
import type { ProviderSendInput } from './providers.js'
import { renderDraftEmail } from './render.js'

export async function doubleOptInEmail(input: {
  config: AppConfig
  email: string
  confirmationUrl: string
}): Promise<ProviderSendInput> {
  const rendered = await renderDraftEmail({
    subject: `Confirm your email for ${input.config.appName}`,
    preview: `Confirm that you want to receive ${input.config.appName}.`,
    template: 'default',
    bodyMarkdown: `<Header name="off" read-time="off" dividers="off" />

One last step before I add you to ${input.config.appName}.

Click below to confirm you want to receive my occasional personal updates.

<Cta url="${input.confirmationUrl}" label="Confirm my subscription" />

If you didn't request this, ignore the email and you won't be added.

<Footer show="false" unsubscribe="false" />`,
  })
  const fromEmail = requireSecret(input.config.email.fromEmail, 'EMAIL_FROM_EMAIL')
  return {
    to: input.email,
    fromEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: fromEmail,
    ...(input.config.email.fromName ? { fromName: input.config.email.fromName } : {}),
  }
}
