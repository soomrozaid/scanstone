/**
 * Redirect lookup with one retry. A database error is not the same as a
 * missing code: a scanner should never be told a working code is gone
 * because of a brief outage.
 */

export type LookupResult<T> =
  | { kind: "found"; row: T }
  | { kind: "missing" }
  | { kind: "error"; error: string };

/** One attempt. Resolves to a row, null for "no such row", or throws/returns an error. */
export type LookupAttempt<T> = () => Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function lookupWithRetry<T>(
  attempt: LookupAttempt<T>,
  { retries = 1, delayMs = 150 }: { retries?: number; delayMs?: number } = {},
): Promise<LookupResult<T>> {
  let lastError = "unknown error";
  for (let i = 0; i <= retries; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs);
    try {
      const { data, error } = await attempt();
      if (error) {
        lastError = error.message;
        continue;
      }
      return data ? { kind: "found", row: data } : { kind: "missing" };
    } catch (e) {
      lastError = String(e);
    }
  }
  return { kind: "error", error: lastError };
}

export const TRY_AGAIN_RETRY_AFTER_SECONDS = 5;

export const TRY_AGAIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="${TRY_AGAIN_RETRY_AFTER_SECONDS}">
<title>Scan again in a moment | Scanstone</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f1ea;color:#1c1a17;font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px;box-sizing:border-box}
  main{max-width:26rem;background:#fbfaf6;border:1px solid #e2ddd2;border-radius:12px;padding:28px}
  h1{font-size:1.35rem;margin:0 0 10px}
  p{margin:0 0 12px;color:#4a463f}
  a{display:inline-block;margin-top:6px;background:#1c1a17;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:500}
  small{display:block;margin-top:18px;color:#7a756b}
</style>
</head>
<body>
<main>
<h1>Scan again in a moment</h1>
<p>This code is fine. We had a short problem on our side looking it up.</p>
<p>Scan it again in a few seconds, or tap the button below. This page also tries again on its own.</p>
<a href="">Try again</a>
<small>Scanstone</small>
</main>
</body>
</html>`;

/** HTTP 503 with Retry-After and no caching, so nothing stores the error. */
export function tryAgainResponse(): Response {
  return new Response(TRY_AGAIN_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": String(TRY_AGAIN_RETRY_AFTER_SECONDS),
      "cache-control": "no-store, max-age=0",
      "cdn-cache-control": "no-store",
      "vercel-cdn-cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
