// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { agentMarkdown } from "@iannuttall/seo-graph-astro";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { rehypeCodeCopy } from "./src/lib/markdown-code.mjs";
import { rehypeTailwindMarkdownLinks } from "./src/lib/markdown-links.mjs";

const site = process.env.SITE_URL ?? "https://ian.is";
const optimizerIncludes = [
  "astro/assets/services/noop",
  "astro/virtual-modules/transitions.js",
  "astro/zod",
  "lucide",
];

const optimizerExcludes = ["@kiwa-ui/enhance", "@kiwa-ui/enhance/accordion"];

const ssrOptimizerExcludes = [
  ...optimizerExcludes,
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

const markdownProcessor = unified({
  rehypePlugins: [rehypeTailwindMarkdownLinks, rehypeCodeCopy],
});

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  integrations: [
    mdx(),
    // Emits a deterministic .md twin per indexable page plus
    // agent-routes.json; llms.txt stays owned by build-agent-discovery.mjs.
    agentMarkdown(),
  ],
  markdown: {
    processor: markdownProcessor,
  },
  session: {
    driver: {
      entrypoint: new URL("./src/lib/session/noop-driver.ts", import.meta.url),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: optimizerIncludes,
      exclude: optimizerExcludes,
    },
    ssr: {
      optimizeDeps: {
        include: [
          "astro/assets/services/noop",
          "astro/zod",
        ],
        exclude: ssrOptimizerExcludes,
      },
    },
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
  adapter: cloudflare({
    remoteBindings: false,
    imageService: "passthrough",
  }),
});
