import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { siteConfig } from "./site.config";
import { assertValidSiteUrl, isPlaceholderSiteUrl } from "./src/lib/config";

assertValidSiteUrl(siteConfig.siteUrl);
if (isPlaceholderSiteUrl(siteConfig.siteUrl)) {
  console.warn(
    "[site.config] siteUrl is the placeholder https://example.com. Set the real domain before deploying.",
  );
}

export default defineConfig({
  site: siteConfig.siteUrl,
  output: "static",
  integrations: [sitemap()],
});
