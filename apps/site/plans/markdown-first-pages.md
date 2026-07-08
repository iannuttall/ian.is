# Plan: Markdown-first publishing and shared page primitives

**Goal:** Make the site easy to author from Markdown/MDX and desktop editors
without changing the current design, current functionality, or current public
routes.

**Status:** Plan only - not implemented yet.

## Current route conventions

- Do not change the current visual design.
- Do not change current behavior.
- Keep the public post routes as `/posts` and `/post/:slug`.
- Use post/posts language in code and docs. Avoid `blog` naming because it does
  not match the current routes.
- Keep pages static/prerendered unless a route has a real runtime reason.
- Keep styling token-driven through `src/styles/globals.css`.
- Prefer raw Tailwind utility classes in markup, backed by global design tokens.
- Use Kiwa UI primitives where they fit; build small local primitives on top of
  them when the site needs repeated list/page patterns.

## Core direction

The best fit is **content collections for authored things**, not "every route is
an MDX file".

Use content collections for content people edit:

```txt
src/content/
  posts/
  pages/
  tools/
  ama/
```

Keep route files as tiny renderers:

```txt
src/pages/index.astro
src/pages/posts/index.astro
src/pages/post/[slug].astro
src/pages/tags/index.astro
src/pages/tags/[tag].astro
src/pages/tools/index.astro
src/pages/tools/[slug].astro
```

This keeps authoring simple while avoiding MDX route sprawl. Route files stay in
charge of layout, SEO, structured data, and dynamic build-time queries. Markdown
files stay in charge of authored content.

## Generated public data

Finite public data that only needs periodic refreshes should be generated into
committed snapshots before adding a runtime API.

Current example:

```txt
src/generated/github-contributions.json
```

The homepage GitHub activity widget imports this rolling 12-month snapshot and
renders fully static HTML. `pnpm data:refresh` updates the snapshot from GitHub
GraphQL. A scheduled workflow can commit the refreshed JSON daily, but the same
script can also run from a local/VPS cron if GitHub Actions cost or dependency
becomes undesirable.

Do not add Hono/API routes for generated public widgets unless the data needs
request-time behavior, user-specific access, auth, or frequent mutation.

## Why Astro still fits

- Astro content collections already match the desired publishing model.
- Markdown/MDX posts already work through `src/content/posts`.
- Static pages can stay prerendered on Cloudflare.
- React islands can be added only where needed, such as newsletter, AMA, or
  future tools.
- Worker APIs can be added later without moving away from Astro.

The app should stay Astro + Cloudflare Worker for now. Add complexity only when a
feature needs it.

## Kiwa and shared primitives

Kiwa UI should be the base primitive layer, installed/managed through
`kiwa-astro`.

Existing/generated Kiwa files live under:

```txt
src/components/ui/
```

Import generated components through their barrels:

```astro
---
import { Button } from "@/components/ui/button";
---
```

Build site-specific composition primitives separately:

```txt
src/components/primitives/
  Section.astro
  SectionHeader.astro
  List.astro
  ListItem.astro
  TagLink.astro
  EmptyState.astro
  PageIntro.astro
```

These should be very small Astro components that mostly wrap Tailwind classes.
They are not a second design system. They exist to keep route files and content
renderers short.

Good primitives for this site:

- **`Section`** - applies `site-frame`, vertical rhythm, and optional section
  boundaries.
- **`SectionHeader`** - shared heading/subheading pattern.
- **`List`** - simple wrapper for post/tool/tag/AMA lists.
- **`ListItem`** - repeated title/date/description/link row or card.
- **`TagLink`** - one canonical tag pill/link style.
- **`PageIntro`** - current page heading/subheading pattern without changing
  typography.
- **`EmptyState`** - reusable "nothing here yet" copy.

Use Kiwa primitives for controls and form pieces:

- Button
- Input
- Checkbox
- Accordion
- Card only where a real card is already part of the design
- Icons from generated Kiwa/Lucide wrappers where available

Do not use Kiwa blocks to replace the current page design. Blocks can be useful
later, but this plan is about preserving the existing site.

## Theming rules

The site should be themeable by changing core values in `globals.css`, not by
editing every page.

Keep these rules:

- Use semantic token utilities: `bg-background`, `text-foreground`,
  `text-foreground-muted`, `border-border`, `bg-muted`, `bg-secondary-hover`.
- Avoid hard-coded colors in page markup.
- Avoid arbitrary visual values unless there is no token-backed option.
- Keep fonts behind `font-sans` / `font-mono` and global font definitions.
- Keep radius, border, shadow, spacing, and color choices consistent through
  tokens or shared primitives.

Important caveat: if markup uses `border`/`border-b`, a theme can hide the color
by changing `--border`, but the 1px layout still exists. If "remove borders
globally" becomes a real requirement, border width needs to be tokenized or those
classes need to live inside shared primitives so they can be changed once.

## Content collections

### Posts

Current posts already live in:

```txt
src/content/posts/
```

Keep the frontmatter simple:

```yaml
title: "Post title"
description: "Post description"
pubDate: 2026-01-01
updatedDate: 2026-01-02
draft: false
tags: ["ai", "tools"]
heroImage: "./image.png"
```

Post routes:

```txt
/posts
/post/:slug
```

### Pages

Use `src/content/pages/` for editable landing/info pages when the page is mostly
content.

Example:

```txt
src/content/pages/home.md
src/content/pages/about.md
src/content/pages/uses.md
```

