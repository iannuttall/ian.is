import type { AlpineRuntime } from "./types";

/** Footer line: "Last visit from City, CC", fetched after load. */
export function registerLastVisit(Alpine: AlpineRuntime) {
  Alpine.data("lastVisit", () => ({
    label: "",

    async init() {
      try {
        const response = await fetch("/api/last-visit", {
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { city?: unknown; country?: unknown };
        if (typeof data.city === "string" && typeof data.country === "string") {
          this.label = `${data.city}, ${data.country}`;
        }
      } catch {
        // Leave the footer line empty.
      }
    },
  }));
}
