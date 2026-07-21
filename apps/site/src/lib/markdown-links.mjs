// The one markdown link treatment for every surface: Astro's markdown
// pipeline (astro.config.mjs) and the issues renderer both use this plugin,
// so post bodies and issue bodies can never style links differently.
import { externalLinkAttrs } from "./external-links.mjs";

const site = process.env.SITE_URL ?? "https://ian.is";

export const markdownLinkClass =
  "text-foreground underline underline-offset-2 hover:decoration-dotted";

/** @typedef {{ type?: string, tagName?: string, properties?: Record<string, unknown>, children?: HastNode[] }} HastNode */

/** @returns {(tree: HastNode) => void} */
export function rehypeTailwindMarkdownLinks() {
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
