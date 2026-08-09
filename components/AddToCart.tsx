'use client'

import { useCart } from '@/lib/cart'
import type { Flavour } from '@/lib/flavours'

/* Add-to-cart control shown under each flavour on the landing page.
   Empty → a full-width "Add to cart" button. In cart → a − qty + stepper. */
export default function AddToCart({ flavour }: { flavour: Flavour }) {
  const { qtyOf, add, setQty, setOpen } = useCart()
  const qty = qtyOf(flavour.slug)

  if (qty === 0) {
    return (
      <button
        onClick={() => add(flavour.slug, 1)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-deep py-3.5 font-condensed text-lg font-extrabold uppercase italic tracking-wide text-lime-brand transition-transform hover:scale-[1.02]"
      >
        Add to cart
        <span className="text-base">· ₹{flavour.price}</span>
      </button>
    )
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="flex flex-1 items-center justify-between rounded-full bg-green-deep px-2 py-1.5 text-cream">
        <button
          aria-label="Decrease quantity"
          onClick={() => setQty(flavour.slug, qty - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-lime-brand transition-colors hover:bg-white/10"
        >
          −
        </button>
        <span className="stat-num text-xl tabular-nums">{qty}</span>
        <button
          aria-label="Increase quantity"
          onClick={() => add(flavour.slug, 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-lime-brand transition-colors hover:bg-white/10"
        >
          +
        </button>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-lime-brand px-5 py-3 font-condensed text-base font-extrabold uppercase italic tracking-wide text-green-deep transition-transform hover:scale-[1.03]"
      >
        Cart →
      </button>
    </div>
  )
}
