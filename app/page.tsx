'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'

const PouchScene = dynamic(() => import('@/components/PouchScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
})

const flavors = [
  {
    id: 'korean-bbq',
    name: 'Korean BBQ',
    tagline: 'Sticky. Smoky. Addictive.',
    description: 'Bold gochujang glaze on sous vide chicken breast. Every bite is the same jaw-dropping tenderness.',
    bgFrom: '#FF0055',
    bgTo: '#8B0030',
    accentColor: '#FFD700',
    textColor: '#FFFFFF',
    badge: 'Most Hyped',
    badgeBg: '#FFD700',
    badgeText: '#0D2B1E',
    pouchBg: ['#CC0000', '#FF3D3D', '#FFD700'],
    macros: { protein: 27, calories: 150, fat: 3, carbs: 4 },
  },
  {
    id: 'spicy-peri-peri',
    name: 'Spicy Peri Peri',
    tagline: 'Heat. Depth. Glory.',
    description: 'African bird\'s eye chili meets Portuguese piri piri. Lean chicken that hits harder than your pre-workout.',
    bgFrom: '#FF3D00',
    bgTo: '#7A1D00',
    accentColor: '#FFB347',
    textColor: '#FFFFFF',
    badge: 'Most Spicy',
    badgeBg: '#FF3D00',
    badgeText: '#FFFFFF',
    pouchBg: ['#FF3D00', '#CC2000', '#FFB347'],
    macros: { protein: 27, calories: 150, fat: 3, carbs: 3 },
  },
  {
    id: 'lemon-herb',
    name: 'Lemon Herb',
    tagline: 'Clean. Fresh. Elite.',
    description: 'Mediterranean lemon zest with rosemary and thyme. The cleanest macro profile on a campus meal plan.',
    bgFrom: '#00B5AD',
    bgTo: '#004D4A',
    accentColor: '#CBFF00',
    textColor: '#FFFFFF',
    badge: 'Cleanest Macros',
    badgeBg: '#CBFF00',
    badgeText: '#0D2B1E',
    pouchBg: ['#00B5AD', '#007A75', '#CBFF00'],
    macros: { protein: 27, calories: 150, fat: 2.5, carbs: 2 },
  },
]

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayed(value)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return <span ref={ref}>{displayed}{suffix}</span>
}

