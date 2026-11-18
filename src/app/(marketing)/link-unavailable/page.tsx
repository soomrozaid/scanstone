import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "This link is no longer available",
  robots: { index: false },
};

export default function LinkUnavailablePage() {
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="engraved text-3xl font-semibold">
        This link is no longer available
      </h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        This short link was turned off, so it no longer sends people to a
        destination. If you made it, you can create a new one from the
        homepage, and a free account lets you keep it and change where it
        points.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/#short-link" variant="accent">
          Make a short link
        </ButtonLink>
        <ButtonLink href="/signup" variant="ghost">
          Create a free account
        </ButtonLink>
      </div>
    </main>
  );
}
