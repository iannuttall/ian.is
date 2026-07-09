<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/site/public/logo-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="apps/site/public/logo-black.svg">
    <img src="apps/site/public/logo-black.svg" alt="Ian Nuttall" width="96">
  </picture>
</p>

<h1 align="center">ian.is</h1>

<p align="center">
  The source for my personal site, newsletter system, and future AI-search experiments.
</p>

<p align="center">
  <a href="https://ian.is">Website</a>
  ·
  <a href="SECURITY.md">Security</a>
  ·
  <a href="LICENSE">License</a>
  ·
  <a href="AGENTS.md">Agent notes</a>
</p>

<p align="center">
  <img alt="Astro 7" src="https://img.shields.io/badge/Astro-7-ff5d01?style=flat-square">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square">
  <img alt="TypeScript ready" src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square">
  <img alt="pnpm 11" src="https://img.shields.io/badge/pnpm-11-f69220?style=flat-square">
  <img alt="Security checks" src="https://img.shields.io/badge/security-gitleaks%20%2B%20audit-3fb950?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square">
</p>

## What this repo contains

This is a monorepo for two closely related apps.

`apps/site` is the public `ian.is` site. It is an Astro 7 app built for
Cloudflare Workers. Most pages are static or prerendered. API routes stay small
and server-side.

`apps/newsletter` is the newsletter platform. It runs on a VPS with Node,
Postgres, Docker, and Caddy. It includes the Hono API, operator CLI, stdio MCP
server, public unsubscribe pages, and React Email templates.

The repo is public because I want the site and newsletter work to be useful as a
blueprint. It is still very much my personal setup, so expect sharp edges.

## How to run the site locally

Install dependencies first.

```sh
pnpm install
```

Run the Astro dev server.

```sh
pnpm dev
```

Run the Cloudflare Worker dev server when you need Worker runtime behavior.

```sh
pnpm dev:cf
```

Build the site.

```sh
pnpm build
```

Check the Astro app.

```sh
pnpm ian site check
```

## How to run the newsletter locally

The newsletter app has its own API, web app, CLI, worker, and email preview
tooling.

Run the newsletter web app.

```sh
pnpm newsletter:web:dev
```

Open the React Email preview server.

```sh
pnpm newsletter:email:preview
```

Run the newsletter API through the helper CLI.

```sh
pnpm ian newsletter api --port 3000
```

Run the send worker locally.

```sh
pnpm ian newsletter worker
```

Run database migrations.

```sh
pnpm ian newsletter migrate
```

## The `pnpm ian` helper

`pnpm ian` wraps the commands I do not want to remember. It is small on purpose.

Show the help output.

```sh
pnpm ian help
```

Useful site commands:

```sh
pnpm ian site dev
pnpm ian site dev:cf
pnpm ian site build
pnpm ian site check
pnpm ian site check-remote-env
pnpm ian site secrets-sync --dry-run
pnpm ian site generate-types
pnpm ian site refresh
```

Useful newsletter commands:

```sh
pnpm ian newsletter doctor
pnpm ian newsletter checklist
pnpm ian newsletter migrate
pnpm ian newsletter api --port 3000
pnpm ian newsletter web
pnpm ian newsletter worker
pnpm ian newsletter queue
pnpm ian newsletter render --subject "Test" --body-file apps/newsletter/draft.md
pnpm ian newsletter draft --subject "Test" --body-file apps/newsletter/draft.md
pnpm ian newsletter test-send --draft-id draft_id --to you@example.com
pnpm ian newsletter seed-aliases --email you@gmail.com --count 20
pnpm ian newsletter seed-intelligence --email you@gmail.com --count 20
pnpm ian newsletter email-preview
pnpm ian newsletter cli -- help
```

Check or build one app area:

```sh
pnpm ian check site
pnpm ian check newsletter
pnpm ian check newsletter-web
pnpm ian build site
pnpm ian build newsletter
pnpm ian build newsletter-web
```

