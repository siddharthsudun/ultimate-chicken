'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/#flavours', label: 'Flavours' },
  { href: '/why-sous-vide', label: 'Why Sous Vide' },
  { href: '/microplastics', label: 'Transparency' },
  { href: '/#story', label: 'Our Story' },
]

export default function Nav({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textColor = dark ? 'text-cream' : 'text-green-brand'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? (dark ? 'nav-scrolled--dark' : 'nav-scrolled') : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Ultimate Chicken home">
          <Image
            src="/brand/wordmark-green.png"
            alt="Ultimate Chicken"
            width={150}
            height={48}
            priority
            style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
        </Link>

        <div className={`nav-links hidden items-center gap-8 md:flex ${textColor}`}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-condensed text-lg font-bold uppercase tracking-wide opacity-80 transition-opacity hover:opacity-100"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/#waitlist" className="btn-lime !px-6 !py-2.5 !text-base">
            Join the Waitlist
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden ${textColor}`}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className={`md:hidden ${dark ? 'bg-green-deep text-cream' : 'bg-cream text-green-brand'} border-t border-green-brand/10 px-5 pb-6 pt-2`}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-condensed text-2xl font-extrabold uppercase"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/#waitlist" onClick={() => setOpen(false)} className="btn-lime mt-3 w-full">
            Join the Waitlist
          </Link>
        </div>
      )}
    </nav>
  )
}
