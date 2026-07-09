#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const argv = new Set(process.argv.slice(2));
const built = argv.has("--built");
const dryRun = argv.has("--dry-run");
const siteDir = process.cwd();
const builtConfigPath = resolve(siteDir, "dist/server/wrangler.json");
const deployConfigPath = resolve(siteDir, "dist/server/wrangler.deploy.jsonc");
const deployId = git(["rev-parse", "HEAD"]);
const source =
  process.env.DEPLOY_SOURCE ??
  (process.env.GITHUB_ACTIONS
    ? "github"
    : process.env.CF_PAGES || process.env.CLOUDFLARE_BUILD_ID
      ? "cloudflare"
      : "local");
const statusUrl =
  process.env.DEPLOY_STATUS_URL ??
  "https://ian.is/.well-known/deploy.json";

if (!process.env.DEPLOY_ALLOW_DIRTY) {
  const dirty = git(["status", "--porcelain"]);
  if (dirty) {
    throw new Error(
      "Refusing to deploy a dirty worktree. Commit first or set DEPLOY_ALLOW_DIRTY=1.",
    );
  }
}

if (!dryRun && (await isLive(deployId))) {
  console.log(`ian.is ${deployId} is already live; skipping deploy.`);
  process.exit(0);
}

run("pnpm", ["run", "check:remote-env"]);
if (!built) run("pnpm", ["run", "build"]);

writeDeployConfig();

const deployArgs = ["deploy", "--config", deployConfigPath];
if (dryRun) deployArgs.push("--dry-run");
run("pnpm", ["exec", "wrangler", ...deployArgs]);

if (!dryRun) await verifyLive(deployId);

function git(args) {
  return execFileSync("git", args, {
    cwd: siteDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: siteDir,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function writeDeployConfig() {
  if (!existsSync(builtConfigPath)) {
    throw new Error(
      `Missing ${builtConfigPath}. Run pnpm run build before deploy:built.`,
    );
  }

  const config = JSON.parse(readFileSync(builtConfigPath, "utf8"));
  config.vars = {
    ...(config.vars ?? {}),
    DEPLOYED_AT: new Date().toISOString(),
    DEPLOY_ID: deployId,
    DEPLOY_SOURCE: source,
    GIT_SHA: deployId,
  };

  writeFileSync(`${deployConfigPath}.tmp`, `${JSON.stringify(config, null, 2)}\n`);
  renameSync(`${deployConfigPath}.tmp`, deployConfigPath);
  console.log(`Generated ${deployConfigPath}`);
}

async function isLive(expectedDeployId) {
  const live = await readLiveMarker();
  return live?.deployId === expectedDeployId;
}

async function readLiveMarker() {
  try {
    const url = new URL(statusUrl);
    url.searchParams.set("deployCheck", String(Date.now()));
    const response = await fetch(url, {
      headers: { "cache-control": "no-cache" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function verifyLive(expectedDeployId) {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    if (await isLive(expectedDeployId)) {
      console.log(`ian.is ${expectedDeployId} is live.`);
      return;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 3000));
  }

  throw new Error(`Deploy finished, but ${statusUrl} did not report ${expectedDeployId}.`);
}
