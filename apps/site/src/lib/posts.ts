import { getCollection, type CollectionEntry } from "astro:content";

/** Published posts, newest first. Drafts are always hidden from public routes. */
export async function getPublishedPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = (await getCollection("posts")) as CollectionEntry<"posts">[];

  return posts.filter((post) => post.data.draft !== true).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatPostDate(date: Date) {
  return dateFormatter.format(date);
}
