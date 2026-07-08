#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(here, "..");
const manifest = JSON.parse(readFileSync(resolve(siteDir, "env-manifest.json"), "utf8"));
const argv = process.argv.slice(2);

const dryRun = argv.includes("--dry-run");
const envFileFlagIndex = argv.indexOf("--env-file");
const explicitEnvFile =
  envFileFlagIndex === -1 ? undefined : argv[envFileFlagIndex + 1];
const requestedKeys = argv.filter(
  (arg, index) =>
    arg !== "--dry-run" &&
    arg !== "--env-file" &&
    index !== envFileFlagIndex + 1 &&
    /^[A-Z0-9_]+$/.test(arg),
);

const keys = requestedKeys.length
  ? requestedKeys
  : Array.from(new Set(manifest.requiredRemote || [])).sort();

if (!keys.length) {
  console.error("No remote secret keys configured in env-manifest.json.");
  process.exit(1);
}

const envFiles = explicitEnvFile
  ? [resolve(process.cwd(), explicitEnvFile)]
  : [resolve(siteDir, ".dev.vars.production"), resolve(siteDir, ".dev.vars")];

function parseDotenv(raw) {
  const values = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;

    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

let envFile;
for (const candidate of envFiles) {
  if (existsSync(candidate)) {
    envFile = candidate;
    break;
  }
}

if (!envFile) {
  console.error(
    `Missing env file. Create apps/site/.dev.vars.production or apps/site/.dev.vars, or pass --env-file <path>.`,
  );
  process.exit(1);
}

const values = parseDotenv(readFileSync(envFile, "utf8"));
const missing = keys.filter((key) => !values.get(key));

if (missing.length) {
  console.error(`Missing local secret values in ${envFile}: ${missing.join(", ")}`);
  process.exit(1);
}

for (const key of keys) {
  if (dryRun) {
    console.log(`[dry-run] would sync ${key}`);
    continue;
  }

  execFileSync("pnpm", ["exec", "wrangler", "secret", "put", key], {
    cwd: siteDir,
    input: values.get(key),
    stdio: ["pipe", "inherit", "inherit"],
    env: process.env,
  });
  console.log(`synced ${key}`);
}