Available check/build targets are `site`, `newsletter`, `newsletter-api`,
`newsletter-cli`, `newsletter-core`, `newsletter-mcp`, and `newsletter-web`.

## All root commands

These are the root package scripts.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the Astro site dev server. |
| `pnpm dev:cf` | Starts the site in Wrangler dev. |
| `pnpm build` | Builds the site and regenerates sitemaps. |
| `pnpm preview` | Runs Astro preview for the built site. |
| `pnpm astro` | Runs the local Astro wrapper. |
| `pnpm generate-types` | Generates Cloudflare Worker types. |
| `pnpm build:sitemaps` | Regenerates the sitemap XML files. |
| `pnpm data:refresh` | Refreshes generated public data snapshots. |
| `pnpm site:deploy` | Checks env, builds, and deploys the site Worker. Do not run this unless you mean to deploy. |
| `pnpm site:worker:deploy` | Checks env and deploys the already-built site Worker. Do not run this unless you mean to deploy. |
| `pnpm ian` | Runs the local helper CLI. |
| `pnpm security:audit` | Runs `pnpm audit`. |
| `pnpm security:secrets` | Runs a full-history `gitleaks` scan. |
| `pnpm security:check` | Runs the audit and secret scan together. |
| `pnpm newsletter:build` | Builds all newsletter packages. |
| `pnpm newsletter:clean` | Cleans newsletter package build output. |
| `pnpm newsletter:email:preview` | Starts the React Email preview tool. |
| `pnpm newsletter:lint` | Runs newsletter file-length, Biome, and package lint checks. |
| `pnpm newsletter:lint:fix` | Runs Biome fixes in the newsletter app. |
| `pnpm newsletter:test` | Runs newsletter tests. |
| `pnpm newsletter:typecheck` | Runs newsletter type checks. |
| `pnpm newsletter:web:dev` | Starts the newsletter web app. |

## Environment files and secrets

Real secrets never belong in git.

Use ignored local files for development:

```txt
.env
.env.*
.dev.vars
.dev.vars.*
```

Checked-in example files are allowed only when values are empty or fake.

The site newsletter form needs `LIST_API_TOKEN`. Put it in
`apps/site/.dev.vars` locally. Sync it to Cloudflare only when you are ready to
use the deployed Worker.

```sh
pnpm ian site secrets-sync --dry-run
pnpm ian site secrets-sync
pnpm ian site check-remote-env
```

## How deploys are split

This is one repo, but the apps deploy separately.

The site deploys to Cloudflare Workers from `apps/site`. Cloudflare Build should
use:

```sh
pnpm build
pnpm site:worker:deploy
```

Local deploys and Cloudflare deploys both publish the current git SHA at
`/.well-known/deploy.json`. If that SHA is already live, the deploy command
exits cleanly without deploying again.

The newsletter deploys to the VPS from `apps/newsletter`. The GitHub Actions
workflow is path-filtered so site-only changes do not deploy the newsletter.

## Security checks

Run this before pushing sensitive changes.

```sh
pnpm security:check
```

Run the app checks too.

```sh
pnpm ian site check
pnpm ian check newsletter
```

`pnpm security:check` runs `pnpm audit` and `gitleaks`. If `gitleaks` is missing
on macOS, the script installs it with Homebrew before scanning.

See `SECURITY.md` for the reporting policy and public repo rules.

## Repo map

```txt
apps/
  site/                    Astro + Cloudflare Worker site
  newsletter/              Newsletter platform for the VPS
    packages/api/          Hono API
    packages/cli/          Operator CLI
    packages/core/         Newsletter domain logic
    packages/mcp/          stdio MCP server
    packages/web/          Astro unsubscribe/preferences pages
packages/
  ian/                     Small local helper CLI
plans/                     Working notes and future tasks
```

## Agent notes

Agents should read `AGENTS.md` first. The app and package folders have smaller
`AGENTS.md` files for local rules. `CLAUDE.md` files are symlinks to the same
instructions so Claude and Codex read one source of truth.

## License

MIT.
