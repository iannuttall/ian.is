import type { EmailPlatform } from '@email/core'
import type { Hono } from 'hono'
import { z } from 'zod'

const confirmSubscriptionSchema = z.object({
  token: z.string().min(20).max(4_096),
  ip: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
  sourceUrl: z.string().url().max(1_000).optional(),
})

export function registerConfirmationRoutes(app: Hono, platform: EmailPlatform): void {
  app.post('/api/confirmations/confirm', async (c) => {
    const body = confirmSubscriptionSchema.parse(await c.req.json())
    const result = await platform.confirmSubscription({
      token: body.token,
      ...(body.ip ? { ip: body.ip } : {}),
      ...(body.userAgent ? { userAgent: body.userAgent } : {}),
      ...(body.sourceUrl ? { sourceUrl: body.sourceUrl } : {}),
    })
    if (result.status === 'invalid') return c.json(result, 400)
    if (result.status === 'expired') return c.json(result, 410)
    return c.json(result)
  })
}
