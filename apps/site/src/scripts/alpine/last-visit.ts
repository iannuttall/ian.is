import type { AlpineRuntime } from "./types";

/**
 * Footer line: "Last visit from City, CC". Fetched after load, then polled
 * every 30 seconds while the tab is visible. When the location changes the
 * text scrambles into the new value, one character at a time, matching the
 * footer signature effect in the keep site. Reduced motion swaps instantly.
 */
const POLL_MS = 30_000;
const SCRAMBLE_STEPS = 20;
const SCRAMBLE_STEP_MS = 50;
const SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$*/_-";

type LastVisitState = {
  label: string;
  target: string;
  timer: number | undefined;
  animating: boolean;
  init: () => void;
  destroy: () => void;
  refresh: () => Promise<void>;
  scrambleTo: (next: string) => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

async function fetchLastVisit(): Promise<string | null> {
  try {
    const response = await fetch("/api/last-visit", { headers: { accept: "application/json" } });
    if (!response.ok) return null;
    const data = (await response.json()) as { city?: unknown; country?: unknown };
    if (typeof data.city === "string" && typeof data.country === "string") {
      return `${data.city}, ${data.country}`;
    }
  } catch {
    // Leave the footer line as it is.
  }
  return null;
}

export function registerLastVisit(Alpine: AlpineRuntime) {
  Alpine.data(
    "lastVisit",
    (): LastVisitState => ({
      label: "",
      target: "",
      timer: undefined,
      animating: false,

      init() {
        void this.refresh();
        this.timer = window.setInterval(() => {
          if (document.visibilityState === "visible") void this.refresh();
        }, POLL_MS);
      },

      destroy() {
        if (this.timer !== undefined) window.clearInterval(this.timer);
      },

      async refresh() {
        const next = await fetchLastVisit();
        if (!next || next === this.target) return;
        this.target = next;
        if (!this.label || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          this.label = next;
          return;
        }
        await this.scrambleTo(next);
      },

      async scrambleTo(next) {
        if (this.animating) return;
        this.animating = true;
        for (let step = 0; step <= SCRAMBLE_STEPS; step += 1) {
          this.label = next
            .split("")
            .map((character) => {
              if (character === " " || character === "," || step === SCRAMBLE_STEPS) return character;
              if (Math.random() < step / SCRAMBLE_STEPS) return character;
              return SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
            })
            .join("");
          await wait(SCRAMBLE_STEP_MS);
        }
        this.label = this.target;
        this.animating = false;
      },
    }),
  );
}
