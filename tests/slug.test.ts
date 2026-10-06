import { describe, expect, it } from "vitest";
import { toSlug } from "../src/lib/slug";

describe("toSlug", () => {
  it("lowercases and hyphenates", () => expect(toSlug("New York")).toBe("new-york"));
  it("handles three words", () => expect(toSlug("District of Columbia")).toBe("district-of-columbia"));
  it("trims stray punctuation", () => expect(toSlug(" Rhode Island ")).toBe("rhode-island"));
});
