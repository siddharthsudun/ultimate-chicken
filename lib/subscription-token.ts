// Signed "manage your subscription" links — lets a customer pause/resume their
// own subscription from an emailed link, with no login. The token is an HMAC of
// the Razorpay subscription id, so only links we generated are accepted.

import crypto from 'crypto'
import { safeEqual } from '@/lib/security'

function secret(): string {
  // Reuse the server-only Razorpay secret for signing (never exposed to the client).
  return process.env.SUBSCRIPTION_LINK_SECRET || process.env.RAZORPAY_KEY_SECRET || ''
}

export function signSub(subscriptionId: string): string {
  return crypto.createHmac('sha256', secret()).update(subscriptionId).digest('hex')
}

export function verifySub(subscriptionId: string, token: string): boolean {
  if (!subscriptionId || !token) return false
  return safeEqual(signSub(subscriptionId), token)
}

export function manageUrl(subscriptionId: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimatechicken.in'
  return `${site}/manage/subscription?sid=${encodeURIComponent(subscriptionId)}&t=${signSub(subscriptionId)}`
}
