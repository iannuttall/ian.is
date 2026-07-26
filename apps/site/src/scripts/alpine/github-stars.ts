import type { AlpineRuntime } from "./types";

const TTL_MS = 12 * 60 * 60 * 1000;

type Cached = {
  count: number;
  at: number;
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

export function registerGithubStars(Alpine: AlpineRuntime) {
  Alpine.store("githubStars", {
    counts: {} as Record<string, number | null>,
    requested: {} as Record<string, true>,

    label(repo: string) {
      const count = this.counts[repo];
      if (typeof count !== "number") return "Open source";

      return `${count.toLocaleString("en-US")} ${count === 1 ? "star" : "stars"} · Open source`;
    },

    load(repo: string, initial: number | null) {
      // The buttons appear more than once per page. Every instance calls this,
      // and only the first gets past here, so one repo means one request.
      if (this.requested[repo]) return;
      this.requested[repo] = true;

      const cached = read(repo);
      this.counts[repo] = cached ? cached.count : initial;

      if (cached && Date.now() - cached.at < TTL_MS) return;

      void this.refresh(repo);
    },

    async refresh(repo: string) {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;

        const data = (await response.json()) as { stargazers_count?: number };
        if (typeof data.stargazers_count !== "number") return;

        this.counts[repo] = data.stargazers_count;
        write(repo, data.stargazers_count);
      } catch {
        // Offline or rate limited. The build-time value or the cache stands.
      }
    },
  });

  Alpine.data("githubStars", (options: { repo: string; initial?: number | null }) => ({
    init() {
      Alpine.store("githubStars").load(options.repo, options.initial ?? null);
    },

    get label() {
      return Alpine.store("githubStars").label(options.repo);
    },
  }));
}
