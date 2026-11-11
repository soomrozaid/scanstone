# Marketing operating plan

Confirmed strategy (November 4, 2026): restaurants and cafés first; organic acquisition; marketing budget $0–$100/month, excluding owner time. Prioritize menu-change demonstrations, useful search content, and print-shop partnerships. Audience fit still needs validation through actual usage. See [the strategy brief](marketing-strategy.html) for positioning, channel experiments, and evidence.

## What is ready locally

- Clearer homepage copy and an interactive menu-change illustration. The illustration does not change any live redirect; its QR opens `/demo`.
- `/restaurant-menu-qr-code`: a complete use-case page with explicit limitations, FAQs, internal links, canonical metadata, sitemap entry, and matching structured data.
- Existing article updated using official provider documentation; historic ratings and prices removed. Original URL and publication date retained; material update date recorded.
- The free generator waits until input handlers are ready before enabling its controls, preventing fast mobile input from being lost before QR generation.
- Static sitemap pages no longer pretend their content changed on every build.
- `marketing_cta_clicked` with `placement`/`action`, plus `marketing_demo_changed`, through the existing Vercel Analytics integration. Existing `qr_downloaded` remains. No destination URLs, contacts, or credentials are included in event properties.
- Read-only weekly brief generation with actual Search Console totals, comparison periods, content suggestions, UTM links, and review drafts.
- The content publishing workflow produces review PRs, skips when a prior weekly review is open, and does not ping search engines before deployment. `CONTENT_AUTOPUBLISH` is no longer used.

These source changes are not deployed or enabled remotely by this task. Custom-event availability depends on the connected Vercel plan and configuration. CTA clicks are not completed signups.

## Run a brief

```sh
npm run marketing:brief
npm run marketing:brief -- --live --output /tmp/scanstone-marketing-brief.md
npm run test:marketing
```

Offline mode labels missing metrics explicitly. Live mode uses `GOOGLE_APPLICATION_CREDENTIALS`, or the existing local key path in `scripts/gsc.mjs`. Never commit that key. Errors fail the run instead of substituting made-up data. The date defaults to America/Regina. `--date YYYY-MM-DD` supports reproducible reports. The latest three days are excluded; comparisons use adjacent 28-day periods. Page impressions are not summed as unique search impressions.

## Enable after review and deployment

1. Merge/deploy the reviewed site changes through the existing deployment workflow. Verify `/restaurant-menu-qr-code`, its canonical URL, `/sitemap.xml`, `/llms.txt`, and the signup/generator links in production.
2. In GitHub Actions, configure `GCP_SA_KEY` with the existing Search Console service account JSON and ensure that account can read `sc-domain:scanstone.ca`.
3. Set repository variable `MARKETING_REPORTS=true`. `.github/workflows/marketing-review.yml` runs Mondays at 09:00 America/Regina and saves a private Actions artifact for 30 days. It has read-only repository permissions, no paid AI call, and sends no email. It can also be run manually. Without credentials it produces a clearly marked offline brief.
4. Keep content drafting separate: `CONTENT_PIPELINE=true` enables the existing GSC candidate loop and the revised Wednesday article workflow. Confirm the configured AI provider/model is available and estimate its cost before enabling. The existing loop can send a digest if Resend variables are configured; review that recipient separately. GitHub must allow Actions to create PRs. A source branch PR needs human review and merge to publish.
5. After a new article is live, verify its HTTP response before submitting it to IndexNow or requesting indexing. The automatically generated sitemap remains the normal discovery route.

To pause only marketing briefs, set `MARKETING_REPORTS=false`. To pause automated content drafting and discovery, set `CONTENT_PIPELINE=false`. No workflow needs a new database or an email platform for the weekly brief.

## Weekly operating loop

| When      | Automation                             | Owner work                                                               | Decision                             |
| --------- | -------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Monday    | Search performance and draft brief     | Review top landing pages and one customer question                       | Pick one improvement                 |
| Tuesday   | UTM links and draft copy               | Capture a real 30–45 second menu-change demo                             | Approve one original asset           |
| Wednesday | One article PR, if enabled             | Verify facts, links, uniqueness, and screenshots                         | Merge only useful content            |
| Thursday  | Reuse approved asset in channel drafts | Publish via owned social accounts; contact partners only when authorized | Record channel and landing page      |
| Friday    | Review traffic and intent events       | Check new accounts and actual first scans                                | Keep, change, or stop the experiment |

Do not auto-post identical weekly captions. Use real examples, product changes, or customer questions as fresh inputs. Do not add mass near-duplicate pages for keyword variants. Prefer improving the existing generator and menu page.

## Measurement still to build

North-star working definition: new accounts with a first dynamic code and a first non-owner scan within seven days. Current app data does not distinguish owner test scans reliably, so this is a measurement specification, not an implemented metric.

Next instrumentation: confirmed signup → code creation → first scan → upgrade; use aggregate cohorts and consent-aware attribution. Do not treat the new click events as a full attribution system. Review where attribution can survive authentication redirects before deciding on any storage changes.

At this traffic level, prioritize descriptive counts and customer feedback over split tests. Trial goals for the first month: 10 owner conversations, 5 observed setup sessions, 4 original demonstrations, and 2 permission-based print-shop/agency partner experiments. These are work targets, not forecasts of popularity or revenue.
