import { env } from "cloudflare:workers";
import type { APIContext } from "astro";

// This route runs at request time (Worker SSR) so questions land in D1.
// D1 is only the inbox: the AMA pages themselves are prerendered from the
// src/content/ama collection, and only the local `ian ama` CLI reads rows.
export const prerender = false;

const QUESTION_MAX = 500;
// Submissions faster than this since form render are treated as bots.
const MIN_ELAPSED_MS = 3000;
const DAILY_LIMIT_PER_IP = 5;
// Fallback salt: ip_hash only needs to bucket repeat submitters. Set the
// optional AMA_IP_SALT Worker secret in production so the salt isn't public
// in this open-source repo.
const DEFAULT_IP_SALT = "ian.is/ama";

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      // Never cache submission responses.
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

async function hashIp(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${env.AMA_IP_SALT ?? DEFAULT_IP_SALT}:${ip}`),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function POST(context: APIContext) {
  const { request } = context;

  if (!isTrustedRequest(request)) {
    return json({ error: "Not found" }, 404);
  }

  const db = env.DB;
  if (!db) {
    return json({ error: "Questions are not open right now." }, 503);
  }

  let body: { question?: unknown; website?: unknown; elapsed?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question.length === 0) {
    return json({ error: "Type a question first." }, 400);
  }
  if (question.length > QUESTION_MAX) {
    return json({ error: `Keep the question under ${QUESTION_MAX} characters.` }, 400);
  }

  // Bot friction: the honeypot field must stay empty and the form must have
  // been on screen for a beat. Fail "successfully" so bots move on.
  const honeypotFilled = typeof body.website === "string" && body.website.length > 0;
  const elapsedOk = typeof body.elapsed === "number" && body.elapsed >= MIN_ELAPSED_MS;
  if (honeypotFilled || !elapsedOk) {
    return json({ ok: true }, 201);
  }

  try {
    const ipHash = await hashIp(request);

    const recent = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM ama_questions WHERE ip_hash = ?1 AND created_at > datetime('now', '-1 day')",
      )
      .bind(ipHash)
      .first<{ n: number }>();

    if ((recent?.n ?? 0) >= DAILY_LIMIT_PER_IP) {
      return json(
        { error: "That's a lot of questions for one day. Try again tomorrow." },
        429,
      );
    }

    await db
      .prepare(
        "INSERT INTO ama_questions (id, question, ip_hash) VALUES (?1, ?2, ?3)",
      )
      .bind(crypto.randomUUID(), question, ipHash)
      .run();

    return json({ ok: true }, 201);
  } catch {
    return json({ error: "Could not save your question. Please try again." }, 502);
  }
}
