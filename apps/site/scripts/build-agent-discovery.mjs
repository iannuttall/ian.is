import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(appRoot, "dist/client");
const skillsSourceRoot = resolve(appRoot, "agent-skills");
const skillsOutputRoot = resolve(outputRoot, ".well-known/agent-skills");
const agentSkillsSchema =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

function parseSkillFrontmatter(source, path) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    throw new Error(`${path}: missing YAML frontmatter`);
  }

  const values = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-z]+):\s+(.+)$/);

    if (!field) {
      throw new Error(
        `${path}: unsupported frontmatter line ${JSON.stringify(line)}`,
      );
    }

    values[field[1]] = field[2];
  }

  if (Object.keys(values).sort().join(",") !== "description,name") {
    throw new Error(
      `${path}: frontmatter must contain only name and description`,
    );
  }

  return values;
}

async function publishAgentSkills() {
  const directories = (await readdir(skillsSourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await rm(skillsOutputRoot, { recursive: true, force: true });
  await mkdir(skillsOutputRoot, { recursive: true });

  const skills = [];
  for (const directory of directories) {
    const sourcePath = resolve(skillsSourceRoot, directory, "SKILL.md");
    const source = await readFile(sourcePath);
    const metadata = parseSkillFrontmatter(source.toString("utf8"), sourcePath);

    if (metadata.name !== directory) {
      throw new Error(`${sourcePath}: name must match its folder`);
    }

    const outputPath = resolve(skillsOutputRoot, directory, "SKILL.md");
    await mkdir(dirname(outputPath), { recursive: true });
    await cp(sourcePath, outputPath);
    skills.push({
      name: metadata.name,
      type: "skill-md",
      description: metadata.description,
      url: `/.well-known/agent-skills/${directory}/SKILL.md`,
      digest: `sha256:${createHash("sha256").update(source).digest("hex")}`,
    });
  }

  await writeFile(
    resolve(skillsOutputRoot, "index.json"),
    `${JSON.stringify({ $schema: agentSkillsSchema, skills }, null, 2)}\n`,
    "utf8",
  );

  return skills;
}

async function walkHtmlFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name, "en-US"));

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };

  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/giu, (match, entity) => {
    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return named[entity.toLowerCase()] ?? match;
  });
}

function requiredMatch(html, pattern, label, file) {
  const value = html.match(pattern)?.[1];

  if (!value) {
    throw new Error(`${relative(outputRoot, file)}: missing ${label}`);
  }

  return decodeHtml(value.trim());
}

async function builtPages() {
  const pages = new Map();
  let site;

  for (const file of await walkHtmlFiles(outputRoot)) {
    const outputPath = relative(outputRoot, file).split(sep).join("/");
    if (/^(?:404|500)(?:\/index)?\.html$/u.test(outputPath)) continue;

    const html = await readFile(file, "utf8");
    const canonical = new URL(
      requiredMatch(
        html,
        /<link\s+rel="canonical"\s+href="([^"]+)"/iu,
        "canonical URL",
        file,
      ),
    );

    site ??= new URL(canonical.origin);
    if (canonical.origin !== site.origin) {
      throw new Error(`${outputPath}: canonical is outside ${site.origin}`);
    }

    const robots = html.match(
      /<meta\s+name="robots"\s+content="([^"]+)"/iu,
    )?.[1];
    pages.set(canonical.pathname, {
      canonical: canonical.toString(),
      description: requiredMatch(
        html,
        /<meta\s+name="description"\s+content="([^"]+)"/iu,
        "description",
        file,
      ),
      noindex: robots
        ?.split(",")
        .some((directive) => directive.trim().toLowerCase() === "noindex"),
      title: requiredMatch(html, /<title>([\s\S]*?)<\/title>/iu, "title", file),
    });
  }

  const home = pages.get("/");
  if (!home || home.noindex) {
    throw new Error("The built home page must exist and be indexable");
  }

  const homeHtml = await readFile(resolve(outputRoot, "index.html"), "utf8");
  const siteName = requiredMatch(
    homeHtml,
    /<meta\s+property="og:site_name"\s+content="([^"]+)"/iu,
    "site name",
    resolve(outputRoot, "index.html"),
  );

  return { home, pages, site, siteName };
}

