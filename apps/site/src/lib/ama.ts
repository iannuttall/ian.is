import { getCollection, type CollectionEntry } from "astro:content";

/** Answered questions, newest answer first. Drafts stay hidden. */
export async function getAnsweredQuestions(): Promise<CollectionEntry<"ama">[]> {
  const entries = (await getCollection("ama")) as CollectionEntry<"ama">[];

  return entries
    .filter((entry) => entry.data.draft !== true)
    .sort((a, b) => b.data.answered.getTime() - a.data.answered.getTime());
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatAmaDate(date: Date) {
  return dateFormatter.format(date);
}
