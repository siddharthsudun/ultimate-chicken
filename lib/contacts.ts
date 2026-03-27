/**
 * Subscriber management via Resend Audiences + Contacts API
 * All waitlist data lives in your Resend dashboard → Audiences
 * View it at: resend.com/audiences
 */

import { Resend } from 'resend'

const AUDIENCE_NAME = 'Ultimate Chicken Waitlist'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
  return new Resend(process.env.RESEND_API_KEY)
}

// Cache audience ID in memory for the process lifetime
let _audienceId: string | null = null

export async function getAudienceId(): Promise<string> {
  if (_audienceId) return _audienceId

  const resend = getResend()

  // Try to find existing audience
  const { data: list, error: listError } = await resend.audiences.list()
  if (!listError && list?.data) {
    const existing = list.data.find((a) => a.name === AUDIENCE_NAME)
    if (existing) {
      _audienceId = existing.id
      return _audienceId
    }
  }

  // Create audience if it doesn't exist
  const { data: created, error: createError } = await resend.audiences.create({
    name: AUDIENCE_NAME,
  })

  if (createError || !created) {
    throw new Error(`Failed to create audience: ${createError?.message}`)
  }

  _audienceId = created.id
  return _audienceId
}

export async function addSubscriber(
  email: string,
  name?: string
): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  const resend = getResend()

  try {
    const audienceId = await getAudienceId()
    const firstName = name?.split(' ')[0] || undefined
    const lastName = name?.split(' ').slice(1).join(' ') || undefined

    const { error } = await resend.contacts.create({
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      audienceId,
      unsubscribed: false,
    })

    if (error) {
      // Resend returns an error if contact already exists
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('conflict')) {
        return { success: false, isDuplicate: true }
      }
      return { success: false, isDuplicate: false, error: error.message }
    }

    return { success: true, isDuplicate: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
      return { success: false, isDuplicate: true }
    }
    return { success: false, isDuplicate: false, error: msg }
  }
}

export interface Subscriber {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  createdAt: string
  unsubscribed: boolean
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const resend = getResend()
  const audienceId = await getAudienceId()

  const { data, error } = await resend.contacts.list({ audienceId })
  if (error || !data) return []

  // Resend nests the array inside data.data
  const contacts = (data as unknown as { data: Record<string, unknown>[] }).data ?? []

  return contacts
    .filter((c) => !c.unsubscribed)
    .map((c) => ({
      id: String(c.id ?? ''),
      email: String(c.email ?? ''),
      firstName: String(c.first_name ?? ''),
      lastName: String(c.last_name ?? ''),
      name: [c.first_name, c.last_name].filter(Boolean).join(' '),
      createdAt: String(c.created_at ?? ''),
      unsubscribed: Boolean(c.unsubscribed),
    }))
}

export async function getAllEmails(): Promise<string[]> {
  const subs = await getAllSubscribers()
  return subs.map((s) => s.email)
}

export async function getSubscriberCount(): Promise<number> {
  const subs = await getAllSubscribers()
  return subs.length
}
