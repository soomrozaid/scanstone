import { RouteCurtain } from "@/components/cinema/RouteCurtain";

/** Re-mounts on every marketing route change, which drives the curtain wipe. */
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <RouteCurtain>{children}</RouteCurtain>;
}
