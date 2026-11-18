import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "./SignupForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/plans";
import { parseProInterval, upgradePath } from "@/lib/checkout-intent";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const plan = parseProInterval(params.plan);

  if (plan) {
    // Already signed in: skip signup and go straight to checkout.
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

  const loginHref = plan ? `/login?plan=${plan}` : "/login";

  return (
    <AuthShell
      title={plan ? "Create your account to go Pro" : "Create your account"}
      subtitle={
        plan
          ? `You picked Pro ${plan} (${PRICING[plan].label}). Create your account first, then you go straight to secure checkout with Stripe. If you cancel later, your codes keep working.`
          : "Free, no card needed. Includes 3 short links or editable QR codes, and your redirects keep working even if you never upgrade."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-medium text-verdigris-deep underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm plan={plan} />
    </AuthShell>
  );
}
