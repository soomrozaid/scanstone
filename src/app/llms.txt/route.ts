import { DOCS } from "@/lib/content";
import { envClient } from "@/config/env.client";

// Optional plain-text site map; not a search-engine requirement or ranking signal.
// Regenerated from the content registry on deploy.
export const dynamic = "force-static";

export function GET() {
  const base = envClient.APP_URL;

  const posts = DOCS.filter((d) => d.collection === "blog")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((d) => `- [${d.title}](${base}/blog/${d.slug}): ${d.description}`)
    .join("\n");

  const body = `# Scanstone

> Scanstone is a QR code generator whose codes keep working even if you stop paying.
> Static QR codes are free forever with no account and never expire, because the data
> is encoded in the pattern itself. Dynamic codes (editable destination + scan
> analytics) come with a written covenant: the redirect is never disabled by billing
> state — cancel or lapse and your printed codes keep resolving.

## Tools
- [Free QR code generator](${base}/qr-code-generator): permanent static QR codes for a link, WiFi, contact card, or text. PNG or vector SVG, no signup, no expiration.
- [WiFi QR code generator](${base}/wifi-qr-code-generator): a scannable code that joins a WiFi network.
- [vCard QR code generator](${base}/vcard-qr-code-generator): a contact card in one scan.
- [Restaurant menu QR codes](${base}/restaurant-menu-qr-code): use your existing menu webpage or public PDF URL; update the destination after printing. Scanstone does not host menus.
- [Pricing](${base}/pricing): free forever (unlimited static + 3 dynamic); Pro is $9/month or $79/year for 500 codes and full analytics. Redirects never expire on any plan.
- [Live demo](${base}/demo): a real dynamic code with privacy-first, cookieless analytics.

## Writing
${posts}

## Key facts
- A static QR pattern has no expiration, but its linked website must remain available. Dynamic codes depend on the redirect service as well as the destination. Scanstone does not disable redirects because of billing state. Deleting a code or account stops its redirects.
- Free plan: unlimited static codes + 3 dynamic codes or short links in total. Pro: $9/month or $79/year, 500 codes or short links in total, full scan history, SVG + CSV export.
- Short links and dynamic codes share the same plan limit. Both have editable destinations and scan/click counts.
- Scan analytics store no IP addresses and no fingerprints — coarse country/region/device only.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
