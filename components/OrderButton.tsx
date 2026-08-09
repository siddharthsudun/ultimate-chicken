'use client'

/* "Order Now" CTA — jumps to the flavours/product section on the homepage where every
   product is shown with prices and add-to-cart. Ordering flows cart → checkout → Razorpay. */
export default function OrderButton({
  className = 'btn-lime',
  children = 'Order Now',
}: {
  className?: string
  children?: React.ReactNode
}) {
  const onClick = () => {
    const el = typeof document !== 'undefined' ? document.getElementById('flavours') : null
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else window.location.href = '/#flavours'
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}
