import { sanitizePagePath } from "@/lib/anon-id";

export const FEEDBACK_REACTIONS = ["good", "okay", "bad"] as const;
export type FeedbackReaction = (typeof FEEDBACK_REACTIONS)[number];

export const FEEDBACK_MESSAGE_MAX = 1000;

export type FeedbackRow = {
  reaction: FeedbackReaction | null;
  message: string | null;
  email: string | null;
  page_path: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates a feedback body from the browser. Context fields (user, agent) are added by the route. */
export function parseFeedback(
  body: unknown,
): { ok: true; row: FeedbackRow } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body." };
  const b = body as Record<string, unknown>;

  const reaction =
    typeof b.reaction === "string" &&
    (FEEDBACK_REACTIONS as readonly string[]).includes(b.reaction)
      ? (b.reaction as FeedbackReaction)
      : null;
  if (b.reaction != null && b.reaction !== "" && !reaction) {
    return { ok: false, error: "Invalid reaction." };
  }

  const rawMessage = typeof b.message === "string" ? b.message.trim() : "";
  if (rawMessage.length > FEEDBACK_MESSAGE_MAX) {
    return { ok: false, error: `Keep it under ${FEEDBACK_MESSAGE_MAX} characters.` };
  }
  const message = rawMessage || null;

  const rawEmail = typeof b.email === "string" ? b.email.trim() : "";
  if (rawEmail && (rawEmail.length > 254 || !EMAIL_RE.test(rawEmail))) {
    return { ok: false, error: "That email doesn't look right." };
  }
  const email = rawEmail || null;

  if (!reaction && !message) {
    return { ok: false, error: "Pick a face or write a few words." };
  }

  return {
    ok: true,
    row: { reaction, message, email, page_path: sanitizePagePath(b.page_path) },
  };
}
