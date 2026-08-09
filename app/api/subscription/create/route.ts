import { NextResponse } from 'next/server'
import { getFlavour } from '@/lib/flavours'
import { SUB_MIN_PCS, SUB_DISCOUNT_PCT } from '@/lib/coupons'
import { isServiceable, SERVICE_AREA } from '@/lib/delivery'
import { clientIp, clean, isPhone } from '@/lib/security'
import { rateLimitAsync } from '@/lib/ratelimit'
import { verifyTurnstile } from '@/lib/turnstile'

type Mix = Record<string, number>
type Customer = {
  name?: string; phone?: string; email?: string; address?: string
  locality?: string; landmark?: string; pincode?: string; city?: string; state?: string
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`sub:${ip}`, 6, 60))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })
  }

  let body: { mix?: Mix; customer?: Customer; deliveryDay?: string; deliverySlot?: string; hp?: string; turnstile?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot — reject bots.
  if (clean(body.hp, 60)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  // Turnstile (CAPTCHA) — no-op until keys are set.
  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return NextResponse.json({ error: 'Verification failed. Please refresh and try again.' }, { status: 400 })
  }

  const src = body.customer || {}
  const c = {
    name: clean(src.name, 80), phone: clean(src.phone, 10).replace(/\D/g, ''),
    email: clean(src.email, 254), address: clean(src.address, 300),
    locality: clean(src.locality, 120), landmark: clean(src.landmark, 120),
    pincode: clean(src.pincode, 6).replace(/\D/g, ''), city: clean(src.city, 80), state: clean(src.state, 80),
  }
  const deliveryDay = clean(body.deliveryDay, 16)
  const deliverySlot = clean(body.deliverySlot, 16)
  if (!c.name || !c.address || !isPhone(c.phone!)) {
    return NextResponse.json({ error: 'Missing or invalid delivery details.' }, { status: 400 })
  }
  if (!isServiceable(c.pincode || '')) {
    return NextResponse.json({ error: `We currently deliver only in ${SERVICE_AREA}.` }, { status: 400 })
  }

  // Compute weekly subtotal from our own prices.
  const mix = body.mix || {}
  let pcs = 0
  let subtotal = 0
  const lines: string[] = []
  for (const slug of Object.keys(mix)) {
    const f = getFlavour(slug)
    const qty = Math.max(0, Math.min(99, Math.floor(Number(mix[slug]) || 0)))
    if (!f || qty === 0) continue
    pcs += qty
    subtotal += f.price * qty
    lines.push(`${qty}x ${f.name}`)
  }
  if (pcs < SUB_MIN_PCS) {
    return NextResponse.json({ error: `Minimum ${SUB_MIN_PCS} pouches per week.` }, { status: 400 })
  }

  const weekly = Math.round(subtotal * (1 - SUB_DISCOUNT_PCT / 100)) // ₹, 10% off, free shipping
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }

  // 1) Plan (weekly).
  const planRes = await fetch('https://api.razorpay.com/v1/plans', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      period: 'weekly',
      interval: 1,
      item: { name: `Ultimate Chicken — ${pcs} pouches/week`, amount: weekly * 100, currency: 'INR' },
    }),
  })
  const plan = await planRes.json()
  if (!planRes.ok) {
    return NextResponse.json(
      { error: plan?.error?.description || 'Could not create subscription plan. (Enable Subscriptions in Razorpay.)' },
      { status: 502 }
    )
  }

  // 2) Subscription (52 weeks, customer authorizes via mandate).
  const address = [c.address, c.locality, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', ')
  const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      plan_id: plan.id,
      total_count: 52,
      quantity: 1,
      customer_notify: 1,
      notes: {
        plan: lines.join(', '),
        pcs_per_week: String(pcs),
        weekly_amount: `₹${weekly}`,
        delivery_day: deliveryDay,
        delivery_slot: deliverySlot,
        customer_name: c.name,
        phone: c.phone,
        email: c.email || '',
        address,
      },
    }),
  })
  const sub = await subRes.json()
  if (!subRes.ok) {
    return NextResponse.json(
      { error: sub?.error?.description || 'Could not create subscription.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ subscriptionId: sub.id, keyId, weekly, pcs })
}
