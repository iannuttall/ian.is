#!/usr/bin/env node
// AMA inbox CLI. Questions live in D1 (write-only inbox fed by /api/ama);
// answers are committed content in src/content/ama. Answering a question here
// writes the markdown file and marks the D1 row, then a normal git push
// publishes it through the regular site build.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import * as p from "@clack/prompts";

const SITE_DIR = resolve(import.meta.dirname, "..");
const CONTENT_DIR = resolve(SITE_DIR, "src/content/ama");
const DB_NAME = "ian-db";

const argv = process.argv.slice(2);
const command = argv[0];
const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
const positional = argv.slice(1).filter((arg) => !arg.startsWith("--"));
const remote = flags.has("--remote");

function flagValue(name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

function d1(sql) {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "execute",
      DB_NAME,
      remote ? "--remote" : "--local",
      "--json",
      "--command",
      sql,
    ],
    { cwd: SITE_DIR, encoding: "utf8" },
  );

  if (result.error) {
    throw result.error;
  }

  const stdout = result.stdout ?? "";
  const jsonStart = stdout.indexOf("[");

  if (result.status !== 0 || jsonStart === -1) {
    throw new Error(
      `wrangler d1 execute failed:\n${stdout}\n${result.stderr ?? ""}`,
    );
  }

  const parsed = JSON.parse(stdout.slice(jsonStart));
  return parsed[0]?.results ?? [];
}

function sqlQuote(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

// wrangler d1 execute has no bound parameters, so every value that reaches a
// SQL string (or a content file path) must match a strict allowlist first.
function assertSafeId(id) {
  if (!/^[0-9a-fA-F-]+$/.test(id)) {
    console.error(`Invalid id: ${id} (expected hex characters and dashes)`);
    process.exit(1);
  }
  return id;
}

function assertSafeSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error(`Invalid slug: ${slug} (lowercase letters, digits, and dashes only)`);
    process.exit(1);
  }
  return slug;
}

function isoDate(value) {
  return (value ?? new Date().toISOString()).slice(0, 10);
}

