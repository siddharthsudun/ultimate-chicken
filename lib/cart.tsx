'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { FLAVOURS, getFlavour } from '@/lib/flavours'
import { couponDiscount, shippingFor } from '@/lib/coupons'
import { fbTrack } from '@/lib/fbq'

export type CartItem = { slug: string; qty: number }

type CartCtx = {
  items: CartItem[]
  count: number
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon: string | null
  pincode: string
  open: boolean
  setOpen: (v: boolean) => void
  qtyOf: (slug: string) => number
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  setPincode: (p: string) => void
}

const Ctx = createContext<CartCtx | null>(null)
const STORAGE_KEY = 'uc_cart_v2'

type Persisted = { items: CartItem[]; coupon: string | null; pincode: string }

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<string | null>(null)
  const [pincode, setPincodeState] = useState('')
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p: Persisted = JSON.parse(raw)
        setItems((p.items || []).filter((it) => getFlavour(it.slug) && it.qty > 0))
        setCoupon(p.coupon ?? null)
        setPincodeState(p.pincode ?? '')
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon, pincode } as Persisted))
    } catch {}
  }, [items, coupon, pincode, hydrated])

  const add = useCallback((slug: string, qty = 1) => {
    const f = getFlavour(slug)
    if (!f) return
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug)
      if (found) return prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
      return [...prev, { slug, qty }]
    })
    fbTrack('AddToCart', {
      content_ids: [slug], content_name: f.name, content_type: 'product',
      value: f.price * qty, currency: 'INR',
    })
  }, [])

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, qty } : i))
    )
  }, [])

  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), [])
  const clear = useCallback(() => { setItems([]); setCoupon(null) }, [])
  const applyCoupon = useCallback((code: string) => setCoupon(code.trim().toUpperCase()), [])
  const removeCoupon = useCallback(() => setCoupon(null), [])
  const setPincode = useCallback((p: string) => setPincodeState(p.replace(/\D/g, '').slice(0, 6)), [])

  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((sum, i) => {
    const f = getFlavour(i.slug)
    return sum + (f ? f.price * i.qty : 0)
  }, 0)
  const discount = couponDiscount(coupon, subtotal)
  const shipping = items.length > 0 ? shippingFor(subtotal) : 0
  const total = Math.max(0, subtotal - discount) + shipping

  const qtyOf = (slug: string) => items.find((i) => i.slug === slug)?.qty ?? 0

  return (
    <Ctx.Provider
      value={{
        items, count, subtotal, discount, shipping, total, coupon, pincode, open, setOpen,
        qtyOf, add, setQty, remove, clear, applyCoupon, removeCoupon, setPincode,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export { FLAVOURS }
