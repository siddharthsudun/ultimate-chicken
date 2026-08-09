import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmail, orderEmailHTML, ORDER_NOTIFY, orderBcc } from '@/lib/resend'
import { logOrder } from '@/lib/orders-sheet'
import { manageUrl } from '@/lib/subscription-token'

export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return NextResponse.json({ valid: false }, { status: 503 })

  let body: {
    razorpay_payment_id?: string
    razorpay_subscription_id?: string
    razorpay_signature?: string
    plan?: string
    weekly?: number
    deliveryDay?: string
    deliverySlot?: string
    customer?: { name?: string; phone?: string; email?: string; address?: string }
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  // Subscription signature = HMAC(payment_id + '|' + subscription_id).
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')
  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))

  if (valid) {
    try {
      const c = body.customer || {}
      const itemsHtml = `<tr><td style="padding:5px 0;">${body.plan || 'Weekly box'}</td><td align="right" style="padding:5px 0;">₹${body.weekly || ''}</td></tr>`
      const totalsHtml = `
        <tr><td style="padding:3px 0;color:#555;">Cadence</td><td align="right" style="padding:3px 0;">Every week</td></tr>
        <tr><td style="padding:3px 0;color:#555;">Delivery day</td><td align="right" style="padding:3px 0;">${body.deliveryDay || '—'}${body.deliverySlot ? ', ' + body.deliverySlot : ''}</td></tr>
        <tr><td style="padding:10px 0 0;font-weight:bold;font-size:19px;">Per week (10% off)</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:19px;">₹${body.weekly || ''}</td></tr>`
      const html = orderEmailHTML({
        ref: razorpay_subscription_id,
        method: 'Weekly subscription (Razorpay Autopay)',
        itemsHtml,
        totalsHtml,
        customer: { name: c.name || '', phone: c.phone || '', email: c.email || '', address: c.address || '' },
        cta: { label: 'Manage, pause or change box', url: manageUrl(razorpay_subscription_id), note: 'Travelling? Pause anytime. Change your weekly box whenever you like.' },
      })
      const cust = c.email || ORDER_NOTIFY[0]
      await sendEmail(
        cust,
        `New weekly subscription · ₹${body.weekly}/wk · ${c.name || 'Customer'}`,
        html,
        orderBcc(cust)
      )
      await logOrder({
        ref: razorpay_subscription_id, type: 'Subscription', payment: 'Razorpay Autopay', status: 'Active (new)',
        items: body.plan || '', total: body.weekly ?? '',
        name: c.name || '', phone: c.phone || '', email: c.email || '', address: c.address || '',
        deliveryDay: body.deliveryDay || '', deliverySlot: body.deliverySlot || '',
      })
    } catch (e) {
      console.error('subscription email:', e)
    }
  }

  return NextResponse.json({ valid })
}
