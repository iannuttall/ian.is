import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const command =
  args[0] === "check"
    ? ["-C", "apps/site", "exec", "astro-check", ...args.slice(1)]
    : ["-C", "apps/site", "exec", "astro", ...args];

const result = spawnSync("pnpm", command, {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
