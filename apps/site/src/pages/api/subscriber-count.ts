import { env } from "cloudflare:workers";
import type { APIContext } from "astro";

export const prerender = false;

const LIST_API_URL_DEFAULT = "https://list.ian.is";
const CACHE_CONTROL =
  "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";
const VARY =
  "Origin, Referer, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest";

function json(data: unknown, status: number, cacheControl = "no-store") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": cacheControl,
      "content-type": "application/json",
      vary: VARY,
      "x-content-type-options": "nosniff",
    },
  });
}

function isTrustedRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "same-site" &&
    fetchSite !== "none"
  ) {
    return false;
  }

  const fetchMode = request.headers.get("sec-fetch-mode");
  if (fetchMode && fetchMode !== "cors" && fetchMode !== "same-origin") {
    return false;
  }

  const fetchDest = request.headers.get("sec-fetch-dest");
  if (fetchDest && fetchDest !== "empty") return false;

  for (const name of ["origin", "referer"]) {
    const value = request.headers.get(name);
    if (!value) continue;

    try {
      if (new URL(value).origin !== new URL(request.url).origin) return false;
    } catch {
      return false;
    }
  }

  return true;
}

export async function GET({ request }: APIContext) {
  if (!isTrustedRequest(request)) return json({ error: "Not found" }, 404);

  const token = env.LIST_API_TOKEN;
  if (!token) return json({ error: "Subscriber count is not configured." }, 503);

  try {
    const upstream = await fetch(
      new URL(
        "/api/subscribers/count",
        env.LIST_API_URL ?? LIST_API_URL_DEFAULT,
      ),
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token}`,
        },
        redirect: "manual",
      },
    );

    if (!upstream.ok) {
      await upstream.body?.cancel();
      console.error("newsletter subscriber count failed", {
        status: upstream.status,
      });
      return json({ error: "Subscriber count is unavailable." }, 502);
    }

    const result = (await upstream.json()) as { count?: unknown };
    const count = result.count;
    if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
      return json({ error: "Subscriber count is unavailable." }, 502);
    }

    return json({ count }, 200, CACHE_CONTROL);
  } catch {
    return json({ error: "Subscriber count is unavailable." }, 502);
  }
}
