import { env } from "cloudflare:workers";
import type { APIContext } from "astro";

// This route runs at request time (Worker SSR) so the list API token stays
// server-side. The browser island posts here; we forward to list.ian.is.
export const prerender = false;

const LIST_API_URL_DEFAULT = "https://list.ian.is";

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      // Never cache subscribe responses.
      "cache-control": "no-store",
    },
  });
}

/** Lightweight friction: only accept same-origin browser posts. */
function isTrustedRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "same-site") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== new URL(request.url).host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(context: APIContext) {
  const { request } = context;

  if (!isTrustedRequest(request)) {
    return json({ error: "Not found" }, 404);
  }

  const token = env.LIST_API_TOKEN;
  const apiBase = env.LIST_API_URL ?? LIST_API_URL_DEFAULT;

  if (!token) {
    return json(
      { error: "Newsletter signup is not configured yet." },
      503,
    );
  }

  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }
  const source = typeof body.source === "string" ? body.source : "ian.is";

  try {
    const upstream = await fetch(new URL("/api/subscribe", apiBase), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, source }),
    });

    if (upstream.ok) {
      return json({ ok: true }, 201);
    }

    console.log(
      `subscribe upstream failed: ${upstream.status} ${(await upstream.text()).slice(0, 200)}`,
    );
    return json(
      { error: "Could not subscribe right now. Please try again." },
      502,
    );
  } catch {
    return json({ error: "Could not reach the newsletter service." }, 502);
  }
}
