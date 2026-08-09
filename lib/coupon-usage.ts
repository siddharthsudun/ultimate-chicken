// Single-use coupon enforcement + "who used it" tracking, backed by Supabase.
// The coupon_redemptions table has a UNIQUE constraint on `code`, so a single-use
// code can be redeemed exactly once — the second insert fails atomically (23505).
// RLS is ON with no anon policies; only this server-side (service-role) code touches it.

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!client) client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export type Redeemer = { ref?: string; name?: string; phone?: string; email?: string }

/** True if this code has already been redeemed (single-use codes only). */
export async function couponRedeemed(code: string): Promise<boolean> {
  const supa = db()
  if (!supa) return false // no DB configured → don't block checkout
  try {
    const { data, error } = await supa
      .from('coupon_redemptions')
      .select('code')
      .eq('code', code.toUpperCase())
      .limit(1)
    if (error) { console.error('couponRedeemed error:', error.message); return false }
    return (data?.length ?? 0) > 0
  } catch (e) {
    console.error('couponRedeemed failed:', e)
    return false
  }
}

/** Marks a single-use code as redeemed. Returns true if THIS call claimed it
 *  (false = already taken, via the unique constraint). Never throws. */
export async function redeemCoupon(code: string, who: Redeemer): Promise<boolean> {
  const supa = db()
  if (!supa) return true
  try {
    const { error } = await supa.from('coupon_redemptions').insert({
      code: code.toUpperCase(),
      order_ref: who.ref || null,
      name: who.name || null,
      phone: who.phone || null,
      email: who.email || null,
    })
    if (error) {
      if (error.code === '23505') return false // already redeemed
      console.error('redeemCoupon error:', error.message)
      return true
    }
    return true
  } catch (e) {
    console.error('redeemCoupon failed:', e)
    return true
  }
}
