-- Custom domains for Pro. Additive only: does not alter qr_codes, profiles,
-- or existing redirect data. Writes are service-role only so a user cannot
-- mark their own hostname verified.

create table public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  hostname text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'failed')),
  dns_records jsonb not null default '[]'::jsonb,
  vercel_verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_domains_hostname_format check (
    hostname ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
    and char_length(hostname) <= 253
  )
);

create unique index custom_domains_hostname_uidx on public.custom_domains (hostname);
create unique index custom_domains_one_per_user_uidx on public.custom_domains (user_id);
create index custom_domains_verified_host_idx
  on public.custom_domains (hostname)
  where status = 'verified';

alter table public.custom_domains enable row level security;

create policy "custom_domains_select_own" on public.custom_domains
  for select using ((select auth.uid()) = user_id);
-- No insert/update/delete policies: mutations go through the service role
-- after a server-side Pro check.

create trigger custom_domains_updated_at
  before update on public.custom_domains
  for each row execute function public.set_updated_at();
