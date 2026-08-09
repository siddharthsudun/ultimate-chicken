'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { FLAVOURS } from '@/lib/flavours'
import { priceMix, SUB_MIN_PCS, type Mix } from '@/lib/subscription-mix'
import { DAYS, SLOTS } from '@/lib/delivery-window'

type Sub = {
  id: string
  status: string
  plan: string
  mix: Mix
  pcsPerWeek: string | number
  weekly: string | number
  deliveryDay: string
  deliverySlot: string
  customerName: string
  canEdit: boolean
  nextDeliveryMs: number | null
}

function statusLabel(s: string): { text: string; tone: string } {
  switch (s) {
    case 'active': return { text: 'Active', tone: 'text-green-brand' }
    case 'paused': return { text: 'Paused', tone: 'text-amber-600' }
    case 'cancelled': return { text: 'Cancelled', tone: 'text-red-600' }
    case 'completed': return { text: 'Completed', tone: 'text-green-deep/60' }
    default: return { text: s || '—', tone: 'text-green-deep/60' }
  }
}

function ManageInner() {
  const params = useSearchParams()
  const sid = params.get('sid') || ''
  const t = params.get('t') || ''

  const [sub, setSub] = useState<Sub | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(false)
  const [mix, setMix] = useState<Mix>({})
  const [editingDelivery, setEditingDelivery] = useState(false)
  const [dayInput, setDayInput] = useState('')
  const [slotInput, setSlotInput] = useState('')

  const editPcs = Object.values(mix).reduce((a, b) => a + b, 0)
  const editPrice = priceMix(mix)

  const load = useCallback(async () => {
    if (!sid || !t) { setError('This link is missing its details. Please use the link from your email.'); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/subscription/manage?sid=${encodeURIComponent(sid)}&t=${encodeURIComponent(t)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not load your subscription.'); return }
      setSub(data); setError('')
    } catch {
      setError('Could not load your subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sid, t])

  useEffect(() => { load() }, [load])

  const act = async (action: 'pause' | 'resume') => {
    setBusy(true); setError(''); setNotice('')
    try {
      const res = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, t, action }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || `Could not ${action} your subscription.`); return }
      setSub(data)
      setNotice(action === 'pause'
        ? 'Your subscription is paused. No deliveries or charges until you resume — resume anytime.'
        : 'Welcome back! Your weekly deliveries have resumed.')
    } catch {
      setError(`Could not ${action} your subscription. Please try again.`)
    } finally {
      setBusy(false)
    }
  }

  const startEdit = () => {
    setMix(sub?.mix && Object.keys(sub.mix).length ? { ...sub.mix } : {})
    setEditing(true); setEditingDelivery(false); setError(''); setNotice('')
  }
  const startEditDelivery = () => {
    setDayInput(sub?.deliveryDay || DAYS[0])
    setSlotInput(sub?.deliverySlot || SLOTS[0])
    setEditingDelivery(true); setEditing(false); setError(''); setNotice('')
  }
  const saveDelivery = async () => {
    setBusy(true); setError(''); setNotice('')
    try {
      const res = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, t, action: 'reschedule', deliveryDay: dayInput, deliverySlot: slotInput }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not update your delivery.'); return }
      setSub(data); setEditingDelivery(false)
      setNotice('Your delivery day & time are updated — applies from your next delivery.')
    } catch {
      setError('Could not update your delivery. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const stepMix = (slug: string, d: number) =>
    setMix((m) => {
      const next = Math.max(0, (m[slug] || 0) + d)
      const out = { ...m }
      if (next === 0) delete out[slug]
      else out[slug] = next
      return out
    })

  const saveMix = async () => {
    if (editPcs < SUB_MIN_PCS) { setError(`Minimum ${SUB_MIN_PCS} pouches per week.`); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const res = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, t, action: 'update', mix }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not update your box.'); return }
      setSub(data); setEditing(false)
      setNotice('Your weekly box is updated. The new box starts your next delivery; the updated price applies from your next billing cycle.')
    } catch {
      setError('Could not update your box. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const st = sub ? statusLabel(sub.status) : null

  return (
    <main className="min-h-[100dvh] bg-cream text-green-deep">
      <Nav />
      <section className="mx-auto max-w-lg px-5 pb-24 pt-32 md:pt-40">
        <h1 className="shout text-6xl md:text-7xl">Your <span className="hl">subscription</span></h1>
        <p className="mt-3 text-green-deep/65">Travelling? Pause anytime — no charges while paused — and pick right back up when you&apos;re home.</p>

        <div className="mt-8 rounded-3xl border border-green-deep/10 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-green-deep/60">Loading…</p>
          ) : error && !sub ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : sub ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label text-green-deep/50">Status</p>
                  <p className={`shout text-3xl ${st!.tone}`}>{st!.text}</p>
                </div>
                <div className="text-right">
                  <p className="section-label text-green-deep/50">Per week</p>
                  <p className="stat-num text-2xl">₹{sub.weekly?.toString().replace(/[^\d]/g, '') || '—'}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-dashed border-green-deep/20 pt-4 text-[15px]">
                {sub.plan && <div className="flex justify-between"><span className="text-green-deep/60">Plan</span><span className="text-right">{sub.plan}</span></div>}
                {sub.pcsPerWeek && <div className="flex justify-between"><span className="text-green-deep/60">Pouches / week</span><span>{sub.pcsPerWeek}</span></div>}
                {sub.deliveryDay && <div className="flex justify-between"><span className="text-green-deep/60">Delivery</span><span>{sub.deliveryDay}{sub.deliverySlot ? `, ${sub.deliverySlot}` : ''}</span></div>}
              </div>

              {notice && <p className="mt-5 rounded-lg bg-lime-brand/20 px-3 py-2 text-sm font-semibold text-green-deep">{notice}</p>}
              {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              {/* Change-box editor */}
              {editing ? (
                <div className="mt-6 border-t border-dashed border-green-deep/20 pt-5">
                  <p className="section-label text-green-deep/50">Change your weekly box</p>
                  <div className="mt-3 space-y-3">
                    {FLAVOURS.map((f) => (
                      <div key={f.slug} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="shout text-xl" style={{ color: f.primary }}>{f.name}</p>
                          <p className="text-xs text-green-deep/50">₹{f.price} each</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-green-deep/15 bg-white px-1.5 py-1">
                          <button aria-label={`Fewer ${f.name}`} onClick={() => stepMix(f.slug, -1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none hover:bg-green-deep/5">−</button>
                          <span className="stat-num w-7 text-center text-lg tabular-nums">{mix[f.slug] || 0}</span>
                          <button aria-label={`More ${f.name}`} onClick={() => stepMix(f.slug, 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none hover:bg-green-deep/5">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-green-deep/20 pt-4">
                    <span className="text-green-deep/60">{editPcs} pouch{editPcs === 1 ? '' : 'es'} / week</span>
                    <span className="stat-num text-2xl">₹{editPrice.weekly}<span className="text-sm font-normal text-green-deep/50">/wk</span></span>
                  </div>
                  {editPcs < SUB_MIN_PCS && <p className="mt-2 text-sm text-amber-600">Minimum {SUB_MIN_PCS} pouches per week.</p>}
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => { setEditing(false); setError('') }} disabled={busy} className="flex-1 rounded-full border border-green-deep/20 py-3.5 font-condensed text-base font-bold uppercase text-green-deep disabled:opacity-60">Cancel</button>
                    <button onClick={saveMix} disabled={busy || editPcs < SUB_MIN_PCS} className="btn-lime flex-1 !py-3.5 disabled:opacity-60">{busy ? 'Saving…' : 'Save box'}</button>
                  </div>
                </div>
              ) : editingDelivery ? (
                <div className="mt-6 border-t border-dashed border-green-deep/20 pt-5">
                  <p className="section-label text-green-deep/50">Change delivery day & time</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm text-green-deep/60">Day</label>
                      <select value={dayInput} onChange={(e) => setDayInput(e.target.value)} className="mt-1 w-full rounded-xl border border-green-deep/15 bg-white px-4 py-3 outline-none focus:border-green-deep">
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-green-deep/60">Time slot</label>
                      <select value={slotInput} onChange={(e) => setSlotInput(e.target.value)} className="mt-1 w-full rounded-xl border border-green-deep/15 bg-white px-4 py-3 outline-none focus:border-green-deep">
                        {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => { setEditingDelivery(false); setError('') }} disabled={busy} className="flex-1 rounded-full border border-green-deep/20 py-3.5 font-condensed text-base font-bold uppercase text-green-deep disabled:opacity-60">Cancel</button>
                    <button onClick={saveDelivery} disabled={busy} className="btn-lime flex-1 !py-3.5 disabled:opacity-60">{busy ? 'Saving…' : 'Save delivery'}</button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {sub.status === 'active' && (
                    <>
                      {sub.canEdit ? (
                        <>
                          <button onClick={startEdit} disabled={busy} className="btn-lime w-full !py-4 !text-lg disabled:opacity-60">Change my weekly box</button>
                          <button onClick={startEditDelivery} disabled={busy} className="w-full rounded-full border-2 border-green-deep py-3.5 font-condensed text-base font-extrabold uppercase italic tracking-wide text-green-deep disabled:opacity-60">Change delivery day & time</button>
                        </>
                      ) : (
                        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          🔒 Your next delivery{sub.deliveryDay ? ` (${sub.deliveryDay}${sub.deliverySlot ? `, ${sub.deliverySlot}` : ''})` : ''} is within 1 day, so it&apos;s locked for prep. You can change your box or delivery time again right after it arrives.
                        </p>
                      )}
                      <button onClick={() => act('pause')} disabled={busy} className="w-full rounded-full bg-green-deep py-4 font-condensed text-lg font-extrabold uppercase italic tracking-wide text-lime-brand transition-transform hover:scale-[1.02] disabled:opacity-60">
                        {busy ? 'Pausing…' : 'Pause my subscription'}
                      </button>
                    </>
                  )}
                  {sub.status === 'paused' && (
                    <button onClick={() => act('resume')} disabled={busy} className="btn-lime w-full !py-4 !text-lg disabled:opacity-60">
                      {busy ? 'Resuming…' : 'Resume my subscription'}
                    </button>
                  )}
                  {(sub.status === 'cancelled' || sub.status === 'completed') && (
                    <p className="text-center text-sm text-green-deep/60">This subscription is no longer active. Start a fresh one anytime from the subscribe page.</p>
                  )}
                </div>
              )}

              <p className="mt-5 text-center text-xs text-green-deep/45">
                Need help? Email <a href="mailto:founders@ultimatechicken.in" className="underline">founders@ultimatechicken.in</a>
              </p>
            </>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function ManageSubscriptionPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-cream" />}>
      <ManageInner />
    </Suspense>
  )
}
