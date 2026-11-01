import type { Page } from "@playwright/test";
export const TEST_ORIGIN = "https://farm-market-tests.supabase.co";
export const SESSION_KEY = "farm-market-admin-auth";
const userId = "00000000-0000-4000-8000-000000000011";
const user = {
  id: userId,
  aud: "authenticated",
  role: "authenticated",
  email: "admin@example.invalid",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { is_admin: true, role: "admin" },
};
export function session(expired = false) {
  const exp = Math.floor(Date.now() / 1000) + (expired ? -3600 : 3600);
  const token = [
    { alg: "HS256", typ: "JWT" },
    { sub: userId, aud: "authenticated", role: "authenticated", exp },
    "synthetic-test-signature",
  ]
    .map((part, index) =>
      index < 2
        ? Buffer.from(JSON.stringify(part)).toString("base64url")
        : part,
    )
    .join(".");
  return {
    access_token: token,
    refresh_token: "synthetic-refresh-token-not-a-real-credential",
    expires_in: 3600,
    expires_at: exp,
    token_type: "bearer",
    user,
  };
}
export interface MockOptions {
  signedIn?: boolean;
  allowed?: boolean;
  missingRpc?: boolean;
  rpcOffline?: boolean;
  invalidUser?: boolean;
  expiredRefresh?: boolean;
  dataError?: boolean;
  productCount?: number;
  invalidLogin?: boolean;
  loginDelay?: number;
}
export async function mockSupabase(page: Page, initial: MockOptions = {}) {
  const state = { allowed: true, productCount: 0, ...initial };
  const requests: {
    path: string;
    method: string;
    authorization: string | null;
  }[] = [];
  if (initial.signedIn)
    await page.addInitScript(
      ({ key, value }) => {
        if (!sessionStorage.getItem("farm-test-session-seeded")) {
          sessionStorage.setItem(key, JSON.stringify(value));
          sessionStorage.setItem("farm-test-session-seeded", "yes");
        }
      },
      { key: SESSION_KEY, value: session(initial.expiredRefresh) },
    );
  await page.route(`${TEST_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    requests.push({
      path: url.pathname + url.search,
      method,
      authorization: request.headers().authorization ?? null,
    });
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-headers":
        "authorization,apikey,content-type,x-client-info,prefer,range",
      "access-control-expose-headers": "content-range",
    };
    const json = (
      status: number,
      body: unknown,
      extra: Record<string, string> = {},
    ) =>
      route.fulfill({
        status,
        headers: { ...headers, "content-type": "application/json", ...extra },
        body: JSON.stringify(body),
      });
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (url.pathname === "/auth/v1/token") {
      if (state.loginDelay)
        await new Promise((resolve) => setTimeout(resolve, state.loginDelay));
      if (
        state.expiredRefresh &&
        url.searchParams.get("grant_type") === "refresh_token"
      )
        return json(400, {
          error_code: "refresh_token_not_found",
          msg: "synthetic private backend detail",
        });
      if (state.invalidLogin)
        return json(400, {
          error_code: "invalid_credentials",
          msg: "synthetic private backend detail",
        });
      return json(200, session());
    }
    if (url.pathname === "/auth/v1/user")
      return state.invalidUser
        ? json(401, {
            code: "bad_jwt",
            message: "synthetic private backend detail",
          })
        : json(200, user);
    if (url.pathname === "/auth/v1/logout")
      return route.fulfill({ status: 204, headers });
    if (url.pathname === "/rest/v1/rpc/current_user_is_admin") {
      if (state.missingRpc)
        return json(404, {
          code: "PGRST202",
          message: "synthetic private backend detail",
        });
      if (state.rpcOffline)
        return json(503, { message: "synthetic private backend detail" });
      return json(200, state.allowed);
    }
    if (url.pathname === "/rest/v1/products") {
      if (state.dataError)
        return json(503, { message: "synthetic private backend detail" });
      const count = state.productCount ?? 0;
      if (method === "HEAD") {
        const filter = url.searchParams.get("is_published");
        const filtered =
          filter === "eq.true"
            ? Math.ceil(count / 2)
            : filter === "eq.false"
              ? Math.floor(count / 2)
              : count;
        return route.fulfill({
          status: 200,
          headers: { ...headers, "content-range": `*/${filtered}` },
        });
      }
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const limit = Number(url.searchParams.get("limit") ?? 10);
      const rows = Array.from({ length: count }, (_, i) => ({
        id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
        slug: `test-product-${i + 1}`,
        name: `منتج اختبار ${i + 1}`,
        price_eur: 29.9,
        category_id: "10000000-0000-4000-8000-000000000001",
        is_available: i % 2 === 0,
        is_published: i % 2 === 0,
        is_featured: false,
        is_sample: false,
        created_at: "2026-01-01T00:00:00Z",
      })).slice(offset, offset + limit);
      return json(200, rows, {
        "content-range": rows.length
          ? `${offset}-${offset + rows.length - 1}/${count}`
          : `*/${count}`,
      });
    }
    if (url.pathname === "/rest/v1/categories") {
      if (method === "HEAD")
        return route.fulfill({
          status: 200,
          headers: { ...headers, "content-range": "*/4" },
        });
      return json(200, [
        { id: "10000000-0000-4000-8000-000000000001", name: "قسم الاختبار" },
      ]);
    }
    return json(404, { message: "Unmocked test endpoint" });
  });
  return {
    state,
    requests,
    productReads: () =>
      requests.filter((r) => r.path.startsWith("/rest/v1/products")),
  };
}
