#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const newsletterDir = resolve(root, "apps/newsletter");
const newsletterEnv = resolve(newsletterDir, ".env.local");
const newsletterCli = resolve(newsletterDir, "packages/cli/dist/index.js");

function help() {
  return `ian

Usage:
  pnpm ian <command>
  pnpm ian check [target]
  pnpm ian build [target]

Newsletter:
  pnpm ian newsletter doctor
  pnpm ian newsletter signups [--days 7] [--limit N]
  pnpm ian newsletter checklist
  pnpm ian newsletter migrate
  pnpm ian newsletter seed-aliases --email you@gmail.com [--count 20]
  pnpm ian newsletter seed-intelligence --email you@gmail.com [--count 20]
  pnpm ian newsletter render --subject "Subject" --body-file apps/newsletter/draft.md
  pnpm ian newsletter draft --subject "Subject" --body-file apps/newsletter/draft.md
  pnpm ian newsletter test-send --draft-id ID --to you@example.com
  pnpm ian newsletter api [--port 3000]
  pnpm ian newsletter web
  pnpm ian newsletter worker
  pnpm ian newsletter email-preview
  pnpm ian newsletter cli -- <raw email cli args>

AMA:
  pnpm ian ama list [--all]
  pnpm ian ama show <id>
  pnpm ian ama answer [id] [--file answer.md] [--slug custom-slug]
  pnpm ian ama publish [slug|id]
  pnpm ian ama hide <id>
  pnpm ian ama seed

Feed:
  pnpm ian feed post
  pnpm ian feed publish [id] [--no-push] [--no-commit]
  pnpm ian feed list
  pnpm ian feed delete <id>

Site:
  pnpm ian site dev
  pnpm ian site build
  pnpm ian site check
  pnpm ian site check-remote-env
  pnpm ian site secrets-sync [--dry-run]
  pnpm ian site refresh

Targets:
  site
  newsletter
  newsletter-api
  newsletter-cli
  newsletter-core
  newsletter-mcp
  newsletter-web

Notes:
  Newsletter commands load apps/newsletter/.env.local when it exists.
  The wrapper builds @email/cli automatically if dist/index.js is missing.
`;
}

