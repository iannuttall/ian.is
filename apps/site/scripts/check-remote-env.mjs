#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(here, "..");
const envTypePath = resolve(siteDir, "src/env.d.ts");
const manifestPath = resolve(siteDir, "env-manifest.json");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseEnvKeys(source) {
  const keys = [];
  const regex = /^\s+([A-Z0-9_]+)\??:\s/gm;
  for (const match of source.matchAll(regex)) {
    const key = String(match[1] || "").trim();
    if (key) keys.push(key);
  }
  return Array.from(new Set(keys)).sort();
}

const manifest = readJson(manifestPath);
const envKeys = parseEnvKeys(readFileSync(envTypePath, "utf8"));
const bindings = new Set(manifest.bindings || []);
const requiredRemote = new Set(manifest.requiredRemote || []);
const optionalRemote = new Set(manifest.optionalRemote || []);
const classified = new Set([...bindings, ...requiredRemote, ...optionalRemote]);

const unclassified = envKeys.filter((key) => !classified.has(key));
const stale = Array.from(classified).filter((key) => !envKeys.includes(key));

if (unclassified.length || stale.length) {
  if (unclassified.length) {
    console.error(`Unclassified Worker env keys in src/env.d.ts: ${unclassified.join(", ")}`);
  }
  if (stale.length) {
    console.error(`env-manifest.json contains keys not present in src/env.d.ts: ${stale.join(", ")}`);
  }
  process.exit(1);
}

let listedSecrets;
try {
  const output = execFileSync(
    "pnpm",
    ["exec", "wrangler", "secret", "list", "--format", "json"],
    {
      cwd: siteDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  );
  listedSecrets = JSON.parse(output);
} catch (error) {
  const stderr = String(error?.stderr || error?.message || "").trim();
  console.error(stderr || "Failed to list remote Worker secrets.");
  process.exit(1);
}

const remoteSecretNames = new Set(
  Array.isArray(listedSecrets)
    ? listedSecrets
        .map((entry) => (typeof entry?.name === "string" ? entry.name.trim() : ""))
        .filter(Boolean)
    : [],
);

const missingRequired = Array.from(requiredRemote)
  .filter((key) => !remoteSecretNames.has(key))
  .sort();

if (missingRequired.length) {
  console.error(`Missing required remote Worker secrets: ${missingRequired.join(", ")}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      requiredRemote: Array.from(requiredRemote).sort(),
      optionalRemote: Array.from(optionalRemote).sort(),
      bindings: Array.from(bindings).sort(),
      remoteSecrets: Array.from(remoteSecretNames).sort(),
    },
    null,
    2,
  ),
);
