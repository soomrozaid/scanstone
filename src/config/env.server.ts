import "server-only";
import { z } from "zod";

/**
 * Canonical server environment. The only place server code may read
 * process.env. Values here must NEVER reach the browser.
 *
 * Parsed on first access, not at import time, so `next build` can collect
 * route modules in Preview when Stripe/Supabase secrets are not set.
 * Request handlers still fail fast if a required value is missing.
 */
const serverSchema = z.object({
  APP_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SECRET_KEY: z.string().min(20),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_SECRET_KEY: z
    .string()
    .refine((v) => v.startsWith("sk_") || v.startsWith("rk_"), {
      message: "STRIPE_SECRET_KEY must be an sk_ or rk_ key",
    }),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_MONTHLY_PRICE_ID: z.string().startsWith("price_"),
  STRIPE_YEARLY_PRICE_ID: z.string().startsWith("price_"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

function readServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    APP_URL: process.env.APP_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID,
    STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid server environment — ${missing}`);
  }

  return parsed.data;
}

let cached: ServerEnv | undefined;

export function getEnvServer(): ServerEnv {
  if (!cached) cached = readServerEnv();
  return cached;
}

export const envServer: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    if (typeof prop !== "string") return undefined;
    return getEnvServer()[prop as keyof ServerEnv];
  },
});
