/**
 * Reads optional Vercel domain-API credentials. Kept free of `server-only`
 * so unit tests can cover the "missing token, Preview still builds" case.
 */
export interface VercelDomainConfig {
  token: string;
  projectId: string;
  teamId: string;
}

export function readVercelDomainConfig(
  env: NodeJS.Dict<string> = process.env,
): VercelDomainConfig | null {
  const token = env.VERCEL_API_TOKEN?.trim();
  const projectId = (env.VERCEL_PROJECT_ID ?? "").trim();
  const teamId = (env.VERCEL_TEAM_ID ?? env.VERCEL_ORG_ID ?? "").trim();
  if (!token || !projectId || !teamId) return null;
  return { token, projectId, teamId };
}
