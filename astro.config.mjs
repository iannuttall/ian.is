// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL ?? "https://ian.is";

// Keep the React runtime prebundled so route-specific islands share one copy.
const reactRuntimeDeps = [
  "react",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

const optimizerIncludes = [
  ...reactRuntimeDeps,
  "astro/assets/services/noop",
  "astro/virtual-modules/transitions.js",
  "astro/zod",
  "lucide",
];

const optimizerExcludes = ["@kiwa-ui/enhance", "@kiwa-ui/enhance/accordion"];

// Keep tiny UI helpers out of the Worker SSR prebundle. When Vite re-optimizes
// clsx/tailwind-merge/cva mid-request the deps_ssr URLs go stale, which nulls
// out the shared react.js and throws "Invalid hook call" on React islands.
const ssrOptimizerExcludes = [
  ...optimizerExcludes,
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  integrations: [react(), mdx()],
  session: {
    driver: {
      entrypoint: new URL("./src/lib/session/noop-driver.ts", import.meta.url),
    },
  },
  vite: {
    configFile: false,
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: optimizerIncludes,
      exclude: optimizerExcludes,
    },
    ssr: {
      optimizeDeps: {
        include: [
          ...reactRuntimeDeps,
          "astro/assets/services/noop",
          "astro/zod",
        ],
        exclude: ssrOptimizerExcludes,
      },
    },
    resolve: {
      dedupe: ["react", "react-dom"],
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
