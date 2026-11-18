# jamza — JAMZA! FESTIVAL site

The event site for **JAMZA! FESTIVAL · Saturday 19 December 2026**. Next.js 16 (App Router) + Tailwind v4 + Motion, with content from the existing Supabase project.

## Run

```sh
npm install
npm run dev        # site → http://localhost:3000
npm run admin      # legacy admin dashboard → http://127.0.0.1:5173/admin.html
npm run build && npm start
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). The legacy admin still reads the `VITE_` copies until it is ported to Next.js.

## Where things live

```text
src/app/                 layout, page, server action for the letter form, fonts
src/components/          PillNav, Countdown, Snow, Marquee, HalfMoons, Icon (Hugeicons), Reveal
src/components/home/     Hero → WhatIs → TheNight (3 acts) → Lineup → StoryReel → UnderTheTree → Letter
src/content/festival.ts  Festival copy, date, venue/ticket TODOs, act photos
src/lib/                 Supabase client (server only), content loading, types
src/fonts/               Brand fonts: Swung Note (display), Epilogue (text)
public/images/festival/  Photos cropped from the festival carousel + the 11 slides
legacy/                  Previous Vite site + admin dashboard (still used for admin)
supabase/                Database migrations — unchanged
```

**Still to confirm** in `src/content/festival.ts`: start time, venue, city, ticket link.

## CMS mapping

| Admin dashboard | On the site |
| --------------- | ----------- |
| Artists | The Lineup (poster billing; first artist is the headliner) |
| Posts (Published) | Under the Tree (gift tags that open into a reader) |
| Partners | “Wrapped with love by” ticker |
| Settings: email, Instagram, LinkedIn | Letter section + footer |
| Inbox | Messages from the “Write us a letter” form |

## SEO

- Set `NEXT_PUBLIC_SITE_URL` in production (defaults to `https://jamzafestival.com`); canonical URLs, Open Graph, sitemap and robots all use it.
- Share images are generated at build time: `src/app/opengraph-image.tsx` (home) and `src/app/2025/opengraph-image.tsx`. They read event details from `src/content/festival.ts`, so they update with it.
- Favicon set (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`, `public/icons/*`) is generated from the logo.
- `src/lib/structured-data.ts` publishes the festival as a schema.org `MusicEvent` (date, venue, GHS ticket offers, performers from the CMS) and the 2025 report as a `Report`.

Brand palette and the liquid-glass material are in `src/app/globals.css`. Source assets (original PNGs, font files, banner mockup) are kept in the git-ignored `assets-source/`.
