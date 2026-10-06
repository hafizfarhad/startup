import { describe, expect, it } from "vitest";
import { parseCount, parseMoney } from "../../src/lib/engine/parse";

describe("parseMoney", () => {
  it("parses symbols and separators", () => expect(parseMoney("$1,200,000.00")).toBe(1200000));
  it("parses a plain integer", () => expect(parseMoney("250000")).toBe(250000));
  it("parses decimals", () => expect(parseMoney("12.50")).toBe(12.5));
  it("parses zero", () => expect(parseMoney("0")).toBe(0));
  it("returns null for blank", () => expect(parseMoney("   ")).toBeNull());
  it("returns null for negatives", () => expect(parseMoney("-5")).toBeNull());
  it("returns null for text", () => expect(parseMoney("ten")).toBeNull());
});

describe("parseCount", () => {
  it("returns undefined for blank (optional field)", () => expect(parseCount("")).toBeUndefined());
  it("parses separators", () => expect(parseCount("1,000")).toBe(1000));
  it("returns null for decimals", () => expect(parseCount("3.5")).toBeNull());
  it("returns null for negatives", () => expect(parseCount("-1")).toBeNull());
  it("returns null for text", () => expect(parseCount("many")).toBeNull());
});