function truncate(value, length) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function slugify(question) {
  const base = question
    .trim()
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .reduce((slug, word) => {
      const next = slug ? `${slug}-${word}` : word;
      return next.length <= 60 ? next : slug;
    }, "");

  let slug = base || "question";
  let counter = 2;
  while (existsSync(join(CONTENT_DIR, `${slug}.md`))) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function frontmatter(row, answeredDate) {
  const lines = [
    "---",
    `question: ${JSON.stringify(row.question)}`,
  ];
  if (row.context) {
    lines.push(`context: ${JSON.stringify(row.context)}`);
  }
  lines.push(`asked: ${isoDate(row.created_at)}`);
  lines.push(`answered: ${answeredDate}`);
  lines.push("---");
  return lines.join("\n");
}

function bodyOf(markdown) {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return (match ? match[1] : markdown).trim();
}

function openEditor(path) {
  const editor = process.env.VISUAL ?? process.env.EDITOR ?? "nano";
  const [bin, ...args] = editor.split(/\s+/);
  const result = spawnSync(bin, [...args, path], { stdio: "inherit" });
  return result.status === 0;
}

function pendingQuestions() {
  return d1(
    "SELECT id, question, context, created_at FROM ama_questions WHERE status = 'pending' ORDER BY created_at ASC",
  );
}

function list() {
  const rows = flags.has("--all")
    ? d1(
        "SELECT id, question, status, slug, created_at, answered_at FROM ama_questions ORDER BY created_at DESC",
      )
    : pendingQuestions();

  if (rows.length === 0) {
    console.log(flags.has("--all") ? "No questions yet." : "No pending questions.");
    return;
  }

  for (const row of rows) {
    const status = row.status ? ` [${row.status}]` : "";
    console.log(`${row.id}${status}`);
    console.log(`  ${truncate(row.question, 100)}`);
    if (row.context) console.log(`  context: ${truncate(row.context, 100)}`);
    console.log(`  asked: ${row.created_at}${row.slug ? `  → /ama/${row.slug}` : ""}`);
    console.log();
  }
}

/** Match a full id or a unique prefix, git-style. */
function findByIdPrefix(rows, id) {
  assertSafeId(id);
  const matches = rows.filter((row) => row.id === id || row.id.startsWith(id));
  if (matches.length === 0) {
    console.error(`No question matching id ${id}`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Ambiguous id ${id} — matches:`);
    for (const row of matches) console.error(`  ${row.id}`);
    process.exit(1);
  }
  return matches[0];
}

function show(id) {
  const rows = d1("SELECT * FROM ama_questions");
  console.log(JSON.stringify(findByIdPrefix(rows, id), null, 2));
}

function hide(id) {
  const rows = d1("SELECT id FROM ama_questions");
  const row = findByIdPrefix(rows, id);
  d1(
    `UPDATE ama_questions SET status = 'hidden' WHERE id = ${sqlQuote(row.id)}`,
  );
  console.log(`Hidden ${row.id}`);
}

function seed() {
  const samples = [
    {
      question: "What does your AI coding setup actually look like day to day?",
      context: "Not the tools list — the actual workflow when you sit down in the morning.",
    },
    {
      question: "Is programmatic SEO dead now that AI answers most queries?",
      context: null,
    },
    {
      question: "How do you decide what to build next?",
      context: null,
    },
  ];

  for (const sample of samples) {
    d1(
      `INSERT INTO ama_questions (id, question, context) VALUES (${sqlQuote(
        randomUUID(),
      )}, ${sqlQuote(sample.question)}, ${sqlQuote(sample.context)})`,
    );
  }
  console.log(`Seeded ${samples.length} pending questions.`);
}

async function answer() {
  const rows = pendingQuestions();
  if (rows.length === 0) {
    console.log("No pending questions to answer.");
    return;
  }

  p.intro("Answer an AMA question");

  let row;
  const requestedId = positional[0];
  if (requestedId) {
    assertSafeId(requestedId);
    const matches = rows.filter(
      (candidate) => candidate.id === requestedId || candidate.id.startsWith(requestedId),
    );
    if (matches.length === 0) {
      p.cancel(`No pending question matching id ${requestedId}`);
      process.exit(1);
    }
    if (matches.length > 1) {
      p.cancel(`Ambiguous id ${requestedId} — matches ${matches.map((m) => m.id).join(", ")}`);
      process.exit(1);
    }
    row = matches[0];
  } else {
    const picked = await p.select({
      message: `Pick a question (${rows.length} pending)`,
      options: rows.map((candidate) => ({
        value: candidate.id,
        label: truncate(candidate.question, 70),
        hint: isoDate(candidate.created_at),
      })),
    });
    if (p.isCancel(picked)) {
      p.cancel("Nothing answered.");
      return;
    }
    row = rows.find((candidate) => candidate.id === picked);
  }

  if (row.context) {
    p.note(row.context, "Context from the asker");
  }

  const answeredDate = isoDate();
  const header = frontmatter(row, answeredDate);
  const answerFile = flagValue("--file");
  let fileContents;

  if (answerFile) {
    const body = readFileSync(resolve(answerFile), "utf8").trim();
    if (!body) {
      p.cancel(`${answerFile} is empty.`);
      process.exit(1);
    }
    fileContents = `${header}\n\n${body}\n`;
  } else {
    const draftPath = join(tmpdir(), `ama-${row.id}.md`);
    writeFileSync(draftPath, `${header}\n\n`, "utf8");
    p.log.step("Opening your editor. Write the answer in markdown below the frontmatter, save, and quit.");

    if (!openEditor(draftPath)) {
      p.cancel("Editor exited with an error.");
      process.exit(1);
    }

    fileContents = readFileSync(draftPath, "utf8");
    if (!bodyOf(fileContents)) {
      rmSync(draftPath, { force: true });
      p.cancel("Empty answer — nothing saved.");
      return;
    }
    if (!fileContents.endsWith("\n")) fileContents += "\n";
    rmSync(draftPath, { force: true });
  }

  const slug = assertSafeSlug(flagValue("--slug") ?? slugify(row.question));
  const target = join(CONTENT_DIR, `${slug}.md`);

  p.note(truncate(bodyOf(fileContents), 300), `src/content/ama/${slug}.md`);
  if (!flags.has("--yes")) {
    const confirmed = await p.confirm({ message: "Publish this answer file?" });
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Nothing saved.");
      return;
    }
  }

  mkdirSync(CONTENT_DIR, { recursive: true });
  writeFileSync(target, fileContents, "utf8");
  d1(
    `UPDATE ama_questions SET status = 'answered', slug = ${sqlQuote(
      slug,
    )}, answered_at = datetime('now') WHERE id = ${sqlQuote(row.id)}`,
  );

  p.outro(
    `Wrote src/content/ama/${slug}.md — commit and push to publish /ama/${slug}`,
  );
}

function help() {
  console.log(`ama — AMA inbox helper

Usage:
  pnpm ian ama list [--all] [--remote]
  pnpm ian ama show <id> [--remote]
  pnpm ian ama answer [id] [--file draft.md] [--slug custom-slug] [--yes] [--remote]
  pnpm ian ama hide <id> [--remote]
  pnpm ian ama seed

Questions live in the ${DB_NAME} D1 database (local state by default; pass
--remote for production). Answers are markdown files in src/content/ama and
publish through a normal git push.

The answer editor is $VISUAL or $EDITOR (falls back to nano). For VS Code:
  EDITOR="code --wait" pnpm ian ama answer <id>
or export EDITOR="code --wait" in your shell profile.`);
}

try {
  if (!command || command === "help" || command === "--help") {
    help();
  } else if (command === "list") {
    list();
  } else if (command === "show") {
    show(positional[0] ?? "");
  } else if (command === "hide") {
    hide(positional[0] ?? "");
  } else if (command === "seed") {
    seed();
  } else if (command === "answer") {
    await answer();
  } else {
    console.error(`Unknown command: ${command}\n`);
    help();
    process.exit(2);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
