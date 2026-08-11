import type { ContactInput } from './types.js'

export type ConfirmationPurpose = 'double_opt_in'
export type ConfirmationStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled'

export interface ConfirmationRequestRecord {
  id: string
  contactId: string
  purpose: ConfirmationPurpose
  tokenHash: string
  status: ConfirmationStatus
  source: string
  requestedAt: Date
  expiresAt: Date
  confirmedAt?: Date
  confirmedIpHash?: string
  confirmedUserAgent?: string
  confirmedSourceUrl?: string
  metadata: Record<string, unknown>
}

export interface ConfirmationRequestInput {
  id: string
  contactId: string
  purpose: ConfirmationPurpose
  tokenHash: string
  source: string
  requestedAt: Date
  expiresAt: Date
  metadata?: Record<string, unknown>
}

export interface ConfirmationStore {
  upsertPendingContact(input: ContactInput): Promise<{
    id: string
    email: string
    status: 'active' | 'pending'
  }>
  createRequest(input: ConfirmationRequestInput): Promise<void>
  findRequest(input: {
    contactId: string
    purpose: ConfirmationPurpose
  }): Promise<ConfirmationRequestRecord | undefined>
  findByTokenHash(tokenHash: string): Promise<ConfirmationRequestRecord | undefined>
  confirmRequest(input: {
    id: string
    confirmedAt: Date
    confirmedIpHash?: string
    confirmedUserAgent?: string
    confirmedSourceUrl?: string
  }): Promise<{ request?: ConfirmationRequestRecord; newlyConfirmed: boolean }>
  expireRequest(id: string): Promise<void>
}
