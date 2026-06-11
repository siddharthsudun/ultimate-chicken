'use client'

import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import WaitlistForm from '@/components/WaitlistForm'
import { FLAVOURS } from '@/lib/flavours'

/* ───────────────────────── Ticker ───────────────────────── */

function Ticker() {
  const items = [
    'Ready to eat',
    'No need to cook',
    'Eat from the wrapper',
    'Zero preservatives',
    '27g protein',
    'Sous vide',
    'Lives in your fridge',
  ]
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden bg-green-brand py-3.5">
      <div
        className="flex w-max items-center gap-8 whitespace-nowrap"
        style={{ animation: 'ticker-scroll 30s linear infinite' }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="shout text-2xl text-lime-brand">{t}</span>
            <span className="text-lime-brand/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <header className="relative overflow-hidden bg-cream pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10 pb-10 md:pb-24">
            <Reveal>
              <span className="tag-slab tag-slab--lime text-base md:text-lg">
                <span>Sous-vide · Straight from the fridge</span>
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="shout mt-5 text-[17vw] leading-[0.88] text-green-brand md:text-[6.6rem] lg:text-[7.6rem]">
                Fully cooked
                <br />
                chicken.
                <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '3px #234539' }}>
                  Zero cooking.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-green-brand/80">
                It lives in your fridge. Tear the pouch, push up the chicken, take a bite — cold.
                Or give it 60 seconds in the microwave. That&apos;s the whole recipe.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="#waitlist" className="btn-lime">
                  Join the Waitlist
                </Link>
                <Link href="#flavours" className="btn-outline text-green-brand">
                  See the Flavours
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-10 flex items-end gap-8 border-t-2 border-green-brand/10 pt-6">
                {[
                  ['27g', 'Protein'],
                  ['140', 'Calories*'],
                  ['0', 'Preservatives'],
                ].map(([num, label]) => (
                  <div key={label}>
                    <p className="stat-num text-5xl text-green-brand md:text-6xl">{num}</p>
                    <p className="section-label mt-1 text-green-brand">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-green-brand/50">*Peri-Peri. 140–180 cal across flavours.</p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] md:max-w-none">
              <Image
                src="/products/hero-tear.jpg"
                alt="Tearing open an Ultimate Chicken ready-to-eat sous vide pouch"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </header>
  )
}

/* ───────────────────────── How it works ───────────────────────── */

const STEPS = [
  {
    num: '01',
    title: 'It lives in your fridge',
    body: 'Vacuum-sealed, fully cooked, chilled. 14 days in the fridge, 12 months in the freezer. No cold-chain anxiety.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10">
        <rect x="5" y="2.5" width="14" height="19" rx="2" />
        <path d="M5 10h14M9 5.5v2M9 13v3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Tear. Push. Bite.',
    body: 'Rip the corner, push the chicken up like a popsicle, eat straight from the wrapper. No plate, no fork, no cleanup.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10">
        <path d="M7 3h10l-1.5 18h-7L7 3z" />
        <path d="M7 3l3 3 2-2 2 2 3-3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Cold or 60s warm',
    body: 'It tastes great cold — it was engineered to. Want it warm? 60 seconds in the microwave, in the pouch. Done.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10">
        <rect x="2.5" y="6" width="19" height="13" rx="2" />
        <circle cx="17.5" cy="10" r="1" fill="currentColor" stroke="none" />
        <path d="M6 10.5h7M6 14h5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function HowItWorks() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="section-label text-green-brand">How it works</p>
          <h2 className="shout mt-3 max-w-3xl text-6xl text-green-brand md:text-8xl">
            No cooking. No oil. <span className="bg-lime-brand px-2">No prep.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div className="group h-full rounded-3xl border-2 border-green-brand/10 bg-white p-8 transition-colors hover:border-green-brand">
                <div className="flex items-start justify-between text-green-brand">
                  {s.icon}
                  <span className="stat-num text-5xl text-green-brand/15 transition-colors group-hover:text-lime-brand">
                    {s.num}
                  </span>
                </div>
                <h3 className="shout-upright mt-8 text-4xl text-green-brand">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-green-brand/70">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Macro wall (dark) ───────────────────────── */

function MacroWall() {
  const stats = [
    ['27g', 'protein per pouch', 'More than four eggs. From actual chicken, not powder.'],
    ['0', 'preservatives · additives · oil', 'The sous vide process does the preserving. Nothing else needed.'],
    ['63°C', 'slow-cooked for 90 minutes', 'Michelin-kitchen technique. Pasteurised, tender, never dry.'],
    ['14', 'days in your fridge', 'And 12 months in the freezer. Stock up once, eat all month.'],
  ]
  return (
    <section className="bg-green-deep py-24 text-cream md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <span className="tag-slab tag-slab--lime text-base md:text-lg">
            <span>Real food. Real protein.</span>
          </span>
          <h2 className="shout mt-5 max-w-4xl text-6xl md:text-8xl">
            Not a bar. Not a shake. <span className="text-lime-brand">Actual chicken.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {stats.map(([num, label, body], i) => (
            <Reveal key={label} delay={i * 0.08}>
              <div className="border-t border-cream/15 pt-6">
                <p className="stat-num text-8xl text-lime-brand md:text-9xl">{num}</p>
                <p className="shout-upright mt-3 text-3xl">{label}</p>
                <p className="mt-2 max-w-md text-cream/60">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Flavours ───────────────────────── */

function Flavours() {
  return (
    <section id="flavours" className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="section-label text-green-brand">The lineup</p>
          <h2 className="shout mt-3 text-6xl text-green-brand md:text-8xl">Three flavours. 27g each.</h2>
          <p className="mt-4 max-w-xl text-lg text-green-brand/70">
            Flavours that actually hit — not &quot;grilled herb&quot; from a hospital menu. Tap one.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {FLAVOURS.map((f, i) => (
            <Reveal key={f.slug} delay={i * 0.1}>
              <Link
                href={`/flavours/${f.slug}`}
                className="group block overflow-hidden rounded-[2rem] text-cream"
                style={{ backgroundColor: f.deep }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={f.image}
                    alt={f.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2"
                    style={{ background: `linear-gradient(to top, ${f.deep} 5%, transparent)` }}
                  />
                  <div className="absolute left-5 top-5">
                    <span className="tag-slab text-sm" style={{ backgroundColor: f.primary, color: '#fff' }}>
                      <span>
                        {'●'.repeat(f.heat)}
                        {'○'.repeat(3 - f.heat)} heat
                      </span>
                    </span>
                  </div>
                </div>
                <div className="relative -mt-10 p-7 pt-0">
                  <h3 className="shout text-5xl" style={{ color: f.glow }}>
                    {f.name}
                  </h3>
                  <p className="mt-2 text-sm text-cream/70">{f.tagline}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="stat-num text-3xl">{f.protein}g</p>
                        <p className="text-[10px] uppercase tracking-widest text-cream/50">Protein</p>
                      </div>
                      <div>
                        <p className="stat-num text-3xl">{f.calories}</p>
                        <p className="text-[10px] uppercase tracking-widest text-cream/50">Calories</p>
                      </div>
                      <div>
                        <p className="stat-num text-3xl">0</p>
                        <p className="text-[10px] uppercase tracking-widest text-cream/50">Preserv.</p>
                      </div>
                    </div>
                    <span className="font-condensed text-xl font-extrabold italic uppercase opacity-60 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Protein problem ───────────────────────── */

function ProteinProblem() {
  const bars = [
    { label: 'One bowl of dal', grams: 6, color: '#23453955' },
    { label: '100g paneer', grams: 18, color: '#23453988' },
    { label: 'One UC pouch', grams: 27, color: '#CBF512' },
  ]
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <Reveal>
            <p className="section-label text-green-brand">Why this exists</p>
            <h2 className="shout mt-3 text-6xl text-green-brand md:text-8xl">
              80% of Indians are protein deficient.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-green-brand/70">
              We&apos;re locked in a carb trap — 60–70% of daily calories come purely from
              carbohydrates. The &quot;convenient&quot; fixes are ultra-processed bars and powders.
              Real food got engineered out of the equation. We&apos;re putting it back.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-6 rounded-3xl border-2 border-green-brand/10 p-8">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-condensed text-xl font-bold uppercase text-green-brand">
                      {b.label}
                    </span>
                    <span className="stat-num text-3xl text-green-brand">{b.grams}g</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-green-brand/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(b.grams / 27) * 100}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-green-brand/50">
                Sources: IMRB, PDCAAS nutritional scoring, ICMR dietary guidelines.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Deep dives (sous vide + microplastics) ───────────────────────── */

function DeepDives() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <Link
            href="/why-sous-vide"
            className="group flex h-full flex-col justify-between rounded-[2rem] bg-green-brand p-9 text-cream transition-transform hover:-translate-y-1"
          >
            <div>
              <p className="section-label text-lime-brand !opacity-90">The technique</p>
              <h3 className="shout mt-3 text-5xl md:text-6xl">Why sous vide is the whole trick</h3>
              <p className="mt-4 max-w-md text-cream/70">
                Vacuum-sealed, slow-cooked at exactly 63°C for 90 minutes. It&apos;s how
                Michelin-starred kitchens cook chicken — and it&apos;s why ours needs no
                preservatives and never tastes dry.
              </p>
            </div>
            <span className="btn-outline mt-8 w-fit text-cream group-hover:border-lime-brand group-hover:bg-lime-brand group-hover:text-green-deep">
              Read the science →
            </span>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/microplastics"
            className="group flex h-full flex-col justify-between rounded-[2rem] border-2 border-green-brand/15 bg-white p-9 text-green-brand transition-transform hover:-translate-y-1"
          >
            <div>
              <p className="section-label">Full transparency</p>
              <h3 className="shout mt-3 text-5xl md:text-6xl">The microplastics question. Answered.</h3>
              <p className="mt-4 max-w-md text-green-brand/70">
                Yes, the pouch is plastic. Here&apos;s the data: ~8–10 particles per serving. Table
                salt carries up to 5,500. Bottled water, up to 370,000. See exactly what our
                packaging is — and isn&apos;t.
              </p>
            </div>
            <span className="btn-outline mt-8 w-fit">See the numbers →</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── Story ───────────────────────── */

function Story() {
  return (
    <section id="story" className="overflow-hidden bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <p className="section-label text-green-brand">The story</p>
              <h2 className="shout mt-3 text-6xl text-green-brand md:text-8xl">
                Built by two sophomores. From a rented kitchen in Pilani.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-green-brand/70">
                We&apos;re second-year BITS Pilani students who got tired of choosing between
                protein powder and 45 minutes of cooking. So we rented a kitchen two minutes from
                campus, learned sous vide, and started feeding BITS. That&apos;s not a weakness —
                it&apos;s the whole story.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-10">
                <p className="section-label mb-5 text-green-brand">Incubated by</p>
                <div className="flex flex-wrap items-center gap-8">
                  <Image
                    src="/brand/pieds-color.png"
                    alt="PIEDS — BITS Pilani's official startup incubator"
                    width={170}
                    height={97}
                    className="h-16 w-auto"
                  />
                  <Image
                    src="/brand/icar-nmri.png"
                    alt="ICAR — National Meat Research Institute"
                    width={280}
                    height={67}
                    className="h-12 w-auto"
                  />
                </div>
                <p className="mt-4 max-w-md text-sm text-green-brand/60">
                  PIEDS — BITS Pilani&apos;s official startup incubator. ICAR-NMRI — R&amp;D,
                  testing and flavouring on industry-grade meat science equipment.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="relative">
            <Image
              src="/brand/disco-chicken.jpg"
              alt="The Ultimate Chicken disco chicken"
              width={400}
              height={549}
              className="mx-auto w-full max-w-sm rounded-[2rem]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Waitlist ───────────────────────── */

function Waitlist() {
  return (
    <section id="waitlist" className="bg-lime-brand py-24 md:py-32">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 text-center md:px-8">
        <Reveal>
          <h2 className="shout text-7xl text-green-deep md:text-9xl">Get it first.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg font-medium text-green-deep/80">
            Launching at BITS Pilani, then Hyderabad. Join the waitlist — first drop goes to the
            list before anyone else.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 flex w-full justify-center">
          <WaitlistForm />
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── Page ───────────────────────── */

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Ticker />
      <HowItWorks />
      <MacroWall />
      <Flavours />
      <ProteinProblem />
      <DeepDives />
      <Story />
      <Waitlist />
      <Footer />
    </main>
  )
}
