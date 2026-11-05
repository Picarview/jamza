-- Update public branding without renaming tables, changing access, or touching custom settings.
begin;

alter table public.picarview_settings alter column title set default 'jamza';
alter table public.picarview_settings alter column email set default 'hello@jamza.com';

update public.picarview_settings set title = 'jamza'
where id = 'site' and lower(btrim(title)) = 'picarview';

-- This is placeholder contact information; configure your real address in General Settings.
update public.picarview_settings set email = 'hello@jamza.com'
where id = 'site' and lower(btrim(email)) = 'hello@picarview.com';

update public.picarview_posts
set excerpt = 'An introduction to the ideas and people at the heart of jamza.'
where id = 'p1' and excerpt = 'An introduction to the ideas and people at the heart of picarview.';

commit;
