import type { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface VerifiedCustomDomain {
  id: string;
  user_id: string;
  hostname: string;
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/**
 * Service-role lookup of a verified custom hostname. Returns null for
 * pending, failed, or unknown hosts. Never consults a client-supplied id.
 */
export async function findVerifiedCustomDomain(
  admin: AdminClient,
  hostname: string,
): Promise<VerifiedCustomDomain | null> {
  const { data, error } = await admin
    .from("custom_domains")
    .select("id, user_id, hostname")
    .eq("hostname", hostname)
    .eq("status", "verified")
    .maybeSingle();
  if (error || !data) return null;
  return data as VerifiedCustomDomain;
}

export interface OwnedCodeRow {
  id: string;
  destination_url: string;
  user_id: string;
}

/** Global slug lookup used by scst.one and the app domain. */
export async function findCodeBySlug(
  admin: AdminClient,
  slug: string,
): Promise<OwnedCodeRow | null> {
  const { data, error } = await admin
    .from("qr_codes")
    .select("id, destination_url, user_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as OwnedCodeRow;
}

/** Owner-scoped slug lookup used by verified custom hosts. */
export async function findCodeBySlugForOwner(
  admin: AdminClient,
  slug: string,
  userId: string,
): Promise<OwnedCodeRow | null> {
  const { data, error } = await admin
    .from("qr_codes")
    .select("id, destination_url, user_id")
    .eq("slug", slug)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as OwnedCodeRow;
}
