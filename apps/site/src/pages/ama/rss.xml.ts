export const prerender = true;

import type { APIContext } from "astro";
import { feeds, renderFeed } from "@/lib/feeds";

export async function GET(context: APIContext) {
  return renderFeed(feeds.ama, context);
}
