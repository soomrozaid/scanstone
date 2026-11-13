"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink, Card } from "@/components/ui";
import { readPendingDestination } from "@/lib/pending-destination";

const emptySubscribe = () => () => {};
const readClient = () => readPendingDestination();
const readServer = () => null;

export function PendingDestinationBanner() {
  const pending = useSyncExternalStore(emptySubscribe, readClient, readServer);

  if (!pending) return null;

  const href =
    pending.kind === "code"
      ? `/dashboard/new?url=${encodeURIComponent(pending.url)}`
      : `/dashboard/shorten?url=${encodeURIComponent(pending.url)}`;

  return (
    <Card className="mt-6 p-4 sm:p-5">
      <p className="text-sm font-medium">
        Finish what you started on the homepage
      </p>
      <p className="mt-1 break-all text-sm text-ink-soft">{pending.url}</p>
      <ButtonLink href={href} variant="accent" className="mt-3">
        {pending.kind === "code"
          ? "Save as an editable code"
          : "Save as a short link"}
      </ButtonLink>
    </Card>
  );
}
