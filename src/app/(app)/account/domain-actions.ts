"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { platformHostsFromEnv } from "@/lib/custom-domain/platform";
import { validateCustomHostname } from "@/lib/custom-domain/hostname";
import {
  addProjectDomain,
  dnsRecordsFromState,
  removeProjectDomain,
  verifyProjectDomain,
  VercelDomainsNotConfiguredError,
  type DnsRecord,
} from "@/lib/custom-domain/vercel";
import { log } from "@/lib/log";

export type DomainActionState = { error?: string; ok?: boolean } | null;

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  return {
    user,
    isPro: profile?.plan === "pro",
    admin: createSupabaseAdminClient(),
  };
}

function actionError(error: unknown, fallback: string): DomainActionState {
  if (error instanceof VercelDomainsNotConfiguredError) {
    return { error: error.message };
  }
  return { error: error instanceof Error ? error.message : fallback };
}

async function allowAddOrVerify(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  const allowed = await admin.rpc("hit_rate_limit", {
    p_key: `custom-domain:${userId}`,
    p_max: 10,
    p_window_seconds: 3600,
  });
  return allowed.data === true;
}

export async function addCustomDomain(
  _prev: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const { user, isPro, admin } = await requireUser();
  if (!isPro) {
    return { error: "Custom domains are included with Pro." };
  }

  const parsed = validateCustomHostname(
    String(formData.get("hostname") ?? ""),
    platformHostsFromEnv(),
  );
  if (!parsed.ok) return { error: parsed.error };

  if (!(await allowAddOrVerify(admin, user.id))) {
    return { error: "Please wait a bit before trying another domain." };
  }

  const { data: existing } = await admin
    .from("custom_domains")
    .select("id, hostname")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return {
      error: `You already have ${existing.hostname} on this account. Remove it first to use a different domain.`,
    };
  }

  const { data: taken } = await admin
    .from("custom_domains")
    .select("id")
    .eq("hostname", parsed.hostname)
    .maybeSingle();
  if (taken) {
    return { error: "That domain is already in use on another account." };
  }

  let state;
  try {
    state = await addProjectDomain(parsed.hostname);
  } catch (error) {
    return actionError(error, "Couldn't add that domain. Try again.");
  }

  const records: DnsRecord[] = dnsRecordsFromState(state);
  const { error } = await admin.from("custom_domains").insert({
    user_id: user.id,
    hostname: parsed.hostname,
    status: state.verified ? "verified" : "pending",
    dns_records: records,
    vercel_verified: state.verified,
    verified_at: state.verified ? new Date().toISOString() : null,
  });
  if (error) {
    // Best effort: don't leave a Vercel domain dangling if we failed to record it.
    try {
      await removeProjectDomain(parsed.hostname);
    } catch (cleanupError) {
      log("error", "custom_domain_cleanup_failed", {
        error: String(cleanupError),
      });
    }
    if (error.code === "23505") {
      return { error: "That domain is already in use." };
    }
    log("error", "custom_domain_insert_failed", { error: error.message });
    return { error: "Couldn't save that domain. Try again." };
  }

  log("info", "custom_domain_added", { user: user.id });
  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function verifyCustomDomain(
  _prev: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const { user, isPro, admin } = await requireUser();
  if (!isPro) {
    return { error: "Custom domains are included with Pro." };
  }

  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Unknown domain." };

  if (!(await allowAddOrVerify(admin, user.id))) {
    return { error: "Please wait a bit before checking again." };
  }

  const { data: row } = await admin
    .from("custom_domains")
    .select("id, hostname, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { error: "Unknown domain." };

  let state;
  try {
    state = await verifyProjectDomain(row.hostname);
  } catch (error) {
    await admin
      .from("custom_domains")
      .update({ status: "failed" })
      .eq("id", row.id)
      .eq("user_id", user.id);
    revalidatePath("/account");
    return actionError(error, "Couldn't check that domain yet.");
  }

  const records = dnsRecordsFromState(state);
  const { error } = await admin
    .from("custom_domains")
    .update({
      status: state.verified ? "verified" : "pending",
      dns_records: records,
      vercel_verified: state.verified,
      verified_at: state.verified ? new Date().toISOString() : null,
    })
    .eq("id", row.id)
    .eq("user_id", user.id);
  if (error) return { error: "Couldn't save the check result. Try again." };

  log("info", "custom_domain_verified_check", {
    user: user.id,
    verified: state.verified,
  });
  revalidatePath("/account");
  revalidatePath("/dashboard");
  if (!state.verified) {
    return {
      error:
        "DNS is not verified yet. Add the records below, wait a minute, and check again.",
    };
  }
  return { ok: true };
}

export async function removeCustomDomain(formData: FormData): Promise<void> {
  const { user, admin } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  const { data: row } = await admin
    .from("custom_domains")
    .select("id, hostname")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return;

  try {
    await removeProjectDomain(row.hostname);
  } catch (error) {
    if (!(error instanceof VercelDomainsNotConfiguredError)) {
      log("error", "custom_domain_remove_vercel_failed", {
        error: String(error),
      });
      throw error;
    }
    // If the API isn't configured (or the domain was never added there),
    // still drop our row so the customer can start over.
  }

  await admin
    .from("custom_domains")
    .delete()
    .eq("id", row.id)
    .eq("user_id", user.id);
  log("info", "custom_domain_removed", { user: user.id });
  revalidatePath("/account");
  revalidatePath("/dashboard");
}
