import { playErrorSound } from "./audio";
import { burstConfetti } from "./confetti";
import { getStoredBoolean, setStoredBoolean } from "./storage";
import type { AlpineRuntime } from "./types";

const subscribedKey = "ian.newsletter.subscribed";

type Status = "idle" | "loading" | "success" | "error";

type NewsletterConfig = {
  source?: string;
  heading?: string;
  description?: string;
};

type NewsletterState = {
  email: string;
  status: Status;
  message: string;
  issueDate: string;
  visible: boolean;
  initialHeading: string;
  initialDescription: string;
  initialSubject: string;
  successHeading: string;
  successDescription: string;
  successSubject: string;
  errorSubject: string;
  readonly ready: boolean;
  readonly previewSubject: string;
  init: () => void;
  submit: () => Promise<void>;
};

function hasSubscribed() {
  return getStoredBoolean(subscribedKey);
}

function setSubscribed(value: boolean) {
  setStoredBoolean(subscribedKey, value);
}

function issueDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function registerNewsletter(Alpine: AlpineRuntime) {
  Alpine.data("newsletterShell", () => ({
    subscribed: false,

    init() {
      this.subscribed = hasSubscribed();
    },
  }));

  Alpine.data("newsletterSignup", (config: NewsletterConfig = {}): NewsletterState => ({
    email: "",
    status: "idle",
    message: "",
    issueDate: "",
    visible: true,
    initialHeading: config.heading ?? "Subscribe to Ian's List",
    initialDescription:
      config.description ?? "What I learned this week actually using AI to run my business.",
    initialSubject: "I built a new thing",
    successHeading: "You're on the list",
    successDescription: "I'll send the first email soon. Thanks for signing up.",
    successSubject: "You're on the list",
    errorSubject: "Error signing up. Please try again.",

    get ready() {
      return this.email.trim().length > 3 && this.email.includes("@");
    },

    get previewSubject() {
      if (this.status === "success") return this.successSubject;
      if (this.status === "error") return this.errorSubject;
      return this.initialSubject;
    },

    init() {
      this.visible = !hasSubscribed();
      this.issueDate = issueDate();
    },

    async submit() {
      if (this.status === "loading") return;

      this.status = "loading";
      this.message = "";

      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: this.email, source: config.source ?? "ian.is" }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };

        if (res.ok && data.ok === true) {
          this.status = "success";
          this.message = "You're on the list.";
          this.email = "";
          setSubscribed(true);
          burstConfetti();
          return;
        }

        setSubscribed(false);
        this.status = "error";
        this.message = data.error ?? "Something went wrong. Please try again.";
        playErrorSound();
      } catch {
        setSubscribed(false);
        this.status = "error";
        this.message = "Network error. Please try again.";
        playErrorSound();
      }
    },
  }));
}
