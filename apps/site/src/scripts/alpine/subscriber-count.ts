import type { AlpineRuntime } from "./types";

const ANIMATION_DURATION_MS = 900;

export function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) return `${Math.floor(count / 1_000_000)}m`;
  if (count >= 1_000) return `${Math.floor(count / 1_000)}k`;
  return Math.floor(count).toLocaleString("en-GB");
}

export function registerSubscriberCount(Alpine: AlpineRuntime) {
  Alpine.data("subscriberCount", () => ({
    displayCount: "0",
    visible: false,

    async init() {
      try {
        const response = await fetch("/api/subscriber-count", {
          headers: { accept: "application/json" },
        });
        const result = (await response.json().catch(() => ({}))) as {
          count?: unknown;
        };
        const count = result.count;

        if (
          !response.ok ||
          typeof count !== "number" ||
          !Number.isSafeInteger(count) ||
          count < 0
        ) {
          return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          this.displayCount = formatSubscriberCount(count);
          this.visible = true;
          return;
        }

        this.visible = true;
        const startedAt = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / ANIMATION_DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          this.displayCount = formatSubscriberCount(Math.floor(count * eased));

          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      } catch {
        // Leave the count hidden when it cannot be loaded.
      }
    },
  }));
}
