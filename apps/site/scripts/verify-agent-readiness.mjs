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
// The home page carries no contact or developer links by design; agents
// reach those routes through the 404 page, llms.txt, and agents.md below.

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
for (const href of ["/openapi.json", "/api/v1/resources", "/server.json"]) {
  assert.match(developers, new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
}

const llms = await output("llms.txt");
assert.match(llms, /^# Ian Nuttall\n\n> .+\n/u);
assert.match(llms, /## When to use this site\n/u);
assert.match(llms, /\[Ian Nuttall developer resources\]\(https:\/\/ian\.is\/developers\.md\)/u);
assert.match(llms, /\[Ian Nuttall agent instructions\]\(https:\/\/ian\.is\/agents\.md\)/u);
assert.match(llms, /\[Ian Nuttall OpenAPI description\]\(https:\/\/ian\.is\/openapi\.json\)/u);
assert.match(llms, /\[Ian Nuttall MCP Registry manifest\]\(https:\/\/ian\.is\/server\.json\)/u);
assert.match(llms, /\[Unclaimed CLI on npm\]\(https:\/\/www\.npmjs\.com\/package\/unclaimed\)/u);
const llmsUrls = [];
for (const line of llms.split("\n")) {
  if (!line.startsWith("- [")) continue;
  const url = line.match(/\]\(([^)]+)\)/u)?.[1];
  assert.doesNotThrow(() => new URL(url), `llms.txt file-list URL must be absolute: ${line}`);
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
assert.match(agents, /https:\/\/ian\.is\/openapi\.json/u);
assert.match(agents, /https:\/\/ian\.is\/server\.json/u);

const skill = await output(".well-known/agent-skills/ian-is/SKILL.md");
assert.match(skill, /## When to use this site/u);
assert.match(skill, /https:\/\/ian\.is\/developers/u);
assert.match(skill, /https:\/\/ian\.is\/openapi\.json/u);
assert.match(skill, /https:\/\/ian\.is\/server\.json/u);

const headers = await output("_headers");
assert.match(headers, /\/agents\.md\n(?: {2}.+\n)+/u);
assert.match(headers, /\/agents\.md[\s\S]*?Content-Type: text\/markdown; charset=utf-8/u);
assert.match(headers, /^\/\n  ! Cache-Control\n  Cache-Control: public, max-age=0, must-revalidate$/mu);
assert.match(headers, /Link: <https:\/\/ian\.is\/openapi\.json>; rel="service-desc"/u);

const openapi = JSON.parse(await output("openapi.json"));
assert.equal(openapi.openapi, "3.1.1");
const operationIds = [];
for (const pathItem of Object.values(openapi.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!["get", "post", "put", "patch", "delete", "options", "head", "trace"].includes(method)) continue;
    assert.ok(operation.operationId, `${method} operation must have an operationId`);
    assert.ok(operation.description, `${operation.operationId} must have a description`);
    assert.ok(operation.responses, `${operation.operationId} must define responses`);
    operationIds.push(operation.operationId);
  }
}
assert.equal(new Set(operationIds).size, operationIds.length, "OpenAPI operationIds must be unique");
assert.ok(openapi.components.schemas.ProblemDetails.properties.resolution);

const mcpManifest = JSON.parse(await output("server.json"));
assert.equal(mcpManifest.name, "is.ian/site");
assert.equal(mcpManifest.remotes[0].type, "streamable-http");
assert.equal(mcpManifest.remotes[0].url, "https://ian.is/mcp");

const apiCatalog = JSON.parse(await output(".well-known/api-catalog"));
assert.equal(
  apiCatalog.linkset[0]["service-desc"][0].href,
  "https://ian.is/openapi.json",
);

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
