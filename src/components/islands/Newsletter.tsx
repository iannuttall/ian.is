import { type SyntheticEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

type NewsletterProps = {
  /** Fully-rounded card (default) vs. flush card with square bottom corners. */
  standalone?: boolean;
  heading?: string;
  description?: string;
  /** Where the signup came from, forwarded to the list backend. */
  source?: string;
};

export function Newsletter({
  standalone = true,
  heading = "Subscribe to Ian's List",
  description = "What I learned this week actually using AI to run my business.",
  source = "ian.is",
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Decorative "issue date" in the email mockup — client-side so it reflects the
  // visitor's current date, not the prerendered build date.
  const [issueDate, setIssueDate] = useState("");
  useEffect(() => {
    setIssueDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const ready = email.trim().length > 3 && email.includes("@");

  const submit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're in. Check your inbox to confirm.");
        setEmail("");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section
      className={cn(
        "@container relative w-full overflow-hidden bg-card",
        standalone
          ? "rounded-2xl ring-[0.5px] ring-black/5 shadow-[0_8px_44px_-12px_rgba(0,0,0,0.12)] dark:ring-white/10"
          : // Flush variant: top + sides only — the parent section's border-b is the bottom edge.
            "rounded-t-2xl border-x border-t border-black/[0.06] shadow-xs dark:border-white/10",
      )}
    >
      <div className="grid grid-cols-1 @lg:grid-cols-[22rem_1fr]">
        {/* Left: copy + form */}
        <div className="flex flex-col gap-5 p-6 @lg:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <LogoMark />
              <div className="font-semibold">{heading}</div>
            </div>
            <p className="text-pretty leading-snug text-foreground-muted">
              {description}
            </p>
          </div>

          {status === "success" ? (
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckIcon />
              {message}
            </p>
          ) : (
            <form className="w-full" onSubmit={submit}>
              <div className="relative">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="sam@openai.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-full border border-border bg-background pr-12 pl-4 text-[15px] text-foreground outline-none transition-[color,box-shadow] placeholder:text-foreground-soft focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !ready}
                  aria-label="Subscribe"
                  className={cn(
                    "absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
                    ready
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-foreground/10 text-foreground/30",
                  )}
                >
                  {status === "loading" ? <Spinner /> : <ArrowUpIcon />}
                </button>
              </div>
              {status === "error" ? (
                <p className="mt-2 text-sm text-destructive">{message}</p>
              ) : null}
            </form>
          )}
        </div>

        {/* Right: decorative clipped email stack (clipped flush to the card bottom). */}
        <div className="relative hidden select-none @lg:block" aria-hidden="true">
          <div className="absolute top-13 -right-11 flex aspect-[3/5] min-w-80 rotate-1 flex-col gap-4 rounded-lg bg-background-raised p-6 shadow-lg ring-[0.5px] ring-black/5 dark:bg-white/[0.06] dark:ring-white/10" />
          <div className="absolute top-12 -right-12 flex aspect-[3/5] min-w-80 rotate-3 flex-col gap-4 rounded-lg bg-background-raised p-6 shadow-lg ring-[0.5px] ring-black/5 dark:bg-secondary dark:ring-white/10">
            <div className="flex flex-col gap-0.5">
              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-foreground-soft">
                <span>From:</span>
                <span className="col-span-3">Ian</span>
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs text-foreground-soft">
                <span>To:</span>
                <span className="col-span-3">you@gmail.com</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold text-foreground">I built a new thing</div>
              <div className="text-sm text-foreground-muted">{issueDate}</div>
            </div>
            <div className="flex flex-col gap-3">
              {["80%", "60%", "70%", "30%", "55%"].map((w) => (
                <div
                  key={w}
                  className="h-2 rounded-full bg-foreground/10"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The site's staircase logo mark — identical geometry and colors to
 *  public/favicon.svg (hard corners, exact greys) with the same light/dark
 *  inversion, expressed via light-dark() instead of the favicon's <style>. */
function LogoMark() {
  const u = 161.33;
  const X = [0, 175.33, 350.67];
  // [x, y, fill] — fill is light-dark(<light>, <dark>) matching the favicon.
  const cells: [number, number, string][] = [
    [X[0], X[2], "light-dark(#969696,#696969)"],
    [X[1], X[2], "light-dark(#737373,#8c8c8c)"],
    [X[1], X[1], "light-dark(#505050,#afafaf)"],
    [X[2], X[2], "light-dark(#505050,#afafaf)"],
    [X[2], X[1], "light-dark(#2d2d2d,#d2d2d2)"],
    [X[2], X[0], "light-dark(#0a0a0a,#f5f5f5)"],
  ];
  return (
    <svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true">
      {cells.map(([x, y, fill]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={u} height={u} style={{ fill }} />
      ))}
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M17.25 10.25 12 4.75l-5.25 5.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M12 19.25V5.75"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
