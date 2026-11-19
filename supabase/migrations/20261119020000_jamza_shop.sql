-- JAMZA! shop goes live: items are managed from the admin panel (Shop).
--  * Photo storage for shop items (public bucket "shop-images"; only admins can upload).
--  * Tees are on hold: hidden, not deleted, so they can be switched back on from the admin.
--  * Caxixi (GHC 80) and glow sticks (GHC 5) are the shop items; glow sticks move from merch.
-- Safe to re-run. Run once in the Supabase SQL Editor.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-images', 'shop-images', true, 5000000, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5000000,
  allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists jamza_shop_image_read on storage.objects;
create policy jamza_shop_image_read on storage.objects for select to anon, authenticated
using (bucket_id = 'shop-images');

drop policy if exists jamza_shop_image_insert on storage.objects;
create policy jamza_shop_image_insert on storage.objects for insert to authenticated
with check (bucket_id = 'shop-images' and (select public.jamza_is_admin()));

drop policy if exists jamza_shop_image_update on storage.objects;
create policy jamza_shop_image_update on storage.objects for update to authenticated
using (bucket_id = 'shop-images' and (select public.jamza_is_admin()))
with check (bucket_id = 'shop-images' and (select public.jamza_is_admin()));

drop policy if exists jamza_shop_image_delete on storage.objects;
create policy jamza_shop_image_delete on storage.objects for delete to authenticated
using (bucket_id = 'shop-images' and (select public.jamza_is_admin()));

-- Tees: on hold.
update public.jamza_products set visible = false where id in ('tee-purple', 'tee-cream');

-- Shop items.
insert into public.jamza_products (id, name, section, price, image, sizes, blurb, visible, sort) values
  ('caxixi', 'Caxixi', 'shop', 80, '/images/shop/caxixi.webp', '', 'A woven basket shaker. Bring your own rhythm to the Concert.', true, 1),
  ('glow-stick', 'JAMZA! glow sticks', 'shop', 5, '/images/shop/glow-sticks.webp', '', 'For the After Party, obviously.', true, 2)
on conflict (id) do update set
  name = excluded.name, section = excluded.section, price = excluded.price, image = excluded.image,
  sizes = excluded.sizes, blurb = excluded.blurb, visible = excluded.visible, sort = excluded.sort;

-- Tees sit after the live items if they come back.
update public.jamza_products set sort = 10 where id = 'tee-purple';
update public.jamza_products set sort = 11 where id = 'tee-cream';

commit;
