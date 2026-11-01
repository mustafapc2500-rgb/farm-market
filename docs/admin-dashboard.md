# Farm Market administration: read-only foundation

This feature starts from `backend/database-foundation` and belongs on `feat/admin-dashboard`. It preserves the colorful public storefront and its six local sample products. It adds no product mutations, image uploader, signup, payments, or production deployment. The owner reports the original foundation migration and first administrator assignment are already applied in `farm-market-dev`; **do not run that migration again**.

## Routes and structure

- `/admin/login`: Arabic RTL email/password login using Supabase Auth, password visibility toggle, loading, and safe error messages. No public signup link or API call is implemented.
- `/admin`: live database counts and a read-only product list.
- `/admin/products`: the same paginated read-only product list without overview metrics.
- All other `/admin/*` paths require authorization before an admin not-found page is shown.
- `src/admin/client.ts`: lazy, tab-scoped Supabase client, request deadlines, and public configuration.
- `src/admin/AuthProvider.tsx`: server user verification, admin-status checks, session events, logout, and revalidation.
- `src/admin/repository.ts`: only SELECT queries and read-only self-status RPC calls, with checks before/after reads, cancellation, and deterministic 10-row pagination.
- `src/admin/database.types.ts`: deliberately read-only public API contract for the two tables read by this phase. The private administrator schema is not exposed or queried. Replace with generated types when appropriate in a later phase; client types are not an authorization boundary.
- `src/admin/admin.css`: scoped dark-green sidebar, cream workspace, yellow accents, mobile product cards, and a native modal navigation drawer.

Counts are fetched from Supabase, including draft products and unpublished categories visible to authorized administrators. There is no hardcoded dashboard inventory or fake product fallback. A genuine empty database produces zero counts and an empty state. Failed requests produce error states, not zero counts. Products retain their explicit sample label only if `is_sample` is true. EUR formatting matches the storefront.

## Required reviewed SQL: a boolean self-status RPC

The original private helper cannot be called through PostgREST while its schema remains private. Review **only**:

```text
supabase/migrations/20261101000200_admin_status_rpc.sql
```

It creates `public.current_user_is_admin()` with no arguments and a boolean result. It is a security invoker with a locked search path and calls the existing `farm_market_private.is_administrator()` helper. Only the `authenticated` API role receives EXECUTE; anonymous callers cannot invoke it. It neither returns private rows nor assigns administrators. It changes no existing tables, RLS policies, or Auth accounts.

After review and approval:

1. Select **farm-market-dev** in Supabase Dashboard and verify its project reference.
2. Open **SQL Editor → New query** using the trusted `postgres` role.
3. Paste the entire **new** `20261101000200_admin_status_rpc.sql`, including its transaction, and run once. It refreshes the PostgREST schema cache.
4. Keep `farm_market_private` out of Data API exposed schemas. Do not expose private tables or grant clients access to the allowlist.
5. Verify using a real signed-in test client: anonymous RPC denied; normal user returns false; the manually allowlisted user returns true. Calling the RPC from the privileged SQL Editor without an Auth JWT does not prove the browser account is authorized.
6. If this function already exists, stop and inspect its definition. The migration intentionally does not silently replace a different function.

No migration is applied automatically. Until this RPC is approved/applied, login can authenticate but admin access **fails closed** with a generic setup/verification error. Do not replace the RPC check with a client flag, email check, or a test product query.

## Local configuration

Use Node 22.12+ or Node 24 LTS. In your **local** repository folder (not the cloud `/workspace` path on Windows), copy `.env.example` to `.env.local`. If `.env.local` already exists, edit only the two new settings; do not overwrite existing values.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Get the Project URL and an active **modern publishable key** (`sb_publishable_...`) from the project's connection/API-key settings. These two values are public browser configuration. This implementation deliberately rejects secret keys and legacy JWT keys to avoid accidentally accepting a legacy service-role key. Never use `sb_secret_...`, a service-role key, database password, management token, or administrator password in any `VITE_*` variable, tracked file, screenshot, or chat message.

Both variables may be blank: the public storefront still builds/runs and `/admin` shows an explanatory setup state. Setting only one, an unsafe URL, or an unsupported key type fails the Vite build/dev startup with a message that does not echo values. HTTPS is required except explicit loopback URLs for local Supabase development.

Restart Vite after changing configuration:

```sh
npm ci
npm run dev
```

On PowerShell use `npm.cmd ci` and `npm.cmd run dev`. Visit the address Vite prints, then `/admin/login`. No additional Auth user, admin assignment, product import, or foundation migration is needed if the owner's reported setup is correct. The existing `VITE_WHATSAPP_NUMBER` keeps its current purpose and is unrelated to admin authentication.

## Supabase Auth configuration

- Keep the confirmed administrator account and private allowlist entry already created by the owner. Confirm its `is_active` status privately if access is denied.
- Use email/password Auth. Public signup should be disabled for an admin-only login. This UI has no signup flow; signup would never grant allowlist membership even if enabled elsewhere.
- If project Auth settings require CAPTCHA, MFA/AAL2, or a different identity provider, do not weaken them to make this phase pass. This version implements email/password only; add the required challenge flow before hosted acceptance. MFA enforcement is recommended for a later production-hardening phase and is not claimed here.
- Set the Auth Site URL and allowed redirects to the intended local/dev/preview origins through normal project settings. Password login in this phase does not redirect, consume URL access tokens, perform invitation setup, or implement password recovery. Do not add broad production redirect wildcards unnecessarily.
- Confirm the project is active, its publishable key is valid, and requests to its HTTPS project origin are allowed wherever development runs. Add only that actual project hostname to a restricted cloud network allowlist if hosted testing is later authorized.

