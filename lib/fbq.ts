// Thin, safe wrapper around the Meta Pixel global. No-ops if the pixel hasn't
// loaded (e.g. blocked by an ad-blocker) so it never breaks the app.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function fbTrack(event: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', event, params)
    } catch {
      /* ignore */
    }
  }
}
