import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, root), "utf8");

const REQUIRED: Record<string, string[]> = {
  "CLAUDE.md": ["## Hard rules", "## Where things live"],
  "README.md": ["## Run", "## Data", "## Documents"],
  "docs/SCOPE.md": ["## In scope (v0.1)", "## Out of scope (v0.1)", "## Change control"],
  "docs/ROADMAP.md": ["## Why this slice", "## v0.1", "## v0.2", "## v0.3", "## Parking lot"],
  "docs/NEXT_STEPS.md": ["## Human-only steps", "## Agent steps", "## Never"],
  "docs/DATA_PROVENANCE.md": ["## Verification levels", "## Adding or re-verifying a row", "## Cadence", "## Backlog"],
  "docs/DEPLOY.md": ["## Cloudflare Pages", "## Custom domain", "## Alternatives"],
};

describe("documentation set", () => {
  for (const [file, headings] of Object.entries(REQUIRED)) {
    it(`${file} exists with its required sections`, () => {
      expect(existsSync(new URL(file, root)), file).toBe(true);
      const text = read(file);
      for (const h of headings) expect(text, `${file} missing "${h}"`).toContain(h);
    });
  }
  it("no document contains placeholder markers", () => {
    for (const file of Object.keys(REQUIRED)) {
      expect(read(file)).not.toMatch(/\bTBD\b|\bTODO\b|lorem ipsum/i);
    }
  });
});
