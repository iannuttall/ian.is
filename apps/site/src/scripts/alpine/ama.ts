import { playErrorSound } from "./audio";
import { burstConfetti } from "./confetti";
import type { AlpineRuntime } from "./types";

type Status = "idle" | "loading" | "success" | "error";

type AmaConfig = {
  heading?: string;
  description?: string;
};

type AmaState = {
  question: string;
  /** Honeypot: real people never see or fill this field. */
  website: string;
  startedAt: number;
  status: Status;
  message: string;
  initialHeading: string;
  initialDescription: string;
  successHeading: string;
  successDescription: string;
  readonly ready: boolean;
  readonly displayHeading: string;
  readonly displayDescription: string;
  init: () => void;
  submit: () => Promise<void>;
};

export function registerAma(Alpine: AlpineRuntime) {
  Alpine.data("amaAsk", (config: AmaConfig = {}): AmaState => ({
    question: "",
    website: "",
    startedAt: 0,
    status: "idle",
    message: "",
    initialHeading: config.heading ?? "Ask a question",
    initialDescription:
      config.description ?? "It lands in my inbox, and good ones get answered here.",
    successHeading: "Got it",
    successDescription: "Your question is in my inbox. I'll answer it here soon.",

    get ready() {
      return this.question.trim().length > 2;
    },

    get displayHeading() {
      return this.status === "success" ? this.successHeading : this.initialHeading;
    },

    get displayDescription() {
      if (this.status === "success") return this.successDescription;
      if (this.status === "error" && this.message) return this.message;
      return this.initialDescription;
    },

    init() {
      this.startedAt = Date.now();
    },

    async submit() {
      if (this.status === "loading") return;

      this.status = "loading";
      this.message = "";

      try {
        const res = await fetch("/api/ama", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            question: this.question,
            website: this.website,
            elapsed: Date.now() - this.startedAt,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };

        if (res.ok && data.ok === true) {
          this.status = "success";
          this.message = "Got it. I'll answer here soon.";
          this.question = "";
          burstConfetti();
          return;
        }

        this.status = "error";
        this.message = data.error ?? "Something went wrong. Please try again.";
        playErrorSound();
      } catch {
        this.status = "error";
        this.message = "Network error. Please try again.";
        playErrorSound();
      }
    },
  }));
}
