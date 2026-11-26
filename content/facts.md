# Scanstone content facts

Drafts must trace factual, numeric, and comparative claims to this file. A lint pass does not verify a claim. Recheck product behavior and dated external sources during editorial review. Do not invent reviews, customers, rankings, or savings.

## Product facts — reviewed against this repository, 2026-11-04

- Static QR codes: unlimited, no account, no watermark, free PNG (2048px) and SVG. Data lives in the pattern. The pattern has no subscription expiry; a linked website still needs to stay available.
- Dynamic QR codes: edit the destination after printing; count scans by date, coarse location, and device. No scan cookies, stored IPs, or fingerprints.
- Short links: editable destinations and click counts. Short links and dynamic codes share the plan limit. Canonical website: https://www.scanstone.ca; configured short domain: https://scst.one.
- Free: 3 dynamic codes or short links total, 30-day analytics, PNG and SVG downloads. Pro: $9 USD/month or $79 USD/year, 500 codes or links total, full history and CSV export. Annual savings versus 12 monthly payments are $29; do not invent a discount percentage or currency conversion.
- Cancellation, downgrade, or reaching plan limits does not disable redirects. This is a billing policy, not an uptime guarantee. Deleting a code or account removes its redirects. Dynamic codes also depend on the redirect infrastructure and destination staying available.
- Source files: src/lib/plans.ts, src/app/r/[slug]/route.ts, src/components/free-tool/StaticGenerator.tsx. Public policy: https://www.scanstone.ca/terms and https://www.scanstone.ca/pricing.
- Menu workflow: users supply a public menu webpage or PDF URL. Scanstone does not host PDFs, build restaurant websites, or accept food orders. If the menu content changes at the same URL, a static code can still be sufficient.
- QR code creation here cannot change a QR pattern already printed by another provider. Moving providers generally requires a new code/reprint unless the user controls the encoded URL.

## External facts — verified 2026-11-04

- QRCG by Bitly (qr-code-generator.com) says dynamic codes created during its 14-day free trial are deactivated at the end of that trial and point to a service page. Its static codes keep working. Source: https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean
- Its reactivation guidance says upgrading the original account can reactivate codes; creating a new account or a new code with the same content does not reactivate the old code. Source: https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes
- Do not reuse historical Trustpilot scores or competitor prices. None is verified for use in this fact sheet. Do not generalize one provider's trial policy to the whole market or assert intent to deceive.

## External facts — cancellation policies, verified 2026-11-14 (used in /blog/what-happens-to-qr-codes-when-you-cancel)

- QRCG by Bitly: paid cancellation keeps dynamic codes active 30 days from the last contract day, no editing/stats; cancel at least one day before renewal. https://support.qr-code-generator.com/hc/en-us/articles/12934511873165 (article dated 2023-02-08)
- QR TIGER: free plan 3 dynamic codes, 500-scan limit each, then they stop. Paid expiry or cancel: "All dynamic QR codes will become invalid." https://qrtiger.helpscoutdocs.com/article/201-is-using-qr-tiger-free , https://qrtiger.helpscoutdocs.com/article/97-what-happens-if-my-paid-subscription-expires-or-if-i-cancel-my-subscription
- Uniqode: trial expiry stops dynamic codes; cancel keeps them until the renewal date, then they stop; data kept. https://docs.uniqode.com/en/articles/17190918-what-happens-to-my-qr-codes-when-my-subscription-changes-or-ends
- Scanova: 14-day trial, dynamic codes deactivated at the end; lapsed paid subscription the same; nothing deleted. https://docs.scanova.io/billing/trial-and-expiry
- QRCodeChimp: free 10 dynamic codes, 1,000 scans/month combined then paused; lapsed paid plan moves to free and pauses all but the last 10; cancel renewal by email a day before. https://www.qrcodechimp.com/pricing
- Hovercode: cancel moves to free; first 3 dynamic codes, 3 short links, 1 multi-link page stay active; rest inactive, custom-domain items stop. https://hovercode.com/help/article/32-if-you-cancel
- Flowcode: codes never expire, unlimited scans; on downgrade only the 2 most recent stay editable and others keep scanning (same article also mentions codes "deleted upon downgrading"). https://help.flowcode.com/en/articles/7061611-will-my-codes-pages-expire , https://help.flowcode.com/en/articles/6927459-what-happens-to-my-account-and-codes-when-i-downgrade
- GetQR: no free plan; 7-day trial is paid and auto-renews; when the subscription ends codes stop redirecting and show a deactivated page; renewing restores them; deleting codes doesn't stop payments. https://docs.getqr.com/faq/general (verified 2026-11-17)
- QRNew: card-free trial ends on its own and never charges; after paid access ends dynamic codes and hosted pages show "temporarily unavailable"; resubscribing restores them. https://qrnew.com/en/help/cancel-subscription (verified 2026-11-17)
- QR Dex: cancel takes effect at end of billing period, then dynamic codes stop redirecting; data kept, reactivation restores instantly; no partial refunds on annual plans. https://qrdex.io/help/managing-your-subscription (verified 2026-11-17)

