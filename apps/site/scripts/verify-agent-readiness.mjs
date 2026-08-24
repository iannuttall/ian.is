import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputRoot = resolve(import.meta.dirname, "../dist/client");

async function output(path) {
  return readFile(resolve(outputRoot, path), "utf8");
}

function mainHtml(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/iu)?.[1] ?? "";
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&(?:amp|#38);/gu, "&")
    .replace(/&(?:apos|#39);/gu, "'")
    .replace(/&(?:quot|#34);/gu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

function headingLevels(html) {
  return [...html.matchAll(/<h([1-6])\b/giu)].map((match) => Number(match[1]));
}

function assertHeadingStructure(html, page) {
  const levels = headingLevels(mainHtml(html));
  assert.equal(levels.filter((level) => level === 1).length, 1, `${page} must have one H1`);
  assert.ok(levels.includes(2), `${page} must have an H2`);
  assert.ok(levels.includes(3), `${page} must have an H3`);
  for (let index = 1; index < levels.length; index += 1) {
    assert.ok(
      levels[index] <= levels[index - 1] + 1,
      `${page} heading levels must not skip from H${levels[index - 1]} to H${levels[index]}`,
    );
  }
}

const home = await output("index.html");
assert.ok(visibleText(mainHtml(home)).length >= 500, "home must include at least 500 visible SSR characters");
assertHeadingStructure(home, "home");
for (const href of ["/contact", "/developers"]) {
  assert.match(home, new RegExp(`href=["']${href}["']`));
}

const notFound = await output("404.html");
for (const href of ["/sitemap.xml", "/llms.txt", "/developers"]) {
  assert.match(notFound, new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
}

const contact = await output("contact/index.html");
assert.match(contact, /<h1\b[^>]*>\s*Contact Ian Nuttall\s*<\/h1>/u);
assert.ok(visibleText(mainHtml(contact)).length >= 500, "contact must include at least 500 visible characters");

const developers = await output("developers/index.html");
assert.match(developers, /<title>Ian Nuttall developer resources \| Ian Nuttall<\/title>/u);
assert.match(developers, /<h1\b[^>]*>\s*Ian Nuttall developer resources\s*<\/h1>/u);
assertHeadingStructure(developers, "developers");
for (const term of ["MCP", "CLI", "API", "agent skill", "source code"]) {
  assert.ok(visibleText(mainHtml(developers)).includes(term), `developers must name ${term}`);
}

const llms = await output("llms.txt");
assert.match(llms, /^# Ian Nuttall\n\n> .+\n/u);
assert.match(llms, /## When to use this site\n/u);
assert.match(llms, /\[Ian Nuttall developer resources\]\(https:\/\/ian\.is\/developers\.md\)/u);
assert.match(llms, /\[Ian Nuttall agent instructions\]\(https:\/\/ian\.is\/agents\.md\)/u);
const llmsUrls = [];
for (const line of llms.split("\n")) {
  if (!line.startsWith("- [")) continue;
  const url = line.match(/\]\(([^)]+)\)/u)?.[1];
  assert.ok(url?.endsWith(".md"), `llms.txt file-list URL must be Markdown: ${line}`);
  llmsUrls.push(url);
}
assert.equal(new Set(llmsUrls).size, llmsUrls.length, "llms.txt must not repeat file-list URLs");
for (const section of llms.split(/^## /gmu).slice(1)) {
  const lines = section.split("\n").slice(1).filter(Boolean);
  assert.ok(lines.length > 0, "each llms.txt H2 section must contain a file list");
  assert.ok(lines.every((line) => line.startsWith("- [")), "llms.txt H2 sections must contain file lists only");
}

const agents = await output("agents.md");
assert.match(agents, /## When to use this site/u);
assert.match(agents, /Accept: text\/markdown/u);
assert.match(agents, /https:\/\/ian\.is\/developers\.md/u);

const skill = await output(".well-known/agent-skills/ian-is/SKILL.md");
assert.match(skill, /## When to use this site/u);
assert.match(skill, /https:\/\/ian\.is\/developers/u);

const headers = await output("_headers");
assert.match(headers, /\/agents\.md\n(?: {2}.+\n)+/u);
assert.match(headers, /\/agents\.md[\s\S]*?Content-Type: text\/markdown; charset=utf-8/u);

const sitemap = await output("sitemaps/pages.xml");
for (const url of ["https://ian.is/bot-domains", "https://ian.is/contact", "https://ian.is/developers"]) {
  assert.match(sitemap, new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>`));
}

const routes = JSON.parse(await output("agent-routes.json"));
for (const path of ["/contact", "/developers"]) {
  const page = routes.pages.find((entry) => entry.htmlPath === path);
  assert.ok(page, `agent routes must include ${path}`);
  assert.equal(page.markdownPath, `${path}.md`, `agent routes must include ${path}.md`);
}

console.log("Verified agent-ready pages and discovery files.");
