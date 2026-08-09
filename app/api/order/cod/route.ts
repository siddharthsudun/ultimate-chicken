import { NextResponse } from 'next/server'
import { getFlavour } from '@/lib/flavours'
import { couponDiscount, shippingFor, findCoupon, COD_FEE } from '@/lib/coupons'
import { couponRedeemed, redeemCoupon } from '@/lib/coupon-usage'
import { sendOrderEmail } from '@/lib/resend'
import { isServiceable, SERVICE_AREA } from '@/lib/delivery'
import { logOrder } from '@/lib/orders-sheet'
import { clientIp, clean, isPhone, isEmail, isPincode } from '@/lib/security'
import { rateLimitAsync } from '@/lib/ratelimit'
import { verifyTurnstile } from '@/lib/turnstile'

type IncomingItem = { slug: string; qty: number }
type Customer = {
  name?: string; phone?: string; email?: string; address?: string
  locality?: string; landmark?: string; pincode?: string; city?: string; state?: string
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`cod:${ip}`, 6, 60))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  let body: { items?: IncomingItem[]; customer?: Customer; coupon?: string; hp?: string; turnstile?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: humans never fill this hidden field; bots do → drop silently.
  if (clean(body.hp, 60)) return NextResponse.json({ ok: true, ref: 'UC000000', total: 0 })
  // Turnstile (CAPTCHA) — verify the human token (no-op until keys are set).
  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return NextResponse.json({ error: 'Verification failed. Please refresh and try again.' }, { status: 400 })
  }

  // Sanitize all customer-supplied fields server-side.
  const src = body.customer || {}
  const c = {
    name: clean(src.name, 80),
    phone: clean(src.phone, 10).replace(/\D/g, ''),
    email: clean(src.email, 254),
    address: clean(src.address, 300),
    locality: clean(src.locality, 120),
    landmark: clean(src.landmark, 120),
    pincode: clean(src.pincode, 6).replace(/\D/g, ''),
    city: clean(src.city, 80),
    state: clean(src.state, 80),
  }
  const coupon = clean(body.coupon, 24).toUpperCase()

  if (!c.name || !c.address) return NextResponse.json({ error: 'Missing delivery details.' }, { status: 400 })
  if (!isPhone(c.phone!)) return NextResponse.json({ error: 'Enter a valid 10-digit mobile number.' }, { status: 400 })
  if (c.email && !isEmail(c.email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  if (!isPincode(c.pincode!)) return NextResponse.json({ error: 'Enter a valid 6-digit pincode.' }, { status: 400 })
  if (!isServiceable(c.pincode || '')) {
    return NextResponse.json({ error: `We currently deliver only in ${SERVICE_AREA}.` }, { status: 400 })
  }

  let subtotal = 0
  const lineItems: { name: string; qty: number; price: number }[] = []
  for (const it of body.items || []) {
    const f = getFlavour(it.slug)
    const qty = Math.max(0, Math.min(99, Math.floor(Number(it.qty) || 0)))
    if (!f || qty === 0) continue
    subtotal += f.price * qty
    lineItems.push({ name: f.name, qty, price: f.price })
  }
  if (subtotal <= 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })

  // Single-use coupons: block before placing if already redeemed.
  const couponDef = findCoupon(coupon)
  if (coupon && couponDef?.singleUse && (await couponRedeemed(coupon))) {
    return NextResponse.json({ error: 'This coupon has already been used.' }, { status: 400 })
  }

  const discount = couponDiscount(coupon, subtotal)
  const shipping = shippingFor(subtotal)
  const total = Math.max(1, subtotal - discount + shipping + COD_FEE)
  const ref = `UC${Date.now().toString().slice(-8)}`

  const address = [c.address, c.locality, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', ')

  await sendOrderEmail({
    ref,
    method: 'Cash on Delivery',
    items: lineItems,
    subtotal, discount, shipping, codFee: COD_FEE, total,
    coupon,
    customer: { name: c.name, phone: c.phone, email: c.email || '', address },
  })

  await logOrder({
    ref, type: 'Order', payment: 'Cash on Delivery', status: 'Placed',
    items: lineItems.map((li) => `${li.qty}x ${li.name}`).join(', '),
    pcs: lineItems.reduce((n, li) => n + li.qty, 0),
    subtotal, discount, coupon, shipping, codFee: COD_FEE, total,
    name: c.name, phone: c.phone, email: c.email || '', address,
    pincode: c.pincode || '', city: c.city || '', state: c.state || '',
  })

  // Mark single-use coupon as redeemed (records who used it).
  if (coupon && couponDef?.singleUse && discount > 0) {
    await redeemCoupon(coupon, { ref, name: c.name, phone: c.phone, email: c.email || '' })
  }

  return NextResponse.json({ ok: true, ref, total })
}
