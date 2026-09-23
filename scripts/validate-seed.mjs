// Validates data/mockups.json. Errors exit 1; missing images are reported, not fatal.
// Enum lists mirror lib/types.ts — update both together.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENUMS = {
  device: ["iphone"],
  environment: ["desk", "cafe", "transit", "outdoor", "dark"],
  uiType: ["home", "onboarding", "feed", "settings", "paywall", "empty", "error"],
  style: ["clean", "glass", "bold", "minimal", "data-heavy"],
  mood: ["calm", "energetic", "premium", "playful"],
};

const seed = JSON.parse(readFileSync(path.join(ROOT, "data/mockups.json"), "utf8"));
const errors = [];
const missing = [];
const seen = new Set();
const counts = Object.fromEntries(Object.keys(ENUMS).map((k) => [k, {}]));

for (const [i, m] of seed.entries()) {
  const where = m.id ?? `entry #${i}`;
  if (!m.id) errors.push(`${where}: missing id`);
  else if (seen.has(m.id)) errors.push(`${where}: duplicate id`);
  seen.add(m.id);

  if (!m.title) errors.push(`${where}: missing title`);

  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (!allowed.includes(m[key])) errors.push(`${where}: ${key}=${JSON.stringify(m[key])} not in [${allowed.join(", ")}]`);
    else counts[key][m[key]] = (counts[key][m[key]] ?? 0) + 1;
  }

  const idPattern = new RegExp(`^${m.device}-${m.environment}-${m.uiType}-\\d{2}$`);
  if (m.id && !idPattern.test(m.id)) errors.push(`${where}: id should be ${m.device}-${m.environment}-${m.uiType}-NN`);

  const expectedSrc = `/mockups/${m.id}.webp`;
  if (m.image?.src !== expectedSrc) errors.push(`${where}: image.src should be ${expectedSrc}`);
  if (!(m.image?.width > 0 && m.image?.height > 0)) errors.push(`${where}: image width/height must be positive`);
  else if (!existsSync(path.join(ROOT, "public", expectedSrc))) missing.push(m.id);
}

console.log(`${seed.length} mockups`);
for (const [key, tally] of Object.entries(counts)) {
  console.log(`  ${key}: ${Object.entries(tally).map(([v, n]) => `${v}=${n}`).join(" ")}`);
}
console.log(`\nimages: ${seed.length - missing.length} present, ${missing.length} missing`);
if (missing.length && process.argv.includes("--missing")) {
  for (const id of missing) console.log(`  public/mockups/${id}.webp`);
} else if (missing.length) {
  console.log("  (run with --missing to list expected filenames)");
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("\nseed OK");
