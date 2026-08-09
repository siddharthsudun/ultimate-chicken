'use client'

import Image from 'next/image'
import { useState, useMemo, useCallback } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FLAVOURS, getFlavour } from '@/lib/flavours'
import { SUB_MIN_PCS, SUB_MAX_PCS, SUB_DISCOUNT_PCT } from '@/lib/coupons'
import { isServiceable, SERVICE_AREA } from '@/lib/delivery'
import { fbTrack } from '@/lib/fbq'
import Turnstile from '@/components/Turnstile'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOTS = ['6–9 AM', '12–3 PM', '6–9 PM']
const STATES = ['Andhra Pradesh','Telangana','Karnataka','Maharashtra','Tamil Nadu','Delhi','Other']
const inputCls = 'w-full rounded-xl border border-green-deep/15 bg-white px-4 py-3.5 text-green-deep placeholder:text-green-deep/40 outline-none focus:border-green-deep'
const SLUGS = FLAVOURS.map((f) => f.slug)

function distribute(n: number): Record<string, number> {
  const base = Math.floor(n / SLUGS.length)
  const r = n % SLUGS.length
  const out: Record<string, number> = {}
  SLUGS.forEach((s, i) => { out[s] = base + (i < r ? 1 : 0) })
  return out
}

export default function SubscribePage() {
  const [mix, setMix] = useState<Record<string, number>>(() => distribute(SUB_MIN_PCS))
  const [day, setDay] = useState('Monday')
  const [slot, setSlot] = useState(SLOTS[0])
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', locality: '', landmark: '', pincode: '', city: '', state: 'Telangana' })
  const [hp, setHp] = useState('')
  const [tsToken, setTsToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const pcs = useMemo(() => Object.values(mix).reduce((a, b) => a + b, 0), [mix])
  const subtotal = useMemo(() => SLUGS.reduce((s, slug) => s + (getFlavour(slug)!.price * (mix[slug] || 0)), 0), [mix])
  const weekly = Math.round(subtotal * (1 - SUB_DISCOUNT_PCT / 100))
  const saved = subtotal - weekly

  const onSlider = (n: number) => setMix(distribute(n))
  const step = (slug: string, d: number) => setMix((m) => ({ ...m, [slug]: Math.max(0, (m[slug] || 0) + d) }))

  const validate = () => {
    if (pcs < SUB_MIN_PCS) return `Minimum ${SUB_MIN_PCS} pouches per week.`
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return 'Enter a valid 10-digit mobile number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Enter a valid email address.'
    if (form.address.trim().length < 8) return 'Please enter your full address.'
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit pincode.'
    if (!isServiceable(form.pincode)) return `Sorry — we currently deliver only in ${SERVICE_AREA}.`
    return ''
  }

  const subscribe = useCallback(async () => {
    const v = validate()
    if (v) { setError(v); return }
    setError(''); setStatus('processing')
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Could not load the payment SDK.')
      const res = await fetch('/api/subscription/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mix, customer: form, deliveryDay: day, deliverySlot: slot, hp, turnstile: tsToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start subscription.')
      const plan = SLUGS.filter((s) => mix[s] > 0).map((s) => `${mix[s]}x ${getFlavour(s)!.name}`).join(', ')
      const rzp = new window.Razorpay!({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Ultimate Chicken',
        description: `Weekly · ${pcs} pouches · ₹${weekly}/wk (10% off)`,
        image: '/uc-logo.png',
        theme: { color: '#CBF512' },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (resp: Record<string, string>) => {
          try {
            const vr = await fetch('/api/subscription/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...resp, plan, weekly, deliveryDay: day, deliverySlot: slot, customer: { name: form.name, phone: form.phone, email: form.email, address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}` } }),
            })
            const vd = await vr.json()
            if (vr.ok && vd.valid) {
              fbTrack('Subscribe', { value: weekly, currency: 'INR', predicted_ltv: weekly * 52 })
              setStatus('success')
            }
            else { setStatus('error'); setError('Could not verify the subscription. If you were charged, email founders@ultimatechicken.in.') }
          } catch { setStatus('error'); setError('Verification failed.') }
        },
        modal: { ondismiss: () => setStatus('idle') },
      })
      rzp.open()
    } catch (e) {
      setStatus('error'); setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mix, form, day, slot, pcs, weekly])

  if (status === 'success') {
    return (
      <main className="min-h-[100dvh] bg-cream text-green-deep">
        <Nav />
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-5 py-32 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-brand text-green-deep">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="shout text-6xl">You&apos;re subscribed!</h1>
          <p className="text-green-deep/70">{pcs} pouches every week, delivered each <b>{day}</b> ({slot}) — 10% off, billed automatically. We&apos;ll email you before each delivery. Cancel anytime.</p>
          <a href="/" className="btn-lime mt-2">Back to home</a>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-cream text-green-deep">
      <Nav />
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <span className="tag-slab tag-slab--lime text-base">
          <span>Save {SUB_DISCOUNT_PCT}% · weekly</span>
        </span>
        <h1 className="shout mt-5 text-6xl md:text-8xl">Subscribe &amp; <span className="hl">save</span>.</h1>
        <p className="mt-4 max-w-xl text-lg text-green-deep/65">
          Fresh sous-vide chicken every week, automatically. Pick your weekly count, your mix and your delivery day — flat {SUB_DISCOUNT_PCT}% off, free shipping, cancel anytime.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Configurator */}
          <div>
            {/* Slider */}
            <div className="rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <h2 className="shout-upright text-2xl">Pouches per week</h2>
                <span className="stat-num text-4xl">{pcs}</span>
              </div>
              <input
                type="range" min={SUB_MIN_PCS} max={SUB_MAX_PCS} value={pcs}
                onChange={(e) => onSlider(Number(e.target.value))}
                className="mt-4 w-full" style={{ accentColor: '#234539' }}
              />
              <div className="mt-1 flex justify-between text-xs text-green-deep/50">
                <span>min {SUB_MIN_PCS}</span><span>{SUB_MAX_PCS}</span>
              </div>
            </div>

            {/* Mix */}
            <div className="mt-5 rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <h2 className="shout-upright text-2xl">Your weekly mix</h2>
              <p className="mt-1 text-sm text-green-deep/55">Fine-tune how many of each flavour.</p>
              <div className="mt-4 space-y-3">
                {FLAVOURS.map((f) => (
                  <div key={f.slug} className="flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#07140E]">
                      <Image src={f.pouch} alt={f.name} fill className="object-contain" sizes="48px" />
                    </div>
                    <div className="flex-1">
                      <p className="shout text-xl" style={{ color: f.primary }}>{f.name}</p>
                      <p className="text-xs text-green-deep/50">₹{f.price} each</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-green-deep/15 px-1.5 py-1">
                      <button onClick={() => step(f.slug, -1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-green-deep hover:bg-green-deep/5">−</button>
                      <span className="stat-num w-7 text-center text-lg tabular-nums">{mix[f.slug] || 0}</span>
                      <button onClick={() => step(f.slug, 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-green-deep hover:bg-green-deep/5">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery day */}
            <div className="mt-5 rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <h2 className="shout-upright text-2xl">Delivery day</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d} onClick={() => setDay(d)}
                    className={`rounded-full border-2 px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide transition-colors ${day === d ? 'border-green-deep bg-green-deep text-lime-brand' : 'border-green-deep/20 text-green-deep'}`}
                  >{d.slice(0, 3)}</button>
                ))}
              </div>
              <p className="mt-5 section-label text-green-deep">Time slot</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s} onClick={() => setSlot(s)}
                    className={`rounded-full border-2 px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide transition-colors ${slot === s ? 'border-green-deep bg-green-deep text-lime-brand' : 'border-green-deep/20 text-green-deep'}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="mt-5 rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <h2 className="shout-upright text-2xl">Delivery details</h2>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={hp} onChange={(e) => setHp(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className={inputCls} placeholder="Full Name *" value={form.name} onChange={set('name')} />
                <input className={inputCls} placeholder="Mobile Number *" value={form.phone} onChange={set('phone')} maxLength={10} inputMode="numeric" />
                <input className={`${inputCls} sm:col-span-2`} placeholder="Email Address *" value={form.email} onChange={set('email')} type="email" />
                <input className={`${inputCls} sm:col-span-2`} placeholder="Full Address *" value={form.address} onChange={set('address')} />
                <input className={inputCls} placeholder="Pincode *" value={form.pincode} onChange={set('pincode')} maxLength={6} inputMode="numeric" />
                <input className={inputCls} placeholder="City *" value={form.city} onChange={set('city')} />
                <select className={`${inputCls} sm:col-span-2`} value={form.state} onChange={set('state')}>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <h2 className="shout-upright text-2xl">Your plan</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-green-deep/70">{pcs} pouches / week</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-green-deep/70">Subscription discount ({SUB_DISCOUNT_PCT}%)</span><span className="font-semibold text-green-brand">(−) ₹{saved}</span></div>
                <div className="flex justify-between"><span className="text-green-deep/70">Shipping</span><span className="font-bold text-green-brand">Free</span></div>
                <div className="flex justify-between"><span className="text-green-deep/70">Delivery</span><span>{day}, {slot}</span></div>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-green-deep/10 pt-4">
                <div><span className="shout text-2xl">Per week</span><p className="text-xs text-green-deep/50">Billed weekly · cancel anytime</p></div>
                <span className="stat-num text-3xl">₹{weekly}</span>
              </div>
              <p className="mt-3 rounded-lg bg-lime-brand/20 px-3 py-2 text-center text-sm font-semibold text-green-deep">🎉 You save ₹{saved} every week</p>
              {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <Turnstile onToken={setTsToken} />
              <button onClick={subscribe} disabled={status === 'processing' || pcs < SUB_MIN_PCS} className="btn-lime mt-5 w-full !py-4 !text-lg disabled:opacity-60">
                {status === 'processing'
                  ? <span className="inline-flex items-center gap-2"><svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Starting…</span>
                  : `Subscribe · ₹${weekly}/week`}
              </button>
              <p className="mt-3 text-center text-[11px] text-green-deep/45">🔒 Secure recurring payment via Razorpay Autopay (UPI/cards)</p>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  )
}
