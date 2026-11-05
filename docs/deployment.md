# Development and deployment

## Local development

Use Node 22 (recommended), or another version matching `package.json`'s supported engines. The `.nvmrc` file selects Node 22 for version managers.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/` and `http://127.0.0.1:5173/admin.html`. Vite serves both entry points and reloads changes. Use these commands instead of opening HTML files directly or using Live Server; source modules now import npm packages.

`.env.local` is already configured in this workspace. For a new checkout, copy `.env.example` to `.env.local` and set the two public values. Restart Vite after changing them.

## Production build

```sh
npm run build
npm run preview
```

The build fails early for missing or invalid public configuration. Preview serves the built files at `http://127.0.0.1:4173/`. It is a local check, not a production hosting service.

Deploy **only `dist/`** to a static host. Build command: `npm ci && npm run build`. Output directory: `dist`. Both `index.html` and `admin.html` are included, along with the bundled SDK, shared CSS/JavaScript chunks, assets, and `404.html`.

For hosted builds, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in that host's environment configuration. They are public values compiled into the browser bundle. Never use a service-role or secret key. Changes to build-time environment values require a rebuild.

Preserve real file routes, including `/admin.html`; do not rewrite every URL to `index.html`. Configure the host's not-found handler to serve `/404.html` with HTTP 404 status. The supplied headers file supports Netlify-style `_headers` hosts; on other hosts, configure equivalent headers in the hosting settings. It does not take effect automatically in Vite's dev server or preview server. If you use a custom Supabase domain or self-hosted instance, update the `connect-src` directive for that origin.

Google Fonts and remote photography still require internet access. The Supabase SDK is installed locally and included in the build; it no longer depends on a runtime SDK CDN. Replace placeholder identities, copy, and images before publishing.

## Tests and checks

```sh
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

On a Windows computer with Chrome installed, you can use it instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

Browser tests automatically start an isolated Vite server on port 5174 with `.env.test`. Their HTTP fixtures intercept the fake project URL. No real credentials or database writes are needed. Never deploy a build made with `--mode test`.

`npm run verify` runs integrity checks, unit tests, the production build, and browser tests. `npm run format` formats source and documentation; `npm run format:check` checks formatting. GitHub Actions runs these checks for pushes and pull requests, using fake public values and a separate browser installation. That workflow verifies the project; it does not publish it.

## Backend setup

Follow [database.md](database.md) before expecting real content, messages, and admin sessions to work. Frontend deployment does not create Supabase tables or administrator accounts.
