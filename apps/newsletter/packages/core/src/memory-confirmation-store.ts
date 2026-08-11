import crypto from 'node:crypto'
import type {
  ConfirmationRequestInput,
  ConfirmationRequestRecord,
  ConfirmationStore,
} from './confirmation-types.js'
import { getEmailDomain, normalizeEmail } from './email-address.js'
import type { ContactRecord, EventRecord } from './store.js'

export class MemoryConfirmationStore implements ConfirmationStore {
  readonly requests = new Map<string, ConfirmationRequestRecord>()

  constructor(
    private readonly contacts: Map<string, ContactRecord>,
    private readonly events: EventRecord[],
  ) {}

  async upsertPendingContact(input: {
    email: string
    name?: string
    attributes?: Record<string, unknown>
    source?: string
  }) {
    const email = normalizeEmail(input.email)
    const existing = this.contacts.get(email)
    if (existing?.status === 'suppressed') throw new Error('Email address is suppressed')
    const status: 'active' | 'pending' =
      existing?.status === 'active' ? 'active' : 'pending'
    const contact: ContactRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      email,
      emailDomain: getEmailDomain(email),
      status,
      attributes: { ...(existing?.attributes ?? {}), ...(input.attributes ?? {}) },
      hardBounceCount: existing?.hardBounceCount ?? 0,
      softBounceCount: existing?.softBounceCount ?? 0,
      complaintCount: existing?.complaintCount ?? 0,
      ...(input.name
        ? { name: input.name }
        : existing?.name
          ? { name: existing.name }
          : {}),
      ...(input.source
        ? { source: input.source }
        : existing?.source
          ? { source: existing.source }
          : {}),
      ...(existing?.subscribedAt ? { subscribedAt: existing.subscribedAt } : {}),
      ...(existing?.unsubscribedAt ? { unsubscribedAt: existing.unsubscribedAt } : {}),
      ...(existing?.suppressedAt ? { suppressedAt: existing.suppressedAt } : {}),
    }
    this.contacts.set(email, contact)
    return { id: contact.id, email: contact.email, status }
  }

  async createRequest(input: ConfirmationRequestInput): Promise<void> {
    if (
      Array.from(this.requests.values()).some(
        (item) => item.tokenHash === input.tokenHash,
      )
    ) {
      return
    }
    const request: ConfirmationRequestRecord = {
      ...input,
      status: 'pending',
      metadata: input.metadata ?? {},
    }
    this.requests.set(request.id, request)
    this.events.push({
      id: crypto.randomUUID(),
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
  }

  async findRequest(input: {
    contactId: string
    purpose: 'double_opt_in'
  }): Promise<ConfirmationRequestRecord | undefined> {
    return Array.from(this.requests.values())
      .filter(
        (request) =>
          request.contactId === input.contactId && request.purpose === input.purpose,
      )
      .toSorted((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0]
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<ConfirmationRequestRecord | undefined> {
    return Array.from(this.requests.values()).find(
      (request) => request.tokenHash === tokenHash,
    )
  }

  async confirmRequest(input: {
    id: string
    confirmedAt: Date
    confirmedIpHash?: string
    confirmedUserAgent?: string
    confirmedSourceUrl?: string
  }): Promise<{ request?: ConfirmationRequestRecord; newlyConfirmed: boolean }> {
    const request = this.requests.get(input.id)
    if (
      request?.status !== 'pending' ||
      request.expiresAt.getTime() <= input.confirmedAt.getTime()
    ) {
      return { ...(request ? { request } : {}), newlyConfirmed: false }
    }
    request.status = 'confirmed'
    request.confirmedAt = input.confirmedAt
    if (input.confirmedIpHash) request.confirmedIpHash = input.confirmedIpHash
    if (input.confirmedUserAgent) request.confirmedUserAgent = input.confirmedUserAgent
    if (input.confirmedSourceUrl) request.confirmedSourceUrl = input.confirmedSourceUrl

    const contact = Array.from(this.contacts.values()).find(
      (candidate) => candidate.id === request.contactId,
    )
    if (contact) {
      contact.status = 'active'
      contact.subscribedAt = input.confirmedAt
      delete contact.unsubscribedAt
      delete contact.suppressedAt
    }
    this.events.push({
      id: crypto.randomUUID(),
      type: 'contact.confirmed',
      contactId: request.contactId,
      source: request.source,
      occurredAt: input.confirmedAt,
      idempotencyKey: `confirmation-confirmed:${request.id}`,
      ...(input.confirmedUserAgent ? { userAgent: input.confirmedUserAgent } : {}),
      ...(input.confirmedIpHash ? { ipHash: input.confirmedIpHash } : {}),
      metadata: { confirmationRequestId: request.id, purpose: request.purpose },
    })
    this.events.push({
      id: crypto.randomUUID(),
      type: 'contact.subscribed',
      contactId: request.contactId,
      source: request.source,
      occurredAt: input.confirmedAt,
      idempotencyKey: `confirmation-subscribed:${request.id}`,
      metadata: { confirmationRequestId: request.id },
    })
    return { request, newlyConfirmed: true }
  }

  async expireRequest(id: string): Promise<void> {
    const request = this.requests.get(id)
    if (request?.status === 'pending') request.status = 'expired'
  }
}
