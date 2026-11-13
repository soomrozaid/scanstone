/**
 * Usability timing + click counts for common visitor tasks.
 * Usage: node usability.mjs --base http://localhost:3100 --label it100
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../overhaul");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1] ?? "true"]);
    return acc;
  }, []),
);

const BASE = args.base ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";
const LABEL = args.label ?? "run";
const OUT_DIR = path.join(ROOT, "usability");

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

async function installClickCounter(page) {
  await page.addInitScript(() => {
    window.__scanstoneClicks = 0;
    document.addEventListener(
      "click",
      () => {
        window.__scanstoneClicks = (window.__scanstoneClicks || 0) + 1;
      },
      true,
    );
  });
}

async function timeTask(page, name, fn) {
  await installClickCounter(page);
  const started = Date.now();
  let ok = true;
  let error = "";
  let clicks = 0;
  try {
    await fn(page);
    clicks = await page.evaluate(() => window.__scanstoneClicks || 0);
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
    try {
      clicks = await page.evaluate(() => window.__scanstoneClicks || 0);
    } catch {
      clicks = -1;
    }
  }
  return {
    task: name,
    ms: Date.now() - started,
    clicks,
    ok,
    error: error.slice(0, 240),
  };
}

async function gotoHome(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.locator("#main, main, h1").first().waitFor({ state: "visible", timeout: 15000 });
}

async function dismissIfNeeded(page) {
  // Cookie or other intercepts should not exist, but never let one block a task.
  const btn = page.getByRole("button", { name: /accept|agree|close/i });
  if (await btn.first().isVisible().catch(() => false)) {
    await btn.first().click();
  }
}

async function openMobileNavIfNeeded(page, isMobile) {
  if (!isMobile) return 0;
  const menu = page.getByRole("button", { name: /open menu/i });
  if (await menu.isVisible().catch(() => false)) {
    await menu.click();
    return 1;
  }
  return 0;
}

async function makeQr(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  const homeTool = page.getByTestId("home-tool");
  if (await homeTool.isVisible().catch(() => false)) {
    const qrTab = page.getByRole("tab", { name: /QR code/i });
    if (await qrTab.isVisible().catch(() => false)) {
      if ((await qrTab.getAttribute("aria-selected")) !== "true") {
        await qrTab.click();
      }
    }
    const input = homeTool.getByLabel(/destination link/i);
    await input.fill("example.com/menu");
    // Instant preview or an explicit create button.
    const create = homeTool.getByRole("button", { name: /create qr/i });
    if (await create.isVisible().catch(() => false)) {
      const preview = homeTool.locator("svg[role='img'][aria-label='QR code']");
      if (!(await preview.isVisible().catch(() => false))) {
        await create.click();
      }
    }
    await homeTool.locator("svg[role='img'][aria-label='QR code']").first().waitFor({ state: "visible", timeout: 8000 });
    return;
  }
  // it100 path: leave the homepage and use the free generator.
  await openMobileNavIfNeeded(page, isMobile);
  const link = page.getByRole("link", { name: /free generator|create qr|qr code generator/i }).first();
  await link.click();
  await page.waitForURL(/qr-code-generator/);
  await page.getByLabel("Destination link").fill("example.com/menu");
  await page.locator("svg[role='img'][aria-label='QR code']").first().waitFor({ state: "visible", timeout: 8000 });
}

async function makeShortLink(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  const homeTool = page.getByTestId("home-tool");
  if (await homeTool.isVisible().catch(() => false)) {
    const tab = page.getByRole("tab", { name: /short link/i });
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
    }
    await homeTool.getByLabel(/destination link/i).fill("example.com/your-long-link");
    const create = homeTool.getByRole("button", { name: /create short link/i });
    if (await create.isVisible().catch(() => false)) await create.click();
    // Success is: signup prompt, or a created short link, or a validation message.
    const success = homeTool.getByText(/save this as a short link|create a free account|scst\.one|short link needs/i).first();
    const created = page.getByText(/scst\.one\//i).first();
    await Promise.race([
      success.waitFor({ state: "visible", timeout: 8000 }),
      created.waitFor({ state: "visible", timeout: 8000 }),
    ]);
    return;
  }
  await openMobileNavIfNeeded(page, isMobile);
  await page.getByRole("link", { name: /short links?/i }).first().click();
  const create = page.getByRole("link", { name: /create a short link/i }).first();
  if (await create.isVisible().catch(() => false)) {
    await create.click();
  }
  // Signed-out visitors land on login or signup.
  await page.waitForURL(/login|signup|dashboard\/shorten|#short-link/, { timeout: 8000 });
}

async function findPricing(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  await openMobileNavIfNeeded(page, isMobile);
  await page.getByRole("link", { name: /^pricing$/i }).first().click();
  await Promise.race([
    page.getByRole("heading", { name: /pricing/i }).first().waitFor({ state: "visible", timeout: 8000 }),
    page.getByText("$9").first().waitFor({ state: "visible", timeout: 8000 }),
  ]);
}

async function findExpire(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  // Prefer a one-click nav/footer answer.
  const direct = page.getByRole("link", { name: /do codes expire|codes expire|never expire|help|faq/i });
  if (isMobile) {
    const open = page.getByRole("button", { name: /open menu/i });
    const visibleDirect = await page.getByRole("link", { name: /do codes expire|codes expire|never expire|help|faq/i }).first().isVisible().catch(() => false);
    if (!visibleDirect && (await open.isVisible().catch(() => false))) {
      await open.click();
    }
  }
  const candidate = page.getByRole("link", { name: /do codes expire|codes expire|never expire|help|faq/i }).first();
  if (await candidate.isVisible().catch(() => false)) {
    await candidate.click();
  } else {
    // it100: scroll to the homepage FAQ and open the expiry question.
    const faq = page.getByText(/Do Scanstone QR codes expire\?/i).first();
    await faq.scrollIntoViewIfNeeded();
    await faq.click();
  }
  const answer = page.getByText(/never expire|do not expire|don't expire|keeps? working|no expiry|no expiration|not expire|cancellation.*not disable|do not disable redirects/i).first();
  await answer.waitFor({ state: "visible", timeout: 8000 });
}

async function findSignup(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  await openMobileNavIfNeeded(page, isMobile);
  const link = page.getByRole("link", { name: /start free|create a free account|sign up|get started/i }).first();
  await link.click();
  await page.waitForURL(/signup/, { timeout: 8000 });
  await page.getByRole("heading", { name: /create|sign up|start|account/i }).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
}

async function findContact(page, isMobile) {
  await gotoHome(page);
  await dismissIfNeeded(page);
  const mail = page.getByRole("link", { name: /hello@scanstone\.ca/i });
  if (isMobile) {
    const visible = await mail.first().isVisible().catch(() => false);
    if (!visible) {
      const open = page.getByRole("button", { name: /open menu/i });
      if (await open.isVisible().catch(() => false)) await open.click();
    }
  }
  if (await mail.first().isVisible().catch(() => false)) {
    // Already findable. Count as success if we can see or reach it.
    await mail.first().scrollIntoViewIfNeeded();
    await mail.first().waitFor({ state: "visible", timeout: 8000 });
    return;
  }
  // Footer path
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("footer").getByRole("link", { name: /hello@scanstone\.ca/i }).waitFor({ state: "visible", timeout: 8000 });
}

const TASKS = [
  ["make_qr", makeQr],
  ["make_short_link", makeShortLink],
  ["find_pricing", findPricing],
  ["find_expire", findExpire],
  ["find_signup", findSignup],
  ["find_contact", findContact],
];

function fmt(row) {
  if (!row.ok) return `${row.ms}ms / ${row.clicks} clicks (FAIL: ${row.error})`;
  return `${row.ms}ms / ${row.clicks} clicks`;
}

async function runViewport(browser, name, viewport) {
  const results = [];
  for (const [task, fn] of TASKS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: !!viewport.isMobile,
      hasTouch: !!viewport.hasTouch,
      deviceScaleFactor: viewport.isMobile ? 2 : 1,
      userAgent: viewport.isMobile
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        : undefined,
    });
    const page = await context.newPage();
    const isMobile = !!viewport.isMobile;
    const row = await timeTask(page, task, (p) => fn(p, isMobile));
    results.push(row);
    await context.close();
  }
  return results;
}

function table(all) {
  const lines = [
    `| Task | Desktop | Mobile |`,
    `|---|---|---|`,
  ];
  const names = TASKS.map(([n]) => n);
  for (const n of names) {
    const d = all.desktop.find((r) => r.task === n);
    const m = all.mobile.find((r) => r.task === n);
    lines.push(`| ${n} | ${fmt(d)} | ${fmt(m)} |`);
  }
  return lines.join("\n");
}

const browser = await chromium.launch({ headless: true });
try {
  const all = {
    label: LABEL,
    base: BASE,
    at: new Date().toISOString(),
    desktop: await runViewport(browser, "desktop", VIEWPORTS.desktop),
    mobile: await runViewport(browser, "mobile", VIEWPORTS.mobile),
  };
  await mkdir(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, `${LABEL}.json`);
  const mdPath = path.join(OUT_DIR, `${LABEL}.md`);
  const md = `# Usability ${LABEL}\n\nBase: ${BASE}\n\n${table(all)}\n`;
  await writeFile(jsonPath, JSON.stringify(all, null, 2));
  await writeFile(mdPath, md);
  console.log(md);
  console.log(`Wrote ${jsonPath}`);
} finally {
  await browser.close();
}
