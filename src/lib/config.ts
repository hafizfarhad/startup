import { siteConfig, type SiteConfig } from "../../site.config";

export const PLACEHOLDER_SITE_URL = "https://example.com";

export function assertValidSiteUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`siteUrl must be an absolute URL, got "${url}"`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`siteUrl must use https, got "${url}"`);
  }
}

export function isPlaceholderSiteUrl(url: string): boolean {
  return url.replace(/\/+$/, "") === PLACEHOLDER_SITE_URL;
}

export function displayName(config: SiteConfig = siteConfig): string {
  return config.workingTitle ? `${config.siteName} (working title)` : config.siteName;
}

export function hasOwnerDetails(config: SiteConfig = siteConfig): boolean {
  return config.owner.name.trim() !== "" || config.owner.email.trim() !== "";
}

export function outboundUrl(slug: string, websiteUrl: string, config: SiteConfig = siteConfig): string {
  return config.affiliateUrls[slug] ?? websiteUrl;
}

export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap-index.xml", siteUrl).toString()}\n`;
}

export { siteConfig };
