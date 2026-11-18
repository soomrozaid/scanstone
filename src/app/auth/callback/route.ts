import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { envServer } from "@/config/env.server";
import { safeNextPath } from "@/lib/checkout-intent";
import { onAuthComplete } from "@/lib/on-auth-complete";
import {
  isRecentSignup,
  storeSignupAttribution,
} from "@/lib/store-signup-attribution";

/** Exchanges the Supabase auth code (email confirm, magic link, reset) for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user) {
        await onAuthComplete(data.user.id);
        if (isRecentSignup(data.user.created_at)) {
          await storeSignupAttribution(data.user.id);
        }
      }
      return NextResponse.redirect(`${envServer.APP_URL}${next}`);
    }
  }

  return NextResponse.redirect(
    `${envServer.APP_URL}/login?error=Your+link+expired+or+was+already+used.+Try+again.`,
  );
}
