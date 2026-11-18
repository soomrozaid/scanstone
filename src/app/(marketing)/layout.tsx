import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MotionLayer } from "@/components/cinema/MotionLayer";
import { AnimGate } from "@/components/cinema/AnimGate";
import { PhoneHandoff } from "@/components/cinema/PhoneHandoff";
import { SignInPrompt } from "@/components/marketing/SignInPrompt";
import { getUser } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let signedIn = false;
  try {
    signedIn = Boolean(await getUser());
  } catch {
    signedIn = false;
  }
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
      <MotionLayer />
      <AnimGate />
      <PhoneHandoff />
      <SignInPrompt signedIn={signedIn} />
    </>
  );
}
