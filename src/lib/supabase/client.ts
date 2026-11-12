"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envClient } from "@/config/env.client";

export function createSupabaseBrowserClient() {
  const url = envClient.SUPABASE_URL;
  const key = envClient.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase public environment is not configured for this deployment",
    );
  }
  return createBrowserClient(url, key);
}
