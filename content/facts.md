# Scanstone content facts

Drafts must trace factual, numeric, and comparative claims to this file. A lint pass does not verify a claim. Recheck product behavior and dated external sources during editorial review. Do not invent reviews, customers, rankings, or savings.

## Product facts — reviewed against this repository, 2026-11-04

- Static QR codes: unlimited, no account, no watermark, free PNG (2048px) and SVG. Data lives in the pattern. The pattern has no subscription expiry; a linked website still needs to stay available.
- Dynamic QR codes: edit the destination after printing; count scans by date, coarse location, and device. No scan cookies, stored IPs, or fingerprints.
- Short links: editable destinations and click counts. Short links and dynamic codes share the plan limit. Canonical website: https://www.scanstone.ca; configured short domain: https://scst.one.
- Free: 3 dynamic codes or short links total, 30-day analytics, PNG. Pro: $9/month or $79/year, 500 codes or links total, full history, dynamic SVG and CSV export. Annual savings versus 12 monthly payments are $29; do not invent a discount percentage or currency conversion.
- Cancellation, downgrade, or reaching plan limits does not disable redirects. This is a billing policy, not an uptime guarantee. Deleting a code or account removes its redirects. Dynamic codes also depend on the redirect infrastructure and destination staying available.
- Source files: src/lib/plans.ts, src/app/r/[slug]/route.ts, src/components/free-tool/StaticGenerator.tsx. Public policy: https://www.scanstone.ca/terms and https://www.scanstone.ca/pricing.
- Menu workflow: users supply a public menu webpage or PDF URL. Scanstone does not host PDFs, build restaurant websites, or accept food orders. If the menu content changes at the same URL, a static code can still be sufficient.
- QR code creation here cannot change a QR pattern already printed by another provider. Moving providers generally requires a new code/reprint unless the user controls the encoded URL.

## External facts — verified 2026-11-04

- QRCG by Bitly (qr-code-generator.com) says dynamic codes created during its 14-day free trial are deactivated at the end of that trial and point to a service page. Its static codes keep working. Source: https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean
- Its reactivation guidance says upgrading the original account can reactivate codes; creating a new account or a new code with the same content does not reactivate the old code. Source: https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes
- Do not reuse historical Trustpilot scores or competitor prices. None is verified for use in this fact sheet. Do not generalize one provider's trial policy to the whole market or assert intent to deceive.

## Internal links

- /qr-code-generator — free static generator
- /restaurant-menu-qr-code — restaurant menu workflow, choice of static or dynamic
- /wifi-qr-code-generator and /vcard-qr-code-generator — focused free tools
- /pricing and /terms — limits and redirect policy
- /demo — public analytics demo
- /blog/qr-code-subscription-trap — source-backed explanation of trial expiry

Do not link to queued posts until they exist in content/registry.json. Avoid multiple articles targeting the same intent as a working tool or use-case page.

## Editorial rules

Answer the user's question first. Give a concrete workflow, a limitation, and useful next steps. Sources need their actual verification dates. Numbers are optional; never add a number solely to satisfy a content template. Be fair to alternatives. Do not claim special AI files or schema guarantee search visibility.
