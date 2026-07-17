# Plan: /feed, short links, and analytics

Status: proposed (2026-07-17). Staged so each stage ships alone and nothing
later blocks anything earlier. Stage 1 is the only committed scope; later
stages are direction, revisit before building.

## Principles (carried from the rest of the site)

- Static-first. Every public page prerenders; the Worker only runs for real
  request-time behavior (APIs, redirects). Never `run_worker_first`, never
  D1 reads on high-traffic pages.
- One shared D1 database (`ian-db`), namespaced tables per feature
  (`ama_*`, `feed_*`, `links_*`, `stats_*`), tracked migrations in
  `apps/site/migrations`.
- Authoring is `pnpm ian <thing>` from this machine. One command does the
  whole job (write, commit, push); flags give veto windows, not extra steps.
- The repo is public. No secrets, no visitor PII in git; salts and tokens
  live in Worker secrets and `.dev.vars` only.
- Agent markdown, RSS, sitemaps, and schema all come from the existing
  registries (seo-graph integration, `src/lib/feeds.ts`, breadcrumbs,
  `src/lib/seo.ts`). New sections plug in; nothing is hand-maintained.

---

## Stage 1: /feed

Personal short-form feed (the content that used to go to Twitter/X).
Text-first notes, optional images and links, permalink per note.

### Storage: committed content collection, not D1

Recommendation: notes are markdown files in `src/content/feed/`, same as
posts and AMA answers. D1 stays out of stage 1 entirely.

Why this beats a `feed_posts` D1 table:

- AMA needed D1 because the public submits. The feed is author-only, and
  the author already has git. A table would force either SSR (D1 read per
  request on what should be the busiest page) or a build-time remote D1
  pull (API token in the Cloudflare build env, non-deterministic builds).
- Committed files keep /feed fully static: free `.md` twins, RSS from the
  feeds registry, versioned history, zero new infrastructure.
- Cross-posting later (ilo/typefully) runs from the same local CLI that
  wrote the file, so nothing needs to read the site's database anyway.

Veto path: if instant publish without a build (~1-2 min latency) ever
matters, revisit with a D1-backed SSR route then. Do not build it now.

### Content model

`src/content/feed/<id>.md`:

```yaml
---
posted: 2026-07-17T14:32:00Z
draft: true            # removed by `ian feed publish`
---
Note text as markdown. Links are plain markdown links.

![alt text](20260717-abc/screenshot.png)
```

- `<id>` is date-prefixed and stable: `20260717-abc` (`yyyymmdd` + 3-char
  suffix from the CLI). Sorts chronologically on disk, short enough for a
  permalink, no title needed.
- No `title` field. Feed notes are untitled by design; RSS and schema use
  a truncated text preview (reuse `markdownPreview` from `feeds.ts`).
- Images are plain markdown images in the body, not frontmatter. That is
  what VS Code's paste/drop support inserts (see "Images" below), alt
  text is just markdown alt text, and Astro's content pipeline already
  optimizes relative body images (hashed URLs, modern formats). The feed
  renderer styles trailing/consecutive images as an X-style media grid
  with CSS; no structured image schema needed.

### Images (all collections, not just feed)

Because authoring is draft-first in VS Code, image handling is VS Code's
native behavior, configured once in the committed
`.vscode/settings.json`:

- Paste an image from the clipboard (Cmd+V) or drag-drop a file into the
  open note/post; VS Code copies it to `src/content/<collection>/<doc>/`
  (folder named after the document) and inserts the relative markdown
  link. Works for posts, feed, and AMA answers identically.
- Astro optimizes delivery at build (hashed, resized, modern formats),
  so pasted PNG sources are fine to commit as-is at personal scale. If
  repo size ever matters, add an optional `ian images optimize` pass
  later; do not put conversion in the hot path.
- A future custom authoring app replaces the editor, not the contract:
  files next to the note, relative links in the body.
- Ecosystem check (2026-07-17, audited jdevalk/joost-blog + Astro docs):
  co-located images with relative body links and the `image()` schema
  helper for frontmatter images is the canonical Astro pattern; Joost's
  blog does exactly this with folder-per-entry
  (`blog/<slug>/index.md` + `images/`). Optional refinement for posts:
  adopt folder-per-entry when a post has assets (same ids/URLs with the
  glob loader; everything for one post lives in one folder). Feed notes
  stay flat files with a sibling asset folder.
