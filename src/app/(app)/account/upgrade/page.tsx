import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/plans";
import { parseProInterval } from "@/lib/checkout-intent";
import { Card } from "@/components/ui";
import { AutoCheckoutForm } from "./AutoCheckoutForm";

export const metadata: Metadata = {
  title: "Continue to checkout",
  robots: { index: false },
};

/**
 * Landing spot after signup or login when the visitor picked Pro on /pricing.
 * Posts to the existing /api/stripe/checkout route, so the checkout logic
 * itself is unchanged.
 */
export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const plan = parseProInterval(params.plan);
  if (!plan) redirect("/account");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?plan=${plan}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (profile?.plan === "pro") redirect("/account");

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="engraved text-2xl font-semibold">
          Taking you to checkout
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Pro {plan}, {PRICING[plan].label}. Payment is handled by Stripe. If
          you cancel later, your codes and short links keep working.
        </p>
        <AutoCheckoutForm interval={plan} />
        <p className="mt-4 text-xs text-ink-faint">
          Changed your mind?{" "}
          <Link href="/dashboard" className="underline">
            Go to your dashboard
          </Link>{" "}
          and stay on Free.
        </p>
      </Card>
    </div>
  );
}
