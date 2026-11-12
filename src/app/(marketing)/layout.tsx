import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MotionLayer } from "@/components/cinema/MotionLayer";
import { AnimGate } from "@/components/cinema/AnimGate";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
      <MotionLayer />
      <AnimGate />
    </>
  );
}
