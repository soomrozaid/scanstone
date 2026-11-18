import "server-only";

import { isAnonId, sanitizePagePath } from "@/lib/anon-id";
import { requestContextFromHeaders } from "@/lib/request-context";
import type { GenerationAction, GenerationKind } from "@/lib/generation-types";
import { log } from "@/lib/log";
import { after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type { GenerationAction, GenerationKind };

/** Minimal service-role client used for rate limits and inserts. */
export type GenerationAdmin = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

export type GenerationEventInput = {
  anonId: string;
  codeKind: GenerationKind;
  action: GenerationAction;
  pagePath: unknown;
  codeId?: string | null;
  userId?: string | null;
  headers: { get(name: string): string | null };
  /** Used only as a rate-limit key. Never stored on the event row. */
  ip?: string | null;
};

const ANON_LIMIT = 60;
const ANON_WINDOW_SECONDS = 60 * 60;
const IP_LIMIT = 120;
const IP_WINDOW_SECONDS = 60 * 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalUuid(value: unknown): string | null {
  if (typeof value !== "string" || !UUID_RE.test(value)) return null;
  return value;
}

async function hitLimit(
  admin: GenerationAdmin,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("hit_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    log("warn", "generation_event_rate_limit_failed", { error: error.message });
    return false;
  }
  return data === true;
}

export type RecordGenerationResult =
  | { ok: true }
  | { ok: false; status: 400 | 429 | 500; error: string };

/**
 * Insert one generation event. Context fields are taken from the request
 * headers, never from the client body. The IP is used only for rate limiting
 * and is not written to the table.
 */
export async function recordGenerationEvent(
  admin: GenerationAdmin,
  input: GenerationEventInput,
): Promise<RecordGenerationResult> {
  if (!isAnonId(input.anonId)) {
    return { ok: false, status: 400, error: "Invalid identifier." };
  }
  if (input.codeKind !== "static" && input.codeKind !== "dynamic") {
    return { ok: false, status: 400, error: "Invalid code kind." };
  }
  if (input.action !== "generate" && input.action !== "download") {
    return { ok: false, status: 400, error: "Invalid action." };
  }

  const codeId =
    input.codeKind === "dynamic" ? optionalUuid(input.codeId) : null;
  const userId = optionalUuid(input.userId);
  const pagePath = sanitizePagePath(input.pagePath);
  const context = requestContextFromHeaders(input.headers);

  const ip = (input.ip ?? "unknown").split(",")[0]?.trim() || "unknown";
  const allowedAnon = await hitLimit(
    admin,
    `generation_event:anon:${input.anonId}`,
    ANON_LIMIT,
    ANON_WINDOW_SECONDS,
  );
  if (!allowedAnon) {
    return { ok: false, status: 429, error: "Too many events. Try again later." };
  }
  const allowedIp = await hitLimit(
    admin,
    `generation_event:ip:${ip}`,
    IP_LIMIT,
    IP_WINDOW_SECONDS,
  );
  if (!allowedIp) {
    return { ok: false, status: 429, error: "Too many events. Try again later." };
  }

  const { error } = await admin.from("qr_generation_events").insert({
    anon_id: input.anonId,
    code_kind: input.codeKind,
    action: input.action,
    page_path: pagePath,
    code_id: codeId,
    user_id: userId,
    country: context.country,
    region: context.region,
    city: context.city,
    user_agent: context.user_agent,
    device_type: context.device_type,
    browser: context.browser,
    os: context.os,
    language: context.language,
    language_header: context.language_header,
  });
  if (error) {
    log("error", "generation_event_insert_failed", { error: error.message });
    return { ok: false, status: 500, error: "Couldn't record the event." };
  }
  return { ok: true };
}
/**
 * Record a dynamic create without failing the user's action. Scheduled with
 * after() when available so the response is not delayed. Errors are logged
 * and swallowed.
 */
export function tryRecordDynamicGeneration(input: {
  anonId: string | null | undefined;
  pagePath: unknown;
  codeId: string | null;
  userId: string | null;
  headers: { get(name: string): string | null };
  ip?: string | null;
}): void {
  const anonId = input.anonId;
  if (!isAnonId(anonId)) return;
  const work = async () => {
    try {
      const admin = createSupabaseAdminClient();
      const result = await recordGenerationEvent(admin, {
        anonId,
        codeKind: "dynamic",
        action: "generate",
        pagePath: input.pagePath,
        codeId: input.codeId,
        userId: input.userId,
        headers: input.headers,
        ip: input.ip,
      });
      if (!result.ok) {
        log("warn", "generation_event_dynamic_skipped", {
          status: result.status,
          error: result.error,
        });
      }
    } catch (error) {
      log("error", "generation_event_dynamic_threw", { error: String(error) });
    }
  };
  try {
    after(work);
  } catch {
    void work();
  }
}
