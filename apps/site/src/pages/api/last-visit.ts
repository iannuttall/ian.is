import { env, waitUntil } from "cloudflare:workers";
import type { APIContext } from "astro";

export const prerender = false;

/**
 * GET /api/last-visit
 *
 * Returns where the previous visitor came from, then records the current
 * one. Only city and country are stored (from Cloudflare's request
 * geolocation), never an IP. Browsers call this after the page loads, so
 * crawlers never touch the database. Until the `last_visit` table exists
 * the route answers with nulls and the footer stays blank.
 */

type Visit = { city: string; country: string };

const VARY = "Origin, Referer, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
      vary: VARY,
      "x-content-type-options": "nosniff",
    },
  });
}

function isTrustedRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return false;
  }
  const fetchMode = request.headers.get("sec-fetch-mode");
  if (fetchMode && fetchMode !== "cors" && fetchMode !== "same-origin") {
    return false;
  }
  return true;
}

function currentVisit(request: Request): Visit | null {
  const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
  const city = typeof cf?.city === "string" ? cf.city.trim() : "";
  const country = typeof cf?.country === "string" ? cf.country.trim() : "";
  if (city && country) return { city, country };
  // Local dev has no geolocation; give the footer something to render.
  if (import.meta.env.DEV) return { city: "Localhost", country: "DEV" };
  return null;
}

export async function GET(context: APIContext) {
  const { request } = context;
  if (!isTrustedRequest(request)) {
    return json({ city: null, country: null }, 404);
  }

  const db = env.DB;
  if (!db) return json({ city: null, country: null });

  try {
    const previous = await db
      .prepare("SELECT city, country FROM last_visit WHERE id = 1")
      .first<Visit>();

    const now = currentVisit(request);
    const changed = now && (now.city !== previous?.city || now.country !== previous?.country);
    if (now && changed) {
      waitUntil(
        db
          .prepare(
            "INSERT INTO last_visit (id, city, country, seen_at) VALUES (1, ?1, ?2, datetime('now')) " +
              "ON CONFLICT (id) DO UPDATE SET city = excluded.city, country = excluded.country, seen_at = excluded.seen_at",
          )
          .bind(now.city, now.country)
          .run(),
      );
    }

    return json({ city: previous?.city ?? null, country: previous?.country ?? null });
  } catch {
    return json({ city: null, country: null });
  }
}
