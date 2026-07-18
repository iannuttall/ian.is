import { getCollection, type CollectionEntry } from "astro:content";

/** Published feed notes, newest first. Drafts stay hidden. */
export async function getPublishedNotes(): Promise<CollectionEntry<"feed">[]> {
  const entries = (await getCollection("feed")) as CollectionEntry<"feed">[];

  return entries
    .filter((entry) => entry.data.draft !== true)
    .sort((a, b) => b.data.posted.getTime() - a.data.posted.getTime());
}

/** Notes per feed page; older notes paginate under /feed/page/N. */
export const FEED_PAGE_SIZE = 50;

/** Plain-text version of a note body (markdown syntax stripped). */
export function notePlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Short plain-text preview of a note, for titles, crumbs, and feeds. */
export function notePreview(markdown: string, max = 80): string {
  const text = notePlainText(markdown);
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatFeedDate(date: Date) {
  return dateFormatter.format(date);
}
