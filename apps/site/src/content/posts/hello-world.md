---
title: "Setting up ian.is on Cloudflare Workers"
description: "Why I rebuilt my personal site on Astro content collections and Cloudflare Workers, and what I want to do with it."
pubDate: 2026-07-01
tags: ["meta", "astro", "cloudflare"]
draft: true
---

I have had a personal site for about twenty years. Most of that time it ran on WordPress, and most of that time I ignored it. This version is different in one way: I can change it from the terminal in a few minutes, so I actually do.

This post is a short record of how it is put together and why.

## What it runs on

The site is an [Astro](https://astro.build) app deployed as a Cloudflare Worker. Almost every page is static HTML generated at build time. A handful of routes run on request, like the newsletter signup and the subscriber count.

Posts are Markdown files in a content collection. The frontmatter is deliberately small:

```yaml
title: "Setting up ian.is on Cloudflare Workers"
description: "Why I rebuilt my personal site."
pubDate: 2026-07-01
tags: ["meta", "astro", "cloudflare"]
```

That is the whole contract. A file with those fields becomes a page, an entry in the sitemap, and an item in the RSS feed. Nothing else to remember.

## Why not keep WordPress

Three reasons, in order of how much they annoyed me:

- **Updates.** Every visit to the admin came with a plugin update, a theme update, and a warning about PHP versions.
- **Speed.** A static page from the edge is fast without any effort. WordPress could be fast, but only after work I did not want to do.
- **Agents.** I want coding agents to be able to read the whole site as plain files and change it with a pull request. Markdown in a git repo is the simplest way to get that.

## The newsletter stays separate

Ian's List runs on its own small platform on a VPS. The site only has a thin route that forwards signups to it. Keeping them apart means a busy day on the site never touches the sending queue, and the site can stay static.

## What is next

The site is now the source of truth for both posts and newsletter issues. The next step is to make publishing boring: write a file, run one command, done. If that works, I will write more here than I have in years.
