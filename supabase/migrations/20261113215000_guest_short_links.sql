-- Guest short links: a logged-out visitor can mint a scst.one redirect that
-- is owned by a hashed guest-cookie token until they claim it with an account.
--
-- Why this is on qr_codes (nullable user_id + guest_token_hash) rather than a
-- separate table:
--   * The redirect hot path stays one service-role lookup by slug. Existing
--     account links are unchanged.
--   * Current RLS already uses auth.uid() = user_id. A null user_id never
--     equals a signed-in user, and anon/authenticated still have no policy
--     that would let them read, list, insert, or update guest rows. Public
--     clients cannot see guest links. Service role creates and claims them.
--   * Claiming is an in-place update (same slug, same scans), not a copy.
--
-- Lifetime: guest links have no set end date and keep redirecting. The
-- never-expire promise is hard to honour without an account, which is why
-- we ask visitors to claim the link. disabled_at is an ops switch for abuse.

alter table public.qr_codes
  alter column user_id drop not null;

alter table public.qr_codes
  add column if not exists guest_token_hash text,
  add column if not exists guest_notice_accepted_at timestamptz,
  add column if not exists guest_notice_version text,
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_reason text;

alter table public.qr_codes
  drop constraint if exists qr_codes_owner_state;

alter table public.qr_codes
  add constraint qr_codes_owner_state check (
    (user_id is not null and guest_token_hash is null)
    or (
      user_id is null
      and guest_token_hash is not null
      and guest_notice_accepted_at is not null
      and guest_notice_version is not null
    )
  );

create index if not exists qr_codes_guest_token_hash_idx
  on public.qr_codes (guest_token_hash)
  where guest_token_hash is not null;

comment on column public.qr_codes.guest_token_hash is
  'SHA-256 hex of the guest cookie token. Null after the link is claimed.';
comment on column public.qr_codes.disabled_at is
  'Ops takedown timestamp. When set, the slug no longer redirects.';
comment on column public.qr_codes.guest_notice_accepted_at is
  'When the visitor accepted the guest-link notice. Kept after claim for the record.';
comment on column public.qr_codes.guest_notice_version is
  'Version of the notice wording that was accepted, e.g. v1.';

-- RLS policies are unchanged: select/insert/update/delete still require
-- auth.uid() = user_id. Guest rows (user_id is null) are invisible to
-- anon and authenticated clients. No new client policies are added.

create or replace function public.disable_qr_code(
  p_slug text,
  p_reason text default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.qr_codes
    set disabled_at = now(),
        disabled_reason = left(p_reason, 200)
  where slug = p_slug
    and disabled_at is null;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.enable_qr_code(p_slug text) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.qr_codes
    set disabled_at = null,
        disabled_reason = null
  where slug = p_slug
    and disabled_at is not null;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke execute on function public.disable_qr_code(text, text)
  from public, anon, authenticated;
revoke execute on function public.enable_qr_code(text)
  from public, anon, authenticated;
