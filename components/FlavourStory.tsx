'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import type { Flavour } from '@/lib/flavours'
import { FLAVOURS } from '@/lib/flavours'

/* One giant stat that fades in/out over its slice of the scroll. */
function ScrollStat({
  progress,
  index,
  total,
  top,
  bottom,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  top: string
  bottom: string
}) {
  const sliceStart = index / total
  const sliceEnd = (index + 1) / total
  const fade = 0.18 / total
  const opacity = useTransform(
    progress,
    [sliceStart, sliceStart + fade, sliceEnd - fade, sliceEnd],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  )
  const y = useTransform(progress, [sliceStart, sliceEnd], [40, -40])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
    >
      <p className="stat-num text-[26vw] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.45)] md:text-[17rem]">
        {top}
      </p>
      <p className="shout mt-2 text-4xl text-white/90 drop-shadow-lg md:text-6xl">{bottom}</p>
    </motion.div>
  )
}

/* Sticky full-screen product image with scroll-swapped macro stats. */
function MacroScroller({ flavour }: { flavour: Flavour }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const stats: [string, string][] = [
    [`${flavour.protein}g`, 'Protein'],
    [`${flavour.calories}`, 'Calories'],
    ['0', 'Preservatives'],
    ['60s', 'Microwave. Or eat it cold.'],
  ]

  return (
    <div ref={ref} style={{ height: `${stats.length * 100 + 60}vh` }} className="relative">
      <div className="sticky-media overflow-hidden">
        <Image
          src={flavour.image}
          alt={flavour.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${flavour.deep}99, transparent 30%, transparent 60%, ${flavour.deep}CC)`,
          }}
        />
        {stats.map(([top, bottom], i) => (
          <ScrollStat
            key={bottom}
            progress={scrollYProgress}
            index={i}
            total={stats.length}
            top={top}
            bottom={bottom}
          />
        ))}
      </div>
    </div>
  )
}

export default function FlavourStory({ flavour }: { flavour: Flavour }) {
  const others = FLAVOURS.filter((f) => f.slug !== flavour.slug)

  return (
    <main style={{ backgroundColor: flavour.deep }} className="text-cream">
      <Nav dark />

      {/* ── Hero ── */}
      <header className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-14 pt-28">
        <div className="absolute inset-0">
          <Image
            src={flavour.image}
            alt={flavour.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${flavour.deep}66, transparent 35%, ${flavour.deep} 92%)`,
            }}
          />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
          <Reveal>
            <span className="tag-slab text-base md:text-lg" style={{ backgroundColor: flavour.primary, color: '#fff' }}>
              <span>
                {'●'.repeat(flavour.heat)}
                {'○'.repeat(3 - flavour.heat)} · Sous-vide · Ready to eat
              </span>
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="shout mt-4 text-[16vw] leading-[0.85] md:text-[10rem]" style={{ color: flavour.glow }}>
              {flavour.name}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-lg text-xl font-medium text-cream/85">{flavour.tagline}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-end gap-10 border-t border-white/20 pt-6">
              {[
                [`${flavour.protein}g`, 'Protein'],
                [`${flavour.calories}`, 'Calories'],
                ['0', 'Preservatives'],
                [flavour.weight, 'Per pouch'],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="stat-num text-5xl md:text-6xl">{num}</p>
                  <p className="section-label mt-1 !opacity-60">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* ── Scroll-driven macro takeover ── */}
      <MacroScroller flavour={flavour} />

      {/* ── Flavour breakdown ── */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-14 md:grid-cols-2">
            <Reveal>
              <p className="section-label" style={{ color: flavour.glow }}>
                The flavour
              </p>
              <h2 className="shout mt-3 text-6xl md:text-7xl">What you&apos;re biting into</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">{flavour.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {flavour.flavourNotes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border-2 px-5 py-2 font-condensed text-lg font-bold uppercase tracking-wide"
                    style={{ borderColor: flavour.primary, color: flavour.glow }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="space-y-4">
                {[
                  ['Whole chicken breast', '150g raw, 120g cooked. One piece. Not reformed, not shredded, not paste.'],
                  ['Marinade does the work', 'Flavour penetrates during the 90-minute sous vide cook — all the way through, not painted on top.'],
                  ['Nothing artificial', 'Zero preservatives, zero added oil, zero sugar, zero colour. Eurofins tested, FSSAI registered.'],
                  [
                    flavour.allergens.length > 0 ? `Allergens: ${flavour.allergens.join(', ')}` : 'Allergens: none',
                    flavour.allergens.length > 0
                      ? 'Declared on every pack, exactly as FSSAI requires.'
                      : 'The cleanest sheet in the lineup.',
                  ],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                    <h3 className="shout-upright text-2xl" style={{ color: flavour.glow }}>
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-cream/65">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How to eat ── */}
      <section className="bg-black/20 py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <h2 className="shout text-6xl md:text-7xl">
              Two ways to eat it. <span style={{ color: flavour.glow }}>Both lazy.</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="h-full rounded-3xl border border-white/15 p-8">
                <p className="stat-num text-7xl" style={{ color: flavour.glow }}>
                  ❄
                </p>
                <h3 className="shout-upright mt-5 text-4xl">Straight from the fridge</h3>
                <p className="mt-3 text-cream/70">
                  Tear the corner. Push the chicken up. Bite. It&apos;s fully cooked and engineered
                  to taste great cold — juicy, never rubbery. Zero utensils.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="h-full rounded-3xl border border-white/15 p-8">
                <p className="stat-num text-7xl" style={{ color: flavour.glow }}>
                  60s
                </p>
                <h3 className="shout-upright mt-5 text-4xl">Or warm it up</h3>
                <p className="mt-3 text-cream/70">
                  Pop the pouch in the microwave for 60 seconds. Want a seared glaze? 30 seconds a
                  side on a hot pan. It&apos;s already cooked — this is just vibes.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Other flavours + CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="section-label !opacity-60">Keep going</p>
            <h2 className="shout mt-3 text-5xl md:text-6xl">The other two</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {others.map((f, i) => (
              <Reveal key={f.slug} delay={i * 0.08}>
                <Link
                  href={`/flavours/${f.slug}`}
                  className="group flex items-center justify-between rounded-3xl p-7 transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: f.deep, border: `1px solid ${f.primary}55` }}
                >
                  <div>
                    <h3 className="shout text-4xl md:text-5xl" style={{ color: f.glow }}>
                      {f.name}
                    </h3>
                    <p className="mt-1 text-sm text-cream/60">
                      {f.protein}g protein · {f.calories} cal · 0 preservatives
                    </p>
                  </div>
                  <span className="text-3xl opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="mt-14 flex flex-col items-center gap-5 rounded-[2rem] bg-lime-brand px-8 py-14 text-center text-green-deep">
              <h2 className="shout text-6xl md:text-7xl">Want in?</h2>
              <p className="max-w-md font-medium text-green-deep/80">
                Launching at BITS Pilani first. The waitlist eats before everyone else.
              </p>
              <Link href="/#waitlist" className="btn-outline !border-green-deep text-green-deep hover:!bg-green-deep hover:!text-lime-brand">
                Join the Waitlist
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
