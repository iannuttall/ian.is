import type { AlpineRuntime } from "./types";

const TTL_MS = 12 * 60 * 60 * 1000;

type Cached = {
  count: number;
  at: number;
};

type GithubStarsOptions = {
  repo: string;
  initial?: number | null;
};

type GithubStarsState = {
  repo: string;
  count: number | null;
  readonly label: string;
  init(): void;
  refresh(): Promise<void>;
};

function read(repo: string): Cached | null {
  try {
    const raw = window.localStorage.getItem(`gh-stars:${repo}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Cached;
    if (typeof parsed.count !== "number" || typeof parsed.at !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}

function write(repo: string, count: number): void {
  try {
    window.localStorage.setItem(`gh-stars:${repo}`, JSON.stringify({ count, at: Date.now() }));
  } catch {
    // Private browsing or blocked storage. The count still shows this visit.
  }
}

// The buttons appear more than once per page, and every instance calls init()
// before any fetch resolves, so without this each one fires its own request.
const inflight = new Map<string, Promise<number | null>>();

function fetchCount(repo: string): Promise<number | null> {
  const existing = inflight.get(repo);
  if (existing) return existing;

  const request = (async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) return null;

      const data = (await response.json()) as { stargazers_count?: number };
      return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    } catch {
      return null;
    } finally {
      inflight.delete(repo);
    }
  })();

  inflight.set(repo, request);
  return request;
}

export function registerGithubStars(Alpine: AlpineRuntime) {
  Alpine.data(
    "githubStars",
    (options: GithubStarsOptions): GithubStarsState => ({
      repo: options.repo,
      count: options.initial ?? null,

      get label() {
        if (this.count === null) return "Open source";
        const plural = this.count === 1 ? "star" : "stars";
        return `${this.count.toLocaleString("en-US")} ${plural} · Open source`;
      },

      init() {
        const cached = read(this.repo);

        if (cached) {
          this.count = cached.count;
          if (Date.now() - cached.at < TTL_MS) return;
        }

        void this.refresh();
      },

      async refresh() {
        const count = await fetchCount(this.repo);

        // Offline, rate limited, or an unexpected shape. Whatever was baked in
        // at build time or read from the cache stands.
        if (count === null) return;

        this.count = count;
        write(this.repo, count);
      },
    }),
  );
}
