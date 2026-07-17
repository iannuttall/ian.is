import type { CollectionEntry } from "astro:content";
import { siteName } from "@/lib/site";
import type { SeoBreadcrumbItem } from "@/lib/seo";

export type BreadcrumbInput = SeoBreadcrumbItem | string;

const homeCrumb: SeoBreadcrumbItem = {
  label: siteName,
  href: "/",
};

function normalizeCrumb(item: BreadcrumbInput): SeoBreadcrumbItem {
  return typeof item === "string" ? { label: item } : item;
}

export function siteBreadcrumbs(items: BreadcrumbInput[] = []): SeoBreadcrumbItem[] {
  return [homeCrumb, ...items.map(normalizeCrumb)];
}

export function pageBreadcrumbs(label: string, href: string): SeoBreadcrumbItem[] {
  return siteBreadcrumbs([{ label, href }]);
}

export function postBreadcrumbs(post: CollectionEntry<"posts">): SeoBreadcrumbItem[] {
  const path = `/post/${post.id}`;

  return siteBreadcrumbs([
    { label: "Posts", href: "/posts" },
    { label: post.data.breadcrumbTitle ?? post.data.title, href: path },
  ]);
}

export function amaBreadcrumbs(entry: CollectionEntry<"ama">): SeoBreadcrumbItem[] {
  const path = `/ama/${entry.id}`;

  return siteBreadcrumbs([
    { label: "AMA", href: "/ama" },
    { label: entry.data.breadcrumbTitle ?? entry.data.question, href: path },
  ]);
}

export function tagBreadcrumbs(tag: { label: string; slug: string }): SeoBreadcrumbItem[] {
  return siteBreadcrumbs([
    { label: "Tags", href: "/tags" },
    { label: tag.label, href: `/tags/${tag.slug}` },
  ]);
}
