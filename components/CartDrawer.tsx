'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { getFlavour } from '@/lib/flavours'
import { SHIPPING, FREE_SHIPPING_THRESHOLD, findCoupon, couponError } from '@/lib/coupons'
import { isServiceable, SERVICE_AREA } from '@/lib/delivery'

function deliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function CartDrawer() {
  const {
    items, subtotal, discount, shipping, total, coupon, pincode, open, setOpen, count,
    setQty, add, remove, applyCoupon, removeCoupon, setPincode,
  } = useCart()
  const router = useRouter()

  const [couponInput, setCouponInput] = useState('')
  const [couponErr, setCouponErr] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [editPin, setEditPin] = useState(false)
  const [showSummary, setShowSummary] = useState(true)

  // Scroll-lock the page behind the drawer (position-fixed = reliable on iOS + sticky hero).
  const lockedY = useRef(0)
  const unlockBody = () => {
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    body.style.overflow = ''
  }
  useEffect(() => {
    if (!open) return
    const y = window.scrollY
    lockedY.current = y
    const body = document.body
    body.style.position = 'fixed'; body.style.top = `-${y}px`; body.style.left = '0'; body.style.right = '0'; body.style.width = '100%'; body.style.overflow = 'hidden'
    return () => { unlockBody(); window.scrollTo(0, lockedY.current) }
  }, [open])

  // Navigating away: unlock the body NOW so the destination page isn't stuck under
  // a position:fixed body (which made checkout render blank). Reset lockedY so the
  // effect cleanup's scrollTo lands at the top of the new page.
  const goCheckout = () => {
    lockedY.current = 0
    unlockBody()
    setOpen(false)
    router.push('/checkout')
  }
  const goShop = () => {
    unlockBody()
    setOpen(false)
    setTimeout(() => {
      const el = document.getElementById('flavours')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else router.push('/#flavours')
    }, 80)
  }

  const tryCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    // Quick local check first (format / expiry / minimum).
    const localErr = couponError(code, subtotal)
    if (localErr) { setCouponErr(localErr); return }
    // Server check confirms single-use codes haven't already been redeemed.
    setCouponBusy(true)
    setCouponErr('')
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()
      if (!data.valid) { setCouponErr(data.error || 'That code can’t be used.'); return }
      applyCoupon(code)
      setCouponInput('')
    } catch {
      setCouponErr('Couldn’t check that code. Please try again.')
    } finally {
      setCouponBusy(false)
    }
  }
  const shippingSaved = shipping === 0 ? SHIPPING : 0
  const savings = discount + shippingSaved
  const freeShipGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const validPin = /^\d{6}$/.test(pincode)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            className="fixed right-0 top-0 z-[61] flex h-[100dvh] w-full max-w-md flex-col bg-cream text-green-deep shadow-2xl"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-green-deep/10 px-6 py-5">
              <h2 className="shout-upright text-2xl">
                Your items <span className="text-green-deep/45">({count} {count === 1 ? 'item' : 'items'})</span>
              </h2>
              <button aria-label="Close cart" onClick={() => setOpen(false)} className="text-green-deep/50 transition-colors hover:text-green-deep">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="shout text-5xl text-green-deep/20">Empty.</p>
                <p className="text-green-deep/55">Add a flavour or two to get started.</p>
                <button onClick={goShop} className="btn-lime mt-2">Pick a flavour</button>
              </div>
            ) : (
              <>
                {savings > 0 && (
                  <div className="shrink-0 bg-green-brand px-6 py-3 text-center text-sm font-semibold text-cream">
                    🎉 You saved ₹{savings} on this order
                  </div>
                )}

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {/* Items */}
                  <div className="px-6">
                    {items.map((it) => {
                      const f = getFlavour(it.slug)
                      if (!f) return null
                      return (
                        <div key={it.slug} className="flex gap-4 border-b border-green-deep/10 py-5">
                          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#07140E]">
                            <Image src={f.pouch} alt={f.name} fill className="object-contain" sizes="96px" />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="shout text-2xl" style={{ color: f.primary }}>{f.name}</h3>
                                <p className="mt-0.5 text-xs text-green-deep/50">{f.protein}g protein · {f.calories} cal</p>
                                <p className="stat-num mt-1 text-lg">₹{f.price * it.qty}</p>
                              </div>
                              <button aria-label="Remove item" onClick={() => remove(it.slug)} className="text-green-deep/35 transition-colors hover:text-green-deep">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 self-start rounded-full border border-green-deep/15 bg-white px-1.5 py-1">
                              <button aria-label="Decrease" onClick={() => setQty(it.slug, it.qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-green-deep hover:bg-green-deep/5">−</button>
                              <span className="stat-num w-7 text-center text-lg tabular-nums">{it.qty}</span>
                              <button aria-label="Increase" onClick={() => add(it.slug, 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-green-deep hover:bg-green-deep/5">+</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Coupon */}
                  <div className="border-t-8 border-green-deep/5 px-6 py-5">
                    {coupon && findCoupon(coupon) ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-condensed text-lg font-extrabold uppercase">
                            <span className="text-lime-brand">✦</span> &quot;{coupon}&quot; applied
                          </p>
                          <p className="text-sm text-green-deep/55">You saved ₹{discount} with this code</p>
                        </div>
                        <button onClick={removeCoupon} className="font-condensed text-base font-bold uppercase underline">Remove</button>
                      </div>
                    ) : (
                      <div>
                        <p className="section-label text-green-deep">Have a coupon?</p>
                        <div className="mt-2 flex gap-2">
                          <input
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponErr('') }}
                            placeholder="Enter coupon code"
                            className="flex-1 rounded-xl border border-green-deep/15 bg-white px-4 py-3 uppercase tracking-wide outline-none focus:border-green-deep"
                          />
                          <button onClick={tryCoupon} disabled={couponBusy} className="rounded-xl bg-green-deep px-5 font-condensed text-base font-extrabold uppercase italic text-lime-brand disabled:opacity-60">{couponBusy ? '…' : 'Apply'}</button>
                        </div>
                        {couponErr && <p className="mt-1.5 text-sm text-red-600">{couponErr}</p>}
                      </div>
                    )}
                  </div>

                  {/* Delivery pincode */}
                  <div className="border-t-8 border-green-deep/5 px-6 py-5">
                    {validPin && !editPin ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-2">
                          <span className="mt-0.5 text-green-deep">📍</span>
                          {isServiceable(pincode) ? (
                            <div>
                              <p className="font-semibold">Delivery for pincode <span className="font-extrabold">{pincode}</span></p>
                              <p className="text-sm text-green-deep/60">Yay! Your pincode is eligible for delivery.</p>
                              <p className="text-sm font-semibold text-green-brand">Delivery by {deliveryDate()}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold">Pincode <span className="font-extrabold">{pincode}</span></p>
                              <p className="text-sm font-semibold text-red-600">Sorry — we don&apos;t deliver here yet.</p>
                              <p className="text-sm text-green-deep/60">We currently serve {SERVICE_AREA} only.</p>
                            </div>
                          )}
                        </div>
                        <button onClick={() => { setPinInput(pincode); setEditPin(true) }} className="shrink-0 font-condensed text-base font-bold uppercase underline">Change</button>
                      </div>
                    ) : (
                      <div>
                        <p className="section-label text-green-deep">Check delivery</p>
                        <div className="mt-2 flex gap-2">
                          <input
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter pincode"
                            inputMode="numeric"
                            className="flex-1 rounded-xl border border-green-deep/15 bg-white px-4 py-3 tracking-wide outline-none focus:border-green-deep"
                          />
                          <button
                            onClick={() => { if (/^\d{6}$/.test(pinInput)) { setPincode(pinInput); setEditPin(false) } }}
                            className="rounded-xl bg-green-deep px-5 font-condensed text-base font-extrabold uppercase italic text-lime-brand"
                          >Check</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price summary */}
                  <div className="border-t-8 border-green-deep/5 px-6 py-5">
                    <button onClick={() => setShowSummary((s) => !s)} className="flex w-full items-center justify-between">
                      <span className="shout-upright text-xl">Price Summary</span>
                      <span className="flex items-center gap-2">
                        <span className="stat-num text-xl">₹{total}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={`transition-transform ${showSummary ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </button>
                    {showSummary && (
                      <div className="mt-4 space-y-2 border-t border-dashed border-green-deep/20 pt-4 text-[15px]">
                        <div className="flex justify-between"><span className="text-green-deep/70">Item total</span><span>₹{subtotal}</span></div>
                        <div className="flex justify-between">
                          <span className="text-green-deep/70">Shipping</span>
                          {shipping === 0
                            ? <span><span className="text-green-deep/40 line-through">₹{SHIPPING}</span> <span className="font-bold text-green-brand">Free</span></span>
                            : <span>₹{shipping}</span>}
                        </div>
                        {freeShipGap > 0 && (
                          <p className="!mt-1 rounded-lg bg-green-brand/10 px-3 py-1.5 text-center text-[13px] font-medium text-green-brand">
                            Add ₹{freeShipGap} more for free shipping
                          </p>
                        )}
                        {discount > 0 && (
                          <div className="flex justify-between"><span className="text-green-deep/70">Coupon ({coupon})</span><span className="font-semibold text-green-brand">(−) ₹{discount}</span></div>
                        )}
                        {savings > 0 && (
                          <div className="flex justify-between border-t border-dashed border-green-deep/20 pt-2 font-bold"><span>Total savings</span><span className="text-green-brand">(−) ₹{savings}</span></div>
                        )}
                        <div className="flex items-end justify-between border-t border-dashed border-green-deep/20 pt-3">
                          <div><p className="shout text-2xl">Grand total</p><p className="text-xs text-green-deep/50">Inclusive of all taxes</p></div>
                          <span className="stat-num text-3xl">₹{total}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="shrink-0 border-t border-green-deep/10 bg-cream px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="stat-num text-2xl leading-none">₹{total}</p>
                      <p className="text-xs text-green-deep/50">{count} {count === 1 ? 'pouch' : 'pouches'} · incl. taxes</p>
                    </div>
                    <button onClick={goCheckout} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-deep py-4 font-condensed text-lg font-extrabold uppercase italic tracking-wide text-lime-brand transition-transform hover:scale-[1.02]">
                      Continue →
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
