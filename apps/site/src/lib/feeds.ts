import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAnsweredQuestions } from "@/lib/ama";
import { getPublishedPosts } from "@/lib/posts";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

type FeedItem = {
  title: string;
  description?: string;
  pubDate: Date;
  link: string;
};

export type FeedDefinition = {
  /** Public path the feed route serves. */
  path: string;
  title: string;
  description: string;
  load: () => Promise<FeedItem[]>;
};

/** Crude plain-text preview of a markdown body for feed descriptions. */
function markdownPreview(markdown: string, max = 280): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * Single registry for every collection-backed feed. Routes call renderFeed
 * with one of these; the layout renders an alternate link for each entry.
 * New collections plug in here and get a feed + autodiscovery for free.
 */
export const feeds = {
  posts: {
    path: "/rss.xml",
    title: siteName,
    description: siteDescription,
    load: async () =>
      (await getPublishedPosts()).map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/post/${post.id}`,
      })),
  },
  ama: {
    path: "/ama/rss.xml",
    title: `${siteName} — AMA`,
    description: "Questions people ask me, answered.",
    load: async () =>
      (await getAnsweredQuestions()).map((entry) => ({
        title: entry.data.question,
        description: markdownPreview(entry.body ?? ""),
        pubDate: entry.data.answered,
        link: `/ama/${entry.id}`,
      })),
  },
} satisfies Record<string, FeedDefinition>;

export const feedLinks = Object.values(feeds).map(({ path, title }) => ({
  path,
  title,
}));

export async function renderFeed(feed: FeedDefinition, context: APIContext) {
  return rss({
    title: feed.title,
    description: feed.description,
    site: context.site ?? siteUrl,
    trailingSlash: false,
    items: await feed.load(),
  });
}
