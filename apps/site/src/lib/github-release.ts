/**
 * Build-time GitHub metadata for project pages. Every fetch here must fail
 * soft — a GitHub outage or rate limit can never break the build, the page
 * just renders without the live detail.
 */

export type ReleaseInfo = {
  /** Tag name as published, e.g. "v0.3.2". */
  version: string;
  /** Human label for the main asset, e.g. "4.5 MB". Null when no asset. */
  sizeLabel: string | null;
};

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "ian.is",
};

export async function fetchLatestRelease(repo: string): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: GITHUB_HEADERS,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      tag_name?: string;
      assets?: Array<{ name?: string; size?: number }>;
    };
    if (!data.tag_name) return null;

    const asset = (data.assets ?? []).find(
      (candidate) => candidate.name?.endsWith(".dmg") || candidate.name?.endsWith(".zip"),
    );

    return {
      version: data.tag_name,
      sizeLabel:
        typeof asset?.size === "number" ? `${(asset.size / 1_000_000).toFixed(1)} MB` : null,
    };
  } catch {
    return null;
  }
}

export async function fetchStars(repo: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: GITHUB_HEADERS,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
