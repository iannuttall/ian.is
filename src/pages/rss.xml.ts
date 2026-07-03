export const prerender = true;

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedPosts } from "@/lib/posts";
import { siteDescription, siteName } from "@/lib/site";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: siteName,
    description: siteDescription,
    site: context.site ?? "https://ian.is",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/post/${post.id}`,
    })),
  });
}
