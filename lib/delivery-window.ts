// Delivery scheduling + the "change cutoff" rule: a subscriber can change their
// box or delivery day/slot only up to 1 day (24h) before the upcoming delivery
// slot begins. Inside that window the order is being prepped, so it's locked.
//
// All times are computed in IST (UTC+5:30, no DST) regardless of server timezone.

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const SLOTS = ['6–9 AM', '12–3 PM', '6–9 PM']

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
const CUTOFF_MS = 24 * 60 * 60 * 1000 // 1 day before

// 0 = Sunday … 6 = Saturday
const WEEKDAY: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
}

function slotStartHour(slot: string): number {
  if (slot === '12–3 PM') return 12
  if (slot === '6–9 PM') return 18
  return 6 // '6–9 AM' (and default)
}

export function isValidDay(day: string): boolean {
  return WEEKDAY[(day || '').trim().toLowerCase()] !== undefined
}
export function isValidSlot(slot: string): boolean {
  return SLOTS.includes((slot || '').trim())
}

/** Epoch ms of the next delivery (slot start) for a weekly day/slot, from `now`. */
export function nextDeliveryMs(day: string, slot: string, now = Date.now()): number | null {
  const target = WEEKDAY[(day || '').trim().toLowerCase()]
  if (target === undefined) return null
  const hour = slotStartHour((slot || '').trim())

  // "Now" as an IST wall clock: read UTC getters off a shifted Date.
  const nowIst = new Date(now + IST_OFFSET_MS)
  const curIdx = nowIst.getUTCDay()
  let daysAhead = (target - curIdx + 7) % 7

  const build = (addDays: number) =>
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate() + addDays, hour, 0, 0) - IST_OFFSET_MS

  let when = build(daysAhead)
  // If today is the delivery day but the slot has already started, roll to next week.
  if (when <= now) { daysAhead += 7; when = build(daysAhead) }
  return when
}

/** Whether changes are allowed right now (more than 1 day before the next slot). */
export function changeWindow(day: string, slot: string, now = Date.now()): {
  allowed: boolean
  nextDeliveryMs: number | null
  cutoffMs: number | null
} {
  const nd = nextDeliveryMs(day, slot, now)
  if (nd === null) return { allowed: true, nextDeliveryMs: null, cutoffMs: null } // unknown schedule → don't lock out
  const cutoff = nd - CUTOFF_MS
  return { allowed: now < cutoff, nextDeliveryMs: nd, cutoffMs: cutoff }
}
