'use client'

import { useEffect, useRef } from 'react'

// Renders the Cloudflare Turnstile widget only when a site key is configured.
// Calls onToken with the verification token (or '' on error/expiry).
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
  }
}

export default function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const rendered = useRef(false)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    let timer: ReturnType<typeof setInterval> | null = null

    const render = () => {
      if (rendered.current || !window.turnstile || !ref.current) return
      rendered.current = true
      window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(''),
        'expired-callback': () => onToken(''),
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const id = 'cf-turnstile-script'
      if (!document.getElementById(id)) {
        const s = document.createElement('script')
        s.id = id
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true
        s.defer = true
        s.onload = render
        document.head.appendChild(s)
      } else {
        timer = setInterval(() => {
          if (window.turnstile) {
            if (timer) clearInterval(timer)
            render()
          }
        }, 200)
      }
    }
    return () => {
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  if (!siteKey) return null
  return <div ref={ref} className="mt-4" />
}
