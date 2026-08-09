// Single source of truth for the WhatsApp "Order Now" link.
// Orders + payment happen in WhatsApp via an existing automation.
const PHONE = '917075536942' // +91 70755 36942 — no + or spaces for wa.me
const PREFILL = "Hi Ultimate Chicken! I'd like to order 🐔"

export const WHATSAPP_ORDER_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(PREFILL)}`
