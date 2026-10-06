import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const EXPECTED_STATE_PAGES = 51;
const REQUIRED = [
  "index.html",
  "us/economic-nexus/index.html",
  "tools/index.html",
  "wizard/index.html",
  "changelog/index.html",
  "methodology/index.html",
  "about/index.html",
  "disclosure/index.html",
  "data/us-economic-nexus.json",
  "data/tools.json",
  "sitemap-index.xml",
  "robots.txt",
];

function fail(message) {
  console.error(`postbuild-assert: ${message}`);
  process.exit(1);
}

if (!existsSync(dist)) fail("dist/ is missing; run `npm run build` first");

const nexusDir = join(dist, "us", "economic-nexus");
if (!existsSync(nexusDir)) fail("missing dist/us/economic-nexus/");
const statePages = readdirSync(nexusDir).filter(
  (name) => statSync(join(nexusDir, name)).isDirectory() && existsSync(join(nexusDir, name, "index.html")),
);
if (statePages.length !== EXPECTED_STATE_PAGES) {
  fail(`expected ${EXPECTED_STATE_PAGES} state pages, found ${statePages.length}`);
}

const missing = REQUIRED.filter((rel) => !existsSync(join(dist, rel)));
if (missing.length > 0) fail(`missing in dist/: ${missing.join(", ")}`);

const robots = readFileSync(join(dist, "robots.txt"), "utf8");
if (!robots.split(/\r?\n/).some((line) => line.startsWith("Sitemap: https://"))) {
  fail("robots.txt Sitemap line is not an absolute https URL");
}

console.log(`postbuild-assert: OK (${statePages.length} state pages, ${REQUIRED.length} required files)`);
