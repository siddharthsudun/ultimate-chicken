import { NextResponse } from 'next/server'
import { verifySub, manageUrl } from '@/lib/subscription-token'
import { clientIp, clean } from '@/lib/security'
import { rateLimitAsync } from '@/lib/ratelimit'
import { getSubscription, updateSubscriptionComposition, updateSubscriptionDelivery } from '@/lib/orders-sheet'
import { cleanMix, priceMix, mixToLine, parseMix, SUB_MIN_PCS, type Mix } from '@/lib/subscription-mix'
import { changeWindow, isValidDay, isValidSlot } from '@/lib/delivery-window'
import { sendEmail, orderEmailHTML, ORDER_NOTIFY, orderBcc } from '@/lib/resend'

const LOCKED_MSG = 'Changes are locked — your next delivery is within 1 day. You can make changes again after it arrives.'

// Self-serve subscription management via a signed email link.
// GET  ?sid=&t=                  → status + current box (composition + price)
// POST { sid, t, action }         action = 'pause' | 'resume'
// POST { sid, t, action:'update', mix } → change the weekly box

function rzpAuth(): { headers: Record<string, string> } | null {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  return { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
}

// Merge Razorpay status with our canonical (editable) composition from Supabase.
async function summarize(sub: Record<string, unknown>) {
  const notes = (sub.notes as Record<string, string>) || {}
  const sid = sub.id as string
  const def = sid ? await getSubscription(sid) : null
  const itemsLine = def?.items || notes.plan || ''
  const mix = parseMix(itemsLine)
  const { pcs, weekly } = priceMix(mix)
  const deliveryDay = def?.delivery_day || notes.delivery_day || ''
  const deliverySlot = def?.delivery_slot || notes.delivery_slot || ''
  const win = changeWindow(deliveryDay, deliverySlot)
  return {
    id: sub.id,
    status: sub.status, // active | paused | cancelled | completed | ...
    plan: itemsLine,
    mix,
    pcsPerWeek: pcs || notes.pcs_per_week || '',
    weekly: def?.total ?? (weekly || (notes.weekly_amount || '').replace(/[^\d]/g, '')),
    deliveryDay,
    deliverySlot,
    customerName: def?.name || notes.customer_name || '',
    // Changes allowed only up to 1 day before the next delivery slot.
    canEdit: win.allowed,
    nextDeliveryMs: win.nextDeliveryMs,
  }
}

async function loadSub(sid: string, headers: Record<string, string>) {
  const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${sid}`, { headers })
  const sub = await res.json()
  return { ok: res.ok, sub }
}

export async function GET(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`submanage:${ip}`, 30, 60))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }
  const url = new URL(req.url)
  const sid = clean(url.searchParams.get('sid'), 64)
  const t = clean(url.searchParams.get('t'), 128)
  if (!verifySub(sid, t)) {
    return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 403 })
  }
  const a = rzpAuth()
  if (!a) return NextResponse.json({ error: 'Not configured.' }, { status: 503 })

  const { ok, sub } = await loadSub(sid, a.headers)
  if (!ok) return NextResponse.json({ error: sub?.error?.description || 'Could not load subscription.' }, { status: 502 })
  return NextResponse.json(await summarize(sub))
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!(await rateLimitAsync(`submanage:${ip}`, 15, 60))) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }
  let body: { sid?: string; t?: string; action?: string; mix?: Mix; deliveryDay?: string; deliverySlot?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const sid = clean(body.sid, 64)
  const t = clean(body.t, 128)
  const action = clean(body.action, 12)
  if (!verifySub(sid, t)) {
    return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 403 })
  }
  const a = rzpAuth()
  if (!a) return NextResponse.json({ error: 'Not configured.' }, { status: 503 })

  if (action === 'pause' || action === 'resume') {
    const at = action === 'pause' ? { pause_at: 'now' } : { resume_at: 'now' }
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${sid}/${action}`, {
      method: 'POST', headers: a.headers, body: JSON.stringify(at),
    })
    const sub = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: sub?.error?.description || `Could not ${action} the subscription.` }, { status: 502 })
    }
    return NextResponse.json(await summarize(sub))
  }

  // Reschedule delivery day / slot (our metadata only — no Razorpay change).
  if (action === 'reschedule') {
    const day = clean(body.deliveryDay, 16)
    const slot = clean(body.deliverySlot, 16)
    if (!isValidDay(day) || !isValidSlot(slot)) {
      return NextResponse.json({ error: 'Pick a valid delivery day and time slot.' }, { status: 400 })
    }
    const { ok: loadOk, sub: current } = await loadSub(sid, a.headers)
    if (!loadOk) return NextResponse.json({ error: current?.error?.description || 'Could not load subscription.' }, { status: 502 })

    // Cutoff is based on the CURRENT upcoming delivery.
    const def = await getSubscription(sid)
    const notes = (current.notes as Record<string, string>) || {}
    const curDay = def?.delivery_day || notes.delivery_day || ''
    const curSlot = def?.delivery_slot || notes.delivery_slot || ''
    if (!changeWindow(curDay, curSlot).allowed) {
      return NextResponse.json({ error: LOCKED_MSG }, { status: 400 })
    }

    await updateSubscriptionDelivery(sid, day, slot)

    try {
      const name = def?.name || notes.customer_name || ''
      const to = def?.email || notes.email || ORDER_NOTIFY[0]
      const itemsHtml = `<tr><td style="padding:5px 0;">${def?.items || notes.plan || 'Weekly box'}</td><td align="right" style="padding:5px 0;">₹${def?.total ?? ''}</td></tr>`
      const totalsHtml = `
        <tr><td style="padding:3px 0;color:#555;">New delivery day</td><td align="right" style="padding:3px 0;font-weight:bold;">${day}, ${slot}</td></tr>`
      const html = orderEmailHTML({
        ref: sid, method: 'Weekly subscription — delivery updated',
        itemsHtml, totalsHtml,
        customer: { name, phone: '', email: to === ORDER_NOTIFY[0] ? '' : to, address: notes.address || '' },
        cta: { label: 'Manage subscription', url: manageUrl(sid), note: 'Applies from your next delivery.' },
      })
      await sendEmail(to, `Delivery updated · ${day}, ${slot}`, html, orderBcc(to))
    } catch (e) {
      console.error('reschedule confirmation email:', e)
    }

    return NextResponse.json(await summarize(current))
  }

  if (action === 'update') {
    const mix = cleanMix(body.mix)
    const { pcs, weekly } = priceMix(mix)
    if (pcs < SUB_MIN_PCS) {
      return NextResponse.json({ error: `Minimum ${SUB_MIN_PCS} pouches per week.` }, { status: 400 })
    }

    // Must be active to change the plan.
    const { ok: loadOk, sub: current } = await loadSub(sid, a.headers)
    if (!loadOk) return NextResponse.json({ error: current?.error?.description || 'Could not load subscription.' }, { status: 502 })
    if (current.status !== 'active') {
      return NextResponse.json({ error: 'Resume your subscription first, then change your box.' }, { status: 400 })
    }

    // Cutoff: no changes within 1 day of the upcoming delivery.
    const curDef = await getSubscription(sid)
    const curNotes = (current.notes as Record<string, string>) || {}
    if (!changeWindow(curDef?.delivery_day || curNotes.delivery_day || '', curDef?.delivery_slot || curNotes.delivery_slot || '').allowed) {
      return NextResponse.json({ error: LOCKED_MSG }, { status: 400 })
    }

    const line = mixToLine(mix)

    // 1) New weekly plan at the new price.
    const planRes = await fetch('https://api.razorpay.com/v1/plans', {
      method: 'POST', headers: a.headers,
      body: JSON.stringify({
        period: 'weekly', interval: 1,
        item: { name: `Ultimate Chicken — ${pcs} pouches/week`, amount: weekly * 100, currency: 'INR' },
      }),
    })
    const plan = await planRes.json()
    if (!planRes.ok) {
      return NextResponse.json({ error: plan?.error?.description || 'Could not update your box.' }, { status: 502 })
    }

    // 2) Switch the subscription to the new plan from the next billing cycle.
    const updRes = await fetch(`https://api.razorpay.com/v1/subscriptions/${sid}`, {
      method: 'PATCH', headers: a.headers,
      body: JSON.stringify({ plan_id: plan.id, schedule_change_at: 'cycle_end', customer_notify: 1 }),
    })
    const updated = await updRes.json()
    if (!updRes.ok) {
      return NextResponse.json({ error: updated?.error?.description || 'Could not update your box.' }, { status: 502 })
    }

    // 3) Update our canonical record so deliveries, reminders + emails reflect the new box.
    await updateSubscriptionComposition(sid, line, weekly, pcs)

    // 4) Confirmation email (customer + founders).
    try {
      const def = await getSubscription(sid)
      const notes = (current.notes as Record<string, string>) || {}
      const name = def?.name || notes.customer_name || ''
      const to = def?.email || notes.email || ORDER_NOTIFY[0]
      const itemsHtml = `<tr><td style="padding:5px 0;">${line}</td><td align="right" style="padding:5px 0;">₹${weekly}</td></tr>`
      const totalsHtml = `
        <tr><td style="padding:3px 0;color:#555;">Pouches / week</td><td align="right" style="padding:3px 0;">${pcs}</td></tr>
        <tr><td style="padding:3px 0;color:#555;">Delivery day</td><td align="right" style="padding:3px 0;">${def?.delivery_day || notes.delivery_day || '—'}${def?.delivery_slot || notes.delivery_slot ? ', ' + (def?.delivery_slot || notes.delivery_slot) : ''}</td></tr>
        <tr><td style="padding:10px 0 0;font-weight:bold;font-size:19px;">New weekly (10% off)</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:19px;">₹${weekly}</td></tr>`
      const html = orderEmailHTML({
        ref: sid, method: 'Weekly subscription — box updated',
        itemsHtml, totalsHtml,
        customer: { name, phone: def?.email ? '' : (notes.phone || ''), email: to === ORDER_NOTIFY[0] ? '' : to, address: notes.address || '' },
        cta: { label: 'Manage subscription', url: manageUrl(sid), note: 'New box applies to your next delivery. Updated price starts your next billing cycle.' },
      })
      await sendEmail(to, `Your weekly box was updated · ₹${weekly}/wk`, html, orderBcc(to))
    } catch (e) {
      console.error('update confirmation email:', e)
    }

    return NextResponse.json(await summarize(updated))
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
