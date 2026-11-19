-- Rename every picarview_* database object to jamza_*.
-- Keeps all rows, grants, row-level security, admin logins and storage files. Safe to re-run:
-- anything already renamed is skipped. Run once in the Supabase SQL Editor.
begin;

-- Tables (grants, policies, triggers and foreign keys move with them).
do $$
declare t text;
begin
  foreach t in array array['admins','artists','posts','partners','settings','messages'] loop
    if to_regclass('public.picarview_' || t) is not null and to_regclass('public.jamza_' || t) is null then
      execute format('alter table public.%I rename to %I', 'picarview_' || t, 'jamza_' || t);
    end if;
  end loop;
end;
$$;

-- Constraints and indexes whose names still start with picarview_.
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c join pg_namespace n on n.oid = c.connamespace
    where n.nspname = 'public' and c.conname like 'picarview\_%'
  loop
    execute format('alter table %s rename constraint %I to %I', r.tbl, r.conname, 'jamza_' || substr(r.conname, 11));
  end loop;
  for r in
    select i.relname from pg_class i join pg_namespace n on n.oid = i.relnamespace
    where n.nspname = 'public' and i.relkind = 'i' and i.relname like 'picarview\_%'
  loop
    execute format('alter index public.%I rename to %I', r.relname, 'jamza_' || substr(r.relname, 11));
  end loop;
end;
$$;

-- Policies and triggers.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname in ('public','storage') and policyname like 'picarview\_%'
  loop
    execute format('alter policy %I on %I.%I rename to %I', r.policyname, r.schemaname, r.tablename, 'jamza_' || substr(r.policyname, 11));
  end loop;
  for r in
    select c.relname, t.tgname from pg_trigger t join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal and t.tgname like 'picarview\_%'
  loop
    execute format('alter trigger %I on public.%I rename to %I', r.tgname, r.relname, 'jamza_' || substr(r.tgname, 11));
  end loop;
end;
$$;

-- Functions: rename (policies keep pointing at them), then refresh bodies that name tables.
do $$
begin
  if to_regprocedure('public.picarview_is_admin()') is not null and to_regprocedure('public.jamza_is_admin()') is null then
    alter function public.picarview_is_admin() rename to jamza_is_admin;
  end if;
  if to_regprocedure('public.picarview_touch_updated_at()') is not null and to_regprocedure('public.jamza_touch_updated_at()') is null then
    alter function public.picarview_touch_updated_at() rename to jamza_touch_updated_at;
  end if;
  if to_regprocedure('public.picarview_submit_message(text,text,text,text)') is not null
     and to_regprocedure('public.jamza_submit_message(text,text,text,text)') is null then
    alter function public.picarview_submit_message(text,text,text,text) rename to jamza_submit_message;
  end if;
end;
$$;

create or replace function public.jamza_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.jamza_admins where user_id = (select auth.uid())); $$;

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

revoke all on function public.jamza_is_admin() from public, anon;
grant execute on function public.jamza_is_admin() to authenticated;
revoke all on function public.jamza_submit_message(text,text,text,text) from public;
grant execute on function public.jamza_submit_message(text,text,text,text) to anon, authenticated;
revoke all on function public.jamza_touch_updated_at() from public, anon, authenticated;

commit;
