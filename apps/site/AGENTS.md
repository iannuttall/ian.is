# Agent Notes

This app is the public `ian.is` site.

Read the root `AGENTS.md` first. This file only adds site-specific direction.

## Runtime

- Astro 7 on the Cloudflare adapter.
- Mostly SSG: export `prerender = true` for pages that can be static.
- Leave API, auth, Worker AI, D1, R2, or future request-time routes as SSR.
- Use `pnpm -C apps/site ...` for app-local commands, or the root wrappers.

## Commands

```sh
pnpm dev
pnpm dev:cf
pnpm build
pnpm astro check
pnpm generate-types
pnpm data:refresh
```

## Content And Routes

- Posts live in `src/content/posts`.
- The correct public routes are `/posts` and `/post/:slug`.
- `/blog` is wrong terminology for this site.
- Use `src/lib/posts.ts` and `src/lib/breadcrumbs.ts` helpers rather than
  rebuilding content and breadcrumb logic in pages.

## Design

- Keep the current visual output unless the user explicitly asks for design
  changes.
- Design tokens and theme values belong in `src/styles/globals.css`.
- Prefer Astro components and Alpine for small interactions.
- Do not add React islands unless the UI genuinely needs React.
- Icons should be Astro SVG components so they SSR and do not create a client
  bundle.
