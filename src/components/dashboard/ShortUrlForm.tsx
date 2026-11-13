"use client";

import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { createShortUrl } from "@/app/(app)/dashboard/actions";
import { Button, FieldError, Input, Label } from "@/components/ui";
import {
  clearPendingDestination,
  readPendingDestination,
} from "@/lib/pending-destination";

const emptySubscribe = () => () => {};

export function ShortUrlForm({ initialUrl = "" }: { initialUrl?: string }) {
  const [state, action, pending] = useActionState(createShortUrl, null);
  const storedUrl = useSyncExternalStore(
    emptySubscribe,
    () => (initialUrl ? "" : (readPendingDestination()?.url ?? "")),
    () => "",
  );
  const [destination, setDestination] = useState<string | null>(
    initialUrl || null,
  );
  const value = destination ?? storedUrl;

  useEffect(() => {
    if (value) clearPendingDestination();
  }, [value]);

  return (
    <form action={action} className="space-y-6">
      <div>
        <Label htmlFor="destination_url">Destination URL</Label>
        <Input
          id="destination_url"
          name="destination_url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="example.com/your-long-link"
          value={value}
          onChange={(event) => setDestination(event.target.value)}
          maxLength={2048}
          required
          aria-describedby="destination-hint"
        />
        <p id="destination-hint" className="mt-1.5 text-xs text-ink-faint">
          Paste a link. You can change its destination later.
        </p>
      </div>
      <div>
        <Label htmlFor="name">Name (optional)</Label>
        <Input
          id="name"
          name="name"
          placeholder="Summer campaign"
          maxLength={80}
          aria-describedby="name-hint"
        />
        <p id="name-hint" className="mt-1.5 text-xs text-ink-faint">
          Only you see this. Leave it blank to use the website name.
        </p>
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Shortening…" : "Create short URL"}
      </Button>
    </form>
  );
}
