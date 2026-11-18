-- Anonymous QR / short-link generation events.
-- Used to understand how the tools are used. No IP addresses, no
-- fingerprints, and no static-code content is stored. Start fresh;
-- there is no backfill.

create table public.qr_generation_events (
  id bigint generated always as identity primary key,
  anon_id uuid not null,
  code_kind text not null check (code_kind in ('static', 'dynamic')),
  action text not null check (action in ('generate', 'download')),
  page_path text,
  created_at timestamptz not null default now(),
  code_id uuid null references public.qr_codes (id) on delete set null,
  user_id uuid null references public.profiles (id) on delete set null,
  country text,
  region text,
  city text,
  user_agent text,
  device_type text check (
    device_type is null
    or device_type in ('desktop', 'phone', 'tablet', 'unknown')
  ),
  browser text,
  os text,
  language text,
  language_header text
);

create index qr_generation_events_created_at_idx
  on public.qr_generation_events (created_at);

create index qr_generation_events_anon_id_idx
  on public.qr_generation_events (anon_id);

comment on table public.qr_generation_events is
  'Anonymous generation events for static and dynamic codes. No IP stored.';

comment on column public.qr_generation_events.anon_id is
  'Random first-party browser identifier (ss_aid). Not an IP and not an account id.';

comment on column public.qr_generation_events.action is
  'static: generate (at most once per distinct payload per page view) or download (PNG/SVG). dynamic: generate when a code or short link is created.';

comment on column public.qr_generation_events.code_id is
  'Set for dynamic creates only. Null for static events.';

comment on column public.qr_generation_events.user_id is
  'Set when the visitor is signed in at the time of the event. Null otherwise.';

comment on column public.qr_generation_events.country is
  'From the x-vercel-ip-country request header. The IP itself is not stored.';

comment on column public.qr_generation_events.region is
  'From the x-vercel-ip-country-region request header.';

comment on column public.qr_generation_events.city is
  'From the x-vercel-ip-city request header, when present.';

comment on column public.qr_generation_events.user_agent is
  'Raw User-Agent, truncated.';

comment on column public.qr_generation_events.device_type is
  'Coarse class parsed from the User-Agent: desktop, phone, tablet, or unknown.';

comment on column public.qr_generation_events.browser is
  'Browser family name parsed from the User-Agent, e.g. Chrome or Safari.';

comment on column public.qr_generation_events.os is
  'OS family parsed from the User-Agent, same approach as scans.';

comment on column public.qr_generation_events.language is
  'Primary tag from the Accept-Language header, e.g. en-CA.';

comment on column public.qr_generation_events.language_header is
  'Raw Accept-Language header, truncated.';

alter table public.qr_generation_events enable row level security;
-- No policies: neither anon nor authenticated clients can select, insert,
-- update, or delete. Writes go through the service role from a server route.

revoke all on table public.qr_generation_events
  from public, anon, authenticated;
