# Custom domains for Pro

Date: 13 November 2026 (America/Regina, CST)
Status: draft PR, not merged, not applied to production
Branch: nori/custom-domains

## Why

Customers keep asking what happens to printed codes if the QR company shuts down. Zaid approved this answer on 13 November 2026: Pro customers can point a domain they own (for example qr.theircafe.com) at Scanstone, so the redirect lives on their domain. If they ever leave, they can point that domain somewhere else and the printed codes do not have to change.

scst.one and scanstone.ca keep working exactly as they do today. Custom domains are an additional URL, not a replacement.

## Public promise (draft, do not publish yet)

If you are on Pro, you can point your own domain at Scanstone, like qr.theircafe.com. Your QR codes then redirect through a domain you own, so the printed codes stay under your control. Your usual scst.one links keep working as well. If you ever leave, you can point that domain somewhere else and the printed codes do not have to change.

## Data model

New table `public.custom_domains` (migration only, do not apply to production until Zaid signs off):

- `id` uuid primary key
- `user_id` uuid, references `profiles(id)` on delete cascade
- `hostname` text, unique, stored lowercase with no scheme or port (for example `qr.theircafe.com`)
- `status` text: `pending`, `verified`, or `failed`
- `dns_records` jsonb: the CNAME, A, and TXT records we show the customer
- `vercel_verified` boolean
- `verified_at` timestamptz
- `created_at` / `updated_at`

Constraints and access:

- One domain per user in this first version (unique on `user_id`).
- Row Level Security: users can read their own row. Inserts, updates, and deletes go through the service role after a server-side Pro check, so a user cannot mark their own domain verified.
- A partial index on `hostname` where `status = 'verified'` supports the redirect lookup.

## Adding and verifying a domain

1. The Pro customer types a hostname on the Account page.
2. The server checks they are Pro, the hostname is valid, it is not a reserved Scanstone host, and it is not already taken.
3. We add the domain to the Vercel project with the Vercel Domains API, store the recommended DNS records, and show them to the customer.
4. The customer adds those records at their DNS host:
   - Subdomain: CNAME to `cname.vercel-dns.com`, plus the TXT ownership record Vercel returns.
   - Apex domain: the A/ALIAS records Vercel recommends, plus the same TXT record.
5. The customer clicks "Check DNS". We call Vercel's verify endpoint, refresh the stored status, and mark the domain verified when Vercel says it is.
6. Removing a domain deletes it from Vercel and from our table. Account deletion does the same before the user row is removed.

We do not add or remove domains in the Vercel project as part of this PR. That only happens later, at runtime, after Zaid has added the token and applied the migration.

## Host-based routing

Incoming requests are classified by the actual connection host, not by a client-supplied tenancy header.

- `www.scanstone.ca`, `scanstone.ca`, `*.vercel.app`, and localhost are platform hosts. Existing app, auth, billing, and `/r/{slug}` behavior is unchanged.
- `scst.one` is the short domain. The existing next.config rewrite to `/r/{slug}` is unchanged, including the missing-code fallback and the root redirect to the app.
- A verified custom host: only that owner's slugs resolve. A path that matches a slug is rewritten to `/r/{slug}`, and the lookup is scoped to the domain owner. Other users' slugs, unknown slugs, and non-slug paths (login, dashboard, APIs, marketing pages) return 404. This keeps auth cookies and the app off the customer's domain.
- Any other host that reaches the app returns 404.

Host-header spoofing: if the connection host is a platform or short host, that wins. A spoofed `Host` or `x-forwarded-host` cannot switch the request into another tenant's custom-domain scope. Local development is the one exception: when the connection host is localhost, we honor `Host` so existing scst.one tests and new custom-domain tests can run against the dev server.

## Pro gating

Adding and verifying a domain is checked server-side against `profiles.plan === 'pro'`. The Account page also hides the add form for Free users and points them to upgrade. Redirect resolution is not plan-gated. That is the covenant.

## Dashboard UI

A Custom domain card on the Account page lets a Pro user add one hostname, see the DNS records, check verification, and remove the domain. Once it is verified, the dashboard and code detail pages also show `https://{their-domain}/{slug}` next to the usual scst.one URL.

## When Pro lapses

scst.one (and `/r/{slug}` on the app domain) must keep redirecting. That is unchanged and covered by tests.

Custom domain behavior on downgrade is an open question for Zaid. The implementation default, which we can change before merge, is:

- Existing verified custom domains keep redirecting. Printed codes on the customer's domain do not die when they cancel.
- They cannot add or re-check a new domain until they are Pro again.
- They can still remove the domain.

## Security

- No host-header spoofing of tenant scope, as described above.
- No cross-tenant slug access: custom-host lookup always includes `user_id = domain owner`.
- Reserved hosts cannot be claimed (scanstone.ca, www.scanstone.ca, scst.one, any vercel.app host, localhost).
- Custom hosts never serve the app, login, or APIs.
- Destination URL rules and the covenant on scst.one are untouched.
- Vercel API credentials stay server-only and are optional at build time so Preview keeps building.

## Env vars Zaid must add (do not set them in this work)

Set these in Vercel for Production (and Preview if he wants the feature testable there). Do not put the token in chat.

- `VERCEL_API_TOKEN`: a Vercel token that can add, verify, and remove domains on the Scanstone project. Create it at vercel.com/account/tokens. The automatic `VERCEL_TOKEN` on deployments is not enough, because it may not have domain write access.
- `VERCEL_PROJECT_ID`: `prj_4zPRiH7xPQI8GuTgIRBA5351tjOa` (the token path should set this explicitly even though Vercel also injects this name).
- `VERCEL_TEAM_ID`: `team_lTtmiqDpNFcr3CG3joB1qQD1` (same value as `VERCEL_ORG_ID`).

None of these are required for the site to build or for scst.one redirects to work. They are only needed when a Pro user adds, checks, or removes a domain.

## Migration Zaid must run (do not run it now)

After merge approval, from a linked Supabase CLI:

`supabase db push --linked --yes`

The file is `supabase/migrations/20261113000001_custom_domains.sql`. It is additive: one new table, indexes, RLS, and a trigger. It does not change `qr_codes`, `profiles`, or redirect data.

## Open questions for Zaid

1. Downgrade: should a verified custom domain keep redirecting after Pro lapses? Recommended default: yes, to match the covenant. Alternative: stop resolving on the custom host (scst.one would still work).
2. How many domains per Pro account? Recommended default: one.
3. What should a visitor see at the root of the custom domain (qr.theircafe.com/)? Recommended default: a plain 404, so the domain is only a redirect surface.
4. Should apex domains (theircafe.com) be allowed, or only subdomains (qr.theircafe.com)? Recommended default: both, with the matching DNS records.
5. Vercel will have a cap on how many domains one project can hold. Worth watching as this grows. A later move is a dedicated redirect project or a wildcard on a Scanstone-owned domain, but that is not needed to ship.

## What this PR does not do

- Does not merge to main.
- Does not apply the migration to production.
- Does not add or change Vercel env vars.
- Does not change pricing amounts, Stripe products, auth, or the scst.one / scanstone.ca redirect contract.
