// Shared server-side security helpers: HTML escaping, input sanitization, and a
// lightweight in-memory rate limiter.

/** Escape user-supplied text before inserting into HTML (emails, etc.). */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Trim, strip control characters, collapse whitespace, and cap length. */
export function clean(input: unknown, maxLen = 200): string {
  return String(input ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

export const isPhone = (s: string) => /^[6-9]\d{9}$/.test((s || '').trim())
export const isEmail = (s: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((s || '').trim()) && (s || '').length <= 254
export const isPincode = (s: string) => /^\d{6}$/.test((s || '').trim())

/** Best-effort in-memory rate limiter (per serverless instance). For hard limits
 *  across instances, back this with Upstash/Redis — see report. */
const hits = new Map<string, { count: number; resetAt: number }>()
export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now()
  const rec = hits.get(key)
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (rec.count >= limit) return false
  rec.count++
  return true
}

/** Client IP from common proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/** Constant-time string compare for secrets/passwords. */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}
