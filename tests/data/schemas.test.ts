import { describe, expect, it } from "vitest";
import {
  changelogEntrySchema,
  isoDate,
  nexusRowSchema,
  todayIso,
  toolRowSchema,
} from "../../src/lib/schemas";
import { DATE, makeRow, makeTool, SRC } from "../fixtures";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  schema.safeParse(v).success;

describe("isoDate", () => {
  it("accepts a past ISO date", () => expect(ok(isoDate, DATE)).toBe(true));
  it("rejects a non-ISO string", () => expect(ok(isoDate, "15/01/2026")).toBe(false));
  it("rejects an impossible date", () => expect(ok(isoDate, "2026-13-40")).toBe(false));
  it("rejects a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(ok(isoDate, todayIso(future))).toBe(false);
  });
});

describe("nexusRowSchema", () => {
  it("accepts a valid sales_only row", () => expect(ok(nexusRowSchema, makeRow())).toBe(true));
  it("accepts a valid sales_or_transactions row", () =>
    expect(
      ok(nexusRowSchema, makeRow({ threshold_rule: "sales_or_transactions", transactions_threshold: 200 })),
    ).toBe(true));
  it("accepts a no-sales-tax row with rule none", () =>
    expect(
      ok(nexusRowSchema, makeRow({ has_state_sales_tax: false, threshold_rule: "none", sales_threshold_usd: null })),
    ).toBe(true));
  it("accepts a pending row with no figures and no sources", () =>
    expect(
      ok(
        nexusRowSchema,
        makeRow({
          threshold_rule: "none",
          sales_threshold_usd: null,
          comparator: null,
          measurement_period: null,
          sources: [],
          verification: { level: "pending", verified_on: DATE },
        }),
      ),
    ).toBe(true));
  it("accepts an Alaska-style row: no state sales tax, thresholds present, notes explain", () =>
    expect(
      ok(nexusRowSchema, makeRow({ has_state_sales_tax: false, notes: "Local remote-seller regime." })),
    ).toBe(true));

  it("rejects a non-pending row without sources", () =>
    expect(ok(nexusRowSchema, makeRow({ sources: [] }))).toBe(false));
  it("rejects a pending row that carries a figure", () =>
    expect(
      ok(
        nexusRowSchema,
        makeRow({ threshold_rule: "none", sales_threshold_usd: 100000, verification: { level: "pending", verified_on: DATE } }),
      ),
    ).toBe(false));
  it("rejects rule none with a threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ threshold_rule: "none" }))).toBe(false));
  it("rejects sales_only with a transaction threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ transactions_threshold: 200 }))).toBe(false));
  it("rejects an or-rule missing the transaction threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ threshold_rule: "sales_or_transactions" }))).toBe(false));
  it("rejects a no-sales-tax row with thresholds and empty notes", () =>
    expect(ok(nexusRowSchema, makeRow({ has_state_sales_tax: false }))).toBe(false));
  it("rejects reviewed without by/on", () =>
    expect(ok(nexusRowSchema, makeRow({ review: { status: "reviewed", by: null, on: null } }))).toBe(false));
  it("rejects an http source", () =>
    expect(ok(nexusRowSchema, makeRow({ sources: [{ ...SRC, url: "http://example.com" }] }))).toBe(false));
  it("rejects a lowercase code", () => expect(ok(nexusRowSchema, makeRow({ code: "zz" }))).toBe(false));
  it("rejects a negative threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ sales_threshold_usd: -1 }))).toBe(false));
});

describe("toolRowSchema", () => {
  it("accepts a valid per_filing tool", () => expect(ok(toolRowSchema, makeTool())).toBe(true));
  it("accepts a quote_only tool with null prices and pricing_public false", () =>
    expect(
      ok(
        toolRowSchema,
        makeTool({
          pricing_model: "quote_only",
          pricing_public: false,
          pricing: { registration_fee_usd: null, filing_fee_usd: null, per_jurisdiction_month_usd: null, percent_fee: null, fixed_fee_usd: null, starting_monthly_usd: null, pricing_url: "https://example.com/pricing" },
        }),
      ),
    ).toBe(true));
  it("rejects quote_only with pricing_public true", () =>
    expect(
      ok(
        toolRowSchema,
        makeTool({
          pricing_model: "quote_only",
          pricing_public: true,
          pricing: { registration_fee_usd: null, filing_fee_usd: null, per_jurisdiction_month_usd: null, percent_fee: null, fixed_fee_usd: null, starting_monthly_usd: null, pricing_url: null },
        }),
      ),
    ).toBe(false));
  it("rejects quote_only with a price", () =>
    expect(ok(toolRowSchema, makeTool({ pricing_model: "quote_only", pricing_public: false }))).toBe(false));
  it("rejects per_filing without a filing fee", () =>
    expect(
      ok(toolRowSchema, makeTool({ pricing: { ...makeTool().pricing, filing_fee_usd: null } })),
    ).toBe(false));
  it("rejects percent_plus_fixed without a percent", () =>
    expect(
      ok(toolRowSchema, makeTool({ pricing_model: "percent_plus_fixed", pricing: { ...makeTool().pricing, percent_fee: null } })),
    ).toBe(false));
  it("rejects a tool without sources", () => expect(ok(toolRowSchema, makeTool({ sources: [] }))).toBe(false));
  it("rejects a pending verification level on a tool", () =>
    expect(ok(toolRowSchema, makeTool({ verification: { level: "pending", verified_on: DATE } }))).toBe(false));
  it("rejects a non-kebab slug", () => expect(ok(toolRowSchema, makeTool({ slug: "Bad Slug" }))).toBe(false));
});

describe("changelogEntrySchema", () => {
  it("accepts a valid entry", () =>
    expect(
      ok(changelogEntrySchema, { date: DATE, dataset: "site", subject: "v0.1", change: "Initial build", source_url: null }),
    ).toBe(true));
  it("rejects an unknown dataset", () =>
    expect(
      ok(changelogEntrySchema, { date: DATE, dataset: "other", subject: "x", change: "y", source_url: null }),
    ).toBe(false));
});
