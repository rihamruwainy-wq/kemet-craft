-- KemetCraft: order items, seller access, chat rooms, product search
-- Applied in the Supabase SQL editor on 2026-11-25

-- 1. Profile for the existing account (created before the signup trigger) as a seller
insert into public.users (id, email, full_name, avatar_url, role)
select id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url', 'seller'
from auth.users
where email = 'rihamruwainy@gmail.com'
on conflict (id) do update set role = 'seller';

-- 2. Helper functions (security definer avoids RLS recursion between orders and order_items)
create or replace function public.is_seller()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role in ('seller', 'admin'));
$$;

create or replace function public.buyer_owns_order(oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders where id = oid and buyer_id = auth.uid());
$$;

create or replace function public.seller_owns_order(oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = oid and p.seller_id = auth.uid()
  );
$$;

-- 3. Sellers manage their own products
drop policy if exists "Sellers can update own products" on public.products;
create policy "Sellers can update own products" on public.products
  for update using (auth.uid() = seller_id);
drop policy if exists "Sellers can delete own products" on public.products;
create policy "Sellers can delete own products" on public.products
  for delete using (auth.uid() = seller_id);

-- 4. Which product each order is for (order_items), visible to its buyer and seller
drop policy if exists "Buyers and sellers view order items" on public.order_items;
create policy "Buyers and sellers view order items" on public.order_items
  for select using (
    public.buyer_owns_order(order_id)
    or exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid())
  );

drop policy if exists "Sellers view orders for their products" on public.orders;
create policy "Sellers view orders for their products" on public.orders
  for select using (public.seller_owns_order(id));

-- 5. Live chat: one room per buyer (room_id = buyer's user id); sellers see all rooms
alter table public.messages add column if not exists sender_name text;
drop policy if exists "Authenticated users can use chat" on public.messages;
drop policy if exists "Read own room or seller" on public.messages;
create policy "Read own room or seller" on public.messages
  for select using (room_id = auth.uid()::text or public.is_seller());
drop policy if exists "Write own room or seller" on public.messages;
create policy "Write own room or seller" on public.messages
  for insert with check (
    sender_id = auth.uid() and (room_id = auth.uid()::text or public.is_seller())
  );

-- 6. Product search for the AI assistant (free Postgres full-text search, any-word match)
create or replace function public.search_products(q text, max_results int default 6)
returns setof public.products language sql stable as $$
  with query as (
    select nullif(replace(plainto_tsquery('english', q)::text, '&', '|'), '')::tsquery as tsq
  )
  select p.*
  from public.products p, query
  where query.tsq is not null
    and to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.era_tag, '')) @@ query.tsq
  order by ts_rank(
    to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.era_tag, '')),
    query.tsq
  ) desc
  limit max_results;
$$;
