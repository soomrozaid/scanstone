import { Suspense } from "react";
import { SiteNav, SiteNavFallback } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MotionLayer } from "@/components/cinema/MotionLayer";
import { AnimGate } from "@/components/cinema/AnimGate";
import { PhoneHandoff } from "@/components/cinema/PhoneHandoff";
import { SignInPrompt } from "@/components/marketing/SignInPrompt";
import { getUser } from "@/lib/supabase/server";

async function SignInPromptWithAuth() {
  let signedIn = false;
  try {
    signedIn = Boolean(await getUser());
  } catch {
    signedIn = false;
  }
  return <SignInPrompt signedIn={signedIn} />;
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SiteNavFallback />}>
        <SiteNav />
      </Suspense>
      {children}
      <SiteFooter />
      <MotionLayer />
      <AnimGate />
      <PhoneHandoff />
      <Suspense fallback={null}>
        <SignInPromptWithAuth />
      </Suspense>
    </>
  );
}