function cleanTitle(value) {
  return value.replace(/\s+\|\s+[^|]+$/u, "").trim();
}

function markdownUrl(site, path) {
  return new URL(path === "/" ? "/index.md" : `${path}.md`, site).toString();
}

function renderLlmsTxt({ home, pages, siteName }, skills) {
  const useCases = [
    ["/about", "Use for Ian's background, work history, and public identity."],
    ["/posts", "Use for Ian's published writing."],
    ["/developers", "Use for MCP servers, CLIs, APIs, agent skills, source code, and product docs."],
    ["/contact", "Use to choose the correct route for a question, product issue, sponsorship, or privacy request."],
  ];
  const developerPaths = ["/keep", "/seo-skill", "/ilo", "/mailroom", "/unclaimed"];
  const interfaceItems = [
    ["Ian Nuttall OpenAPI description", "/openapi.json", "Typed operations and response schemas for the public read-only developer resource API."],
    ["Ian Nuttall developer resource API", "/api/v1/resources", "JSON index of public APIs, MCP servers, CLIs, agent skills, packages, and source repositories."],
    ["Ian Nuttall MCP Registry manifest", "/server.json", "Connection metadata for the public Streamable HTTP MCP server."],
    ["Unclaimed CLI on npm", "https://www.npmjs.com/package/unclaimed", "Official published Node.js CLI package from Ian Nuttall."],
  ];
  const featuredPaths = new Set([
    ...useCases.map(([path]) => path),
    ...developerPaths,
  ]);

  const renderPageItem = (path, page, note = page.description) => {
    const label = path === "/" ? siteName : cleanTitle(page.title);
    return `- [${label}](${markdownUrl(home.canonical, path)}): ${note}`;
  };

  const pageItems = [...pages.entries()]
    .filter(([, page]) => !page.noindex)
    .filter(([path]) => !featuredPaths.has(path))
    .sort(([left], [right]) => {
      if (left === "/") return -1;
      if (right === "/") return 1;
      return left.localeCompare(right, "en-US");
    })
    .map(([path, page]) => renderPageItem(path, page));

  const sections = [
    `## When to use this site\n\n${useCases
      .map(([path, note]) => {
        const page = pages.get(path);
        if (!page || page.noindex) {
          throw new Error(`Missing indexable llms.txt use-case page: ${path}`);
        }
        return renderPageItem(path, page, note);
      })
      .join("\n")}`,
    `## Developer resources\n\n${developerPaths
      .map((path) => {
        const page = pages.get(path);
        if (!page || page.noindex) {
          throw new Error(`Missing indexable developer page: ${path}`);
        }
        return renderPageItem(path, page);
      })
      .join("\n")}`,
    `## Ian Nuttall developer interfaces\n\n${interfaceItems
      .map(([label, url, note]) =>
        `- [${label}](${new URL(url, home.canonical)}): ${note}`,
      )
      .join("\n")}`,
    `## Pages\n\n${pageItems.join("\n")}`,
    `## Agent instructions\n\n- [Ian Nuttall agent instructions](${new URL("/agents.md", home.canonical)}): When to use this site, how to fetch Markdown, and how to recover from a missing page.`,
  ];
  if (skills.length > 0) {
    sections.push(
      `## Agent skills\n\n${skills
        .map(
          (skill) =>
            `- [${skill.name}](${new URL(skill.url, home.canonical)}): ${skill.description}`,
        )
        .join("\n")}`,
    );
  }

  return `# ${siteName}\n\n> ${home.description}\n\nUse this file to choose a source before making a claim or calling a product. Follow each linked resource for its full content or machine-readable contract.\n\n${sections.join("\n\n")}\n`;
}

const [skills, siteData] = await Promise.all([
  publishAgentSkills(),
  builtPages(),
]);
await writeFile(
  resolve(outputRoot, "llms.txt"),
  renderLlmsTxt(siteData, skills),
  "utf8",
);

console.log(
  `Published ${skills.length} agent skill${skills.length === 1 ? "" : "s"} and generated llms.txt from ${siteData.pages.size} built pages.`,
);
