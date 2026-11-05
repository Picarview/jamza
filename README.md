# jamza

A purple-and-cream artist website and authenticated admin dashboard, built with Vite, JavaScript modules, and Supabase.

## Run locally

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/** for the website and **http://127.0.0.1:5173/admin.html** for the dashboard. Node 22 is recommended; compatible engines are listed in `package.json`.

Your Supabase public configuration is already in the ignored `.env.local` file in this workspace. In a new checkout, copy `.env.example` to `.env.local`, add your public key, and restart the dev server. The SDK is bundled from npm; opening the HTML files directly or with Live Server no longer runs this modular project correctly.

## Project structure

```text
index.html / admin.html / 404.html  Page entry points
src/config/                       Environment validation and defaults
src/lib/                          Shared DOM, error, and Supabase helpers
src/services/                     Database access, record changes, messages, uploads
src/site/                         Public page rendering and interactions
src/admin/                        Dashboard views, editor, authentication, and state
src/styles/                       Brand tokens, shared CSS, and page layouts
public/                           Favicon, images, robots, and static headers
supabase/migrations/              Versioned database schema
supabase/scripts/                 Administrator approval script
supabase/seed.sql                 Optional sample content
tests/                            Unit tests and browser workflows
docs/                             Architecture, database, and deployment instructions
```

The old inline HTML styles/scripts are now organized under `src/`. The previous `api/` SQL files have moved under `supabase/`. The colour palette and page features are preserved. Change shared colours and fonts in **`src/styles/tokens.css`**.

## Supabase setup

If the database has not been set up yet:

1. In your [project SQL Editor](https://supabase.com/dashboard/project/szprwjthyzihzzzshgha/sql/new), run `supabase/migrations/20261101000000_initial_schema.sql`.
2. Run `supabase/migrations/20261101010000_jamza_brand.sql` to update any original sample branding, then create and confirm your administrator account under **Authentication → Users**.
3. Replace the email placeholder in `supabase/scripts/approve-admin.sql` with that account's email and run it in the SQL Editor.
4. Optionally run `supabase/seed.sql` for sample content.

If you already applied the earlier SQL files, the migration represents that same initial schema; restructuring the frontend does not require resetting your database. No live records are moved or deleted by this refactor. Do not reset a production database to follow local development instructions.

The anonymous key configures public browser access; database policies enforce permissions. Do not use a service-role key in this application. See [database setup](docs/database.md) for the access model and CLI notes.

## Commands

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start the local development server                                |
| `npm run build`        | Build both pages and the missing-page fallback into `dist/`       |
| `npm run preview`      | Preview the production build locally                              |
| `npm run check`        | Check JavaScript syntax, imports, and HTML entry integrity        |
| `npm test`             | Run unit tests                                                    |
| `npm run test:e2e`     | Run browser workflows against intercepted Supabase HTTP responses |
| `npm run verify`       | Run checks, unit tests, build, and browser tests                  |
| `npm run format`       | Format source files and documentation                             |
| `npm run format:check` | Verify formatting without writing files                           |

For browser tests, install Chromium once with `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome. See [development and deployment](docs/deployment.md) for Windows commands. Browser tests use fake public configuration and never write to the live project.

## Features

- A responsive landing page with Home, Our Story, The Artist, Announcements & Blogs, Partners, and Contact Us sections.
- Approved-admin sign-in, sign-out, overview counts, refresh, and searchable content tables.
- Artist and partner CRUD, post drafts and publishing, complete public article readers, logo uploads, inbox read state, and site/social settings.
- Supabase database persistence, private inbox access, storage rules, per-email contact limits, and conditional writes that detect stale edits.
- Shared purple-and-cream design tokens, accessible keyboard focus, native dialogs, reduced-motion support, and mobile navigation.
- Bundled dependencies, locked versions, production output, branded 404 page, formatting tools, regression tests, and GitHub Actions checks.

Contact submissions are stored in the private inbox; email notifications are not configured. Previously used logo assets are retained until manually removed from Storage. Browser tests verify frontend behavior using a fixture backend, not live PostgreSQL policy enforcement.

The default `hello@jamza.com` is placeholder contact information; set the organization's real address in General Settings.

Read [architecture](docs/architecture.md), [database](docs/database.md), and [deployment](docs/deployment.md) for details.
