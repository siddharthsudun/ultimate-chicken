import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmail, orderEmailHTML, ORDER_NOTIFY, orderBcc } from '@/lib/resend'
import { logOrder, recordOrderOnce, getSubscription } from '@/lib/orders-sheet'
import { manageUrl } from '@/lib/subscription-token'
import { parseMix, priceMix } from '@/lib/subscription-mix'

// Razorpay webhook — the reliable, server-to-server source of truth for paid orders.
// Configure in Razorpay Dashboard → Settings → Webhooks with event "payment.captured"
// and the same secret as RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 })

  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')

  const valid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  if (!valid) return NextResponse.json({ ok: false }, { status: 400 })

  let event: {
    event?: string
    payload?: {
      payment?: { entity?: Record<string, unknown> }
      subscription?: { entity?: Record<string, unknown> }
    }
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: true }) // ack so Razorpay stops retrying
  }

  if (event.event === 'payment.captured') {
    const p = event.payload?.payment?.entity || {}
    const notes = (p.notes as Record<string, string>) || {}
    const amount = typeof p.amount === 'number' ? p.amount / 100 : '—'
    const paymentId = (p.id as string) || ''
    const itemsHtml = `<tr><td style="padding:5px 0;">${notes.order || 'Order'}</td><td align="right" style="padding:5px 0;">${notes.subtotal || ''}</td></tr>`
    const totalsHtml = `
      ${notes.subtotal ? `<tr><td style="padding:3px 0;color:#555;">Subtotal</td><td align="right" style="padding:3px 0;">${notes.subtotal}</td></tr>` : ''}
      ${notes.coupon && notes.coupon !== 'none' ? `<tr><td style="padding:3px 0;color:#555;">Coupon</td><td align="right" style="padding:3px 0;color:#2e7d32;">${notes.coupon}</td></tr>` : ''}
      <tr><td style="padding:3px 0;color:#555;">Shipping</td><td align="right" style="padding:3px 0;">${notes.shipping || '—'}</td></tr>
      <tr><td style="padding:10px 0 0;font-weight:bold;font-size:19px;">Total paid</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:19px;">₹${amount}</td></tr>`
    const html = orderEmailHTML({
      ref: paymentId,
      method: 'Online (Razorpay) — Paid',
      itemsHtml,
      totalsHtml,
      customer: {
        name: notes.customer_name || '',
        phone: notes.phone || '',
        email: notes.email || '',
        address: notes.address || '',
      },
    })
    // Dedup against the checkout success handler (verify) — email/record once.
    const first = await recordOrderOnce(paymentId, {
      ref: paymentId, type: 'Order', payment: 'Razorpay (online)', status: 'Paid',
      items: notes.order || '', subtotal: notes.subtotal || '', coupon: notes.coupon || '',
      shipping: notes.shipping || '', total: amount,
      name: notes.customer_name || '', phone: notes.phone || '', email: notes.email || '', address: notes.address || '',
    })
    if (first) {
      const cust = notes.email || ORDER_NOTIFY[0]
      await sendEmail(cust, `Order paid · ₹${amount} · ${notes.customer_name || 'Customer'}`, html, orderBcc(cust))
    }
  }

  // Recurring weekly subscription charge → email the upcoming delivery.
  if (event.event === 'subscription.charged') {
    const sub = event.payload?.subscription?.entity || {}
    const pay = event.payload?.payment?.entity || {}
    const notes = (sub.notes as Record<string, string>) || {}
    const subId = (sub.id as string) || ''
    // Prefer our canonical record (reflects any box changes); fall back to Razorpay notes.
    const def = subId ? await getSubscription(subId) : null
    const composition = def?.items || notes.plan || 'Weekly box'
    const pcs = def?.items ? String(priceMix(parseMix(def.items)).pcs) : (notes.pcs_per_week || '—')
    const deliveryDay = def?.delivery_day || notes.delivery_day || '—'
    const deliverySlot = def?.delivery_slot || notes.delivery_slot || ''
    const custName = def?.name || notes.customer_name || ''
    const custEmail = def?.email || notes.email || ''
    const amount = typeof pay.amount === 'number' ? pay.amount / 100 : (def?.total ?? notes.weekly_amount ?? '—')
    const itemsHtml = `<tr><td style="padding:5px 0;">${composition}</td><td align="right" style="padding:5px 0;">₹${amount}</td></tr>`
    const totalsHtml = `
      <tr><td style="padding:3px 0;color:#555;">Pouches / week</td><td align="right" style="padding:3px 0;">${pcs}</td></tr>
      <tr><td style="padding:3px 0;color:#555;">Delivery day</td><td align="right" style="padding:3px 0;">${deliveryDay}${deliverySlot ? ', ' + deliverySlot : ''}</td></tr>
      <tr><td style="padding:10px 0 0;font-weight:bold;font-size:19px;">Charged</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:19px;">₹${amount}</td></tr>`
    const html = orderEmailHTML({
      ref: subId,
      method: 'Weekly subscription — auto-charged',
      itemsHtml,
      totalsHtml,
      customer: { name: custName, phone: notes.phone || '', email: custEmail, address: notes.address || '' },
      cta: subId ? { label: 'Manage, pause or change box', url: manageUrl(subId), note: 'Travelling next week? Pause anytime — no charge while paused.' } : undefined,
    })
    const cust = custEmail || ORDER_NOTIFY[0]
    await sendEmail(cust, `Weekly delivery · ₹${amount} · ${custName || 'Customer'}`, html, orderBcc(cust))
    await logOrder({
      ref: subId, type: 'Subscription', payment: 'Razorpay Autopay', status: 'Weekly charge',
      items: composition, pcs, total: amount,
      name: custName, phone: notes.phone || '', email: custEmail, address: notes.address || '',
      deliveryDay: deliveryDay === '—' ? '' : deliveryDay, deliverySlot,
    })
  }

  return NextResponse.json({ ok: true })
}
