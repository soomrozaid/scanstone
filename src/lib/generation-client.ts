"use client";

import { useEffect, useRef } from "react";
import { getOrCreateAnonId } from "@/lib/anon-id-client";
import type { GenerationAction, GenerationKind } from "@/lib/generation-types";
import { noteLocalGeneration } from "@/lib/signin-prompt-state";

const GENERATE_DEBOUNCE_MS = 800;

export async function reportGenerationEvent(input: {
  codeKind: GenerationKind;
  action: GenerationAction;
}): Promise<void> {
  const anon_id = getOrCreateAnonId();
  if (!anon_id) return;
  if (input.action === "generate") noteLocalGeneration();
  try {
    await fetch("/api/events/generation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        anon_id,
        code_kind: input.codeKind,
        action: input.action,
        page_path: window.location.pathname,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt the tool.
  }
}

/**
 * For static codes: count at most one generate event per distinct payload
 * per page view (debounced so live preview while typing is not counted per
 * keystroke). Downloads are recorded separately by calling recordDownload.
 * The payload itself is never sent to the server.
 */
export function useStaticGenerationEvents(payload: string, ready: boolean) {
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!ready || !payload) return;
    const timer = window.setTimeout(() => {
      if (seen.current.has(payload)) return;
      seen.current.add(payload);
      void reportGenerationEvent({ codeKind: "static", action: "generate" });
    }, GENERATE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [payload, ready]);

  return {
    recordDownload() {
      void reportGenerationEvent({ codeKind: "static", action: "download" });
    },
  };
}
