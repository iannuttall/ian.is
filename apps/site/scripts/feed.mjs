#!/usr/bin/env node
// Feed CLI. Notes are committed markdown in src/content/feed — no database.
// `post` creates a draft (draft: true, hidden from every build surface) and
// opens it in an app; `publish` stamps the posted time, clears the flag, and
// commits/pushes only the note's own paths so unrelated WIP never rides along.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomInt } from "node:crypto";
import * as p from "@clack/prompts";

const SITE_DIR = resolve(import.meta.dirname, "..");
const CONTENT_DIR = resolve(SITE_DIR, "src/content/feed");
const CONTENT_REL = "src/content/feed";

const argv = process.argv.slice(2);
const command = argv[0];
const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
const positional = argv.slice(1).filter((arg) => !arg.startsWith("--"));

function assertSafeId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    console.error(`Invalid id: ${id} (lowercase letters, digits, and dashes only)`);
    process.exit(1);
  }
  return id;
}

function bodyOf(markdown) {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return (match ? match[1] : markdown).trim();
}

// Drafts open in an app, not a blocking terminal editor. Override the
// launcher with IAN_OPEN_CMD (defaults to VS Code's `code`).
function openDraft(path) {
  const command = process.env.IAN_OPEN_CMD ?? "code";
  const [bin, ...args] = command.split(/\s+/);
  let result = spawnSync(bin, [...args, path], { stdio: "ignore" });
  if ((result.error || result.status !== 0) && process.platform === "darwin") {
    result = spawnSync("open", [path], { stdio: "ignore" });
  }
  return !result.error && result.status === 0;
}

