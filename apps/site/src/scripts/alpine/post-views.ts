import type { AlpineRuntime } from "./types";

/**
 * Post view counter. Counts once per browser session per post (so a
 * refresh does not add another), then shows "N views" in the byline.
 */
const SESSION_KEY = "ian.is:viewed";

function alreadyViewed(slug: string): boolean {
  try {
    const seen = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "[]") as string[];
    if (seen.includes(slug)) return true;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen, slug]));
  } catch {
    // Storage blocked; count the view anyway.
  }
  return false;
}

export function formatViews(count: number): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "view" : "views"}`;
}

export function registerPostViews(Alpine: AlpineRuntime) {
  Alpine.data("postViews", (slug: string) => ({
    label: "",

    async init() {
      if (!slug) return;
      const count = alreadyViewed(slug) ? "0" : "1";
      try {
        const response = await fetch(`/api/views/${encodeURIComponent(slug)}?count=${count}`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { views?: unknown };
        if (typeof data.views === "number") this.label = formatViews(data.views);
      } catch {
        // Leave the counter empty.
      }
    },
  }));
}
