// Shared coupon + shipping logic — used by the cart UI (display) AND the order API
// (authoritative amount). Never trust a client-sent discount; always recompute here.

export type Coupon = {
  code: string
  label: string
  type: 'percent' | 'flat'
  value: number
  minSubtotal?: number
  // ISO date — code stops working after this instant.
  expiresAt?: string
  // Globally single-use: works for exactly one completed order, ever.
  // Enforced server-side via the coupon_redemptions table (lib/coupon-usage.ts).
  singleUse?: boolean
}

// One-time code: single-use, expires exactly 1 month after the date it was added.
// To add a new one, just append `oneTime('CODENAME', 'YYYY-MM-DD')` below — it
// defaults to 5% off. Pass a 3rd arg to change the percentage, e.g. oneTime('X', '2026-07-01', 10).
function oneTime(code: string, addedYMD: string, percent = 5): Coupon {
  const exp = new Date(`${addedYMD}T23:59:59+05:30`)
  exp.setMonth(exp.getMonth() + 1)
  return {
    code: code.toUpperCase(),
    label: `${percent}% off — one-time code`,
    type: 'percent',
    value: percent,
    expiresAt: exp.toISOString(),
    singleUse: true,
  }
}

export const COUPONS: Coupon[] = [
  { code: 'FRESH10', label: '10% off your order', type: 'percent', value: 10 },
  { code: 'UC50', label: '₹50 off (orders over ₹400)', type: 'flat', value: 50, minSubtotal: 400 },
  { code: 'PROTEIN', label: '15% off — protein season', type: 'percent', value: 15, minSubtotal: 500 },

  // ── One-time codes (single-use, auto-expire 1 month after the date added) ──
  oneTime('ULTIMATEVINAY', '2026-06-26'),
  oneTime('ULTIMATEBHARATH', '2026-06-28'),
  oneTime('ULTIMATEYASH', '2026-06-29'),
  oneTime('ULTIMATEARNAV', '2026-06-29'),
  oneTime('ULTIMATEHARITHA', '2026-06-29'),
]

// Shipping: ₹49 flat, free once the item total crosses the threshold.
export const SHIPPING = 49
export const FREE_SHIPPING_THRESHOLD = 399

// Extra fee charged on Cash-on-Delivery orders.
export const COD_FEE = 49

// Weekly subscription: minimum pouches/week and the flat discount.
export const SUB_MIN_PCS = 6
export const SUB_MAX_PCS = 24
export const SUB_DISCOUNT_PCT = 10

/** Shipping charged for a given item subtotal: free at/above the threshold, else ₹49. */
export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING
}

export function findCoupon(code: string | null | undefined): Coupon | undefined {
  if (!code) return undefined
  return COUPONS.find((c) => c.code === code.trim().toUpperCase())
}

export function isExpired(c: Coupon): boolean {
  return !!c.expiresAt && Date.now() > Date.parse(c.expiresAt)
}

export function couponDiscount(code: string | null | undefined, subtotal: number): number {
  const c = findCoupon(code)
  if (!c) return 0
  if (isExpired(c)) return 0
  if (c.minSubtotal && subtotal < c.minSubtotal) return 0
  const d = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value
  return Math.min(d, subtotal)
}

// Synchronous validation (format, expiry, minimum). Single-use ("already used")
// is checked server-side against the database — see /api/coupon/validate.
export function couponError(code: string, subtotal: number): string {
  const c = findCoupon(code)
  if (!c) return 'That code doesn’t exist.'
  if (isExpired(c)) return 'This coupon has expired.'
  if (c.minSubtotal && subtotal < c.minSubtotal) return `Add ₹${c.minSubtotal - subtotal} more to use this code.`
  return ''
}
