import type { Metadata } from "next";
import { CodeForm } from "@/components/dashboard/CodeForm";
import { validateDestinationUrl } from "@/lib/validate";

export const metadata: Metadata = {
  title: "New dynamic code",
  robots: { index: false },
};

function prefillUrl(raw?: string) {
  if (!raw) return "";
  const dest = validateDestinationUrl(raw);
  return dest.ok ? dest.url : "";
}

export default async function NewCodePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="engraved text-3xl font-semibold">New dynamic code</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The printed code never changes. The destination is yours to edit,
        forever.
      </p>
      <div className="mt-8">
        <CodeForm mode="create" initialDestination={prefillUrl(url)} />
      </div>
    </div>
  );
}