function git(args) {
  const result = spawnSync("git", args, { cwd: SITE_DIR, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
  }
  return result.stdout.trim();
}

const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function newId(now) {
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  let id;
  do {
    const suffix = Array.from({ length: 3 }, () => ID_CHARS[randomInt(ID_CHARS.length)]).join("");
    id = `${day}-${suffix}`;
  } while (existsSync(join(CONTENT_DIR, `${id}.md`)));
  return id;
}

function noteFiles() {
  try {
    return readdirSync(CONTENT_DIR)
      .filter((name) => /\.(md|mdx)$/.test(name))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function readNote(name) {
  const source = readFileSync(join(CONTENT_DIR, name), "utf8");
  return {
    id: name.replace(/\.(md|mdx)$/, ""),
    name,
    source,
    draft: /^draft:\s*true\s*$/m.test(source),
    posted: source.match(/^posted:\s*(.+)$/m)?.[1] ?? "",
    preview: bodyOf(source).replace(/\s+/g, " ").slice(0, 70),
  };
}

function findNote(id, notes) {
  assertSafeId(id);
  const matches = notes.filter((note) => note.id === id || note.id.startsWith(id));
  if (matches.length === 0) {
    console.error(`No note matching id ${id}`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Ambiguous id ${id} — matches:`);
    for (const note of matches) console.error(`  ${note.id}`);
    process.exit(1);
  }
  return matches[0];
}

function post() {
  const now = new Date();
  const id = newId(now);
  const target = join(CONTENT_DIR, `${id}.md`);

  mkdirSync(CONTENT_DIR, { recursive: true });
  writeFileSync(target, `---\nposted: ${now.toISOString()}\ndraft: true\n---\n\n`, "utf8");

  if (!openDraft(target)) {
    console.error(`Could not launch the draft app — open ${CONTENT_REL}/${id}.md yourself.`);
  }
  console.log(`Draft: ${CONTENT_REL}/${id}.md — write the note, then: pnpm ian feed publish ${id}`);
}

function commitPaths(paths, message) {
  git(["add", "--", ...paths]);
  git(["commit", "-m", message, "--", ...paths]);
  if (!flags.has("--no-push")) {
    git(["push"]);
  }
}

function publish() {
  const drafts = noteFiles().map(readNote).filter((note) => note.draft);
  if (drafts.length === 0) {
    console.log("No drafts to publish. Start one with: pnpm ian feed post");
    return;
  }

  let note;
  if (positional[0]) {
    note = findNote(positional[0], drafts);
  } else if (drafts.length === 1) {
    note = drafts[0];
  } else {
    console.error("More than one draft — pick one:");
    for (const draft of drafts) console.error(`  ${draft.id}  ${draft.preview}`);
    process.exit(1);
  }

  if (!bodyOf(note.source)) {
    console.error(`${CONTENT_REL}/${note.name} is empty — nothing published.`);
    process.exit(1);
  }

  let contents = note.source;
  contents = contents.replace(/^draft:\s*true\s*\r?\n/m, "");
  contents = contents.replace(/^posted:.*$/m, `posted: ${new Date().toISOString()}`);
  if (!contents.endsWith("\n")) contents += "\n";
  writeFileSync(join(CONTENT_DIR, note.name), contents, "utf8");

  const paths = [`${CONTENT_REL}/${note.name}`];
  const assetDir = join(CONTENT_DIR, note.id);
  if (existsSync(assetDir)) paths.push(`${CONTENT_REL}/${note.id}`);

  if (flags.has("--no-commit")) {
    console.log(`Published ${CONTENT_REL}/${note.name} — commit and push to go live at /feed/${note.id}`);
    return;
  }

  commitPaths(paths, `content(feed): ${note.id}`);
  const pushed = !flags.has("--no-push");
  console.log(
    pushed
      ? `Published and pushed — /feed/${note.id} goes live with the next deploy.`
      : `Published and committed ${CONTENT_REL}/${note.name} — push to go live at /feed/${note.id}`,
  );
}

function list() {
  const notes = noteFiles().map(readNote);
  if (notes.length === 0) {
    console.log("No notes yet. Start one with: pnpm ian feed post");
    return;
  }
  for (const note of notes) {
    console.log(`${note.id}${note.draft ? " [draft]" : ""}`);
    if (note.preview) console.log(`  ${note.preview}`);
    console.log(`  posted: ${note.posted}`);
    console.log();
  }
}

async function del() {
  const notes = noteFiles().map(readNote);
  if (!positional[0]) {
    console.error("Usage: pnpm ian feed delete <id>");
    process.exit(1);
  }
  const note = findNote(positional[0], notes);

  if (!flags.has("--yes")) {
    const confirmed = await p.confirm({
      message: `Delete ${CONTENT_REL}/${note.name}${note.draft ? " (draft)" : ""}?`,
    });
    if (p.isCancel(confirmed) || !confirmed) {
      console.log("Nothing deleted.");
      return;
    }
  }

  const assetDir = join(CONTENT_DIR, note.id);
  const tracked = git(["ls-files", "--", `${CONTENT_REL}/${note.name}`]) !== "";
  rmSync(join(CONTENT_DIR, note.name), { force: true });
  rmSync(assetDir, { recursive: true, force: true });

  if (tracked && !flags.has("--no-commit")) {
    commitPaths([`${CONTENT_REL}/${note.name}`, `${CONTENT_REL}/${note.id}`], `content(feed): remove ${note.id}`);
    console.log(`Deleted and ${flags.has("--no-push") ? "committed" : "pushed"} removal of /feed/${note.id}`);
  } else {
    console.log(`Deleted ${CONTENT_REL}/${note.name}`);
  }
}

function help() {
  console.log(`feed — personal feed helper

Usage:
  pnpm ian feed post
  pnpm ian feed publish [id] [--no-push] [--no-commit]
  pnpm ian feed list
  pnpm ian feed delete <id> [--yes] [--no-push] [--no-commit]

Notes are markdown files in ${CONTENT_REL}; there is no database. post creates
a draft (draft: true, hidden from builds) and opens it in VS Code — set
IAN_OPEN_CMD to use a different app. Paste or drag images straight into the
open draft; they land next to the note. publish stamps the posted time,
clears the draft flag, and commits/pushes only the note's own files.`);
}

try {
  if (!command || command === "help" || command === "--help") {
    help();
  } else if (command === "post") {
    post();
  } else if (command === "publish") {
    publish();
  } else if (command === "list") {
    list();
  } else if (command === "delete") {
    await del();
  } else {
    console.error(`Unknown command: ${command}\n`);
    help();
    process.exit(2);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
