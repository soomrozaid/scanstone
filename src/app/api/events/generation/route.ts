import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ANON_ID_COOKIE, isAnonId } from "@/lib/anon-id";
import { recordGenerationEvent } from "@/lib/generation-events";

export const dynamic = "force-dynamic";

type Body = {
  anon_id?: unknown;
  code_kind?: unknown;
  action?: unknown;
  page_path?: unknown;
  code_id?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const jar = await cookies();
  const cookieId = jar.get(ANON_ID_COOKIE)?.value;
  const anonId = isAnonId(cookieId)
    ? cookieId
    : isAnonId(body.anon_id)
      ? body.anon_id
      : null;
  if (!anonId) {
    return NextResponse.json({ error: "Missing identifier." }, { status: 400 });
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = (forwarded ?? "unknown").split(",")[0]?.trim() || "unknown";

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
      { error: "Events aren't available in this environment." },
      { status: 503 },
    );
  }

  // The public route only records static events. Dynamic creates are
  // written from the server action that minted the code. Context fields
  // come from the request, never from the body. The IP is only a rate-limit key.
  if (body.code_kind !== "static") {
    return NextResponse.json({ error: "Invalid code kind." }, { status: 400 });
  }
  if (body.action !== "generate" && body.action !== "download") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const result = await recordGenerationEvent(admin, {
    anonId,
    codeKind: "static",
    action: body.action,
    pagePath: body.page_path,
    codeId: null,
    userId,
    headers: headerList,
    ip,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
