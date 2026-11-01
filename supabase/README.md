# Farm Market: database foundation — review before applying

Status: **SQL prepared, not applied to `farm-market-dev`**. No Supabase SDK, environment variables, dashboard UI, API calls, or database connection were added to the application. The colorful storefront, routes, sample products, and WhatsApp environment configuration remain unchanged. No credentials are required to review or run the local security tests.

## Current application and mapping for a later phase

`src/data/products.ts` defines the product types, four categories, six samples, and a `productRepository` adapter. `Catalog.tsx` filters/searches/sorts that adapter's data; `Details.tsx` looks up a product using its slug-like `id`. `FarmArt.tsx` maps six original illustration keys. `WhatsAppButton.tsx` uses `VITE_WHATSAPP_NUMBER` and `lib/whatsapp.ts` to build Arabic product-specific messages. None of these files is changed by this database phase.

| Existing field                   | Future database field                                                       |
| -------------------------------- | --------------------------------------------------------------------------- |
| `Product.id` (e.g. `cozy-farm`)  | `products.slug`, preserving existing routes; UUID `products.id` is internal |
| `title`                          | `products.name`                                                             |
| `description`, `fullDescription` | `description`, `full_description`                                           |
| `price`                          | `price_eur`: exact two-decimal numeric, fixed EUR                           |
| `category`                       | Category slug; stored relationship uses `category_id` UUID                  |
| `available`, `featured`          | `is_available`, `is_featured`                                               |
| `art`                            | Optional `illustration_key` fallback                                        |
| `includes`                       | `includes` text array                                                       |
| All current products are samples | `is_sample` must be honored by the future adapter/UI                        |
| No publication workflow yet      | `is_published`, default **false**, distinct from availability               |

Categories seed the same slugs, Arabic names, descriptions, and color keys. No sample products are imported. Future dynamic categories will require a deliberate update to the current `CategoryId` union and adapter. Translations remain a future migration; current display fields contain Arabic plain text, not HTML.

## Tables

- `public.categories`: UUID, stable unique slug, Arabic name/description, color key, publication state, display order, server-maintained timestamps.
- `public.products`: UUID, stable unique slug, category FK, name, short/full descriptions, EUR price, availability/publication/featured/sample flags, inclusions, optional original artwork key, timestamps.
- `public.product_images`: ordered gallery entries, alt text, private bucket/path, one optional primary image per product, timestamps. A product can have multiple images or use an illustration fallback.
- `public.store_settings`: one row (`id = 1`) for public store name, logo URL/path, WhatsApp number, email, phone, address, and contact description. The initial phone/contact values are null. No private settings, admin contact details, tokens, or secrets belong here.
- `farm_market_private.authorized_administrators`: existing Supabase Auth UUID, active status, private setup notes, timestamps. **No browser role—including an existing admin—can read, assign, update, or delete allowlist entries.**

Constraints enforce nonblank bounded display text, unique safe slugs, valid category relationships, nonnegative finite EUR amounts, bounded inclusion arrays, ordering, one primary image, permitted artwork keys, a singleton settings row, and the frontend-compatible WhatsApp digit format. Publishing a product does not bypass its category's publication state. Unavailable published services remain browsable; publication determines visibility.

## Authorization

All five tables enable RLS; the four public tables also force RLS. Explicit table grants exclude dangerous operations such as client `TRUNCATE`. The only `SECURITY DEFINER` helper is the fixed, argument-free `is_administrator()` predicate, with an empty search path and fully qualified references. Its owner can read the private allowlist. Other functions are security invokers. Helper execute grants are explicit and minimal.

| Caller                                  | Public category/product/image reads                                    | Catalog writes                                                | Store settings                      | Admin assignment             |
| --------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------- |
| Anonymous                               | Published products and published parent categories; linked images only | Denied                                                        | Read public display/contact fields  | Denied                       |
| Authenticated, not allowlisted          | Same public reads                                                      | Denied                                                        | Read only                           | Denied                       |
| Authenticated, active allowlisted admin | Includes drafts and unpublished categories                             | Create/update/delete products, categories, and image metadata | Read/update existing singleton only | Denied                       |
| Trusted SQL owner                       | Privileged operational access                                          | Privileged                                                    | Can recover singleton if needed     | Manual setup/revocation only |