- Local GUI layers that respect files-in-git, if editing ever wants a
  nicer surface than VS Code: Front Matter CMS (free VS Code extension,
  content + media dashboard over the same files) or Darkmatter (native
  macOS app built for Astro content collections, drag-drop images) —
  both edit the repo directly, no server, no /admin. EmDash (Cloudflare's
  Astro CMS) was evaluated and rejected: content moves into a database
  behind an admin panel, which abandons the git-collections contract.

### Routes and pages

- `/feed` (prerendered): PageHeader h1 + subtitle like /posts, /tools,
  /ama. Notes render full text inline, X-style, newest first, with the
  media grid under the text and a muted date that permalinks to the note.
  Paginate past ~50 notes (`/feed/2` etc.) so the page never grows
  unbounded.
- `/feed/<id>` (prerendered): single note permalink, breadcrumbed
  (`postBreadcrumbs`-style helper), share target for cross-posts.
- `/feed/rss.xml`: one new entry in the `feeds` registry; autodiscovery
  and layout alternate links come free.
- Menu: add Feed to the site menu (and home Projects list only if it earns
  it, decide at build time).
- Sitemaps: `build-sitemaps.mjs` learns the feed collection the same way
  it enumerates posts and tags.

### Schema and agent markdown

- Each note: `SocialMediaPosting` piece via `buildPiece` in `seo.ts`
  (author/publisher `@id` refs to the Person node, `datePublished`,
  text preview as `headline`-free `articleBody` or `text`).
- `/feed` index: `CollectionPage` via the existing `webPageSchema`.
- `.md` twins are automatic from the seo-graph integration; the transform
  rules already cover any extensionless path, so `/feed/<id>` negotiates
  markdown with zero rule changes.

### CLI

New `ian` area, wired like `ama` (root `ian.mjs` delegates to
`apps/site/scripts/feed.mjs`). Authoring is draft-first, no terminal
editor: the command creates the real file and opens it in an app (VS Code
via `code` by default, `IAN_OPEN_CMD` overrides it for a future custom
app). The AMA CLI already works this way (`ama answer` drafts,
`ama publish` publishes).

```sh
pnpm ian feed post                # create src/content/feed/<id>.md with
                                  # draft: true frontmatter, open in VS Code
pnpm ian feed publish [id]        # verify non-empty, clear draft flag,
                                  # commit the note's own paths, push
pnpm ian feed list                # recent notes + open drafts
pnpm ian feed delete <id>         # remove note + assets, commit, push
```

- `draft: true` notes are filtered from the page, RSS, and sitemap (same
  contract as the AMA collection), so an in-progress draft can never leak
  into a build even if committed.
- Images need no CLI flags: paste or drag-drop into the open draft (see
  "Images" above).
- Same safety shape as `ama.mjs`: `assertSafeId`, no string interpolation
  into shell commands, refuses to run with a dirty index outside its own
  paths (so it never sweeps unrelated WIP into the post commit).

### Verification

- `pnpm ian check site`, build, then confirm: /feed and one note page
  byte-stable across two builds, `.md` twin exists, RSS validates, note
  appears in sitemap, schema passes the same checks as AMA pages.

---

## Stage 2: short links `ian.is/o/<shortid>`

Tracked outbound links, primarily for cross-posted feed notes (X strips
link previews anyway; owning the redirect gives click data no platform
shares). Requires D1: this is genuinely request-time.

### Data model

`migrations/0003_links.sql`:

```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,          -- shortid, CLI-generated, 4-8 chars
  target_url TEXT NOT NULL,
  note TEXT,                    -- where/why it was created
  feed_id TEXT,                 -- optional back-ref to a feed note id
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE link_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL REFERENCES links(id),
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  visitor_class TEXT NOT NULL,  -- human | verified_bot | claimed_bot | unknown
  bot_name TEXT,                -- from verified category or UA match
  country TEXT,                 -- request.cf.country only, no IP stored
  referrer_host TEXT
);
CREATE INDEX link_clicks_link_time ON link_clicks (link_id, clicked_at);
```

### Route

- `src/pages/o/[id].ts`, `prerender = false`. Lookup, `302` +
  `Cache-Control: no-store` (302 so every click reaches the Worker; a
  cached 301 would silently stop counting). Unknown id: 404 page.
- Click insert happens in `ctx.waitUntil` so the redirect never waits on
  D1.
