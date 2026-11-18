-- First- and last-touch attribution captured on signup.
-- Written only with the service role. No IP addresses. No backfill.

create table public.signup_attribution (
  user_id uuid primary key references auth.users (id) on delete cascade,
  anon_id uuid,
  first_referrer_host text,
  first_referrer_url text,
  first_landing_path text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_term text,
  first_utm_content text,
  first_gclid text,
  first_fbclid text,
  first_touch_at timestamptz,
  last_referrer_host text,
  last_referrer_url text,
  last_landing_path text,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_term text,
  last_utm_content text,
  last_gclid text,
  last_fbclid text,
  last_touch_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.signup_attribution is
  'First- and last-touch acquisition fields captured at signup. No IP stored.';

comment on column public.signup_attribution.anon_id is
  'Random first-party browser identifier (ss_aid) at signup, when present.';

comment on column public.signup_attribution.first_touch_at is
  'When first-touch was recorded in the browser, not necessarily signup time.';

alter table public.signup_attribution enable row level security;
-- No policies: neither anon nor authenticated clients can select, insert,
-- update, or delete. Writes go through the service role at signup.

revoke all on table public.signup_attribution
  from public, anon, authenticated;
