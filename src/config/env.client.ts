import { z } from "zod";

/**
 * Allowlisted public configuration. Values are inlined at build time from the
 * canonical env vars via the adapter block in next.config.ts. Only values that
 * are safe to ship to every browser belong here.
 *
 * APP_URL is required at build time (root layout metadata). Supabase and Stripe
 * publishable values are optional so Preview builds can succeed when those
 * credentials have not been copied into the Preview environment. Call sites
 * that need them (the browser Supabase client) validate at use time.
 */
const clientSchema = z.object({
  APP_URL: z.string().url(),
  SHORT_URL_ORIGIN: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
});

const parsed = clientSchema.safeParse({
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SHORT_URL_ORIGIN: process.env.NEXT_PUBLIC_SHORT_URL_ORIGIN || undefined,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined,
});

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid public environment — ${missing}`);
}

export const envClient = parsed.data;