Route files can read the page entry and render it with the exact existing layout.
This gives desktop-editor authoring without making the route itself an MDX file.

### Tools

Tools should have content plus an implementation.

Content:

```txt
src/content/tools/title-checker.md
```

Possible frontmatter:

```yaml
title: "Title Checker"
description: "Check whether a title fits search and social previews."
status: "active"
tags: ["seo", "tools"]
component: "title-checker"
```

Implementation:

```txt
src/components/tools/TitleChecker.astro
src/components/tools/registry.ts
```

The route renders the Markdown content and then loads the matching component from
the registry. Some tools can become React islands later, but the content model
does not need to change.

### AMA

AMA is an inbox/queue that becomes published content only after an answer exists.

Early model:

- public form submits a question
- unanswered questions live in runtime storage later, probably D1 or R2
- answered questions become public content or generated snapshots
- public pages are static where possible

Possible later routes:

```txt
/ama
/ama/:slug
/api/ama/questions
```

Do not start by making Git the admin database. Git-backed Markdown should be the
public publishing output, not necessarily the private queue.

## Tags and archives

Posts should support clickable tags and tag archive pages.

Routes:

```txt
/tags
/tags/:tag
```

Rules:

- Keep authoring simple: `tags: ["ai", "tools"]`.
- Normalize tag URLs: `AI`, `Ai`, and `ai` all become `/tags/ai`.
- Preserve nice display labels where possible.
- Generate tag pages statically from published posts.
- Add tag pages to the sitemap.
- Render tags on `/post/:slug` as links, not plain text.

Suggested helpers:

```txt
src/lib/tags.ts
```

Suggested components:

```txt
src/components/primitives/TagLink.astro
```

## API direction

Do not add Hono yet just for one newsletter route. The current Astro API route is
fine while the API surface is tiny.

When `/api/*` grows beyond a couple of routes, add Hono inside the same
Astro/Worker app:

```txt
src/api/app.ts
src/api/routes/posts.ts
src/api/routes/tools.ts
src/api/routes/ama.ts
src/worker.ts
```

Astro should own pages. Hono should own the public/admin API.

Useful public API shape later:

```txt
GET /api/posts
GET /api/post/:slug
GET /api/pages/:slug
GET /api/tools
GET /api/tools/:slug
POST /api/ama/questions
```

Admin API can come later when auth/admin roles are clearer.

## AI Search / R2 direction

Do not build a custom search database first.

Preferred later path:

- published Markdown/content collections are the source of truth
- build step exports clean content snapshots
- snapshots are written to R2
- Cloudflare AI Search indexes those R2 documents
- API/search/chat routes query Cloudflare AI Search

This should use current Cloudflare AI Search naming/APIs, not legacy AutoRAG
code paths.

## Sitemap and SEO

Keep SEO metadata centralized in the root layout contract.

Sitemaps should include:

- home
- `/posts`
- every `/post/:slug`
- `/tags`
- every `/tags/:tag`
- `/tools`
- every public `/tools/:slug`
- any public content page that should be indexed

Sitemap generation should use the same published-content helpers as pages. Do not
enumerate files directly if draft content can leak into public output.

## Implementation phases

### Phase 1 - Preserve and extract

- Keep all current routes and visuals unchanged.
- Extract repeated post/list/page patterns into tiny primitives.
- Make post tags clickable.
- Add `/tags` and `/tags/:tag`.
- Update sitemap generation to include tags and avoid draft leakage.
- Keep legal pages as-is unless there is a strong reason to touch them.

### Phase 2 - Add content collections

- Add `pages` collection for editable landing/info pages.
- Add `tools` collection for tool metadata and content.
- Keep route files as Astro renderers.
- Use shared primitives to keep renderers small.
- Keep dynamic bits as Astro components or React islands only when necessary.

### Phase 3 - Tools and AMA

- Add `tools/[slug].astro`.
- Add tool component registry.
- Add AMA submission route and private queue storage.
- Publish answered AMA entries as static public content/snapshots.

### Phase 4 - API and AI readiness

- Add Hono when `/api/*` becomes a real surface.
- Add public API endpoints for content and tools.
- Add R2 content snapshots.
- Wire Cloudflare AI Search.
- Add MCP/CLI surfaces on top of the same API core.

## Current plan corrections

- The site should not become "every route is an MDX file".
- `blog/index.astro` was wrong. The route is `/posts`, implemented by
  `src/pages/posts/index.astro`.
- Avoid a generic MDX components map unless a real MDX page needs it.
- Prefer content collections, tiny Astro route renderers, and shared primitives.
- Avoid adding databases, admin auth, Hono, or search infra before the publishing
  experience is solid.

## Task list

Work through this in small loops. After each task, run the smallest useful
verification before moving on.

- [ ] Confirm the current UI and routing baseline.
- [ ] Add only the shared primitives needed by current pages.
- [ ] Add tag helpers for normalization, grouping, and display labels.
- [ ] Replace post tag text with clickable tag links.
- [ ] Add static `/tags` and `/tags/:tag` archive pages.
- [ ] Update sitemap generation to include tag pages and avoid draft leakage.
- [ ] Run `pnpm build`.
- [ ] Review the diff for accidental design, route, or behavior changes.
- [ ] Decide whether to continue into `pages` and `tools` collections.

Phase 1 stops after the tag/archive publishing work. No design changes, no route
renames, and no new runtime infrastructure.
