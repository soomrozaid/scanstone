import "server-only";
import { log } from "@/lib/log";
import {
  readVercelDomainConfig,
  type VercelDomainConfig,
} from "./vercel-config";

/**
 * Thin client for the Vercel project-domains API. Used only from server
 * actions when a Pro user adds, checks, or removes a hostname. Credentials
 * are optional at build time so Preview deploys keep working.
 */

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  reason?: string;
}

export interface VercelDomainState {
  name: string;
  apexName: string;
  verified: boolean;
  verification: DnsRecord[];
  recommended: DnsRecord[];
}

export class VercelDomainsNotConfiguredError extends Error {
  constructor() {
    super("Custom domains are not configured on this server yet.");
    this.name = "VercelDomainsNotConfiguredError";
  }
}

function requireConfig(): VercelDomainConfig {
  const config = readVercelDomainConfig();
  if (!config) throw new VercelDomainsNotConfiguredError();
  return config;
}

async function vercelFetch(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const config = requireConfig();
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set("teamId", config.teamId);
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { ok: response.ok, status: response.status, body };
}

function recordsFromVerification(raw: unknown): DnsRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const rec = item as Record<string, unknown>;
    const type = String(rec.type ?? "TXT");
    const name = String(rec.domain ?? rec.name ?? "");
    const value = String(rec.value ?? "");
    if (!name || !value) return [];
    return [
      {
        type,
        name,
        value,
        reason: typeof rec.reason === "string" ? rec.reason : undefined,
      },
    ];
  });
}

function recommendedFromConfig(
  hostname: string,
  apexName: string,
  configBody: unknown,
): DnsRecord[] {
  const isApex = hostname === apexName;
  const records: DnsRecord[] = [];
  const body = (configBody ?? {}) as Record<string, unknown>;

  if (isApex) {
    const ipv4 = Array.isArray(body.recommendedIPv4)
      ? body.recommendedIPv4
      : Array.isArray(body.configuredBy)
        ? []
        : [];
    const ips = ipv4.flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (entry && typeof entry === "object" && "value" in entry) {
        return [String((entry as { value: unknown }).value)];
      }
      return [];
    });
    // Vercel apex docs: 10.0.1.2 is the common Anycast A record when
    // the config payload is empty (for example on a fresh add).
    const values = ips.length ? ips : ["10.0.1.2"];
    for (const value of values) {
      records.push({ type: "A", name: hostname, value });
    }
  } else {
    const cname =
      (typeof body.recommendedCNAME === "string" && body.recommendedCNAME) ||
      "cname.vercel-dns.com";
    const label = hostname.slice(0, -(apexName.length + 1)) || hostname;
    records.push({ type: "CNAME", name: label, value: cname });
  }
  return records;
}

function stateFromDomain(
  domainBody: Record<string, unknown>,
  recommended: DnsRecord[],
): VercelDomainState {
  return {
    name: String(domainBody.name ?? ""),
    apexName: String(domainBody.apexName ?? domainBody.name ?? ""),
    verified: Boolean(domainBody.verified),
    verification: recordsFromVerification(domainBody.verification),
    recommended,
  };
}

export async function addProjectDomain(
  hostname: string,
): Promise<VercelDomainState> {
  const config = requireConfig();
  const added = await vercelFetch(
    `/v10/projects/${encodeURIComponent(config.projectId)}/domains`,
    { method: "POST", body: JSON.stringify({ name: hostname }) },
  );

  if (!added.ok && added.status !== 409) {
    const message = errorMessage(added.body) ?? "Couldn't add that domain.";
    log("error", "custom_domain_add_failed", {
      status: added.status,
      error: message,
    });
    throw new Error(message);
  }

  return getProjectDomain(hostname);
}

export async function getProjectDomain(
  hostname: string,
): Promise<VercelDomainState> {
  const config = requireConfig();
  const domain = await vercelFetch(
    `/v9/projects/${encodeURIComponent(config.projectId)}/domains/${encodeURIComponent(hostname)}`,
  );
  if (!domain.ok || !domain.body || typeof domain.body !== "object") {
    throw new Error(errorMessage(domain.body) ?? "Couldn't load that domain.");
  }
  const body = domain.body as Record<string, unknown>;
  const apexName = String(body.apexName ?? hostname);
  const configRes = await vercelFetch(
    `/v6/domains/${encodeURIComponent(hostname)}/config`,
  );
  const recommended = recommendedFromConfig(
    hostname,
    apexName,
    configRes.ok ? configRes.body : null,
  );
  return stateFromDomain(body, recommended);
}

export async function verifyProjectDomain(
  hostname: string,
): Promise<VercelDomainState> {
  const config = requireConfig();
  const verified = await vercelFetch(
    `/v9/projects/${encodeURIComponent(config.projectId)}/domains/${encodeURIComponent(hostname)}/verify`,
    { method: "POST" },
  );
  if (!verified.ok && verified.status !== 400) {
    throw new Error(
      errorMessage(verified.body) ?? "Couldn't check that domain yet.",
    );
  }
  // Re-read so we always return the same shape, including DNS records.
  return getProjectDomain(hostname);
}

export async function removeProjectDomain(hostname: string): Promise<void> {
  const config = requireConfig();
  const removed = await vercelFetch(
    `/v9/projects/${encodeURIComponent(config.projectId)}/domains/${encodeURIComponent(hostname)}`,
    { method: "DELETE" },
  );
  // 404 means it is already gone, which is the outcome we want.
  if (!removed.ok && removed.status !== 404) {
    log("error", "custom_domain_remove_failed", {
      status: removed.status,
      error: errorMessage(removed.body),
    });
    throw new Error(
      errorMessage(removed.body) ?? "Couldn't remove that domain.",
    );
  }
}

export function dnsRecordsFromState(state: VercelDomainState): DnsRecord[] {
  const records = [...state.recommended];
  for (const rec of state.verification) {
    const already = records.some(
      (r) =>
        r.type === rec.type && r.name === rec.name && r.value === rec.value,
    );
    if (!already) records.push(rec);
  }
  return records;
}

function errorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const rec = body as Record<string, unknown>;
  if (typeof rec.error === "object" && rec.error) {
    const err = rec.error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
  }
  if (typeof rec.message === "string") return rec.message;
  return null;
}
