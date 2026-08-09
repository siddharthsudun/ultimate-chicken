'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { getFlavour } from '@/lib/flavours'
import { SHIPPING, COD_FEE } from '@/lib/coupons'
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

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal']

const inputCls =
  'w-full rounded-xl border border-green-deep/15 bg-white px-4 py-3.5 text-green-deep placeholder:text-green-deep/40 outline-none transition-colors focus:border-green-deep'

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, coupon, pincode, count, clear } = useCart()
  const shippingSaved = shipping === 0 ? SHIPPING : 0
  const savings = discount + shippingSaved
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', locality: '', landmark: '', pincode: '', city: '', state: 'Telangana',
  })
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<'online' | 'cod'>('online')
  const [hp, setHp] = useState('') // honeypot — bots fill this hidden field
  const [tsToken, setTsToken] = useState('')
  const [confirming, setConfirming] = useState(false)

  const codFee = method === 'cod' ? COD_FEE : 0
  const payable = total + codFee

  // Prefill pincode from the cart once it hydrates.
  useEffect(() => {
    if (pincode) setForm((f) => (f.pincode ? f : { ...f, pincode }))
  }, [pincode])

  // Meta Pixel: InitiateCheckout once, after the cart hydrates with items.
  const icFired = useRef(false)
  useEffect(() => {
    if (icFired.current || count === 0) return
    icFired.current = true
    fbTrack('InitiateCheckout', {
      value: total, currency: 'INR', num_items: count,
      content_ids: items.map((i) => i.slug), content_type: 'product',
    })
  }, [count, total, items])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return 'Enter a valid 10-digit mobile number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Enter a valid email address.'
    if (form.address.trim().length < 8) return 'Please enter your full address.'
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit pincode.'
    if (!isServiceable(form.pincode)) return `Sorry — we currently deliver only in ${SERVICE_AREA}. We're not in your area yet.`
    if (!form.city.trim()) return 'Please enter your city.'
    return ''
  }

  const pay = useCallback(async () => {
    const v = validate()
    if (v) { setError(v); return }
    setError('')
    setStatus('processing')
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Could not load the payment SDK. Check your connection.')
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: form, coupon, hp, turnstile: tsToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.')

      const rzp = new window.Razorpay!({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: 'Ultimate Chicken',
        description: `${count} pouch${count === 1 ? '' : 'es'} · ready-to-eat sous vide chicken`,
        image: '/uc-logo.png',
        theme: { color: '#CBF512' },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: {
          address: `${form.address}, ${form.locality}, ${form.city}, ${form.state} - ${form.pincode}`,
          landmark: form.landmark,
        },
        handler: async (resp: Record<string, string>) => {
          try {
            const vr = await fetch('/api/razorpay/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...resp, items, customer: form, coupon }),
            })
            const vd = await vr.json()
            if (vr.ok && vd.valid) {
              fbTrack('Purchase', {
                value: data.amount / 100, currency: 'INR', num_items: count,
                content_ids: items.map((i) => i.slug), content_type: 'product',
                order_id: resp.razorpay_payment_id,
              })
              clear(); setStatus('success')
            }
            else { setStatus('error'); setError('Payment could not be verified. If you were charged, email us at founders@ultimatechicken.in.') }
          } catch {
            setStatus('error'); setError('Payment verification failed. If you were charged, email us at founders@ultimatechicken.in.')
          }
        },
        modal: { ondismiss: () => setStatus('idle') },
      })
      rzp.open()
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, form, count, clear, coupon])

  const placeCod = useCallback(async () => {
    const v = validate()
    if (v) { setError(v); return }
    setError('')
    setStatus('processing')
    try {
      const res = await fetch('/api/order/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: form, coupon, hp, turnstile: tsToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not place the order.')
      fbTrack('Purchase', {
        value: data.total ?? payable, currency: 'INR', num_items: count,
        content_ids: items.map((i) => i.slug), content_type: 'product',
        order_id: data.ref,
      })
      clear()
      setStatus('success')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, form, coupon, clear])

  const submit = () => (method === 'cod' ? placeCod() : pay())

  // Validate first, then ask for a final confirmation before charging / placing.
  const review = () => {
    const v = validate()
    if (v) { setError(v); return }
    setError('')
    setConfirming(true)
  }

  const Spinner = () => (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )

  return (
    <main className="min-h-[100dvh] bg-cream text-green-deep">
      {/* Header */}
      <header className="border-b border-green-deep/10 bg-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-5 py-4 md:px-8">
          <div className="justify-self-start">
            <Link href="/#flavours" className="inline-flex items-center gap-1.5 font-condensed text-base font-bold uppercase tracking-wide text-green-deep/70 transition-colors hover:text-green-deep">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </Link>
          </div>
          <Link href="/" aria-label="Ultimate Chicken home" className="justify-self-center">
            <Image src="/brand/wordmark-green.png" alt="Ultimate Chicken" width={958} height={232} priority className="h-9 w-auto md:h-10" />
          </Link>
          <span className="justify-self-end" />
        </div>
      </header>

      {status === 'success' ? (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-5 py-28 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-brand text-green-deep">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="shout text-6xl">Order placed!</h1>
          <p className="text-green-deep/70">
            Thanks, {form.name.split(' ')[0] || 'friend'} — your order is confirmed. We&apos;ll send a confirmation and get your fresh, ready-to-eat chicken on its way.
          </p>
          <Link href="/" className="btn-lime mt-2">Back to home</Link>
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-5 py-28 text-center">
          <h1 className="shout text-6xl text-green-deep/25">Cart&apos;s empty.</h1>
          <p className="text-green-deep/60">Add a flavour before checking out.</p>
          <Link href="/#flavours" className="btn-lime mt-2">Pick a flavour</Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-16">
          {/* LEFT — form */}
          <div>
            <h1 className="shout text-5xl md:text-6xl">Checkout</h1>

            <section className="mt-8">
              <h2 className="shout-upright text-2xl">Customer info</h2>
              {/* honeypot — hidden from humans, bots fill it */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={hp} onChange={(e) => setHp(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input className={inputCls} placeholder="Full Name *" value={form.name} onChange={set('name')} autoComplete="name" />
                <input className={inputCls} placeholder="Mobile Number *" value={form.phone} onChange={set('phone')} inputMode="numeric" autoComplete="tel" maxLength={10} />
                <input className={inputCls} placeholder="Email Address *" value={form.email} onChange={set('email')} type="email" autoComplete="email" />
              </div>
            </section>

            <section className="mt-8">
              <h2 className="shout-upright text-2xl">Address info</h2>
              <div className="mt-4 grid gap-3">
                <input className={inputCls} placeholder="Full Address *" value={form.address} onChange={set('address')} autoComplete="street-address" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className={inputCls} placeholder="Locality / Area (optional)" value={form.locality} onChange={set('locality')} />
                  <input className={inputCls} placeholder="Landmark (optional)" value={form.landmark} onChange={set('landmark')} />
                  <input className={inputCls} placeholder="Pincode *" value={form.pincode} onChange={set('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} placeholder="City *" value={form.city} onChange={set('city')} autoComplete="address-level2" />
                  <select className={inputCls} value={form.state} onChange={set('state')}>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="shout-upright text-2xl">Payment method</h2>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('online')}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-5 text-left transition-colors ${method === 'online' ? 'border-green-deep' : 'border-green-deep/15'}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-deep text-lime-brand">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19" strokeLinecap="round"/></svg>
                  </span>
                  <div className="flex-1">
                    <p className="shout-upright text-xl">Pay Online</p>
                    <p className="text-sm text-green-deep/60">UPI, cards, net-banking &amp; wallets via Razorpay.</p>
                  </div>
                  <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${method === 'online' ? 'border-green-deep bg-green-deep' : 'border-green-deep/30'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('cod')}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-5 text-left transition-colors ${method === 'cod' ? 'border-green-deep' : 'border-green-deep/15'}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-deep text-lime-brand">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>
                  </span>
                  <div className="flex-1">
                    <p className="shout-upright text-xl">Cash on Delivery</p>
                    <p className="text-sm text-green-deep/60">Pay in cash when your order arrives.</p>
                  </div>
                  <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${method === 'cod' ? 'border-green-deep bg-green-deep' : 'border-green-deep/30'}`} />
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT — summary */}
          <aside className="md:sticky md:top-8 md:self-start">
            <div className="rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
              <h2 className="shout-upright text-2xl">Order summary</h2>
              <div className="mt-4 space-y-4">
                {items.map((it) => {
                  const f = getFlavour(it.slug)
                  if (!f) return null
                  return (
                    <div key={it.slug} className="flex items-center gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[#07140E]">
                        <Image src={f.pouch} alt={f.name} fill className="object-contain" sizes="56px" />
                      </div>
                      <div className="flex-1">
                        <p className="shout-upright text-lg leading-tight">{f.name}</p>
                        <p className="text-xs text-green-deep/50">Qty {it.qty} · ₹{f.price}</p>
                      </div>
                      <p className="stat-num text-lg">₹{f.price * it.qty}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 space-y-2 border-t border-green-deep/10 pt-4 text-sm">
                <div className="flex justify-between text-green-deep/70"><span>Item total</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-green-deep/70">
                  <span>Shipping</span>
                  {shipping === 0
                    ? <span><span className="text-green-deep/40 line-through">₹{SHIPPING}</span> <span className="font-bold text-green-brand">Free</span></span>
                    : <span>₹{shipping}</span>}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-green-deep/70">Coupon ({coupon})</span><span className="font-semibold text-green-brand">(−) ₹{discount}</span></div>
                )}
                {codFee > 0 && (
                  <div className="flex justify-between"><span className="text-green-deep/70">Cash-on-delivery fee</span><span>₹{codFee}</span></div>
                )}
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-green-deep/10 pt-4">
                <div><span className="shout text-2xl">Grand total</span><p className="text-xs text-green-deep/50">Inclusive of all taxes</p></div>
                <span className="stat-num text-3xl">₹{payable}</span>
              </div>
              {savings > 0 && (
                <p className="mt-3 rounded-lg bg-lime-brand/20 px-3 py-2 text-center text-sm font-semibold text-green-deep">🎉 You saved ₹{savings} on this order</p>
              )}

              {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <Turnstile onToken={setTsToken} />

              <button onClick={review} disabled={status === 'processing'} className="btn-lime mt-5 w-full !py-4 !text-lg disabled:opacity-60">
                {method === 'cod' ? `Place order · ₹${payable}` : `Pay ₹${payable}`}
              </button>
              <p className="mt-3 text-center text-[11px] text-green-deep/45">
                {method === 'cod' ? '✅ Pay in cash on delivery' : '🔒 100% secure payment via Razorpay'}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Confirm order modal */}
      {confirming && status !== 'success' && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={() => status !== 'processing' && setConfirming(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-cream p-6 text-green-deep sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            {status === 'processing' ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <span className="text-green-deep"><Spinner /></span>
                <p className="shout text-3xl">{method === 'cod' ? 'Placing your order…' : 'Opening secure payment…'}</p>
                <p className="text-sm text-green-deep/60">Hang tight, don&apos;t close this window.</p>
              </div>
            ) : (
              <>
                <h3 className="shout text-3xl">Confirm your order</h3>
                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-green-deep/60">Items</span><span className="font-semibold">{count} {count === 1 ? 'pouch' : 'pouches'}</span></div>
                  <div className="flex justify-between"><span className="text-green-deep/60">Payment</span><span className="font-semibold">{method === 'cod' ? 'Cash on Delivery' : 'Pay Online (Razorpay)'}</span></div>
                  <div className="flex justify-between"><span className="text-green-deep/60">Deliver to</span><span className="max-w-[60%] text-right font-semibold">{form.name}, {form.pincode}</span></div>
                  <div className="mt-2 flex items-end justify-between border-t border-green-deep/15 pt-3">
                    <span className="shout text-2xl">Total</span>
                    <span className="stat-num text-3xl">₹{payable}</span>
                  </div>
                </div>
                {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                <div className="mt-5 flex gap-3">
                  <button onClick={() => { setConfirming(false); setError('') }} className="flex-1 rounded-full border-2 border-green-deep py-3.5 font-condensed text-base font-extrabold uppercase italic text-green-deep">Back</button>
                  <button onClick={submit} className="btn-lime flex-[1.4] !py-3.5 !text-base">
                    {method === 'cod' ? 'Confirm order' : 'Confirm & pay'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
