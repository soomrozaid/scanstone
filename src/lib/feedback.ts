import { sanitizePagePath } from "@/lib/anon-id";

export const FEEDBACK_REACTIONS = ["good", "okay", "bad"] as const;
export type FeedbackReaction = (typeof FEEDBACK_REACTIONS)[number];

/** Tappable "what should we change" chips in the dashboard Feedback panel. */
export const FEEDBACK_TOPICS = [
  { id: "designs", label: "More code designs" },
  { id: "editing", label: "Easier editing" },
  { id: "stats", label: "Better scan stats" },
  { id: "free_codes", label: "More free codes" },
  { id: "speed", label: "Faster" },
  { id: "broken", label: "Something broke" },
] as const;
export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number]["id"];
const TOPIC_IDS: readonly string[] = FEEDBACK_TOPICS.map((t) => t.id);

export const FEEDBACK_MESSAGE_MAX = 1000;

export type FeedbackRow = {
  reaction: FeedbackReaction | null;
  topics: FeedbackTopic[];
  message: string | null;
  page_path: string;
};

/** Validates a feedback body from the browser. The user, email and agent are added by the route from the session. */
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

  let topics: FeedbackTopic[] = [];
  if (b.topics != null) {
    if (!Array.isArray(b.topics) || b.topics.some((t) => typeof t !== "string" || !TOPIC_IDS.includes(t))) {
      return { ok: false, error: "Invalid topic." };
    }
    topics = [...new Set(b.topics as FeedbackTopic[])];
  }

  const rawMessage = typeof b.message === "string" ? b.message.trim() : "";
  if (rawMessage.length > FEEDBACK_MESSAGE_MAX) {
    return { ok: false, error: `Keep it under ${FEEDBACK_MESSAGE_MAX} characters.` };
  }
  const message = rawMessage || null;

  if (!reaction && topics.length === 0 && !message) {
    return { ok: false, error: "Pick a face or tap what to change." };
  }

  return {
    ok: true,
    row: { reaction, topics, message, page_path: sanitizePagePath(b.page_path) },
  };
}
