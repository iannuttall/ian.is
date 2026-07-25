import type { AlpineRuntime } from "./types";

type Star = {
  id: number;
  /** px */
  size: number;
  /** horizontal drift in px, positive or negative */
  drift: number;
  /** how far it floats, px */
  rise: number;
  /** ms */
  duration: number;
  /** starting offset from centre, px */
  offset: number;
};

type StarEmitterState = {
  stars: Star[];
  hovering: boolean;
  sequence: number;
  timer: ReturnType<typeof setInterval> | null;
  start(): void;
  stop(): void;
  spawn(): void;
  styleFor(star: Star): string;
  destroy(): void;
};

const SPAWN_INTERVAL = 110;
const MAX_LIVE = 14;

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Emits little stars from the top of an element for as long as it's hovered.
 *
 * Alpine owns the spawning and reaping; CSS owns the motion. Each star gets a
 * randomised size, drift, rise and duration, which is what stops a second hover
 * looking like a replay of the first.
 */
export function registerStars(Alpine: AlpineRuntime) {
  Alpine.data(
    "starEmitter",
    (): StarEmitterState => ({
      stars: [],
      hovering: false,
      sequence: 0,
      timer: null,

      start() {
        // Nothing at all for anyone who's asked for less movement.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (this.timer) return;

        this.hovering = true;
        this.spawn();
        this.timer = setInterval(() => this.spawn(), SPAWN_INTERVAL);
      },

      stop() {
        this.hovering = false;

        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        // Stars already in flight finish on their own rather than snapping out.
      },

      spawn() {
        if (this.stars.length >= MAX_LIVE) return;

        const star: Star = {
          id: this.sequence++,
          size: random(7, 11),
          drift: random(-16, 16),
          rise: random(22, 34),
          duration: random(700, 1150),
          offset: random(-26, 26),
        };

        this.stars.push(star);

        setTimeout(() => {
          this.stars = this.stars.filter((candidate) => candidate.id !== star.id);
        }, star.duration);
      },

      /** Hands one star its variables; the keyframes do the rest. */
      styleFor(star: Star) {
        return [
          `--star-drift:${star.drift.toFixed(2)}px`,
          `--star-rise:${star.rise.toFixed(2)}px`,
          `--star-duration:${Math.round(star.duration)}ms`,
          `font-size:${star.size.toFixed(2)}px`,
          `margin-left:${star.offset.toFixed(2)}px`,
        ].join(";");
      },

      destroy() {
        this.stop();
      },
    }),
  );
}
