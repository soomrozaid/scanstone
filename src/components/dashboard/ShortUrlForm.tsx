"use client";

import { useActionState } from "react";
import { createShortUrl } from "@/app/(app)/dashboard/actions";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function ShortUrlForm() {
  const [state, action, pending] = useActionState(createShortUrl, null);

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
