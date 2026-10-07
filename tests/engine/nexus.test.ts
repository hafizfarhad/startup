import { describe, expect, it } from "vitest";
import { classifyMeasure, combineOutcomes, evaluateAll, evaluateState } from "../../src/lib/engine/nexus";
import { DATE, makeRow } from "../fixtures";

describe("classifyMeasure", () => {
  it("unknown when the value is missing", () => expect(classifyMeasure(undefined, 100, null)).toBe("unknown"));
  it("trigger above the threshold", () => expect(classifyMeasure(101, 100, null)).toBe("trigger"));
  it("below under the threshold", () => expect(classifyMeasure(99, 100, "exceeds")).toBe("below"));
  it("at when equal and the comparator is unknown", () => expect(classifyMeasure(100, 100, null)).toBe("at"));
  it("trigger when equal and the rule is meets_or_exceeds", () =>
    expect(classifyMeasure(100, 100, "meets_or_exceeds")).toBe("trigger"));
  it("below when equal and the rule is exceeds", () => expect(classifyMeasure(100, 100, "exceeds")).toBe("below"));
});

describe("combineOutcomes", () => {
  it("sales_only maps the sales outcome", () => {
    expect(combineOutcomes("sales_only", "trigger", "unknown")).toBe("registration_likely_required");
    expect(combineOutcomes("sales_only", "at", "unknown")).toBe("at_threshold_check_wording");
    expect(combineOutcomes("sales_only", "below", "unknown")).toBe("below_threshold");
  });
  it("or-rule: any trigger wins", () =>
    expect(combineOutcomes("sales_or_transactions", "below", "trigger")).toBe("registration_likely_required"));
  it("or-rule: at beats unknown", () =>
    expect(combineOutcomes("sales_or_transactions", "at", "unknown")).toBe("at_threshold_check_wording"));
  it("or-rule: unknown beats below", () =>
    expect(combineOutcomes("sales_or_transactions", "below", "unknown")).toBe("insufficient_data"));
  it("or-rule: all below", () => expect(combineOutcomes("sales_or_transactions", "below", "below")).toBe("below_threshold"));
  it("and-rule: any below wins even over unknown", () =>
    expect(combineOutcomes("sales_and_transactions", "below", "unknown")).toBe("below_threshold"));
  it("and-rule: unknown blocks when nothing is below", () =>
    expect(combineOutcomes("sales_and_transactions", "trigger", "unknown")).toBe("insufficient_data"));
  it("and-rule: all trigger", () =>
    expect(combineOutcomes("sales_and_transactions", "trigger", "trigger")).toBe("registration_likely_required"));
  it("and-rule: trigger plus at is at", () =>
    expect(combineOutcomes("sales_and_transactions", "trigger", "at")).toBe("at_threshold_check_wording"));
  it("or-rule: trigger beats at", () =>
    expect(combineOutcomes("sales_or_transactions", "at", "trigger")).toBe("registration_likely_required"));
  it("and-rule: all at is at", () =>
    expect(combineOutcomes("sales_and_transactions", "at", "at")).toBe("at_threshold_check_wording"));
});

const noTax = makeRow({ code: "OR", name: "Oregon", has_state_sales_tax: false, threshold_rule: "none", sales_threshold_usd: null, measurement_period: null });
const salesOnly = makeRow({ code: "TX", name: "Texas", sales_threshold_usd: 500000, comparator: "exceeds", measurement_period: "Preceding twelve calendar months" });
const orRule = makeRow({ code: "IL", name: "Illinois", threshold_rule: "sales_or_transactions", sales_threshold_usd: 100000, transactions_threshold: 200 });
const andRule = makeRow({ code: "NY", name: "New York", threshold_rule: "sales_and_transactions", sales_threshold_usd: 500000, transactions_threshold: 100 });
const pending = makeRow({ code: "PN", name: "Pendingland", threshold_rule: "none", sales_threshold_usd: null, comparator: null, measurement_period: null, sources: [], verification: { level: "pending", verified_on: DATE } });
const noRule = makeRow({ code: "NR", name: "Noruleland", threshold_rule: "none", sales_threshold_usd: null });
const alaskaStyle = makeRow({ code: "AK", name: "Alaska", has_state_sales_tax: false, notes: "Local remote-seller regime administered statewide." });

