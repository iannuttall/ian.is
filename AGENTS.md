# Agent Notes

This repo is the monorepo for:

```txt
ian.is
```

The current live site is `apps/site`, an Astro + Cloudflare Worker app. The
newsletter platform is `apps/newsletter`, a Node/Postgres VPS app with an Astro
web surface, Hono API, CLI, MCP package, and React Email templates.

Keep root commands working as thin workspace wrappers so day-to-day usage does
not depend on remembering app paths. Root scripts should use
workspace-relative `pnpm -C apps/<app> ...` commands, matching the proven shape
in `~/dev/apps/keep`.

`CLAUDE.md` files should be symlinks to matching `AGENTS.md` files. Do not keep
parallel copies of agent instructions.

## Repo Map

- `apps/site`: public Astro + Cloudflare Worker site.
- `apps/newsletter`: VPS newsletter platform.
- `apps/newsletter/packages/core`: newsletter domain logic.
- `apps/newsletter/packages/api`: Hono API.
- `apps/newsletter/packages/cli`: operator CLI.
- `apps/newsletter/packages/mcp`: stdio MCP server.
- `apps/newsletter/packages/web`: Astro public pages.
- `packages/ian`: tiny local helper CLI for short human/agent commands.
- `packages/*`: future shared packages only. Add one when it removes real
  duplication without changing output.

## Deployment Boundaries

This is one git repository, but each app deploys independently.

- Commit and push normal source changes from this monorepo root.
- Do not run production deploy commands or attach Cloudflare routes/DNS unless
  the user explicitly asks to deploy or go live. Build, check, dry-run, and
  local verification are fine; public traffic changes are not verification.
- Site changes live under `apps/site` and deploy through the Cloudflare Worker
  site path. Do not run or edit the newsletter VPS deploy for site-only changes.
- Newsletter changes live under `apps/newsletter` and deploy through
  `.github/workflows/deploy-newsletter-production.yml`.
