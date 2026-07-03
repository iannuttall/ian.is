type AlpineRuntime = {
  data: (name: string, callback: (...args: any[]) => Record<string, unknown>) => void;
};

type Status = "idle" | "loading" | "success" | "error";

type NewsletterState = {
  email: string;
  status: Status;
  message: string;
  issueDate: string;
  readonly ready: boolean;
  init: () => void;
  submit: () => Promise<void>;
};

export default function setup(Alpine: AlpineRuntime) {
  Alpine.data("menuToggle", () => ({
    open: false,
    toggle() {
      this.open = !this.open;
    },
  }));

  Alpine.data("newsletterSignup", (source = "ian.is"): NewsletterState => ({
    email: "",
    status: "idle",
    message: "",
    issueDate: "",

    get ready() {
      return this.email.trim().length > 3 && this.email.includes("@");
    },

    init() {
      this.issueDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    },

    async submit() {
      if (this.status === "loading") return;

      this.status = "loading";
      this.message = "";

      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: this.email, source }),
        });

        if (res.ok) {
          this.status = "success";
          this.message = "You're in. Check your inbox to confirm.";
          this.email = "";
          return;
        }

        const data = (await res.json().catch(() => ({}))) as { error?: string };
        this.status = "error";
        this.message = data.error ?? "Something went wrong. Please try again.";
      } catch {
        this.status = "error";
        this.message = "Network error. Please try again.";
      }
    },
  }));
}