function StatsBar() {
  const stats = [
    { label: 'Protein', value: 27, suffix: 'g', sub: 'per serving' },
    { label: 'Calories', value: 150, suffix: '', sub: 'only 150' },
    { label: 'Additives', value: 0, suffix: '', sub: 'Zero. None.' },
    { label: 'Shelf Life', value: 30, suffix: ' Days', sub: 'refrigerated' },
  ]
  return (
    <section className="bg-[#0D2B1E] py-16 px-6 relative overflow-hidden">
      <div className="stripe-overlay" />
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-[#CBFF00] stat-number">
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mt-1">{s.sub}</div>
            <div className="text-white/80 text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Ticker() {
  const text = '27G PROTEIN · 150 CALORIES · ZERO OIL · ZERO PRESERVATIVES · SOUS VIDE COOKED · READY TO EAT · BPA FREE · FSSAI CERTIFIED · EUROFINS TESTED · 100% NATURAL CHICKEN · '
  return (
    <div className="bg-[#CBFF00] py-3 overflow-hidden border-y-2 border-[#0D2B1E]">
      <div className="ticker-content text-[#0D2B1E] font-display font-black text-sm tracking-widest uppercase">
        {text.repeat(6)}
      </div>
    </div>
  )
}

function FlavorCard({ flavor, index }: { flavor: typeof flavors[0]; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section
      id={flavor.id}
      ref={ref}
      className="flavor-section relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${flavor.bgFrom} 0%, ${flavor.bgTo} 100%)` }}
    >
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Big background number */}
      <div
        className="absolute top-1/2 -translate-y-1/2 font-display font-black text-[40vw] leading-none select-none pointer-events-none opacity-[0.06]"
        style={{ color: flavor.textColor, right: '-5vw' }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center w-full">
          {/* Text side */}
          <div className={`${inView ? 'animate-[fadeUp_0.9s_ease_forwards]' : 'opacity-0'} ${index % 2 === 1 ? 'md:order-2' : ''}`}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8"
              style={{ background: flavor.badgeBg, color: flavor.badgeText }}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {flavor.badge}
            </div>

            {/* Flavor name */}
            <h2 className="section-title text-white" style={{ fontSize: 'clamp(52px, 8vw, 110px)', lineHeight: 0.88 }}>
              {flavor.name.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>

            {/* Tagline */}
            <p className="text-white/70 font-display font-bold text-2xl md:text-3xl mt-6 italic">
              {flavor.tagline}
            </p>

            {/* Description */}
            <p className="text-white/60 text-base md:text-lg mt-4 leading-relaxed max-w-md">
              {flavor.description}
            </p>

            {/* Macros */}
            <div className="flex gap-4 mt-10 flex-wrap">
              {[
                { label: 'Protein', val: `${flavor.macros.protein}g` },
                { label: 'Calories', val: `${flavor.macros.calories}` },
                { label: 'Fat', val: `${flavor.macros.fat}g` },
                { label: 'Carbs', val: `${flavor.macros.carbs}g` },
              ].map((m) => (
                <div key={m.label} className="glass-card px-5 py-4 text-center min-w-[90px]">
                  <div className="text-white font-display font-black text-2xl">{m.val}</div>
                  <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a href="#waitlist" className="btn-primary mt-10 inline-flex" style={{ background: flavor.accentColor, color: flavor.accentColor === '#CBFF00' || flavor.accentColor === '#FFD700' ? '#0D2B1E' : '#FFFFFF' }}>
              Join Waitlist — Coming to BITS
              <span>→</span>
            </a>
          </div>

          {/* 3D Pouch side */}
          <div className={`flex items-center justify-center h-[60vh] md:h-[80vh] ${index % 2 === 1 ? 'md:order-1' : ''} ${inView ? 'animate-[scaleIn_1s_ease_forwards]' : 'opacity-0'}`}>
            <PouchScene flavorIndex={index} isolated />
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D2B1E]/40 to-transparent pointer-events-none" />
    </section>
  )
}

function WhyRealFood() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const comparisons = [
    { name: 'Whey Protein', pro: 'High protein', con: 'Ultra-processed, synthetic, chalky', icon: '🥤' },
    { name: 'Protein Bars', pro: 'Convenient', con: 'High sugar, artificial fillers, terrible macros', icon: '🍫' },
    { name: 'Raw Chicken', pro: 'Natural', con: '45+ min to cook & clean. Zero convenience.', icon: '🍗' },
    { name: 'Ultimate Chicken™', pro: 'Everything', con: 'Nothing. Literally nothing.', icon: '✅', isUs: true },
  ]

  return (
    <section ref={ref} className="bg-[#0D2B1E] py-24 md:py-36 px-6 relative overflow-hidden">
      <div className="stripe-overlay" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`mb-16 ${inView ? 'animate-[fadeUp_0.8s_ease_forwards]' : 'opacity-0'}`}>
          <span className="pill-badge mb-6 inline-flex">The Problem</span>
          <h2 className="section-title text-white" style={{ fontSize: 'clamp(44px, 7vw, 96px)' }}>
            THE $1B PROTEIN<br />
            <span className="text-[#CBFF00]">MARKET IS BUILT</span><br />
            ON A COMPROMISE.
          </h2>
          <p className="text-white/50 text-lg mt-6 max-w-xl">
            80% of Indians are protein deficient. The supplement industry convinced us that real food is inconvenient. We disagree.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 ${inView ? 'animate-[fadeIn_1s_0.3s_ease_forwards]' : 'opacity-0'}`}>
          {comparisons.map((c) => (
            <div
              key={c.name}
              className={`rounded-3xl p-6 hover-lift relative ${c.isUs ? 'border-2 border-[#CBFF00]' : 'border border-white/10'}`}
              style={{ background: c.isUs ? 'rgba(203,255,0,0.08)' : 'rgba(255,255,255,0.04)' }}
            >
              {c.isUs && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CBFF00] text-[#0D2B1E] text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full">
                  That&apos;s Us
                </div>
              )}
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className={`font-display font-bold text-xl ${c.isUs ? 'text-[#CBFF00]' : 'text-white'}`}>{c.name}</h3>
              <p className="text-green-400 text-sm mt-2">✓ {c.pro}</p>
              <p className={`text-sm mt-1 ${c.isUs ? 'text-white/40 line-through' : 'text-red-400'}`}>✗ {c.con}</p>
            </div>
          ))}
        </div>

        {/* 80% stat */}
        <div className={`mt-20 grid md:grid-cols-3 gap-8 ${inView ? 'animate-[fadeUp_0.8s_0.4s_ease_forwards]' : 'opacity-0'}`}>
          {[
            { num: '80%', label: 'Of Indians are protein deficient', sub: 'Source: IMRB, PDCAAS Nutritional Scoring' },
            { num: '₹4.6B', label: 'Protein market size today', sub: 'Growing to ₹14.3B by 2032' },
            { num: '0', label: 'Direct sous vide RTE competitors', sub: 'Category creation opportunity' },
          ].map((s) => (
            <div key={s.num} className="border-l-2 border-[#CBFF00] pl-6">
              <div className="text-[#CBFF00] font-display font-black text-5xl md:text-6xl">{s.num}</div>
              <div className="text-white font-semibold text-lg mt-2">{s.label}</div>
              <div className="text-white/40 text-sm mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const steps = [
    { step: '01', title: 'Marinate', desc: 'Hand-marinated chicken breast with our proprietary flavor profiles. No MSG, no shortcuts.', emoji: '🌿' },
    { step: '02', title: 'Vacuum Seal', desc: 'Sealed in BPA-free, food-grade PP/PE/PA pouches. Locks in flavor before cooking begins.', emoji: '🔒' },
    { step: '03', title: 'Sous Vide', desc: '63°C water bath. Precise to the degree. Kills all bacteria. Preserves every nutrient. Michelin-star technique.', emoji: '🌡️' },
    { step: '04', title: 'Ready', desc: 'Eat straight from the wrapper. No heating, no mess, no time wasted. Just perfect chicken.', emoji: '⚡' },
  ]

  return (
    <section ref={ref} className="bg-[#0D2B1E] py-24 md:py-36 px-6 relative overflow-hidden border-t border-white/10">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`grid md:grid-cols-2 gap-16 items-start ${inView ? 'animate-[fadeUp_0.8s_ease_forwards]' : 'opacity-0'}`}>
          <div>
            <span className="pill-badge mb-6 inline-flex">The Process</span>
            <h2 className="section-title text-white" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
              MICHELIN-STAR<br />
              <span className="text-[#CBFF00]">TECHNIQUE.</span><br />
              CAMPUS PRICE.
            </h2>
            <p className="text-white/50 text-lg mt-6 leading-relaxed">
              Sous vide (soo-veed) is the same technique used in Michelin-starred restaurants worldwide.
              Every Ultimate Chicken piece is vacuum-sealed and slow-cooked in a precisely controlled
              water bath — locking in moisture, flavour, and tenderness every single time.
            </p>
            <Link href="/why-sous-vide" className="btn-primary btn-lime mt-8 inline-flex">
              Why Sous Vide? →
            </Link>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#CBFF00]/10 border border-[#CBFF00]/30 flex items-center justify-center text-[#CBFF00] font-display font-black text-sm">
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{s.emoji}</span>
                      <h3 className="text-white font-display font-bold text-xl">{s.title}</h3>
                    </div>
                    <p className="text-white/50 text-sm mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MicroplasticsTeaser() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const data = [
    { label: 'Ultimate Chicken™', particles: 10, max: 370000, color: '#CBFF00', pct: 0.8 },
    { label: 'Table Salt', particles: 2825, max: 370000, color: '#FFB347', pct: 15 },
    { label: 'Protein Powder', particles: 45000, max: 370000, color: '#FF3D00', pct: 55 },
    { label: 'Water Bottle', particles: 240000, max: 370000, color: '#FF0055', pct: 100 },
  ]

  return (
    <section ref={ref} className="bg-[#060606] py-24 md:py-36 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#0D2B1E]/30 via-transparent to-transparent" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`${inView ? 'animate-[fadeUp_0.8s_ease_forwards]' : 'opacity-0'}`}>
          <span className="pill-badge mb-6 inline-flex">Transparency</span>
          <h2 className="section-title text-white" style={{ fontSize: 'clamp(40px, 6vw, 84px)' }}>
            WE SHOW YOU<br />
            <span className="text-[#CBFF00]">WHAT OTHERS HIDE.</span>
          </h2>
          <p className="text-white/50 text-lg mt-4 max-w-xl">
            Microplastics are everywhere. We&apos;ve measured ours — and published the numbers.
            Our PP/PE/PA packaging has no BPA, no PVC. Here&apos;s how we compare:
          </p>
        </div>

        <div className={`mt-16 space-y-6 ${inView ? 'animate-[fadeIn_1s_0.3s_ease_forwards]' : 'opacity-0'}`}>
          {data.map((d) => (
            <div key={d.label} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold text-sm md:text-base">{d.label}</span>
                <span className="font-display font-black text-lg" style={{ color: d.color }}>
                  {d.particles.toLocaleString()} {d.particles === 10 ? 'particles' : 'particles'}
                </span>
              </div>
              <div className="h-10 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-xl flex items-center px-4"
                  style={{
                    width: `${d.pct}%`,
                    background: `linear-gradient(90deg, ${d.color}99, ${d.color})`,
                    minWidth: d.pct < 5 ? '60px' : undefined,
                    transition: inView ? `width 1.5s cubic-bezier(0.16,1,0.3,1) ${data.indexOf(d) * 0.2}s` : undefined,
                  }}
                >
                  {d.pct > 10 && (
                    <span className="text-[#0D2B1E] font-black text-xs">{d.label}</span>
                  )}
                </div>
              </div>
              <div className="text-white/30 text-xs mt-1">Microplastic particles per serving</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { icon: '♻️', title: 'PP / PE / PA', desc: 'Food-grade plastics with the lowest microplastic leach rates at any temperature' },
            { icon: '🚫', title: 'No BPA, No PVC', desc: 'Zero bisphenol-A. Zero polyvinyl chloride. The two worst offenders — eliminated.' },
            { icon: '🔬', title: 'Eurofins Tested', desc: 'Third-party lab verified. Every batch. No self-certification.' },
          ].map((c) => (
            <div key={c.title} className="glass-card p-6 hover-lift border border-white/10">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-[#CBFF00] font-display font-bold text-lg">{c.title}</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/microplastics" className="btn-primary btn-lime inline-flex">
            Full Microplastics Report →
          </Link>
        </div>
      </div>
    </section>
  )
}

function WaitlistSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'You\'re on the list! 🔥')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <section
      id="waitlist"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-6"
      style={{ background: 'linear-gradient(135deg, #CBFF00 0%, #9FCC00 50%, #CBFF00 100%)' }}
    >
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Big BG text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <div className="font-display font-black text-[25vw] leading-none text-[#0D2B1E]/[0.06] whitespace-nowrap">
          JOIN US
        </div>
      </div>

      <div className={`relative z-10 w-full max-w-2xl text-center ${inView ? 'animate-[fadeUp_0.9s_ease_forwards]' : 'opacity-0'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#0D2B1E] text-[#CBFF00] px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-[#CBFF00] animate-pulse" />
          Launching at BITS Pilani First
        </div>

        <h2 className="hero-title text-[#0D2B1E]" style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}>
          BE THE<br />
          FIRST.
        </h2>

        <p className="text-[#0D2B1E]/70 text-lg md:text-xl mt-6 max-w-lg mx-auto font-medium">
          We&apos;re dropping at BITS Pilani. Join the waitlist and get early access,
          exclusive drops, and weekly fire content on fitness, protein, and being absolutely jacked.
        </p>

        {status !== 'success' ? (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/40 text-base font-medium outline-none"
              style={{
                background: 'rgba(13, 43, 30, 0.15)',
                border: '2px solid rgba(13, 43, 30, 0.25)',
              }}
            />
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 rounded-2xl text-[#0D2B1E] placeholder-[#0D2B1E]/40 text-base font-medium outline-none"
                style={{
                  background: 'rgba(13, 43, 30, 0.1)',
                  border: '2px solid rgba(13, 43, 30, 0.3)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary flex-shrink-0"
                style={{ background: '#0D2B1E', color: '#CBFF00' }}
              >
                {status === 'loading' ? '...' : "I'm In"}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-red-700 text-sm font-medium">{message}</p>
            )}
            <p className="text-[#0D2B1E]/50 text-xs">
              No spam. Just protein drops, fitness fire, and launch news. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <div className="mt-10 bg-[#0D2B1E] rounded-3xl p-10 text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-[#CBFF00] font-display font-black text-3xl">You&apos;re on the list!</h3>
            <p className="text-white/60 mt-3 text-base">{message}</p>
            <p className="text-white/40 mt-2 text-sm">Check your email for a confirmation.</p>
          </div>
        )}

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-6 text-[#0D2B1E]/60 text-sm">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-[#0D2B1E]/20 border-2 border-[#CBFF00]" />
            ))}
          </div>
          <span className="font-medium">Join 200+ BITSians already on the list</span>
        </div>
      </div>
    </section>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Scroll Progress */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[#CBFF00] z-[9999] transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      <nav
        className="fixed top-0 left-0 right-0 z-[1000] px-6 md:px-12"
        style={{
          background: scrolled ? 'rgba(13, 43, 30, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(203, 255, 0, 0.1)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="font-display font-black text-2xl uppercase leading-none tracking-tight" style={{ color: scrolled ? '#CBFF00' : '#0D2B1E' }}>
            ULTIMATE<br />CHICKEN™
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Products', href: '#korean-bbq' },
              { label: 'Why Sous Vide', href: '/why-sous-vide' },
              { label: 'Our Promise', href: '/microplastics' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold tracking-wide transition-opacity hover:opacity-70"
                style={{ color: scrolled ? 'rgba(255,255,255,0.8)' : '#0D2B1E' }}
              >
                {item.label}
              </a>
            ))}
            <a href="#waitlist" className="btn-primary text-sm px-5 py-3" style={{ background: '#CBFF00', color: '#0D2B1E' }}>
              Join Waitlist
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[6px]"
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 transition-all" style={{ background: scrolled ? '#CBFF00' : '#0D2B1E', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: scrolled ? '#CBFF00' : '#0D2B1E', opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: scrolled ? '#CBFF00' : '#0D2B1E', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0D2B1E] rounded-2xl mx-4 mb-4 p-6 space-y-4">
            {[
              { label: 'Products', href: '#korean-bbq' },
              { label: 'Why Sous Vide', href: '/why-sous-vide' },
              { label: 'Our Promise', href: '/microplastics' },
            ].map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="block text-white font-semibold text-lg py-2 border-b border-white/10">
                {item.label}
              </a>
            ))}
            <a href="#waitlist" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center text-center">
              Join Waitlist
            </a>
          </div>
        )}
      </nav>
    </>
  )
}

