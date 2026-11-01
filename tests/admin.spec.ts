import { test, expect } from "@playwright/test";
import { mockSupabase, SESSION_KEY } from "./admin-mocks";
import { readSupabaseConfiguration } from "../src/lib/supabase-config";

test("public configuration rejects secret keys and unsafe URLs", () => {
  expect(readSupabaseConfiguration().status).toBe("missing");
  for (const key of [
    "sb_secret_do_not_use",
    "eyJhbGciOiJIUzI1NiJ9.service-role.token",
    "",
  ])
    expect(
      readSupabaseConfiguration("https://example.supabase.co", key).status,
    ).toBe("invalid");
  expect(
    readSupabaseConfiguration(
      "https://user:password@example.supabase.co",
      "sb_publishable_test",
    ).status,
  ).toBe("invalid");
  expect(
    readSupabaseConfiguration("http://remote.invalid", "sb_publishable_test")
      .status,
  ).toBe("invalid");
  expect(
    readSupabaseConfiguration("http://127.0.0.1:54321", "sb_publishable_test")
      .status,
  ).toBe("ready");
});

test("unauthenticated admin routes redirect to login without catalog reads", async ({
  page,
}) => {
  const backend = await mockSupabase(page);
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "تسجيل دخول الإدارة",
  );
  expect(backend.productReads()).toHaveLength(0);
  await expect(page.getByRole("link", { name: /إنشاء حساب/ })).toHaveCount(0);
  await page.goto("/admin/not-a-route");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("login shows password toggle, loading, safe errors, and clears password", async ({
  page,
}) => {
  await mockSupabase(page, { invalidLogin: true, loginDelay: 200 });
  await page.goto("/admin/login");
  await page
    .getByLabel("البريد الإلكتروني", { exact: true })
    .fill("admin@example.invalid");
  const password = page.getByLabel("كلمة المرور", { exact: true });
  await password.fill("synthetic-test-password");
  await page.getByRole("button", { name: "إظهار كلمة المرور" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "إخفاء كلمة المرور" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "دخول لوحة الإدارة" }).click();
  await expect(
    page.getByRole("button", { name: /جارٍ تسجيل الدخول/ }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toHaveText(
    "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.",
  );
  await expect(password).toHaveValue("");
  await expect(page.locator("body")).not.toContainText(
    "synthetic private backend detail",
  );
});

test("real Auth flow with mocked responses shows a genuine zero-product state", async ({
  page,
}, testInfo) => {
  const backend = await mockSupabase(page);
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: "تسجيل دخول الإدارة", exact: true }),
  ).toBeVisible();
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>(
      ".admin-login-art img",
    );
    return image?.complete && image.naturalWidth > 0;
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `test-results/admin-login-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByLabel("البريد الإلكتروني", { exact: true })
    .fill("admin@example.invalid");
  await page
    .getByLabel("كلمة المرور", { exact: true })
    .fill("synthetic-test-password");
  await page.getByRole("button", { name: "دخول لوحة الإدارة" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "مساحة جاهزة لأول منتج" }),
  ).toBeVisible();
  expect(backend.requests.some((r) => r.path === "/auth/v1/user")).toBeTruthy();
  expect(
    backend.requests.some(
      (r) => r.path === "/rest/v1/rpc/current_user_is_admin",
    ),
  ).toBeTruthy();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY),
  ).toBeNull();
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY),
  ).not.toBeNull();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "مساحة جاهزة لأول منتج" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/admin-empty-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/products");
  await expect(page.locator(".product-card")).toHaveCount(6);
});

test("authenticated user with forged admin metadata is rejected", async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true, allowed: false });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "هذا الحساب غير مخوّل للإدارة" }),
  ).toBeVisible();
  expect(backend.productReads()).toHaveLength(0);
  await expect(page.locator(".admin-stats")).toHaveCount(0);
  await expect(page.locator(".admin-products-panel")).toHaveCount(0);
});

test("verified administrators see read-only products, accurate counts and real pagination", async ({
  page,
}, testInfo) => {
  const backend = await mockSupabase(page, {
    signedIn: true,
    productCount: 15,
  });
  await page.goto("/admin");
  await expect(page.locator(".admin-stats .admin-stat").first()).toContainText(
    "١٥",
  );
  await expect(page.locator(".admin-stats .admin-stat").nth(1)).toContainText(
    "٨",
  );
  await expect(page.locator(".admin-stats .admin-stat").nth(2)).toContainText(
    "٧",
  );
  await expect(page.locator(".admin-stats .admin-stat").nth(3)).toContainText(
    "٤",
  );
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(10);
  await expect(page.locator(".admin-product-table")).toContainText(
    "قسم الاختبار",
  );
  await expect(page.locator(".admin-product-table")).toContainText("مسودة");
  await expect(page.locator(".admin-product-table")).toContainText("منشور");
  await expect(page.locator(".admin-product-table")).toContainText("29,90");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `test-results/admin-products-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "الصفحة التالية" }).click();
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(5);
  expect(
    backend.requests.some((r) => r.path.includes("offset=10")),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "الصفحة التالية" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "الصفحة السابقة" }).click();
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(10);
  await expect(
    page.getByRole("button", { name: /إضافة منتج|تعديل منتج|حذف منتج/ }),
  ).toHaveCount(0);
});

