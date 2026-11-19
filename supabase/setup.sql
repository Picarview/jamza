-- JAMZA! complete setup for a NEW project: schema + 2026 content. Paste into Supabase > SQL Editor and Run.
-- Safe to run more than once: nothing is dropped and existing rows are kept.
-- Generated from supabase/migrations (with jamza_ names) — edit the migrations, not this file.

-- JAMZA! database schema (jamza_* names). For a NEW project; existing projects run the migrations.


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
-- JAMZA! 2026 starting content, generated from src/content/*.ts.
-- Safe to re-run: existing rows (matched by id) are left untouched, so admin edits are kept.
begin;

insert into public.jamza_artists (id, slug, name, role, tier, handle, image, bio, visible, sort) values
  ('susan-augustt', 'susan-augustt', 'Susan Augustt', 'Neo Afro-soul vocalist', 'main', 'susan_augustt', '/images/artists/susan-augustt.webp', 'Based in Accra, Susan Augustt is a neo Afro-soul powerhouse whose raw, emotive vocals seamlessly bridge the intimacy of jazz and funk with the infectious energy of her Ga-Ewe and Ashanti roots.

A professional performer for over a decade, she does not just sing; she preserves her heritage, weaving English with Twi and Ga to tell stories that resonate across borders.

Susan is a defining figure in Ghana’s alternative music scene and the founder of the “Augustt in August” annual concert series. A true DIY force of nature, she successfully self-managed two tours across Germany, proving her business acumen matches her vocal prowess.', true, 1),
  ('makayy', 'makayy', 'Makayy', 'Singer & guitarist · Founder of JAMZA!', 'main', 'makayy_official', '/images/artists/makayy.webp', 'Makayy is a Ghanaian musician, live performer and events planner with a passion for music, creative expression and the arts. As a singer and guitarist, she is drawn to indie, alternative and acoustic music, with a particular interest in instrumental arrangements and percussive sounds.

She has performed at venues and events including Beda’s, Zen Gardens, Accra Art District and Bella Afrikana. Beyond music, she is the founder of JAMZA!, a Ghanaian Christmas cultural festival spotlighting female artists and creatives, and co-founder of AJL Initiative, an instrument training programme equipping women with practical musical skills.

Makayy continues to explore the intersection of music, culture and creative development, and is preparing to release her debut single, “CaNdY,” in 2027.', true, 2),
  ('sea', 'sea', 'Sea', 'Alternative Afro, dancehall, R&B & soul', 'main', 'sea.ufo', '/images/artists/sea.webp', 'SEA THE UFO is a London-born, Accra-based artist of Ghanaian and Jamaican heritage, weaving alternative Afro, Dancehall, R&B and Soul into a genre-bending sound.

With her ethereal, breathy vocals and captivating presence, she balances softness with sensuality, creating music that celebrates individuality and defies convention.', true, 3),
  ('currie', 'currie', 'Currie', 'Gospel artist', 'main', 'tracy_currie_kanzy', '/images/artists/currie.webp', 'Currie is a rising gospel artist with over nine years of musical experience. Blending contemporary gospel with Afro-inspired sounds, she brings a unique expression to her music, using her gift to inspire, uplift, and connect with people through meaningful songs that reflect faith, hope, and life.', true, 4),
  ('jahzara', 'jahzara', 'Jahzara', 'Co-host & performer', 'main', 'jahzaraagyemang', '/images/artists/jahzara.webp', 'Jahzara! — Diva of Ceremonies and International Host — is bringing the heat from Philadelphia, USA to Ghana! A singer-songwriter, bassist, and frontwoman of The Moonshadow Band, with a wild vibe combination of jazz fusion, funk, yacht rock and house.

Over 20 years of performing, traveling, fashion shows and concerts internationally, she is bringing that big ENERGY to JAMZA! 2026 as our co-host and performer. Jahzara! is affectionately known in Ghana as Obaa Yaa Papabi!', true, 5),
  ('riaboss', 'riaboss', 'Riaboss', 'Vocalist & songwriter', 'main', 'theriaboss', '/images/artists/riaboss.webp', 'A cat that wears many hats, Ria Boss (also known as Cat Mama) is most well known for being a powerhouse vocalist, songwriter and passionate live performer.

She is also deeply rooted in community, having co-founded the live performance showcase and open mic platform “Ria Boss Open Mic”, and serving as the Creative Lead and Programs Facilitator for Black Girls Glow.

Her latest release “Place I go to” is out now, a collaboration with the artist and Black Girls Glow alumni, malaïka. She is currently working on her next album and interdisciplinary project “Heartbreak Hotel” in her home of Accra.', true, 6),
  ('ami', 'ami', 'Ami', 'Sound for healing, feeling & joy', 'main', 'ami_tamakloe', '/images/artists/ami.webp', 'Ami Tamakloe is a multidisciplinary cultural worker who uses sound as a tool for healing, feeling and joy. Whether spoken or sung, hummed or belted.', true, 7),
  ('mvssy', 'mvssy', 'MVSSY', 'Singer & songwriter', 'main', 'saymvssyxo', '/images/artists/mvssy.webp', 'MVSSY is a Ghanaian singer and songwriter. She began singing at age five and launched her career in 2018 as a backing vocalist for Efya, M.anifest, Kwesi Arthur, King Promise and MzVee.

Now recording, she’s shaping a bold contemporary Alternative African sound and tapping into diverse genres. Inspired by R&B and jazz, she likes to fuse them with Afrobeats.

She loves to connect through live music and is driven by connecting with her listeners, believing sound and music is a universal language which speaks to the soul.', true, 8),
  ('duafe-adenkum-palmwine-band', 'duafe-adenkum-palmwine-band', 'Duafe Adenkum Palmwine Band', 'Traditional Akan Adenkum music', 'guest', 'duafe.adenkum.band', '/images/artists/duafe-adenkum-palmwine-band.webp', 'The Duafe Adenkum Band is a traditional Ghanaian music group founded in March 2025 by singer-songwriter Awura-Ama Agyapong, known professionally as Rama Blak.

The group seeks to revive and reintroduce the traditional Akan Adenkum music practice into contemporary spaces, creating performance, skill-building, and income-earning opportunities for young women in Ghana’s music industry.', true, 9),
  ('teniade', 'teniade', 'Teniadé', 'Afrosoul singer & producer', 'guest', 'tenimuse', '/images/artists/teniade.webp', 'Teniadé is a British-Nigerian afrosoul singer and producer. Her music is an eclectic blend of sultry funk, jazz, soul and afrobeat crafted in Lagos and Accra.

She is greatly inspired by artists such as the legendary Sade, Fela Kuti, Ebo Taylor and Bob Marley.', true, 10),
  ('akoto', 'akoto', 'Akoto', 'Special guest', 'guest', 'divaakoto', '', '', true, 11),
  ('leuce', 'leuce', 'Leuce', 'Poet, writer & artist · Founder of Break Time', 'guest', 'leuce_777', '/images/artists/leuce.webp', 'LEUCE is a poet, writer and artist based in Accra, Ghana. She writes the way she thinks, out loud and a little unruly, about death, food, God, grief, and what it means to feed your soul on purpose. Her work lives where poetry meets philosophy, with fashion, makeup, yoga and, lately, music all folded in, because to her they’re just different languages for the same feelings.

She’s the founder of Break Time, a free monthly community space for art, fun, expression and mental health awareness, and she writes for Abysmal Productions, a creative house that makes theatre and projects that talk about the things people usually whisper. Mental health advocacy isn’t a side topic for her. It’s in everything she makes.

Her philosophy is simple: live freely, love openly, and let others do the same.', true, 12),
  ('seyram', 'seyram', 'Seyram', 'Spoken-word poet', 'guest', 'sey.word', '/images/artists/seyram.webp', 'Seyram Aveh, known as Seyword, is a Ghanaian spoken-word poet, storyteller, and student leader. Her work explores themes of identity, society, patriotism, and personal reflection, with performances including “Gold Coast Echoes” and “Shine Ghana.”

Beyond her creative work, Seyram is passionate about leadership and student advocacy. Through both her art and leadership, she seeks to inspire, empower, and create meaningful conversations within her community.', true, 13),
  ('enam', 'enam', 'Enam', 'Afro-spiritual vocalist', 'guest', 'enammusic__', '/images/artists/enam.webp', 'Enam Keteku Angela, popularly known as Enam (HADZIVODUSHI), is a powerful vocalist from Ghana, West Africa. Her genre of music is called Afro-spiritual, influenced by the Hadzivodushis (sound goddesses) of the “Yeweh shrine”.

Enam started her musical journey from the shrine; her love for music grew stronger when she was singing with her great-grandmothers in the shrines in early childhood. This is not your regular music but chants woven in the frequency and vibrations of a higher dimension, to offer general healing and connection to the cosmic realms and planes.

Enam the HADZIVODUSHI aspires to continue her ancestral genre of music and make it available to the whole world. Despite her versatility over the years, Enam has been mainly consistent and known for her unique smooth vocals and thick blond locs.', true, 14),
  ('qany', 'qany', 'Qany', 'Special guest', 'guest', 'q.a.n.y_musichub', '', '', true, 15)
on conflict (id) do nothing;

insert into public.jamza_partners (id, name, url, image, tagline, visible, sort) values
  ('wafa-house', 'Wafa House', '', '/images/partners/wafa-house.webp', '', true, 1),
  ('picarview', 'Picarview', '', '/images/partners/picarview.webp', '', true, 2),
  ('beda-s-events-center', 'Beda’s Events Center', '', '/images/partners/bedas.webp', 'Our venue', true, 3),
  ('phyr3haus', 'PHYR3HAUS', '', '/images/partners/phyr3haus.webp', '', true, 4),
  ('afrodite-society', 'Afrodite Society', '', '/images/partners/afrodite-society.webp', '', true, 5),
  ('breaktime-hq', 'Breaktime_hq', '', '/images/partners/breaktime-hq.webp', '', true, 6),
  ('stonehouse', 'Stonehouse', '', '/images/partners/stonehouse.webp', '', true, 7),
  ('kobena-africa', 'Kobena Africa', '', '/images/partners/kobena-africa.webp', '', true, 8),
  ('gtp', 'GTP', '', '/images/partners/gtp.webp', 'Life. Styled.', true, 9),
  ('icewise', 'Icewise', '', '/images/partners/icewise.webp', '', true, 10)
on conflict (id) do nothing;

insert into public.jamza_products (id, name, section, price, image, sizes, blurb, visible, sort) values
  ('tee-purple', 'JAMZA! tee — Purple', 'shop', null, '/images/shop/tee-purple.webp', 'S, M, L, XL, XXL', 'Deep purple with the cream JAMZA! mark and half-moon hem.', true, 1),
  ('tee-cream', 'JAMZA! tee — Cream', 'shop', null, '/images/shop/tee-cream.webp', 'S, M, L, XL, XXL', 'Soft cream fading to lilac, with the purple JAMZA! mark.', true, 2),
  ('cake', 'JAMZA! cake', 'merch', null, '', '', 'A festive treat, baked for the night.', true, 3),
  ('bracelet', 'JAMZA! bracelet', 'merch', null, '', '', 'Wear the festival on your wrist.', true, 4),
  ('necklace', 'JAMZA! necklace', 'merch', null, '', '', 'A keepsake from the night.', true, 5),
  ('glow-stick', 'JAMZA! glow sticks', 'merch', null, '', '', 'For the After Party, obviously.', true, 6)
on conflict (id) do nothing;

commit;
