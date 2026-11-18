import { describe, expect, it } from "vitest";
import {
  BUILTIN_RESERVED_HOSTS,
  classifyHostname,
  effectiveRequestHost,
  isReservedHostname,
  normalizeHostname,
  validateCustomHostname,
} from "../custom-domain/hostname";
import {
  customHostPathAction,
  decideRedirect,
  FOUND_REDIRECT_HEADERS,
  getCustomUrl,
  pathSlug,
} from "../custom-domain/resolve";
import { readVercelDomainConfig } from "../custom-domain/vercel-config";
import { platformHostsFromEnv } from "../custom-domain/platform";

const APP = "https://www.scanstone.ca";
const SHORT = "https://scst.one";
const appHosts = ["www.scanstone.ca"];
const shortHosts = ["scst.one"];
const hostOpts = { appHosts, shortHosts };

const aliceCode = {
  id: "11111111-1111-1111-1111-111111111111",
  destination_url: "https://example.com/domain-test?campaign=short#details",
  user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
};
const bobCode = {
  id: "22222222-2222-2222-2222-222222222222",
  destination_url: "https://bob.example/secret",
  user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
};

describe("normalizeHostname", () => {
  it("lowercases, strips port and trailing dot", () => {
    expect(normalizeHostname("QR.TheIrCafe.COM:443.")).toBe("qr.theircafe.com");
  });
  it("rejects empty, credentials, paths, and non-loopback IPs", () => {
    expect(normalizeHostname("")).toBeNull();
    expect(normalizeHostname("user:pass@evil.com")).toBeNull();
    expect(normalizeHostname("qr.theircafe.com/slug")).toBeNull();
    expect(normalizeHostname("10.1.2.3:80")).toBeNull();
    // Loopback is kept so local tests can honor a Host header against 127.0.0.1.
    expect(normalizeHostname("127.0.0.1")).toBe("127.0.0.1");
    expect(normalizeHostname("[::1]")).toBe("::1");
    expect(validateCustomHostname("127.0.0.1", hostOpts).ok).toBe(false);
  });
  it("accepts a normal subdomain and an apex", () => {
    expect(normalizeHostname("qr.theircafe.com")).toBe("qr.theircafe.com");
    expect(normalizeHostname("theircafe.com")).toBe("theircafe.com");
  });
});

describe("reserved and classified hosts", () => {
  it("reserves Scanstone and Vercel hosts, including subdomains", () => {
    for (const host of BUILTIN_RESERVED_HOSTS) {
      expect(isReservedHostname(host)).toBe(true);
    }
    expect(
      isReservedHostname(
        "scanstone-git-nori-overhaul-zaid-soomros-projects.vercel.app",
      ),
    ).toBe(true);
    expect(isReservedHostname("evil.scanstone.ca")).toBe(true);
    expect(isReservedHostname("evil.scst.one")).toBe(true);
    expect(isReservedHostname("qr.theircafe.com")).toBe(false);
  });

  it("classifies app, short, preview, and customer hosts", () => {
    expect(classifyHostname("www.scanstone.ca", hostOpts)).toBe("platform");
    expect(classifyHostname("scanstone.ca", hostOpts)).toBe("platform");
    expect(classifyHostname("scst.one", hostOpts)).toBe("short");
    expect(classifyHostname("scanstone.vercel.app", hostOpts)).toBe("platform");
    expect(
      classifyHostname(
        "scanstone-git-nori-custom-domains-foo.vercel.app",
        hostOpts,
      ),
    ).toBe("platform");
    expect(classifyHostname("localhost", hostOpts)).toBe("platform");
    expect(classifyHostname("qr.theircafe.com", hostOpts)).toBe(
      "custom-candidate",
    );
  });

  it("rejects reserved names when adding a domain", () => {
    expect(validateCustomHostname("www.scanstone.ca", hostOpts).ok).toBe(false);
    expect(validateCustomHostname("scst.one", hostOpts).ok).toBe(false);
    expect(validateCustomHostname("foo.vercel.app", hostOpts).ok).toBe(false);
    expect(
      validateCustomHostname("https://qr.theircafe.com", hostOpts).ok,
    ).toBe(false);
    expect(validateCustomHostname("qr.theircafe.com", hostOpts)).toEqual({
      ok: true,
      hostname: "qr.theircafe.com",
    });
  });
});

