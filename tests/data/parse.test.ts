import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema } from "../../src/lib/schemas";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8"));

describe("data files parse against their schemas", () => {
  it("us-economic-nexus.json", () => {
    const result = nexusRowSchema.array().safeParse(read("us-economic-nexus.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
  it("tools.json", () => {
    const result = toolRowSchema.array().safeParse(read("tools.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
  it("changelog.json", () => {
    const result = changelogEntrySchema.array().safeParse(read("changelog.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
});
