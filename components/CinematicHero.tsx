'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion'
import OrderButton from '@/components/OrderButton'

/* A text beat that fades in/out and drifts over a slice of scroll progress. */
function Beat({
  progress,
  range,
  startVisible = false,
  endVisible = false,
  className,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  startVisible?: boolean
  endVisible?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [start, end] = range
  const span = end - start
  const fade = span * 0.28
  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [startVisible ? 1 : 0, 1, 1, endVisible ? 1 : 0]
  )
  const y = useTransform(progress, [start, end], [24, -24])
  return (
    <motion.div
      style={{ opacity, y }}
      className={className ?? 'absolute inset-0 flex items-center justify-center px-5'}
    >
      {children}
    </motion.div>
  )
}

// Video beats: standing pouch 0–.45 · hands tear it open .45–.75 · real chicken revealed .75–1
export default function CinematicHero() {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // iOS/Android Safari throttle programmatic currentTime seeking, so scroll-scrub
  // never paints on touch devices. On mobile we just autoplay+loop the film instead.
  const isMobileRef = useRef(false)
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    isMobileRef.current = mobile
    const v = videoRef.current
    if (mobile && v) {
      v.loop = true
      v.muted = true
      const tryPlay = () => v.play().catch(() => {})
      tryPlay()
      v.addEventListener('loadeddata', tryPlay, { once: true })
    }
  }, [])

  // Scroll-scrub: scroll progress → video currentTime, eased per frame.
  const target = useRef(0)
  const rafId = useRef<number | null>(null)
  const step = () => {
    const v = videoRef.current
    if (!v || isMobileRef.current) {
      rafId.current = null
      return
    }
    const diff = target.current - v.currentTime
    if (Math.abs(diff) < 0.004) {
      v.currentTime = target.current
      rafId.current = null
      return
    }
    v.currentTime = v.currentTime + diff * 0.25
    rafId.current = requestAnimationFrame(step)
  }
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const v = videoRef.current
    if (!v || isMobileRef.current || !v.duration || Number.isNaN(v.duration)) return
    target.current = Math.max(0, Math.min(v.duration - 0.04, p * v.duration))
    if (rafId.current === null) rafId.current = requestAnimationFrame(step)
  })

  const cueOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <div ref={ref} className="relative bg-black h-[180vh] md:h-[320vh]">
      <div className="sticky-media overflow-hidden bg-black">
        {/* ── Constant media: scroll-scrubbed cinematic film ── */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = 0.001
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Minimal grade — footage is near-black; just edge falloff + blend out */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-green-deep via-green-deep/40 to-transparent" />

        {/* ── Headline — bottom-left, opening pouch shot ── */}
        <Beat
          progress={scrollYProgress}
          range={[0, 0.18]}
          startVisible
          className="absolute inset-0 flex flex-col justify-end px-6 pb-16 pt-28 md:px-12 md:pb-24"
        >
          <div className="mx-auto w-full max-w-7xl">
            <h1 className="sr-only">Ultimate Chicken — ready-to-eat chicken breast, zero cooking</h1>
            <Image
              src="/uc-logo.png"
              alt="Ultimate Chicken"
              width={993}
              height={243}
              priority
              className="h-auto w-[78vw] max-w-md drop-shadow-[0_6px_40px_rgba(0,0,0,0.6)] md:max-w-2xl"
            />
            <p className="mt-5 max-w-xl text-lg font-medium text-cream/85 md:text-2xl">
              India&apos;s first ready-to-eat sous-vide chicken breast.{' '}
              <span className="text-lime-brand">No cooking.</span>
            </p>
          </div>
        </Beat>

        {/* ── Action caption — top-right, during the tear ── */}
        <Beat
          progress={scrollYProgress}
          range={[0.42, 0.7]}
          className="absolute inset-x-0 top-0 flex justify-end px-6 pt-28 md:px-12"
        >
          <div className="max-w-xs text-right">
            <p className="section-label text-cream/50">No knife. No plate.</p>
            <p className="shout-upright mt-2 text-3xl text-cream md:text-4xl">
              Just tear it open.
              <br />
              Eat it straight.
            </p>
          </div>
        </Beat>

        {/* ── Finale — the real chicken, revealed ── */}
        <Beat
          progress={scrollYProgress}
          range={[0.8, 1]}
          endVisible
          className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-12 md:pb-20"
        >
          <div className="mx-auto w-full max-w-7xl text-center">
            <p className="section-label mb-3 text-cream/75">No cooking. Just real chicken.</p>
            <p className="shout text-4xl leading-[0.95] text-cream drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] md:text-6xl">
              27g of protein. <span className="text-lime-brand">Ready to eat.</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <OrderButton className="btn-lime !px-9 !py-4 !text-lg" />
              <Link href="/#flavours" className="btn-outline !border-cream text-cream hover:!bg-cream hover:!text-green-deep">
                See the Flavours
              </Link>
            </div>
          </div>
        </Beat>

        {/* Scroll cue — bottom-right so it never fights the headline */}
        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-6 right-6 md:right-12">
          <span className="section-label text-cream/50">Scroll ↓</span>
        </motion.div>
      </div>
    </div>
  )
}
