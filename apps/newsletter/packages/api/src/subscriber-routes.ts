import type { EmailPlatform } from '@email/core'
import type { Hono } from 'hono'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
})

export function registerSubscriberRoutes(app: Hono, platform: EmailPlatform): void {
  app.post('/api/subscribe', async (c) => {
    const body = subscribeSchema.parse(await c.req.json())
    return c.json(
      await platform.subscribe({
        email: body.email,
        ...(body.name ? { name: body.name } : {}),
        ...(body.source ? { source: body.source } : {}),
      }),
      201,
    )
  })

  app.get('/api/subscribers/count', async (c) => {
    const audience = await platform.previewAudience({ limit: 1 })
    return c.json({ count: audience.total })
  })
}
