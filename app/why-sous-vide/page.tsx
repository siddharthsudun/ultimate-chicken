'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import OrderButton from '@/components/OrderButton'

const STEPS = [
  {
    num: '01',
    title: 'Marinate',
    desc: 'Whole chicken breast, real spice blends. Gochujang, soy, bird’s eye chili — no MSG, no flavour enhancers, no colour. The marinade goes into the pouch with the meat.',
  },
  {
    num: '02',
    title: 'Vacuum seal',
    desc: 'Chamber-sealed to full compression. No air means no oxidation, no freezer burn, and flavour pressed directly into the surface of the meat.',
  },
  {
    num: '03',
    title: '63°C for 90 minutes',
    desc: 'A precisely controlled water bath. Not 62. Not 65. At 63°C the chicken pasteurises fully while the proteins stay relaxed — cooked through, never dried out.',
  },
  {
    num: '04',
    title: 'Ice bath, fast',
    desc: 'Core temperature drops below 4°C within 30 minutes. This cold-lock is what gives the pouch a 14-day fridge life with zero preservatives.',
  },
  {
    num: '05',
    title: 'Double-sealed, chilled',
    desc: 'Re-sealed in a fresh pouch after the ice bath and stored flat at ≤4°C until it lands in your fridge. Cold chain, unbroken.',
  },
]

export default function WhySousVide() {
  return (
    <main className="bg-cream text-green-deep">
      <Nav />

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pt-44">
        <Reveal>
          <span className="tag-slab tag-slab--lime text-base md:text-lg">
            <span>The technique</span>
          </span>
          <h1 className="shout has-hl mt-5 max-w-4xl text-7xl md:text-[7.5rem]">
            Sous vide is the <span className="hl">whole trick.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-green-deep/70">
            Soo-veed. French for &quot;under vacuum.&quot; It&apos;s the technique Michelin-starred
            kitchens use to cook chicken — and it&apos;s the only reason a pouch of real chicken can
            sit in your fridge for two weeks with zero preservatives and still taste incredible cold.
          </p>
        </Reveal>
      </header>

      {/* The problem */}
      <section className="bg-green-brand py-24 text-cream">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-start gap-14 md:grid-cols-2">
            <Reveal>
              <p className="section-label text-lime-brand !opacity-90">The problem with normal cooking</p>
              <h2 className="shout mt-3 text-6xl md:text-7xl">Heat you can&apos;t control ruins chicken.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-cream/75">
                <p>
                  A pan runs at 200°C+. A grill, hotter. Chicken protein starts squeezing out its
                  moisture at around 66°C — so every conventional method overshoots, and the
                  difference between juicy and sawdust is about ninety seconds of attention.
                </p>
                <p>
                  That&apos;s why most &quot;healthy&quot; chicken is dry, why boiled chicken is
                  depressing, and why restaurants drown breast meat in oil and sauce to hide it.
                </p>
                <p className="font-bold text-lime-brand">
                  Sous vide removes the variable. The water bath physically cannot exceed 63°C, so
                  the chicken physically cannot overcook. Every pouch, identical.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="section-label text-green-deep">The process</p>
            <h2 className="shout mt-3 text-6xl md:text-8xl">Five steps. Zero shortcuts.</h2>
          </Reveal>
          <div className="mt-14 space-y-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.05}>
                <div className="grid items-start gap-4 rounded-3xl border border-green-deep/10 bg-white p-7 shadow-sm md:grid-cols-[100px_280px_1fr] md:gap-8">
                  <p className="stat-num text-6xl text-green-deep">{s.num}</p>
                  <h3 className="shout-upright pt-1 text-4xl">{s.title}</h3>
                  <p className="pt-1.5 leading-relaxed text-green-deep/65">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why it wins */}
      <section className="border-t border-green-deep/10 bg-cream py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <h2 className="shout has-hl max-w-3xl text-6xl md:text-8xl">
              What you get <span className="hl">out of it.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['100%', 'Pasteurised', '90 minutes at 63°C kills bacteria as thoroughly as high heat — without the collateral damage to the meat.'],
              ['0', 'Preservatives needed', 'The vacuum seal plus instant chilling does the preserving. The ingredient list is chicken and marinade. That’s it.'],
              ['27g', 'Protein, intact', 'No protein loss to boiling water. The macros on the pouch are the macros in the meat.'],
              ['14', 'Days in your fridge', 'Cooked, sealed and chilled in one unbroken chain. Twelve months if you freeze it.'],
            ].map(([stat, title, body], i) => (
              <Reveal key={title} delay={i * 0.07}>
                <div className="h-full rounded-3xl border border-green-deep/15 bg-white p-7 shadow-sm">
                  <p className="stat-num text-7xl text-green-deep">{stat}</p>
                  <h3 className="shout-upright mt-4 text-2xl">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-green-deep/60">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lime-brand py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 text-center">
          <Reveal>
            <h2 className="shout text-6xl text-green-deep md:text-8xl">Taste the difference.</h2>
            <p className="mt-4 max-w-md font-medium text-green-deep/80">
              Michelin technique, hostel-room convenience. Pick a flavour.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/#flavours" className="btn-outline !border-green-deep text-green-deep hover:!bg-green-deep hover:!text-lime-brand">
                See the Flavours
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
