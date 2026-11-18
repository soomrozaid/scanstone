"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function CopyUrlButton({
  url,
  label = "Copy short URL",
}: {
  url: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );

  async function copy() {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={copy}
        disabled={status === "copying"}
      >
        {status === "copied"
          ? "Copied!"
          : status === "copying"
            ? "Copying…"
            : label}
      </Button>
      <p
        role="status"
        className={status === "error" ? "mt-2 text-xs text-danger" : "sr-only"}
      >
        {status === "error" ? (
          <>
            Couldn&apos;t copy automatically. Select the URL and copy it
            manually.
            <span className="mt-1 block break-all select-all font-mono">
              {url}
            </span>
          </>
        ) : status === "copied" ? (
          "URL copied to clipboard."
        ) : (
          ""
        )}
      </p>
    </div>
  );
}
