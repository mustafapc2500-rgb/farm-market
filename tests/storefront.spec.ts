import { test, expect } from "@playwright/test";
import { whatsappUrl } from "../src/lib/whatsapp";
test("WhatsApp validation and product message", () => {
  expect(whatsappUrl("")).toBeNull();
  expect(whatsappUrl("+not-a-number")).toBeNull();
  expect(whatsappUrl("00123456789")).toBeNull();
  const url = whatsappUrl("491234567890", "حديقة تجريبية");
  expect(url).not.toBeNull();
  expect(new URL(url!).searchParams.get("text")).toContain("حديقة تجريبية");
});
test("homepage navigation, RTL, original art, and mobile menu", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "لمزرعتك حكاية",
  );
  const headingBox = await page.locator("h1").boundingBox();
  expect(headingBox!.x).toBeGreaterThanOrEqual(0);
  expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await expect(page.locator(".hero-art")).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(4);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "فتح القائمة" }).click();
    await page
      .locator("#mobile-nav")
      .getByRole("link", { name: "المنتجات", exact: true })
      .click();
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  } else {
    await page
      .locator(".desktop-nav")
      .getByRole("link", { name: "المنتجات", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/products/);
  expect(errors).toEqual([]);
});
test("catalog filtering, Arabic search, price sorting, and URL restoration", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page
    .getByRole("button", { name: "تصاميم وديكورات", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await expect(page).toHaveURL(/category=decoration/);
  await page.getByLabel("ترتيب المنتجات").selectOption("low");
  await expect(page.locator(".product-card h3").first()).toHaveText(
    "ركن الحديقة الحالمة",
  );
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page.getByLabel("ابحث عن خدمة").fill("غير موجود إطلاقا");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "لم نعثر على هذه الفكرة بعد" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "عرض جميع الخدمات" }).click();
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.getByLabel("ابحث عن خدمة").fill("إلهام");
  await expect(page.locator(".product-card")).toHaveCount(1);
});
test("details, gallery, inquiry configuration, unavailable product and 404", async ({
  page,
}) => {
  await page.goto("/products/cozy-farm");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "تصميم مزرعة ريفية دافئة",
  );
  await page
    .getByRole("button", { name: "تكبير تفاصيل الرسم التوضيحي" })
    .click();
  await expect(page.locator(".details-image")).toHaveClass(/zoomed-art/);
  await page
    .locator(".details-copy")
    .getByRole("button", { name: "استفسر عبر واتساب" })
    .click();
  await expect(page.locator(".details-copy [role=status]")).toContainText(
    "يلزم إعداد رقم واتساب",
  );
  await page.goto("/products/sunset-estate");
  await expect(page.locator(".unavailable-box")).toBeVisible();
  await expect(
    page
      .locator(".details-copy")
      .getByRole("button", { name: "استفسر عبر واتساب" }),
  ).toHaveCount(0);
  await page.goto("/products/no-such-product");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "هذه البذرة لم تنبت هنا بعد",
  );
});
test("all pages fit viewport and rendered fonts load", async ({
  page,
}, testInfo) => {
  for (const path of [
    "/",
    "/products",
    "/products/cozy-farm",
    "/about",
    "/contact",
    "/legal/privacy",
  ]) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow at ${path}`,
    ).toBeTruthy();
  }
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `test-results/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("small phone and tablet layouts contain content and notices", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport matrix runs once");
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const outside = await page.locator(".hero h1").evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return Array.from(range.getClientRects())
        .filter((r) => r.width > 0)
        .some((r) => r.x < 0 || r.right > innerWidth);
    });
    expect(outside, `heading clipped at ${width}`).toBeFalsy();
    await page.goto("/products");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page
      .locator(".product-card")
      .first()
      .getByRole("button", { name: "استفسر", exact: true })
      .click();
    await expect(
      page.locator(".product-card").first().getByRole("status"),
    ).toBeVisible();
  }
});