function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display font-black text-3xl text-[#CBFF00] uppercase leading-none mb-4">
              ULTIMATE<br />CHICKEN™
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Pioneering the ready-to-eat, high-protein category in India.
              Real food. Real protein. No compromise.
            </p>
            <p className="text-[#CBFF00]/80 font-display font-bold text-xl mt-4 italic">
              Real Food. Real Protein.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/ultimatechicken" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#CBFF00] hover:text-[#CBFF00] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com/@ultimatechicken" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#CBFF00] hover:text-[#CBFF00] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-display font-bold text-sm uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Korean BBQ', href: '#korean-bbq' },
                { label: 'Spicy Peri Peri', href: '#spicy-peri-peri' },
                { label: 'Lemon Herb', href: '#lemon-herb' },
                { label: 'Why Sous Vide', href: '/why-sous-vide' },
                { label: 'Microplastics', href: '/microplastics' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/40 text-sm hover:text-[#CBFF00] transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-display font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'BITS Pilani Launch', href: '#waitlist' },
                { label: 'Join Waitlist', href: '#waitlist' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/40 text-sm hover:text-[#CBFF00] transition-colors">{l.label}</a>
                </li>
              ))}
              <li>
                <a href="mailto:siddharth@ultimatechicken.in" className="text-white/40 text-sm hover:text-[#CBFF00] transition-colors">siddharth@ultimatechicken.in</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © 2026 Ultimate Protein Foods LLP. FSSAI Certified. Eurofins Tested. BPA Free.
          </p>
          <p className="text-white/30 text-xs">
            BITS Pilani, Pilani Campus, Rajasthan 333031
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CBFF00 0%, #DFFF4F 50%, #CBFF00 100%)' }}
      >
        {/* BG texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />

        {/* Big BG text */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden">
          <div className="font-display font-black text-[40vw] leading-none text-[#0D2B1E]/[0.05] whitespace-nowrap">
            UC
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-12 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[85vh]">
            {/* Text */}
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-[#0D2B1E] text-[#CBFF00] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                <span className="w-2 h-2 bg-[#CBFF00] rounded-full animate-pulse" />
                Launching at BITS Pilani
              </div>

              <h1 className="hero-title text-[#0D2B1E]" style={{ fontSize: 'clamp(64px, 10vw, 160px)' }}>
                ULTIMATE<br />CHICKEN™
              </h1>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-1 w-12 bg-[#0D2B1E]/40 rounded" />
                <p className="font-display font-black text-2xl md:text-3xl text-[#0D2B1E]/80 uppercase italic tracking-wide">
                  Real Food. Real Protein.
                </p>
              </div>

              <p className="text-[#0D2B1E]/60 text-base md:text-lg mt-5 max-w-md leading-relaxed font-medium">
                India&apos;s first sous vide ready-to-eat high-protein chicken. 27g protein.
                150 calories. Zero preservatives. Eat straight from the wrapper.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mt-8">
                {['27g Protein', '150 Cal', 'Zero Additives', 'Sous Vide', 'BPA Free'].map((b) => (
                  <span key={b} className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#0D2B1E]/30 text-[#0D2B1E]/70 bg-[#0D2B1E]/5">
                    {b}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 mt-10">
                <a href="#waitlist" className="btn-primary" style={{ background: '#0D2B1E', color: '#CBFF00' }}>
                  Join Waitlist — BITS Pilani 🔥
                </a>
                <a href="#korean-bbq" className="btn-primary btn-outline" style={{ color: '#0D2B1E', borderColor: '#0D2B1E' }}>
                  See Flavors ↓
                </a>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-6 mt-12 items-center">
                {['100% Natural', 'Eurofins Tested', 'FSSAI', 'BPA FREE'].map((c) => (
                  <span key={c} className="text-[#0D2B1E]/50 text-xs font-bold uppercase tracking-widest border-r border-[#0D2B1E]/20 pr-6 last:border-0">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* 3D Scene */}
            <div className="order-1 md:order-2 h-[50vh] md:h-[85vh] flex items-center justify-center">
              <PouchScene flavorIndex={-1} />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#0D2B1E]/50 text-xs font-semibold uppercase tracking-widest">
            <span>Scroll</span>
            <div className="w-px h-12 bg-[#0D2B1E]/30 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* Stats */}
      <StatsBar />

      {/* Flavor Sections */}
      {flavors.map((flavor, i) => (
        <FlavorCard key={flavor.id} flavor={flavor} index={i} />
      ))}

      {/* Why Real Food */}
      <WhyRealFood />

      {/* Process */}
      <ProcessSection />

      {/* Microplastics */}
      <MicroplasticsTeaser />

      {/* Waitlist */}
      <WaitlistSection />

      <Footer />
    </main>
  )
}
