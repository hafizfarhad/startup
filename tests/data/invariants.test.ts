import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema, US_JURISDICTION_COUNT } from "../../src/lib/schemas";
import { toSlug } from "../../src/lib/slug";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8"));

const NO_SALES_TAX = ["AK", "DE", "MT", "NH", "OR"];

describe("us-economic-nexus.json invariants", () => {
  const rows = nexusRowSchema.array().parse(read("us-economic-nexus.json"));

  it("has exactly 51 jurisdictions", () => {
    expect(rows).toHaveLength(US_JURISDICTION_COUNT);
  });
  it("has unique codes and unique slugs", () => {
    expect(new Set(rows.map((r) => r.code)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => toSlug(r.name))).size).toBe(rows.length);
  });
  it("is sorted by name", () => {
    const names = rows.map((r) => r.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it("includes DC and the five no-sales-tax states, marked as such", () => {
    expect(rows.some((r) => r.code === "DC")).toBe(true);
    for (const code of NO_SALES_TAX) {
      const row = rows.find((r) => r.code === code);
      expect(row, code).toBeDefined();
      expect(row?.has_state_sales_tax, code).toBe(false);
    }
  });
  it("every other jurisdiction has a statewide sales tax", () => {
    for (const r of rows.filter((r) => !NO_SALES_TAX.includes(r.code))) {
      expect(r.has_state_sales_tax, r.code).toBe(true);
    }
  });
  it("pending rows carry no figures and non-pending rows carry sources", () => {
    for (const r of rows) {
      if (r.verification.level === "pending") {
        expect(r.sales_threshold_usd, r.code).toBeNull();
        expect(r.transactions_threshold, r.code).toBeNull();
      } else {
        expect(r.sources.length, r.code).toBeGreaterThan(0);
      }
    }
  });
  it("no row claims professional review", () => {
    for (const r of rows) expect(r.review.status, r.code).toBe("unreviewed");
  });
  it("every corroborated row cites at least two distinct publishers", () => {
    for (const r of rows.filter((r) => r.verification.level === "corroborated")) {
      expect(new Set(r.sources.map((s) => s.publisher)).size, r.code).toBeGreaterThanOrEqual(2);
    }
  });
  it("every official row cites at least one government or statutory-body source", () => {
    // Hostnames of the official rows' sources were inspected when this guard was written: every
    // official row has a .gov host or arsstc.org (the Alaska Remote Seller Sales Tax Commission), so no
    // extra department hosts need listing.
    const isOfficialHost = (host: string) =>
      host.endsWith(".gov") || host === "arsstc.org" || /\.(gov|us)$/.test(host) || host.includes(".state.");
    for (const r of rows.filter((r) => r.verification.level === "official")) {
      const hosts = r.sources.map((s) => new URL(s.url).hostname);
      expect(hosts.some(isOfficialHost), `${r.code}: ${hosts.join(", ")}`).toBe(true);
    }
  });
});

describe("tools.json invariants", () => {
  const tools = toolRowSchema.array().parse(read("tools.json"));
  it("has unique slugs", () => {
    expect(new Set(tools.map((t) => t.slug)).size).toBe(tools.length);
  });
  it("is sorted by name", () => {
    const names = tools.map((t) => t.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it("no row claims professional review", () => {
    for (const t of tools) expect(t.review.status, t.slug).toBe("unreviewed");
  });
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

describe("changelog.json invariants", () => {
  it("has entries, newest first", () => {
    const entries = changelogEntrySchema.array().parse(read("changelog.json"));
    expect(entries.length).toBeGreaterThan(0);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1]!.date >= entries[i]!.date, `entry ${i}`).toBe(true);
    }
  });
});
