import { describe, expect, it } from "vitest";
import { fmtUsd, formatPricing, formatThreshold, levelLabel, modelLabel, ruleLabel } from "../src/lib/format";
import { DATE, makeRow, makeTool } from "./fixtures";

describe("fmtUsd", () => {
  it("formats whole dollars with separators", () => expect(fmtUsd(500000)).toBe("$500,000"));
  it("keeps up to two decimals", () => expect(fmtUsd(0.5)).toBe("$0.50"));
});

describe("formatThreshold", () => {
  it("shows a sales-only threshold", () => expect(formatThreshold(makeRow())).toBe("$100,000"));
  it("prefixes 'More than' for exceeds", () =>
    expect(formatThreshold(makeRow({ comparator: "exceeds" }))).toBe("More than $100,000"));
  it("prefixes 'At least' for meets_or_exceeds", () =>
    expect(formatThreshold(makeRow({ comparator: "meets_or_exceeds" }))).toBe("At least $100,000"));
  it("joins or-rules with 'or'", () =>
    expect(formatThreshold(makeRow({ threshold_rule: "sales_or_transactions", transactions_threshold: 200 }))).toBe(
      "$100,000 or 200 transactions",
    ));
  it("joins and-rules with 'and'", () =>
    expect(
      formatThreshold(makeRow({ threshold_rule: "sales_and_transactions", sales_threshold_usd: 500000, transactions_threshold: 100 })),
    ).toBe("$500,000 and 100 transactions"));
  it("labels no-sales-tax rows", () =>
    expect(formatThreshold(makeRow({ has_state_sales_tax: false, threshold_rule: "none", sales_threshold_usd: null }))).toBe(
      "No statewide sales tax",
    ));
  it("labels pending rows without figures", () =>
    expect(
      formatThreshold(
        makeRow({ threshold_rule: "none", sales_threshold_usd: null, comparator: null, measurement_period: null, sources: [], verification: { level: "pending", verified_on: DATE } }),
      ),
    ).toBe("Verification pending"));
});

describe("formatPricing", () => {
  it("per_filing lists filing and registration fees", () =>
    expect(formatPricing(makeTool())).toBe("$75 per filing, $150 per registration"));
  it("quote_only", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "quote_only", pricing_public: false, pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null } }),
      ),
    ).toBe("Custom quote"));
  it("percent_plus_fixed with a fixed fee", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "percent_plus_fixed", pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null, percent_fee: 5, fixed_fee_usd: 0.5 } }),
      ),
    ).toBe("5% + $0.50 per transaction"));
  it("tiered_subscription", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "tiered_subscription", pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null, starting_monthly_usd: 49 } }),
      ),
    ).toBe("From $49 per month"));
});

describe("labels", () => {
  it("ruleLabel", () => expect(ruleLabel("sales_or_transactions")).toBe("Sales or transactions"));
  it("modelLabel", () => expect(modelLabel("per_jurisdiction_month")).toBe("Per jurisdiction per month"));
  it("levelLabel", () => expect(levelLabel("single_secondary")).toBe("Single secondary source: use with caution"));
});
