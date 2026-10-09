-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_id text not null unique,
  customer jsonb not null,
  delivery jsonb not null,
  items jsonb not null,
  amount bigint not null check (amount >= 0),
  payment_reference text not null unique,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'initialization_failed')),
  order_status text not null default 'awaiting_payment'
    check (order_status in ('awaiting_payment', 'processing', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled')),
  paid_at timestamptz,
  confirmation_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- Orders are only accessed by trusted Netlify functions using the service-role key.
-- Keep direct client access disabled; never expose the service-role key to the browser.
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