describe("effectiveRequestHost spoofing rules", () => {
  it("lets the connection host win on production platform hosts", () => {
    const result = effectiveRequestHost({
      urlHostname: "www.scanstone.ca",
      headerHost: "qr.theircafe.com",
      forwardedHost: "qr.theircafe.com",
      ...hostOpts,
    });
    expect(result).toEqual({ kind: "platform", hostname: "www.scanstone.ca" });
  });

  it("does not let a spoofed Host steal scst.one tenancy", () => {
    const result = effectiveRequestHost({
      urlHostname: "scst.one",
      headerHost: "qr.theircafe.com",
      forwardedHost: "qr.theircafe.com",
      ...hostOpts,
    });
    expect(result).toEqual({ kind: "short", hostname: "scst.one" });
  });

  it("does not let a spoofed Host on a preview deployment become a custom domain", () => {
    const result = effectiveRequestHost({
      urlHostname: "scanstone-git-nori-custom-domains-foo.vercel.app",
      headerHost: "qr.theircafe.com",
      ...hostOpts,
    });
    expect(result.kind).toBe("platform");
    expect(result.hostname).toBe(
      "scanstone-git-nori-custom-domains-foo.vercel.app",
    );
  });

  it("honors Host against localhost so existing short-domain tests still work", () => {
    const result = effectiveRequestHost({
      urlHostname: "localhost",
      headerHost: "scst.one:443",
      ...hostOpts,
    });
    expect(result).toEqual({ kind: "short", hostname: "scst.one" });
  });

  it("honors a custom Host against localhost for local and e2e checks", () => {
    const result = effectiveRequestHost({
      urlHostname: "127.0.0.1",
      headerHost: "qr.theircafe.com",
      ...hostOpts,
    });
    expect(result).toEqual({
      kind: "custom-candidate",
      hostname: "qr.theircafe.com",
    });
  });

  it("uses the connection host when a custom domain is actually routed", () => {
    const result = effectiveRequestHost({
      urlHostname: "qr.theircafe.com",
      headerHost: "www.scanstone.ca",
      ...hostOpts,
    });
    expect(result).toEqual({
      kind: "custom-candidate",
      hostname: "qr.theircafe.com",
    });
  });
});

describe("scst.one and scanstone.ca redirect contract (unchanged)", () => {
  const appUrl = APP;

  it("302s a known slug on the short host with the historical headers", () => {
    const decision = decideRedirect({
      slug: "abcdefgh",
      hostKind: "short",
      code: aliceCode,
      appUrl,
    });
    expect(decision).toEqual({
      type: "found",
      status: 302,
      location: aliceCode.destination_url,
      headers: FOUND_REDIRECT_HEADERS,
      codeId: aliceCode.id,
      recordScan: true,
    });
  });

  it("302s a known slug on the app host the same way, including /r/ paths", () => {
    const decision = decideRedirect({
      slug: "abcdefgh",
      hostKind: "platform",
      code: aliceCode,
      appUrl,
    });
    expect(decision).toEqual({
      type: "found",
      status: 302,
      location: aliceCode.destination_url,
      headers: {
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
      },
      codeId: aliceCode.id,
      recordScan: true,
    });
  });

  it("uses the missing-code fallback for an unknown slug on the short host", () => {
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "short",
        code: null,
        appUrl,
      }),
    ).toEqual({
      type: "missing-code",
      status: 302,
      location: `${APP}/?missing-code=1`,
    });
  });

  it("uses the missing-code fallback for an unknown slug on the app host", () => {
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "platform",
        code: null,
        appUrl,
      }),
    ).toEqual({
      type: "missing-code",
      status: 302,
      location: `${APP}/?missing-code=1`,
    });
  });

  it("uses the missing-code fallback for an invalid slug on platform and short hosts", () => {
    for (const hostKind of ["platform", "short"] as const) {
      expect(
        decideRedirect({
          slug: "NOPE",
          hostKind,
          code: aliceCode,
          appUrl,
        }),
      ).toEqual({
        type: "missing-code",
        status: 302,
        location: `${APP}/?missing-code=1`,
      });
    }
  });

  it("builds a custom URL without changing the scst.one helper", () => {
    expect(getCustomUrl("qr.theircafe.com", "abcdefgh")).toBe(
      "https://qr.theircafe.com/abcdefgh",
    );
  });
});