Supabase's server/service role is inherently privileged and can bypass RLS on public catalog data. It is not a browser/admin login mechanism. This migration does not grant it access to the private administrator table. Never ship a service-role key, secret API key, database password, or management token to frontend code or any `VITE_*` variable.

Authorization uses the verified Auth user's UUID and the database allowlist, not `user_metadata`, `app_metadata`, email strings, a role selected in the UI, or a signup trigger. A normal signup never creates an administrator. Deactivating the allowlist row blocks subsequent database authorization checks without waiting for a JWT refresh; it does not cancel an already-running transaction or erase cached content.

## Private Storage

The migration creates **private** bucket `product-images`, capped at 5 MiB per file and restricted to JPEG, PNG, and WebP MIME types. Object paths must be:

```text
<existing-product-uuid>/<new-image-uuid>.webp
```

`.jpg`, `.jpeg`, and `.png` are also accepted. Slug folders, SVG, traversal paths, unknown product UUIDs, and arbitrary filenames are rejected. Do not create this bucket manually before applying the migration.

Admins upload through the **Storage API first**, then insert matching `product_images` metadata. A trigger checks that the referenced object exists; metadata cannot refer to another product's folder. Public downloads require a linked image belonging to a published product in a published category. Draft and unlinked objects remain private. Admins can remove orphan objects even after a product has been deleted.

Scoped **restrictive** guards protect this bucket even if a broad permissive Storage policy already exists. Policies for other buckets are left intact. Authenticated catalog admins cannot change the bucket to public, delete it, or recreate its configuration; those are trusted SQL-owner tasks.

Important operational limits:

- Private images need authorized Storage downloads or short-lived signed URLs. `getPublicUrl()` is not an access mechanism for this bucket.
- Already-issued signed URLs remain bearer access until expiry. After unpublishing, no new visitor authorizations are granted; old signed URLs and downloaded copies cannot be instantly revoked by RLS. Prefer short expiry (e.g. 60 seconds) or authorize each download when immediate access revocation is required.
- Deleting a product cascades its metadata, **not its stored bytes**. Future admin flows must remove files via Storage API and handle retries/orphan cleanup. Never delete rows directly from `storage.objects` in a real project or assume SQL deletion removes physical files.
- MIME/size configuration and filename validation do not prove the bytes are a valid image. A future upload flow must validate actual file content and ideally re-encode images. This phase creates no uploader.

## Apply through Supabase SQL Editor — only after review

1. Review `migrations/20261101000100_catalog_foundation.sql` and the security tests below. Nothing in this repository auto-applies it.
2. In Supabase Dashboard, explicitly select **`farm-market-dev`**. Double-check the project reference in its URL; do not select a production project.
3. Open **SQL Editor → New query**. Use the default trusted **postgres** role. Supabase Auth and Storage must already be initialized (normal hosted-project defaults).
4. Check that none of these application tables, the `farm_market_private` schema, or the `product-images` bucket already exists. If any exists, stop and inspect it; do not drop it or use `IF NOT EXISTS` to mask incompatible definitions. Existing unrelated buckets/policies are preserved.
5. Copy the **entire** migration file, including `begin;` and `commit;`, into the query. Review the target project again, then click **Run** once. Do not run the local test bootstrap/fixture files or the admin templates as part of this migration.
6. The transaction must complete successfully. On error, investigate the cause and roll back any aborted session (`rollback;` if needed). Do not apply fragments, disable RLS, or rerun a partially edited migration to work around a failure.
7. Run `tests/verify-installed.sql` as a separate, read-only SQL Editor query. Expect five RLS-enabled application tables, eight public-table policies, eleven `fm_*` Storage policies, and all five privilege booleans false. Only `is_administrator` is a security definer and its search path is empty. The bucket must be private with the MIME list and 5 MiB limit. Initial counts: four public categories, zero products, zero administrators, one store-settings row.
8. In **Data API settings**, keep `farm_market_private` out of the exposed schemas. Do not expose Auth or Storage tables via the Data API as a workaround. Public catalog tables use the usual `public` schema; image requests use the Storage service.
9. Keep the frontend on mock data. Do not add Supabase URLs/keys or deploy a connection until this phase has been reviewed and approved.

