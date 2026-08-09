// Distributed rate limiting via Upstash Redis (shared across all serverless
// instances). Falls back to the per-instance in-memory limiter if Upstash isn't
// configured, so the app keeps working either way.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { rateLimit as memLimit } from '@/lib/security'

let redis: Redis | null = null
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  if (!redis) redis = Redis.fromEnv()
  return redis
}

const limiters = new Map<string, Ratelimit>()
function getLimiter(limit: number, windowSec: number): Ratelimit | null {
  const r = getRedis()
  if (!r) return null
  const k = `${limit}:${windowSec}`
  if (!limiters.has(k)) {
    limiters.set(
      k,
      new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: 'uc_rl',
        analytics: false,
      })
    )
  }
  return limiters.get(k)!
}

/** Returns true if the request is allowed, false if rate-limited. */
export async function rateLimitAsync(key: string, limit: number, windowSec = 60): Promise<boolean> {
  const l = getLimiter(limit, windowSec)
  if (!l) return memLimit(key, limit, windowSec * 1000) // fallback
  try {
    const { success } = await l.limit(key)
    return success
  } catch {
    return memLimit(key, limit, windowSec * 1000)
  }
}
