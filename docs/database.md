# Supabase database

Project reference: `szprwjthyzihzzzshgha`. The browser uses the Supabase Data API, Auth, and Storage directly. There is no custom application server to provision.

## Set up the hosted project

1. Open the [SQL Editor](https://supabase.com/dashboard/project/szprwjthyzihzzzshgha/sql/new).
2. Run the contents of `supabase/migrations/20261101000000_initial_schema.sql`. It creates only the application's prefixed tables, helper functions, policies, and the `partner-logos` bucket. It does not create users or approve accounts.
3. Run `supabase/migrations/20261101010000_jamza_brand.sql` after the initial schema. It replaces only original sample branding and updates the defaults to jamza.
4. Under **Authentication → Users**, create an email/password account and confirm it. Enable email/password authentication if disabled.
5. Set the email in `supabase/scripts/approve-admin.sql` and run that script. Accounts need explicit membership in `picarview_admins`; signing up alone does not grant access.
6. Optionally run `supabase/seed.sql` for sample artists, journal entries, and partner names. Existing sample IDs are preserved.
7. Start the frontend and sign in through `/admin.html`.

The previous files `api/supabase-schema.sql`, `api/supabase-admin.sql`, and `api/supabase-seed.sql` have been moved to these locations. Their schema, membership, and seed behavior have not been reset. Existing administrator-email edits are preserved. The public key cannot execute schema changes; run the SQL through your dashboard or a separately authenticated Supabase CLI.

## Access model

| Table                | Public access             | Approved administrator access              |
| -------------------- | ------------------------- | ------------------------------------------ |
| `picarview_artists`  | Read                      | Create, read, edit, delete                 |
| `picarview_posts`    | Read published rows       | Read drafts, create, publish, edit, delete |
| `picarview_partners` | Read                      | Create, read, edit, delete                 |
| `picarview_settings` | Read public configuration | Update the single site row                 |
| `picarview_messages` | None                      | Read, mark read, delete                    |
| `picarview_admins`   | None                      | Read own membership only                   |

Only SQL Editor/database administrators can change the allowlist. The frontend never receives elevated database credentials. Public-page clients do not restore admin sessions, and public post queries also explicitly filter for published entries. Database RLS is the authority regardless of frontend controls.

Visitors send messages through `picarview_submit_message`, which validates field lengths and email structure, limits each email to three messages per 15 minutes, and returns no inbox data. Direct anonymous access to the inbox table is denied. The form also includes a honeypot. For higher-volume public traffic, add edge-level bot controls rather than treating a per-email limit as comprehensive abuse protection.

The public `partner-logos` bucket accepts PNG, JPEG, and WebP files up to 400,000 bytes. Only approved administrators can upload, update, or delete objects. Logo URLs are publicly readable by design. Replaced or deleted partner records do not automatically delete previously referenced assets.

## Schema changes and local development

Add subsequent changes as new timestamped files in `supabase/migrations/`. Do not edit an already applied production migration to introduce a new schema revision.

`supabase/config.toml` supports optional local development with the Supabase CLI and Docker. The CLI is not required to run the frontend. If using an existing remote project previously initialized through the SQL Editor, reconcile its migration history with the CLI before pushing new migrations; do not blindly reset or reapply a production database.

For a local Supabase instance, set `.env.local` to its API URL and public anon key. Restart Vite after editing environment files. The local configuration disables public signup; create and approve your own local admin account separately.

## Verification limits

The application ships tests for client validation, optimistic write conditions, and HTTP integration. They use a fixture service and do not execute the SQL migration. Verify actual Auth sign-in, RLS isolation, message submission, and Storage permissions against your configured project after applying the schema. No real Supabase data is changed by the test suite.

References: [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage](https://supabase.com/docs/reference/javascript/storage-from-upload).
