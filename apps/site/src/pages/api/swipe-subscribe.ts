import type { APIContext } from "astro";

export const prerender = false;

const SWIPE_SIGNUP_URL = "https://swipe.md/api/subscribe";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function isTrustedRequest(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "same-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST({ request }: APIContext) {
  if (!isTrustedRequest(request)) return json({ error: "Not found" }, 404);
  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);

  try {
    const response = await fetch(SWIPE_SIGNUP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source: typeof body.source === "string" ? body.source : "ian.is/swipe" }),
    });
    if (response.ok) return json({ ok: true }, 201);
    console.log(`swipe subscribe upstream failed: ${response.status} ${(await response.text()).slice(0, 200)}`);
    return json({ error: "Could not subscribe right now." }, 502);
  } catch {
    return json({ error: "Could not reach Swipe." }, 502);
  }
}
