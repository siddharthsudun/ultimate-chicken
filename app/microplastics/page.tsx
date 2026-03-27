'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060606]/95 backdrop-blur-xl border-b border-white/10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-display font-black text-xl text-[#CBFF00] uppercase leading-none">
          ULTIMATE<br />CHICKEN™
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/why-sous-vide" className="text-white/60 text-sm hover:text-white transition-colors hidden md:block">Why Sous Vide</Link>
          <Link href="/#waitlist" className="btn-primary btn-lime text-sm px-5 py-2.5">Join Waitlist</Link>
        </div>
      </div>
    </nav>
  )
}

function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  const pct = Math.max(1, (value / max) * 100)

  return (
    <div ref={ref} className="h-full relative">
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all"
        style={{
          height: inView ? `${pct}%` : '2%',
          background: color,
          transitionDuration: '1.5s',
          transitionDelay: `${delay}s`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })
  return (
    <div ref={ref} className={`${inView ? 'animate-[fadeUp_0.8s_ease_forwards]' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

const comparisonData = [
  {
    label: 'Ultimate Chicken™',
    range: '8–10',
    value: 9,
    max: 370000,
    color: '#CBFF00',
    bgColor: 'rgba(203,255,0,0.08)',
    borderColor: 'rgba(203,255,0,0.3)',
    isUs: true,
    note: 'PP/PE/PA, No BPA, No PVC',
    barHeight: 0.5,
  },
  {
    label: 'Table Salt',
    range: '150–5,500',
    value: 2825,
    max: 370000,
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.05)',
    borderColor: 'rgba(255,215,0,0.15)',
    note: 'Varies by brand & processing method',
    barHeight: 8,
  },
  {
    label: 'Packaged Protein Powder',
    range: '5,000–50,000',
    value: 27500,
    max: 370000,
    color: '#FF8C00',
    bgColor: 'rgba(255,140,0,0.05)',
    borderColor: 'rgba(255,140,0,0.15)',
    note: 'Primarily from packaging material contact',
    barHeight: 55,
  },
  {
    label: 'Plastic Water Bottle',
    range: '110,000–370,000',
    value: 240000,
    max: 370000,
    color: '#FF0055',
    bgColor: 'rgba(255,0,85,0.05)',
    borderColor: 'rgba(255,0,85,0.15)',
    note: 'PET/HDPE bottles, especially when heated',
    barHeight: 100,
  },
]

export default function MicroplasticsPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const packagingFacts = [
    {
      title: 'PP — Polypropylene',
      desc: 'Used in our outer layer. One of the most inert food-safe plastics. High melting point means minimal leaching even at elevated temperatures. Used in medical devices and food containers for decades.',
      icon: '🔵',
      safety: 'Very Low Risk',
    },
    {
      title: 'PE — Polyethylene',
      desc: 'Inner sealant layer. Extremely stable at food temperatures. Zero known endocrine-disrupting properties. FDA and European Food Safety Authority approved for direct food contact.',
      icon: '🟢',
      safety: 'Very Low Risk',
    },
    {
      title: 'PA — Polyamide (Nylon)',
      desc: 'Middle barrier layer. Provides oxygen and moisture barrier protection. Food-safe grade. Widely used in sous vide pouches globally, specifically because of its barrier properties and safety profile.',
      icon: '🟡',
      safety: 'Low Risk',
    },
    {
      title: 'BPA — NOT in Our Packaging',
      desc: 'Bisphenol A is a known endocrine disruptor linked to hormonal disruption. Found in polycarbonate plastics and some epoxy resins. Our packaging contains zero BPA.',
      icon: '🔴',
      safety: 'EXCLUDED',
    },
    {
      title: 'PVC — NOT in Our Packaging',
      desc: 'Polyvinyl chloride can leach phthalates and other plasticizers at elevated temperatures. Common in cheap food packaging. We use none of it.',
      icon: '🔴',
      safety: 'EXCLUDED',
    },
  ]

  const testingFacts = [
    { icon: '🔬', title: 'Eurofins Tested', desc: 'Eurofins Scientific is one of the world\'s leading laboratory networks with 6,600+ locations. Every batch of Ultimate Chicken is tested by them — not by us.' },
    { icon: '📋', title: 'FSSAI Certified', desc: 'Food Safety and Standards Authority of India. Our facility is certified, our processes are documented, and our product meets all FSSAI requirements for RTE chicken.' },
    { icon: '🏥', title: 'Third-Party Verified', desc: 'We don\'t self-certify. Any food brand can print "clean" on a label. We have laboratory receipts. We publish the numbers publicly. That\'s the difference.' },
    { icon: '⚡', title: 'Zero Preservatives', desc: 'Sodium benzoate, potassium sorbate, sodium nitrate — none of them are in Ultimate Chicken. The sous vide process and vacuum seal handles preservation without any synthetic additives.' },
  ]

  return (
    <main className="bg-[#060606] min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 px-6">
        <div className="absolute inset-0 bg-gradient-radial from-[#CBFF00]/5 via-transparent to-transparent" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(203,255,0,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center py-24 max-w-4xl mx-auto">
          <span className="pill-badge mb-8 inline-flex">Full Transparency</span>

          <h1 className="section-title text-white" style={{ fontSize: 'clamp(48px, 10vw, 130px)' }}>
            WE COUNTED<br />
            <span className="text-[#CBFF00]">EVERY</span><br />
            MICROPLASTIC.
          </h1>

          <p className="text-white/60 text-xl mt-8 max-w-2xl mx-auto leading-relaxed">
            The food industry doesn&apos;t talk about microplastics. We put them on the homepage.
            Because real food comes with real transparency.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-14">
            <div className="text-center">
              <div className="font-display font-black text-5xl text-[#CBFF00]">8–10</div>
              <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Particles in our product</div>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="text-center">
              <div className="font-display font-black text-5xl text-[#FF0055]">110K–370K</div>
              <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Particles in a water bottle</div>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="text-center">
              <div className="font-display font-black text-5xl text-white">0</div>
              <div className="text-white/40 text-xs uppercase tracking-wider mt-1">BPA or PVC in packaging</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 md:py-36 px-6 bg-[#0D2B1E]">
        <div className="max-w-5xl mx-auto">
          <Section>
            <span className="pill-badge mb-6 inline-flex">The Comparison</span>
            <h2 className="section-title text-white mb-4" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              MICROPLASTICS<br />
              <span className="text-[#CBFF00]">PER SERVING</span>
            </h2>
            <p className="text-white/50 max-w-xl mb-16 leading-relaxed">
              These numbers are from peer-reviewed research on microplastic contamination in common food and beverage products.
              Our figures are from Eurofins third-party testing.
            </p>
          </Section>

          {/* Bar chart */}
          <div className="relative">
            {/* Y-axis grid */}
            <div className="absolute left-0 right-0 top-0 bottom-16 flex flex-col justify-between pointer-events-none">
              {['370K', '277K', '185K', '92K', '0'].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-white/20 text-xs w-12 text-right">{label}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="grid grid-cols-4 gap-4 pl-16 pb-16 h-80">
              {comparisonData.map((d, i) => (
                <div key={d.label} className="relative flex flex-col">
                  <div className="flex-1 relative cursor-pointer" onClick={() => setActiveIndex(activeIndex === i ? null : i)}>
                    <AnimatedBar
                      value={d.value}
                      max={370000}
                      color={d.color}
                      delay={i * 0.2}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center -mb-14">
                    <div className="text-xs text-white/50 font-medium leading-tight">{d.label.replace('™', '')}</div>
                    <div className="font-display font-black text-sm mt-0.5" style={{ color: d.color }}>
                      {d.range}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-24">
            {comparisonData.map((d, i) => (
              <Section key={d.label}>
                <div
                  className="rounded-2xl p-5 border transition-all hover-lift"
                  style={{ background: d.bgColor, borderColor: d.borderColor }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {d.isUs && <span className="bg-[#CBFF00] text-[#0D2B1E] text-xs font-black px-2 py-0.5 rounded-full uppercase">That&apos;s Us</span>}
                        <h3 className="font-bold text-white">{d.label}</h3>
                      </div>
                      <p className="text-white/40 text-xs">{d.note}</p>
                    </div>
                    <div className="font-display font-black text-2xl" style={{ color: d.color }}>{d.range}</div>
                  </div>
                </div>
              </Section>
            ))}
          </div>

          <Section>
            <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/40 text-xs leading-relaxed">
                <strong className="text-white/60">Sources:</strong> Cox et al. (2019) &ldquo;Human Consumption of Microplastics&rdquo;, Environmental Science & Technology.
                Kosuth et al. (2018) &ldquo;Anthropogenic contamination of tap water, beer, and sea salt&rdquo;, PLOS ONE.
                Ultimate Chicken data from Eurofins Scientific third-party testing, March 2026.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Our Packaging */}
      <section className="py-24 md:py-36 px-6 bg-[#060606]">
        <div className="max-w-5xl mx-auto">
          <Section>
            <span className="pill-badge mb-6 inline-flex">Our Packaging</span>
            <h2 className="section-title text-white mb-4" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              WHAT&apos;S IN OUR<br />
              <span className="text-[#CBFF00]">POUCH.</span><br />
              <span className="text-white/30 text-[0.5em]">AND WHAT ISN&apos;T.</span>
            </h2>
            <p className="text-white/50 mb-16 max-w-xl leading-relaxed">
              We chose PP/PE/PA packaging specifically for its food safety profile and low microplastic leach rates.
              Here&apos;s the science behind each layer:
            </p>
          </Section>

          <div className="space-y-4">
            {packagingFacts.map((p) => (
              <Section key={p.title}>
                <div className="border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{p.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg">{p.title}</h3>
                        <span
                          className="text-xs font-bold px-3 py-0.5 rounded-full"
                          style={{
                            background: p.safety === 'EXCLUDED' ? 'rgba(255,0,85,0.15)' : 'rgba(203,255,0,0.1)',
                            color: p.safety === 'EXCLUDED' ? '#FF0055' : '#CBFF00',
                            border: `1px solid ${p.safety === 'EXCLUDED' ? 'rgba(255,0,85,0.3)' : 'rgba(203,255,0,0.25)'}`,
                          }}
                        >
                          {p.safety}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Testing */}
      <section className="py-24 md:py-36 px-6 bg-[#0D2B1E]">
        <div className="max-w-6xl mx-auto">
          <Section>
            <span className="pill-badge mb-6 inline-flex">Third-Party Verified</span>
            <h2 className="section-title text-white mb-16" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              WE DON&apos;T SELF-CERTIFY.<br />
              <span className="text-[#CBFF00]">WE SHOW RECEIPTS.</span>
            </h2>
          </Section>
          <div className="grid md:grid-cols-2 gap-5">
            {testingFacts.map((f) => (
              <Section key={f.title}>
                <div className="glass-card p-7 hover-lift">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-white font-display font-bold text-xl mb-3">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-24 px-6 bg-[#060606]">
        <div className="max-w-3xl mx-auto text-center">
          <Section>
            <h2 className="section-title text-white mb-6" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              WHY THIS MATTERS<br />
              <span className="text-[#CBFF00]">TO US.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              We&apos;re building a food brand for a generation that reads labels, questions ingredients,
              and demands honesty. If we can&apos;t look our customers in the eye and tell them exactly
              what&apos;s in their food and their packaging, we shouldn&apos;t be making food.
            </p>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              The microplastics conversation is uncomfortable for the food industry. We&apos;re having it anyway.
              Because the alternative — silently putting thousands of plastic particles into the food of
              people who trust us — is not something we&apos;re willing to do.
            </p>
            <p className="text-[#CBFF00] font-display font-bold text-2xl italic">
              Real food. Real protein. Real transparency.
            </p>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #CBFF00 0%, #9FCC00 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title text-[#0D2B1E] mb-6" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>
            CLEAN FOOD.<br />FINALLY.
          </h2>
          <p className="text-[#0D2B1E]/60 text-lg mb-10">
            Launching at BITS Pilani. Zero BS. Zero compromise. Real protein.
          </p>
          <Link href="/#waitlist" className="btn-primary">
            Join Waitlist 🔥
          </Link>
        </div>
      </section>
    </main>
  )
}
