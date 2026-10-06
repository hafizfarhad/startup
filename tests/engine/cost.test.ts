import { describe, expect, it } from "vitest";
import { estimateToolCost, estimateToolCosts, FILINGS_PER_STATE_PER_YEAR } from "../../src/lib/engine/cost";
import { makeTool } from "../fixtures";

const nullPricing = {
  registration_fee_usd: null,
  filing_fee_usd: null,
  per_jurisdiction_month_usd: null,
  percent_fee: null,
  fixed_fee_usd: null,
  starting_monthly_usd: null,
  pricing_url: null,
};
const summary = { registrationCount: 2, totalSalesUsd: 100000, totalTransactions: 2000 };

describe("estimateToolCost", () => {
  it("assumes quarterly filings", () => expect(FILINGS_PER_STATE_PER_YEAR).toBe(4));

  it("quote_only has no number", () => {
    const t = makeTool({ pricing_model: "quote_only", pricing_public: false, pricing: nullPricing });
    const e = estimateToolCost(t, summary);
    expect(e.annualEstimateUsd).toBeNull();
    expect(e.label).toBe("custom_quote");
  });

  it("per_filing: registrations plus quarterly filings", () => {
    const e = estimateToolCost(makeTool(), summary);
    expect(e.annualEstimateUsd).toBe(2 * 150 + 2 * 4 * 75);
    expect(e.label).toBe("estimate");
  });

  it("per_filing without a published registration fee notes the exclusion", () => {
    const e = estimateToolCost(makeTool({ pricing: { ...makeTool().pricing, registration_fee_usd: null } }), summary);
    expect(e.annualEstimateUsd).toBe(2 * 4 * 75);
    expect(e.notes.join(" ")).toMatch(/Registration fee not published/);
  });

  it("per_filing with zero registrations is zero with a note", () => {
    const e = estimateToolCost(makeTool(), { ...summary, registrationCount: 0 });
    expect(e.annualEstimateUsd).toBe(0);
    expect(e.notes.join(" ")).toMatch(/No registrations indicated/);
  });

  it("per_jurisdiction_month multiplies by 12", () => {
    const t = makeTool({ pricing_model: "per_jurisdiction_month", pricing: { ...nullPricing, per_jurisdiction_month_usd: 100 } });
    expect(estimateToolCost(t, { ...summary, registrationCount: 3 }).annualEstimateUsd).toBe(3600);
  });

  it("tiered_subscription is labelled from", () => {
    const t = makeTool({ pricing_model: "tiered_subscription", pricing: { ...nullPricing, starting_monthly_usd: 49 } });
    const e = estimateToolCost(t, summary);
    expect(e.annualEstimateUsd).toBe(588);
    expect(e.label).toBe("from");
  });

  it("tiered_subscription with zero registrations is zero with a note", () => {
    const t = makeTool({ pricing_model: "tiered_subscription", pricing: { ...nullPricing, starting_monthly_usd: 49 } });
    const e = estimateToolCost(t, { ...summary, registrationCount: 0 });
    expect(e.annualEstimateUsd).toBe(0);
    expect(e.notes.join(" ")).toMatch(/No registrations indicated/);
  });

  it("percent_plus_fixed uses total sales and transactions", () => {
    const t = makeTool({ category: "merchant_of_record", pricing_model: "percent_plus_fixed", pricing: { ...nullPricing, percent_fee: 5, fixed_fee_usd: 0.5 } });
    expect(estimateToolCost(t, summary).annualEstimateUsd).toBe(5000 + 1000);
  });

  it("percent_plus_fixed omits the fixed part when transactions are unknown, and says so", () => {
    const t = makeTool({ category: "merchant_of_record", pricing_model: "percent_plus_fixed", pricing: { ...nullPricing, percent_fee: 5, fixed_fee_usd: 0.5 } });
    const e = estimateToolCost(t, { ...summary, totalTransactions: undefined });
    expect(e.annualEstimateUsd).toBe(5000);
    expect(e.notes.join(" ")).toMatch(/omitted/);
  });

  it("merchant of record still computes from sales when there are zero registrations", () => {
    const t = makeTool({ category: "merchant_of_record", pricing_model: "percent_plus_fixed", pricing: { ...nullPricing, percent_fee: 5, fixed_fee_usd: 0.5 } });
    const e = estimateToolCost(t, { ...summary, registrationCount: 0 });
    expect(e.annualEstimateUsd).toBe(5000 + 1000);
    expect(e.notes.join(" ")).not.toMatch(/No registrations indicated/);
  });

  it("per_jurisdiction_month with zero registrations is zero with a note", () => {
    const t = makeTool({ pricing_model: "per_jurisdiction_month", pricing: { ...nullPricing, per_jurisdiction_month_usd: 100 } });
    const e = estimateToolCost(t, { ...summary, registrationCount: 0 });
    expect(e.annualEstimateUsd).toBe(0);
    expect(e.notes.join(" ")).toMatch(/No registrations indicated/);
  });

  it("rounds to whole dollars", () => {
    const t = makeTool({ category: "merchant_of_record", pricing_model: "percent_plus_fixed", pricing: { ...nullPricing, percent_fee: 3.3 } });
    expect(estimateToolCost(t, { ...summary, totalSalesUsd: 1000.5, totalTransactions: undefined }).annualEstimateUsd).toBe(33);
  });
});

describe("estimateToolCosts", () => {
  it("maps every tool", () => {
    const out = estimateToolCosts([makeTool(), makeTool({ slug: "other" })], summary);
    expect(out.map((e) => e.slug)).toEqual(["example-tool", "other"]);
  });
});
