// @ts-check
import { defineConfig } from "astro/config";
import alpine from "@astrojs/alpinejs";
import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { externalLinkAttrs } from "./src/lib/external-links.mjs";

const site = process.env.SITE_URL ?? "https://ian.is";
const markdownLinkClass =
  "text-foreground underline underline-offset-2 hover:decoration-dotted";

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
  rehypePlugins: [rehypeTailwindMarkdownLinks],
});

/** @typedef {{ type?: string, tagName?: string, properties?: Record<string, unknown>, children?: HastNode[] }} HastNode */

/** @returns {(tree: HastNode) => void} */
function rehypeTailwindMarkdownLinks() {
  return (tree) => {
    walkHast(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "a") {
        return;
      }

      const href = getStringProperty(node.properties?.href);
      const properties = appendClassName(markdownLinkClass, node.properties);

      node.properties =
        href
          ? {
              ...properties,
              ...externalLinkAttrs(href, site),
            }
          : properties;
    });
  };
}

/**
 * @param {HastNode} node
 * @param {(node: HastNode) => void} visitor
 */
function walkHast(node, visitor) {
  if (!node || typeof node !== "object") {
    return;
  }

  visitor(node);

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHast(child, visitor);
    }
  }
}

/**
 * @param {string} className
 * @param {Record<string, unknown> | undefined} properties
 */
function appendClassName(className, properties) {
  const normalizedProperties = properties ?? {};
  const existingClassName = normalizedProperties.className;
  const classes = new Set(
    Array.isArray(existingClassName)
      ? existingClassName.map(String)
      : typeof existingClassName === "string"
        ? existingClassName.split(/\s+/).filter(Boolean)
        : [],
  );

  for (const name of className.split(/\s+/)) {
    classes.add(name);
  }

  return {
    ...normalizedProperties,
    className: Array.from(classes),
  };
}

/** @param {unknown} value */
function getStringProperty(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
}

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  integrations: [
    alpine({ entrypoint: "./src/scripts/alpine.ts" }),
    mdx(),
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
