import { NextResponse } from 'next/server'
import { findCoupon, couponError, couponDiscount } from '@/lib/coupons'
import { couponRedeemed } from '@/lib/coupon-usage'
import { clientIp, clean } from '@/lib/security'
import { rateLimitAsync } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`coupon:${ip}`, 20, 60))) {
    return NextResponse.json({ valid: false, error: 'Too many attempts. Please wait a minute.' }, { status: 429 })
  }

  let body: { code?: string; subtotal?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid request.' }, { status: 400 })
  }

  const code = clean(body.code, 24).toUpperCase()
  const subtotal = Math.max(0, Math.floor(Number(body.subtotal) || 0))

  // Format / expiry / minimum (synchronous).
  const err = couponError(code, subtotal)
  if (err) return NextResponse.json({ valid: false, error: err })

  const c = findCoupon(code)! // couponError guarantees it exists here

  // Single-use: has anyone already redeemed it?
  if (c.singleUse && (await couponRedeemed(code))) {
    return NextResponse.json({ valid: false, error: 'This coupon has already been used.' })
  }

  return NextResponse.json({
    valid: true,
    code: c.code,
    label: c.label,
    discount: couponDiscount(code, subtotal),
  })
}
