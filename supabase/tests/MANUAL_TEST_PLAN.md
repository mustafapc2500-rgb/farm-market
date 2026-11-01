# Hosted Supabase acceptance plan (NOT EXECUTED)

Run only after the owner approves/applies the migration to `farm-market-dev`. This plan supplements local SQL tests; it is not permission to run against a live project now. Use synthetic content and a development project. Never test through a privileged SQL Editor/service-role client when assessing visitor or ordinary-user permissions.

## Preparation after approval

- Run `verify-installed.sql` as postgres and inspect the results described in `../README.md`.
- Configure a temporary local test client using the project URL and the **publishable key** (or legacy anon key). Neither is a service/secret key. No keys are needed for this phase's review.
- Use Supabase Auth to create two development identities: one manually allowlisted administrator and one normal user. Log in normally; do not forge JWTs or put credentials into tracked files, URLs, screenshots, or logs.
- Create one published and one unpublished category. As admin, create a published product, a draft product, and a product marked published inside the unpublished category. Record UUIDs privately for test requests. Availability and publication are different: include an unavailable but published product.
- Upload genuine small JPEG/PNG/WebP files through Storage, then link their metadata. Include an unlinked upload and an image on each test product. Use product UUID/image UUID.extension paths.

## Authorization matrix

| Operation                                             | Anonymous client       | Normal authenticated client | Active allowlisted admin    |
| ----------------------------------------------------- | ---------------------- | --------------------------- | --------------------------- |
| Read published product/public category                | Allowed                | Allowed                     | Allowed                     |
| Read unavailable but published product                | Allowed                | Allowed                     | Allowed                     |
| Read draft, hidden category, or its published product | Hidden                 | Hidden                      | Allowed                     |
| Read draft/unlinked image metadata or bytes           | Hidden/denied          | Hidden/denied               | Allowed                     |
| Insert/update/delete products/categories/images       | Denied/no changed rows | Denied/no changed rows      | Allowed                     |
| Update store settings                                 | Denied                 | No changed rows             | Allowed                     |
| Insert/delete settings singleton                      | Denied                 | Denied                      | Denied; owner recovery only |
| Read/insert/update/delete admin allowlist             | Denied                 | Denied                      | Denied; SQL owner only      |
| Change product bucket to public/delete/recreate it    | Denied                 | Denied                      | Denied; SQL owner only      |

For denied inserts, inspect the returned authorization error. Unauthorized updates/deletes can legitimately return zero rows rather than an HTTP error; verify `.select()` results and then independently re-read as admin to prove the data did not change. Public reads of hidden rows return empty results. Storage may report 400/403/404 depending on endpoint; prove bytes were not delivered, not just a particular HTTP status.

## Required scenarios

1. Perform every matrix row with a fresh anonymous client, then a normal Auth user, then the allowlisted admin. Verify normal-user `user_metadata` claiming `is_admin: true` has no effect. Merely creating/signing up a user must leave the private allowlist unchanged.
2. Admin creates, edits, features, publishes, unpublishes, and deletes test products. Confirm defaults are unpublished and EUR-only. Confirm drafts remain absent from public list and detail requests, not just hidden by UI filtering.
3. Unpublish the parent category: its products and image bytes must become inaccessible to new visitor requests. Republish and verify public visibility returns only for published products.
4. As SQL owner, deactivate the admin's allowlist row. Using the **same existing user session**, attempt another write: it must fail/change zero rows. Re-enable only if intended. No token-refresh requirement should be necessary for the next DB request.
5. Upload an unlinked file: admin can read it, visitors cannot. Link it to a published product: visitors can now request it using authorized private-bucket access. Draft links remain private. A fake path, another product's folder, missing upload, invalid UUID, `.svg`, and `../` must fail.
6. Try anonymous/normal-user Storage upload, overwrite, rename/move, and delete. All must fail for this bucket. Check both source and destination when testing moves; moving an unrelated-bucket object into `product-images` must not bypass authorization.
7. Try uploading a file exceeding 5 MiB and disallowed MIME types: the actual Storage service must reject them. Test MIME/extension mismatches too; the future uploader must decode/re-encode valid image bytes rather than trusting client declarations.
8. Confirm `getPublicUrl()` does not serve private objects. Test signed URLs separately: creation must require current SELECT permission, but a previously issued URL can work until expiry after unpublication. Use short TTL or per-request authorization; do not claim instant revocation of issued URLs or cached/downloaded bytes.
9. Add a second primary image: database must reject it. Check deterministic gallery ordering, nonempty alt text, negative prices, `NaN`, non-EUR currency, invalid WhatsApp numbers, invalid logo schemes, missing categories, duplicate slugs, and singleton settings constraints.
10. Delete a product: its image metadata should cascade; visitors must lose authorization to orphan objects. Then remove actual files through Storage API as admin and confirm byte deletion. Do not use direct SQL deletes on managed Storage tables.
11. Confirm no exposed RPC can assign admins. Review Data API exposed schemas, helper owner/search paths, table grants, and any policies added by other migrations. In a disposable test project only, verify a deliberately broad permissive Storage policy still cannot bypass this bucket's restrictive guards; remove the temporary policy afterwards. Other buckets must retain their intended policies.
12. Test login/session expiry and invalid/tampered JWT rejection through the hosted Auth/API service. This is not simulated by local SQL role switching. Verify no browser bundle or tracked environment file contains a service-role key, secret API key, database password, or management token.

Record each result as passed, failed, or unrun. Do not connect the storefront, implement admin UI, or deploy until review approval and the relevant hosted checks have passed.