describe("evaluateState", () => {
  it("no-sales-tax state, even when it is the home state", () => {
    expect(evaluateState(noTax, null, "OR").status).toBe("no_state_sales_tax");
  });
  it("home state is physical presence without evaluating thresholds", () => {
    const r = evaluateState(salesOnly, { code: "TX", grossSalesUsd: 1 }, "TX");
    expect(r.status).toBe("physical_presence");
  });
  it("home state with no sales line still evaluates as physical presence", () => {
    expect(evaluateState(salesOnly, null, "TX").status).toBe("physical_presence");
  });
  it("pending row yields insufficient_data with a pending message", () => {
    const r = evaluateState(pending, { code: "PN", grossSalesUsd: 1_000_000 }, null);
    expect(r.status).toBe("insufficient_data");
    expect(r.message).toMatch(/pending verification/);
  });
  it("sales-tax state with no recorded rule yields insufficient_data", () => {
    expect(evaluateState(noRule, { code: "NR", grossSalesUsd: 1 }, null).status).toBe("insufficient_data");
  });
  it("missing line yields insufficient_data", () => {
    expect(evaluateState(salesOnly, null, null).status).toBe("insufficient_data");
  });
  it("sales_only above threshold is likely required and names the period", () => {
    const r = evaluateState(salesOnly, { code: "TX", grossSalesUsd: 600000 }, null);
    expect(r.status).toBe("registration_likely_required");
    expect(r.message).toContain("$500,000");
    expect(r.message).toContain("Preceding twelve calendar months");
  });
  it("sales_only exactly at threshold with exceeds is below", () => {
    expect(evaluateState(salesOnly, { code: "TX", grossSalesUsd: 500000 }, null).status).toBe("below_threshold");
  });
  it("or-rule with sales below and transactions missing asks for a transaction count", () => {
    const r = evaluateState(orRule, { code: "IL", grossSalesUsd: 50000 }, null);
    expect(r.status).toBe("insufficient_data");
    expect(r.message).toMatch(/transaction count/);
  });
  it("or-rule with transactions over the threshold is likely required", () => {
    expect(evaluateState(orRule, { code: "IL", grossSalesUsd: 50000, transactions: 250 }, null).status).toBe(
      "registration_likely_required",
    );
  });
  it("and-rule with sales below is below regardless of transactions", () => {
    expect(evaluateState(andRule, { code: "NY", grossSalesUsd: 100 }, null).status).toBe("below_threshold");
  });
  it("and-rule with sales above and transactions missing is insufficient", () => {
    expect(evaluateState(andRule, { code: "NY", grossSalesUsd: 600000 }, null).status).toBe("insufficient_data");
  });
  it("Alaska-style row evaluates thresholds and carries notes", () => {
    const r = evaluateState(alaskaStyle, { code: "AK", grossSalesUsd: 150000 }, null);
    expect(r.status).toBe("registration_likely_required");
    expect(r.notes).toMatch(/Local remote-seller regime/);
  });
  it("results carry the three caveats and the row's sources", () => {
    const r = evaluateState(salesOnly, { code: "TX", grossSalesUsd: 1 }, null);
    expect(r.caveats).toHaveLength(3);
    expect(r.sources).toEqual(salesOnly.sources);
  });
  it("home state wins over pending verification", () => {
    expect(evaluateState(pending, null, "PN").status).toBe("physical_presence");
  });
  it("sales_only row ignores a supplied transaction count", () => {
    const r = evaluateState(salesOnly, { code: "TX", grossSalesUsd: 1, transactions: 1_000_000 }, null);
    expect(r.status).toBe("below_threshold");
  });
  it("and-rule insufficient result names the missing transaction count", () => {
    const r = evaluateState(andRule, { code: "NY", grossSalesUsd: 600000 }, null);
    expect(r.status).toBe("insufficient_data");
    expect(r.message).toMatch(/transaction count/);
    expect(r.message).toContain("100-transaction");
  });
  it("result carries the row's thresholds, comparator, period and measure", () => {
    const r = evaluateState(salesOnly, { code: "TX", grossSalesUsd: 1 }, null);
    expect(r.salesThresholdUsd).toBe(500000);
    expect(r.transactionsThreshold).toBeNull();
    expect(r.comparator).toBe("exceeds");
    expect(r.measurementPeriod).toBe("Preceding twelve calendar months");
    expect(r.salesMeasure).toBe("gross");
    expect(r.verificationLevel).toBe("corroborated");
    expect(r.verifiedOn).toBe(DATE);
  });
});

