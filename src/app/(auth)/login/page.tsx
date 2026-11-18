import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseProInterval, safeNextPath, upgradePath } from "@/lib/checkout-intent";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const plan = parseProInterval(params.plan);
  const next = safeNextPath(params.next);

  if (plan) {
    let signedIn = false;
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      signedIn = Boolean(user);
    } catch (e) {
      unstable_rethrow(e);
      // A failed session check just means we show the form.
    }
    if (signedIn) redirect(upgradePath(plan));
  }

  const signupParams = new URLSearchParams();
  if (plan) signupParams.set("plan", plan);
  if (next !== "/dashboard") signupParams.set("next", next);
  const signupQuery = signupParams.toString();
  const signupHref = signupQuery ? `/signup?${signupQuery}` : "/signup";

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        plan
          ? "Log in and you go straight to checkout for Pro."
          : "Log in to manage your codes."
      }
      footer={
        <>
          New here?{" "}
          <Link
            href={signupHref}
            className="font-medium text-verdigris-deep underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={params.next} plan={plan} urlError={params.error} />
    </AuthShell>
  );
}