test("logout removes local session and protects navigation back", async ({
  page,
}) => {
  await mockSupabase(page, { signedIn: true });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "مساحة جاهزة لأول منتج" }),
  ).toBeVisible();
  if (await page.getByRole("button", { name: "فتح قائمة الإدارة" }).isVisible())
    await page.getByRole("button", { name: "فتح قائمة الإدارة" }).click();
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY),
  ).toBeNull();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.locator(".admin-stats")).toHaveCount(0);
});

test("missing admin-status migration fails closed and never loads products", async ({
  page,
}) => {
  const backend = await mockSupabase(page, {
    signedIn: true,
    missingRpc: true,
  });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "تعذر التحقق من صلاحية الوصول" }),
  ).toBeVisible();
  expect(backend.productReads()).toHaveLength(0);
  await expect(page.locator("body")).not.toContainText(
    "synthetic private backend detail",
  );
});

test("revoked administrator loses dashboard access on refresh with the same session", async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true, productCount: 1 });
  await page.goto("/admin");
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(1);
  backend.state.allowed = false;
  await page.getByRole("button", { name: "تحديث البيانات" }).click();
  await expect(
    page.getByRole("heading", { name: "هذا الحساب غير مخوّل للإدارة" }),
  ).toBeVisible();
  await expect(page.locator(".admin-product-table")).toHaveCount(0);
  await expect(page.locator(".admin-stats")).toHaveCount(0);
});

test("focus revalidation hides data during an authorization outage and can recover", async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true, productCount: 1 });
  await page.goto("/admin");
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(1);
  backend.state.rpcOffline = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("heading", { name: "تعذر التحقق من صلاحية الوصول" }),
  ).toBeVisible();
  await expect(page.locator(".admin-product-table")).toHaveCount(0);
  backend.state.rpcOffline = false;
  await page.getByRole("button", { name: "إعادة التحقق" }).click();
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(1);
});

test("expired or server-rejected sessions return to login without data reads", async ({
  page,
}) => {
  const backend = await mockSupabase(page, {
    signedIn: true,
    invalidUser: true,
  });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(backend.productReads()).toHaveLength(0);
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY),
  ).toBeNull();
});

test("failed refresh of an expired session cannot unlock admin routes", async ({
  page,
}) => {
  const backend = await mockSupabase(page, {
    signedIn: true,
    expiredRefresh: true,
  });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(backend.productReads()).toHaveLength(0);
});

test("data errors remain generic and retry without fabricated products", async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true, dataError: true });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "تعذر تحميل البيانات" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    "synthetic private backend detail",
  );
  backend.state.dataError = false;
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(
    page.getByRole("heading", { name: "مساحة جاهزة لأول منتج" }),
  ).toBeVisible();
});

test("admin navigation, modal drawer, and unknown routes remain protected", async ({
  page,
}) => {
  await mockSupabase(page, { signedIn: true });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "مساحة جاهزة لأول منتج" }),
  ).toBeVisible();
  const menu = page.getByRole("button", { name: "فتح قائمة الإدارة" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(
      page.getByRole("dialog", { name: "قائمة الإدارة" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await menu.click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /المنتجات/ })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  } else
    await page
      .locator(".admin-sidebar")
      .getByRole("link", { name: /المنتجات/ })
      .click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("المنتجات");
  await page.goto("/admin/unknown");
  await expect(
    page.getByRole("heading", { name: "صفحة الإدارة غير موجودة" }),
  ).toBeVisible();
});
