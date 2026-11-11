#!/usr/bin/env node
// Read-only marketing brief. No email, publishing, LLM calls, or queue writes.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { accessToken, api } from "../gsc.mjs";
import { SITE } from "../content/lib.mjs";

const PROPERTY = "sc-domain:scanstone.ca";
const DAY = 86400000;
export function reportingWindows(date) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error("Use a valid --date YYYY-MM-DD");
  // Exclude the latest three days, which can be incomplete in Search Console.
  const end = Date.parse(`${date}T00:00:00Z`) - 3 * DAY;
  const iso = (n) => new Date(n).toISOString().slice(0, 10);
  return {
    current: { startDate: iso(end - 27 * DAY), endDate: iso(end) },
    previous: { startDate: iso(end - 55 * DAY), endDate: iso(end - 28 * DAY) },
  };
}
export function campaignUrl(path, source, date) {
  const url = new URL(path, SITE);
  url.search = new URLSearchParams({
    utm_source: source,
    utm_medium: "organic_social",
    utm_campaign: `menu-${date}`,
  }).toString();
  return url.href;
}
const cell = (value) =>
  String(value)
    .replaceAll("|", "\\|")
    .replace(/[\r\n]/g, " ");
const summary = (row) =>
  row
    ? `${row.clicks} clicks / ${row.impressions} impressions / ${(row.ctr * 100).toFixed(1)}% CTR`
    : "No rows returned; this is not proof that no searches occurred.";

export function renderBrief({ date, queue, registry, performance = null }) {
  const windows = reportingWindows(date);
  const priorities = (performance?.queries ?? [])
    .filter((r) => r.impressions >= 10 && r.position >= 5 && r.position <= 30)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
  const pages = performance?.pages ?? [];
  const queued = queue.filter((q) => q.status === "queued");
  return `# Scanstone weekly marketing brief — ${date}

Status: review draft. No messages sent, content published, or ad spend initiated.
Confirmed audience: restaurants and cafés. Marketing budget: organic first ($0–$100/month), excluding owner time. Prioritize menu-change demonstrations, useful search content, and print-shop partnerships.

## Search baseline
${performance ? `Source: Google Search Console, ${PROPERTY}. Current: ${windows.current.startDate}–${windows.current.endDate}; previous: ${windows.previous.startDate}–${windows.previous.endDate}.\n\n- Current: ${summary(performance.current)}\n- Previous: ${summary(performance.previous)}\n- Query rows can omit anonymized searches; page impressions must not be summed as unique search impressions.` : "Search Console was not queried. Run with --live for measured performance; no estimates are substituted."}

| Page | Clicks | Impressions | Average position |
| --- | ---: | ---: | ---: |
${
  pages.length
    ? pages
        .slice(0, 10)
        .map(
          (r) =>
            `| ${cell(r.keys[0])} | ${r.clicks} | ${r.impressions} | ${r.position.toFixed(1)} |`,
        )
        .join("\n")
    : "| No measured page data | — | — | — |"
}

## One search action this week
${priorities.length ? `Review these existing opportunities before adding pages. Match each query to a landing page in Search Console; improve that page if the intent is already covered.\n\n${priorities.map((r) => `- ${cell(r.keys[0])}: ${r.impressions} impressions, ${r.clicks} clicks, average position ${r.position.toFixed(1)}.`).join("\n")}` : "No query meets the report’s working threshold of 10 impressions and average position 5–30. This threshold prioritizes work; it is not a ranking rule. Test the menu landing page with real owners and improve the existing free generator before producing more overlapping articles."}

## One original piece of proof
Record a 30–45 second screen capture: create a menu code, print a sample, change its destination, scan the same sample again. Label test data and example menus. Use only a code and menu you own. Show the result; do not promise customer outcomes or guaranteed uptime.

## Distribution drafts — owner review required
**LinkedIn / Instagram caption**
New menu, same table card. With a dynamic QR code, you can update the destination after printing. Here is a short demo of that workflow. Scanstone includes 3 editable codes or short links free, and cancellation does not disable their redirects.
${campaignUrl("/restaurant-menu-qr-code", "linkedin", date)}

**Short video script**
0–5s: “Your menu link changed. Do you need to reprint every QR code?”
5–20s: Show an owned sample code, then edit its destination in the dashboard.
20–35s: Scan the same printed code and open the new menu.
35–45s: “Use a static code for a stable URL. Use a dynamic code when you need to change destinations or count scans.”
${campaignUrl("/restaurant-menu-qr-code", "instagram", date)}

## Content queue
${registry.length} published article(s); ${queued.length} queued; ${queue.filter((q) => q.status === "candidate").length} candidates.
${queued
  .slice(0, 3)
  .map(
    (q) =>
      `- ${q.title} — ${q.autonomy || "review"}; check sources, existing search intent, and internal links before drafting.`,
  )
  .join("\n")}

## Measurement and next decision
- Vercel: compare landing visits, marketing_cta_clicked (placement/action), marketing_demo_changed, and qr_downloaded. Clicks are intent, not completed signups.
- Activation: measure verified signup → first dynamic code → first real scan → paid upgrade. These account-level cohort metrics are not implemented by this report.
- Review the same small set of buyer questions in Google and AI search monthly; log citations and dates as observations, not a universal GEO score.
- After four weeks, keep the audience/channel producing activated accounts. Sparse data calls for customer conversations, not a claimed winner.

## Review checklist
Confirm the linked page is deployed. Test the QR with two phones. Verify every factual claim against current product behavior. Review social copy and publishing accounts before sending. Do not republish this same draft unchanged every week; replace it with new product proof or a real customer question.
`;
}

async function main() {
  const { values } = parseArgs({
    options: {
      live: { type: "boolean", default: false },
      date: { type: "string" },
      output: { type: "string" },
    },
  });
  const date =
    values.date ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Regina",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const windows = reportingWindows(date);
  const [queue, registry] = await Promise.all(
    ["queue", "registry"].map(async (name) =>
      JSON.parse(
        await readFile(
          new URL(`../../content/${name}.json`, import.meta.url),
          "utf8",
        ),
      ),
    ),
  );
  let performance = null;
  if (values.live) {
    const token = await accessToken();
    const query = (range, dimensions) =>
      api(`/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
        method: "POST",
        token,
        body: {
          ...range,
          ...(dimensions ? { dimensions } : {}),
          rowLimit: 100,
          dataState: "final",
        },
      });
    const [current, previous, queries, pages] = await Promise.all([
      query(windows.current),
      query(windows.previous),
      query(windows.current, ["query"]),
      query(windows.current, ["page"]),
    ]);
    performance = {
      current: current.rows?.[0],
      previous: previous.rows?.[0],
      queries: queries.rows ?? [],
      pages: pages.rows ?? [],
    };
  }
  const report = renderBrief({ date, queue, registry, performance });
  if (values.output) {
    await writeFile(values.output, report);
    console.log(`Wrote ${values.output}`);
  } else process.stdout.write(report);
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  main().catch(() => {
    console.error(
      "Marketing brief failed. Check arguments, output path, and Search Console credentials/access. No report was published.",
    );
    process.exitCode = 1;
  });
