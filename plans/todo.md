# Cross-app TODO

This is the parking lot for work that cuts across `apps/site`,
`apps/newsletter`, future Worker APIs, and future MCP servers.

Keep this practical. Move an item into an app-specific plan when it is ready to
build.

## MCP

- [ ] Keep the newsletter MCP as stdio for now.
- [ ] Design the future remote HTTP newsletter MCP transport.
- [ ] Decide auth for remote newsletter MCP before exposing it publicly.
- [ ] Keep newsletter MCP tools backed by `apps/newsletter/packages/core`, not
      duplicated API logic.
- [ ] Add a future `ian` MCP server for the personal site/app.
- [ ] Let `ian` MCP answer questions about Ian, posts, tools, projects, and
      public site data.
- [ ] Decide whether `ian` MCP lives in `apps/mcp` or shares an `apps/api`
      Worker with Hono.
- [ ] Share core/query logic between `ian` MCP and any public Hono API.

## Site API

- [ ] Decide the first stable API contract for `ian.is`.
- [ ] Add Hono only when there is real request-time behavior.
- [ ] Revisit Astro `<ClientRouter />` only when the no-hard-refresh UX is worth
      the extra client runtime. Current measured cost is about 15.7 KB raw /
      5.5 KB gzip JS.
- [ ] Keep finite public data as generated static snapshots when possible.
- [ ] Avoid database reads on high-traffic SEO pages.
- [ ] Use Workers Cache (`cache.enabled`) plus explicit `Cache-Control` headers
      for deterministic SSR/API responses once the site has request-time tools.
- [ ] Use manual `caches.default` only for expensive, safe, high-cardinality GET
      routes with normalized cache keys.
- [ ] Add API auth conventions before adding admin-only endpoints.
- [ ] Document Cloudflare Worker build/deploy boundaries when `apps/api` exists.

## Newsletter Integration

- [ ] Keep newsletter production on the VPS while SES/Postgres/queue work needs
      Node.
- [ ] Let the Astro site call newsletter API endpoints for public signup and
      future subscriber-aware behavior.
- [ ] Add a real first/welcome email for new subscribers; signup is single
      opt-in, so do not promise a confirmation link.
- [ ] Add issue archive sync from newsletter API to static files in the site
      repo.
- [ ] Make archive sync publish only issues that are eligible for public release.
- [ ] Support email-first publishing where subscribers get an issue before it
      appears on the public site.
- [ ] Add sponsorship/ad slot inventory to newsletter core.
- [ ] Expose sponsorship availability through the newsletter API.
- [ ] Add sponsor booking/purchase flow when the product shape is clearer.
- [ ] Add supporter/paid-member tags that can suppress CTAs or ads.

## Search And AI Readiness

- [ ] Keep Markdown/MDX as the source of truth for authored content.
- [ ] Generate machine-readable public data for posts, tools, projects, and
      issues.
- [ ] Decide where OKF or similar agent-readable formats fit.
- [ ] Evaluate Cloudflare AI Search/AutoRAG for site chat once the content model
      is stable.
- [ ] Add source-attributed answers for any future site chat agent.
- [ ] Keep generated data cacheable and cheap to crawl.

## Monorepo Hygiene

- [ ] Keep deploy boundaries explicit: site Worker, newsletter VPS, future API
      Worker, future MCP Worker.
- [ ] Prefer `pnpm ian <command>` helpers for common checks and local workflows.
- [ ] Add helper commands when a repeated command becomes hard to remember.
- [ ] Extract shared packages only when they remove real duplication without
      changing output.
- [ ] Keep app-specific docs in each app, and only cross-app strategy here.
