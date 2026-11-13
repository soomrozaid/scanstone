/**
 * Platform host lists derived from env. Used by the proxy and the redirect
 * route. Reads process.env directly so it can run in the Next.js proxy
 * (which is evaluated before the typed env modules).
 */

import { hostsFromOrigin } from "./hostname";

export function platformHostsFromEnv(env: NodeJS.Dict<string> = process.env): {
  appHosts: string[];
  shortHosts: string[];
} {
  const appHosts = hostsFromOrigin(env.APP_URL ?? env.NEXT_PUBLIC_APP_URL);
  const shortHosts = hostsFromOrigin(
    env.SHORT_URL_ORIGIN ?? env.NEXT_PUBLIC_SHORT_URL_ORIGIN,
  );
  return { appHosts, shortHosts };
}
