import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE = process.env.SITE_URL ?? "https://ian.is";
const PUBLIC_DIR = resolve(process.cwd(), "public");
const SITEMAPS_DIR = resolve(PUBLIC_DIR, "sitemaps");
const POSTS_DIR = resolve(process.cwd(), "src/content/posts");

function postSlugs() {
  try {
    return readdirSync(POSTS_DIR)
      .filter((name) => /\.(md|mdx)$/.test(name))
      .map((name) => name.replace(/\.(md|mdx)$/, ""));
  } catch {
    return [];
  }
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlSet(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n")}
</urlset>
`;
}

function sitemapIndex(paths) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <sitemap><loc>${xmlEscape(new URL(path, SITE).toString())}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;
}

const pages = [
  "/",
  "/posts",
  "/tools",
  ...postSlugs().map((slug) => `/post/${slug}`),
].map((path) => new URL(path, SITE).toString());

rmSync(SITEMAPS_DIR, { recursive: true, force: true });
mkdirSync(SITEMAPS_DIR, { recursive: true });

writeFileSync(resolve(SITEMAPS_DIR, "pages.xml"), urlSet(pages), "utf8");
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemapIndex(["/sitemaps/pages.xml"]), "utf8");

console.log(`Wrote ${pages.length} URLs to public/sitemap.xml`);

