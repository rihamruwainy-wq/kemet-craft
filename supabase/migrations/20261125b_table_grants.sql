-- Table privileges for the Data API roles. Row Level Security policies still
-- decide which rows each user can see or change; these grants only allow access.
grant usage on schema public to anon, authenticated, service_role;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, update on public.users to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.documents to anon, authenticated;
grant insert on public.documents to authenticated;

-- Server-side code (checkout, Stripe webhook) uses the service role
grant all on all tables in schema public to service_role;

grant execute on function public.search_products(text, int) to anon, authenticated;
grant execute on function public.is_seller() to authenticated;
grant execute on function public.buyer_owns_order(uuid) to authenticated;
grant execute on function public.seller_owns_order(uuid) to authenticated;

select 'grants applied' as status;
