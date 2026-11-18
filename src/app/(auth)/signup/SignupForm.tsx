"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "../actions";
import { Button, Input, Label, FieldError } from "@/components/ui";
import type { ProInterval } from "@/lib/checkout-intent";

export function SignupForm({ plan }: { plan?: ProInterval | null }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  if (state?.message) {
    return (
      <p
        role="status"
        className="rounded-md border border-verdigris/30 bg-verdigris/10 p-4 text-sm text-verdigris-deep"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {plan ? <input type="hidden" name="plan" value={plan} /> : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1.5 text-xs text-ink-faint">At least 8 characters.</p>
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Creating account…"
          : plan
            ? "Create account and continue to checkout"
            : "Create account"}
      </Button>
      <p className="text-center text-xs text-ink-faint">
        By signing up you agree to the{" "}
        <a href="/terms" className="underline">
          terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
