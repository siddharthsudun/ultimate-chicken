// Shared helpers for a weekly subscription "box" (the flavour mix). Used by the
// subscribe flow, the self-serve manage flow, and the reminder/charge emails so
// composition + pricing are computed identically everywhere.

import { FLAVOURS, getFlavour } from '@/lib/flavours'
import { SUB_MIN_PCS, SUB_DISCOUNT_PCT } from '@/lib/coupons'

export type Mix = Record<string, number>

/** Normalise an incoming mix: clamp quantities, drop unknown slugs. */
export function cleanMix(input: unknown): Mix {
  const out: Mix = {}
  if (!input || typeof input !== 'object') return out
  for (const [slug, qty] of Object.entries(input as Record<string, unknown>)) {
    if (!getFlavour(slug)) continue
    const n = Math.max(0, Math.min(99, Math.floor(Number(qty) || 0)))
    if (n > 0) out[slug] = n
  }
  return out
}

/** pcs, subtotal (₹) and the 10%-off weekly amount (₹) for a mix. */
export function priceMix(mix: Mix): { pcs: number; subtotal: number; weekly: number } {
  let pcs = 0
  let subtotal = 0
  for (const slug of Object.keys(mix)) {
    const f = getFlavour(slug)
    if (!f) continue
    pcs += mix[slug]
    subtotal += f.price * mix[slug]
  }
  const weekly = Math.round(subtotal * (1 - SUB_DISCOUNT_PCT / 100))
  return { pcs, subtotal, weekly }
}

/** "3x Korean Gochugaru, 2x Peri-Peri" — the human-readable plan line. */
export function mixToLine(mix: Mix): string {
  return FLAVOURS
    .filter((f) => (mix[f.slug] || 0) > 0)
    .map((f) => `${mix[f.slug]}x ${f.name}`)
    .join(', ')
}

/** Parse a plan line back into a mix (best-effort, by flavour name). */
export function parseMix(line: string | null | undefined): Mix {
  const out: Mix = {}
  if (!line) return out
  for (const seg of line.split(',')) {
    const m = seg.trim().match(/^(\d+)\s*x\s+(.+)$/i)
    if (!m) continue
    const qty = parseInt(m[1], 10)
    const name = m[2].trim().toLowerCase()
    const f = FLAVOURS.find((fl) => fl.name.toLowerCase() === name)
    if (f && qty > 0) out[f.slug] = qty
  }
  return out
}

export { SUB_MIN_PCS }