- The newsletter workflow is path-filtered. It runs on pushes to `main` only
  when these paths change:
  - `.dockerignore`
  - `.github/workflows/deploy-newsletter-production.yml`
  - `apps/newsletter/**`
  - `package.json`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`
- Newsletter API changes are under `apps/newsletter/packages/api`, so they
  trigger the newsletter VPS deploy.
- Site API changes are under `apps/site/src/pages/api`, so they are site changes
  and must not trigger the newsletter VPS deploy.
- Root workspace files (`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`)
  can affect both apps. If they change, run checks for every affected app. The
  newsletter deploy workflow intentionally treats those files as newsletter
  deploy inputs.

Newsletter deploy shape:

- GitHub Actions builds only `apps/newsletter/Dockerfile`.
- It syncs only the root workspace files needed for the build plus
  `apps/newsletter/**` to `/opt/apps/email`.
- It runs only the newsletter compose file:
  `apps/newsletter/docker-compose.prod.yml`.
- It runs migrations through `ops`.
- It starts only `postgres`, `app`, and `web`; the sender `worker` stays behind
  the explicit `sender` profile.

Cloudflare site deploy shape:

- The Cloudflare Worker app for `apps/site` should use this monorepo root as
  its root directory.
- Cloudflare build command: `pnpm build`.
- Cloudflare deploy command: `pnpm site:worker:deploy`.
- Cloudflare build watch include paths should be:
  - `apps/site/**`
  - `packages/**`
  - `package.json`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`
- Do not include `apps/newsletter/**` in the site Worker watch paths. Newsletter
  production deploys through GitHub Actions and the VPS.
- `apps/site/wrangler.jsonc` should not define `routes` until cutover is
  intentional. Attaching `ian.is/*` or changing DNS is a go-live task and must
  be called out explicitly.
- If a separate Cloudflare Hono API app is added later, put it in its own app
  directory such as `apps/api`, give it its own `wrangler.jsonc`, root script,
  and Cloudflare Worker build watch paths. Do not make site-only changes deploy
  the API Worker or newsletter VPS app.

Local VPS deploy shape:

- `vps deploy email` reads inventory from
  `~/blueprints/vps/inventory/apps/email.json`.
- That inventory points `localRoot` at this monorepo root, but uses
  `composeFile`, `caddyFile`, and `syncIncludes` so only the newsletter deploy
  slice is copied and run.
- Do not move newsletter deploy files to the repo root just to satisfy tooling;
  update the app inventory or VPS CLI instead.

## Commands

```sh
pnpm install
pnpm ian help
pnpm ian check site
pnpm ian site check-remote-env
pnpm ian site secrets-sync --dry-run
pnpm ian check newsletter-web
pnpm ian check newsletter
pnpm ian build site
pnpm ian build newsletter-web
pnpm ian build newsletter
pnpm dev
pnpm dev:cf
pnpm build
pnpm site:worker:deploy
pnpm astro check
pnpm generate-types
pnpm data:refresh
pnpm security:check
pnpm newsletter:build
pnpm newsletter:lint
pnpm newsletter:test
pnpm newsletter:typecheck
```

Prefer `pnpm ian check <target>` and `pnpm ian build <target>` for routine
validation. Targets are `site`, `newsletter`, `newsletter-api`,
`newsletter-cli`, `newsletter-core`, `newsletter-mcp`, and `newsletter-web`.
Use raw `pnpm --filter ...` only when debugging package-level tooling.

## Public Repo Security

- Run `pnpm security:check` before making the repo public or pushing security
  sensitive changes. It runs `pnpm audit` and a full-history `gitleaks` scan.
- Run app checks after dependency/security changes:
  `pnpm ian site check` and `pnpm ian check newsletter`.
- Never commit real secrets, production env files, private keys, database
  dumps, generated deploy state, or local runtime output.
- `.env`, `.env.*`, `.dev.vars`, and `.dev.vars.*` are ignored. Example files
  such as `.env.example` and `.dev.vars.example` are allowed only with empty or
  placeholder values.
- GitHub Actions secrets, Cloudflare Worker secrets, VPS `.env.production`, and
  local ignored env files are the only places production secrets should live.
- Public pull requests must not get access to production secrets. Production
  deploy workflows should stay on `push` to `main` or explicit trusted
  dispatches, with branch protection on `main`.

## Stack

- Astro 7 (`output: "server"`) on the `@astrojs/cloudflare` adapter (Worker mode).
- Mostly SSG: static pages set `export const prerender = true`; leave it off for
  future request-time/SSR routes (Workers AI, D1, R2, auth, etc.).
- Newsletter (`apps/newsletter`) deploys separately to the VPS platform. Do not
  collapse Postgres, PG Boss-style queue work, SES/webhooks, or the public
  unsubscribe/preferences pages into the Cloudflare Worker just because they
  share a repo.
- Tailwind v4 via `@tailwindcss/vite`. Design system ported from `~/dev/apps/ilo`
  (InterVariable + JetBrains Mono, OKLCH tokens, `--frame-max` / `.site-frame`).
- Dark mode is **single-source `light-dark()`** in `apps/site/src/styles/globals.css`: every
  palette token is `light-dark(<light>, <dark>)` under `:root` with
  `color-scheme: light dark`, so it auto-switches with the OS from one definition.
  This intentionally diverges from the sibling sites (ilo/audits/binday duplicate a
  `.dark` class block + a `@media` block). There is no `.dark` class or toggle
  script here; `dark:` utilities use Tailwind v4's default media-based variant. If a
  manual toggle is ever needed, reintroduce `color-scheme` overrides, not duplicated
  token blocks.
- Kiwa UI components live in `apps/site/src/components/ui` (managed by `kiwa-astro add`).
- Icon inventory lives in `apps/site/src/components/icons/*.astro`. Keep these as inline
  Astro SVG components so icons SSR to HTML and never create a client bundle.
- `nodejs_compat` is required in `wrangler.jsonc` — Astro's dev/SSR runtime uses
  `process`; without it every route 500s with "process is not defined".
- `cache.enabled` is on in `apps/site/wrangler.jsonc`. Static/prerendered
  assets get cache headers from `apps/site/public/_headers`; future SSR/API/MCP
  GET routes must set explicit `Cache-Control` if they should be cached and
  `no-store` if they mutate or return personalized data.
- pnpm 11 gates native build scripts via `allowBuilds:` (booleans) in
  `pnpm-workspace.yaml`, not the legacy `onlyBuiltDependencies`. Keep
  esbuild/sharp/workerd/@tailwindcss/oxide set to `true` or installs exit 1.

## Interactivity & runtime

- Lightweight interactivity uses Alpine (`@astrojs/alpinejs`) with data
  definitions in `apps/site/src/scripts/alpine.ts`. Use Alpine for small stateful UI
  (menu toggles, forms, filters) so markup stays Astro-first and client bundles
  stay small. Add React back only for genuinely complex islands that need it.
- Access Worker env with `import { env } from "cloudflare:workers"` — Astro v6
  removed `Astro.locals.runtime.env`. Type secrets on `Cloudflare.Env` in
  `apps/site/src/env.d.ts`.
- Newsletter signup: `<Newsletter />` Alpine-enhanced Astro component → same-origin SSR route
  `apps/site/src/pages/api/subscribe.ts` (`prerender = false`) → forwards to
  `https://list.ian.is/api/subscribe` with `Authorization: Bearer $LIST_API_TOKEN`.
  `LIST_API_TOKEN` is a required Worker secret declared in
  `apps/site/wrangler.jsonc` and tracked in `apps/site/env-manifest.json`.
  Put it in `apps/site/.dev.vars` locally, sync it with
  `pnpm ian site secrets-sync`, and verify prod with
  `pnpm ian site check-remote-env`. The route returns a graceful 503 when it's
  absent. Astro's CSRF check already 403s cross-origin POSTs.
- Newsletter public pages live in `apps/newsletter/packages/web`; mutation and
  platform behavior live in `apps/newsletter/packages/core` and
  `apps/newsletter/packages/api`. Keep public page design in Astro and keep API
  routes thin.

## Fonts

- The UI typeface is **static Inter** (internal only — the CSS family and files
  are deliberately named generically: family `Sans`, files
  `public/fonts/sans-{400,500,600,700}.woff2`) so the stylesheet/URLs don't
  advertise the typeface. Do NOT use the variable `InterVariable`: it collides
  adjacent letters (e.g. the "tt" in "Nuttall"); the static instances space them
  correctly. `550` is a variable-only weight — headings use `500`.
- `@font-face` uses `font-display: swap` plus a `Sans Fallback` (local Arial with
  `size-adjust`/`ascent-override`) so there's no layout shift while loading.
- Above-the-fold weights (400/500/600) are `<link rel="preload">`ed in
  `Layout.astro`; `apps/site/public/_headers` sets 1-year immutable cache on `/fonts/*`.
- Default body size is `1rem` (16px), `line-height: 1.5` (`globals.css`).

## Content

- Posts are Markdown/MDX in `apps/site/src/content/posts`, typed by
  `apps/site/src/content.config.ts` (glob loader). Query via `apps/site/src/lib/posts.ts`.
- Breadcrumbs are a layout-level convention: pass `breadcrumbs` from
  `apps/site/src/lib/breadcrumbs.ts` helpers (`pageBreadcrumbs`, `postBreadcrumbs`,
  `tagBreadcrumbs`) so the visible header trail and JSON-LD `BreadcrumbList`
  stay in sync. Post frontmatter may set `breadcrumbTitle` when the full title
  is too long for the header crumb.
- Newsletter lives off-site at https://list.ian.is (linked, not embedded).
- GitHub homepage activity is static generated data:
  `pnpm data:refresh` writes `apps/site/src/generated/github-contributions.json` from
  GitHub GraphQL. Prefer committed snapshots for finite public widgets; do not
  add Hono/API routes unless request-time behavior is actually needed.
- Rebuild sitemaps (`pnpm build:sitemaps`, runs in `pnpm build`) —
  it enumerates published post slugs and tag archives, so new posts appear in
  `/sitemap.xml`.
- Extract shared site/newsletter design into root `packages/*` only when the
  shared package preserves exact output and removes real duplication. Do not
  make broad component rewrites while moving runtimes around.

## App Rules

- Keep SEO metadata in the root layout contract.
- Fix lint, typecheck, and `astro check` findings when they appear. Do not leave
  known check failures behind as "pre-existing" unless the user explicitly
  chooses to defer them.
- Generate exact sitemap XML files into `apps/site/public/`.
- Follow `~/workers/platform/references/content-rules.md` for user-facing copy.
- Follow `~/workers/platform/references/design-rules.md` for UI design.
- Do not commit `.wrangler/`, `dist/`, `.astro/`, `node_modules/`, `.dev.vars`, or generated runtime-only data.
- Use `pnpm`, not npm.
- Prefer committed snapshots or R2 for finite public data.
- Avoid D1 reads on high-traffic static SEO pages.
- If bot traffic or database reads can become expensive, consider moving the app to the VPS platform instead.
