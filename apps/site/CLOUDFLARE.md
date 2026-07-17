# Cloudflare zone configuration

The site is a mostly-prerendered Astro build deployed as a Cloudflare Worker
with static assets. Agent markdown is fully self-managed: the
`agentMarkdown()` integration from `@iannuttall/seo-graph-astro` emits a
static `.md` twin for every indexable page plus `agent-routes.json` at build
time, and two zone-level URL Rewrite Rules serve them for
`Accept: text/markdown` requests. The Worker never fronts static asset
traffic — **never enable `run_worker_first`**; the site allows all bots, so
per-request Worker CPU on bot traffic would be billed heavily.

## AI Crawl Control toggles

All Cloudflare-managed AI features are OFF for this zone, deliberately:

- **Markdown for Agents**: OFF — its converter has no exclusion contract and
  leaks decorative markup; our build pipeline owns markdown.
- **Managed robots.txt**: OFF — the origin `public/robots.txt` is fully open
  (`search=yes, ai-input=yes, ai-train=yes`) and serves as-is.
- **Redirects for AI Training**: OFF.

If any of these look "off" in the dashboard, off is correct. They only ever
restrict or rewrite; the site's policy is to allow all bots and serve our
own artifacts.

## Route Markdown requests at the edge

In Cloudflare open **Rules → Transform Rules → URL Rewrite Rules**. Both
rules use the Expression Editor (the visual builder cannot represent them —
cancel its prompt to discard).

### Rule 1 — "Home .md rewrite"

Expression:

```txt
(http.host eq "ian.is" and http.request.uri.path eq "/" and (lower(http.request.headers["accept"][0]) eq "text/markdown" or starts_with(lower(http.request.headers["accept"][0]), "text/markdown,")))
```

**Path → Rewrite to Static**:

```txt
/index.md
```

### Rule 2 — "Content page .md rewrite"

Expression:

```txt
(http.host eq "ian.is" and http.request.uri.path ne "/" and not ends_with(http.request.uri.path, "/") and not (http.request.uri.path contains ".") and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/.well-known/") and (lower(http.request.headers["accept"][0]) eq "text/markdown" or starts_with(lower(http.request.headers["accept"][0]), "text/markdown,")))
```

**Path → Rewrite to Dynamic**:

```txt
concat(http.request.uri.path, ".md")
```

Design notes:

- Deterministic, not an allowlist: any extensionless page path negotiates
  automatically, so new pages are covered the moment the build emits their
  `.md` twin. No rule edits when content grows.
- `contains "."` excludes every file-extension asset, including explicit
  `.md` requests (which also send `Accept: text/markdown` and would
  otherwise rewrite to `.md.md`).
- `/api/` is excluded so SSR routes are never rewritten. The
  `/.well-known/` guard is redundant (dots) but explicit.
- The `Accept` check matches the exact header or a Markdown-first list;
  `text/markdown;q=0` stays on HTML.
- `public/_headers` adds `Vary: Accept` (plus Content-Signal and caching)
  to every response so shared caches keep the representations apart; the
  rewritten URL also gives each representation its own edge-cache key.

## Other zone rules

- A dashboard Redirect Rule sends `www.ian.is` to the apex with a permanent
  redirect. Keep **Always Use HTTPS** on.
- `wrangler.jsonc` owns the custom domains; see the repo AGENTS.md for
  deploy boundaries.

## Check the deployed site

```sh
curl -sS -D - https://ian.is/ama -o /dev/null
curl -sS -D - https://ian.is/ama -H 'Accept: text/markdown' -o /dev/null
curl -sS -D - https://ian.is/ama.md -o /dev/null
curl -sS -D - https://ian.is/ama -H 'Accept: text/markdown;q=0' -o /dev/null
curl -sS https://ian.is/robots.txt
```

Negotiated and explicit Markdown must return `Content-Type: text/markdown`
with identical bytes; the `q=0` request must return HTML; robots.txt must
contain no `Disallow` lines.
