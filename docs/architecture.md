# Architecture

The website and dashboard are separate HTML entry points in one Vite project. Both use standard browser JavaScript modules; no UI framework or custom application server is required.

```text
jamza/
├── index.html                     Public landing-page markup
├── admin.html                     Sign-in and dashboard markup
├── 404.html                       Branded missing-page fallback
├── src/
│   ├── config/                    Public environment validation and site defaults
│   ├── lib/                       Supabase client, DOM helpers, error messages
│   ├── services/                  Database reads, record writes, messages, uploads
│   ├── site/                      Public-page events and content rendering
│   ├── admin/                     Session handling, editor, views, schema, state
│   └── styles/                    Brand tokens, shared styles, page styles
├── public/                        Static assets copied into every build
│   ├── images/                    Your local photography and logos
│   ├── favicon.svg
│   ├── robots.txt
│   └── _headers                   Headers for hosts supporting this format
├── supabase/
│   ├── migrations/                Versioned database schema
│   ├── scripts/                   Manual administrator approval
│   ├── seed.sql                   Optional sample content
│   └── config.toml                Optional local Supabase CLI configuration
├── tests/
│   ├── unit/                      Validation and persistence contracts
│   └── e2e/                       Browser workflows with intercepted API responses
├── scripts/check.mjs             Source and entry-point integrity checks
├── docs/                          Architecture, database, and deployment guides
├── .github/workflows/ci.yml       Repeatable checks for pushes and pull requests
├── .env.example                  Public configuration template
├── .env.local                    Your configured project (ignored by Git)
├── .env.test                     Fake public values for browser tests
├── package.json                  Development, build, and verification commands
└── package-lock.json             Exact dependency tree
```

## Where to make changes

- **Colours and fonts:** `src/styles/tokens.css`. It holds the indigo, violet, cream, neutral colours, and typography tokens. Page-specific layouts live in `site.css` and `admin.css`.
- **Static content and page structure:** the corresponding HTML entry.
- **Public rendering and interactions:** `src/site/render.js` and `src/site/main.js`.
- **Dashboard navigation and save orchestration:** `src/admin/main.js`.
- **Editor fields and module titles:** `src/admin/schema.js`.
- **Editor and logo selection:** `src/admin/editor.js`.
- **Tables, overview, search, and settings forms:** `src/admin/views.js`.
- **Sign-in, sign-out, and allowlist checks:** `src/admin/auth.js`.
- **Supabase reads and writes:** `src/services/`. Services have no dependency on the dashboard DOM.
- **Public configuration:** `.env.local`, validated by `src/config/env.js`.
- **Database changes:** add a new timestamped migration under `supabase/migrations/`. Do not rewrite an applied migration when changing an existing production database.

## Data flow

The public entry creates a client that never restores an admin session. It reads artists, partners, settings, and explicitly published posts. Database policies independently enforce publication visibility.

The admin entry restores an authenticated session, checks membership in `jamza_admins`, and loads private data only after approval. UI actions produce a single record change. The service sends only modified fields, with the previous update timestamp as a condition. The local state changes only after the server returns a row.

The content service requests records in pages so collections larger than the API's default limit are not silently truncated. It requests a stable timestamp-and-ID ordering. A visitor's contact form calls a validating SQL function; it never receives inbox rows.

Logo files are validated and uploaded when Save is pressed. Database records store the resulting Storage URL. Cancelling before saving does not create an uploaded object. Previously used files are retained when partners are changed or deleted; remove unused assets through Supabase Storage after checking their references.

Same-origin tabs use BroadcastChannel to request refreshed public data after successful writes. Public pages also refresh on focus and visibility changes. Cross-device updates appear when the public page loads or regains focus; Realtime is not configured.

## Verification boundaries

Unit tests cover public configuration, privileged-key rejection, validation, one-record writes, immutable snapshots, and stale-update conditions. Browser tests use the real bundled Supabase SDK with intercepted HTTP responses. They exercise authentication gates, CRUD, errors, publishing, uploads, messages, settings, and responsive layouts without using a real database.

Those tests do not execute PostgreSQL or verify a live project's Auth, RLS, or Storage configuration. Validate those separately after applying the migration and approving an actual user.
