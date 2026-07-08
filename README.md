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
pnpm astro check
pnpm generate-types
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
