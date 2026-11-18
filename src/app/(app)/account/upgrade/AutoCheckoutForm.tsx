"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import type { ProInterval } from "@/lib/checkout-intent";

/** Submits once on load; the button stays as a fallback if that is blocked. */
export function AutoCheckoutForm({ interval }: { interval: ProInterval }) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form
      ref={formRef}
      action="/api/stripe/checkout"
      method="POST"
      className="mt-5"
    >
      <input type="hidden" name="interval" value={interval} />
      <Button type="submit" variant="accent" className="w-full">
        Continue to checkout
      </Button>
    </form>
  );
}
