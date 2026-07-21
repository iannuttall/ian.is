import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

const SITE = process.env.SITE_URL ?? "https://ian.is";
const PUBLIC_DIR = resolve(process.cwd(), "public");
const SITEMAPS_DIR = resolve(PUBLIC_DIR, "sitemaps");
const POSTS_DIR = resolve(process.cwd(), "src/content/posts");
const AMA_DIR = resolve(process.cwd(), "src/content/ama");
const FEED_DIR = resolve(process.cwd(), "src/content/feed");
const ISSUES_DIR = resolve(process.cwd(), "src/content/issues");

function slugifyTag(tag) {
  return tag
    .trim()
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function postFiles(dir = POSTS_DIR) {
  try {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return postFiles(path);
      }

      if (!/\.(md|mdx)$/.test(entry.name)) {
        return [];
      }

      return [path];
    });
  } catch {
    return [];
  }
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? "";
}

function frontmatterTags(data) {
  const inline = data.match(/^tags:\s*\[(.*)]\s*$/m);

  if (inline) {
    return [...inline[1].matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
  }

  const block = data.match(/^tags:\s*\r?\n((?:\s+-\s+.+\r?\n?)+)/m);

  if (!block) {
    return [];
  }

  return block[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^\s+-\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .map((tag) => tag.replace(/^["']|["']$/g, ""));
}

function posts() {
  return postFiles().flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const data = frontmatter(source);

    if (/^draft:\s*true\s*$/m.test(data)) {
      return [];
    }

    return [
      {
        slug: relative(POSTS_DIR, path).replace(/\.(md|mdx)$/, ""),
        tags: frontmatterTags(data),
      },
    ];
  });
}

function amaSlugs() {
  return postFiles(AMA_DIR).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const data = frontmatter(source);

    if (/^draft:\s*true\s*$/m.test(data)) {
      return [];
    }

    return [relative(AMA_DIR, path).replace(/\.(md|mdx)$/, "")];
  });
}

function feedSlugs() {
  return postFiles(FEED_DIR).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const data = frontmatter(source);

    if (/^draft:\s*true\s*$/m.test(data)) {
      return [];
    }

    return [relative(FEED_DIR, path).replace(/\.(md|mdx)$/, "")];
  });
}

function issueSlugs() {
  return postFiles(ISSUES_DIR).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const data = frontmatter(source);

    if (/^draft:\s*true\s*$/m.test(data)) {
      return [];
    }

    return [relative(ISSUES_DIR, path).replace(/\.(md|mdx)$/, "")];
  });
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

const postEntries = posts();
const tagSlugs = [
  ...new Set(
    postEntries.flatMap((post) => post.tags.map(slugifyTag).filter(Boolean)),
  ),
].sort();

const pages = [
  "/",
  "/about",
  "/advertise",
  "/ama",
  "/feed",
  "/issues",
  "/posts",
  "/tags",
  "/tools",
  ...postEntries.map((post) => `/post/${post.slug}`),
  ...amaSlugs().map((slug) => `/ama/${slug}`),
  ...feedSlugs().map((slug) => `/feed/${slug}`),
  ...issueSlugs().map((slug) => `/issues/${slug}`),
  ...tagSlugs.map((tag) => `/tags/${tag}`),
].map((path) => new URL(path, SITE).toString());

rmSync(SITEMAPS_DIR, { recursive: true, force: true });
mkdirSync(SITEMAPS_DIR, { recursive: true });

writeFileSync(resolve(SITEMAPS_DIR, "pages.xml"), urlSet(pages), "utf8");
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemapIndex(["/sitemaps/pages.xml"]), "utf8");

console.log(`Wrote ${pages.length} URLs to public/sitemap.xml`);
