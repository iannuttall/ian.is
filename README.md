# ian.is

Monorepo for `ian.is`.

## Apps

- `apps/site`: Astro 7 site on Cloudflare Workers.
- `apps/newsletter`: Node/Postgres newsletter platform for the VPS, including
  the API, CLI, MCP server, public unsubscribe pages, and React Email templates.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm site:worker:deploy
pnpm astro check
pnpm generate-types
pnpm ian help
pnpm ian check newsletter-web
pnpm ian build newsletter-web
pnpm ian check newsletter
pnpm newsletter:lint
pnpm newsletter:typecheck
pnpm newsletter:test
pnpm newsletter:build
```

## Agent Docs

Start with `AGENTS.md`. `CLAUDE.md` is a symlink to the same file so Claude and
Codex read one source of truth.

Each app, and each newsletter package with its own boundary, has a small
`AGENTS.md` that adds local rules without duplicating the root document.

## Local Helper

Use `pnpm ian` for short human-friendly commands:

```sh
pnpm ian newsletter migrate
pnpm ian newsletter seed-aliases --email you@gmail.com --count 20
pnpm ian newsletter render --subject "Test" --body-file apps/newsletter/draft.md
pnpm ian site check
pnpm ian site check-remote-env
pnpm ian site secrets-sync --dry-run
pnpm ian check newsletter-web
pnpm ian build newsletter-web
pnpm ian check newsletter
```

## Deploys

This is one git repo with separate app deploys.

- `apps/site` is the Cloudflare Worker site.
- `apps/newsletter` is the VPS newsletter app.
- Newsletter GitHub Actions are path-filtered and only sync/build/run the
  newsletter deploy slice.
- Cloudflare Builds for the site should use root directory `/`, build command
  `pnpm build`, deploy command `pnpm site:worker:deploy`, and watch only
  `apps/site/**`, `packages/**`, and root workspace files.
- `LIST_API_TOKEN` is required for homepage newsletter signup. Store it in
  `apps/site/.dev.vars` for local Worker dev, sync it to Cloudflare with
  `pnpm ian site secrets-sync`, and verify remote state with
  `pnpm ian site check-remote-env`.
- Root workspace file changes can affect multiple apps, so run the relevant
  checks before pushing.
