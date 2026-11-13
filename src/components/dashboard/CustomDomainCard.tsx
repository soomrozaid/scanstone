"use client";

import { useActionState } from "react";
import {
  addCustomDomain,
  verifyCustomDomain,
  removeCustomDomain,
  type DomainActionState,
} from "@/app/(app)/account/domain-actions";
import { Button, Input, Label, FieldError, Card, Badge } from "@/components/ui";

export interface CustomDomainView {
  id: string;
  hostname: string;
  status: "pending" | "verified" | "failed";
  dns_records: Array<{ type: string; name: string; value: string }>;
  verified_at: string | null;
}

export function CustomDomainCard({
  isPro,
  domain,
}: {
  isPro: boolean;
  domain: CustomDomainView | null;
}) {
  return (
    <Card className="p-6">
      <h2 className="font-medium">Custom domain</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Point a domain you own, like qr.theircafe.com, at Scanstone. Your codes
        then redirect through that domain, and they keep working on scst.one as
        well.
      </p>
      {!isPro && !domain ? <FreePrompt /> : null}
      {isPro && !domain ? <AddForm /> : null}
      {domain ? <ManageDomain isPro={isPro} domain={domain} /> : null}
    </Card>
  );
}

function FreePrompt() {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-ink-soft">
        Custom domains are included with Pro.
      </p>
      <a
        href="/account#upgrade"
        className="inline-block text-sm text-verdigris-deep underline"
      >
        Upgrade to Pro
      </a>
    </div>
  );
}

function AddForm() {
  const [state, action, pending] = useActionState<DomainActionState, FormData>(
    addCustomDomain,
    null,
  );
  return (
    <form action={action} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="hostname">Your domain</Label>
        <Input
          id="hostname"
          name="hostname"
          placeholder="qr.theircafe.com"
          autoComplete="off"
          spellCheck={false}
          required
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Adding…" : "Add domain"}
      </Button>
    </form>
  );
}

function ManageDomain({
  isPro,
  domain,
}: {
  isPro: boolean;
  domain: CustomDomainView;
}) {
  const [verifyState, verifyAction, verifyPending] = useActionState<
    DomainActionState,
    FormData
  >(verifyCustomDomain, null);
  const tone =
    domain.status === "verified"
      ? "green"
      : domain.status === "failed"
        ? "copper"
        : "neutral";
  const label =
    domain.status === "verified"
      ? "Verified"
      : domain.status === "failed"
        ? "Check failed"
        : "Waiting for DNS";

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-ink">{domain.hostname}</p>
        <Badge tone={tone}>{label}</Badge>
      </div>

      {domain.status === "verified" ? (
        <p className="text-sm text-ink-soft">
          Your codes also work at{" "}
          <span className="font-mono">https://{domain.hostname}/</span> followed
          by the code&apos;s short name. Print that URL if you want the redirect
          to live on a domain you own.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            Add these records at the place you manage DNS for this domain, then
            click check DNS. It can take a few minutes to update.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-faint">
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {domain.dns_records.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2 text-ink-soft">
                      Records will appear here once the domain is added.
                    </td>
                  </tr>
                ) : (
                  domain.dns_records.map((record, index) => (
                    <tr
                      key={`${record.type}-${record.name}-${index}`}
                      className="border-b border-line/60"
                    >
                      <td className="py-2 pr-3 font-mono">{record.type}</td>
                      <td className="py-2 pr-3 font-mono break-all">
                        {record.name}
                      </td>
                      <td className="py-2 font-mono break-all">
                        {record.value}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isPro ? (
        <form action={verifyAction}>
          <input type="hidden" name="id" value={domain.id} />
          <FieldError>{verifyState?.error}</FieldError>
          {verifyState?.ok ? (
            <p className="mb-2 text-sm text-verdigris-deep" role="status">
              Domain verified. You can use it on your codes now.
            </p>
          ) : null}
          {domain.status !== "verified" || verifyState?.error ? (
            <Button type="submit" variant="accent" disabled={verifyPending}>
              {verifyPending ? "Checking…" : "Check DNS"}
            </Button>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-ink-soft">
          This domain stays in place after a plan change. Upgrade to Pro to
          change or re-check it.
        </p>
      )}

      <form action={removeCustomDomain}>
        <input type="hidden" name="id" value={domain.id} />
        <Button type="submit" variant="ghost">
          Remove domain
        </Button>
      </form>
    </div>
  );
}
