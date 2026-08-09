import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getFlavour } from '@/lib/flavours'
import { couponDiscount, shippingFor, findCoupon } from '@/lib/coupons'
import { sendOrderEmail } from '@/lib/resend'
import { recordOrderOnce } from '@/lib/orders-sheet'
import { redeemCoupon } from '@/lib/coupon-usage'
import { rateLimit, clientIp, clean } from '@/lib/security'

type IncomingItem = { slug: string; qty: number }
type Customer = {
  name?: string; phone?: string; email?: string; address?: string
  locality?: string; landmark?: string; pincode?: string; city?: string; state?: string
}

// Verifies the payment signature, then (exactly once, deduped against the webhook)
// emails the customer + founders and records the order.
export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ valid: false }, { status: 429 })
  }
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return NextResponse.json({ valid: false, error: 'Not configured.' }, { status: 503 })

  let body: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    items?: IncomingItem[]
    customer?: Customer
    coupon?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))

  if (valid) {
    try {
      const src = body.customer || {}
      const c = {
        name: clean(src.name, 80), phone: clean(src.phone, 10).replace(/\D/g, ''),
        email: clean(src.email, 254), address: clean(src.address, 300),
        locality: clean(src.locality, 120), landmark: clean(src.landmark, 120),
        pincode: clean(src.pincode, 6).replace(/\D/g, ''), city: clean(src.city, 80), state: clean(src.state, 80),
      }
      const coupon = clean(body.coupon, 24).toUpperCase()

      let subtotal = 0
      const items: { name: string; qty: number; price: number }[] = []
      for (const it of body.items || []) {
        const f = getFlavour(it.slug)
        const qty = Math.max(0, Math.min(99, Math.floor(Number(it.qty) || 0)))
        if (!f || qty === 0) continue
        subtotal += f.price * qty
        items.push({ name: f.name, qty, price: f.price })
      }
      if (subtotal > 0) {
        const discount = couponDiscount(coupon, subtotal)
        const shipping = shippingFor(subtotal)
        const total = Math.max(1, subtotal - discount + shipping)
        const address = [c.address, c.locality, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', ')

        // Dedup against the webhook so the email + DB record happen exactly once.
        const first = await recordOrderOnce(razorpay_payment_id, {
          ref: razorpay_payment_id, type: 'Order', payment: 'Razorpay (online)', status: 'Paid',
          items: items.map((i) => `${i.qty}x ${i.name}`).join(', '),
          pcs: items.reduce((n, i) => n + i.qty, 0),
          subtotal, discount, coupon, shipping, total,
          name: c.name, phone: c.phone, email: c.email, address,
          pincode: c.pincode, city: c.city, state: c.state,
        })
        if (first) {
          await sendOrderEmail({
            ref: razorpay_payment_id, method: 'Online (Razorpay) — Paid',
            items, subtotal, discount, shipping, total, coupon,
            customer: { name: c.name, phone: c.phone, email: c.email, address },
          })
          // Mark single-use coupon as redeemed (records who used it).
          if (coupon && findCoupon(coupon)?.singleUse && discount > 0) {
            await redeemCoupon(coupon, { ref: razorpay_payment_id, name: c.name, phone: c.phone, email: c.email })
          }
        }
      }
    } catch (e) {
      console.error('verify post-process:', e)
    }
  }

  return NextResponse.json({ valid })
}
