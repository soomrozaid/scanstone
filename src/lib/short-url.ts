import { envClient } from "@/config/env.client";

/** A dedicated domain uses /slug; older app-domain /r/slug URLs still work. */
export function getShortUrl(slug: string): string {
  const origin = envClient.SHORT_URL_ORIGIN;
  const base = (origin ?? envClient.APP_URL).replace(/\/+$/, "");
  return `${base}${origin ? "" : "/r"}/${slug}`;
}
