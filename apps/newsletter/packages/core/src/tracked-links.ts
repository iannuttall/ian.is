import crypto from 'node:crypto'
import { decodeHtmlAttribute, linkMetadata } from './link-metadata.js'
import type { EmailStore, MessageRecord } from './store.js'
import { createTrackingToken, tokenHash } from './tracking.js'

export async function rewriteTrackedLinks(input: {
  html: string
  message: MessageRecord
  secret: string
  draftMetadata: Record<string, unknown>
  store: Pick<EmailStore, 'createLink'>
  baseUrl: string
}): Promise<string> {
  let linkIndex = 0
  const links: Array<ReturnType<EmailStore['createLink']>> = []
  const rewritten = input.html.replace(
    /href="(https?:\/\/[^"#]+[^"]*)"/g,
    (match, escapedOriginalUrl: string) => {
      const originalUrl = decodeHtmlAttribute(escapedOriginalUrl)
      if (originalUrl.startsWith(`${input.baseUrl}/unsubscribe/`)) {
        return match
      }
      const linkId = crypto.randomUUID()
      const token = createTrackingToken(
        {
          kind: 'click',
          messageId: input.message.id,
          contactId: input.message.contactId,
          linkId,
        },
        input.secret,
      )
      links.push(
        input.store.createLink({
          id: linkId,
          messageId: input.message.id,
          broadcastId: input.message.broadcastId,
          originalUrl,
          linkIndex,
          tokenHash: tokenHash(token),
          metadata: linkMetadata(originalUrl, linkIndex, input.draftMetadata),
        }),
      )
      linkIndex += 1
      return `href="${input.baseUrl}/t/click/${token}"`
    },
  )
  await Promise.all(links)
  return rewritten
}
