'use client'

import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import OrderButton from '@/components/OrderButton'
import CinematicHero from '@/components/CinematicHero'
import AddToCart from '@/components/AddToCart'
import CheckoutCTA from '@/components/CheckoutCTA'
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
    <div className="overflow-hidden bg-lime-brand py-3.5">
      <div
        className="flex w-max items-center gap-8 whitespace-nowrap"
        style={{ animation: 'ticker-scroll 30s linear infinite' }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="shout text-2xl text-green-deep">{t}</span>
            <span className="text-green-deep/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Meet the pouch (real product) ───────────────────────── */

function MeetThePack() {
  return (
    <section id="flavours" className="scroll-mt-24 bg-cream py-24 text-green-deep md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="section-label text-green-deep">The product</p>
          <h2 className="shout has-hl mt-3 max-w-3xl text-6xl md:text-8xl">
            This is what <span className="hl">lands</span>.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-green-deep/65">
            Fully cooked, ready to eat, and packed with 27g of protein. No cooking, no
            preservatives, no nonsense.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
          {FLAVOURS.map((f, i) => (
            <Reveal key={f.slug} delay={i * 0.1}>
              <div className="group flex h-full flex-col">
                <Link
                  href={`/flavours/${f.slug}`}
                  className="relative block overflow-hidden rounded-[2rem] border border-white/10 bg-[#07140E]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{ background: `radial-gradient(circle at 50% 45%, ${f.glow}33, transparent 60%)` }}
                  />
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={f.pouch}
                      alt={`Ultimate Chicken ${f.name} retail pouch`}
                      fill
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <h3 className="shout text-4xl" style={{ color: f.primary }}>
                      {f.name}
                    </h3>
                    <p className="mt-1 text-sm text-green-deep/55">
                      {f.protein}g protein · {f.calories} cal · 0 preservatives
                    </p>
                  </div>
                  <p className="stat-num shrink-0 text-3xl text-green-deep">₹{f.price}</p>
                </div>
                <AddToCart flavour={f} />
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-col items-center gap-3">
            <CheckoutCTA />
            <p className="text-sm text-green-deep/50">Pick your flavours · secure checkout via Razorpay</p>
          </div>
        </Reveal>
      </div>
    </section>
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
    <section className="bg-green-brand py-24 text-cream md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="section-label text-lime-brand !opacity-90">How it works</p>
          <h2 className="shout has-hl mt-3 max-w-3xl text-6xl md:text-8xl">
            No cooking. No fuss. <span className="hl">No prep.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div className="group h-full rounded-3xl border border-green-deep/10 bg-white p-8 text-green-deep shadow-sm transition-colors hover:border-green-deep/40">
                <div className="flex items-start justify-between text-green-deep">
                  {s.icon}
                  <span className="stat-num text-5xl text-green-deep/15 transition-colors group-hover:text-green-deep/40">
                    {s.num}
                  </span>
                </div>
                <h3 className="shout-upright mt-8 text-4xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-green-deep/65">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Macro wall ───────────────────────── */

function MacroWall() {
  const stats = [
    ['27g', 'protein per pouch', 'More than four eggs. From actual chicken, not powder.'],
    ['0', 'preservatives & additives', 'The sous vide process does the preserving. Nothing else needed.'],
    ['63°C', 'slow-cooked for 90 minutes', 'Michelin-kitchen technique. Pasteurised, tender, never dry.'],
    ['14', 'days in your fridge', 'And 12 months in the freezer. Stock up once, eat all month.'],
  ]
  return (
    <section className="bg-cream py-24 text-green-deep md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <span className="tag-slab tag-slab--lime text-base md:text-lg">
            <span>Real food. Real protein.</span>
          </span>
          <h2 className="shout has-hl mt-5 max-w-4xl text-6xl md:text-8xl">
            Not a bar. Not a shake. <span className="hl">Actual chicken.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {stats.map(([num, label, body], i) => (
            <Reveal key={label} delay={i * 0.08}>
              <div className="border-t border-green-deep/15 pt-6">
                <p className="stat-num text-8xl text-green-deep md:text-9xl">{num}</p>
                <p className="shout-upright mt-3 text-3xl">{label}</p>
                <p className="mt-2 max-w-md text-green-deep/60">{body}</p>
              </div>
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
    { label: 'One bowl of dal', grams: 6, color: '#0C241926' },
    { label: '100g paneer', grams: 18, color: '#0C241966' },
    { label: 'One UC pouch', grams: 27, color: '#234539' },
  ]
  return (
    <section className="bg-cream py-24 text-green-deep md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <Reveal>
            <p className="section-label text-green-deep">Why this exists</p>
            <h2 className="shout mt-3 text-6xl md:text-8xl">
              80% of Indians are protein deficient.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-green-deep/65">
              We&apos;re locked in a carb trap — 60–70% of daily calories come purely from
              carbohydrates. The &quot;convenient&quot; fixes are ultra-processed bars and powders.
              Real food got engineered out of the equation. We&apos;re putting it back.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-6 rounded-3xl border border-green-deep/10 bg-white p-8 shadow-sm">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-condensed text-xl font-bold uppercase text-green-deep">
                      {b.label}
                    </span>
                    <span className="stat-num text-3xl text-green-deep">{b.grams}g</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-green-deep/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(b.grams / 27) * 100}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-green-deep/45">
                Sources: IMRB, PDCAAS nutritional scoring, ICMR dietary guidelines.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Deep dives ───────────────────────── */

function DeepDives() {
  return (
    <section className="bg-green-brand py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <Link
            href="/why-sous-vide"
            className="group flex h-full flex-col justify-between rounded-[2rem] bg-lime-brand p-9 text-green-deep transition-transform hover:-translate-y-1"
          >
            <div>
              <p className="section-label text-green-deep">The technique</p>
              <h3 className="shout mt-3 text-5xl md:text-6xl">Why sous vide is the whole trick</h3>
              <p className="mt-4 max-w-md text-green-deep/70">
                Vacuum-sealed, slow-cooked at exactly 63°C for 90 minutes. It&apos;s how
                Michelin-starred kitchens cook chicken — and it&apos;s why ours needs no
                preservatives and never tastes dry.
              </p>
            </div>
            <span className="btn-outline mt-8 w-fit !border-green-deep !bg-green-deep !text-lime-brand transition-transform group-hover:scale-[1.03]">
              Read the science →
            </span>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/microplastics"
            className="group flex h-full flex-col justify-between rounded-[2rem] border border-green-deep/10 bg-white p-9 text-green-deep shadow-sm transition-transform hover:-translate-y-1"
          >
            <div>
              <p className="section-label text-green-deep">Full transparency</p>
              <h3 className="shout mt-3 text-5xl md:text-6xl">The microplastics question. Answered.</h3>
              <p className="mt-4 max-w-md text-green-deep/70">
                Yes, the pouch is plastic. Here&apos;s the data: ~8–10 particles per serving. Table
                salt carries up to 5,500. Bottled water, up to 370,000. See exactly what our
                packaging is — and isn&apos;t.
              </p>
            </div>
            <span className="btn-outline mt-8 w-fit !border-green-deep text-green-deep group-hover:bg-green-deep group-hover:text-lime-brand">
              See the numbers →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── Story ───────────────────────── */

function Story() {
  return (
    <section id="story" className="overflow-hidden bg-cream py-24 text-green-deep md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <p className="section-label text-green-deep">The story</p>
              <h2 className="shout mt-3 text-6xl md:text-8xl">
                Built by two sophomores. From a rented kitchen in Pilani.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-green-deep/70">
                We&apos;re second-year BITS Pilani students who got tired of choosing between
                protein powder and 45 minutes of cooking. So we rented a kitchen two minutes from
                campus, learned sous vide, and started feeding BITS. That&apos;s not a weakness —
                it&apos;s the whole story.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-10">
                <p className="section-label mb-5 text-green-deep/50">Incubated by</p>
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
                <p className="mt-4 max-w-md text-sm text-green-deep/60">
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

/* ───────────────────────── Order CTA ───────────────────────── */

function OrderCTA() {
  return (
    <section id="order" className="bg-lime-brand py-24 md:py-32">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 text-center md:px-8">
        <Reveal>
          <h2 className="shout text-7xl text-green-deep md:text-9xl">Hungry? Order now.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg font-medium text-green-deep/80">
            Ready-to-eat, delivered fresh. Pick your flavours and check out in seconds — secure
            payment by Razorpay.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 flex w-full justify-center">
          <OrderButton className="btn-outline !border-green-deep !px-10 !py-4 !text-xl text-green-deep hover:!bg-green-deep hover:!text-lime-brand" />
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── Subscribe promo ───────────────────────── */

function SubscribePromo() {
  return (
    <section className="bg-lime-brand py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 md:grid-cols-[1.4fr_1fr] md:px-8">
        <Reveal>
          <p className="section-label text-green-deep/60">Never run out</p>
          <h2 className="shout mt-3 text-6xl text-green-deep md:text-8xl">
            Subscribe &amp; save <span className="bg-green-deep px-2 text-lime-brand">10%</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg font-medium text-green-deep/80">
            Fresh sous-vide chicken every week, on autopilot. Pick how many pouches, your flavour mix, your day &amp; time slot — flat 10% off, free shipping, cancel anytime.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="md:justify-self-end">
          <Link
            href="/subscribe"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-deep px-12 py-6 font-condensed text-2xl font-extrabold uppercase italic tracking-wide text-lime-brand transition-transform hover:scale-[1.03] md:text-3xl"
          >
            Start a subscription →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── Page ───────────────────────── */

export default function Home() {
  return (
    <main className="bg-cream">
      <Nav dark />
      <CinematicHero />
      <Ticker />
      <MeetThePack />
      <SubscribePromo />
      <HowItWorks />
      <MacroWall />
      <ProteinProblem />
      <DeepDives />
      <Story />
      <OrderCTA />
      <Footer />
    </main>
  )
}
