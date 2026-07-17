# Agent Notes

This app is the public `ian.is` site.

Read the root `AGENTS.md` first. This file only adds site-specific direction.

## Runtime

- Astro 7 on the Cloudflare adapter.
- Mostly SSG: export `prerender = true` for pages that can be static.
- Leave API, auth, Worker AI, D1, R2, or future request-time routes as SSR.
- Use `pnpm -C apps/site ...` for app-local commands, or the root wrappers.
- Site changes are Cloudflare Worker changes. They should not trigger or use the
  newsletter VPS deploy unless root workspace files also changed.
- Cloudflare Builds should deploy this app with root directory `/`, build
  command `pnpm build`, deploy command `pnpm site:worker:deploy`, and watch
  paths for `apps/site/**`, `packages/**`, and root workspace files.
- Do not deploy this app with raw `wrangler deploy`. Use `pnpm -C apps/site
  deploy` locally or `pnpm site:worker:deploy` from Cloudflare Build so the
  live deploy marker can skip duplicate deploys for the same git SHA.
- Keep canonical URLs slashless through Astro's `trailingSlash: "never"` and
  Wrangler assets `html_handling: "drop-trailing-slash"`. Cloudflare's default
  asset handling adds slashes to directory index pages.

## Commands

```sh
pnpm dev
pnpm dev:cf
pnpm build
pnpm astro check
pnpm generate-types
pnpm data:refresh
pnpm ian site check-remote-env
pnpm ian site secrets-sync --dry-run
```

## Newsletter Signup

- The homepage newsletter form posts to the same-origin Astro route
  `src/pages/api/subscribe.ts`.
- That route forwards to the newsletter VPS API using `LIST_API_TOKEN`; never
  expose that token to the browser.
- `LIST_API_TOKEN` is required in `wrangler.jsonc` and `env-manifest.json`.
  Keep it in `.dev.vars` locally, sync it with `pnpm ian site secrets-sync`,
  and verify Cloudflare with `pnpm ian site check-remote-env`.

## Content And Routes

- Posts live in `src/content/posts`.
- The correct public routes are `/posts` and `/post/:slug`.
- `/blog` is wrong terminology for this site.
- Use `src/lib/posts.ts` and `src/lib/breadcrumbs.ts` helpers rather than
  rebuilding content and breadcrumb logic in pages.

## Agent Discovery

- Agent markdown is self-managed: the `agentMarkdown()` integration from
  `@iannuttall/seo-graph-astro` emits a static `.md` twin per indexable page
  plus `agent-routes.json` at build time. `Accept: text/markdown` negotiation
  is two Cloudflare URL Rewrite (transform) rules on the zone that rewrite
  extensionless page paths to their `.md` asset — never Worker logic, and
  never `run_worker_first` (bot traffic must not bill Worker CPU).
- `scripts/build-agent-discovery.mjs` generates `dist/client/llms.txt` from
  every indexable HTML page in the finished build. Keep it automatic. Do not
  add a maintained route list.
- Public Agent Skills source files live in `agent-skills/*/SKILL.md`. The same
  build script publishes the files and a digest-backed
  `/.well-known/agent-skills/index.json`.
- The site blocks no bots. Keep the origin `Content-Signal` response header
  and `public/robots.txt` fully open (`search=yes, ai-input=yes, ai-train=yes`),
  and keep Cloudflare zone features (managed robots.txt / AI Crawl Control)
  from injecting `Disallow` rules.

## Design

- Keep the current visual output unless the user explicitly asks for design
  changes.
- Design tokens and theme values belong in `src/styles/globals.css`.
- Prefer Astro components and Alpine for small interactions.
- Do not add React islands unless the UI genuinely needs React.
- Icons should be Astro SVG components so they SSR and do not create a client
  bundle.
