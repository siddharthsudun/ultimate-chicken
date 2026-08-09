'use client'

import { useCart } from '@/lib/cart'

export default function CartButton({ className = '' }: { className?: string }) {
  const { count, setOpen } = useCart()
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lime-brand px-1 text-[11px] font-extrabold text-green-deep">
          {count}
        </span>
      )}
    </button>
  )
}
