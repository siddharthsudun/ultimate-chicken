'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import OrderButton from '@/components/OrderButton'
import type { Flavour } from '@/lib/flavours'
import { FLAVOURS } from '@/lib/flavours'

/* One full-screen text slide that fades in/out over its slice of the scroll.
   The image behind stays pinned — only this text moves. */
function ScrollSlide({
  progress,
  index,
  total,
  className,
  children,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  className?: string
  children: React.ReactNode
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
      className={
        className ?? 'absolute inset-0 flex flex-col items-center justify-center px-5 text-center'
      }
    >
      {children}
    </motion.div>
  )
}

/* Sticky full-screen product image, constant from the very first screen.
   The hero is the first slide; scrolling then swaps macros, then the ingredient list.
   Only the text moves — the image never changes. */
function StoryScroller({ flavour }: { flavour: Flavour }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const stats: [string, string][] = [
    [`${flavour.protein}g`, 'Protein'],
    [`${flavour.calories}`, 'Calories'],
    ['0', 'Preservatives'],
  ]
  const total = stats.length + 2 // hero slide + macro slides + ingredients slide

  return (
    <div ref={ref} style={{ height: `${total * 100 + 60}vh` }} className="relative">
      <div className="sticky-media overflow-hidden">
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
            background: `linear-gradient(to bottom, ${flavour.deep}99, transparent 30%, transparent 55%, ${flavour.deep}EE)`,
          }}
        />

        {/* Slide 0 — hero */}
        <ScrollSlide
          progress={scrollYProgress}
          index={0}
          total={total}
          className="absolute inset-0 flex flex-col justify-end px-5 pb-16 pt-28 md:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <span
              className="tag-slab text-base md:text-lg"
              style={{ backgroundColor: flavour.primary, color: '#fff' }}
            >
              <span>
                {'●'.repeat(flavour.heat)}
                {'○'.repeat(3 - flavour.heat)} · Sous-vide · Ready to eat
              </span>
            </span>
            <h1
              className="shout mt-4 text-[16vw] leading-[0.85] md:text-[10rem]"
              style={{ color: flavour.glow }}
            >
              {flavour.name}
            </h1>
            <p className="mt-4 max-w-lg text-xl font-medium text-cream/85">{flavour.tagline}</p>
            <div className="mt-8 flex flex-wrap items-end gap-10 border-t border-white/20 pt-6 text-cream">
              {[
                [`${flavour.protein}g`, 'Protein'],
                [`${flavour.calories}`, 'Calories'],
                ['0', 'Preservatives'],
                [flavour.weight, 'Per pouch'],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="stat-num text-5xl md:text-6xl text-cream">{num}</p>
                  <p className="section-label mt-1 !opacity-70 text-cream">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollSlide>

        {/* Macro slides */}
        {stats.map(([top, bottom], i) => (
          <ScrollSlide key={bottom} progress={scrollYProgress} index={i + 1} total={total}>
            <p className="stat-num text-[26vw] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.45)] md:text-[17rem]">
              {top}
            </p>
            <p className="shout mt-2 text-4xl text-white/90 drop-shadow-lg md:text-6xl">{bottom}</p>
          </ScrollSlide>
        ))}

        {/* Ingredients slide */}
        <ScrollSlide progress={scrollYProgress} index={stats.length + 1} total={total}>
          <p className="shout text-3xl text-white/80 drop-shadow-lg md:text-4xl">
            Every ingredient
          </p>
          <ul className="mt-5 space-y-1">
            {flavour.ingredients.map((ing) => (
              <li
                key={ing}
                className="shout text-4xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] md:text-6xl"
              >
                {ing}
              </li>
            ))}
          </ul>
          <p className="shout mt-6 text-3xl drop-shadow-lg md:text-5xl" style={{ color: flavour.glow }}>
            + nothing else.
          </p>
        </ScrollSlide>
      </div>
    </div>
  )
}

export default function FlavourStory({ flavour }: { flavour: Flavour }) {
  const others = FLAVOURS.filter((f) => f.slug !== flavour.slug)

  return (
    <main className="bg-cream text-green-deep">
      <Nav dark />

      {/* ── Hero + scroll-driven macro takeover over one constant image ── */}
      <StoryScroller flavour={flavour} />

      {/* ── Flavour breakdown ── */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-14 md:grid-cols-2">
            <Reveal>
              <p className="section-label" style={{ color: flavour.primary }}>
                The flavour
              </p>
              <h2 className="shout mt-3 text-6xl md:text-7xl">What you&apos;re biting into</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-green-deep/75">{flavour.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {flavour.flavourNotes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border-2 px-5 py-2 font-condensed text-lg font-bold uppercase tracking-wide"
                    style={{ borderColor: flavour.primary, color: flavour.primary }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="space-y-4">
                {[
                  ['Whole chicken breast', '140g per pouch. One piece. Not reformed, not shredded, not paste.'],
                  ['Marinade does the work', 'Flavour penetrates during the 90-minute sous vide cook — all the way through, not painted on top.'],
                  ['Nothing artificial', 'Zero preservatives, zero additives, zero artificial colour. Eurofins tested, FSSAI registered.'],
                  [
                    flavour.allergens.length > 0 ? `Allergens: ${flavour.allergens.join(', ')}` : 'Allergens: none',
                    flavour.allergens.length > 0
                      ? 'Declared on every pack, exactly as FSSAI requires.'
                      : 'The cleanest sheet in the lineup.',
                  ],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-green-deep/10 bg-white p-6 shadow-sm">
                    <h3 className="shout-upright text-2xl" style={{ color: flavour.primary }}>
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-green-deep/65">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How to eat ── */}
      <section className="bg-green-brand py-24 text-cream">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <h2 className="shout text-6xl md:text-7xl">
              Two ways to eat it. <span className="text-lime-brand">Both lazy.</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="h-full rounded-3xl bg-cream p-8 text-green-deep shadow-sm">
                <p className="stat-num text-7xl" style={{ color: flavour.primary }}>
                  ❄
                </p>
                <h3 className="shout-upright mt-5 text-4xl">Straight from the fridge</h3>
                <p className="mt-3 text-green-deep/70">
                  Tear the corner. Push the chicken up. Bite. It&apos;s fully cooked and engineered
                  to taste great cold — juicy, never rubbery. Zero utensils.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="h-full rounded-3xl bg-cream p-8 text-green-deep shadow-sm">
                <p className="stat-num text-7xl" style={{ color: flavour.primary }}>
                  60s
                </p>
                <h3 className="shout-upright mt-5 text-4xl">Or warm it up</h3>
                <p className="mt-3 text-green-deep/70">
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
              <h2 className="shout text-6xl md:text-7xl">Hungry?</h2>
              <p className="max-w-md font-medium text-green-deep/80">
                Fresh batch drops weekly. Add to cart and check out in seconds.
              </p>
              <OrderButton className="btn-outline !border-green-deep text-green-deep hover:!bg-green-deep hover:!text-lime-brand" />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
