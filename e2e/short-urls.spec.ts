import { test, expect } from "@playwright/test";
import {
  adminClient,
  createConfirmedUser,
  deleteUser,
  type TestUser,
} from "./helpers";
import { generateSlug } from "../src/lib/slug";

test.describe("short URLs", () => {
  let user: TestUser;

  test.beforeEach(async ({ page }) => {
    user = await createConfirmedUser("short-links");
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("**/dashboard");
  });

  test.afterEach(async () => {
    if (user) await deleteUser(user.id);
  });

  test("create → copy → redirect → edit → delete @mobile", async ({
    page,
    request,
    context,
    browserName,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.getByRole("link", { name: /New short URL/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/shorten$/);
    await expect(page).toHaveTitle(/New short URL/);
    await expect(
      page.getByRole("heading", { name: "New short URL" }),
    ).toBeVisible();
    await page
      .getByLabel("Destination URL")
      .fill("example.com/campaign?source=email#offer");
    await page.getByRole("button", { name: "Create short URL" }).click();
    await page.waitForURL("**/dashboard/codes/**");
    await expect(page.getByText("Your short URL is ready.")).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
      "example.com",
    );

    const shortUrl = (await page.getByTestId("short-url").innerText()).trim();
    const shortAddress = new URL(shortUrl);
    const path = shortAddress.pathname;
    const isLocal = ["localhost", "127.0.0.1"].includes(
      new URL(baseURL!).hostname,
    );
    const redirectTarget = isLocal ? path : shortUrl;
    const redirectOptions = {
      maxRedirects: 0,
      // Deployed tests use the real URL so TLS and Host agree at Vercel's edge.
      ...(isLocal ? { headers: { host: shortAddress.host } } : {}),
    };
    expect(path).toMatch(/^\/(?:r\/)?[23456789abcdefghjkmnpqrstuvwxyz]{8}$/);
    if (process.env.SHORT_URL_ORIGIN) {
      expect(shortAddress.origin).toBe(
        new URL(process.env.SHORT_URL_ORIGIN).origin,
      );
      expect(path).not.toContain("/r/");
    }
    const detailUrl = page.url();
    const id = new URL(detailUrl).pathname.split("/").pop()!;

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.getByRole("button", { name: "Copy short URL" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        shortUrl,
      );
    }

    const response = await request.get(redirectTarget, redirectOptions);
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(
      "https://example.com/campaign?source=email#offer",
    );
    expect(response.headers()["cache-control"]).toBe("no-store");
    await expect
      .poll(async () => {
        const { data } = await adminClient()
          .from("qr_codes")
          .select("scan_count")
          .eq("id", id)
          .single();
        return data?.scan_count ?? 0;
      })
      .toBeGreaterThan(0);

    await page
      .getByLabel("Destination URL")
      .fill("https://example.com/updated");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Saved\./)).toBeVisible();
    expect(
      (await request.get(redirectTarget, redirectOptions)).headers().location,
    ).toBe("https://example.com/updated");
    await expect(page.getByTestId("short-url")).toHaveText(shortUrl);

    await page.goto("/dashboard");
    await expect(page.getByText("1 of 3 codes and short URLs")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "example.com", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy short URL" }),
    ).toBeVisible();
    await page.goto(detailUrl);

    // A denied clipboard still leaves the full URL available for manual copying.
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error("Permission denied")),
        },
      }),
    );
    await page.getByRole("button", { name: "Copy short URL" }).click();
    await expect(page.getByRole("status")).toContainText("copy it manually");
    await expect(page.getByTestId("short-url")).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/scanstone-short-url-${browserName}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);

    await page.getByRole("button", { name: "Delete code & link" }).click();
    await page.getByRole("button", { name: "Yes, delete forever" }).click();
    await page.waitForURL("**/dashboard");
    expect(
      (await request.get(redirectTarget, redirectOptions)).headers().location,
    ).toContain("missing-code=1");
  });

  test("rejects unsafe URLs and shares the QR code limit", async ({
    page,
    request,
  }) => {
    await page.goto("/dashboard/shorten");
    for (const destination of [
      "javascript:alert(1)",
      "http://127.0.0.1/admin",
      "not a url",
    ]) {
      await page.getByLabel("Destination URL").fill(destination);
      await page.getByRole("button", { name: "Create short URL" }).click();
      await expect(page.locator("form").getByRole("alert")).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/shorten$/);
    }

    const { error } = await adminClient()
      .from("qr_codes")
      .insert(
        Array.from({ length: 3 }, () => ({
          user_id: user.id,
          slug: generateSlug(),
          name: "Existing QR code",
          destination_url: "https://example.com/existing",
        })),
      );
    expect(error).toBeNull();
    await page
      .getByLabel("Destination URL")
      .fill("https://example.com/over-limit");
    await page.getByRole("button", { name: "Create short URL" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "used all 3 free codes and short URLs",
    );
    const { data } = await adminClient()
      .from("qr_codes")
      .select("slug")
      .eq("user_id", user.id);
    expect(data).toHaveLength(3);
    expect(
      (await request.get(`/r/${data![0]!.slug}`, { maxRedirects: 0 })).headers()
        .location,
    ).toBe("https://example.com/existing");
  });
});

test("short URL creation requires login", async ({ page }) => {
  await page.goto("/dashboard/shorten");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fshorten/);
});
