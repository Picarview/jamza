-- JAMZA! 2026: festival settings, lineup pages, partners, shop & merch, vouchers, typed inbox.
-- Additive and re-runnable: no table or row is dropped. Run once in the Supabase SQL Editor,
-- then run supabase/seed/2026_content.sql to load the current lineup, partners and products.
begin;

-- ---------- Inbox: message type and workflow status ----------
alter table public.picarview_messages add column if not exists kind text not null default 'letter';
alter table public.picarview_messages add column if not exists status text not null default 'new';
alter table public.picarview_messages drop constraint if exists picarview_messages_kind_check;
alter table public.picarview_messages add constraint picarview_messages_kind_check
  check (kind in ('letter','shop','merch','shuttle','vendor','sales-team','voucher'));
alter table public.picarview_messages drop constraint if exists picarview_messages_status_check;
alter table public.picarview_messages add constraint picarview_messages_status_check
  check (status in ('new','read','done'));
update public.picarview_messages set status = 'read' where read and status = 'new';

-- Typed submissions (same validation and 3-per-15-minutes limit as picarview_submit_message).
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
  if (select count(*) from public.picarview_messages where lower(email) = lower(btrim(p_email)) and date > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait 15 minutes.' using errcode = 'P0001';
  end if;
  insert into public.picarview_messages (kind,name,email,subject,message)
  values (p_kind,btrim(p_name),lower(btrim(p_email)),btrim(p_subject),btrim(p_message));
end;
$$;
revoke all on function public.jamza_submit(text,text,text,text,text) from public;
grant execute on function public.jamza_submit(text,text,text,text,text) to anon, authenticated;

-- ---------- Settings: festival details editable from the admin ----------
alter table public.picarview_settings add column if not exists ticket_url text not null default '';
alter table public.picarview_settings add column if not exists community_price text not null default '';
alter table public.picarview_settings add column if not exists shop_deadline text not null default '';
alter table public.picarview_settings add column if not exists shuttle_departure text not null default '';
alter table public.picarview_settings add column if not exists shuttle_return text not null default '';
alter table public.picarview_settings add column if not exists vendor_deadline date;
alter table public.picarview_settings drop constraint if exists picarview_settings_ticket_url_check;
alter table public.picarview_settings add constraint picarview_settings_ticket_url_check
  check (ticket_url = '' or (ticket_url ~ '^https://' and length(ticket_url) <= 2048));
update public.picarview_settings set
  email = case when lower(btrim(email)) in ('hello@jamza.com','hello@picarview.com','example@jamza.com') then 'jamzafestival@gmail.com' else email end,
  instagram = case when instagram = '' then 'https://www.instagram.com/jamza_festival/' else instagram end,
  vendor_deadline = coalesce(vendor_deadline, date '2026-11-28')
where id = 'site';

-- ---------- Artists: one page per artist ----------
alter table public.picarview_artists drop constraint if exists picarview_artists_image_check;
alter table public.picarview_artists add constraint picarview_artists_image_check
  check (image = '' or ((image ~ '^https://' or image ~ '^/images/') and length(image) <= 2048));
alter table public.picarview_artists add column if not exists slug text;
alter table public.picarview_artists add column if not exists tier text not null default 'main';
alter table public.picarview_artists add column if not exists handle text not null default '';
alter table public.picarview_artists add column if not exists bio text not null default '';
alter table public.picarview_artists add column if not exists visible boolean not null default true;
alter table public.picarview_artists add column if not exists sort integer not null default 1000;
update public.picarview_artists set slug = id where slug is null;
alter table public.picarview_artists alter column slug set not null;
alter table public.picarview_artists drop constraint if exists picarview_artists_slug_check;
alter table public.picarview_artists add constraint picarview_artists_slug_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('admin','shop','merch','visit','join','partners','2025'));
create unique index if not exists picarview_artists_slug_key on public.picarview_artists (slug);
alter table public.picarview_artists drop constraint if exists picarview_artists_tier_check;
alter table public.picarview_artists add constraint picarview_artists_tier_check check (tier in ('main','guest'));
alter table public.picarview_artists drop constraint if exists picarview_artists_bio_check;
alter table public.picarview_artists add constraint picarview_artists_bio_check check (length(bio) <= 6000);

-- ---------- Partners ----------
alter table public.picarview_partners drop constraint if exists picarview_partners_image_check;
alter table public.picarview_partners add constraint picarview_partners_image_check
  check (image = '' or ((image ~ '^https://' or image ~ '^/images/') and length(image) <= 2048));
alter table public.picarview_partners add column if not exists tagline text not null default '';
alter table public.picarview_partners add column if not exists visible boolean not null default true;
alter table public.picarview_partners add column if not exists sort integer not null default 1000;

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
  if (select count(*) from public.picarview_messages where lower(email) = v_mail and date > now() - interval '15 minutes') >= 3 then
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
  insert into public.picarview_messages (kind,name,email,subject,message)
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
    execute format('create policy jamza_admin_manage on public.%I for all to authenticated using ((select public.picarview_is_admin())) with check ((select public.picarview_is_admin()))', item);
  end loop;
  foreach item in array array['jamza_products','jamza_vouchers'] loop
    execute format('drop trigger if exists jamza_updated_at on public.%I', item);
    execute format('create trigger jamza_updated_at before update on public.%I for each row execute function public.picarview_touch_updated_at()', item);
  end loop;
end;
$$;

-- Public reads: visible items only. Admins still see everything through picarview_admin_manage.
grant select on public.jamza_products to anon;
drop policy if exists jamza_public_read on public.jamza_products;
create policy jamza_public_read on public.jamza_products for select to anon, authenticated using (visible);
drop policy if exists picarview_public_read on public.picarview_artists;
create policy picarview_public_read on public.picarview_artists for select to anon, authenticated using (visible);
drop policy if exists picarview_public_read on public.picarview_partners;
create policy picarview_public_read on public.picarview_partners for select to anon, authenticated using (visible);

commit;
