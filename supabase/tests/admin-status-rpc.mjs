/** Local PostgreSQL only; does not connect to or re-migrate farm-market-dev. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const { PGlite } = require(
  require.resolve("@electric-sql/pglite", {
    paths: [
      process.env.FARM_MARKET_TEST_DEPS || "/tmp/farm-market-db-validation",
    ],
  }),
);
const db = new PGlite();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const admin = "00000000-0000-4000-8000-000000000001",
  ordinary = "00000000-0000-4000-8000-000000000002";
let passed = 0;
async function check(name, run) {
  await run();
  passed++;
  console.log(`PASS ${passed}: ${name}`);
}
async function as(role, user, sql) {
  await db.exec("begin");
  try {
    assert.ok(["anon", "authenticated"].includes(role));
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claims',$1,true)", [
      JSON.stringify({
        sub: user ?? undefined,
        role,
        user_metadata: { is_admin: true },
        app_metadata: { role: "admin" },
      }),
    ]);
    const result = await db.query(sql);
    await db.exec("commit");
    return result.rows;
  } catch (error) {
    await db.exec("rollback");
    throw error;
  }
}
try {
  for (const file of [
    "tests/bootstrap.sql",
    "migrations/20261101000100_catalog_foundation.sql",
    "tests/fixtures.sql",
  ])
    await db.exec(await readFile(path.join(root, file), "utf8"));
  const policiesBefore = (
    await db.query(
      "select schemaname,tablename,policyname,qual,with_check from pg_policies order by schemaname,tablename,policyname",
    )
  ).rows;
  await db.exec(
    await readFile(
      path.join(root, "migrations/20261101000200_admin_status_rpc.sql"),
      "utf8",
    ),
  );
  await check("new RPC migration preserves existing RLS policies", async () =>
    assert.deepEqual(
      (
        await db.query(
          "select schemaname,tablename,policyname,qual,with_check from pg_policies order by schemaname,tablename,policyname",
        )
      ).rows,
      policiesBefore,
    ),
  );
  await check("anonymous callers cannot execute the RPC", async () =>
    assert.rejects(
      () => as("anon", null, "select public.current_user_is_admin()"),
      (error) => error.code === "42501",
    ),
  );
  await check(
    "normal authenticated users get false despite forged admin metadata",
    async () =>
      assert.equal(
        (
          await as(
            "authenticated",
            ordinary,
            "select public.current_user_is_admin() as allowed",
          )
        )[0].allowed,
        false,
      ),
  );
  await check(
    "an authenticated caller without a user identity gets false",
    async () =>
      assert.equal(
        (
          await as(
            "authenticated",
            null,
            "select public.current_user_is_admin() as allowed",
          )
        )[0].allowed,
        false,
      ),
  );
  await check("manually authorized administrator gets true", async () =>
    assert.equal(
      (
        await as(
          "authenticated",
          admin,
          "select public.current_user_is_admin() as allowed",
        )
      )[0].allowed,
      true,
    ),
  );
  await check("RPC cannot select another user by accepting an ID", async () =>
    assert.rejects(
      () =>
        as(
          "authenticated",
          ordinary,
          `select public.current_user_is_admin('${admin}'::uuid)`,
        ),
      (error) => error.code === "42883",
    ),
  );
  await check(
    "revocation is recognized without changing the authenticated identity",
    async () => {
      await db.query(
        "update farm_market_private.authorized_administrators set is_active=false where user_id=$1",
        [admin],
      );
      assert.equal(
        (
          await as(
            "authenticated",
            admin,
            "select public.current_user_is_admin() as allowed",
          )
        )[0].allowed,
        false,
      );
    },
  );
  await check(
    "RPC does not grant private table access or assignments",
    async () => {
      for (const user of [ordinary, admin])
        await assert.rejects(
          () =>
            as(
              "authenticated",
              user,
              "select * from farm_market_private.authorized_administrators",
            ),
          (error) => error.code === "42501",
        );
    },
  );
  await check(
    "public wrapper is a no-argument boolean security invoker with a locked search path",
    async () => {
      const { rows } = await db.query(
        "select p.pronargs,p.prosecdef,p.proconfig,p.prorettype::regtype::text as result from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='current_user_is_admin'",
      );
      assert.equal(rows.length, 1);
      assert.equal(rows[0].pronargs, 0);
      assert.equal(rows[0].prosecdef, false);
      assert.equal(rows[0].result, "boolean");
      assert.ok(
        rows[0].proconfig.some((value) => value.startsWith("search_path=")),
      );
    },
  );
  await check(
    "only authenticated browser role receives EXECUTE, not anonymous or service role",
    async () => {
      for (const role of ["anon", "authenticated", "service_role"])
        assert.equal(
          (
            await db.query(
              "select has_function_privilege($1,'public.current_user_is_admin()','EXECUTE') as allowed",
              [role],
            )
          ).rows[0].allowed,
          role === "authenticated",
        );
    },
  );
  console.log(
    `\n${passed} admin RPC security checks passed locally. No hosted migrations executed.`,
  );
} finally {
  await db.close();
}
