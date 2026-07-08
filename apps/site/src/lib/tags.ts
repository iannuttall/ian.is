import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

export type PostTagGroup = {
  slug: string;
  label: string;
  posts: Post[];
  count: number;
};

export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPostTagGroups(posts: Post[]) {
  const groups = new Map<string, PostTagGroup>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const label = tag.trim();
      const slug = slugifyTag(label);

      if (!slug) continue;

      const group = groups.get(slug);

      if (group) {
        group.posts.push(post);
        group.count = group.posts.length;
      } else {
        groups.set(slug, {
          slug,
          label,
          posts: [post],
          count: 1,
        });
      }
    }
  }

  return [...groups.values()].sort((a, b) => {
    if (a.label.toLowerCase() === b.label.toLowerCase()) {
      return 0;
    }

    return a.label.localeCompare(b.label);
  });
}

export function findPostTagGroup(posts: Post[], slug: string) {
  return getPostTagGroups(posts).find((group) => group.slug === slug);
}
