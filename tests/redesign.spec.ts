import { test, expect } from "@playwright/test";

test("original artwork loads and every service has a distinct scene", async ({
  page,
}) => {
  const failedRequests: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(response.url());
  });
  await page.goto("/");
  await expect(page.locator(".hero-art")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator<HTMLImageElement>(".hero-art")
        .evaluate((image) => image.complete && image.naturalWidth === 1536),
    )
    .toBeTruthy();
  await page
    .locator(".hero-inquiry")
    .getByRole("button", { name: "تواصل عبر واتساب" })
    .click();
  await expect(page.locator(".hero-inquiry [role=status]")).toContainText(
    "يلزم إعداد رقم واتساب",
  );
  await page.goto("/products");
  const atlas = await page.request.get("/artwork/service-worlds.webp");
  expect(atlas.ok()).toBeTruthy();
  expect(atlas.headers()["content-type"]).toContain("image/webp");
  const scenePositions = await page
    .locator(".product-visual .scene-art image")
    .evaluateAll((elements) =>
      elements.map((el) => `${el.getAttribute("x")},${el.getAttribute("y")}`),
    );
  expect(new Set(scenePositions).size).toBe(6);
  await expect(page.locator(".product-card .sample-badge")).toHaveCount(6);
  expect(failedRequests).toEqual([]);
});

test("redesigned pages remain readable and respect reduced motion", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/products",
    "/products/cozy-farm",
    "/about",
    "/contact",
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBeTruthy();
    const copy = page
      .locator(".product-body>p, .details-copy>p, .lead")
      .first();
    expect(
      await copy.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(12);
    await page.screenshot({
      path: `test-results/redesign-${route.split("/").filter(Boolean).join("-")}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  }
  await page.goto("/products");
  await expect(page.locator(".product-card").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
});
