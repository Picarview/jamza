-- Optional sample content. Run after migrations/20261101000000_initial_schema.sql.
-- Existing sample IDs are preserved.
begin;
insert into public.picarview_artists ("id","name","role","image") values ('a1','Amara Sol','Soul / Alternative R&B','https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=700&q=80') on conflict (id) do nothing;
insert into public.picarview_artists ("id","name","role","image") values ('a2','Eli Rivers','Producer / Electronic','https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=700&q=80') on conflict (id) do nothing;
insert into public.picarview_artists ("id","name","role","image") values ('a3','The Violet Hour','Collective / Indie & Experimental','https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80') on conflict (id) do nothing;
insert into public.picarview_posts ("id","title","category","date","status","excerpt","body","image") values ('p1','A new perspective on coming together.','Culture','2026-10-24','Published','An introduction to the ideas and people at the heart of jamza.','Every creative journey starts with a different perspective. This is a space to explore those perspectives, share ideas, and make new connections.

This sample article can be edited from the admin dashboard.','https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80') on conflict (id) do nothing;
insert into public.picarview_posts ("id","title","category","date","status","excerpt","body","image") values ('p2','Inside the creative process.','In conversation','2026-10-18','Published','Finding inspiration in the spaces between disciplines.','A conversation about curiosity, creative routines, and following an idea somewhere unexpected.

Replace this illustrative article with your own story.','https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=700&q=80') on conflict (id) do nothing;
insert into public.picarview_posts ("id","title","category","date","status","excerpt","body","image") values ('p3','The art of making space.','Community','2026-10-12','Published','Why the best ideas need a place to belong.','Culture thrives when everyone has a chance to contribute. Discover how shared spaces can inspire a new generation of creative work.

This is demonstration content.','https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=700&q=80') on conflict (id) do nothing;
insert into public.picarview_partners ("id","name","image","url") values ('r1','form & field','','') on conflict (id) do nothing;
insert into public.picarview_partners ("id","name","image","url") values ('r2','STUDIO / 08','','') on conflict (id) do nothing;
insert into public.picarview_partners ("id","name","image","url") values ('r3','common ground','','') on conflict (id) do nothing;
insert into public.picarview_partners ("id","name","image","url") values ('r4','↗ wavelength','','') on conflict (id) do nothing;
commit;
