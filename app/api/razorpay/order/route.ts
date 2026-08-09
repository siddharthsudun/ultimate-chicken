import { NextResponse } from 'next/server'
import { getFlavour } from '@/lib/flavours'
import { couponDiscount, shippingFor, findCoupon } from '@/lib/coupons'
import { couponRedeemed } from '@/lib/coupon-usage'
import { isServiceable, SERVICE_AREA } from '@/lib/delivery'
import { clientIp, clean } from '@/lib/security'
import { rateLimitAsync } from '@/lib/ratelimit'
import { verifyTurnstile } from '@/lib/turnstile'

type IncomingItem = { slug: string; qty: number }
type Customer = {
  name?: string; phone?: string; email?: string; address?: string
  locality?: string; landmark?: string; pincode?: string; city?: string; state?: string
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`rzporder:${ip}`, 10, 60))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Payments are not configured yet. Please try again later.' },
      { status: 503 }
    )
  }

  let body: { items?: IncomingItem[]; customer?: Customer; coupon?: string; hp?: string; turnstile?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot — reject bots that fill the hidden field.
  if (clean(body.hp, 60)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  // Turnstile (CAPTCHA) — no-op until keys are set.
  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return NextResponse.json({ error: 'Verification failed. Please refresh and try again.' }, { status: 400 })
  }

  const items = Array.isArray(body.items) ? body.items : []
  const src = body.customer || {}
  const c = {
    name: clean(src.name, 80), phone: clean(src.phone, 10).replace(/\D/g, ''),
    email: clean(src.email, 254), address: clean(src.address, 300),
    locality: clean(src.locality, 120), landmark: clean(src.landmark, 120),
    pincode: clean(src.pincode, 6).replace(/\D/g, ''), city: clean(src.city, 80), state: clean(src.state, 80),
  }
  const coupon = clean(body.coupon, 24).toUpperCase()
  // Compute the amount server-side from our own price list — never trust the client.
  let subtotal = 0
  const lineItems: { slug: string; name: string; qty: number; price: number }[] = []
  for (const it of items) {
    const f = getFlavour(it.slug)
    const qty = Math.max(0, Math.min(99, Math.floor(Number(it.qty) || 0)))
    if (!f || qty === 0) continue
    subtotal += f.price * qty
    lineItems.push({ slug: f.slug, name: f.name, qty, price: f.price })
  }

  if (subtotal <= 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  if (c.pincode && !isServiceable(c.pincode)) {
    return NextResponse.json({ error: `We currently deliver only in ${SERVICE_AREA}.` }, { status: 400 })
  }

  // Single-use coupons: block before creating the order if already redeemed.
  if (coupon && findCoupon(coupon)?.singleUse && (await couponRedeemed(coupon))) {
    return NextResponse.json({ error: 'This coupon has already been used.' }, { status: 400 })
  }

  // Apply coupon + shipping server-side (re-validated; client values ignored for the math).
  const discount = couponDiscount(coupon, subtotal)
  const shipping = shippingFor(subtotal)
  const amount = Math.max(1, subtotal - discount + shipping)

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const receipt = `uc_${Date.now()}`

  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt,
      notes: {
        order: lineItems.map((li) => `${li.qty}x ${li.name}`).join(', '),
        subtotal: `₹${subtotal}`,
        shipping: shipping === 0 ? 'Free' : `₹${shipping}`,
        coupon: discount > 0 ? `${coupon} (−₹${discount})` : 'none',
        customer_name: c.name || '',
        phone: c.phone || '',
        email: c.email || '',
        address: [c.address, c.locality, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', '),
      },
    }),
  })

  const order = await rzpRes.json()
  if (!rzpRes.ok) {
    return NextResponse.json(
      { error: order?.error?.description || 'Could not create order.' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  })
}
