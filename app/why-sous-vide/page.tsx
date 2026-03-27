'use client'

import Link from 'next/link'
import { useInView } from 'react-intersection-observer'

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D2B1E]/95 backdrop-blur-xl border-b border-white/10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-display font-black text-xl text-[#CBFF00] uppercase leading-none">
          ULTIMATE<br />CHICKEN™
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/microplastics" className="text-white/60 text-sm hover:text-white transition-colors hidden md:block">Our Promise</Link>
          <Link href="/#waitlist" className="btn-primary btn-lime text-sm px-5 py-2.5">Join Waitlist</Link>
        </div>
      </div>
    </nav>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  return (
    <div ref={ref} className={`${inView ? 'animate-[fadeUp_0.8s_ease_forwards]' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

export default function WhySousVide() {
  const steps = [
    {
      num: '01',
      title: 'Marinate',
      icon: '🌿',
      color: '#CBFF00',
      desc: 'Each chicken breast is hand-marinated in our proprietary flavor blends. No MSG. No artificial flavor enhancers. Just real spices, real ingredients, real flavor that actually penetrates the meat — not just coats the surface.',
      fact: 'Marination time: 12+ hours in our blend',
    },
    {
      num: '02',
      title: 'Vacuum Seal',
      icon: '🔒',
      color: '#00B5AD',
      desc: 'Every piece is sealed in our food-grade PP/PE/PA pouches. No BPA. No PVC. The vacuum creates a perfect environment for the sous vide process — no air, no oxidation, locked flavor.',
      fact: '8-10 microplastic particles vs 110,000+ in a plastic bottle',
    },
    {
      num: '03',
      title: 'Sous Vide at 63°C',
      icon: '🌡️',
      color: '#FF0055',
      desc: '63°C is the precise safe temperature for chicken — as mandated by food safety science. Traditional cooking overshoots this wildly, destroying moisture and nutrients. We\'re exact. The water bath maintains this temperature with ±0.1°C precision.',
      fact: 'FDA standard: 63°C+ for poultry. We hit it precisely.',
    },
    {
      num: '04',
      title: 'Ready to Eat',
      icon: '⚡',
      color: '#FF3D00',
      desc: 'No heating required. No cooling required. The pouch is shelf-stable for 30 days refrigerated, 12 months frozen. Open and eat. Straight from the wrapper. This is the future of protein convenience.',
      fact: '30 day shelf life (0-4°C) · 12 months frozen',
    },
  ]

  const benefits = [
    {
      title: 'Juicier Chicken, Every Time',
      desc: 'Traditional cooking methods dry out chicken because high heat forces moisture out. Sous vide keeps every drop of moisture inside the pouch. The result is chicken breast so juicy it barely resembles what you\'re used to.',
      icon: '💧',
    },
    {
      title: 'Maximum Nutrient Retention',
      desc: 'High-heat cooking destroys heat-sensitive vitamins and denatures proteins inefficiently. Low-temperature sous vide preserves more B vitamins, maintains protein quality, and keeps the nutritional profile intact.',
      icon: '🧬',
    },
    {
      title: 'Kills All Bacteria Safely',
      desc: '63°C for sufficient time is scientifically proven to kill Salmonella, E.coli, and all other common food pathogens. It\'s safer than traditional methods because the entire piece reaches the target temperature — not just the surface.',
      icon: '🦠',
    },
    {
      title: 'Consistent Results Every Batch',
      desc: 'There\'s no "good batch" and "bad batch" with sous vide. The physics don\'t change. 63°C water bath = perfectly cooked chicken. Every. Single. Time. That\'s why Michelin-starred restaurants use this exclusively.',
      icon: '📐',
    },
    {
      title: 'No Preservatives Needed',
      desc: 'The vacuum seal + precise cooking creates an environment where bacteria cannot survive or grow. No synthetic preservatives needed. No sodium benzoate, no sorbates, no nitrates. Clean label because the science handles preservation.',
      icon: '✅',
    },
    {
      title: 'Eat at Any Temperature',
      desc: 'Because sous vide chicken is already perfectly cooked, it doesn\'t need to be served hot. Cold, room temperature, or warm — the texture and flavor hold. Eat from the wrapper on your way to class.',
      icon: '🌡️',
    },
  ]

  return (
    <main className="bg-[#060606] min-h-screen">
      <Nav />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ background: 'linear-gradient(135deg, #0D2B1E 0%, #060606 60%, #0D2B1E 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-[#CBFF00]/5 via-transparent to-transparent" />
        <div className="relative z-10 text-center px-6 py-24 max-w-4xl mx-auto">
          <span className="pill-badge mb-8 inline-flex">The Process</span>
          <h1 className="section-title text-white" style={{ fontSize: 'clamp(56px, 10vw, 140px)' }}>
            WHY<br />
            <span className="text-[#CBFF00]">SOUS VIDE?</span>
          </h1>
          <p className="text-white/60 text-xl md:text-2xl mt-8 max-w-2xl mx-auto leading-relaxed">
            It&apos;s the same technique in Michelin-starred restaurants worldwide.
            And it&apos;s the only cooking method good enough for Ultimate Chicken.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-[#CBFF00] font-display font-black text-3xl">63°C</div>
              <div className="text-white/50 text-xs uppercase tracking-wider mt-1">Precise Temperature</div>
            </div>
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-[#CBFF00] font-display font-black text-3xl">0</div>
              <div className="text-white/50 text-xs uppercase tracking-wider mt-1">Preservatives</div>
            </div>
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-[#CBFF00] font-display font-black text-3xl">27g</div>
              <div className="text-white/50 text-xs uppercase tracking-wider mt-1">Protein Retained</div>
            </div>
          </div>
        </div>
      </section>

      {/* What Is Sous Vide */}
      <section className="py-24 md:py-36 px-6 bg-[#0D2B1E]">
        <div className="max-w-5xl mx-auto">
          <Section>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="pill-badge mb-6 inline-flex">What Is Sous Vide?</span>
                <h2 className="section-title text-white" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
                  FRENCH FOR<br />
                  <span className="text-[#CBFF00]">"UNDER VACUUM"</span>
                </h2>
                <div className="space-y-4 mt-8 text-white/60 leading-relaxed">
                  <p>
                    Sous vide was invented in France in the 1970s by chef Georges Pralus and food scientist Bruno Goussault.
                    They discovered that cooking food in a vacuum-sealed bag, submerged in precisely temperature-controlled water,
                    produced results no other method could match.
                  </p>
                  <p>
                    The technique was adopted by the world&apos;s greatest restaurants. Thomas Keller, Heston Blumenthal,
                    Joël Robuchon — every chef at the pinnacle of the industry cooks this way.
                  </p>
                  <p>
                    We brought it to ready-to-eat protein. First time in India.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'Does it kill bacteria?', a: 'Yes. 63°C for sufficient time kills Salmonella, E.coli, Listeria, and all common pathogens. It\'s scientifically validated — this is why the FDA sets 63°C as the minimum for poultry.' },
                  { q: 'Why no preservatives?', a: 'The vacuum + precise heat creates an anaerobic environment where spoilage bacteria cannot thrive. The science replaces the chemicals.' },
                  { q: 'Why eat at room temp?', a: 'Unlike traditionally cooked chicken that dries out when cold, sous vide chicken retains its moisture and texture at any temperature. Eat it whenever.' },
                ].map((faq) => (
                  <div key={faq.q} className="glass-card p-5">
                    <div className="text-[#CBFF00] font-bold text-sm mb-2">{faq.q}</div>
                    <div className="text-white/60 text-sm leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 md:py-36 px-6 bg-[#060606]">
        <div className="max-w-5xl mx-auto">
          <Section>
            <span className="pill-badge mb-6 inline-flex">The Process</span>
            <h2 className="section-title text-white mb-16" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              STEP BY STEP,<br />
              <span className="text-[#CBFF00]">NO SHORTCUTS.</span>
            </h2>
          </Section>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <Section key={step.num}>
                <div className="group border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all hover:bg-white/2">
                  <div className="flex items-start gap-6">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-lg"
                      style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, color: step.color }}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{step.icon}</span>
                        <h3 className="text-white font-display font-bold text-2xl">{step.title}</h3>
                      </div>
                      <p className="text-white/60 leading-relaxed">{step.desc}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {step.fact}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-36 px-6 bg-[#0D2B1E]">
        <div className="max-w-6xl mx-auto">
          <Section>
            <span className="pill-badge mb-6 inline-flex">Why It Matters</span>
            <h2 className="section-title text-white mb-16" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              SIX REASONS<br />
              <span className="text-[#CBFF00]">IT&apos;S BETTER.</span>
            </h2>
          </Section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <Section key={b.title}>
                <div className="glass-card p-7 h-full hover-lift">
                  <div className="text-4xl mb-4">{b.icon}</div>
                  <h3 className="text-white font-display font-bold text-xl mb-3">{b.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* vs Traditional */}
      <section className="py-24 px-6 bg-[#060606]">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="section-title text-white text-center mb-12" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
              SOUS VIDE vs THE REST
            </h2>
          </Section>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-white/40 text-xs uppercase tracking-wider">Factor</th>
                  <th className="py-4 px-4 text-center text-[#CBFF00] font-bold text-sm">Sous Vide ✓</th>
                  <th className="py-4 px-4 text-center text-white/40 text-sm">Pan Fry</th>
                  <th className="py-4 px-4 text-center text-white/40 text-sm">Oven / Grill</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Temperature Control', '±0.1°C precision', 'Uncontrolled', 'Uneven'],
                  ['Moisture Retention', '★★★★★', '★★', '★★★'],
                  ['Nutrient Retention', '★★★★★', '★★★', '★★★'],
                  ['Consistency', 'Every batch identical', 'Variable', 'Variable'],
                  ['Bacteria Elimination', '100% (scientifically validated)', '~95%', '~95%'],
                  ['Ready to Eat (cold)?', 'Yes, perfect', 'No', 'No'],
                  ['Preservatives Needed?', 'Zero', 'Depends on storage', 'Depends on storage'],
                ].map(([factor, sv, pan, oven]) => (
                  <tr key={factor} className="border-t border-white/5">
                    <td className="py-4 px-4 text-white/60 text-sm">{factor}</td>
                    <td className="py-4 px-4 text-center bg-[#CBFF00]/5 text-[#CBFF00] font-semibold text-sm">{sv}</td>
                    <td className="py-4 px-4 text-center text-white/30 text-sm">{pan}</td>
                    <td className="py-4 px-4 text-center text-white/30 text-sm">{oven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #CBFF00 0%, #9FCC00 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title text-[#0D2B1E] mb-6" style={{ fontSize: 'clamp(40px, 7vw, 96px)' }}>
            TASTE THE<br />DIFFERENCE.
          </h2>
          <p className="text-[#0D2B1E]/60 text-lg mb-10">
            Launching at BITS Pilani first. Join the waitlist to be among the first.
          </p>
          <Link href="/#waitlist" className="btn-primary">
            Join Waitlist — BITS Pilani 🔥
          </Link>
        </div>
      </section>
    </main>
  )
}
