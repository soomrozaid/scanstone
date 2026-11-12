import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

// Vercel Analytics 404s locally (no /_vercel/insights); ignore benign noise.
function realErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      !e.includes("_vercel/insights") &&
      !e.includes("Failed to load resource") &&
      !e.includes("Download the React DevTools"),
  );
}

test("landing page communicates the value proposition @smoke", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/Cancelling never stops your redirects/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Start free/i }).first(),
  ).toBeVisible();
  // hero visual mounts (canvas or fallback)
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await page.waitForTimeout(1500);
  expect(realErrors(errors)).toEqual([]);
});

test("landing renders FAQ structured data @smoke", async ({ page }) => {
  await page.goto("/");
  const jsonLd = await page
    .locator('main script[type="application/ld+json"]')
    .textContent();
  expect(jsonLd).toContain("FAQPage");
});

test("free generator produces a QR and downloads PNG @smoke", async ({
  page,
}) => {
  await page.goto("/qr-code-generator");
  await expect(
    page.getByRole("heading", { name: /Free QR code generator/i }),
  ).toBeVisible();
  await page.getByLabel("Destination link").fill("https://example.com/menu");
  // preview should render an SVG QR
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("scanstone-qr.png");
});

test("wifi generator encodes without sending password anywhere @smoke", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") requests.push(r.url());
  });
  await page.goto("/wifi-qr-code-generator");
  await page.getByLabel(/Network name/).fill("CafeGuest");
  await page.getByLabel("Password", { exact: true }).fill("supersecret");
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  expect(requests).toEqual([]);
});

test("pricing page states the covenant @smoke", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  await expect(page.getByText(/never stops working/i).first()).toBeVisible();
  await expect(page.getByText("$9").first()).toBeVisible();
});

test("demo page shows live analytics @smoke", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: /This is a real code/i }),
  ).toBeVisible();
  await expect(page.getByText(/scans all-time/i)).toBeVisible();
});

test("legal pages exist @smoke", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();
  await page.goto("/terms");
  await expect(
    page.getByRole("heading", { name: "Terms of Service" }),
  ).toBeVisible();
  await expect(page.getByText(/redirect covenant/i).first()).toBeVisible();
});

test("seo plumbing responds @smoke", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("qr-code-generator");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("sitemap");
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("landing is usable on mobile @mobile @smoke", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  // no horizontal overflow
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("link", { name: /Start free/i }).first(),
  ).toBeVisible();
  await page.waitForTimeout(1200);
  expect(realErrors(errors)).toEqual([]);
});

test("free tool is usable on mobile @mobile", async ({ page }) => {
  await page.goto("/qr-code-generator");
  await page.getByLabel("Destination link").fill("https://example.com");
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("reduced motion falls back gracefully", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await context.close();
});

test("keyboard navigation reaches primary CTA", async ({ page }) => {
  await page.goto("/");
  // Tab through header links to the CTA
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      () => document.activeElement?.textContent ?? "",
    );
    if (/Start free/.test(focused)) return;
  }
  throw new Error("CTA not reachable by keyboard");
});

test("menu preview changes the example without changing the QR @mobile @smoke", async ({
  page,
}) => {
  await page.goto("/");
  const preview = page.getByTestId("hero-visual");
  const qr = preview.locator("svg[role='img'][aria-label='QR code']").first();
  const before = await qr.innerHTML();
  await preview.getByRole("radio", { name: "Weekend brunch" }).click();
  await expect(
    preview.getByRole("radio", { name: "Weekend brunch" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    preview.getByText("scst.one/table04 → yourcafe.ca/brunch"),
  ).toBeVisible();
  expect(await qr.innerHTML()).toBe(before);
  await page.getByRole("link", { name: /Start free, 3 codes/ }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(
    page.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();
});

test("restaurant page is discoverable and offers a working free tool @mobile @smoke", async ({
  page,
  request,
}) => {
  await page.goto("/restaurant-menu-qr-code");
  await expect(page).toHaveTitle(/Restaurant Menu QR Codes/);
  await expect(page.locator("h1")).toHaveText(
    "Change the menu.Keep the QR code.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/restaurant-menu-qr-code$/,
  );
  const data = JSON.parse(
    await page.locator('main script[type="application/ld+json"]').innerText(),
  );
  const faq = data.find(
    (item: Record<string, unknown>) => item["@type"] === "FAQPage",
  );
  for (const question of faq.mainEntity) {
    await expect(page.getByText(question.name, { exact: true })).toBeVisible();
    await expect(
      page.getByText(question.acceptedAnswer.text, { exact: true }),
    ).toBeVisible();
  }
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/restaurant-menu-qr-code",
  );
  expect(await (await request.get("/llms.txt")).text()).toContain(
    "/restaurant-menu-qr-code",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page
    .getByRole("link", { name: "Use a static code", exact: true })
    .click();
  await page.getByLabel("Destination link").fill("https://example.com/menu");
  await expect(
    page.getByRole("button", { name: "PNG", exact: true }),
  ).toBeEnabled();
});
