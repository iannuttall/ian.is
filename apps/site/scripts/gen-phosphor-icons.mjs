// Converts the Phosphor "fill" SVGs into clean-named TSX icon components.
//
//   node scripts/gen-phosphor-icons.mjs
//
//   acorn-fill.svg  ->  src/components/icons/Acorn.tsx  (export function Acorn)
//
// Source SVGs are read from SRC below (adjust if you move the download). The
// generated .tsx files are committed; you only re-run this to refresh/add icons.
// Hand-written icons in HAND_WRITTEN are preserved (not overwritten).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "/Users/iannuttall/Downloads/phosphor-icons/SVGs/fill";
const OUT = join(ROOT, "src/components/icons");

// Icons authored by hand (not generated from Phosphor) — never overwrite these.
const HAND_WRITTEN = new Set(["Menu", "types"]);

const pascal = (kebab) =>
  kebab.split("-").filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");

const innerToJsx = (svg) =>
  svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")           // drop opening <svg ...>
    .replace(/<\/svg>[\s\S]*$/, "")               // drop closing </svg>
    .replace(/<rect\b[^>]*\bfill="none"[^>]*\/>/g, "") // drop bounding box
    .replaceAll("fill-rule=", "fillRule=")
    .replaceAll("clip-rule=", "clipRule=")
    .trim();

const component = (name, inner) => `import type { IconProps } from "./types";

export function ${name}({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      ${inner}
    </svg>
  );
}
`;

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith("-fill.svg"));
let written = 0, skipped = 0;
for (const file of files) {
  const name = pascal(file.replace(/-fill\.svg$/, ""));
  if (HAND_WRITTEN.has(name)) { skipped++; continue; }
  const inner = innerToJsx(readFileSync(join(SRC, file), "utf8"));
  writeFileSync(join(OUT, `${name}.tsx`), component(name, inner));
  written++;
}

console.log(`generated ${written} phosphor icons -> src/components/icons/`);
if (skipped) console.log(`preserved ${skipped} hand-written (${[...HAND_WRITTEN].join(", ")})`);
console.log(`import directly, e.g.  import { Acorn } from "@/components/icons/Acorn"`);
