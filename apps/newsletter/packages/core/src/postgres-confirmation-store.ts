import { and, desc, eq, gt, sql } from 'drizzle-orm'
import type {
  ConfirmationRequestInput,
  ConfirmationRequestRecord,
  ConfirmationStore,
} from './confirmation-types.js'
import type { Database } from './db/index.js'
import { confirmationRequests, contacts, events } from './db/schema.js'
import { getEmailDomain, normalizeEmail } from './email-address.js'

export class PostgresConfirmationStore implements ConfirmationStore {
  constructor(private readonly db: Database) {}

  async upsertPendingContact(input: {
    email: string
    name?: string
    attributes?: Record<string, unknown>
    source?: string
  }): Promise<{ id: string; email: string; status: 'active' | 'pending' }> {
    const email = normalizeEmail(input.email)
    const [existing] = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.email, email))
      .limit(1)
    if (existing?.status === 'suppressed') throw new Error('Email address is suppressed')
    const attributes = { ...(existing?.attributes ?? {}), ...(input.attributes ?? {}) }
    const [row] = await this.db
      .insert(contacts)
      .values({
        email,
        emailDomain: getEmailDomain(email),
        status: existing?.status === 'active' ? 'active' : 'pending',
        attributes,
        ...(input.name ? { name: input.name } : {}),
        ...(input.source ? { source: input.source } : {}),
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          status: existing?.status === 'active' ? 'active' : 'pending',
          attributes,
          updatedAt: sql`now()`,
          ...(input.name ? { name: input.name } : {}),
          ...(input.source ? { source: input.source } : {}),
        },
      })
      .returning({ id: contacts.id, email: contacts.email, status: contacts.status })
    if (!row || (row.status !== 'active' && row.status !== 'pending')) {
      throw new Error('Failed to create pending contact')
    }
    return { ...row, status: row.status }
  }

  async createRequest(input: ConfirmationRequestInput): Promise<void> {
    await this.db.transaction(async (transaction) => {
      const [request] = await transaction
        .insert(confirmationRequests)
        .values({ ...input, metadata: input.metadata ?? {} })
        .onConflictDoNothing()
        .returning()
      if (!request) return
      await transaction
        .insert(events)
        .values({
          type: 'contact.confirmation_requested',
          contactId: request.contactId,
          source: request.source,
          occurredAt: request.requestedAt,
          idempotencyKey: `confirmation-requested:${request.id}`,
          metadata: {
            confirmationRequestId: request.id,
            purpose: request.purpose,
          },
        })
        .onConflictDoNothing()
    })
  }

  async findRequest(input: {
    contactId: string
    purpose: 'double_opt_in'
  }): Promise<ConfirmationRequestRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(confirmationRequests)
      .where(
        and(
          eq(confirmationRequests.contactId, input.contactId),
          eq(confirmationRequests.purpose, input.purpose),
        ),
      )
      .orderBy(desc(confirmationRequests.requestedAt))
      .limit(1)
    return row ? mapRequest(row) : undefined
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<ConfirmationRequestRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(confirmationRequests)
      .where(eq(confirmationRequests.tokenHash, tokenHash))
      .limit(1)
    return row ? mapRequest(row) : undefined
  }

  async confirmRequest(input: {
    id: string
    confirmedAt: Date
    confirmedIpHash?: string
    confirmedUserAgent?: string
    confirmedSourceUrl?: string
  }): Promise<{ request?: ConfirmationRequestRecord; newlyConfirmed: boolean }> {
    return this.db.transaction(async (transaction) => {
      const [row] = await transaction
        .update(confirmationRequests)
        .set({
          status: 'confirmed',
          confirmedAt: input.confirmedAt,
          updatedAt: sql`now()`,
          ...(input.confirmedIpHash ? { confirmedIpHash: input.confirmedIpHash } : {}),
          ...(input.confirmedUserAgent
            ? { confirmedUserAgent: input.confirmedUserAgent }
            : {}),
          ...(input.confirmedSourceUrl
            ? { confirmedSourceUrl: input.confirmedSourceUrl }
            : {}),
        })
        .where(
          and(
            eq(confirmationRequests.id, input.id),
            eq(confirmationRequests.status, 'pending'),
            gt(confirmationRequests.expiresAt, input.confirmedAt),
          ),
        )
        .returning()
      if (!row) {
        const [existing] = await transaction
          .select()
          .from(confirmationRequests)
          .where(eq(confirmationRequests.id, input.id))
          .limit(1)
        return {
          ...(existing ? { request: mapRequest(existing) } : {}),
          newlyConfirmed: false,
        }
      }

      await transaction
        .update(contacts)
        .set({
          status: 'active',
          subscribedAt: input.confirmedAt,
          unsubscribedAt: null,
          suppressedAt: null,
          updatedAt: sql`now()`,
        })
        .where(eq(contacts.id, row.contactId))
      await transaction
        .insert(events)
        .values([
          {
            type: 'contact.confirmed',
            contactId: row.contactId,
            source: row.source,
            occurredAt: input.confirmedAt,
            idempotencyKey: `confirmation-confirmed:${row.id}`,
            ...(input.confirmedUserAgent ? { userAgent: input.confirmedUserAgent } : {}),
            ...(input.confirmedIpHash ? { ipHash: input.confirmedIpHash } : {}),
            metadata: { confirmationRequestId: row.id, purpose: row.purpose },
          },
          {
            type: 'contact.subscribed',
            contactId: row.contactId,
            source: row.source,
            occurredAt: input.confirmedAt,
            idempotencyKey: `confirmation-subscribed:${row.id}`,
            metadata: { confirmationRequestId: row.id },
          },
        ])
        .onConflictDoNothing()
      return { request: mapRequest(row), newlyConfirmed: true }
    })
  }

  async expireRequest(id: string): Promise<void> {
    await this.db
      .update(confirmationRequests)
      .set({ status: 'expired', updatedAt: sql`now()` })
      .where(
        and(eq(confirmationRequests.id, id), eq(confirmationRequests.status, 'pending')),
      )
  }
}

function mapRequest(
  row: typeof confirmationRequests.$inferSelect,
): ConfirmationRequestRecord {
  return {
    id: row.id,
    contactId: row.contactId,
    purpose: row.purpose,
    tokenHash: row.tokenHash,
    status: row.status,
    source: row.source,
    requestedAt: row.requestedAt,
    expiresAt: row.expiresAt,
    ...(row.confirmedAt ? { confirmedAt: row.confirmedAt } : {}),
    ...(row.confirmedIpHash ? { confirmedIpHash: row.confirmedIpHash } : {}),
    ...(row.confirmedUserAgent ? { confirmedUserAgent: row.confirmedUserAgent } : {}),
    ...(row.confirmedSourceUrl ? { confirmedSourceUrl: row.confirmedSourceUrl } : {}),
    metadata: row.metadata,
  }
}