## External facts: trial subscriptions, verified 2026-11-15 (used in /blog/qr-code-1-dollar-trial-subscription)

- GetQR: "subscription-based service"; "an active subscription is required to keep your QR codes live"; plan "activates automatically at the end of the 7-day trial period". https://getqr.com/help/subscription-recurring-charge
- GetQR: trial, 4-week, quarterly and annual plans all renew automatically. https://getqr.com/help/automatically-renew-subscription
- GetQR: cancel via Cancellation Portal or Account > Manage My Plan; cancelling doesn't reverse a processed charge. https://getqr.com/help/cancel-my-subscription ; no confirmation email means no cancellation: https://getqr.com/help/charge-after-cancel
- GetQR refund policy: payments "generally final"; may refund duplicate/erroneous charges, technical issues, legal obligations; not change of mind or non-use; request within 30 days. https://getqr.com/help/refund-policy
- GetQR troubleshooting lists expired subscription or trial as the first reason a code stops working. https://getqr.com/help/qr-code-not-working
- GetQR terms section 9 (https://getqr.com/eula): 7-day trial $1.00 USD / CA$1.50, non-refundable; then 4-week subscription $39.99 USD / CA$44.99 unless cancelled before the trial ends; removing payment method, chargeback or contacting the bank "does not count as cancellation".

## External facts: Bitly, verified 2026-11-16 (used in /blog/bitly-qr-code-alternative)

- Bitly pricing (USD, https://bitly.com/pages/pricing): Free "With Ads": 2 QR codes/month, 5 links/month, no redirects, no data history. Core $10/mo annual only ($120/yr): 5 QR/mo, 100 links/mo, 5 redirects/mo, 30 days data. Growth $29/mo yearly ($348) or $35 monthly: 10 QR/mo, 500 links/mo, 20 redirects/mo, custom domain, 120 days data. Premium $199/mo yearly ($2,388) or $300 monthly: 200 QR/mo, 110 redirects/mo, 1 year data. Plans auto-renew. Page markup has lower regional prices ("usd_low").
- Bitly QR codes never expire; stop only if code or link deleted: https://support.bitly.com/hc/en-us/articles/12231200298125-Do-Bitly-Codes-ever-expire
- Redirect (edit destination) on paid plans only, counts toward monthly redirect limit and as a new link if a link is attached: https://support.bitly.com/hc/en-us/articles/7995084842765-How-do-I-redirect-a-Bitly-Code
- Downgrade: bit.ly links/codes keep working; own custom domain works while DNS points to Bitly, SSL not renewed; complimentary domain not renewed, links stop at registration expiry: https://support.bitly.com/hc/en-us/articles/360029870551-What-happens-when-I-downgrade-to-a-lower-subscription-plan
- Account deletion: bit.ly back-halves "cannot be re-used": https://support.bitly.com/hc/en-us/articles/360059651871
- Nov 2026 hijacked old bit.ly links (Bitly called it a flaw involving expired links; suspended accounts, disabling links): https://www.malwarebytes.com/blog/news/2026/11/hijacked-bitly-links-turn-old-brand-posts-into-offensive-redirects
- Scanstone (from repo 2026-11-16): no edit limit on destinations (updateCode has no counter), random 8-character slugs, colours but no logo upload, no public API, no custom domains live (PR 5 pending).

## External facts: QRCG by Bitly, verified 2026-11-17 (used in /blog/is-qr-code-generator-com-free)

- Pricing page https://www.qr-code-generator.com/pricing/ (prices from the page's data-acf-plan-prices, USD, VAT not included; "usd_low" regional prices lower): Starter $19.99/mo monthly or $9.99/mo billed annually ($119.88), 2 dynamic, 10,000 scans, 1 user. Advanced $18.99/mo billed annually ($227.88), 50 dynamic, unlimited scans, 100 bulk, 3,000 API requests/mo, 2 users. Professional $49.99/mo billed annually ($599.88), 250 dynamic, 500 bulk, 10,000 API, 5 users. "Start with 14 days for free". 22 code types. All subscriptions renew automatically. Pricing FAQ: cancel by "informal email", notice period 30 days before end of billing cycle.
- Cancel help article (updated 2026-09-22) https://support.qr-code-generator.com/hc/en-us/articles/7665399659277 : cancel on Billing page at least one day before renewal; no refunds for unused time; no confirmation email; codes redirect through paid period plus 30 days (no edits), then account locked and codes go to a service page; reactivating restores.
- Trial: dynamic codes deactivated at trial end, go to a service page; can't convert dynamic to static (article 7665013224205, updated 2026-08-21). Trial has no cost obligation (7665044670477). Trial includes up to 250 dynamic codes (7665056277261). Static codes without an account, tracking off; some designs need an account (7664248839053). Static codes remain active indefinitely (7665040427405). Dynamic short URL examples qrco.de, l.ead.me (7664170522893).

## External facts: Uniqode, verified 2026-11-18 (used in /blog/uniqode-alternative)

- Pricing page https://www.uniqode.com/pricing (USD, only yearly billing shown): Essential $9/mo billed yearly, 1 user, 15 dynamic, 5 Linkpages, 50,000 scans/yr per account, analytics 30 days in table (FAQ says 60). Core $49/mo yearly, 250 dynamic, 1,000,000 scans/yr, 90 days, API 250,000 requests/mo. Plus $99/mo yearly, 3 users, 500 dynamic, 2,000,000 scans/yr, 180 days, custom domain add-on $500/yr. Business+ custom: SSO, multi-org, custom domain, pay by invoice. Lists SOC 2, GDPR, HIPAA.
- Pricing FAQ: 14-day trial, no card, not charged at end; dynamic codes inactive at trial end unless upgraded; static keep working. Scan limit reached: "those QR Codes stop working". Cancel: dynamic codes "stop working as soon as your subscription ends". 30-day money-back guarantee.
- Help: reactivation needs the same account https://docs.uniqode.com/en/articles/9297614-how-do-i-reactivate-my-qr-codes ; cancel from Billing, email not accepted, data retained 60 days, refund of auto-renewal charges on request https://docs.uniqode.com/en/articles/1818577-canceling-your-subscription ; after renewal date dynamic codes and campaigns stop, dashboard access ends, no new static codes, reactivation restores https://docs.uniqode.com/en/articles/17190927-what-happens-to-my-qr-codes-campaigns-and-data-if-i-cancel
- Terms https://www.uniqode.com/terms-of-service section 23.1: written notice no later than 90 days before a Renewal Term. Site JSON-LD Organization alternateName "Beaconstac".
- Scanstone (repo 2026-11-18): pricing page lists scans, clicks and redirects as unlimited on Free and Pro; terms section 2 commits to at least 90 days' email notice and an export window if Scanstone permanently shuts down.

## Internal links

- /qr-code-generator — free static generator
- /restaurant-menu-qr-code — restaurant menu workflow, choice of static or dynamic
- /wifi-qr-code-generator and /vcard-qr-code-generator — focused free tools
- /pricing and /terms — limits and redirect policy
- /demo — public analytics demo
- /blog/qr-code-subscription-trap — source-backed explanation of trial expiry
- /blog/qr-code-stopped-working-how-to-fix — symptom-to-fix guide
- /blog/what-happens-to-qr-codes-when-you-cancel — vendor cancellation policies side by side
- /blog/qr-code-1-dollar-trial-subscription — $1 trial that renews: cancel, refund, printed code
- /blog/bitly-qr-code-alternative: Scanstone vs Bitly, pricing, edits, cancelling
- /blog/is-qr-code-generator-com-free: QRCG free vs trial, prices, cancelling, vs Scanstone
- /blog/uniqode-alternative: Uniqode trial, yearly prices, scan caps, cancelling, vs Scanstone
- /blog/qr-code-menu-complaints: diner complaints about QR menus and a fix for each (operations how-to, not the menu-code use-case page)

Do not link to queued posts until they exist in content/registry.json. Avoid multiple articles targeting the same intent as a working tool or use-case page.

## Editorial rules

Answer the user's question first. Give a concrete workflow, a limitation, and useful next steps. Sources need their actual verification dates. Numbers are optional; never add a number solely to satisfy a content template. Be fair to alternatives. Do not claim special AI files or schema guarantee search visibility.

## Product facts used in /blog/permanent-qr-code, 2026-11-21

- Same product facts as above (static PNG 2048px and SVG, free 3 dynamic codes or short links, Pro $9/$79 USD, redirects survive cancel/downgrade/limits, terms section 2: 90 days' notice and export on shutdown). No custom domains yet, so the "own domain" setup is described as using the user's own website redirect, not a Scanstone feature.

## External facts: QR menu sentiment, verified 2026-11-23 (used in /blog/qr-code-menu-complaints)

- Ipsos Consumer Tracker wave 121, online poll of 1,083 US adults, July 15-16, 2025: 65% had used a QR code menu (42% in Aug 2022, 57% in Jun 2023). Of the 645 who had: 58% would like to go back to paper menus (48% in 2022, 51% in 2023), 71% glad some restaurants went back to paper (60% in 2023), 39% hope QR use continues, 37% like the experience, 46% like that it saves paper. https://www.ipsos.com/en-us/qr-code-menus-are-growing-even-less-popular and topline PDF https://www.ipsos.com/sites/default/files/ct/news/documents/2025-07/Topline%20Ipsos%20Consumer%20Tracker%20Wave%20121.pdf
- Scanstone redirect (src/app/r/[slug]/route.ts, 2026-11-23): plain 302 to the destination, no cookies, no interstitial page.

## External facts: Bitly ad/preview page, verified 2026-11-24 (used in /blog/bitly-qr-code-ad-preview-page)

- Bitly help "Why are there ads on my links?" (updated 2026-01-12): ads on free accounts via "an interstitial page that includes a preview of the link destination and an ad"; upgrade to a paid plan to remove. https://support.bitly.com/hc/en-us/articles/32874287800333-Why-are-there-ads-on-my-links
- Bitly anonymous link FAQ (updated 2026-11-06): no-account links keep working with preview + ads; can't be edited, redirected, transferred or upgraded; fix is to recreate in a paid account and replace the old link. https://support.bitly.com/hc/en-us/articles/32500359495565-Free-Short-Link-Generator-Anonymous-Link-FAQ
- Bitly pricing (checked 2026-11-24): Free "With Ads"; Core $10/mo annual only, $120; Growth $29/mo yearly, $348. https://bitly.com/pages/pricing
- Feb 2025 notice "You can remove the preview page experience from your links and QR Codes at any time by selecting a paid Bitly plan" (Coywolf, 2025-02-06).
- Scanstone (src/app/r/[slug]/route.ts, 2026-11-24): straight 302 to the destination on every plan and for guest links; no interstitial. Links disabled for abuse (disabled_at) go to /link-unavailable; terms list malware/phishing etc.

## External facts: QR Code Creator (qrcodecreator.com), verified 2026-11-26 (used in /blog/qr-code-creator-charged-133)

- Pricing page https://qrcodecreator.com/pricing (rendered 2026-11-26, USD, tax not included): Basic $11.1/month billed annually (3 dynamic codes, 20000 scans, 1 user); Advanced $15.58/month billed annually (50 dynamic, unlimited scans, 500 bulk, 3 users); Professional $46/month billed annually (250 dynamic, unlimited scans, 10000 API requests, 800 bulk, 6 users). No monthly billing option shown. Yearly totals ($133.20, $186.96, $552.00) are our arithmetic.
- Home page disclaimer: 7-day free trial after registration; afterwards data temporarily unavailable until you switch to a plan; trial dynamic codes temporarily deactivated, static codes keep working. https://qrcodecreator.com/
- Terms https://qrcodecreator.com/terms : operator Convertizing LTD, Dublin, Ireland. 13.4 trial dynamic codes deactivated and "lead to the service page"; account may be deleted 90 days after trial without a plan. 13.5 renewal notice no later than 30 days before annual auto-renewal, from support@qrcodecreatormail.com. 18.1 cancel any time, effective end of paid term; "All purchases of the Services are final". 18.2 EU/UK 14-day withdrawal, can expire early once you consent and download/stream. 18.3 access-failure refund: notify within 24 hours of payment; if not restored within 48 hours, full refund.
- Help: cancel steps (My Account > Billing > Payment Details > Manage > Disable Auto-Renew, password, checkbox, survey) https://help.qrcodecreator.com/en/articles/10775194-can-i-cancel-my-subscription ; no refund for remaining time (2026-10-19) https://help.qrcodecreator.com/en/articles/10394557-if-i-cancel-my-subscription-will-i-get-a-refund
- BBB Scam Tracker customer reports (Sep 2025 to Apr 2026, e.g. https://www.bbb.org/scamtracker/lookupscam/1170814): chose "$11.10/month" Basic, charged $133.20 for a year. Customer accounts, not findings; do not present as verified.
