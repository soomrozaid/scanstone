import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MotionLayer } from "@/components/cinema/MotionLayer";

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
    </>
  );
}
