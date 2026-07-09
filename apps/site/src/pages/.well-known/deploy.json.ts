import { env } from "cloudflare:workers";

export const prerender = false;

export function GET() {
  return Response.json(
    {
      deployId: env.DEPLOY_ID ?? null,
      gitSha: env.GIT_SHA ?? null,
      source: env.DEPLOY_SOURCE ?? null,
      deployedAt: env.DEPLOYED_AT ?? null,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
