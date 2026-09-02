import { env, waitUntil } from "cloudflare:workers";
import type { APIContext } from "astro";
import { getEntry } from "astro:content";

export const prerender = false;

/**
 * GET /api/views/<slug>[?count=0]
 *
 * Returns the view count for a post and, unless `count=0`, adds one.
 * Browsers call it after load, so crawlers never count. The slug must
 * match a post in the collection before a row is created. Until the
 * `post_views` table exists the route answers null and the byline
 * shows nothing.
 */

const VARY = "Origin, Referer, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest";
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;

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

export async function GET(context: APIContext) {
  const { request, params, url } = context;
  const slug = params.slug ?? "";

  if (!isTrustedRequest(request) || !SLUG.test(slug)) {
    return json({ views: null }, 404);
  }

  const post = await getEntry("posts", slug);
  if (!post) return json({ views: null }, 404);

  const db = env.DB;
  if (!db) return json({ views: null });

  const shouldCount = url.searchParams.get("count") !== "0";

  try {
    const row = await db
      .prepare("SELECT count FROM post_views WHERE slug = ?1")
      .bind(slug)
      .first<{ count: number }>();
    const current = row?.count ?? 0;

    if (shouldCount) {
      waitUntil(
        db
          .prepare(
            "INSERT INTO post_views (slug, count, updated_at) VALUES (?1, 1, datetime('now')) " +
              "ON CONFLICT (slug) DO UPDATE SET count = count + 1, updated_at = datetime('now')",
          )
          .bind(slug)
          .run(),
      );
    }

    return json({ views: shouldCount ? current + 1 : current });
  } catch {
    return json({ views: null });
  }
}
