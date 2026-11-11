import test from "node:test";
import assert from "node:assert/strict";
import { reportingWindows, campaignUrl, renderBrief } from "./brief.mjs";

test("windows are adjacent complete 28-day periods and exclude recent days", () => {
  assert.deepEqual(reportingWindows("2026-11-04"), {
    current: { startDate: "2026-10-05", endDate: "2026-11-01" },
    previous: { startDate: "2026-09-07", endDate: "2026-10-04" },
  });
  assert.throws(() => reportingWindows("2026-02-30"));
});
test("offline reports do not fabricate performance", () => {
  const report = renderBrief({ date: "2026-11-04", queue: [], registry: [] });
  assert.match(report, /Search Console was not queried/);
  assert.match(report, /No measured page data/);
});
test("reports distinguish aggregate totals from query and page rows", () => {
  const report = renderBrief({
    date: "2026-11-04",
    queue: [],
    registry: [],
    performance: {
      current: { clicks: 4, impressions: 100, ctr: 0.04 },
      previous: { clicks: 2, impressions: 80, ctr: 0.025 },
      queries: [
        { keys: ["menu | qr"], clicks: 1, impressions: 12, position: 9 },
      ],
      pages: [],
    },
  });
  assert.match(report, /4 clicks \/ 100 impressions \/ 4.0% CTR/);
  assert.match(report, /menu \\\| qr/);
});
test("campaign links keep the destination and encode attribution", () => {
  const url = new URL(
    campaignUrl("/restaurant-menu-qr-code", "instagram", "2026-11-04"),
  );
  assert.equal(url.origin, "https://www.scanstone.ca");
  assert.equal(url.pathname, "/restaurant-menu-qr-code");
  assert.equal(url.searchParams.get("utm_campaign"), "menu-2026-11-04");
});
