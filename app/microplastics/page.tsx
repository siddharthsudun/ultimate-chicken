'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import OrderButton from '@/components/OrderButton'

/* Particles-per-serving comparison. Log scale — linear would make our bar invisible. */
const SOURCES = [
  { label: 'Our pouch', range: '8–10', value: 10, note: 'particles per serving', highlight: true },
  { label: 'Table salt', range: '150–5,500', value: 5500, note: 'particles per serving' },
  { label: 'Bottled water', range: '110,000–370,000', value: 370000, note: 'particles per litre' },
]

function LogBar({ value, max, highlight, delay }: { value: number; max: number; highlight?: boolean; delay: number }) {
  const pct = Math.max(4, (Math.log10(value) / Math.log10(max)) * 100)
  return (
    <div className="h-7 w-full overflow-hidden rounded-full bg-green-brand/5">
      <div
        className="h-full rounded-full transition-all duration-[1.4s] ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: highlight ? '#CBF512' : '#23453966',
          transitionDelay: `${delay}s`,
        }}
      />
    </div>
  )
}

export default function Microplastics() {
  return (
    <main className="bg-cream text-green-brand">
      <Nav />

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pt-44">
        <Reveal>
          <span className="tag-slab tag-slab--lime text-base md:text-lg">
            <span>Full transparency</span>
          </span>
          <h1 className="shout mt-5 max-w-4xl text-7xl md:text-[7.5rem]">
            Yes, the pouch is plastic. Let&apos;s talk about it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-green-brand/70">
            Most food brands hope you never ask about microplastics. We&apos;d rather show you the
            numbers, because ours are good — and because you deserve to know exactly what your food
            touches.
          </p>
        </Reveal>
      </header>

      {/* The numbers */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="section-label">Microplastic particles per serving</p>
            <h2 className="shout mt-3 text-6xl md:text-7xl">Context is everything.</h2>
          </Reveal>
          <div className="mt-12 space-y-8">
            {SOURCES.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className={`font-condensed text-2xl font-extrabold uppercase ${s.highlight ? '' : 'opacity-70'}`}>
                      {s.label}
                      {s.highlight && (
                        <span className="tag-slab tag-slab--lime ml-3 align-middle text-xs">
                          <span>That&apos;s us</span>
                        </span>
                      )}
                    </span>
                    <span className="stat-num text-4xl">
                      {s.range} <span className="text-sm font-bold uppercase tracking-wider opacity-50">{s.note}</span>
                    </span>
                  </div>
                  <LogBar value={s.value} max={370000} highlight={s.highlight} delay={i * 0.15} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-green-brand/55">
              Bars are on a logarithmic scale — on a linear scale, our bar would be invisible next
              to bottled water. A single serving of our chicken carries roughly 8–10 microplastic
              particles. The bottled water in your gym bag can carry up to 370,000 per litre.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What the pouch is */}
      <section className="bg-green-brand py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="section-label text-lime-brand !opacity-90">The packaging, exactly</p>
            <h2 className="shout mt-3 max-w-3xl text-6xl md:text-8xl">
              What the pouch is — <span className="text-lime-brand">and isn&apos;t.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              [
                'PP · PE · PA',
                'Food-grade multilayer',
                'Polypropylene, polyethylene and polyamide — the same families used for medical and laboratory food contact. Built for vacuum sealing and low-temperature cooking.',
              ],
              [
                'No BPA',
                'No bisphenols. Ever.',
                'Our pouches contain zero BPA and zero PVC — the two materials behind most plastic-leaching headlines. Certified non-toxic, food-safe.',
              ],
              [
                '63°C max',
                'Low heat, low migration',
                'Plastic migration accelerates with heat. Our chicken never exceeds 63°C — far below the temperatures where packaging breakdown becomes a concern. We never boil, fry or pressure-cook in the pouch.',
              ],
            ].map(([stat, title, body], i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="h-full rounded-3xl bg-cream p-8 text-green-deep shadow-sm">
                  <p className="stat-num text-6xl text-green-deep">{stat}</p>
                  <h3 className="shout-upright mt-4 text-3xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-green-deep/65">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why a pouch at all */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-start gap-14 md:grid-cols-2">
            <Reveal>
              <p className="section-label">Why a pouch at all?</p>
              <h2 className="shout mt-3 text-6xl md:text-7xl">The pouch is the preservative.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-green-brand/75">
                <p>
                  Sous vide only works inside a vacuum. The sealed pouch is what lets us cook at a
                  precise 63°C, lock the moisture in, and keep bacteria out — which is exactly why
                  we don&apos;t need a single preservative or additive.
                </p>
                <p>
                  Remove the pouch and you have to add chemistry instead. That&apos;s the actual
                  trade-off on the table: a food-grade vacuum pouch, or a preservative ingredient
                  list. We picked the pouch. We&apos;d pick it again.
                </p>
                <p className="font-bold text-green-brand">
                  Our position: zero preservatives in the food beats zero plastic around it — and
                  we&apos;ll keep publishing the particle data so you can hold us to it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lime-brand py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 text-center">
          <Reveal>
            <h2 className="shout text-6xl text-green-deep md:text-8xl">Questions? Good.</h2>
            <p className="mt-4 max-w-md font-medium text-green-deep/80">
              That&apos;s the kind of customer we want. Read about the cooking process, or just come
              taste it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/why-sous-vide" className="btn-outline !border-green-deep text-green-deep hover:!bg-green-deep hover:!text-lime-brand">
                Why Sous Vide
              </Link>
              <OrderButton className="btn-outline !border-green-deep text-green-deep hover:!bg-green-deep hover:!text-lime-brand" />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
