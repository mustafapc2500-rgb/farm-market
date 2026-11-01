/** Database-only local runner. No project URL, password, key, or remote connection exists here. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const deps =
  process.env.FARM_MARKET_TEST_DEPS || "/tmp/farm-market-db-validation";
const { PGlite } = require(
  require.resolve("@electric-sql/pglite", { paths: [deps] }),
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new PGlite(); // In-memory only. Never accepts DATABASE_URL or Supabase credentials.
const admin = "00000000-0000-4000-8000-000000000001";
const ordinary = "00000000-0000-4000-8000-000000000002";
const published = "20000000-0000-4000-8000-000000000001";
const draft = "20000000-0000-4000-8000-000000000002";
const managed = "20000000-0000-4000-8000-000000000010";
const imageFile = "30000000-0000-4000-8000-000000000010.webp";
let passed = 0;
async function test(name, run) {
  await run();
  passed++;
  console.log(`PASS ${passed}: ${name}`);
}
async function as(role, user, sql, parameters = []) {
  await db.exec("begin");
  try {
    assert.ok(["anon", "authenticated"].includes(role));
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(
        user
          ? {
              sub: user,
              role,
              user_metadata: { is_admin: true },
              app_metadata: { role: "admin" },
            }
          : { role: "anon" },
      ),
    ]);
    const result = await db.query(sql, parameters);
    await db.exec("commit");
    return result.rows;
  } catch (error) {
    await db.exec("rollback");
    throw error;
  }
}
async function denied(role, user, sql, parameters = [], code = "42501") {
  await assert.rejects(
    () => as(role, user, sql, parameters),
    (e) => e.code === code,
    `Expected SQLSTATE ${code}`,
  );
}
const newProduct = `insert into public.products(id,slug,category_id,name,description,full_description,price_eur)
 values ($1,'admin-created',(select id from public.categories where slug='layout'),'Admin product','Description','Full description',25.50) returning *`;
try {
  await db.exec(await readFile(path.join(root, "tests/bootstrap.sql"), "utf8"));
  const readMigration = await readFile(
    path.join(root, "migrations/20261101000100_catalog_foundation.sql"),
    "utf8",
  );
  await db.exec(readMigration);
  console.log("Migration applied to isolated PostgreSQL engine, not Supabase.");
  await test("migration creates five RLS-protected tables with no administrators or products", async () => {
    const { rows } = await db.query(
      "select count(*)::int as count from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','farm_market_private') and c.relkind='r' and c.relrowsecurity",
    );
    assert.equal(rows[0].count, 5);
    assert.equal(
      (await db.query("select count(*)::int as count from public.products"))
        .rows[0].count,
      0,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::int as count from farm_market_private.authorized_administrators",
        )
      ).rows[0].count,
      0,
    );
  });
  await db.exec(await readFile(path.join(root, "tests/fixtures.sql"), "utf8"));
  await test("anonymous readers see only published products in published categories", async () => {
    assert.deepEqual(
      (await as("anon", null, "select slug from public.products")).map(
        (r) => r.slug,
      ),
      ["published-test"],
    );
    assert.equal(
      (await as("anon", null, "select * from public.categories")).length,
      4,
    );
    assert.equal(
      (await as("anon", null, "select * from public.product_images")).length,
      1,
    );
    assert.equal(
      (await as("anon", null, "select * from public.store_settings")).length,
      1,
    );
  });
  await test("ordinary authenticated readers cannot see drafts or hidden-category products", async () => {
    assert.deepEqual(
      (
        await as("authenticated", ordinary, "select slug from public.products")
      ).map((r) => r.slug),
      ["published-test"],
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "select * from public.product_images",
        )
      ).length,
      1,
    );
  });
  await test("anonymous visitors cannot insert, update, delete, or truncate products", async () => {
    await denied("anon", null, newProduct, [managed]);
    await denied(
      "anon",
      null,
      "update public.products set price_eur=0 where id=$1",
      [published],
    );
    await denied("anon", null, "delete from public.products where id=$1", [
      published,
    ]);
    await denied("anon", null, "truncate public.products cascade");
  });
  await test("unauthorized authenticated writes fail or affect zero rows", async () => {
    await denied("authenticated", ordinary, newProduct, [managed]);
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "update public.products set price_eur=0 where id=$1 returning id",
          [published],
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "delete from public.products where id=$1 returning id",
          [published],
        )
      ).length,
      0,
    );
    await denied("authenticated", ordinary, "truncate public.products cascade");
    assert.equal(
      (
        await db.query("select price_eur from public.products where id=$1", [
          published,
        ])
      ).rows[0].price_eur,
      "29.90",
    );
  });
  await test("signup/profile metadata claiming admin never grants authorization", async () => {
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      false,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      true,
    );
    assert.equal(
      (
        await as(
          "anon",
          null,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      false,
    );
  });
  await test("ordinary users and existing admins cannot read or modify the administrator allowlist", async () => {
    for (const user of [ordinary, admin]) {
      await denied(
        "authenticated",
        user,
        "select * from farm_market_private.authorized_administrators",
      );
      await denied(
        "authenticated",
        user,
        "insert into farm_market_private.authorized_administrators(user_id) values ($1)",
        [ordinary],
      );
      await denied(
        "authenticated",
        user,
        "update farm_market_private.authorized_administrators set is_active=true where user_id=$1",
        [ordinary],
      );
      await denied(
        "authenticated",
        user,
        "delete from farm_market_private.authorized_administrators where user_id=$1",
        [admin],
      );
    }
  });
  await test("authorized admins can read drafts and create/edit products; new products default to unpublished", async () => {
    assert.equal(
      (await as("authenticated", admin, "select * from public.products"))
        .length,
      3,
    );
    const rows = await as("authenticated", admin, newProduct, [managed]);
    assert.equal(rows[0].is_published, false);
    assert.equal(rows[0].currency, "EUR");
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "update public.products set name=$1,is_featured=true where id=$2 returning id",
          ["Edited product", managed],
        )
      ).length,
      1,
    );
    assert.equal(
      (
        await as("anon", null, "select id from public.products where id=$1", [
          managed,
        ])
      ).length,
      0,
    );
  });
  await test("only admins can manage categories and existing products prevent category deletion", async () => {
    await denied(
      "authenticated",
      ordinary,
      "insert into public.categories(slug,name) values ('denied','Denied')",
    );
    const created = await as(
      "authenticated",
      admin,
      "insert into public.categories(slug,name) values ('admin-category','Admin category') returning id",
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "update public.categories set sort_order=12 where id=$1 returning id",
          [created[0].id],
        )
      ).length,
      1,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "delete from public.categories where id=$1 returning id",
          [created[0].id],
        )
      ).length,
      1,
    );
    await denied(
      "authenticated",
      admin,
      "delete from public.categories where slug='layout'",
      [],
      "23503",
    );
  });
  await test("store settings are publicly readable but only admins can update them", async () => {
    await denied(
      "anon",
      null,
      "update public.store_settings set store_name='Denied'",
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "update public.store_settings set store_name='Denied' returning id",
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "update public.store_settings set store_name='Admin store' returning id",
        )
      ).length,
      1,
    );
    await denied("authenticated", admin, "delete from public.store_settings");
    await denied(
      "authenticated",
      admin,
      "insert into public.store_settings(id,store_name) values(1,'Other')",
    );
  });
  await test("constraints reject negative/NaN prices, unsupported currency, blank names, invalid WhatsApp and logo URLs", async () => {
    for (const sql of [
      "update public.products set price_eur=-1",
      "update public.products set price_eur='NaN'",
      "update public.products set currency='USD'",
      "update public.products set name='  '",
    ]) {
      await denied("authenticated", admin, sql, [], "23514");
    }
    await denied(
      "authenticated",
      admin,
      "update public.store_settings set whatsapp_number='+12345'",
      [],
      "23514",
    );
    await denied(
      "authenticated",
      admin,
      "update public.store_settings set logo_url='javascript:alert(1)'",
      [],
      "23514",
    );
    await denied(
      "authenticated",
      admin,
      "update public.product_images set sort_order=-1",
      [],
      "23514",
    );
  });
  await test("timestamps are server-maintained and created_at cannot be rewritten", async () => {
    const before = (
      await as(
        "authenticated",
        admin,
        "select created_at,updated_at from public.products where id=$1",
        [managed],
      )
    )[0];
    const after = (
      await as(
        "authenticated",
        admin,
        "update public.products set created_at='2000-01-01',updated_at='2000-01-01' where id=$1 returning created_at,updated_at",
        [managed],
      )
    )[0];
    assert.equal(String(after.created_at), String(before.created_at));
    assert.ok(new Date(after.updated_at) >= new Date(before.updated_at));
  });
  await test("private bucket has a 5 MiB limit, raster MIME allowlist, and published-only object reads", async () => {
    const { rows } = await db.query(
      "select * from storage.buckets where id='product-images'",
    );
    assert.equal(rows[0].public, false);
    assert.equal(Number(rows[0].file_size_limit), 5242880);
    assert.deepEqual(rows[0].allowed_mime_types, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    assert.equal(
      (
        await as(
          "anon",
          null,
          "select * from storage.objects where bucket_id='product-images'",
        )
      ).length,
      1,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "select * from storage.objects where bucket_id='product-images'",
        )
      ).length,
      4,
    );
  });
  await test("anonymous and unauthorized users cannot upload, edit, delete, or link product images", async () => {
    for (const [role, user] of [
      ["anon", null],
      ["authenticated", ordinary],
    ]) {
      await denied(
        role,
        user,
        "insert into storage.objects(bucket_id,name) values('product-images',$1)",
        [`${published}/${imageFile}`],
      );
      assert.equal(
        (
          await as(
            role,
            user,
            "update storage.objects set name=name where bucket_id='product-images' returning id",
          )
        ).length,
        0,
      );
      assert.equal(
        (
          await as(
            role,
            user,
            "delete from storage.objects where bucket_id='product-images' returning id",
          )
        ).length,
        0,
      );
    }
    await denied(
      "authenticated",
      ordinary,
      "insert into public.product_images(product_id,storage_path,alt_text) values($1,$2,$3)",
      [
        published,
        `${published}/30000000-0000-4000-8000-000000000001.webp`,
        "Unauthorized",
      ],
    );
  });
  await test("admins upload before linking; unlinked objects remain hidden and invalid paths are rejected", async () => {
    await denied(
      "authenticated",
      admin,
      "insert into storage.objects(bucket_id,name) values('product-images','../bad.svg')",
    );
    await denied(
      "authenticated",
      admin,
      "insert into storage.objects(bucket_id,name) values('product-images',$1)",
      [`99999999-0000-4000-8000-000000000000/${imageFile}`],
    );
    await denied(
      "authenticated",
      admin,
      "insert into public.product_images(product_id,storage_path,alt_text) values($1,$2,$3)",
      [managed, `${managed}/${imageFile}`, "Missing object"],
      "23503",
    );
    await as(
      "authenticated",
      admin,
      "insert into storage.objects(bucket_id,name) values('product-images',$1)",
      [`${managed}/${imageFile}`],
    );
    assert.equal(
      (
        await as("anon", null, "select id from storage.objects where name=$1", [
          `${managed}/${imageFile}`,
        ])
      ).length,
      0,
    );
    await as(
      "authenticated",
      admin,
      "insert into public.product_images(product_id,storage_path,alt_text,is_primary) values($1,$2,$3,true)",
      [managed, `${managed}/${imageFile}`, "Managed image"],
    );
    await denied(
      "authenticated",
      admin,
      "insert into public.product_images(product_id,storage_path,alt_text) values($1,$2,$3)",
      [
        draft,
        `${published}/30000000-0000-4000-8000-000000000004.webp`,
        "Wrong product",
      ],
      "23514",
    );
  });
  await test("only one primary image is permitted per product", async () => {
    await denied(
      "authenticated",
      admin,
      "insert into public.product_images(product_id,storage_path,alt_text,is_primary) values($1,$2,$3,true)",
      [
        published,
        `${published}/30000000-0000-4000-8000-000000000004.webp`,
        "Second cover",
      ],
      "23505",
    );
  });
  await test("publishing exposes linked images; unpublishing immediately removes SQL access", async () => {
    await as(
      "authenticated",
      admin,
      "update public.products set is_published=true where id=$1",
      [managed],
    );
    assert.equal(
      (
        await as("anon", null, "select id from storage.objects where name=$1", [
          `${managed}/${imageFile}`,
        ])
      ).length,
      1,
    );
    await as(
      "authenticated",
      admin,
      "update public.products set is_published=false where id=$1",
      [managed],
    );
    assert.equal(
      (
        await as("anon", null, "select id from storage.objects where name=$1", [
          `${managed}/${imageFile}`,
        ])
      ).length,
      0,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "select id from public.product_images where product_id=$1",
          [managed],
        )
      ).length,
      0,
    );
  });
  await test("unpublishing a category also hides its products and image objects", async () => {
    await as(
      "authenticated",
      admin,
      "update public.categories set is_published=false where slug='layout'",
    );
    assert.equal(
      (await as("anon", null, "select * from public.products")).length,
      0,
    );
    assert.equal(
      (
        await as(
          "anon",
          null,
          "select * from storage.objects where bucket_id='product-images'",
        )
      ).length,
      0,
    );
    await as(
      "authenticated",
      admin,
      "update public.categories set is_published=true where slug='layout'",
    );
  });
  await test("revoking an administrator blocks the next request using the same user identity", async () => {
    await db.query(
      "update farm_market_private.authorized_administrators set is_active=false where user_id=$1",
      [admin],
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      false,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "update public.products set name='Revoked' returning id",
        )
      ).length,
      0,
    );
    await db.query(
      "update farm_market_private.authorized_administrators set is_active=true where user_id=$1",
      [admin],
    );
  });
  await test("admins can delete products; metadata cascades and orphan file cleanup remains possible", async () => {
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "delete from public.products where id=$1 returning id",
          [managed],
        )
      ).length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select id from public.product_images where product_id=$1",
          [managed],
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "delete from storage.objects where name=$1 returning id",
          [`${managed}/${imageFile}`],
        )
      ).length,
      1,
    );
  });
  await test("restrictive guards resist broad pre-existing Storage policies without affecting other buckets", async () => {
    await db.exec(
      "create policy deliberately_broad_test_objects on storage.objects for all to anon,authenticated using(true) with check(true); create policy deliberately_broad_test_buckets on storage.buckets for all to anon,authenticated using(true) with check(true)",
    );
    assert.equal(
      (
        await as(
          "anon",
          null,
          "select id from storage.objects where bucket_id='product-images'",
        )
      ).length,
      1,
    );
    await denied(
      "authenticated",
      ordinary,
      "insert into storage.objects(bucket_id,name) values('product-images',$1)",
      [`${published}/${imageFile}`],
    );
    await denied(
      "anon",
      null,
      "insert into storage.objects(bucket_id,name) values('product-images',$1)",
      [`${published}/${imageFile}`],
    );
    for (const user of [ordinary, admin])
      assert.equal(
        (
          await as(
            "authenticated",
            user,
            "update storage.buckets set public=true where id='product-images' returning id",
          )
        ).length,
        0,
      );
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "delete from storage.buckets where id='product-images' returning id",
        )
      ).length,
      0,
    );
    await db.exec(
      "insert into storage.buckets(id,name,public) values('other-test-bucket','other-test-bucket',false); insert into storage.objects(bucket_id,name) values('other-test-bucket','other.webp')",
    );
    assert.equal(
      (
        await as(
          "anon",
          null,
          "select id from storage.objects where bucket_id='other-test-bucket'",
        )
      ).length,
      1,
    );
    await denied(
      "authenticated",
      ordinary,
      "update storage.objects set bucket_id='product-images',name=$1 where bucket_id='other-test-bucket'",
      [`${published}/${imageFile}`],
    );
  });
  await test("only the minimal administrator predicate is SECURITY DEFINER with a locked search path", async () => {
    const { rows } = await db.query(
      "select p.proname,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='farm_market_private' and p.prosecdef",
    );
    assert.deepEqual(
      rows.map((r) => r.proname),
      ["is_administrator"],
    );
    assert.ok(
      rows[0].proconfig.some((value) => value.startsWith("search_path=")),
    );
    assert.equal(
      (
        await db.query(
          "select has_table_privilege('authenticated','farm_market_private.authorized_administrators','INSERT') as allowed",
        )
      ).rows[0].allowed,
      false,
    );
  });
  await test("private trigger functions do not inherit client EXECUTE or administrator-table grants", async () => {
    for (const role of ["anon", "authenticated", "service_role"]) {
      assert.equal(
        (
          await db.query(
            "select has_table_privilege($1,'farm_market_private.authorized_administrators','SELECT') as allowed",
            [role],
          )
        ).rows[0].allowed,
        false,
      );
      for (const functionName of [
        "set_timestamps()",
        "validate_product_image_object()",
      ])
        assert.equal(
          (
            await db.query(
              "select has_function_privilege($1,$2,'EXECUTE') as allowed",
              [role, `farm_market_private.${functionName}`],
            )
          ).rows[0].allowed,
          false,
        );
    }
  });
  await test("post-install verification SQL executes without modifying data", async () => {
    const before = (
      await db.query("select count(*)::int as count from public.products")
    ).rows[0].count;
    await db.exec(
      await readFile(path.join(root, "tests/verify-installed.sql"), "utf8"),
    );
    assert.equal(
      (await db.query("select count(*)::int as count from public.products"))
        .rows[0].count,
      before,
    );
  });
  await test("manual owner-only templates validate existing confirmed users and revoke authorization", async () => {
    const grantTemplate = await readFile(
      path.join(root, "manual/authorize-admin.sql"),
      "utf8",
    );
    const revokeTemplate = await readFile(
      path.join(root, "manual/revoke-admin.sql"),
      "utf8",
    );
    await db.exec(
      grantTemplate.replace("REPLACE_WITH_EXISTING_AUTH_USER_UUID", ordinary),
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      true,
    );
    await db.exec(
      revokeTemplate.replace("REPLACE_WITH_EXISTING_AUTH_USER_UUID", ordinary),
    );
    assert.equal(
      (
        await as(
          "authenticated",
          ordinary,
          "select farm_market_private.is_administrator() as allowed",
        )
      )[0].allowed,
      false,
    );
    const unconfirmed = "00000000-0000-4000-8000-000000000003";
    await db.query("insert into auth.users(id) values($1)", [unconfirmed]);
    await assert.rejects(
      () =>
        db.exec(
          grantTemplate.replace(
            "REPLACE_WITH_EXISTING_AUTH_USER_UUID",
            unconfirmed,
          ),
        ),
      (error) => error.code === "P0001",
    );
    await db.exec("rollback");
    assert.equal(
      (
        await db.query(
          "select user_id from farm_market_private.authorized_administrators where user_id=$1",
          [unconfirmed],
        )
      ).rows.length,
      0,
    );
  });
  await test("reapplying the migration refuses existing state without overwriting data", async () => {
    await assert.rejects(
      () => db.exec(readMigration),
      (error) => error.code === "P0001",
    );
    await db.exec("rollback");
    assert.equal(
      (await db.query("select count(*)::int as count from public.products"))
        .rows[0].count,
      3,
    );
  });
  console.log(
    `\n${passed} database security checks passed. No live project was contacted.`,
  );
} finally {
  await db.close();
}
