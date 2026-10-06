import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { toolRowSchema } from "../../src/lib/schemas";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8"));

describe("tools.json invariants", () => {
  const tools = toolRowSchema.array().parse(read("tools.json"));

  it("has at least one tool in each category", () => {
    expect(tools.some((t) => t.category === "compliance_software")).toBe(true);
    expect(tools.some((t) => t.category === "merchant_of_record")).toBe(true);
  });
  it("quote_only rows have no prices and pricing_public false", () => {
    for (const t of tools.filter((t) => t.pricing_model === "quote_only")) {
      expect(t.pricing_public, t.slug).toBe(false);
      expect(Object.entries(t.pricing).filter(([k]) => k !== "pricing_url").every(([, v]) => v === null), t.slug).toBe(true);
    }
  });
});
