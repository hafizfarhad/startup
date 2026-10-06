export type SiteConfig = {
  siteName: string;
  workingTitle: boolean;
  siteUrl: string;
  tagline: string;
  owner: { name: string; email: string; location: string };
  newsletterActionUrl: string;
  affiliateUrls: Record<string, string>;
  reviewer: { name: string; credential: string };
};

// Edit this file to brand and configure the site. Nothing else hardcodes these values.
export const siteConfig: SiteConfig = {
  siteName: "SalesTax Engine",
  workingTitle: true, // set false once the real name is chosen
  siteUrl: "https://example.com", // replace with the real domain before the first deploy
  tagline: "US economic-nexus thresholds and compliance-tool pricing, sourced and dated.",
  owner: { name: "", email: "", location: "" }, // all empty => About details and Report-error link hidden
  newsletterActionUrl: "", // empty => newsletter form not rendered
  affiliateUrls: {}, // tool slug => affiliate URL; empty => plain website links
  reviewer: { name: "", credential: "" }, // shown only on rows whose review.status === "reviewed"
};
