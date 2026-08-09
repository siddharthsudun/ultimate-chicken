import { NextResponse } from 'next/server'
import { listSubscriptions } from '@/lib/orders-sheet'
import { sendSubscriptionReminder } from '@/lib/resend'
import { manageUrl } from '@/lib/subscription-token'
import { isEmail, safeEqual } from '@/lib/security'

// Daily cron (Vercel) → sends two reminders before each weekly delivery:
//   • 3 days before  → "coming this <day>" (nudge to pause if travelling)
//   • 1 day before   → "arrives tomorrow"
// Paused / cancelled subscriptions are skipped (checked against Razorpay).

const WEEKDAY: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
}

// Today's weekday index (0=Sun) in IST, regardless of the server's UTC clock.
function istWeekdayIndex(): number {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' })
    .format(new Date())
    .toLowerCase()
  return WEEKDAY[name] ?? new Date().getDay()
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // not configured → allow (Vercel cron only hits prod URL)
  const header = req.headers.get('authorization') || ''
  return safeEqual(header, `Bearer ${secret}`)
}

async function rzpStatus(subId: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subId}`, { headers })
    if (!res.ok) return null
    const sub = await res.json()
    return (sub.status as string) || null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  const rzpHeaders = keyId && keySecret
    ? { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' }
    : null

  const today = istWeekdayIndex()
  const subs = await listSubscriptions()

  const seen = new Set<string>()
  let sent = 0
  let skipped = 0

  for (const s of subs) {
    if (!s.ref || seen.has(s.ref)) continue
    seen.add(s.ref)

    const day = WEEKDAY[(s.delivery_day || '').trim().toLowerCase()]
    if (day === undefined) { skipped++; continue }
    const daysUntil = (day - today + 7) % 7
    const when: 'soon' | 'tomorrow' | null = daysUntil === 3 ? 'soon' : daysUntil === 1 ? 'tomorrow' : null
    if (!when) { skipped++; continue }

    if (!isEmail(s.email || '')) { skipped++; continue }

    // Only remind active subscriptions (skip paused / cancelled).
    if (rzpHeaders) {
      const status = await rzpStatus(s.ref, rzpHeaders)
      if (status && status !== 'active') { skipped++; continue }
    }

    await sendSubscriptionReminder({
      to: s.email,
      name: s.name || '',
      deliveryDay: s.delivery_day,
      deliverySlot: s.delivery_slot || '',
      items: s.items || '',
      weekly: s.total,
      manageUrl: manageUrl(s.ref),
      when,
    })
    sent++
  }

  return NextResponse.json({ ok: true, today, considered: seen.size, sent, skipped })
}
