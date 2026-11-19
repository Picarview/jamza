-- Run AFTER migrations/20261101000000_initial_schema.sql and after creating your Auth user.
-- Change the email below to the email of your own administrator account.
do $$
declare
  admin_email text := 'jamzafestival@gmail.com';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);
  if admin_id is null then
    raise exception 'Create the user in Authentication > Users first, and replace the email in this script.';
  end if;
  insert into public.jamza_admins(user_id) values (admin_id) on conflict do nothing;
end;
$$;