The migration is deliberately a one-time migration and fails on conflicting schema/bucket names. For SQL Editor application, record its filename and successful application in your project change log; the SQL Editor does not automatically maintain the Supabase CLI migration history. A later CLI workflow must reconcile that history deliberately rather than replay this file.

## Manual administrator setup — separate optional step after approval

1. Decide which real owner will administer the store. Use a unique account with a strong password. Plan MFA enforcement for the admin-dashboard phase.
2. Use **Authentication → Users** to create/invite that user through Supabase Auth. Verify the identity, complete the invitation/email confirmation, and copy the existing Auth user UUID. Never create users by inserting into `auth.users`.
3. Open `manual/authorize-admin.sql`, replace `REPLACE_WITH_EXISTING_AUTH_USER_UUID` with that UUID, and review the target project. Run it separately as postgres in SQL Editor. It checks for an existing user with a confirmed email. Its placeholder is intentionally non-executable until replaced.
4. Verify the expected single active allowlist entry as the trusted owner. Do not grant users membership in Postgres's `authenticated`, `postgres`, or `service_role` database roles manually.
5. To revoke access later, substitute the UUID in `manual/revoke-admin.sql` and run it as postgres. Admin assignment is not exposed through a browser RPC or any dashboard feature in this phase.

For a closed admin login, disable **Allow new users to sign up** in Supabase Auth settings before the future admin interface is introduced. Even if signup remains enabled, the allowlist still prevents escalation. Configure production site/redirect URLs, email delivery, and MFA during the Auth/dashboard phase; no localhost redirect or password is required for this database review.

## Local executable security checks

The runner uses an isolated in-memory PostgreSQL engine (PGlite 0.3.14), SQL role switching, synthetic Auth UUIDs, and minimal local Auth/Storage test doubles. It never accepts a project URL or database password and cannot connect to `farm-market-dev`. The migration is executed only against that disposable engine. Application dependencies/lockfiles are unchanged.

From the repository root on Linux/macOS:

```sh
npm install --prefix /tmp/farm-market-db-validation --no-audit --no-fund @electric-sql/pglite@0.3.14
node supabase/tests/run-local.mjs
```

On Windows PowerShell:

```powershell
$env:FARM_MARKET_TEST_DEPS = Join-Path $env:TEMP 'farm-market-db-validation'
npm.cmd install --prefix $env:FARM_MARKET_TEST_DEPS --no-audit --no-fund @electric-sql/pglite@0.3.14
node supabase/tests/run-local.mjs
```

The checks exercise actual PostgreSQL constraints, ACLs, RLS policies, triggers, publication rules, metadata spoofing, manual-only admin assignment, immediate subsequent-request revocation, file linkage, private-object visibility, orphan cleanup permissions, and resistance to broad Storage policies. SQLSTATE failures and zero-row updates/deletes are checked separately. A privileged SQL Editor session is not used to pretend to be an anonymous visitor.

`tests/bootstrap.sql` and `tests/fixtures.sql` are **local-only test doubles**. Never paste them into a hosted project: they create fake Auth users and Storage metadata without real uploaded bytes. They are not production migrations.

These checks do not validate hosted Auth JWT verification, Storage HTTP behavior, MIME sniffing, physical file deletion, signed URLs, project-specific API grants, or the hosted Supabase PostgreSQL version. Follow `tests/MANUAL_TEST_PLAN.md` after the migration is approved and applied. No hosted checks have been run in this phase.

## Files and current boundaries

- `migrations/20261101000100_catalog_foundation.sql`: only automatic schema migration; not applied remotely.
- `manual/authorize-admin.sql`, `manual/revoke-admin.sql`: deliberate SQL-owner templates; never automatic migrations.
- `tests/verify-installed.sql`: read-only hosted schema inspection after approval.
- `tests/run-local.mjs`, `tests/bootstrap.sql`, `tests/fixtures.sql`: disposable local checks, not hosted setup scripts.
- `tests/MANUAL_TEST_PLAN.md`: required hosted verification plan for the later approved application.

No dashboard, frontend connection, credential requirements, authentication UI, product import, deployment, or main-branch merge is part of this change.
