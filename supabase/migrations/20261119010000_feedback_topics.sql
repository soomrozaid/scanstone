-- Dashboard Feedback panel: tappable "what to change" chips.
-- The tab now shows only to signed-in users on /dashboard, so user_id and
-- email come from the session in /api/feedback instead of a form field.

alter table public.feedback
  add column topics text[] not null default '{}'::text[]
    check (cardinality(topics) <= 12);

alter table public.feedback drop constraint feedback_has_content;
alter table public.feedback add constraint feedback_has_content check (
  reaction is not null
  or cardinality(topics) > 0
  or char_length(btrim(coalesce(message, ''))) > 0
);

comment on column public.feedback.topics is
  'Chips picked in the dashboard Feedback panel, e.g. designs, editing, stats, free_codes, speed, broken.';
comment on column public.feedback.email is
  'Signed-in user''s account email at the time of sending (from the session).';
