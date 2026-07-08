import confetti from "canvas-confetti";
import { playPartyHorn } from "./audio";

const count = 200;
const defaults = {
  disableForReducedMotion: true,
  origin: { y: 0.7 },
  ticks: 260,
} satisfies confetti.Options;

function fire(particleRatio: number, opts: confetti.Options) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}

export function burstConfetti() {
  playPartyHorn();

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    decay: 0.91,
    scalar: 0.8,
    spread: 100,
  });
  fire(0.1, {
    decay: 0.92,
    scalar: 1.2,
    spread: 120,
    startVelocity: 25,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
