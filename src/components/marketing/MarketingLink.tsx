"use client";

import { track } from "@vercel/analytics";
import { ButtonLink } from "@/components/ui";
import type { ComponentProps } from "react";

export function MarketingLink({
  placement,
  action,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, "onClick"> & {
  placement: "home_hero" | "restaurant_hero";
  action: "signup" | "demo" | "static_generator";
}) {
  return (
    <ButtonLink
      {...props}
      onClick={() => track("marketing_cta_clicked", { placement, action })}
    />
  );
}
