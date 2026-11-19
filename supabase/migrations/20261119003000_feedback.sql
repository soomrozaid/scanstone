-- Quick feedback from the site's Feedback tab.
-- Written only with the service role from /api/feedback. No IP addresses.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reaction text check (reaction in ('good', 'okay', 'bad')),
  message text check (char_length(message) <= 2000),
  email text check (char_length(email) <= 254),
  page_path text not null default '/' check (char_length(page_path) <= 200),
  anon_id uuid,
  user_id uuid references auth.users (id) on delete set null,
  user_agent text check (char_length(user_agent) <= 512),
  constraint feedback_has_content check (
    reaction is not null or char_length(btrim(coalesce(message, ''))) > 0
  )
);

comment on table public.feedback is
  'Feedback tab submissions: a reaction and/or a short message, optional reply email. No IP stored.';
comment on column public.feedback.anon_id is
  'Random first-party browser identifier (ss_aid), when present.';

create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;
-- No policies: neither anon nor authenticated clients can read or write.
-- Inserts go through the service role in /api/feedback.

revoke all on table public.feedback from public, anon, authenticated;
