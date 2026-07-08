type AlpineRuntime = {
  data: (name: string, callback: (...args: any[]) => Record<string, unknown>) => void;
  store: (name: string, value?: Record<string, unknown>) => any;
};

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
  readonly ready: boolean;
  init: () => void;
  submit: () => Promise<void>;
};

const NEWSLETTER_SUBSCRIBED_KEY = "ian.newsletter.subscribed";

function hasSubscribed() {
  try {
    return window.localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === "true";
  } catch {
    return false;
  }
}

function saveSubscribed() {
  try {
    window.localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "true");
  } catch {
    // Ignore private browsing or blocked storage. Signup still worked.
  }
}

function clearSubscribed() {
  try {
    window.localStorage.removeItem(NEWSLETTER_SUBSCRIBED_KEY);
  } catch {
    // Ignore private browsing or blocked storage.
  }
}

function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#2563eb", "#f97316", "#22c55e", "#facc15", "#ec4899"];
  const count = 28;

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    const x = 50 + (Math.random() - 0.5) * 30;
    const y = 42 + (Math.random() - 0.5) * 12;
    const dx = (Math.random() - 0.5) * 260;
    const dy = 120 + Math.random() * 190;
    const rotate = (Math.random() - 0.5) * 720;

    piece.setAttribute("aria-hidden", "true");
    piece.style.position = "fixed";
    piece.style.left = `${x}vw`;
    piece.style.top = `${y}vh`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.6}px`;
    piece.style.borderRadius = "2px";
    piece.style.background = colors[i % colors.length];
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "9999";
    piece.style.transform = "translate(-50%, -50%)";

    document.body.appendChild(piece);
    piece
      .animate(
        [
          { opacity: 1, transform: "translate(-50%, -50%) rotate(0deg)" },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotate}deg)`,
          },
        ],
        {
          duration: 900 + Math.random() * 350,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      )
      .finished.finally(() => piece.remove());
  }
}

export default function setup(Alpine: AlpineRuntime) {
  Alpine.store("menu", {
    open: false,
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
  });

  Alpine.data("menuToggle", () => ({
    get open() {
      return Alpine.store("menu").open;
    },
    toggle() {
      Alpine.store("menu").toggle();
    },
  }));

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
    successHeading: "Check your email",
    successDescription:
      "I sent you a confirmation link. Move it to your inbox if it lands somewhere weird.",
    successSubject: "Check your email inbox",

    get ready() {
      return this.email.trim().length > 3 && this.email.includes("@");
    },

    init() {
      this.visible = !hasSubscribed();
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
          body: JSON.stringify({ email: this.email, source: config.source ?? "ian.is" }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };

        if (res.ok && data.ok === true) {
          this.status = "success";
          this.message = "You're in. Check your inbox to confirm.";
          this.email = "";
          saveSubscribed();
          burstConfetti();
          return;
        }

        clearSubscribed();
        this.status = "error";
        this.message = data.error ?? "Something went wrong. Please try again.";
      } catch {
        clearSubscribed();
        this.status = "error";
        this.message = "Network error. Please try again.";
      }
    },
  }));
}
