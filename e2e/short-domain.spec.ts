import { test, expect } from "@playwright/test";
import {
  adminClient,
  createConfirmedUser,
  deleteUser,
  type TestUser,
} from "./helpers";
import { generateSlug } from "../src/lib/slug";

test.describe("dedicated short domain", () => {
  test.skip(
    !process.env.SHORT_URL_ORIGIN,
    "Set SHORT_URL_ORIGIN on the app and test runner.",
  );
  let user: TestUser;
  const slug = generateSlug();
  const shortHost = new URL(process.env.SHORT_URL_ORIGIN || "https://scst.one")
    .host;
  const shortRequest = { maxRedirects: 0, headers: { host: shortHost } };

  test.beforeAll(async () => {
    user = await createConfirmedUser("short-domain");
    const { error } = await adminClient().from("qr_codes").insert({
      user_id: user.id,
      name: "Domain routing test",
      slug,
      destination_url: "https://example.com/domain-test?campaign=short#details",
    });
    expect(error).toBeNull();
  });

  test.afterAll(async () => {
    if (user) await deleteUser(user.id);
  });

  test("new short-domain and existing app-domain links resolve identically", async ({
    request,
  }) => {
    for (const [path, options] of [
      [`/${slug}`, shortRequest],
      [`/r/${slug}`, { maxRedirects: 0 }],
    ] as const) {
      const response = await request.get(path, options);
      expect(response.status()).toBe(302);
      expect(response.headers().location).toBe(
        "https://example.com/domain-test?campaign=short#details",
      );
      expect(response.headers()["cache-control"]).toBe("no-store");
    }
    // The bare-slug rewrite is restricted to the dedicated hostname.
    expect((await request.get(`/${slug}`, { maxRedirects: 0 })).status()).toBe(
      404,
    );
    expect(
      (
        await request.get(`/${slug}`, {
          maxRedirects: 0,
          headers: { host: "scstXone" },
        })
      ).status(),
    ).toBe(404);
  });

  test("short-domain root returns to the app and unknown links use the existing fallback", async ({
    request,
  }) => {
    const root = await request.get("/", shortRequest);
    expect(root.status()).toBe(307);
    expect(root.headers().location).toBe(new URL(process.env.APP_URL!).href);
    const missing = await request.get(`/${generateSlug()}`, shortRequest);
    expect(missing.status()).toBe(302);
    expect(missing.headers().location).toBe(
      `${process.env.APP_URL}/?missing-code=1`,
    );
  });

  test("valid slugs take precedence over app pages only on the short domain", async ({
    request,
  }) => {
    expect((await request.get("/terms", shortRequest)).status()).toBe(302);
    expect((await request.get("/terms", { maxRedirects: 0 })).status()).toBe(
      200,
    );
  });
});
