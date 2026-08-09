-- Ultimate Chicken — orders schema (Supabase / Postgres)
-- Run this in the Supabase dashboard → SQL Editor once the project is created.
-- Security model:
--   * RLS is ON with NO anon/authenticated policies  → default-deny for the browser.
--   * The browser (anon key) can NEVER read or write this table.
--   * Order writes happen ONLY from our server route using the SERVICE ROLE key
--     (service_role bypasses RLS). That key must live in server env vars only.
--   * Admin reads happen ONLY from our password-gated server route (also service role).

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  ref           text,
  type          text,                 -- 'Order' | 'Subscription'
  payment       text,                 -- 'Cash on Delivery' | 'Razorpay (online)' | 'Razorpay Autopay'
  status        text,                 -- 'Placed' | 'Paid' | 'Active (new)' | 'Weekly charge'
  items         text,
  pcs           integer,
  subtotal      integer,
  discount      integer,
  coupon        text,
  shipping      integer,
  cod_fee       integer,
  total         integer,
  -- customer PII
  name          text,
  phone         text,
  email         text,
  address       text,
  pincode       text,
  city          text,
  state         text,
  -- subscription delivery prefs
  delivery_day  text,
  delivery_slot text,
  -- dedup key (e.g. Razorpay payment id) so online-success + webhook record once
  dedup_key     text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create unique index if not exists orders_dedup_key_uidx on public.orders (dedup_key) where dedup_key is not null;

-- Lock it down: enable RLS, add NO policies → every request via anon/authenticated
-- keys is denied. Only the service_role key (server-side) can touch the data.
alter table public.orders enable row level security;
alter table public.orders force row level security;

-- Belt-and-suspenders: revoke direct grants from the public-facing roles.
revoke all on public.orders from anon, authenticated;

-- ── Single-use coupon redemptions ─────────────────────────────────────────────
-- One row per redeemed single-use coupon. UNIQUE(code) makes redemption atomic:
-- the second attempt to use a single-use code fails (23505). Records who used it.
create table if not exists public.coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  order_ref  text,
  name       text,
  phone      text,
  email      text,
  used_at    timestamptz not null default now()
);

alter table public.coupon_redemptions enable row level security;
alter table public.coupon_redemptions force row level security;
revoke all on public.coupon_redemptions from anon, authenticated;
