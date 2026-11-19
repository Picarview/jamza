-- JAMZA! database schema (jamza_* names). For a NEW project; existing projects run the migrations.
-- Safe to run more than once: nothing is dropped and existing rows are kept.
-- Generated from supabase/migrations (with jamza_ names) — edit the migrations, not this file.


-- ===== 20261101000000_initial_schema.sql =====
-- picarview: run this entire script in your project's Supabase SQL Editor.
-- It creates only jamza_* tables and the partner-logos bucket.
-- It does not create users or grant anyone administrator access.
begin;

create table if not exists public.jamza_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.jamza_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.jamza_admins where user_id = (select auth.uid())); $$;
revoke all on function public.jamza_is_admin() from public, anon;
grant execute on function public.jamza_is_admin() to authenticated;

create table if not exists public.jamza_artists (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  name text not null check (length(btrim(name)) between 1 and 300),
  role text not null check (length(btrim(role)) between 1 and 300),
  image text not null check (image ~ '^https?://' and length(image) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.jamza_posts (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  title text not null check (length(btrim(title)) between 1 and 300),
  category text not null check (length(btrim(category)) between 1 and 300),
  date date not null default current_date,
  status text not null default 'Draft' check (status in ('Draft','Published')),
  image text not null check (image ~ '^https?://' and length(image) <= 2048),
  excerpt text not null check (length(btrim(excerpt)) between 1 and 350),
  body text not null check (length(btrim(body)) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.jamza_partners (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  name text not null check (length(btrim(name)) between 1 and 300),
  url text not null default '' check (url = '' or (url ~ '^https?://' and length(url) <= 2048)),
  image text not null default '' check (image = '' or (image ~ '^https?://' and length(image) <= 2048)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.jamza_settings (
  id text primary key default 'site' check (id = 'site'),
  title text not null default 'picarview' check (length(btrim(title)) between 1 and 60),
  email text not null default 'hello@picarview.com' check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  instagram text not null default '' check (instagram = '' or (instagram ~ '^https?://' and length(instagram) <= 2048)),
  linkedin text not null default '' check (linkedin = '' or (linkedin ~ '^https?://' and length(linkedin) <= 2048)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.jamza_messages (
  id text primary key default gen_random_uuid()::text,
  name text not null check (length(btrim(name)) between 1 and 100),
  email text not null check (length(email) <= 200 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (length(btrim(subject)) between 1 and 160),
  message text not null check (length(btrim(message)) between 1 and 5000),
  date timestamptz not null default now(),
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jamza_messages_email_date on public.jamza_messages (lower(email), date desc);
create index if not exists jamza_posts_status_date on public.jamza_posts (status, date desc);

create or replace function public.jamza_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.jamza_touch_updated_at() from public, anon, authenticated;

-- Enable RLS and reset only this application's named policies/triggers.
do $$
declare item text;
begin
  foreach item in array array['artists','posts','partners','settings','messages'] loop
    execute format('alter table public.%I enable row level security', 'jamza_' || item);
    execute format('revoke all on public.%I from anon, authenticated', 'jamza_' || item);
    execute format('grant select, insert, update, delete on public.%I to authenticated', 'jamza_' || item);
    execute format('drop policy if exists jamza_admin_manage on public.%I', 'jamza_' || item);
    execute format('create policy jamza_admin_manage on public.%I for all to authenticated using ((select public.jamza_is_admin())) with check ((select public.jamza_is_admin()))', 'jamza_' || item);
    execute format('drop trigger if exists jamza_updated_at on public.%I', 'jamza_' || item);
    execute format('create trigger jamza_updated_at before update on public.%I for each row execute function public.jamza_touch_updated_at()', 'jamza_' || item);
  end loop;
end;
$$;
alter table public.jamza_admins enable row level security;
revoke all on public.jamza_admins from anon, authenticated;
grant select on public.jamza_admins to authenticated;
drop policy if exists jamza_read_own_admin on public.jamza_admins;
create policy jamza_read_own_admin on public.jamza_admins for select to authenticated using (user_id = (select auth.uid()));

grant select on public.jamza_artists, public.jamza_posts, public.jamza_partners, public.jamza_settings to anon;
drop policy if exists jamza_public_read on public.jamza_artists;
create policy jamza_public_read on public.jamza_artists for select to anon, authenticated using (true);
drop policy if exists jamza_public_read on public.jamza_partners;
create policy jamza_public_read on public.jamza_partners for select to anon, authenticated using (true);
drop policy if exists jamza_public_read on public.jamza_settings;
create policy jamza_public_read on public.jamza_settings for select to anon, authenticated using (true);
drop policy if exists jamza_public_read on public.jamza_posts;
create policy jamza_public_read on public.jamza_posts for select to anon, authenticated using (status = 'Published');

-- No public table access to messages. This function accepts validated submissions
-- without returning IDs or message data, and limits each email to 3 per 15 minutes.
create or replace function public.jamza_submit_message(p_name text, p_email text, p_subject text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_name is null or p_email is null or p_subject is null or p_message is null
     or length(btrim(p_name)) not between 1 and 100
     or length(btrim(p_email)) not between 3 and 200
     or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or length(btrim(p_subject)) not between 1 and 160
     or length(btrim(p_message)) not between 1 and 5000 then
    raise exception 'Please provide valid contact details and a message.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(btrim(p_email)), 0));
  if (select count(*) from public.jamza_messages where lower(email) = lower(btrim(p_email)) and date > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait 15 minutes.' using errcode = 'P0001';
  end if;
  insert into public.jamza_messages (name,email,subject,message)
  values (btrim(p_name),lower(btrim(p_email)),btrim(p_subject),btrim(p_message));
end;
$$;
revoke all on function public.jamza_submit_message(text,text,text,text) from public;
grant execute on function public.jamza_submit_message(text,text,text,text) to anon, authenticated;

insert into public.jamza_settings(id) values ('site') on conflict (id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('partner-logos','partner-logos',true,400000,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=400000,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
drop policy if exists jamza_logo_read on storage.objects;
create policy jamza_logo_read on storage.objects for select to anon, authenticated using (bucket_id = 'partner-logos');
drop policy if exists jamza_logo_insert on storage.objects;
create policy jamza_logo_insert on storage.objects for insert to authenticated with check (bucket_id = 'partner-logos' and (select public.jamza_is_admin()));
drop policy if exists jamza_logo_update on storage.objects;
create policy jamza_logo_update on storage.objects for update to authenticated using (bucket_id = 'partner-logos' and (select public.jamza_is_admin())) with check (bucket_id = 'partner-logos' and (select public.jamza_is_admin()));
drop policy if exists jamza_logo_delete on storage.objects;
create policy jamza_logo_delete on storage.objects for delete to authenticated using (bucket_id = 'partner-logos' and (select public.jamza_is_admin()));

commit;
-- NEXT: create a user in Authentication > Users, then approve that exact user ID:
-- insert into public.jamza_admins(user_id) values ('YOUR-USER-UUID') on conflict do nothing;

-- ===== 20261101010000_jamza_brand.sql =====
-- Update public branding without renaming tables, changing access, or touching custom settings.
begin;

alter table public.jamza_settings alter column title set default 'jamza';
alter table public.jamza_settings alter column email set default 'hello@jamza.com';

update public.jamza_settings set title = 'jamza'
where id = 'site' and lower(btrim(title)) = 'picarview';

-- This is placeholder contact information; configure your real address in General Settings.
update public.jamza_settings set email = 'hello@jamza.com'
where id = 'site' and lower(btrim(email)) = 'hello@picarview.com';

update public.jamza_posts
set excerpt = 'An introduction to the ideas and people at the heart of jamza.'
where id = 'p1' and excerpt = 'An introduction to the ideas and people at the heart of picarview.';

commit;

-- ===== 20261101020000_content_image_uploads.sql =====
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
with check (bucket_id in ('artist-images','post-images') and (select public.jamza_is_admin()));

drop policy if exists jamza_content_image_update on storage.objects;
create policy jamza_content_image_update on storage.objects for update to authenticated
using (bucket_id in ('artist-images','post-images') and (select public.jamza_is_admin()))
with check (bucket_id in ('artist-images','post-images') and (select public.jamza_is_admin()));

drop policy if exists jamza_content_image_delete on storage.objects;
create policy jamza_content_image_delete on storage.objects for delete to authenticated
using (bucket_id in ('artist-images','post-images') and (select public.jamza_is_admin()));
commit;

-- ===== 20261119000000_jamza_2026.sql =====
-- JAMZA! 2026: festival settings, lineup pages, partners, shop & merch, vouchers, typed inbox.
-- Additive and re-runnable: no table or row is dropped. Run once in the Supabase SQL Editor,
-- then run supabase/seed/2026_content.sql to load the current lineup, partners and products.
begin;

-- ---------- Inbox: message type and workflow status ----------
alter table public.jamza_messages add column if not exists kind text not null default 'letter';
alter table public.jamza_messages add column if not exists status text not null default 'new';
alter table public.jamza_messages drop constraint if exists jamza_messages_kind_check;
alter table public.jamza_messages add constraint jamza_messages_kind_check
  check (kind in ('letter','shop','merch','shuttle','vendor','sales-team','voucher'));
alter table public.jamza_messages drop constraint if exists jamza_messages_status_check;
alter table public.jamza_messages add constraint jamza_messages_status_check
  check (status in ('new','read','done'));
update public.jamza_messages set status = 'read' where read and status = 'new';

-- Typed submissions (same validation and 3-per-15-minutes limit as jamza_submit_message).
create or replace function public.jamza_submit(p_kind text, p_name text, p_email text, p_subject text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_kind is null or p_kind not in ('letter','shop','merch','shuttle','vendor','sales-team') then
    raise exception 'Unknown form.' using errcode = '22023';
  end if;
  if p_name is null or p_email is null or p_subject is null or p_message is null
     or length(btrim(p_name)) not between 1 and 100
     or length(btrim(p_email)) not between 3 and 200
     or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or length(btrim(p_subject)) not between 1 and 160
     or length(btrim(p_message)) not between 1 and 5000 then
    raise exception 'Please provide valid contact details and a message.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(btrim(p_email)), 0));
  if (select count(*) from public.jamza_messages where lower(email) = lower(btrim(p_email)) and date > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait 15 minutes.' using errcode = 'P0001';
  end if;
  insert into public.jamza_messages (kind,name,email,subject,message)
  values (p_kind,btrim(p_name),lower(btrim(p_email)),btrim(p_subject),btrim(p_message));
end;
$$;
revoke all on function public.jamza_submit(text,text,text,text,text) from public;
grant execute on function public.jamza_submit(text,text,text,text,text) to anon, authenticated;

-- ---------- Settings: festival details editable from the admin ----------
alter table public.jamza_settings add column if not exists ticket_url text not null default '';
alter table public.jamza_settings add column if not exists community_price text not null default '';
alter table public.jamza_settings add column if not exists shop_deadline text not null default '';
alter table public.jamza_settings add column if not exists shuttle_departure text not null default '';
alter table public.jamza_settings add column if not exists shuttle_return text not null default '';
alter table public.jamza_settings add column if not exists vendor_deadline date;
alter table public.jamza_settings drop constraint if exists jamza_settings_ticket_url_check;
alter table public.jamza_settings add constraint jamza_settings_ticket_url_check
  check (ticket_url = '' or (ticket_url ~ '^https://' and length(ticket_url) <= 2048));
update public.jamza_settings set
  email = case when lower(btrim(email)) in ('hello@jamza.com','hello@picarview.com','example@jamza.com') then 'jamzafestival@gmail.com' else email end,
  instagram = case when instagram = '' then 'https://www.instagram.com/jamza_festival/' else instagram end,
  vendor_deadline = coalesce(vendor_deadline, date '2026-11-28')
where id = 'site';

-- ---------- Artists: one page per artist ----------
alter table public.jamza_artists drop constraint if exists jamza_artists_image_check;
alter table public.jamza_artists add constraint jamza_artists_image_check
  check (image = '' or ((image ~ '^https://' or image ~ '^/images/') and length(image) <= 2048));
alter table public.jamza_artists add column if not exists slug text;
alter table public.jamza_artists add column if not exists tier text not null default 'main';
alter table public.jamza_artists add column if not exists handle text not null default '';
alter table public.jamza_artists add column if not exists bio text not null default '';
alter table public.jamza_artists add column if not exists visible boolean not null default true;
alter table public.jamza_artists add column if not exists sort integer not null default 1000;
update public.jamza_artists set slug = id where slug is null;
alter table public.jamza_artists alter column slug set not null;
alter table public.jamza_artists drop constraint if exists jamza_artists_slug_check;
alter table public.jamza_artists add constraint jamza_artists_slug_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('admin','shop','merch','visit','join','partners','2025'));
create unique index if not exists jamza_artists_slug_key on public.jamza_artists (slug);
alter table public.jamza_artists drop constraint if exists jamza_artists_tier_check;
alter table public.jamza_artists add constraint jamza_artists_tier_check check (tier in ('main','guest'));
alter table public.jamza_artists drop constraint if exists jamza_artists_bio_check;
alter table public.jamza_artists add constraint jamza_artists_bio_check check (length(bio) <= 6000);

-- ---------- Partners ----------
alter table public.jamza_partners drop constraint if exists jamza_partners_image_check;
alter table public.jamza_partners add constraint jamza_partners_image_check
  check (image = '' or ((image ~ '^https://' or image ~ '^/images/') and length(image) <= 2048));
alter table public.jamza_partners add column if not exists tagline text not null default '';
alter table public.jamza_partners add column if not exists visible boolean not null default true;
alter table public.jamza_partners add column if not exists sort integer not null default 1000;

-- ---------- Shop & merch ----------
create table if not exists public.jamza_products (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  name text not null check (length(btrim(name)) between 1 and 120),
  section text not null default 'shop' check (section in ('shop','merch')),
  price numeric(10,2) check (price is null or price >= 0),
  image text not null default '' check (image = '' or ((image ~ '^https://' or image ~ '^/images/') and length(image) <= 2048)),
  sizes text not null default '' check (length(sizes) <= 200),
  blurb text not null default '' check (length(blurb) <= 500),
  visible boolean not null default true,
  sort integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Vouchers ----------
create table if not exists public.jamza_vouchers (
  id text primary key default gen_random_uuid()::text,
  code text not null unique check (code ~ '^[A-Z0-9-]{4,24}$'),
  note text not null default '' check (length(note) <= 200),
  max_uses integer not null default 1 check (max_uses between 1 and 10000),
  uses integer not null default 0 check (uses >= 0),
  active boolean not null default true,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (uses <= max_uses)
);
create table if not exists public.jamza_voucher_redemptions (
  id bigint generated always as identity primary key,
  voucher_id text not null references public.jamza_vouchers(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (voucher_id, email)
);
create table if not exists public.jamza_voucher_attempts (
  id bigint generated always as identity primary key,
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists jamza_voucher_attempts_time on public.jamza_voucher_attempts (created_at);

-- Redeem a code: validates, claims one use atomically, and files the request in the inbox.
-- Returns 'ok', 'invalid', 'expired', 'used' or 'already'. Never reveals other codes.
create or replace function public.jamza_redeem_voucher(p_code text, p_name text, p_email text, p_phone text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v public.jamza_vouchers;
  v_code text := upper(regexp_replace(coalesce(p_code,''), '\s', '', 'g'));
  v_mail text := lower(btrim(coalesce(p_email,'')));
begin
  if v_code !~ '^[A-Z0-9-]{4,24}$'
     or length(btrim(coalesce(p_name,''))) not between 1 and 100
     or v_mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(v_mail) > 200
     or length(btrim(coalesce(p_phone,''))) not between 3 and 30 then
    raise exception 'Please provide a valid code and contact details.' using errcode = '22023';
  end if;
  -- Slow down guessing: at most 30 failed attempts across the site per 10 minutes.
  if (select count(*) from public.jamza_voucher_attempts where not ok and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'Too many attempts. Please try again later.' using errcode = 'P0001';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_mail, 0));
  if (select count(*) from public.jamza_messages where lower(email) = v_mail and date > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait 15 minutes.' using errcode = 'P0001';
  end if;

  select * into v from public.jamza_vouchers where jamza_vouchers.code = v_code for update;
  if not found then
    insert into public.jamza_voucher_attempts(ok) values (false);
    return 'invalid';
  end if;
  if not v.active or (v.expires_at is not null and v.expires_at < (now() at time zone 'Africa/Accra')::date) then
    insert into public.jamza_voucher_attempts(ok) values (false);
    return 'expired';
  end if;
  if exists (select 1 from public.jamza_voucher_redemptions r where r.voucher_id = v.id and r.email = v_mail) then
    return 'already';
  end if;
  if v.uses >= v.max_uses then
    return 'used';
  end if;

  update public.jamza_vouchers set uses = uses + 1 where id = v.id;
  insert into public.jamza_voucher_redemptions(voucher_id, email) values (v.id, v_mail);
  insert into public.jamza_voucher_attempts(ok) values (true);
  insert into public.jamza_messages (kind,name,email,subject,message)
  values ('voucher', btrim(p_name), v_mail, 'Voucher ' || v_code || ' — ' || btrim(p_name),
          '[Ticket voucher]' || chr(10) || chr(10) || 'Voucher code: ' || v_code || chr(10)
          || 'Full name: ' || btrim(p_name) || chr(10) || 'Phone / WhatsApp: ' || btrim(p_phone) || chr(10)
          || 'Claimed automatically (' || (v.uses + 1) || ' of ' || v.max_uses || '). Send their free ticket.');
  return 'ok';
end;
$$;
revoke all on function public.jamza_redeem_voucher(text,text,text,text) from public;
grant execute on function public.jamza_redeem_voucher(text,text,text,text) to anon, authenticated;

-- ---------- Access rules for the new tables (admin-only writes, same as existing tables) ----------
do $$
declare item text;
begin
  foreach item in array array['jamza_products','jamza_vouchers','jamza_voucher_redemptions','jamza_voucher_attempts'] loop
    execute format('alter table public.%I enable row level security', item);
    execute format('revoke all on public.%I from anon, authenticated', item);
    execute format('grant select, insert, update, delete on public.%I to authenticated', item);
    execute format('drop policy if exists jamza_admin_manage on public.%I', item);
    execute format('create policy jamza_admin_manage on public.%I for all to authenticated using ((select public.jamza_is_admin())) with check ((select public.jamza_is_admin()))', item);
  end loop;
  foreach item in array array['jamza_products','jamza_vouchers'] loop
    execute format('drop trigger if exists jamza_updated_at on public.%I', item);
    execute format('create trigger jamza_updated_at before update on public.%I for each row execute function public.jamza_touch_updated_at()', item);
  end loop;
end;
$$;

-- Public reads: visible items only. Admins still see everything through jamza_admin_manage.
grant select on public.jamza_products to anon;
drop policy if exists jamza_public_read on public.jamza_products;
create policy jamza_public_read on public.jamza_products for select to anon, authenticated using (visible);
drop policy if exists jamza_public_read on public.jamza_artists;
create policy jamza_public_read on public.jamza_artists for select to anon, authenticated using (visible);
drop policy if exists jamza_public_read on public.jamza_partners;
create policy jamza_public_read on public.jamza_partners for select to anon, authenticated using (visible);

commit;
