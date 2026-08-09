// Persists every order to Supabase (Postgres). RLS is ON with no anon policies, so
// only this server-side code (service-role key) can read/write. Never throws, so
// checkout/payment is never broken by logging.

import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type OrderLog = {
  ref: string
  type: 'Order' | 'Subscription'
  payment: string
  status: string
  items: string
  pcs?: number | string
  subtotal?: number | string
  discount?: number | string
  coupon?: string
  shipping?: number | string
  codFee?: number | string
  total?: number | string
  name: string
  phone: string
  email: string
  address: string
  pincode?: string
  city?: string
  state?: string
  deliveryDay?: string
  deliverySlot?: string
}

let client: SupabaseClient | null = null
function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!client) client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

const toInt = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? n : null
}

function row(o: OrderLog, dedupKey: string | null) {
  return {
    ref: o.ref,
    type: o.type,
    payment: o.payment,
    status: o.status,
    items: o.items,
    pcs: toInt(o.pcs),
    subtotal: toInt(o.subtotal),
    discount: toInt(o.discount),
    coupon: o.coupon || null,
    shipping: toInt(o.shipping),
    cod_fee: toInt(o.codFee),
    total: toInt(o.total),
    name: o.name,
    phone: o.phone,
    email: o.email,
    address: o.address,
    pincode: o.pincode || null,
    city: o.city || null,
    state: o.state || null,
    delivery_day: o.deliveryDay || null,
    delivery_slot: o.deliverySlot || null,
    dedup_key: dedupKey,
  }
}

export type SubscriptionRow = {
  ref: string
  name: string
  email: string
  items: string
  total: number | null
  delivery_day: string
  delivery_slot: string
}

// The "definition" row (one per subscription, created at sign-up) is our canonical
// record of the current box. Recurring 'Weekly charge' rows are just charge logs.
const SUB_DEFINITION_STATUS = 'Active (new)'

/** Canonical subscription definition rows — one per subscription (its current box).
 *  Reminder cron filters these by Razorpay status so paused/cancelled are skipped. */
export async function listSubscriptions(): Promise<SubscriptionRow[]> {
  const supa = db()
  if (!supa) return []
  try {
    const { data, error } = await supa
      .from('orders')
      .select('ref,name,email,items,total,delivery_day,delivery_slot')
      .eq('type', 'Subscription')
      .eq('status', SUB_DEFINITION_STATUS)
      .order('created_at', { ascending: false })
    if (error) { console.error('listSubscriptions error:', error.message); return [] }
    return (data || []) as SubscriptionRow[]
  } catch (e) {
    console.error('listSubscriptions failed:', e)
    return []
  }
}

/** The canonical definition row for one subscription (current box composition). */
export async function getSubscription(ref: string): Promise<SubscriptionRow | null> {
  const supa = db()
  if (!supa || !ref) return null
  try {
    const { data, error } = await supa
      .from('orders')
      .select('ref,name,email,items,total,delivery_day,delivery_slot')
      .eq('ref', ref)
      .eq('type', 'Subscription')
      .eq('status', SUB_DEFINITION_STATUS)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) { console.error('getSubscription error:', error.message); return null }
    return (data?.[0] as SubscriptionRow) || null
  } catch (e) {
    console.error('getSubscription failed:', e)
    return null
  }
}

/** Update a subscription's delivery day + slot. Never throws. */
export async function updateSubscriptionDelivery(ref: string, day: string, slot: string): Promise<boolean> {
  const supa = db()
  if (!supa || !ref) return false
  try {
    const { error } = await supa
      .from('orders')
      .update({ delivery_day: day, delivery_slot: slot })
      .eq('ref', ref)
      .eq('type', 'Subscription')
      .eq('status', SUB_DEFINITION_STATUS)
    if (error) { console.error('updateSubscriptionDelivery error:', error.message); return false }
    return true
  } catch (e) {
    console.error('updateSubscriptionDelivery failed:', e)
    return false
  }
}

/** Update a subscription's current box (composition + weekly price). Never throws. */
export async function updateSubscriptionComposition(ref: string, items: string, total: number, pcs: number): Promise<boolean> {
  const supa = db()
  if (!supa || !ref) return false
  try {
    const { error } = await supa
      .from('orders')
      .update({ items, total, pcs })
      .eq('ref', ref)
      .eq('type', 'Subscription')
      .eq('status', SUB_DEFINITION_STATUS)
    if (error) { console.error('updateSubscriptionComposition error:', error.message); return false }
    return true
  } catch (e) {
    console.error('updateSubscriptionComposition failed:', e)
    return false
  }
}

export async function logOrder(o: OrderLog): Promise<void> {
  const supa = db()
  if (!supa) return
  try {
    await supa.from('orders').insert(row(o, null))
  } catch (e) {
    console.error('logOrder failed:', e)
  }
}

/** Inserts under a unique dedup key (e.g. the Razorpay payment id) and returns true
 *  only the FIRST time. Lets the payment-success handler AND the webhook both run,
 *  but email/record happen exactly once. */
export async function recordOrderOnce(dedupKey: string, o: OrderLog): Promise<boolean> {
  const supa = db()
  if (!supa) return true // no DB configured → don't block the email
  try {
    const { error } = await supa.from('orders').insert(row(o, String(dedupKey)))
    if (error) {
      // 23505 = unique_violation → the other path already recorded it.
      if (error.code === '23505') return false
      console.error('recordOrderOnce error:', error.message)
      return true
    }
    return true
  } catch (e) {
    console.error('recordOrderOnce failed:', e)
    return true
  }
}
