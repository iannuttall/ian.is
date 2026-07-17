import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// Posts live as Markdown/MDX files under src/content/posts.
// Frontmatter is intentionally simple so a local desktop editor can author it.
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      breadcrumbTitle: z.string().optional(),
      description: z.string(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
    }),
});

// AMA answers live as Markdown files under src/content/ama. Questions arrive
// through /api/ama into D1; `pnpm ian ama answer` turns one into a file here.
const ama = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/ama" }),
  schema: z.object({
    question: z.string(),
    breadcrumbTitle: z.string().optional(),
    context: z.string().optional(),
    asked: z.coerce.date(),
    answered: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    description: z.string(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    breadcrumbTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { ama, pages, posts };