function localEnv(name) {
  if (process.env[name]) return process.env[name];
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return undefined;
  const match = readFileSync(envPath, "utf8").match(
    new RegExp(`^${name}=(.*)$`, "m"),
  );
  return match?.[1]?.trim();
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

function pnpm(commandArgs, options = {}) {
  run("pnpm", commandArgs, options);
}

function buildNewsletterCliIfMissing() {
  if (existsSync(newsletterCli)) return;

  const result = spawnSync("pnpm", ["--filter", "@email/cli", "build"], {
    cwd: root,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function newsletterNodeArgs() {
  return existsSync(newsletterEnv) ? [`--env-file=${newsletterEnv}`] : [];
}

function emailCli(cliArgs) {
  buildNewsletterCliIfMissing();
  run("node", [...newsletterNodeArgs(), newsletterCli, ...cliArgs]);
}

function getOption(argv, name, fallback) {
  const index = argv.indexOf(name);
  if (index === -1) return fallback;
  return argv[index + 1] ?? fallback;
}

function withDefaultOption(argv, name, value) {
  return argv.includes(name) ? argv : [name, value, ...argv];
}

function appendJson(argv) {
  return argv.includes("--json") ? argv : [...argv, "--json"];
}

function newsletter(argv) {
  const [command, ...rest] = argv;

  if (!command || command === "help") {
    console.log(help());
    return;
  }

  if (command === "cli") {
    emailCli(rest[0] === "--" ? rest.slice(1) : rest);
    return;
  }

  if (command === "email-preview") {
    pnpm(["newsletter:email:preview"]);
    return;
  }

  if (command === "web") {
    pnpm(["--filter", "@email/web", "dev"], {
      env: {
        EMAIL_API_INTERNAL_URL: process.env.EMAIL_API_INTERNAL_URL ?? "http://127.0.0.1:3000",
      },
    });
    return;
  }

  if (command === "api") {
    emailCli(["api", "serve", ...rest]);
    return;
  }

  if (command === "worker") {
    emailCli(["worker", "send", "--yes", "--batch-size", "100", "--interval-ms", "10000", ...rest]);
    return;
  }

  const templateArgs = withDefaultOption(rest, "--template", getOption(rest, "--template", "default"));
  const renderArgs = withDefaultOption(templateArgs, "--out-dir", getOption(rest, "--out-dir", "apps/newsletter/rendered"));

  if (command === "signups") {
    const days = getOption(rest, "--days", "7");
    const limit = getOption(rest, "--limit", "50");
    if (!/^\d{1,3}$/.test(days) || !/^\d{1,5}$/.test(limit)) {
      console.error("signups: --days and --limit must be plain numbers");
      process.exit(2);
    }
    const sshTarget = localEnv("IAN_NEWSLETTER_SSH");
    const opsPrefix = localEnv("IAN_NEWSLETTER_OPS");
    if (!sshTarget || !opsPrefix) {
      console.error(
        "signups needs IAN_NEWSLETTER_SSH and IAN_NEWSLETTER_OPS (shell env or root .env.local).",
      );
      process.exit(1);
    }
    run("ssh", [
      "-o",
      "RemoteCommand=none",
      "-o",
      "RequestTTY=no",
      sshTarget,
      `${opsPrefix} contact recent --days ${days} --limit ${limit}`,
    ]);
    return;
  }

  const aliases = {
    doctor: ["doctor"],
    checklist: ["ops", "checklist"],
    migrate: ["db", "migrate"],
    queue: ["ops", "queue", ...rest],
    "seed-aliases": ["contact", "seed-aliases", ...rest],
    "seed-intelligence": ["contact", "seed-intelligence", ...rest],
    render: ["template", "render", ...renderArgs],
    draft: ["draft", "create", ...templateArgs],
    "test-send": ["broadcast", "test", "--yes", ...rest],
  };

  if (aliases[command]) {
    emailCli(appendJson(aliases[command]));
    return;
  }

  console.error(`Unknown newsletter command: ${command}\n`);
  console.error(help());
  process.exit(2);
}

function site(argv) {
  const [command] = argv;
  const aliases = {
    dev: ["dev"],
    "dev:cf": ["dev:cf"],
    build: ["build"],
    check: ["astro", "check"],
    "check-remote-env": ["-C", "apps/site", "check:remote-env"],
    "secrets-sync": ["-C", "apps/site", "secrets:sync", ...argv.slice(1)],
    "secrets-sync:dry": ["-C", "apps/site", "secrets:sync:dry"],
    "generate-types": ["generate-types"],
    refresh: ["data:refresh"],
  };

  if (!command || command === "help") {
    console.log(help());
    return;
  }

  if (!aliases[command]) {
    console.error(`Unknown site command: ${command}\n`);
    console.error(help());
    process.exit(2);
  }

  pnpm(aliases[command]);
}

function targetCommand(action, target) {
  const commands = {
    check: {
      site: ["--dir", "apps/site", "astro", "check"],
      newsletter: ["newsletter:typecheck"],
      "newsletter-api": ["--filter", "@email/api", "typecheck"],
      "newsletter-cli": ["--filter", "@email/cli", "typecheck"],
      "newsletter-core": ["--filter", "@email/core", "typecheck"],
      "newsletter-mcp": ["--filter", "@email/mcp", "typecheck"],
      "newsletter-web": ["--filter", "@email/web", "typecheck"],
    },
    build: {
      site: ["build"],
      newsletter: ["newsletter:build"],
      "newsletter-api": ["--filter", "@email/api", "build"],
      "newsletter-cli": ["--filter", "@email/cli", "build"],
      "newsletter-core": ["--filter", "@email/core", "build"],
      "newsletter-mcp": ["--filter", "@email/mcp", "build"],
      "newsletter-web": ["--filter", "@email/web", "build"],
    },
  };

  const normalizedTarget = target ?? "site";
  const command = commands[action]?.[normalizedTarget];

  if (!command) {
    console.error(`Unknown ${action} target: ${normalizedTarget}\n`);
    console.error(help());
    process.exit(2);
  }

  pnpm(command);
}

const [area, ...rest] = process.argv.slice(2);

if (!area || area === "help" || area === "--help" || area === "-h") {
  console.log(help());
} else if (area === "check" || area === "build") {
  targetCommand(area, rest[0]);
} else if (area === "newsletter" || area === "email") {
  newsletter(rest);
} else if (area === "site") {
  site(rest);
} else if (area === "ama") {
  pnpm(["-C", "apps/site", "ama", ...rest]);
} else if (area === "feed") {
  pnpm(["-C", "apps/site", "feed", ...rest]);
} else {
  console.error(`Unknown command: ${area}\n`);
  console.error(help());
  process.exit(2);
}