- Transform rule update: the content-page markdown rewrite must exclude
  `/o/` (like `/api/` and `/.well-known/`), or an agent hitting a short
  link with `Accept: text/markdown` gets rewritten to `/o/<id>.md` and
  404s. One `workers rules rewrites put-markdown ian-is` update plus a
  CLOUDFLARE.md note.

### CLI

```sh
pnpm ian links add <url> [--id x] [--note "..."] [--feed <feed-id>]
pnpm ian links list
pnpm ian links stats [id]         # clicks by day / class / country
```

Writes go through `wrangler d1 execute --remote` with parameter binding,
same as the AMA CLI. `ian feed post` gains an optional `--shorten` that
rewrites the note's outbound links to `/o/` ids at cross-post time only
(the on-site note keeps real URLs; shortlinks are for off-site copies).

---

## Stage 3: analytics (D1-backed, first-party) — OPEN, not settled

Goal: fantastic first-party stats without ever fronting static traffic
with the Worker. That constraint decides the architecture, so state it
plainly:

**Static asset requests (nearly all traffic, including almost all bot
traffic) never execute the Worker.** No single collector can see
everything. The old codebase saw everything only because it was fully
SSR, which is exactly the billing model this site refuses.

The full three-path design below felt too complex on review, so treat it
as the ceiling, not the plan. Build it as a ladder and stop at whichever
rung feels right; each rung is useful alone and nothing above it is
prerequisite:

1. **Link clicks only.** Stage 2 already logs classified clicks; `ian
   links stats` is real analytics with zero extra infrastructure. Ship
   stage 2, live with this for a while.
2. **Human pageviews.** One inline beacon, one `/api/hit` route, one
   events table, one rollup cron. Plausible-grade numbers for humans.
3. **Bot/static coverage.** The GraphQL edge pull. Only worth it if,
   after living with rungs 1-2, the "which agents read which `.md`
   twins" question still itches. It is also the rung most likely to be
   answered a simpler way later (Cloudflare's own dashboards, or a
   periodic CLI read without storing anything).

Rung 1 is part of stage 2. Decide on rungs 2-3 only after using rung 1.

The original three-path sketch, kept for when this gets revisited:

1. **Client beacon (humans).** Tiny inline script in `Layout.astro`
   (inline, no bundle) fires `navigator.sendBeacon("/api/hit", ...)` with
   path + referrer once per pageview. SSR route writes to D1 via
   `waitUntil`. Anything that ran JS is de facto human-ish; the route
   still classifies UA to catch headless browsers.
2. **Worker-visible requests (link clicks, APIs).** `/o/` and `/api/*`
   already execute the Worker, so they log with full server context.
3. **Edge pull (bots and everything else).** Scheduled job pulls the
   Cloudflare zone GraphQL analytics (`httpRequestsAdaptiveGroups`) into
   D1 daily: requests by path, status, country, and bot dimensions as
   available on the plan. This is the only window into static-asset
   traffic, including which AI agents fetch which `.md` twins, which is
   exactly the interesting number. Data is sampled on lower plans; store
   it as "edge estimate" rows, never mixed into beacon counts.

### Bot classification (paths 1 and 2)

Layered, deterministic, no scoring. One constraint checked up front: the
Workers runtime only exposes `request.cf.botManagement.verifiedBot` with
the enterprise Bot Management add-on (confirmed in the generated
`worker-configuration.d.ts`), so the Worker cannot read verification
directly on this zone. The rules language is not gated the same way:
`cf.client.bot` (known good bot) and `cf.verified_bot_category` are
available without the add-on. So:

- A zone **Request Header Transform Rule** stamps
  `x-cf-known-bot: cf.client.bot` and
  `x-cf-verified-bot-category: cf.verified_bot_category` onto incoming
  requests. Managed as config-as-code through the workers CLI alongside
  the markdown rewrite rules, documented in CLOUDFLARE.md. Incoming
  values of these headers must be stripped/overwritten by the same rule
  so clients cannot spoof them.
- `human`: beacon-originated, no known-bot header, UA not a known bot.
- `verified_bot`: `x-cf-known-bot` true; bot name from the category
  header plus UA family.
- `claimed_bot`: UA matches a maintained pattern list (committed JSON,
  seeded from a public verified-bots directory) but Cloudflare did not
  verify it.
- `unknown`: everything else.

