import { describe, expect, it } from "vitest";
import { validateInput } from "../../src/lib/engine/validate";
import { makeRow } from "../fixtures";

const rows = [makeRow({ code: "AA", name: "Alpha" }), makeRow({ code: "BB", name: "Beta" })];

describe("validateInput", () => {
  it("accepts a valid input", () => {
    expect(validateInput({ homeState: "AA", lines: [{ code: "BB", grossSalesUsd: 1000, transactions: 3 }] }, rows)).toEqual([]);
  });
  it("accepts zero sales and an omitted transaction count", () => {
    expect(validateInput({ homeState: null, lines: [{ code: "AA", grossSalesUsd: 0 }] }, rows)).toEqual([]);
  });
  it("rejects an unknown state code", () => {
    const errors = validateInput({ homeState: null, lines: [{ code: "QQ", grossSalesUsd: 1 }] }, rows);
    expect(errors).toEqual([{ field: "code", index: 0, message: 'Unknown state code "QQ"' }]);
  });
  it("rejects the same state entered twice", () => {
    const errors = validateInput(
      { homeState: null, lines: [{ code: "AA", grossSalesUsd: 1 }, { code: "AA", grossSalesUsd: 2 }] },
      rows,
    );
    expect(errors).toEqual([{ field: "code", index: 1, message: 'State "AA" entered more than once' }]);
  });
  it("rejects negative and non-finite sales", () => {
    const errors = validateInput(
      { homeState: null, lines: [{ code: "AA", grossSalesUsd: -1 }, { code: "BB", grossSalesUsd: Number.NaN }] },
      rows,
    );
    expect(errors.map((e) => e.index)).toEqual([0, 1]);
    expect(errors.every((e) => e.field === "grossSalesUsd")).toBe(true);
  });
  it("rejects fractional or negative transactions", () => {
    const errors = validateInput(
      { homeState: null, lines: [{ code: "AA", grossSalesUsd: 1, transactions: 1.5 }, { code: "BB", grossSalesUsd: 1, transactions: -2 }] },
      rows,
    );
    expect(errors.every((e) => e.field === "transactions")).toBe(true);
    expect(errors).toHaveLength(2);
  });
  it("rejects an unknown home state", () => {
    expect(validateInput({ homeState: "QQ", lines: [] }, rows)).toEqual([
      { field: "homeState", message: 'Unknown state code "QQ"' },
    ]);
  });
});
