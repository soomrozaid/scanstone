/** Client-side counters for the optional free-account prompt. */

export const GEN_COUNT_KEY = "ss_gen_count";
export const DISMISS_KEY = "ss_signin_prompt_dismissed";
export const SHOW_AFTER_GENERATIONS = 3;
export const RESHOW_AFTER_DAYS = 30;
export const RESHOW_AFTER_MORE_GENERATIONS = 20;
export const GENERATION_NOTED_EVENT = "ss:generation-noted";

export type DismissRecord = {
  at: number;
  count: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getLocalGenerationCount(): number {
  if (!canUseStorage()) return 0;
  try {
    const raw = window.localStorage.getItem(GEN_COUNT_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Count one completed generation on this browser. Never throws. */
export function noteLocalGeneration(): number {
  if (!canUseStorage()) return 0;
  try {
    const next = getLocalGenerationCount() + 1;
    window.localStorage.setItem(GEN_COUNT_KEY, String(next));
    window.dispatchEvent(new CustomEvent(GENERATION_NOTED_EVENT, { detail: next }));
    return next;
  } catch {
    return 0;
  }
}

export function readDismissRecord(): DismissRecord | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DismissRecord>;
    if (typeof parsed.at !== "number" || typeof parsed.count !== "number") return null;
    return { at: parsed.at, count: parsed.count };
  } catch {
    return null;
  }
}

export function dismissSignInPrompt(): void {
  if (!canUseStorage()) return;
  try {
    const record: DismissRecord = {
      at: Date.now(),
      count: getLocalGenerationCount(),
    };
    window.localStorage.setItem(DISMISS_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event(GENERATION_NOTED_EVENT));
  } catch {
    // Ignore storage failures; the prompt may reappear, which is harmless.
  }
}

/**
 * Show after about 3 generations, unless the visitor already dismissed it.
 * After dismissal, wait 30 days or 20 more generations before showing again.
 */
export function shouldShowSignInPrompt(
  count = getLocalGenerationCount(),
  dismissed = readDismissRecord(),
  now = Date.now(),
): boolean {
  if (count < SHOW_AFTER_GENERATIONS) return false;
  if (!dismissed) return true;
  const days = (now - dismissed.at) / (1000 * 60 * 60 * 24);
  const more = count - dismissed.count;
  return days >= RESHOW_AFTER_DAYS || more >= RESHOW_AFTER_MORE_GENERATIONS;
}
