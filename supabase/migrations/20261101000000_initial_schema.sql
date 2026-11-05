-- picarview: run this entire script in your project's Supabase SQL Editor.
-- It creates only picarview_* tables and the partner-logos bucket.
-- It does not create users or grant anyone administrator access.
begin;

create table if not exists public.picarview_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.picarview_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.picarview_admins where user_id = (select auth.uid())); $$;
revoke all on function public.picarview_is_admin() from public, anon;
grant execute on function public.picarview_is_admin() to authenticated;

create table if not exists public.picarview_artists (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  name text not null check (length(btrim(name)) between 1 and 300),
  role text not null check (length(btrim(role)) between 1 and 300),
  image text not null check (image ~ '^https?://' and length(image) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.picarview_posts (
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
create table if not exists public.picarview_partners (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  name text not null check (length(btrim(name)) between 1 and 300),
  url text not null default '' check (url = '' or (url ~ '^https?://' and length(url) <= 2048)),
  image text not null default '' check (image = '' or (image ~ '^https?://' and length(image) <= 2048)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.picarview_settings (
  id text primary key default 'site' check (id = 'site'),
  title text not null default 'picarview' check (length(btrim(title)) between 1 and 60),
  email text not null default 'hello@picarview.com' check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  instagram text not null default '' check (instagram = '' or (instagram ~ '^https?://' and length(instagram) <= 2048)),
  linkedin text not null default '' check (linkedin = '' or (linkedin ~ '^https?://' and length(linkedin) <= 2048)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.picarview_messages (
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
create index if not exists picarview_messages_email_date on public.picarview_messages (lower(email), date desc);
create index if not exists picarview_posts_status_date on public.picarview_posts (status, date desc);

create or replace function public.picarview_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.picarview_touch_updated_at() from public, anon, authenticated;

-- Enable RLS and reset only this application's named policies/triggers.
do $$
declare item text;
begin
  foreach item in array array['artists','posts','partners','settings','messages'] loop
    execute format('alter table public.%I enable row level security', 'picarview_' || item);
    execute format('revoke all on public.%I from anon, authenticated', 'picarview_' || item);
    execute format('grant select, insert, update, delete on public.%I to authenticated', 'picarview_' || item);
    execute format('drop policy if exists picarview_admin_manage on public.%I', 'picarview_' || item);
    execute format('create policy picarview_admin_manage on public.%I for all to authenticated using ((select public.picarview_is_admin())) with check ((select public.picarview_is_admin()))', 'picarview_' || item);
    execute format('drop trigger if exists picarview_updated_at on public.%I', 'picarview_' || item);
    execute format('create trigger picarview_updated_at before update on public.%I for each row execute function public.picarview_touch_updated_at()', 'picarview_' || item);
  end loop;
end;
$$;
alter table public.picarview_admins enable row level security;
revoke all on public.picarview_admins from anon, authenticated;
grant select on public.picarview_admins to authenticated;
drop policy if exists picarview_read_own_admin on public.picarview_admins;
create policy picarview_read_own_admin on public.picarview_admins for select to authenticated using (user_id = (select auth.uid()));

grant select on public.picarview_artists, public.picarview_posts, public.picarview_partners, public.picarview_settings to anon;
drop policy if exists picarview_public_read on public.picarview_artists;
create policy picarview_public_read on public.picarview_artists for select to anon, authenticated using (true);
drop policy if exists picarview_public_read on public.picarview_partners;
create policy picarview_public_read on public.picarview_partners for select to anon, authenticated using (true);
drop policy if exists picarview_public_read on public.picarview_settings;
create policy picarview_public_read on public.picarview_settings for select to anon, authenticated using (true);
drop policy if exists picarview_public_read on public.picarview_posts;
create policy picarview_public_read on public.picarview_posts for select to anon, authenticated using (status = 'Published');

-- No public table access to messages. This function accepts validated submissions
-- without returning IDs or message data, and limits each email to 3 per 15 minutes.
create or replace function public.picarview_submit_message(p_name text, p_email text, p_subject text, p_message text)
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
  if (select count(*) from public.picarview_messages where lower(email) = lower(btrim(p_email)) and date > now() - interval '15 minutes') >= 3 then
    raise exception 'Too many messages. Please wait 15 minutes.' using errcode = 'P0001';
  end if;
  insert into public.picarview_messages (name,email,subject,message)
  values (btrim(p_name),lower(btrim(p_email)),btrim(p_subject),btrim(p_message));
end;
$$;
revoke all on function public.picarview_submit_message(text,text,text,text) from public;
grant execute on function public.picarview_submit_message(text,text,text,text) to anon, authenticated;

insert into public.picarview_settings(id) values ('site') on conflict (id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('partner-logos','partner-logos',true,400000,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=400000,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
drop policy if exists picarview_logo_read on storage.objects;
create policy picarview_logo_read on storage.objects for select to anon, authenticated using (bucket_id = 'partner-logos');
drop policy if exists picarview_logo_insert on storage.objects;
create policy picarview_logo_insert on storage.objects for insert to authenticated with check (bucket_id = 'partner-logos' and (select public.picarview_is_admin()));
drop policy if exists picarview_logo_update on storage.objects;
create policy picarview_logo_update on storage.objects for update to authenticated using (bucket_id = 'partner-logos' and (select public.picarview_is_admin())) with check (bucket_id = 'partner-logos' and (select public.picarview_is_admin()));
drop policy if exists picarview_logo_delete on storage.objects;
create policy picarview_logo_delete on storage.objects for delete to authenticated using (bucket_id = 'partner-logos' and (select public.picarview_is_admin()));

commit;
-- NEXT: create a user in Authentication > Users, then approve that exact user ID:
-- insert into public.picarview_admins(user_id) values ('YOUR-USER-UUID') on conflict do nothing;