describe("evaluateAll", () => {
  const rows = [noTax, salesOnly, orRule, andRule];
  it("returns validation errors", () => {
    const out = evaluateAll({ homeState: null, lines: [{ code: "QQ", grossSalesUsd: 1 }] }, rows);
    expect(out.ok).toBe(false);
  });
  it("adds the home state when it is not among the lines and counts it", () => {
    const out = evaluateAll({ homeState: "TX", lines: [{ code: "IL", grossSalesUsd: 10, transactions: 1 }] }, rows);
    if (!out.ok) throw new Error("expected ok");
    expect(out.results.map((r) => r.code)).toEqual(["IL", "TX"]);
    expect(out.results[1]?.status).toBe("physical_presence");
    expect(out.registrationCount).toBe(1);
  });
  it("counts likely-required and physical-presence states", () => {
    const out = evaluateAll(
      { homeState: "TX", lines: [{ code: "IL", grossSalesUsd: 200000, transactions: 1 }, { code: "NY", grossSalesUsd: 1 }] },
      rows,
    );
    if (!out.ok) throw new Error("expected ok");
    expect(out.registrationCount).toBe(2);
  });
  it("totals sales, and transactions only when every line has one", () => {
    const withAll = evaluateAll({ homeState: null, lines: [{ code: "IL", grossSalesUsd: 10, transactions: 2 }, { code: "NY", grossSalesUsd: 5, transactions: 3 }] }, rows);
    const withGap = evaluateAll({ homeState: null, lines: [{ code: "IL", grossSalesUsd: 10, transactions: 2 }, { code: "NY", grossSalesUsd: 5 }] }, rows);
    if (!withAll.ok || !withGap.ok) throw new Error("expected ok");
    expect(withAll.totalSalesUsd).toBe(15);
    expect(withAll.totalTransactions).toBe(5);
    expect(withGap.totalTransactions).toBeUndefined();
  });
  it("a zero-sales line is valid and below threshold", () => {
    const out = evaluateAll({ homeState: null, lines: [{ code: "TX", grossSalesUsd: 0 }] }, rows);
    if (!out.ok) throw new Error("expected ok");
    expect(out.results[0]?.status).toBe("below_threshold");
  });
  it("a line-less home state with no sales tax yields one no-tax result and no registrations", () => {
    const out = evaluateAll({ homeState: "OR", lines: [] }, rows);
    if (!out.ok) throw new Error("expected ok");
    expect(out.results.map((r) => [r.code, r.status])).toEqual([["OR", "no_state_sales_tax"]]);
    expect(out.registrationCount).toBe(0);
  });
  it("a home state that also has a line appears once, as physical presence", () => {
    const out = evaluateAll({ homeState: "TX", lines: [{ code: "TX", grossSalesUsd: 1 }] }, rows);
    if (!out.ok) throw new Error("expected ok");
    expect(out.results).toHaveLength(1);
    expect(out.results[0]?.status).toBe("physical_presence");
  });
  it("validation failure returns the error list", () => {
    const out = evaluateAll({ homeState: null, lines: [{ code: "QQ", grossSalesUsd: 1 }] }, rows);
    if (out.ok) throw new Error("expected errors");
    expect(out.errors[0]?.field).toBe("code");
  });
});
