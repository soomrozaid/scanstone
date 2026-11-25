import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { limitsFor } from "@/lib/plans";
import { getShortUrl } from "@/lib/short-url";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { QRPreview } from "@/components/qr/QRPreview";
import { designSchema } from "@/lib/validate";
import { CopyUrlButton } from "@/components/dashboard/CopyUrlButton";
import { PendingDestinationBanner } from "@/components/dashboard/PendingDestinationBanner";

export const metadata: Metadata = {
  title: "Your codes & links",
  robots: { index: false },
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: codes }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("qr_codes")
      .select("id, slug, name, destination_url, design, scan_count, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const limits = limitsFor(profile?.plan);
  const used = codes?.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="engraved text-3xl font-semibold">
            Your codes &amp; links
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {used} of {limits.maxCodes} codes and short URLs ·{" "}
            <span className="text-verdigris-deep">
              redirects never expire, whatever your plan
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/static" variant="ghost">
            + Static QR code
          </ButtonLink>
          <ButtonLink href="/dashboard/shorten" variant="ghost">
            + New short URL
          </ButtonLink>
          <ButtonLink href="/dashboard/new" variant="accent">
            + New dynamic code
          </ButtonLink>
        </div>
      </div>

      <PendingDestinationBanner />

      {used > limits.maxCodes ? (
        <Card className="mt-6 border-copper/40 p-4 sm:p-5">
          <p className="text-sm font-medium">You have more links than your plan includes</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Guest links you saved put you over the free plan&apos;s {limits.maxCodes}{" "}
            codes. They keep working, but destinations are read-only until you
            delete one or upgrade to Pro.
          </p>
        </Card>
      ) : null}

      {used === 0 ? (
        <Card className="mt-8 p-6 text-center sm:p-10">
          <div className="mx-auto max-w-md">
            <h2 className="engraved text-xl font-semibold">
              Create your first code or short URL
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Share a short link or print a QR code for a menu, a booking page,
              or a portfolio, then change the destination any time. Your link
              and printed code keep working.
            </p>
          </div>
          <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {[
              {
                href: "/dashboard/new",
                label: "Create a dynamic code",
                body: `A QR code you can point somewhere else after you print it. Uses 1 of your ${limits.maxCodes}.`,
                accent: true,
              },
              {
                href: "/dashboard/shorten",
                label: "Create a short URL",
                body: `A scst.one link to share or type. You can change where it goes. Uses 1 of your ${limits.maxCodes}.`,
                accent: false,
              },
              {
                href: "/dashboard/static",
                label: "Make a static QR code",
                body: "The link sits inside the pattern, so it can't be edited later. Free, unlimited, not saved here.",
                accent: false,
              },
            ].map((o) => (
              <li key={o.href} className="flex flex-col rounded-2xl border border-line p-4">
                <p className="text-sm leading-relaxed text-ink-soft">{o.body}</p>
                <div className="mt-auto pt-4">
                  <ButtonLink
                    href={o.href}
                    variant={o.accent ? undefined : "ghost"}
                    className="w-full"
                  >
                    {o.label}
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {codes?.map((code) => {
            const design = designSchema.parse(code.design ?? {});
            const shortUrl = getShortUrl(code.slug);
            return (
              <li key={code.id}>
                <Card className="p-4 transition-shadow hover:shadow-lg">
                  <Link
                    href={`/dashboard/codes/${code.id}`}
                    className="flex gap-4"
                  >
                    <div className="w-20 shrink-0">
                      <QRPreview data={shortUrl} options={design} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{code.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">
                        {code.destination_url}
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-ink-soft">
                        {shortUrl.replace(/^https?:\/\//, "")}
                      </p>
                      <div className="mt-2">
                        <Badge tone="green">
                          {code.scan_count} scans &amp; clicks
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-4">
                    <CopyUrlButton url={shortUrl} />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {used >= limits.maxCodes && limits.maxCodes <= 3 ? (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 border-copper/40 bg-copper/5 p-5">
          <p className="text-sm text-ink-soft">
            You&apos;ve used all {limits.maxCodes} free codes and short URLs.
            Pro raises the limit to 500, and your existing links keep working
            either way.
          </p>
          <ButtonLink href="/account#upgrade" variant="accent">
            Upgrade to Pro
          </ButtonLink>
        </Card>
      ) : null}
    </div>
  );
}
