/**
 * Measures gzip size of JS chunks for the student entry route (/student/dashboard).
 *
 * Next.js App Router shares `rootMainFiles` + `polyfillFiles` across student routes
 * under the same layout. Student dashboard uses the same client bundle as
 * /student/perfil and /student/atividades — this matches RNF-001 "rota de entrada do aluno".
 *
 * Usage: npm run build && node scripts/measure-student-bundle.mjs
 * Threshold: 300 KB gzip (PERF-01)
 */

import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const MANIFEST = join(ROOT, ".next", "build-manifest.json");
const THRESHOLD_KB = 300;

function gzipKb(filePath) {
  const buf = readFileSync(filePath);
  return gzipSync(buf).length / 1024;
}

function sumFiles(relativePaths) {
  let total = 0;
  const missing = [];
  for (const rel of relativePaths) {
    const full = join(ROOT, ".next", rel);
    if (!existsSync(full)) {
      missing.push(rel);
      continue;
    }
    total += gzipKb(full);
  }
  if (missing.length) {
    console.warn("Missing chunks:", missing.join(", "));
  }
  return total;
}

if (!existsSync(MANIFEST)) {
  console.error("Run npm run build first — .next/build-manifest.json not found.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const files = [
  ...(manifest.polyfillFiles ?? []),
  ...(manifest.rootMainFiles ?? []),
];

const totalKb = sumFiles(files);
const rounded = Math.round(totalKb * 10) / 10;

console.log(`STUDENT_DASHBOARD_GZIP_KB=${rounded}`);
console.log(`Chunks counted: ${files.length} (rootMainFiles + polyfillFiles)`);

if (rounded > THRESHOLD_KB) {
  console.error(`FAIL: ${rounded} KB exceeds ${THRESHOLD_KB} KB gzip budget.`);
  process.exit(1);
}

console.log(`PASS: ${rounded} KB ≤ ${THRESHOLD_KB} KB`);