describe("custom host redirect isolation", () => {
  const appUrl = APP;

  it("resolves only the domain owner's slug", () => {
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "custom",
        domainOwnerId: aliceCode.user_id,
        code: aliceCode,
        appUrl,
      }),
    ).toMatchObject({
      type: "found",
      status: 302,
      location: aliceCode.destination_url,
      codeId: aliceCode.id,
    });
  });

  it("404s another user's slug even if the row was somehow returned", () => {
    expect(
      decideRedirect({
        slug: "bbbbbbbb",
        hostKind: "custom",
        domainOwnerId: aliceCode.user_id,
        code: bobCode,
        appUrl,
      }),
    ).toEqual({ type: "not-found", status: 404 });
  });

  it("404s a missing or invalid slug instead of the missing-code fallback", () => {
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "custom",
        domainOwnerId: aliceCode.user_id,
        code: null,
        appUrl,
      }),
    ).toEqual({ type: "not-found", status: 404 });
    expect(
      decideRedirect({
        slug: "NOPE",
        hostKind: "custom",
        domainOwnerId: aliceCode.user_id,
        code: aliceCode,
        appUrl,
      }),
    ).toEqual({ type: "not-found", status: 404 });
  });

  it("404s an unknown host and a custom candidate with no owner", () => {
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "unknown",
        code: aliceCode,
        appUrl,
      }),
    ).toEqual({ type: "not-found", status: 404 });
    expect(
      decideRedirect({
        slug: "abcdefgh",
        hostKind: "custom",
        domainOwnerId: null,
        code: aliceCode,
        appUrl,
      }),
    ).toEqual({ type: "not-found", status: 404 });
  });

  it("does not plan-gate a found redirect (covenant on custom hosts too)", () => {
    const decision = decideRedirect({
      slug: "abcdefgh",
      hostKind: "custom",
      domainOwnerId: aliceCode.user_id,
      code: aliceCode,
      appUrl,
    });
    expect(decision.type).toBe("found");
    expect(decision).not.toHaveProperty("plan");
  });
});

describe("custom host path surface", () => {
  it("rewrites a bare slug and /r/slug, and 404s everything else", () => {
    expect(customHostPathAction("/abcdefgh")).toEqual({
      action: "rewrite",
      slug: "abcdefgh",
    });
    expect(customHostPathAction("/r/abcdefgh")).toEqual({
      action: "rewrite",
      slug: "abcdefgh",
    });
    expect(customHostPathAction("/")).toEqual({ action: "not-found" });
    expect(customHostPathAction("/login")).toEqual({ action: "not-found" });
    expect(customHostPathAction("/dashboard")).toEqual({ action: "not-found" });
    expect(customHostPathAction("/account")).toEqual({ action: "not-found" });
    expect(customHostPathAction("/api/stripe/checkout")).toEqual({
      action: "not-found",
    });
    // "terms" is a valid slug (scst.one/terms already works that way).
    expect(customHostPathAction("/terms")).toEqual({
      action: "rewrite",
      slug: "terms",
    });
    expect(customHostPathAction("/privacy")).toEqual({ action: "not-found" });
    expect(customHostPathAction("/pricing")).toEqual({ action: "not-found" });
    expect(pathSlug("/abcdefgh")).toBe("abcdefgh");
    expect(pathSlug("/login")).toBeNull();
  });
});

describe("vercel config and platform env", () => {
  it("is absent when the token or ids are missing, so Preview can still build", () => {
    expect(
      readVercelDomainConfig({
        VERCEL_PROJECT_ID: "prj_4zPRiH7xPQI8GuTgIRBA5351tjOa",
        VERCEL_TEAM_ID: "team_lTtmiqDpNFcr3CG3joB1qQD1",
      }),
    ).toBeNull();
    expect(
      readVercelDomainConfig({
        VERCEL_API_TOKEN: "tok",
        VERCEL_PROJECT_ID: "prj_4zPRiH7xPQI8GuTgIRBA5351tjOa",
        VERCEL_TEAM_ID: "team_lTtmiqDpNFcr3CG3joB1qQD1",
      }),
    ).toEqual({
      token: "tok",
      projectId: "prj_4zPRiH7xPQI8GuTgIRBA5351tjOa",
      teamId: "team_lTtmiqDpNFcr3CG3joB1qQD1",
    });
  });

  it("accepts VERCEL_ORG_ID as the team id fallback", () => {
    expect(
      readVercelDomainConfig({
        VERCEL_API_TOKEN: "tok",
        VERCEL_PROJECT_ID: "prj_x",
        VERCEL_ORG_ID: "team_y",
      })?.teamId,
    ).toBe("team_y");
  });

  it("reads app and short hosts from env the same way next.config does", () => {
    expect(
      platformHostsFromEnv({
        APP_URL: APP,
        SHORT_URL_ORIGIN: SHORT,
      }),
    ).toEqual({
      appHosts: ["www.scanstone.ca"],
      shortHosts: ["scst.one"],
    });
  });
});
