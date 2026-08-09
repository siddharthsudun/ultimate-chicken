'use client'

import { useCart } from '@/lib/cart'

export default function CheckoutCTA() {
  const { count, subtotal, setOpen } = useCart()
  return (
    <button
      onClick={() => setOpen(true)}
      className="btn-lime !rounded-full !px-16 !py-6 !text-2xl !shadow-[0_10px_50px_-12px_rgba(203,245,18,0.6)] md:!text-3xl"
    >
      {count > 0 ? `Checkout · ${count} pouch${count === 1 ? '' : 'es'} · ₹${subtotal}` : 'Order the lineup →'}
    </button>
  )
}
