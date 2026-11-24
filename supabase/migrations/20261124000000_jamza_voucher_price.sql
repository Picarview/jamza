-- Discount codes: a voucher can now carry a ticket price.
--  * price null  → free ticket (as before)
--  * price set   → the code unlocks a ticket at that price; the claim lands in the inbox with
--                  "send payment details", the same way pre-orders work.
-- Also creates the Break Time community code (GHC 75, 25% off Regular).
-- Safe to re-run. Run once in the Supabase SQL Editor.
begin;

alter table public.jamza_vouchers add column if not exists price numeric(10,2);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'jamza_vouchers_price_check') then
    alter table public.jamza_vouchers add constraint jamza_vouchers_price_check check (price is null or price >= 0);
  end if;
end;
$$;

-- Returns: ok (free ticket), price:<amount> (discounted ticket), invalid, expired, used, already.
create or replace function public.jamza_redeem_voucher(p_code text, p_name text, p_email text, p_phone text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v public.jamza_vouchers;
  v_code text := upper(regexp_replace(coalesce(p_code,''), '\s', '', 'g'));
  v_mail text := lower(btrim(coalesce(p_email,'')));
  v_price text;
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

  -- 75.00 → 75, 12.50 → 12.5
  v_price := case when v.price is null then null else trim(trailing '.' from trim(trailing '0' from v.price::text)) end;

  update public.jamza_vouchers set uses = uses + 1 where id = v.id;
  insert into public.jamza_voucher_redemptions(voucher_id, email) values (v.id, v_mail);
  insert into public.jamza_voucher_attempts(ok) values (true);
  insert into public.jamza_messages (kind,name,email,subject,message)
  values ('voucher', btrim(p_name), v_mail,
          'Voucher ' || v_code || ' — ' || btrim(p_name) || case when v_price is null then '' else ' (GHC ' || v_price || ')' end,
          '[Ticket voucher]' || chr(10) || chr(10) || 'Voucher code: ' || v_code || chr(10)
          || 'Ticket: ' || case when v_price is null then 'Free' else 'GHC ' || v_price end || chr(10)
          || 'Full name: ' || btrim(p_name) || chr(10) || 'Phone / WhatsApp: ' || btrim(p_phone) || chr(10)
          || 'Claimed automatically (' || (v.uses + 1) || ' of ' || v.max_uses || '). '
          || case when v_price is null then 'Send their free ticket.' else 'Send payment details (GHC ' || v_price || '), then their ticket.' end);
  return case when v_price is null then 'ok' else 'price:' || v_price end;
end;
$$;

revoke all on function public.jamza_redeem_voucher(text,text,text,text) from public;
grant execute on function public.jamza_redeem_voucher(text,text,text,text) to anon, authenticated;

-- Break Time community: GHC 75 tickets (25% off Regular), one per person, until sales close.
insert into public.jamza_vouchers (code, note, max_uses, uses, active, expires_at, price)
values ('BREAKTIME-JAMZA26', 'Break Time community — 25% off Regular', 300, 0, true, '2026-12-18', 75)
on conflict (code) do nothing;

commit;
