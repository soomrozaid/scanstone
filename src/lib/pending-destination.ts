export const PENDING_DESTINATION_KEY = "scanstone:pending-destination";
export const PENDING_KIND_KEY = "scanstone:pending-kind";

export type PendingKind = "link" | "code";

export type PendingDestination = {
  url: string;
  kind: PendingKind;
};

export function rememberPendingDestination(url: string, kind: PendingKind) {
  try {
    sessionStorage.setItem(PENDING_DESTINATION_KEY, url);
    sessionStorage.setItem(PENDING_KIND_KEY, kind);
  } catch {
    // Private mode or disabled storage should not break the tool.
  }
}

export function readPendingDestination(): PendingDestination | null {
  try {
    const url = sessionStorage.getItem(PENDING_DESTINATION_KEY)?.trim() ?? "";
    const kind = sessionStorage.getItem(PENDING_KIND_KEY);
    if (!url) return null;
    if (kind !== "link" && kind !== "code") return { url, kind: "link" };
    return { url, kind };
  } catch {
    return null;
  }
}

export function clearPendingDestination() {
  try {
    sessionStorage.removeItem(PENDING_DESTINATION_KEY);
    sessionStorage.removeItem(PENDING_KIND_KEY);
  } catch {
    // ignore
  }
}
