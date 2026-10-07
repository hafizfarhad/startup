# Deploy

The site is static. `npm run build` writes `dist/`. Any static host works; Cloudflare Pages is recommended because
its free tier includes Web Analytics with no code on the page.

## Before the first deploy

1. `site.config.ts`: real `siteUrl`, `siteName`, `workingTitle: false`, owner details.
2. `npm run check` passes locally with no placeholder warning.
3. The repository is pushed to GitHub (or GitLab).
4. `npm run check` must end with `postbuild-assert: OK (51 state pages, 12 required files)`, which also confirms the
   robots.txt Sitemap line is an absolute https URL.

## Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repository.
2. Build settings: Framework preset "Astro"; Build command `npm run build`; Build output directory `dist`.
3. Environment variable: `NODE_VERSION` = `22`.
4. Save and deploy. The first build gives a `*.pages.dev` URL. Open `/sitemap-index.xml` and `/data/us-economic-nexus.json`
   on it to confirm.
5. Enable Web Analytics for the Pages project (Analytics tab). No code change is needed.

Every push to `main` redeploys.

## Custom domain

1. Pages project → Custom domains → Set up a custom domain → enter the apex domain and `www`.
2. If the domain's DNS is on Cloudflare, records are added automatically; otherwise add the CNAME records shown.
3. Wait for the certificate to issue, then open `https://<domain>/`. Redirect `www` to the apex (or the reverse) in
   Pages → Custom domains, so the canonical URLs in the HTML match.
4. `siteUrl` in `site.config.ts` must equal the canonical origin exactly, or canonical tags and the sitemap will point
   at the wrong host.

## Alternatives

- **Netlify**: build command `npm run build`, publish directory `dist`, environment `NODE_VERSION=22`.
- **Vercel**: framework preset Astro, build `npm run build`, output `dist`, Node 22 in project settings.

## Verifying a deploy

- `https://<domain>/robots.txt` and `/sitemap-index.xml` load.
- A state page, for example `/us/economic-nexus/texas/`, shows badges, sources and a verified date.
- The wizard evaluates a sample input with no console errors.