## Cloudflare Pages configuration — no deployment performed

For a future approved **preview** build of `feat/admin-dashboard`:

| Setting                         | Value                                               |
| ------------------------------- | --------------------------------------------------- |
| Build command                   | `npm run build`                                     |
| Output                          | `dist`                                              |
| Node                            | 22.12+ or 24 LTS                                    |
| `VITE_SUPABASE_URL`             | Project URL for `farm-market-dev`                   |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Modern public publishable key for that same project |
| `VITE_WHATSAPP_NUMBER`          | Existing optional storefront setting                |

Set the variables in the intended Pages environment (Preview and, only when approved later, Production). They are compiled into static assets: changing them requires a rebuild. `public/_redirects` remains the SPA fallback for direct admin links and reloads. No Pages Functions, secret bindings, or database credentials are required. No build/deployment is triggered by these instructions.

## Session and authorization behavior

- The SDK is loaded only for `/admin/*`. Merely opening the public storefront does not initialize the admin client.
- Sessions are stored in **sessionStorage**, not localStorage; the tab retains login across reloads. Browser tab/session restoration can restore sessionStorage, so closing a tab is not a substitute for server-side revocation.
- Restored session contents and editable profile metadata are not trusted. `auth.getUser()` verifies the current user through Supabase Auth; then the database RPC must return exactly `true` before any dashboard is rendered.
- Every dashboard fetch checks authorization before and after data reads. The route guard rechecks on token/auth events, focus, visibility changes, and every 60 seconds while authorized. Pending requests are aborted/discarded when their view unmounts. Failures hide dashboard data rather than exposing cached content.
- Removing/deactivating an allowlist entry affects the next server authorization check without changing the user's JWT. Already-rendered/downloaded data cannot be erased retroactively; the next focus/timer/request check hides the view. Existing RLS remains the final authority for every database operation.
- Auth callbacks defer further Auth work until outside the SDK event callback to avoid session-lock deadlocks. Generation checks prevent stale asynchronous checks from restoring a previous UI session.
- Logout clears the current tab's session and UI even if the server logout request fails. Other tabs/devices are not logged out. If offline logout cannot revoke the server refresh token, local cleanup still occurs; a previously stolen token is not magically invalidated. Supabase access JWTs follow their configured lifetime.
- Requests have a 15-second fetch deadline. Automatic PostgREST retries are disabled in favor of explicit refresh/retry controls; Auth refresh remains enabled. No passwords, tokens, raw server errors, private SQL details, or full user objects are logged/displayed by application code.
- Build-time configuration validation helps reject accidental privileged-key use. It is not permission to put secrets in public variables; any frontend token can be read by the browser's user.

## Automated validation

Run the production build and browser suite:

```sh
npm run build
npx playwright install chromium
npm test
```

For a system Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable before running tests. Playwright starts its own Vite server; stop an existing server using its test port first. The test server overrides the Supabase settings with a **synthetic test-only project origin and publishable-key string**, and `tests/admin-mocks.ts` intercepts every request to that origin. Never replace these test settings with real credentials.

Browser checks exercise the actual Supabase JS client and UI against **mocked HTTP responses**, not the hosted project. They cover login, safe credential errors, password visibility, authorization denial despite forged metadata, real pagination behavior, empty/data-error states, logout/back navigation, expiry/refresh failure, revocation, RPC outage/missing migration, mobile navigation, and the existing storefront at 390px, 768px, and 1440px. Test products exist only in intercepted browser responses, never in Supabase.

Run the foundation SQL checks and the new RPC checks locally (no Supabase credentials):

```sh
npm install --prefix /tmp/farm-market-db-validation --no-audit --no-fund @electric-sql/pglite@0.3.14
node supabase/tests/run-local.mjs
node supabase/tests/admin-status-rpc.mjs
```

These use disposable in-memory PostgreSQL plus local Auth/Storage doubles. The foundation is applied only inside the disposable test engine; **never run bootstrap/fixtures against the existing hosted project**. On Windows set `FARM_MARKET_TEST_DEPS` to a temporary dependency folder as described in `supabase/README.md`.

## Hosted acceptance checklist — not yet run

Before treating this login as verified against `farm-market-dev`:

1. Review/apply only the new status-RPC migration and set the two public variables locally. Restart Vite.
2. With the real confirmed/allowlisted account, sign in, reload the page, and verify live counts and an honest empty state if the database has no products. Public storefront samples must remain independent.
3. With a real non-admin Auth account, confirm access is rejected even with metadata claiming admin; there must be no privileged data response. Do not add that user to the allowlist to make a test pass.
4. Verify failed/expired/invalid sessions redirect to login; verify SDK token refresh with a real session; log out and confirm the current tab no longer accesses admin routes.
5. Privately revoke the admin through the established manual SQL-owner process, keep the same session, and confirm a refresh/focus check rejects access. Restore access only if intended.
6. Verify failed/missing RPC and network errors fail closed. Review HTTP responses and RLS independently; a hidden button is not a database permission test.
7. Recheck the deployed origin/redirect configuration only in an approved preview later. Do not merge or deploy automatically.

The next phase can add validated product CRUD, image uploads with content validation and Storage API cleanup, store settings management, and explicit MFA/password-recovery flows. None of those is presented as functional in this version.
