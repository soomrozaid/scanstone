import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ANON_ID_COOKIE, isAnonId } from "@/lib/anon-id";
import { parseFeedback } from "@/lib/feedback";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

const IP_LIMIT = 10;
const IP_WINDOW_SECONDS = 60 * 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Honeypot: real people never fill the hidden "website" field. Pretend it worked.
  if (body && typeof body === "object" && (body as { website?: unknown }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseFeedback(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const jar = await cookies();
  const cookieId = jar.get(ANON_ID_COOKIE)?.value;
  const bodyId = (body as { anon_id?: unknown }).anon_id;
  const anonId = isAnonId(cookieId) ? cookieId : isAnonId(bodyId) ? bodyId : null;

  const headerList = await headers();
  const ip =
    (headerList.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ||
    "unknown";
  const userAgent = (headerList.get("user-agent") ?? "").slice(0, 512) || null;

  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Feedback isn't available in this environment." },
      { status: 503 },
    );
  }

  // The IP is only a rate-limit key. It is never stored on the row.
  const { data: allowed, error: limitError } = await admin.rpc("hit_rate_limit", {
    p_key: `feedback:ip:${ip}`,
    p_max: IP_LIMIT,
    p_window_seconds: IP_WINDOW_SECONDS,
  });
  if (limitError) {
    log("warn", "feedback_rate_limit_failed", { error: limitError.message });
  } else if (allowed !== true) {
    return NextResponse.json(
      { error: "Thanks, we have plenty from you for now. Try again later." },
      { status: 429 },
    );
  }

  const { error } = await admin.from("feedback").insert({
    ...parsed.row,
    anon_id: anonId,
    user_id: userId,
    user_agent: userAgent,
  });
  if (error) {
    log("error", "feedback_insert_failed", { error: error.message });
    return NextResponse.json(
      { error: "That didn't send. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
