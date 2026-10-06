import { describe, expect, it } from "vitest";
import {
  assertValidSiteUrl,
  displayName,
  hasOwnerDetails,
  isPlaceholderSiteUrl,
  outboundUrl,
  PLACEHOLDER_SITE_URL,
} from "../src/lib/config";
import type { SiteConfig } from "../site.config";

const base: SiteConfig = {
  siteName: "Test Site",
  workingTitle: true,
  siteUrl: "https://example.com",
  tagline: "t",
  owner: { name: "", email: "", location: "" },
  newsletterActionUrl: "",
  affiliateUrls: {},
  reviewer: { name: "", credential: "" },
};

describe("assertValidSiteUrl", () => {
  it("accepts an absolute https URL", () => {
    expect(() => assertValidSiteUrl("https://salestax.example")).not.toThrow();
  });
  it("rejects http", () => {
    expect(() => assertValidSiteUrl("http://salestax.example")).toThrow(/https/);
  });
  it("rejects a relative path", () => {
    expect(() => assertValidSiteUrl("/nope")).toThrow(/absolute/);
  });
});

describe("isPlaceholderSiteUrl", () => {
  it("is true for the placeholder with or without a trailing slash", () => {
    expect(isPlaceholderSiteUrl(PLACEHOLDER_SITE_URL)).toBe(true);
    expect(isPlaceholderSiteUrl(`${PLACEHOLDER_SITE_URL}/`)).toBe(true);
  });
  it("is false for a real domain", () => {
    expect(isPlaceholderSiteUrl("https://salestax.example")).toBe(false);
  });
});

describe("displayName", () => {
  it("appends the working-title suffix while workingTitle is true", () => {
    expect(displayName(base)).toBe("Test Site (working title)");
  });
  it("uses the bare name once workingTitle is false", () => {
    expect(displayName({ ...base, workingTitle: false })).toBe("Test Site");
  });
});

describe("hasOwnerDetails", () => {
  it("is false when name and email are blank", () => {
    expect(hasOwnerDetails(base)).toBe(false);
  });
  it("is true when either is set", () => {
    expect(hasOwnerDetails({ ...base, owner: { ...base.owner, email: "a@b.co" } })).toBe(true);
  });
});

describe("outboundUrl", () => {
  it("returns the website URL when no affiliate URL is configured", () => {
    expect(outboundUrl("acme", "https://acme.example", base)).toBe("https://acme.example");
  });
  it("returns the affiliate URL when configured for that slug", () => {
    const cfg = { ...base, affiliateUrls: { acme: "https://acme.example/?ref=x" } };
    expect(outboundUrl("acme", "https://acme.example", cfg)).toBe("https://acme.example/?ref=x");
  });
});
