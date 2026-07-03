# Plan: Markdown/MDX-first pages

**Goal:** Author every page as Markdown/MDX so editing copy = editing an
`.md`/`.mdx` file. For example: open `src/pages/index.mdx` and change the
homepage copy directly, no `.astro`/JSX editing.

**Status:** Plan only — not implemented yet.

## Why this is mostly restructuring (not new infra)

- `@astrojs/mdx` `^7` is already installed and active in `astro.config.mjs`
  (`integrations: [react(), mdx()]`). MDX pages/content work today.
- A typography system already exists in `src/styles/globals.css` as
  `.content-prose` (+ `.docs-prose`) — markdown bodies can reuse it.
- Blog posts are already Markdown/MDX via a content-collection glob loader
  (`src/content.config.ts`).

So the work is: split copy from dynamic logic, add a couple of layouts, and
rename pages to `.md`/`.mdx`.

## Core insight: pages come in two shapes

1. **Pure prose** — `terms`, `privacy`, `cookies`. 100% copy → become plain
   `.md`. Biggest, cleanest win.
2. **Composed** — `home`, `tools`, `blog index`. These mix copy with *dynamic*
   parts (the "Latest posts" grid queries the content collection; the Newsletter
   is a React island). Markdown alone can't express those — but **MDX can**, by
   importing components. Copy stays markdown; dynamic parts become small
   components dropped into the MDX.

## Current homepage anatomy (`src/pages/index.astro`)

- Hero: `<h1>` heading + muted `<p>` subhead, with specific Tailwind typography.
- `<Newsletter client:load standalone={false} />` — React island.
- "Latest posts": `getPublishedPosts().slice(0, 4)` query + a card grid.

The hero styling and the posts query are the two things plain markdown can't
carry — both are handled below.

## Plan

### 1. Add two layouts (`src/layouts/`)

- **`ProseLayout.astro`** — maps markdown `frontmatter` (title/description) onto
  the existing `Layout.astro`, and wraps `<slot/>` in `.content-prose`. Used by
  the legal pages.
- **`HomeLayout.astro`** (or extend `Layout.astro`) — renders the hero from
  frontmatter (`heading` + `subhead`) with the exact current Tailwind classes,
  then `<slot/>` for the composed body.

### 2. Extract dynamic bits into presentational components (`src/components/`)

- **`LatestPosts.astro`** — the `getPublishedPosts().slice(0, 4)` query + card
  grid currently inline in `index.astro`.
- **`BlogList.astro`** — the blog index listing.
- **`ToolsGrid.astro`** — the tools listing (if it is data-driven).

### 3. Convert the pages

| Now | After | Copy you edit |
| --- | --- | --- |
| `index.astro` | `index.mdx` | hero copy in frontmatter; body = `<Newsletter/>` + `<LatestPosts/>` |
| `terms.astro` / `privacy.astro` / `cookies.astro` | `*.md` | the entire body, as plain markdown |
| `tools/index.astro` | `index.mdx` | intro copy in markdown + `<ToolsGrid/>` |
| `blog/index.astro` | `index.mdx` *(or leave as-is)* | intro copy + `<BlogList/>` |

### 4. Reuse typography

Markdown bodies get styled by the existing `.content-prose`. For MDX pages, add
a small `components` map so headings/links automatically get the site's classes
without hand-writing HTML.

## Decisions to confirm before implementing

### A. Homepage hero
The hero has custom typographic styling that generic markdown would flatten.
- **Frontmatter fields (recommended)** — `heading:` / `subhead:` in
  `index.mdx`, rendered by the layout with exact styling. Still "edit the md
  file," design stays pixel-perfect.
- **Pure markdown body** — simpler file, but the hero looks like default prose
  unless the layout heavily styles its first heading/paragraph.

### B. Scope
- **All five pages now**, or
- **Start with home + 3 legal pages**, then do the two dynamic index pages after.

**Default if simply told "go":** frontmatter hero + convert all pages, leaving
`blog/index` dynamic bits in a `<BlogList/>` component.

## Watch-outs

- **SEO/structured data:** `index.astro` currently builds `webSiteSchema()` in
  frontmatter. Markdown frontmatter carries title/description; structured data
  must be produced by the layout (e.g. a `structuredData` frontmatter flag the
  layout honors), so it isn't lost in the conversion.
- **`prerender = true`:** keep pages statically prerendered. Markdown/MDX pages
  prerender by default; the "Latest posts"/"Blog list" queries run at build time
  inside the components, so no request-time Worker cost is introduced.
- **React islands in MDX:** `<Newsletter client:load />` works in MDX exactly as
  in `.astro`; keep the client directive on the import usage.
- **`site-frame` / section chrome:** the hero and sections currently use
  `site-frame` wrappers and border classes — preserve these in the layouts so
  spacing/borders (including the newsletter's flush `standalone={false}` variant)
  stay intact.
