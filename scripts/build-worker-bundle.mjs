// Regenerates worker/dist/worker.bundle.js from worker/src/*.
//
// The bundle exists because the Worker is deployed by pasting one file into
// the Cloudflare dashboard editor, with no npm or wrangler available. It used
// to be kept in sync by hand, which is exactly the kind of thing that silently
// drifts — a security fix landing in src/ but not in dist/ would look deployed
// while the old code kept running.
//
// Run: node scripts/build-worker-bundle.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "worker", "src");
const OUT = join(ROOT, "worker", "dist", "worker.bundle.js");

// Dependency order: a module must appear after everything it uses. index.js is
// always last because it wires everything together.
// A path starting with "js/" is read from the project ROOT instead of
// worker/src — that is how the family registry stays a single file shared with
// the browser (see js/families.data.js).
const MODULES = [
  "js/families.data.js",
  "cors.js",
  "prompts/business-conversational.js",
  "prompts/kids-primar.js",
  "prompts/kids-advanced.js",
  "prompts/kids-expert.js",
  "prompts/scenarios.js",
  "documents.js",
  "claude.js",
  "budget.js",
  "auth.js",
  "families.js",
  "progress.js",
  "index.js",
];

// Matches single- and multi-line import statements. Only relative imports are
// removed — everything resolves inside the bundle once concatenated.
const IMPORT_RE = /^import\s+[\w*{}\n\r\t, ]+\s+from\s*["'][^"']+["'];?[ \t]*\r?\n/gm;

const HEADER = `// ============================================================================
// SINGLE-FILE BUNDLE — for pasting directly into the Cloudflare dashboard's
// browser-based code editor (no npm/wrangler/Node.js needed).
//
// GENERATED FILE — do not edit by hand. Edit worker/src/* and re-run:
//     node scripts/build-worker-bundle.mjs
// ============================================================================
`;

const parts = [HEADER];

for (const relativePath of MODULES) {
  const base = relativePath.startsWith("js/") ? ROOT : SRC;
  const source = readFileSync(join(base, relativePath), "utf8");
  const body = source
    .replace(IMPORT_RE, "")
    // `export default` must survive — it's the Worker's entry point. Every
    // other `export` is meaningless once the modules share one scope.
    .replace(/^export (?!default)/gm, "")
    .trim();

  parts.push(`\n// ---- from ${relativePath} ----\n${body}\n`);
}

const bundle = parts.join("");

// Guard against the two ways a naive concatenation silently produces a broken
// Worker: a leftover import (runtime error on deploy) or a missing entry point
// (Worker deploys but answers nothing).
const leftoverImport = /^import\s/m.exec(bundle);
if (leftoverImport) {
  throw new Error(`Bundle still contains an import statement at index ${leftoverImport.index}`);
}
if (!/^export default \{/m.test(bundle)) {
  throw new Error("Bundle is missing the `export default {` Worker entry point");
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, bundle, "utf8");

console.log(`Wrote ${OUT}`);
console.log(`${MODULES.length} modules, ${bundle.split("\n").length} lines, ${bundle.length} bytes`);
