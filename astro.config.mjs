// @ts-check
import { defineConfig } from "astro/config";
import alpine from "@astrojs/alpinejs";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  integrations: [alpine({ entrypoint: "./src/scripts/alpine.ts" }), mdx()],
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
