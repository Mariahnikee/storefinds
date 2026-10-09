-- Run this in Supabase Dashboard > SQL Editor.
-- One shared cart per authenticated user. RLS ensures users only access their own cart.
create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_carts enable row level security;

grant select, insert, update on public.user_carts to authenticated;
revoke all on public.user_carts from anon;

drop policy if exists "Users can read their own cart" on public.user_carts;
create policy "Users can read their own cart"
  on public.user_carts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own cart" on public.user_carts;
create policy "Users can create their own cart"
  on public.user_carts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own cart" on public.user_carts;
create policy "Users can update their own cart"
  on public.user_carts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

do $$
begin
  alter publication supabase_realtime add table public.user_carts;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
