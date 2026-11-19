import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseFeedback } from "@/lib/feedback";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

const USER_LIMIT = 20;
const WINDOW_SECONDS = 60 * 60;

/** Feedback from the dashboard tab. Signed-in users only; who sent it comes from the session. */
export async function POST(request: Request) {
  let user: { id: string; email?: string | null } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }
  if (!user) {
    return NextResponse.json({ error: "Sign in to send feedback." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseFeedback(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const headerList = await headers();
  const userAgent = (headerList.get("user-agent") ?? "").slice(0, 512) || null;

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Feedback isn't available in this environment." },
      { status: 503 },
    );
  }

  const { data: allowed, error: limitError } = await admin.rpc("hit_rate_limit", {
    p_key: `feedback:user:${user.id}`,
    p_max: USER_LIMIT,
    p_window_seconds: WINDOW_SECONDS,
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
    user_id: user.id,
    email: user.email?.slice(0, 254) ?? null,
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
