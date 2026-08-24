# Ultimate Chicken — website

The site for **Ultimate Chicken**, India's first ready-to-eat sous vide chicken brand (`ultimatechicken.in`). Built solo: a 3D product experience, waitlist + ordering, transactional email, and a small outreach toolkit, all in one Next.js app.

## Highlights

- **3D product pouches** — interactive product render with React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`)
- **Scroll-driven motion** — GSAP + Framer Motion + Lenis smooth scroll
- **Commerce** — checkout, subscriptions, COD, and coupons
- **Backend** — Supabase (data), Resend + Nodemailer (transactional/newsletter email), Upstash Redis (rate limiting), Google APIs
- **Content** — flavour pages, transparency/ingredient pages, investor newsletter templates

## Stack

Next.js 16 · React 18 · TypeScript · Tailwind · Three.js / R3F · GSAP · Framer Motion · Supabase · Resend · Upstash · Zod + React Hook Form

## Run

```bash
npm install
cp .env.example .env.local     # Supabase, Resend, Upstash keys
npm run dev                    # http://localhost:3000
```

## Layout

```
app/          routes, API handlers (waitlist, orders, outreach)
components/    UI, 3D scene, sections
lib/          integrations (email, contacts, db helpers)
newsletters/  email templates + assets
outreach/     small outreach helper scripts (contact data is gitignored)
supabase/     schema / config
```

## Note

Secrets live in `.env.local` (gitignored). Real contact lists are **not** committed, `outreach/` ships only the scripts and a fake `contacts_template.csv`.