Store the classification, the matched bot name, country, and referrer
host. Never store raw IP or full UA in D1. Uniques (if wanted later) use
a daily-rotating salted hash, Plausible-style, so nothing is linkable
across days; the salt is a Worker secret.

### Schema shape

- `stats_events`: raw rows from paths 1 and 2, pruned to a rolling ~90
  days by the aggregation job.
- `stats_daily`: per (day, path, visitor_class, bot_name, country)
  rollups, kept forever, small.
- `stats_edge_daily`: per (day, path, class dims) rows from the GraphQL
  pull, kept forever, flagged as sampled.

Aggregation and pruning run on a cron trigger on the site Worker
(`triggers.crons` in wrangler.jsonc); cron invocations are not asset
traffic, so this stays inside the no-worker-first rule.

### Reporting

- `pnpm ian stats [--days 30]`: overview (humans vs bots, verified vs
  claimed, top pages, top referrers, top countries, link clicks, top
  `.md` fetchers by bot). This is the v1 dashboard.
- Later: the desktop GUI direction, or a private page. No web /admin.

---

## Stage 4: later, explicitly out of scope now

- Cross-posting: `ian feed post --cross-post` hands the note (with
  `--shorten` applied) to the ilo/typefully integration; the note's
  frontmatter records the X post URL for a "view on X" affordance.
- Desktop GUI managing the feed collection alongside posts and AMA.
- Uniques/sessions in analytics (needs the rotating-hash design above).
- Any admin web surface.

## Lessons from the old implementation (~/dev/archive/codebase)

The archived project was a Hono Worker fronting every request, with
Drizzle/D1 stats. What it got wrong, and what this plan does instead:

- **Worker-first everything.** Every page view, bot or human, executed
  the Worker just to be counted. That is the CPU-billing trap this site
  bans outright; here, counting never fronts static traffic.
- **Write amplification in the hot path.** `recordView` ran a raw insert
  plus ~9 aggregate upserts per view, at request time. Here, request
  time writes exactly one `stats_events` row (in `waitUntil`); all
  rollups happen in the daily cron.
- **Rigid aggregate tables.** Eight-plus rollup tables, one per
  dimension combination (`daily_totals_by_bot`,
  `daily_user_agent_views_by_kind`, ...); every new dimension meant a
  new table and another per-request upsert. Here, one `stats_daily`
  table with a few nullable dimension columns, rebuilt by the cron, so
  new dimensions are a migration, not a hot-path change.
- **Unbounded cardinality.** Full user-agent strings were aggregate
  keys. Here, raw UA never reaches D1; classification to
  (class, bot_name, ua_family) happens at write time.
- **Runtime IP-range verification.** Bot CIDR lists were fetched and
  cached inside the Worker per request-path. Here, Cloudflare's own
  verification arrives via the stamped transform-rule headers, and the
  committed UA pattern list is refreshed by a CLI command, offline.
- **Duplicate raw tables** (`visits` and `page_visits` with the same
  columns) and no visible pruning story. Here, one events table with a
  cron-enforced retention window.

Worth keeping from it:

- The `BotDefinition` concept: UA pattern + authoritative IP-range
  source + `requiresVerification`, and the verified/claimed/unknown
  distinction. Reused as the committed pattern list (IP ranges only as
  an offline cross-check, never fetched at request time).
- The `format`/`kind` dimension (html vs markdown vs feed) — exactly
  the "which AI agents read which `.md` twins" question this site cares
  about. Carried into `stats_daily` and the edge-pull rows.
- Separating AI agents (markdown fetchers) from classic crawlers when
  naming bots.

## Decision log

- Feed storage: committed collection over D1 (static page, free markdown
  twins; D1 reserved for request-time features). Veto: D1+SSR if instant
  publish ever matters.
- Authoring is draft-first with an app, never a blocking `$EDITOR`: the
  command creates the real file (`draft: true`) and opens it (VS Code by
  default, `IAN_OPEN_CMD` override); a separate publish command
  validates and flips the flag. Applied to the AMA CLI on 2026-07-17;
  the feed CLI is born this way.
- Analytics is explicitly unresolved: the three-path design is recorded
  as the ceiling, but stage 3 starts and may end at link-click stats.
- Short links use 302 + no-store, not 301 (301s get cached and stop
  counting).
- Analytics accepts three-path ingestion rather than pretending one
  collector can see static traffic; edge-pull data is stored separately
  from beacon data and labeled as sampled.
- No raw IPs or full UAs at rest; classification happens at write time.
