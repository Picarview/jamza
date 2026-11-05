-- Enable artist photography and announcement/blog cover uploads.
-- Existing tables, content, administrator accounts, and partner-logo rules are unchanged.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('artist-images', 'artist-images', true, 5000000, array['image/png','image/jpeg','image/webp']),
  ('post-images', 'post-images', true, 5000000, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true, file_size_limit=5000000,
  allowed_mime_types=array['image/png','image/jpeg','image/webp'];

drop policy if exists jamza_content_image_read on storage.objects;
create policy jamza_content_image_read on storage.objects for select to anon, authenticated
using (bucket_id in ('artist-images','post-images'));

drop policy if exists jamza_content_image_insert on storage.objects;
create policy jamza_content_image_insert on storage.objects for insert to authenticated
with check (bucket_id in ('artist-images','post-images') and (select public.picarview_is_admin()));

drop policy if exists jamza_content_image_update on storage.objects;
create policy jamza_content_image_update on storage.objects for update to authenticated
using (bucket_id in ('artist-images','post-images') and (select public.picarview_is_admin()))
with check (bucket_id in ('artist-images','post-images') and (select public.picarview_is_admin()));

drop policy if exists jamza_content_image_delete on storage.objects;
create policy jamza_content_image_delete on storage.objects for delete to authenticated
using (bucket_id in ('artist-images','post-images') and (select public.picarview_is_admin()));
commit;
