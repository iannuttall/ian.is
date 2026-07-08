import { getCollection } from "astro:content";

/** Published posts, newest first. Drafts are hidden in production only. */
export async function getPublishedPosts() {
  const posts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts.sort(
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
