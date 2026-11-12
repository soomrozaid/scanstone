import "server-only";
import Stripe from "stripe";
import { envServer } from "@/config/env.server";

let client: Stripe | undefined;

/** Stripe SDK client, created on first use so Preview builds can import this module. */
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(envServer.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const value = Reflect.get(getStripe(), prop, getStripe());
    return typeof value === "function" ? value.bind(getStripe()) : value;
  },
});

export function isLiveMode(): boolean {
  return envServer.STRIPE_SECRET_KEY.includes("_live_");
}
