// Shared rehype plugin: wraps every fenced code block in a .code-frame with
// a copy button. Used by both the Astro markdown pipeline (posts) and the
// issues renderer so code blocks behave identically on every surface.
// Icons and the click handler live in src/components/CodeCopy.astro, which
// stamps the site icon components into these buttons at load.

function copyButton() {
  return {
    type: "element",
    tagName: "button",
    properties: {
      type: "button",
      className: ["code-copy"],
      dataCodeCopy: "",
      ariaLabel: "Copy code",
    },
    children: [],
  };
}

/** @returns {(tree: HastNode) => void} */
export function rehypeCodeCopy() {
  return (tree) => {
    walk(tree, (node, parent, index) => {
      if (
        node.type !== "element" ||
        node.tagName !== "pre" ||
        !parent ||
        index === undefined ||
        // Already framed (defensive against double application).
        (parent.tagName === "div" &&
          Array.isArray(parent.properties?.className) &&
          parent.properties.className.includes("code-frame"))
      ) {
        return;
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-frame"] },
        children: [node, copyButton()],
      };
    });
  };
}

/**
 * @param {HastNode} node
 * @param {(node: HastNode, parent: HastNode | undefined, index: number | undefined) => void} visitor
 * @param {HastNode} [parent]
 * @param {number} [index]
 */
function walk(node, visitor, parent, index) {
  if (!node || typeof node !== "object") {
    return;
  }

  visitor(node, parent, index);

  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i], visitor, node, i);
    }
  }
}
