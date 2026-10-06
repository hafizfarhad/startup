# SalesTax Engine v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, fully sourced website with a US economic-nexus dataset (51 jurisdictions), a compliance-tool pricing dataset, and a registration wizard with per-tool cost estimates.

**Architecture:** Astro static site whose pages are generated from JSON data files validated at build time by Zod schemas (a row without sources or a verified-on date fails the build). Wizard logic is pure TypeScript in `src/lib/engine/`, unit-tested with Vitest, and bundled into one client script. Every data row carries sources, a verification level and a review status that default to "unreviewed".

**Tech Stack:** Node 22, Astro 7 (static output, content collections with the `file()` loader), `astro/zod`, `@astrojs/sitemap`, `@astrojs/check` + TypeScript, Vitest, plain CSS. No UI framework, no server, no database.

**Spec:** `docs/superpowers/specs/2026-10-06-salestax-engine-v0.1-design.md` (read it first; this plan implements it section by section).

## Global Constraints

- Node `>=22`. Work on branch `main` of this fresh repo; no worktree is needed (nothing to isolate from).
- Dependencies allowed: `astro`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `vitest`. Nothing else without a new spec.
- Exactly 51 rows in `data/us-economic-nexus.json` (50 states + DC). Puerto Rico is out of scope.
- Never type a threshold, fee, rate or date from memory. A figure appears in a data file only if it was read from a page fetched during the task, which is then listed in `sources` with `accessed_on`. Unfetchable ⇒ `verification.level: "pending"` and an entry in `data/BACKLOG.md`.
- Never set `review.status` to `"reviewed"`. Only the human reviewer does that.
- Affiliate URLs live only in `site.config.ts` (`affiliateUrls`), never in data files or page copy.
- All dates ISO `YYYY-MM-DD`; all URLs absolute `https://`; money in USD as plain numbers.
- UI copy never claims professional review unless a row's `review.status === "reviewed"`. Empty config values hide their UI rather than rendering placeholders.
- Scope fence: `docs/SCOPE.md` section "Out of scope" is binding. Any addition needs a new spec first.
- Commit after every task with the message given in the task. Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Data tasks use the `WebFetch` tool. Load it first with `ToolSearch` query `select:WebFetch`. Each fetch is one URL plus a prompt; the tool returns a model-written answer, so ask for verbatim quotes.

## Review Focus

Inputs the spec implies but did not spell out tests for. Each has a pinned test in the owning task.

1. A user types money with symbols and separators (`$1,200,000.00`) in the wizard: must parse to `1200000`, not fail silently. → Task 4 (`parse.test.ts`).
2. Home state chosen but not entered as a sales line: must still appear in results as `physical_presence` and count toward registrations. → Task 6 (`nexus.test.ts`).
3. The same state entered twice: must be a validation error, never a double count. → Task 5 (`validate.test.ts`).
4. A state whose row is `pending` entered in the wizard: must return `insufficient_data` with a "pending verification" message, never a crash or a number. → Task 6 (`nexus.test.ts`).
5. A merchant of record with a per-transaction fee when some lines omit transactions: the fixed part must be omitted with a note, not treated as zero transactions. → Task 7 (`cost.test.ts`).

## File Structure

| Path | Responsibility |
|---|---|
| `site.config.ts` | The only place brand, domain, owner, newsletter URL, affiliate map and reviewer live |
| `astro.config.ts` | Astro config: `site`, static output, sitemap; validates and warns on placeholder `siteUrl` |
| `src/lib/config.ts` | Helpers over `site.config.ts`: validation, display name, outbound URL |
| `src/lib/schemas.ts` | Zod schemas and TS types for nexus rows, tool rows, changelog entries |
| `src/content.config.ts` | Astro collections wired to `data/*.json` with the `file()` loader |
| `src/lib/slug.ts`, `src/lib/format.ts` | Pure helpers: slugs, money/threshold/pricing formatting |
| `src/lib/engine/types.ts` | Engine types and fixed caveat strings |
| `src/lib/engine/validate.ts` | Wizard input validation |
| `src/lib/engine/nexus.ts` | Threshold classification and state evaluation |
| `src/lib/engine/cost.ts` | Per-tool annual cost estimate |
| `src/lib/engine/parse.ts` | Parsing user-typed money and counts |
| `src/layouts/Base.astro` | HTML shell, header, nav, footer |
| `src/components/*.astro` | Badges, SourceList, NexusTable, ToolsTable, NewsletterForm, ReportError |
| `src/components/wizard/Wizard.astro`, `wizard-client.ts` | Wizard markup and the one client script |
| `src/pages/**` | Routes listed in spec §8 |
| `src/pages/data/*.json.ts` | JSON endpoints serving validated datasets |
| `src/styles/global.css` | All styling |
| `scripts/postbuild-assert.mjs` | Asserts page counts and endpoints in `dist/` |
| `data/*.json`, `data/BACKLOG.md` | The datasets and the unverified-facts log |
| `tests/**` | Vitest tests; `tests/fixtures.ts` shared fixtures |
| `CLAUDE.md`, `README.md`, `docs/*.md` | Agent rules, usage, scope, roadmap, next steps, provenance, deploy |

---

### Task 1: Scaffold, config helpers, scope fence

**Files:**
- Create: `package.json`, `astro.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `site.config.ts`, `src/lib/config.ts`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`, `public/robots.txt`
- Create: `CLAUDE.md`, `docs/SCOPE.md`
- Test: `tests/config.test.ts`

**Interfaces:**
- Produces: `siteConfig: SiteConfig` (shape in spec §4); `displayName(config?)`, `hasOwnerDetails(config?)`, `outboundUrl(slug, websiteUrl, config?)`, `assertValidSiteUrl(url)`, `isPlaceholderSiteUrl(url)` from `src/lib/config.ts`; layout `Base.astro` with props `{ title: string; description: string }`.

- [ ] **Step 1: Initialize the package and install dependencies**

Run:
```bash
cd /home/hafizfarhad/Documents/startup
npm init -y >/dev/null
npm pkg set name="salestax-engine" private=true type="module" version="0.1.0" engines.node=">=22"
npm pkg set scripts.dev="astro dev" scripts.build="astro build" scripts.preview="astro preview" scripts.typecheck="astro check" scripts.test="vitest run" scripts."postbuild:assert"="node scripts/postbuild-assert.mjs" scripts.check="npm run typecheck && npm run test && npm run build && npm run postbuild:assert"
npm pkg delete scripts.start main description keywords author license
npm install astro@^7 @astrojs/sitemap @astrojs/check typescript
npm install -D vitest
```
Expected: `node_modules/` created, `package-lock.json` written, no install errors.

- [ ] **Step 2: Write `.gitignore`, `tsconfig.json`, `vitest.config.ts`**

`.gitignore`:
```
node_modules/
dist/
.astro/
*.log
.DS_Store
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Write the failing config tests**

`tests/config.test.ts`:
```ts
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
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npx vitest run tests/config.test.ts`
Expected: FAIL, "Cannot find module '../src/lib/config'" (or similar resolution error).

- [ ] **Step 5: Write `site.config.ts` and `src/lib/config.ts`**

`site.config.ts`:
```ts
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
```

`src/lib/config.ts`:
```ts
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

export { siteConfig };
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run tests/config.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 7: Write `astro.config.ts`, the layout, global CSS, placeholder index, robots**

`astro.config.ts`:
```ts
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
```

`src/styles/global.css`:
```css
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #5b6168;
  --line: #e3e6ea;
  --accent: #0b5fff;
  --ok: #1a7f37;
  --warn: #9a6700;
  --bad: #b42318;
  --soft: #f5f7fa;
  --max: 72rem;
}
* { box-sizing: border-box; }
html { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: var(--fg); background: var(--bg); }
body { margin: 0; }
a { color: var(--accent); }
.container { max-width: var(--max); margin: 0 auto; padding: 1rem; }
.site-header { border-bottom: 1px solid var(--line); }
.site-header .inner { max-width: var(--max); margin: 0 auto; padding: 0.75rem 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; align-items: center; }
.brand { font-weight: 700; text-decoration: none; color: var(--fg); }
.site-header nav { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; }
.site-header nav a { text-decoration: none; color: var(--muted); }
.site-footer { border-top: 1px solid var(--line); margin-top: 3rem; color: var(--muted); font-size: 0.9rem; }
.site-footer .inner { max-width: var(--max); margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.75rem; line-height: 1.2; margin: 1rem 0 0.5rem; }
h2 { font-size: 1.25rem; margin: 2rem 0 0.5rem; }
.muted { color: var(--muted); }
.notice { background: var(--soft); border-left: 4px solid var(--warn); padding: 0.75rem 1rem; }
.table-wrap { overflow-x: auto; }
.data-table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
.data-table th, .data-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--line); vertical-align: top; }
.data-table th { background: var(--soft); white-space: nowrap; }
.badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0 1rem; }
.badge { display: inline-block; font-size: 0.8rem; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--line); background: var(--soft); white-space: nowrap; }
.badge-official { border-color: var(--ok); color: var(--ok); }
.badge-corroborated { border-color: var(--accent); color: var(--accent); }
.badge-single_secondary { border-color: var(--warn); color: var(--warn); }
.badge-pending { border-color: var(--bad); color: var(--bad); }
.badge-unreviewed { color: var(--muted); }
.badge-reviewed { border-color: var(--ok); color: var(--ok); }
.facts { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1rem; }
.facts dt { color: var(--muted); }
.facts dd { margin: 0; }
.sources { padding-left: 1.2rem; }
.wizard fieldset { border: 1px solid var(--line); border-radius: 6px; padding: 0.75rem 1rem; margin: 0 0 1rem; }
.wizard .line { display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-bottom: 0.75rem; }
.wizard input, .wizard select, .wizard button { font: inherit; padding: 0.45rem 0.6rem; border: 1px solid var(--line); border-radius: 4px; }
.wizard button { cursor: pointer; background: var(--soft); }
.wizard button[type="submit"] { background: var(--accent); color: #fff; border-color: var(--accent); }
.errors { color: var(--bad); min-height: 1.5rem; }
.status { font-weight: 600; }
.status-registration_likely_required, .status-physical_presence { color: var(--bad); }
.status-at_threshold_check_wording, .status-insufficient_data { color: var(--warn); }
.status-below_threshold, .status-no_state_sales_tax { color: var(--ok); }
.newsletter { background: var(--soft); padding: 1rem; border-radius: 6px; margin: 2rem 0; }
.newsletter .row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.newsletter input { flex: 1 1 14rem; font: inherit; padding: 0.45rem 0.6rem; border: 1px solid var(--line); border-radius: 4px; }
.newsletter button { font: inherit; padding: 0.45rem 0.9rem; border-radius: 4px; border: 1px solid var(--accent); background: var(--accent); color: #fff; }
@media (min-width: 40rem) {
  .wizard .line { grid-template-columns: 2fr 2fr 2fr auto; align-items: center; }
}
```

`src/layouts/Base.astro`:
```astro
---
import "../styles/global.css";
import { displayName, siteConfig } from "../lib/config";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const name = displayName();
const canonical = new URL(Astro.url.pathname, siteConfig.siteUrl).toString();
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} · {name}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="sitemap" href="/sitemap-index.xml" />
  </head>
  <body>
    <header class="site-header">
      <div class="inner">
        <a class="brand" href="/">{name}</a>
        <nav aria-label="Main">
          <a href="/us/economic-nexus/">US nexus thresholds</a>
          <a href="/tools/">Tools and pricing</a>
          <a href="/wizard/">Wizard</a>
          <a href="/changelog/">Changelog</a>
          <a href="/methodology/">Methodology</a>
        </nav>
      </div>
    </header>
    <main class="container">
      <slot />
    </main>
    <footer class="site-footer">
      <div class="inner">
        <p>
          Information only, not tax advice. Figures are sourced and dated; see the
          <a href="/methodology/">methodology</a> and <a href="/disclosure/">disclosure</a> pages.
          <a href="/about/">About this site</a>.
        </p>
      </div>
    </footer>
  </body>
</html>
```

`src/pages/index.astro` (placeholder, replaced in Task 15):
```astro
---
import Base from "../layouts/Base.astro";
import { siteConfig } from "../lib/config";
---

<Base title="Home" description={siteConfig.tagline}>
  <h1>{siteConfig.tagline}</h1>
  <p>Build in progress.</p>
</Base>
```

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: /sitemap-index.xml
```

- [ ] **Step 8: Build to verify the scaffold works**

Run: `npm run build`
Expected: build succeeds; output includes the placeholder warning line about `siteUrl`; `dist/index.html` and `dist/sitemap-index.xml` exist.

- [ ] **Step 9: Write `CLAUDE.md` and `docs/SCOPE.md`**

`CLAUDE.md`:
```markdown
# Instructions for any agent working in this repository

Read `docs/SCOPE.md` first, then `docs/NEXT_STEPS.md`. The design is in
`docs/superpowers/specs/`. Do not infer scope from the code; infer it from those files.

## Hard rules

1. **No new feature, page type, dataset, integration or dependency without a new spec** in
   `docs/superpowers/specs/` and an entry in `docs/ROADMAP.md`. If asked to add one, write the spec
   first and stop for the owner's approval. "Small" additions are not exempt.
2. **Never type a figure from memory.** Thresholds, fees, rates, dates and effective dates enter a data
   file only if you read them on a page you fetched during this task. List that page in `sources` with
   `accessed_on`, and set `verification.verified_on`. If you cannot fetch a source, set
   `verification.level` to `"pending"`, leave the figures null, and log it in `data/BACKLOG.md`.
3. **Never set `review.status` to `"reviewed"`.** Only the human reviewer does that, by name and date.
4. **Run `npm run check` before claiming anything is done** and paste its final lines in your report.
5. **Affiliate URLs live only in `site.config.ts`.** Never put them in data files or page copy.
6. **Every change to a rendered figure gets a `data/changelog.json` entry** and bumps that row's
   `verified_on`.

## Where things live

- Brand, domain, owner, newsletter URL, affiliate map: `site.config.ts`
- Data: `data/us-economic-nexus.json`, `data/tools.json`, `data/changelog.json`, `data/BACKLOG.md`
- Schemas (what a valid row is): `src/lib/schemas.ts`
- Wizard logic: `src/lib/engine/`
- Pages and components: `src/pages/`, `src/components/`, `src/layouts/`
- Tests: `tests/`
- How to verify or add a data row: `docs/DATA_PROVENANCE.md`
- How to deploy: `docs/DEPLOY.md`
```

`docs/SCOPE.md`:
```markdown
# Scope

This file is binding. It mirrors section 2 of the v0.1 spec and is updated only by a new spec.

## In scope (v0.1)

1. US economic-nexus dataset: 50 states + DC, exactly 51 rows. The five states without a statewide
   sales tax (Alaska, Delaware, Montana, New Hampshire, Oregon) are explicit rows. Alaska carries its
   local remote-seller regime in `notes` and, if verified, its threshold fields.
2. Tools dataset: US sales-tax compliance software and merchants of record, with public pricing where it exists.
3. Registration wizard for US sales with a per-tool annual cost estimate.
4. Pages: home, nexus table, one page per jurisdiction, tools table, wizard, changelog, methodology, about, disclosure.
5. JSON endpoints serving the validated datasets.
6. Newsletter form (renders only when a provider URL is configured), sitemap, robots.txt.
7. The documentation set: `CLAUDE.md`, `README.md`, `docs/*.md`, specs and plans.

## Out of scope (v0.1)

Each item below is a roadmap entry with entry criteria in `docs/ROADMAP.md`. None may be added
without a new spec.

- International VAT/GST rows and seller-location logic.
- Taxability of SaaS or digital goods by state.
- Per-tool detail pages, articles, blog, or guide prose beyond the methodology page.
- User accounts, saved or shareable wizard results, paid API, server-side code, databases.
- Affiliate links, sponsorships, ads, analytics scripts. (Hosting-level analytics is a deploy step, not code.)
- Filing frequency per state. The wizard states an assumption instead.
- Multi-language, dark-mode toggles, UI frameworks, design systems.
- Puerto Rico and local (city or county) tax rules.

## Change control

To add anything to "In scope": write a spec in `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`,
add the item to `docs/ROADMAP.md` with its entry criteria met, get the owner's approval, then plan and build.
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, site config helpers, scope fence

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Data schemas

**Files:**
- Create: `src/lib/schemas.ts`, `tests/fixtures.ts`
- Test: `tests/data/schemas.test.ts`

**Interfaces:**
- Produces from `src/lib/schemas.ts`: `nexusRowSchema`, `toolRowSchema`, `changelogEntrySchema`, `sourceSchema`, `verificationSchema`, `reviewSchema`, `isoDate`, `httpsUrl`, `US_JURISDICTION_COUNT = 51`, `todayIso(now?)`, and types `NexusRow`, `ToolRow`, `ChangelogEntry`, `Source`, `VerificationLevel`.
- Produces from `tests/fixtures.ts`: `makeRow(overrides?)`, `makeTool(overrides?)`, `SRC`, `DATE`.

- [ ] **Step 1: Write the fixtures and the failing schema tests**

`tests/fixtures.ts`:
```ts
import type { NexusRow, ToolRow } from "../src/lib/schemas";

export const DATE = "2026-01-15";
export const SRC = {
  url: "https://example.com/source",
  publisher: "Example Publisher",
  title: "Example source page",
  accessed_on: DATE,
};

export function makeRow(overrides: Partial<NexusRow> = {}): NexusRow {
  return {
    code: "ZZ",
    name: "Testland",
    has_state_sales_tax: true,
    sales_threshold_usd: 100000,
    transactions_threshold: null,
    threshold_rule: "sales_only",
    comparator: null,
    sales_measure: "gross",
    measurement_period: "Previous or current calendar year",
    includes_marketplace_sales: null,
    effective_date: "2019-01-01",
    registration_url: null,
    notes: "",
    sources: [SRC],
    verification: { level: "corroborated", verified_on: DATE },
    review: { status: "unreviewed", by: null, on: null },
    ...overrides,
  };
}

export function makeTool(overrides: Partial<ToolRow> = {}): ToolRow {
  return {
    slug: "example-tool",
    name: "Example Tool",
    category: "compliance_software",
    website_url: "https://example.com",
    pricing_model: "per_filing",
    pricing_public: true,
    pricing: {
      registration_fee_usd: 150,
      filing_fee_usd: 75,
      per_jurisdiction_month_usd: null,
      percent_fee: null,
      fixed_fee_usd: null,
      starting_monthly_usd: null,
      pricing_url: "https://example.com/pricing",
    },
    us_sales_tax_supported: true,
    notes: "",
    sources: [SRC],
    verification: { level: "official", verified_on: DATE },
    review: { status: "unreviewed", by: null, on: null },
    ...overrides,
  };
}
```

`tests/data/schemas.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  changelogEntrySchema,
  isoDate,
  nexusRowSchema,
  todayIso,
  toolRowSchema,
} from "../../src/lib/schemas";
import { DATE, makeRow, makeTool, SRC } from "../fixtures";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  schema.safeParse(v).success;

describe("isoDate", () => {
  it("accepts a past ISO date", () => expect(ok(isoDate, DATE)).toBe(true));
  it("rejects a non-ISO string", () => expect(ok(isoDate, "15/01/2026")).toBe(false));
  it("rejects an impossible date", () => expect(ok(isoDate, "2026-13-40")).toBe(false));
  it("rejects a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(ok(isoDate, todayIso(future))).toBe(false);
  });
});

describe("nexusRowSchema", () => {
  it("accepts a valid sales_only row", () => expect(ok(nexusRowSchema, makeRow())).toBe(true));
  it("accepts a valid sales_or_transactions row", () =>
    expect(
      ok(nexusRowSchema, makeRow({ threshold_rule: "sales_or_transactions", transactions_threshold: 200 })),
    ).toBe(true));
  it("accepts a no-sales-tax row with rule none", () =>
    expect(
      ok(nexusRowSchema, makeRow({ has_state_sales_tax: false, threshold_rule: "none", sales_threshold_usd: null })),
    ).toBe(true));
  it("accepts a pending row with no figures and no sources", () =>
    expect(
      ok(
        nexusRowSchema,
        makeRow({
          threshold_rule: "none",
          sales_threshold_usd: null,
          comparator: null,
          measurement_period: null,
          sources: [],
          verification: { level: "pending", verified_on: DATE },
        }),
      ),
    ).toBe(true));
  it("accepts an Alaska-style row: no state sales tax, thresholds present, notes explain", () =>
    expect(
      ok(nexusRowSchema, makeRow({ has_state_sales_tax: false, notes: "Local remote-seller regime." })),
    ).toBe(true));

  it("rejects a non-pending row without sources", () =>
    expect(ok(nexusRowSchema, makeRow({ sources: [] }))).toBe(false));
  it("rejects a pending row that carries a figure", () =>
    expect(
      ok(
        nexusRowSchema,
        makeRow({ threshold_rule: "none", sales_threshold_usd: 100000, verification: { level: "pending", verified_on: DATE } }),
      ),
    ).toBe(false));
  it("rejects rule none with a threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ threshold_rule: "none" }))).toBe(false));
  it("rejects sales_only with a transaction threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ transactions_threshold: 200 }))).toBe(false));
  it("rejects an or-rule missing the transaction threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ threshold_rule: "sales_or_transactions" }))).toBe(false));
  it("rejects a no-sales-tax row with thresholds and empty notes", () =>
    expect(ok(nexusRowSchema, makeRow({ has_state_sales_tax: false }))).toBe(false));
  it("rejects reviewed without by/on", () =>
    expect(ok(nexusRowSchema, makeRow({ review: { status: "reviewed", by: null, on: null } }))).toBe(false));
  it("rejects an http source", () =>
    expect(ok(nexusRowSchema, makeRow({ sources: [{ ...SRC, url: "http://example.com" }] }))).toBe(false));
  it("rejects a lowercase code", () => expect(ok(nexusRowSchema, makeRow({ code: "zz" }))).toBe(false));
  it("rejects a negative threshold", () =>
    expect(ok(nexusRowSchema, makeRow({ sales_threshold_usd: -1 }))).toBe(false));
});

describe("toolRowSchema", () => {
  it("accepts a valid per_filing tool", () => expect(ok(toolRowSchema, makeTool())).toBe(true));
  it("accepts a quote_only tool with null prices and pricing_public false", () =>
    expect(
      ok(
        toolRowSchema,
        makeTool({
          pricing_model: "quote_only",
          pricing_public: false,
          pricing: { registration_fee_usd: null, filing_fee_usd: null, per_jurisdiction_month_usd: null, percent_fee: null, fixed_fee_usd: null, starting_monthly_usd: null, pricing_url: "https://example.com/pricing" },
        }),
      ),
    ).toBe(true));
  it("rejects quote_only with pricing_public true", () =>
    expect(
      ok(
        toolRowSchema,
        makeTool({
          pricing_model: "quote_only",
          pricing_public: true,
          pricing: { registration_fee_usd: null, filing_fee_usd: null, per_jurisdiction_month_usd: null, percent_fee: null, fixed_fee_usd: null, starting_monthly_usd: null, pricing_url: null },
        }),
      ),
    ).toBe(false));
  it("rejects quote_only with a price", () =>
    expect(ok(toolRowSchema, makeTool({ pricing_model: "quote_only", pricing_public: false }))).toBe(false));
  it("rejects per_filing without a filing fee", () =>
    expect(
      ok(toolRowSchema, makeTool({ pricing: { ...makeTool().pricing, filing_fee_usd: null } })),
    ).toBe(false));
  it("rejects percent_plus_fixed without a percent", () =>
    expect(
      ok(toolRowSchema, makeTool({ pricing_model: "percent_plus_fixed", pricing: { ...makeTool().pricing, percent_fee: null } })),
    ).toBe(false));
  it("rejects a tool without sources", () => expect(ok(toolRowSchema, makeTool({ sources: [] }))).toBe(false));
  it("rejects a pending verification level on a tool", () =>
    expect(ok(toolRowSchema, makeTool({ verification: { level: "pending", verified_on: DATE } }))).toBe(false));
  it("rejects a non-kebab slug", () => expect(ok(toolRowSchema, makeTool({ slug: "Bad Slug" }))).toBe(false));
});

describe("changelogEntrySchema", () => {
  it("accepts a valid entry", () =>
    expect(
      ok(changelogEntrySchema, { date: DATE, dataset: "site", subject: "v0.1", change: "Initial build", source_url: null }),
    ).toBe(true));
  it("rejects an unknown dataset", () =>
    expect(
      ok(changelogEntrySchema, { date: DATE, dataset: "other", subject: "x", change: "y", source_url: null }),
    ).toBe(false));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/data/schemas.test.ts`
Expected: FAIL, cannot resolve `../../src/lib/schemas`.

- [ ] **Step 3: Write `src/lib/schemas.ts`**

```ts
import { z } from "astro/zod";

export const US_JURISDICTION_COUNT = 51;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isRealDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export const isoDate = z
  .string()
  .regex(ISO_DATE, "must be YYYY-MM-DD")
  .refine(isRealDate, "must be a real calendar date")
  .refine((s) => s <= todayIso(), "must not be in the future");

export const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "must be https");

const finiteNumber = z.number().refine(Number.isFinite, "must be finite");
const nonNegative = finiteNumber.refine((n) => n >= 0, "must be 0 or more");

export const sourceSchema = z.object({
  url: httpsUrl,
  publisher: z.string().min(1),
  title: z.string().min(1),
  accessed_on: isoDate,
});

export const verificationLevel = z.enum(["official", "corroborated", "single_secondary", "pending"]);

export const verificationSchema = z.object({
  level: verificationLevel,
  verified_on: isoDate,
});

export const reviewSchema = z
  .object({
    status: z.enum(["unreviewed", "reviewed"]),
    by: z.string().min(1).nullable(),
    on: isoDate.nullable(),
  })
  .refine((r) => r.status !== "reviewed" || (r.by !== null && r.on !== null), {
    message: "reviewed rows need `by` and `on`",
  });

export const thresholdRule = z.enum(["sales_only", "sales_or_transactions", "sales_and_transactions", "none"]);
export const comparator = z.enum(["exceeds", "meets_or_exceeds"]).nullable();
export const salesMeasure = z.enum(["gross", "taxable", "retail"]).nullable();

export const nexusRowSchema = z
  .object({
    code: z.string().regex(/^[A-Z]{2}$/, "two-letter USPS code"),
    name: z.string().min(1),
    has_state_sales_tax: z.boolean(),
    sales_threshold_usd: nonNegative.nullable(),
    transactions_threshold: z.number().int().nonnegative().nullable(),
    threshold_rule: thresholdRule,
    comparator,
    sales_measure: salesMeasure,
    measurement_period: z.string().min(1).nullable(),
    includes_marketplace_sales: z.boolean().nullable(),
    effective_date: isoDate.nullable(),
    registration_url: httpsUrl.nullable(),
    notes: z.string(),
    sources: z.array(sourceSchema),
    verification: verificationSchema,
    review: reviewSchema,
  })
  .superRefine((row, ctx) => {
    const pending = row.verification.level === "pending";
    const hasSales = row.sales_threshold_usd !== null;
    const hasTx = row.transactions_threshold !== null;
    const issue = (message: string) => ctx.addIssue({ code: "custom", message: `${row.code}: ${message}` });

    if (!pending && row.sources.length === 0) issue("non-pending rows need at least one source");
    if (pending && (hasSales || hasTx || row.comparator !== null || row.measurement_period !== null)) {
      issue("pending rows must not carry figures");
    }
    if (row.threshold_rule === "none" && (hasSales || hasTx)) issue("rule none must have null thresholds");
    if (row.threshold_rule === "sales_only" && (!hasSales || hasTx)) {
      issue("sales_only needs a sales threshold and no transaction threshold");
    }
    if (
      (row.threshold_rule === "sales_or_transactions" || row.threshold_rule === "sales_and_transactions") &&
      (!hasSales || !hasTx)
    ) {
      issue("rules involving transactions need both thresholds");
    }
    if (!row.has_state_sales_tax && row.threshold_rule !== "none" && row.notes.trim() === "") {
      issue("a no-sales-tax jurisdiction with thresholds must explain the regime in notes");
    }
  });

export const toolCategory = z.enum(["compliance_software", "merchant_of_record"]);
export const pricingModel = z.enum([
  "per_filing",
  "per_jurisdiction_month",
  "percent_plus_fixed",
  "tiered_subscription",
  "quote_only",
]);

export const pricingSchema = z.object({
  registration_fee_usd: nonNegative.nullable(),
  filing_fee_usd: nonNegative.nullable(),
  per_jurisdiction_month_usd: nonNegative.nullable(),
  percent_fee: finiteNumber.refine((n) => n >= 0 && n <= 100, "percent between 0 and 100").nullable(),
  fixed_fee_usd: nonNegative.nullable(),
  starting_monthly_usd: nonNegative.nullable(),
  pricing_url: httpsUrl.nullable(),
});

export const toolRowSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case slug"),
    name: z.string().min(1),
    category: toolCategory,
    website_url: httpsUrl,
    pricing_model: pricingModel,
    pricing_public: z.boolean(),
    pricing: pricingSchema,
    us_sales_tax_supported: z.boolean(),
    notes: z.string(),
    sources: z.array(sourceSchema).min(1),
    verification: verificationSchema,
    review: reviewSchema,
  })
  .superRefine((row, ctx) => {
    const p = row.pricing;
    const numeric = [
      p.registration_fee_usd,
      p.filing_fee_usd,
      p.per_jurisdiction_month_usd,
      p.percent_fee,
      p.fixed_fee_usd,
      p.starting_monthly_usd,
    ];
    const quote = row.pricing_model === "quote_only";
    const issue = (message: string) => ctx.addIssue({ code: "custom", message: `${row.slug}: ${message}` });

    if (row.verification.level === "pending") issue("tools are included only once their pricing page was fetched");
    if (quote === row.pricing_public) issue("pricing_public must be false exactly when pricing_model is quote_only");
    if (quote && numeric.some((v) => v !== null)) issue("quote_only rows must have null prices");
    if (row.pricing_model === "per_filing" && p.filing_fee_usd === null) issue("per_filing needs filing_fee_usd");
    if (row.pricing_model === "per_jurisdiction_month" && p.per_jurisdiction_month_usd === null) {
      issue("per_jurisdiction_month needs per_jurisdiction_month_usd");
    }
    if (row.pricing_model === "percent_plus_fixed" && p.percent_fee === null) issue("percent_plus_fixed needs percent_fee");
    if (row.pricing_model === "tiered_subscription" && p.starting_monthly_usd === null) {
      issue("tiered_subscription needs starting_monthly_usd");
    }
  });

export const changelogEntrySchema = z.object({
  date: isoDate,
  dataset: z.enum(["us-economic-nexus", "tools", "site"]),
  subject: z.string().min(1),
  change: z.string().min(1),
  source_url: httpsUrl.nullable(),
});

export type Source = z.infer<typeof sourceSchema>;
export type VerificationLevel = z.infer<typeof verificationLevel>;
export type NexusRow = z.infer<typeof nexusRowSchema>;
export type ToolRow = z.infer<typeof toolRowSchema>;
export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/data/schemas.test.ts`
Expected: PASS, all tests green. If `z.string().url()` rejects `https://example.com` in the installed zod, replace `.url()` with `.refine((u) => { try { new URL(u); return true; } catch { return false; } }, "must be a URL")` and re-run.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas.ts tests/fixtures.ts tests/data/schemas.test.ts
git commit -m "feat: add Zod schemas for nexus rows, tools and changelog

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Content collections, empty datasets, JSON endpoints

**Files:**
- Create: `src/content.config.ts`, `data/us-economic-nexus.json`, `data/tools.json`, `data/changelog.json`, `data/BACKLOG.md`
- Create: `src/pages/data/us-economic-nexus.json.ts`, `src/pages/data/tools.json.ts`
- Test: `tests/data/parse.test.ts`

**Interfaces:**
- Consumes: `nexusRowSchema`, `toolRowSchema`, `changelogEntrySchema` (Task 2).
- Produces: Astro collections `usNexus`, `tools`, `changelog` (entry `.data` typed by the schemas; `.id` = `code`, `slug`, or `${date}-${index}`); endpoints `/data/us-economic-nexus.json`, `/data/tools.json`.

- [ ] **Step 1: Write the empty data files and the backlog**

`data/us-economic-nexus.json`:
```json
[]
```

`data/tools.json`:
```json
[]
```

`data/changelog.json` (replace the date with today's date in `YYYY-MM-DD`):
```json
[
  {
    "date": "2026-10-06",
    "dataset": "site",
    "subject": "v0.1",
    "change": "Project scaffolded; datasets empty pending verification tasks.",
    "source_url": null
  }
]
```

`data/BACKLOG.md`:
```markdown
# Data backlog

Facts that were claimed somewhere but could not be verified, or where sources conflicted.
Nothing here is rendered on the site. One bullet per fact:

`- [dataset/subject] Claim: ... | Where seen: <url> | Why not accepted: ... | What would verify it: ...`

## Open

(none yet)

## Resolved

(none yet)
```

- [ ] **Step 2: Write the failing parse test**

`tests/data/parse.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema } from "../../src/lib/schemas";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8"));

describe("data files parse against their schemas", () => {
  it("us-economic-nexus.json", () => {
    const result = nexusRowSchema.array().safeParse(read("us-economic-nexus.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
  it("tools.json", () => {
    const result = toolRowSchema.array().safeParse(read("tools.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
  it("changelog.json", () => {
    const result = changelogEntrySchema.array().safeParse(read("changelog.json"));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test; it should already pass against empty arrays, confirming the harness works**

Run: `npx vitest run tests/data/parse.test.ts`
Expected: PASS, 3 tests. (This test earns its keep in Tasks 8–12 when rows are added.)

- [ ] **Step 4: Write `src/content.config.ts`**

```ts
import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema } from "./lib/schemas";

type Row = Record<string, unknown>;

const withIdFrom = (key: string) => (text: string): Row[] =>
  (JSON.parse(text) as Row[]).map((row) => ({ ...row, id: String(row[key]) }));

const changelogParser = (text: string): Row[] =>
  (JSON.parse(text) as Row[]).map((row, index) => ({ ...row, id: `${String(row.date)}-${index}` }));

export const collections = {
  usNexus: defineCollection({
    loader: file("data/us-economic-nexus.json", { parser: withIdFrom("code") }),
    schema: nexusRowSchema,
  }),
  tools: defineCollection({
    loader: file("data/tools.json", { parser: withIdFrom("slug") }),
    schema: toolRowSchema,
  }),
  changelog: defineCollection({
    loader: file("data/changelog.json", { parser: changelogParser }),
    schema: changelogEntrySchema,
  }),
};
```

- [ ] **Step 5: Write the JSON endpoints**

`src/pages/data/us-economic-nexus.json.ts`:
```ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const rows = (await getCollection("usNexus")).map((entry) => entry.data);
  return new Response(JSON.stringify(rows, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
```

`src/pages/data/tools.json.ts`:
```ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const rows = (await getCollection("tools")).map((entry) => entry.data);
  return new Response(JSON.stringify(rows, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
```

- [ ] **Step 6: Sync types, typecheck and build**

Run:
```bash
npx astro sync
npm run typecheck
npm run build
ls dist/data
```
Expected: `astro sync` writes `.astro/types.d.ts`; typecheck reports 0 errors; build succeeds; `ls` shows `tools.json` and `us-economic-nexus.json`, each containing `[]`.

If the `file()` loader rejects an empty array (error mentioning no entries), add one temporary comment-free workaround: skip this check and proceed; the arrays are filled in Tasks 8–12 and the build is re-verified there. Record the observed error text in your task report.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire content collections and JSON endpoints to data files

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Pure helpers: parse, slug, format

**Files:**
- Create: `src/lib/engine/parse.ts`, `src/lib/slug.ts`, `src/lib/format.ts`
- Test: `tests/engine/parse.test.ts`, `tests/slug.test.ts`, `tests/format.test.ts`

**Interfaces:**
- Produces: `parseMoney(text: string): number | null`; `parseCount(text: string): number | undefined | null` (empty ⇒ `undefined`, invalid ⇒ `null`); `toSlug(name: string): string`; `fmtUsd(n: number): string`; `fmtInt(n: number): string`; `ruleLabel(rule)`, `modelLabel(model)`, `formatThreshold(row: NexusRow): string`, `formatPricing(tool: ToolRow): string`, `levelLabel(level: VerificationLevel): string`.

- [ ] **Step 1: Write the failing tests**

`tests/engine/parse.test.ts`:
```ts
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
```

`tests/slug.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { toSlug } from "../src/lib/slug";

describe("toSlug", () => {
  it("lowercases and hyphenates", () => expect(toSlug("New York")).toBe("new-york"));
  it("handles three words", () => expect(toSlug("District of Columbia")).toBe("district-of-columbia"));
  it("trims stray punctuation", () => expect(toSlug(" Rhode Island ")).toBe("rhode-island"));
});
```

`tests/format.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { fmtUsd, formatPricing, formatThreshold, levelLabel, modelLabel, ruleLabel } from "../src/lib/format";
import { DATE, makeRow, makeTool } from "./fixtures";

describe("fmtUsd", () => {
  it("formats whole dollars with separators", () => expect(fmtUsd(500000)).toBe("$500,000"));
  it("keeps up to two decimals", () => expect(fmtUsd(0.5)).toBe("$0.50"));
});

describe("formatThreshold", () => {
  it("shows a sales-only threshold", () => expect(formatThreshold(makeRow())).toBe("$100,000"));
  it("prefixes 'More than' for exceeds", () =>
    expect(formatThreshold(makeRow({ comparator: "exceeds" }))).toBe("More than $100,000"));
  it("prefixes 'At least' for meets_or_exceeds", () =>
    expect(formatThreshold(makeRow({ comparator: "meets_or_exceeds" }))).toBe("At least $100,000"));
  it("joins or-rules with 'or'", () =>
    expect(formatThreshold(makeRow({ threshold_rule: "sales_or_transactions", transactions_threshold: 200 }))).toBe(
      "$100,000 or 200 transactions",
    ));
  it("joins and-rules with 'and'", () =>
    expect(
      formatThreshold(makeRow({ threshold_rule: "sales_and_transactions", sales_threshold_usd: 500000, transactions_threshold: 100 })),
    ).toBe("$500,000 and 100 transactions"));
  it("labels no-sales-tax rows", () =>
    expect(formatThreshold(makeRow({ has_state_sales_tax: false, threshold_rule: "none", sales_threshold_usd: null }))).toBe(
      "No statewide sales tax",
    ));
  it("labels pending rows without figures", () =>
    expect(
      formatThreshold(
        makeRow({ threshold_rule: "none", sales_threshold_usd: null, comparator: null, measurement_period: null, sources: [], verification: { level: "pending", verified_on: DATE } }),
      ),
    ).toBe("Verification pending"));
});

describe("formatPricing", () => {
  it("per_filing lists filing and registration fees", () =>
    expect(formatPricing(makeTool())).toBe("$75 per filing, $150 per registration"));
  it("quote_only", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "quote_only", pricing_public: false, pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null } }),
      ),
    ).toBe("Custom quote"));
  it("percent_plus_fixed with a fixed fee", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "percent_plus_fixed", pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null, percent_fee: 5, fixed_fee_usd: 0.5 } }),
      ),
    ).toBe("5% + $0.50 per transaction"));
  it("tiered_subscription", () =>
    expect(
      formatPricing(
        makeTool({ pricing_model: "tiered_subscription", pricing: { ...makeTool().pricing, registration_fee_usd: null, filing_fee_usd: null, starting_monthly_usd: 49 } }),
      ),
    ).toBe("From $49 per month"));
});

describe("labels", () => {
  it("ruleLabel", () => expect(ruleLabel("sales_or_transactions")).toBe("Sales or transactions"));
  it("modelLabel", () => expect(modelLabel("per_jurisdiction_month")).toBe("Per jurisdiction per month"));
  it("levelLabel", () => expect(levelLabel("single_secondary")).toBe("Single secondary source: use with caution"));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/engine/parse.test.ts tests/slug.test.ts tests/format.test.ts`
Expected: FAIL on unresolved modules.

- [ ] **Step 3: Write the helpers**

`src/lib/engine/parse.ts`:
```ts
/** Parses user-typed money like "$1,200,000.00". Returns null when blank or invalid. */
export function parseMoney(text: string): number | null {
  const cleaned = text.replace(/[\s$,]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Parses an optional whole-number count. Blank ⇒ undefined (not provided); invalid ⇒ null. */
export function parseCount(text: string): number | undefined | null {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return undefined;
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}
```

`src/lib/slug.ts`:
```ts
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

`src/lib/format.ts`:
```ts
import type { NexusRow, ToolRow, VerificationLevel } from "./schemas";

export function fmtUsd(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function ruleLabel(rule: NexusRow["threshold_rule"]): string {
  switch (rule) {
    case "sales_only":
      return "Sales only";
    case "sales_or_transactions":
      return "Sales or transactions";
    case "sales_and_transactions":
      return "Sales and transactions";
    case "none":
      return "None recorded";
  }
}

export function modelLabel(model: ToolRow["pricing_model"]): string {
  switch (model) {
    case "per_filing":
      return "Per filing";
    case "per_jurisdiction_month":
      return "Per jurisdiction per month";
    case "percent_plus_fixed":
      return "Percent of revenue plus fixed fee";
    case "tiered_subscription":
      return "Tiered subscription";
    case "quote_only":
      return "Quote only";
  }
}

export function levelLabel(level: VerificationLevel): string {
  switch (level) {
    case "official":
      return "Verified against official source";
    case "corroborated":
      return "Corroborated by two sources";
    case "single_secondary":
      return "Single secondary source: use with caution";
    case "pending":
      return "Verification pending";
  }
}

export function formatThreshold(row: NexusRow): string {
  if (row.verification.level === "pending") return "Verification pending";
  if (!row.has_state_sales_tax && row.threshold_rule === "none") return "No statewide sales tax";
  const parts: string[] = [];
  if (row.sales_threshold_usd !== null) parts.push(fmtUsd(row.sales_threshold_usd));
  if (row.transactions_threshold !== null) parts.push(`${fmtInt(row.transactions_threshold)} transactions`);
  if (parts.length === 0) return "None recorded";
  const joiner = row.threshold_rule === "sales_and_transactions" ? " and " : " or ";
  const prefix =
    row.comparator === "exceeds" ? "More than " : row.comparator === "meets_or_exceeds" ? "At least " : "";
  return prefix + parts.join(joiner);
}

export function formatPricing(tool: ToolRow): string {
  const p = tool.pricing;
  switch (tool.pricing_model) {
    case "quote_only":
      return "Custom quote";
    case "per_filing":
      return [
        p.filing_fee_usd !== null ? `${fmtUsd(p.filing_fee_usd)} per filing` : null,
        p.registration_fee_usd !== null ? `${fmtUsd(p.registration_fee_usd)} per registration` : null,
      ]
        .filter((s): s is string => s !== null)
        .join(", ");
    case "per_jurisdiction_month":
      return `${fmtUsd(p.per_jurisdiction_month_usd ?? 0)} per jurisdiction per month`;
    case "tiered_subscription":
      return `From ${fmtUsd(p.starting_monthly_usd ?? 0)} per month`;
    case "percent_plus_fixed":
      return `${p.percent_fee ?? 0}%${p.fixed_fee_usd !== null ? ` + ${fmtUsd(p.fixed_fee_usd)} per transaction` : " of revenue"}`;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/engine/parse.test.ts tests/slug.test.ts tests/format.test.ts`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/parse.ts src/lib/slug.ts src/lib/format.ts tests/engine/parse.test.ts tests/slug.test.ts tests/format.test.ts
git commit -m "feat: add parse, slug and format helpers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Engine types and input validation

**Files:**
- Create: `src/lib/engine/types.ts`, `src/lib/engine/validate.ts`
- Test: `tests/engine/validate.test.ts`

**Interfaces:**
- Produces from `types.ts`: `WizardLine = { code: string; grossSalesUsd: number; transactions?: number }`, `WizardInput = { homeState: string | null; lines: WizardLine[] }`, `StateStatus`, `MeasureOutcome`, `StateResult`, `ValidationError = { field: string; message: string; index?: number }`, `EvaluateResult`, `CAVEATS: readonly string[]`.
- Produces from `validate.ts`: `validateInput(input: WizardInput, rows: NexusRow[]): ValidationError[]`.

- [ ] **Step 1: Write the failing validation tests**

`tests/engine/validate.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/engine/validate.test.ts`
Expected: FAIL on unresolved module.

- [ ] **Step 3: Write `types.ts` and `validate.ts`**

`src/lib/engine/types.ts`:
```ts
import type { NexusRow, Source, VerificationLevel } from "../schemas";

export type WizardLine = { code: string; grossSalesUsd: number; transactions?: number };
export type WizardInput = { homeState: string | null; lines: WizardLine[] };

export type StateStatus =
  | "no_state_sales_tax"
  | "physical_presence"
  | "insufficient_data"
  | "registration_likely_required"
  | "at_threshold_check_wording"
  | "below_threshold";

export type MeasureOutcome = "trigger" | "at" | "below" | "unknown";

export type StateResult = {
  code: string;
  name: string;
  status: StateStatus;
  rule: NexusRow["threshold_rule"];
  salesThresholdUsd: number | null;
  transactionsThreshold: number | null;
  comparator: NexusRow["comparator"];
  measurementPeriod: string | null;
  salesMeasure: NexusRow["sales_measure"];
  verificationLevel: VerificationLevel;
  sources: Source[];
  notes: string;
  message: string;
  caveats: string[];
};

export type ValidationError = { field: string; message: string; index?: number };

export type EvaluateResult =
  | {
      ok: true;
      results: StateResult[];
      registrationCount: number;
      totalSalesUsd: number;
      totalTransactions: number | undefined;
    }
  | { ok: false; errors: ValidationError[] };

export const CAVEATS: readonly string[] = [
  "Economic nexus is not the same as taxability. A state can require registration even if your product is exempt there, and your product may be taxable in a state where you have no nexus.",
  "Marketplace-facilitated sales may count toward thresholds differently by state.",
  "Thresholds are measured over each state's own period, shown per state, not over your fiscal year.",
];
```

`src/lib/engine/validate.ts`:
```ts
import type { NexusRow } from "../schemas";
import type { ValidationError, WizardInput } from "./types";

const CODE = /^[A-Z]{2}$/;

export function validateInput(input: WizardInput, rows: NexusRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const known = new Set(rows.map((r) => r.code));

  if (input.homeState !== null && !known.has(input.homeState)) {
    errors.push({ field: "homeState", message: `Unknown state code "${input.homeState}"` });
  }

  const seen = new Set<string>();
  input.lines.forEach((line, index) => {
    if (!CODE.test(line.code) || !known.has(line.code)) {
      errors.push({ field: "code", index, message: `Unknown state code "${line.code}"` });
    } else if (seen.has(line.code)) {
      errors.push({ field: "code", index, message: `State "${line.code}" entered more than once` });
    }
    seen.add(line.code);

    if (!Number.isFinite(line.grossSalesUsd) || line.grossSalesUsd < 0) {
      errors.push({ field: "grossSalesUsd", index, message: "Gross sales must be a number of 0 or more" });
    }
    if (line.transactions !== undefined && (!Number.isInteger(line.transactions) || line.transactions < 0)) {
      errors.push({ field: "transactions", index, message: "Transactions must be a whole number of 0 or more" });
    }
  });

  return errors;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/engine/validate.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/types.ts src/lib/engine/validate.ts tests/engine/validate.test.ts
git commit -m "feat: add engine types and wizard input validation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Nexus evaluation

**Files:**
- Create: `src/lib/engine/nexus.ts`, `src/lib/engine/index.ts`
- Test: `tests/engine/nexus.test.ts`

**Interfaces:**
- Consumes: `types.ts`, `validate.ts` (Task 5), `fmtUsd`/`fmtInt` (Task 4), `NexusRow` (Task 2).
- Produces: `classifyMeasure(value: number | undefined, threshold: number, comparator: NexusRow["comparator"]): MeasureOutcome`; `combineOutcomes(rule: Exclude<NexusRow["threshold_rule"], "none">, sales: MeasureOutcome, tx: MeasureOutcome): ThresholdStatus`; `evaluateState(row: NexusRow, line: WizardLine | null, homeState: string | null): StateResult`; `evaluateAll(input: WizardInput, rows: NexusRow[]): EvaluateResult`. `index.ts` re-exports everything in `engine/`.

- [ ] **Step 1: Write the failing tests**

`tests/engine/nexus.test.ts`:
```ts
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
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/engine/nexus.test.ts`
Expected: FAIL on unresolved module.

- [ ] **Step 3: Write `nexus.ts` and `index.ts`**

`src/lib/engine/nexus.ts`:
```ts
import { fmtInt, fmtUsd } from "../format";
import type { NexusRow } from "../schemas";
import {
  CAVEATS,
  type EvaluateResult,
  type MeasureOutcome,
  type StateResult,
  type WizardInput,
  type WizardLine,
} from "./types";
import { validateInput } from "./validate";

export type ThresholdStatus =
  | "registration_likely_required"
  | "at_threshold_check_wording"
  | "below_threshold"
  | "insufficient_data";

type ActiveRule = Exclude<NexusRow["threshold_rule"], "none">;

export function classifyMeasure(
  value: number | undefined,
  threshold: number,
  comparator: NexusRow["comparator"],
): MeasureOutcome {
  if (value === undefined) return "unknown";
  if (value > threshold) return "trigger";
  if (value === threshold) {
    if (comparator === "meets_or_exceeds") return "trigger";
    if (comparator === "exceeds") return "below";
    return "at";
  }
  return "below";
}

function mapSingle(outcome: MeasureOutcome): ThresholdStatus {
  switch (outcome) {
    case "trigger":
      return "registration_likely_required";
    case "at":
      return "at_threshold_check_wording";
    case "below":
      return "below_threshold";
    case "unknown":
      return "insufficient_data";
  }
}

export function combineOutcomes(rule: ActiveRule, sales: MeasureOutcome, tx: MeasureOutcome): ThresholdStatus {
  if (rule === "sales_only") return mapSingle(sales);
  const outcomes: MeasureOutcome[] = [sales, tx];
  if (rule === "sales_or_transactions") {
    if (outcomes.includes("trigger")) return "registration_likely_required";
    if (outcomes.includes("at")) return "at_threshold_check_wording";
    if (outcomes.includes("unknown")) return "insufficient_data";
    return "below_threshold";
  }
  if (outcomes.includes("below")) return "below_threshold";
  if (outcomes.includes("unknown")) return "insufficient_data";
  if (outcomes.every((o) => o === "trigger")) return "registration_likely_required";
  return "at_threshold_check_wording";
}

function thresholdText(row: NexusRow): string {
  const parts: string[] = [];
  if (row.sales_threshold_usd !== null) parts.push(fmtUsd(row.sales_threshold_usd));
  if (row.transactions_threshold !== null) parts.push(`${fmtInt(row.transactions_threshold)} transactions`);
  return parts.join(row.threshold_rule === "sales_and_transactions" ? " and " : " or ");
}

function describe(row: NexusRow, status: ThresholdStatus, line: WizardLine): string {
  const period = row.measurement_period ? ` (${row.measurement_period})` : "";
  const threshold = thresholdText(row);
  switch (status) {
    case "registration_likely_required":
      return `Your figures meet ${row.name}'s threshold of ${threshold}${period}. Registration is likely required.`;
    case "below_threshold":
      return `Your figures are below ${row.name}'s threshold of ${threshold}${period}.`;
    case "at_threshold_check_wording":
      return `Your figures sit exactly at ${row.name}'s threshold of ${threshold}${period}. Check whether the state's rule says "exceeds" or "meets or exceeds".`;
    case "insufficient_data":
      return line.transactions === undefined && row.transactions_threshold !== null
        ? `Enter a transaction count. ${row.name} also applies a ${fmtInt(row.transactions_threshold)}-transaction threshold.`
        : `${row.name}: not enough data to evaluate.`;
  }
}

export function evaluateState(row: NexusRow, line: WizardLine | null, homeState: string | null): StateResult {
  const base = {
    code: row.code,
    name: row.name,
    rule: row.threshold_rule,
    salesThresholdUsd: row.sales_threshold_usd,
    transactionsThreshold: row.transactions_threshold,
    comparator: row.comparator,
    measurementPeriod: row.measurement_period,
    salesMeasure: row.sales_measure,
    verificationLevel: row.verification.level,
    sources: row.sources,
    notes: row.notes,
    caveats: [...CAVEATS],
  };

  if (!row.has_state_sales_tax && row.threshold_rule === "none") {
    return { ...base, status: "no_state_sales_tax", message: `${row.name} has no statewide sales tax.` };
  }
  if (homeState !== null && row.code === homeState) {
    return {
      ...base,
      status: "physical_presence",
      message: `You selected ${row.name} as your home state. Registration is generally required where you have physical presence, regardless of sales thresholds.`,
    };
  }
  if (row.verification.level === "pending") {
    return {
      ...base,
      status: "insufficient_data",
      message: `${row.name}: threshold data is pending verification, so no determination can be made.`,
    };
  }
  if (row.threshold_rule === "none" || row.sales_threshold_usd === null) {
    return {
      ...base,
      status: "insufficient_data",
      message: `${row.name}: no economic-nexus rule is recorded for this state.`,
    };
  }
  if (line === null) {
    return { ...base, status: "insufficient_data", message: `${row.name}: enter your sales to evaluate.` };
  }

  const sales = classifyMeasure(line.grossSalesUsd, row.sales_threshold_usd, row.comparator);
  const tx: MeasureOutcome =
    row.transactions_threshold === null
      ? "unknown"
      : classifyMeasure(line.transactions, row.transactions_threshold, row.comparator);
  const status = combineOutcomes(row.threshold_rule, sales, tx);
  return { ...base, status, message: describe(row, status, line) };
}

export function evaluateAll(input: WizardInput, rows: NexusRow[]): EvaluateResult {
  const errors = validateInput(input, rows);
  if (errors.length > 0) return { ok: false, errors };

  const byCode = new Map(rows.map((r) => [r.code, r] as const));
  const lineByCode = new Map(input.lines.map((l) => [l.code, l] as const));
  const codes = [...lineByCode.keys()];
  if (input.homeState !== null && !lineByCode.has(input.homeState)) codes.push(input.homeState);

  const results = codes.map((code) => {
    const row = byCode.get(code);
    if (!row) throw new Error(`validated code missing from dataset: ${code}`);
    return evaluateState(row, lineByCode.get(code) ?? null, input.homeState);
  });

  const registrationCount = results.filter(
    (r) => r.status === "registration_likely_required" || r.status === "physical_presence",
  ).length;
  const totalSalesUsd = input.lines.reduce((sum, l) => sum + l.grossSalesUsd, 0);
  const allHaveTx = input.lines.length > 0 && input.lines.every((l) => l.transactions !== undefined);
  const totalTransactions = allHaveTx ? input.lines.reduce((sum, l) => sum + (l.transactions ?? 0), 0) : undefined;

  return { ok: true, results, registrationCount, totalSalesUsd, totalTransactions };
}
```

`src/lib/engine/index.ts`:
```ts
export * from "./types";
export * from "./validate";
export * from "./nexus";
export * from "./cost";
export * from "./parse";
```
(`./cost` is created in Task 7; until then, temporarily omit that line and add it back in Task 7.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/engine/nexus.test.ts`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/nexus.ts src/lib/engine/index.ts tests/engine/nexus.test.ts
git commit -m "feat: add nexus threshold evaluation engine

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Cost estimation

**Files:**
- Create: `src/lib/engine/cost.ts`
- Modify: `src/lib/engine/index.ts` (add `export * from "./cost";`)
- Test: `tests/engine/cost.test.ts`

**Interfaces:**
- Consumes: `ToolRow` (Task 2).
- Produces: `FILINGS_PER_STATE_PER_YEAR = 4`; `CostSummary = { registrationCount: number; totalSalesUsd: number; totalTransactions: number | undefined }`; `ToolCostEstimate = { slug; name; category; pricingModel; annualEstimateUsd: number | null; label: "estimate" | "from" | "custom_quote"; notes: string[] }`; `estimateToolCost(tool, summary)`, `estimateToolCosts(tools, summary)`.

- [ ] **Step 1: Write the failing tests**

`tests/engine/cost.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/engine/cost.test.ts`
Expected: FAIL on unresolved module.

- [ ] **Step 3: Write `cost.ts` and update `index.ts`**

`src/lib/engine/cost.ts`:
```ts
import type { ToolRow } from "../schemas";

export const FILINGS_PER_STATE_PER_YEAR = 4;

export type CostSummary = {
  registrationCount: number;
  totalSalesUsd: number;
  totalTransactions: number | undefined;
};

export type ToolCostEstimate = {
  slug: string;
  name: string;
  category: ToolRow["category"];
  pricingModel: ToolRow["pricing_model"];
  annualEstimateUsd: number | null;
  label: "estimate" | "from" | "custom_quote";
  notes: string[];
};

export function estimateToolCost(tool: ToolRow, summary: CostSummary): ToolCostEstimate {
  const base = { slug: tool.slug, name: tool.name, category: tool.category, pricingModel: tool.pricing_model };
  const p = tool.pricing;
  const R = summary.registrationCount;

  switch (tool.pricing_model) {
    case "quote_only":
      return { ...base, annualEstimateUsd: null, label: "custom_quote", notes: ["Pricing is not public; request a quote."] };

    case "per_filing": {
      const notes = [`Assumes ${FILINGS_PER_STATE_PER_YEAR} filings per registered state per year.`];
      if (p.registration_fee_usd === null) notes.push("Registration fee not published; excluded.");
      if (R === 0) notes.push("No registrations indicated.");
      const total = R * (p.registration_fee_usd ?? 0) + R * FILINGS_PER_STATE_PER_YEAR * (p.filing_fee_usd ?? 0);
      return { ...base, annualEstimateUsd: Math.round(total), label: "estimate", notes };
    }

    case "per_jurisdiction_month": {
      const notes = R === 0 ? ["No registrations indicated."] : [];
      const total = R * (p.per_jurisdiction_month_usd ?? 0) * 12;
      return { ...base, annualEstimateUsd: Math.round(total), label: "estimate", notes };
    }

    case "tiered_subscription": {
      if (R === 0) {
        return { ...base, annualEstimateUsd: 0, label: "estimate", notes: ["No registrations indicated."] };
      }
      return {
        ...base,
        annualEstimateUsd: Math.round((p.starting_monthly_usd ?? 0) * 12),
        label: "from",
        notes: ["Starting tier; higher tiers may apply at your volume."],
      };
    }

    case "percent_plus_fixed": {
      const notes = ["Merchants of record collect and remit in place of your own registrations."];
      const percentPart = ((p.percent_fee ?? 0) / 100) * summary.totalSalesUsd;
      let fixedPart = 0;
      if (p.fixed_fee_usd !== null) {
        if (summary.totalTransactions === undefined) {
          notes.push(
            `Per-transaction fee of $${p.fixed_fee_usd} omitted: enter transaction counts on every line to include it.`,
          );
        } else {
          fixedPart = p.fixed_fee_usd * summary.totalTransactions;
        }
      }
      return { ...base, annualEstimateUsd: Math.round(percentPart + fixedPart), label: "estimate", notes };
    }
  }
}

export function estimateToolCosts(tools: ToolRow[], summary: CostSummary): ToolCostEstimate[] {
  return tools.map((tool) => estimateToolCost(tool, summary));
}
```

`src/lib/engine/index.ts` must now read exactly:
```ts
export * from "./types";
export * from "./validate";
export * from "./nexus";
export * from "./cost";
export * from "./parse";
```

- [ ] **Step 4: Run the whole test suite and the typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests PASS; 0 type errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/cost.ts src/lib/engine/index.ts tests/engine/cost.test.ts
git commit -m "feat: add per-tool annual cost estimation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Data verification procedure (shared by Tasks 8, 9, 10)

This procedure is repeated by reference only inside the three group tasks; everything an implementer needs is here.

**Tools.** Load the fetch tool first: `ToolSearch` with query `select:WebFetch`. `WebFetch(url, prompt)` returns a model-written answer about the page, so every prompt must demand verbatim quotes and must say "If the state is not on this page, say NOT LISTED."

**Sources, in order of authority.**

| Level | What counts | Example pages (fetched live on 2026-10-06 and found reachable) |
|---|---|---|
| Official | A page on the state's own revenue/tax department domain that states the remote-seller threshold | start from the domain in the table below; cite only the exact page you fetched |
| Secondary A | Sales Tax Institute economic-nexus state guide (showed "last updated August 1, 2026"; covers 50 states + DC + PR) | `https://www.salestaxinstitute.com/resources/economic-nexus-state-guide` |
| Secondary B | Avalara state-by-state economic-nexus guide (covers 50 states + DC + PR) | `https://www.avalara.com/us/en/learn/guides/state-by-state-guide-economic-nexus-laws.html` |
| Secondary C (optional) | TaxJar economic-nexus guide | `https://www.taxjar.com/sales-tax/economic-nexus` (reachability not pre-checked; skip if it fails) |

**Official-page starting points.** These are department home domains, listed only to save searching. They are NOT citations. Fetch the domain, ask for the remote-seller / economic-nexus page URL, fetch that page, and cite that page only if it states the threshold. If a domain fails or you cannot find the page in two fetches, stop and use secondary sources.

| State | Domain | State | Domain | State | Domain |
|---|---|---|---|---|---|
| AL | revenue.alabama.gov | KY | revenue.ky.gov | ND | tax.nd.gov |
| AK | arsstc.org (Alaska Remote Seller Sales Tax Commission) | LA | revenue.louisiana.gov | OH | tax.ohio.gov |
| AZ | azdor.gov | ME | maine.gov/revenue | OK | oklahoma.gov/tax |
| AR | dfa.arkansas.gov | MD | marylandtaxes.gov | OR | (no sales tax) oregon.gov/dor |
| CA | cdtfa.ca.gov | MA | mass.gov/orgs/massachusetts-department-of-revenue | PA | revenue.pa.gov |
| CO | tax.colorado.gov | MI | michigan.gov/taxes | RI | tax.ri.gov |
| CT | portal.ct.gov/drs | MN | revenue.state.mn.us | SC | dor.sc.gov |
| DE | (no sales tax) revenue.delaware.gov | MS | dor.ms.gov | SD | dor.sd.gov |
| DC | otr.cfo.dc.gov | MO | dor.mo.gov | TN | tn.gov/revenue |
| FL | floridarevenue.com | MT | (no sales tax) mtrevenue.gov | TX | comptroller.texas.gov |
| GA | dor.georgia.gov | NE | revenue.nebraska.gov | UT | tax.utah.gov |
| HI | tax.hawaii.gov | NV | tax.nv.gov | VT | tax.vermont.gov |
| ID | tax.idaho.gov | NH | (no sales tax) revenue.nh.gov | VA | tax.virginia.gov |
| IL | tax.illinois.gov | NJ | nj.gov/treasury/taxation | WA | dor.wa.gov |
| IN | in.gov/dor | NM | tax.newmexico.gov | WV | tax.wv.gov |
| IA | revenue.iowa.gov | NY | tax.ny.gov | WI | revenue.wi.gov |
| KS | ksrevenue.gov | NC | ncdor.gov | WY | revenue.wyo.gov |

**Per-jurisdiction steps.**

1. Fetch Secondary A with this prompt, in batches of five or six states per prompt so answers are not truncated (the page is cached between calls), substituting each batch's state list:
   `For each of these states: <list>. For EACH state quote verbatim: (a) the dollar threshold; (b) whether a transaction-count threshold applies and the number; (c) whether the two are joined by "or" or "and"; (d) the exact wording showing "more than / exceeds" versus "or more / at least", if present; (e) the measurement period; (f) the effective date; (g) which sales are counted (gross, taxable, retail) if stated; (h) whether marketplace sales are included if stated; (i) any URL to the state's department of revenue. If a state is not on this page, write NOT LISTED for it.`
   Repeat with Secondary B, and with Secondary C if reachable.
2. For each state, attempt the official page per the table above (at most two fetches per state). Prompt: `Quote verbatim the economic nexus / remote seller threshold for <State>: dollar amount, any transaction count, "or"/"and", exact comparator wording, measurement period, effective date, and what sales count. Give the exact URL of the page that states this. If this page does not state it, say NOT HERE and give any link on the page that looks like the remote-seller or economic-nexus page.`
3. Decide `verification.level`:
   - `official` if an official page states the threshold and matches at least one secondary source (or, where secondaries disagree, the official page decides).
   - `corroborated` if Secondary A and B agree on dollar threshold, transaction threshold and rule.
   - `single_secondary` if only one secondary was reachable or stated the figure.
   - `pending` if nothing reachable states the figure, or A and B conflict on threshold or rule and no official page was reachable. Set all figures null, `threshold_rule: "none"`, `comparator: null`, `measurement_period: null`, `sources: []`, and add a Backlog bullet.
4. Conflicts on non-threshold fields only (`measurement_period`, `effective_date`, `sales_measure`, `includes_marketplace_sales`): keep the threshold; set the conflicting field to `null`; add a Backlog bullet naming both values and both URLs. Wording-only differences that mean the same thing ("previous or current calendar year" vs "current or preceding calendar year") are not conflicts: use the official wording if fetched, else Secondary A's.
5. `comparator`: `"exceeds"` only when a fetched source says "more than", "exceeds", "in excess of", "over"; `"meets_or_exceeds"` only when it says "or more", "at least", "meets or exceeds", "equal to or greater". Otherwise `null`.
6. `sources`: every page you fetched that stated the information, with `accessed_on` = today. Do not list pages that returned NOT LISTED / NOT HERE.
7. `verified_on` = today. `review` = `{ "status": "unreviewed", "by": null, "on": null }` always.
8. No-sales-tax states (DE, MT, NH, OR): `has_state_sales_tax: false`, `threshold_rule: "none"`, all thresholds null, `measurement_period: null`, `notes: "No statewide sales tax."` plus anything the fetched pages say (for example a gross-receipts tax) only if quoted, `sources` = the secondary pages that state the state has no sales tax, level `corroborated` if two say so.
9. Alaska: `has_state_sales_tax: false`; if the fetched sources state the Alaska Remote Seller Sales Tax Commission threshold, fill the threshold fields and rule, and write in `notes` what the pages say about the local-jurisdiction regime, verbatim or closely paraphrased. `notes` must be non-empty (schema rule).
10. Write the row into `data/us-economic-nexus.json` (keep the array sorted by `name`), run `npm test`, fix any schema failure by correcting the row (never by weakening the schema), and commit.

**Row template** (copy, then fill; delete nothing):
```json
{
  "code": "XX",
  "name": "State Name",
  "has_state_sales_tax": true,
  "sales_threshold_usd": 100000,
  "transactions_threshold": null,
  "threshold_rule": "sales_only",
  "comparator": null,
  "sales_measure": null,
  "measurement_period": null,
  "includes_marketplace_sales": null,
  "effective_date": null,
  "registration_url": null,
  "notes": "",
  "sources": [
    { "url": "https://...", "publisher": "...", "title": "...", "accessed_on": "YYYY-MM-DD" }
  ],
  "verification": { "level": "corroborated", "verified_on": "YYYY-MM-DD" },
  "review": { "status": "unreviewed", "by": null, "on": null }
}
```

**Backlog bullet template** (append under `## Open` in `data/BACKLOG.md`):
```
- [us-economic-nexus/XX] Claim: <field> = <value A> (Sales Tax Institute, <url>) vs <value B> (Avalara, <url>) | Why not accepted: sources conflict, no official page reachable | What would verify it: the <State> department page stating the rule
```

---

### Task 8: US nexus rows, group 1 (Alabama through Kansas, 17 jurisdictions)

**Files:**
- Modify: `data/us-economic-nexus.json`, `data/BACKLOG.md`
- Test: `tests/data/parse.test.ts` (exists)

**Interfaces:**
- Consumes: `nexusRowSchema` (Task 2) via the parse test.
- Produces: 17 rows: Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, District of Columbia, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas.

- [ ] **Step 1: Load WebFetch and fetch the secondary sources for this group**

Follow "Data verification procedure" step 1 with the 17 names above. Save the verbatim answers in your working notes; they are not committed.

- [ ] **Step 2: Attempt official pages for each state**

Procedure step 2, at most two fetches per state. Record for each state which URL stated the threshold, or NOT HERE.

- [ ] **Step 3: Write the 17 rows**

Procedure steps 3–9. Replace the `[]` in `data/us-economic-nexus.json` with the array of 17 rows sorted by `name`. Delaware is a no-sales-tax row (step 8). Alaska follows step 9. District of Columbia uses `code: "DC"`.

- [ ] **Step 4: Run the parse test and fix rows until it passes**

Run: `npx vitest run tests/data/parse.test.ts`
Expected: PASS. A failure prints the Zod issue path and message; fix the named row.

- [ ] **Step 5: Add a changelog entry and commit**

Prepend to `data/changelog.json` (today's date):
```json
{
  "date": "YYYY-MM-DD",
  "dataset": "us-economic-nexus",
  "subject": "Alabama–Kansas (17 jurisdictions)",
  "change": "Initial verified rows added.",
  "source_url": "https://www.salestaxinstitute.com/resources/economic-nexus-state-guide"
}
```
```bash
npm test
git add data/us-economic-nexus.json data/BACKLOG.md data/changelog.json
git commit -m "data: add verified US nexus rows, Alabama through Kansas

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Report: for each of the 17 states, the `verification.level` assigned and any Backlog bullets written.

---

### Task 9: US nexus rows, group 2 (Kentucky through North Carolina, 17 jurisdictions)

**Files:**
- Modify: `data/us-economic-nexus.json`, `data/BACKLOG.md`, `data/changelog.json`
- Test: `tests/data/parse.test.ts` (exists)

**Interfaces:**
- Consumes: `nexusRowSchema` (Task 2) via the parse test; the rows from Task 8 already in the file.
- Produces: 17 rows: Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina.

- [ ] **Step 1: Load WebFetch and fetch the secondary sources for this group** (procedure step 1 with these 17 names)

- [ ] **Step 2: Attempt official pages for each state** (procedure step 2)

- [ ] **Step 3: Write the 17 rows** (procedure steps 3–9; Montana and New Hampshire are no-sales-tax rows). Insert them into `data/us-economic-nexus.json`, keeping the whole array sorted by `name`. Do not alter the Task 8 rows.

- [ ] **Step 4: Run the parse test and fix rows until it passes**

Run: `npx vitest run tests/data/parse.test.ts`
Expected: PASS.

- [ ] **Step 5: Add a changelog entry and commit**

Prepend to `data/changelog.json`:
```json
{
  "date": "YYYY-MM-DD",
  "dataset": "us-economic-nexus",
  "subject": "Kentucky–North Carolina (17 jurisdictions)",
  "change": "Initial verified rows added.",
  "source_url": "https://www.salestaxinstitute.com/resources/economic-nexus-state-guide"
}
```
```bash
npm test
git add data/us-economic-nexus.json data/BACKLOG.md data/changelog.json
git commit -m "data: add verified US nexus rows, Kentucky through North Carolina

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Report: per-state levels and Backlog bullets.

---

### Task 10: US nexus rows, group 3 (North Dakota through Wyoming, 17 jurisdictions)

**Files:**
- Modify: `data/us-economic-nexus.json`, `data/BACKLOG.md`, `data/changelog.json`
- Test: `tests/data/parse.test.ts` (exists)

**Interfaces:**
- Consumes: `nexusRowSchema` (Task 2); rows from Tasks 8–9 already in the file.
- Produces: 17 rows: North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming.

- [ ] **Step 1: Load WebFetch and fetch the secondary sources for this group** (procedure step 1 with these 17 names)

- [ ] **Step 2: Attempt official pages for each state** (procedure step 2). Known conflicts to resolve with official pages: Texas effective date (Sales Tax Institute showed 2019-10-01, Avalara 2019-07-01) and Pennsylvania measurement period (Sales Tax Institute "Prior calendar year", Avalara "Current or previous calendar year"). If the official page is unreachable, apply procedure step 4 (field null + Backlog).

- [ ] **Step 3: Write the 17 rows** (procedure steps 3–9; Oregon is a no-sales-tax row). Insert, keeping the array sorted by `name`.

- [ ] **Step 4: Run the parse test and fix rows until it passes**

Run: `npx vitest run tests/data/parse.test.ts`
Expected: PASS.

- [ ] **Step 5: Add a changelog entry and commit**

Prepend to `data/changelog.json`:
```json
{
  "date": "YYYY-MM-DD",
  "dataset": "us-economic-nexus",
  "subject": "North Dakota–Wyoming (17 jurisdictions)",
  "change": "Initial verified rows added.",
  "source_url": "https://www.salestaxinstitute.com/resources/economic-nexus-state-guide"
}
```
```bash
npm test
git add data/us-economic-nexus.json data/BACKLOG.md data/changelog.json
git commit -m "data: add verified US nexus rows, North Dakota through Wyoming

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Report: per-state levels and Backlog bullets.

---

### Task 11: Finalize the nexus dataset: invariants

**Files:**
- Create: `tests/data/invariants.test.ts`
- Modify: `data/us-economic-nexus.json` only if a test exposes a defect; `data/BACKLOG.md` (move nothing; just confirm format)

**Interfaces:**
- Consumes: the 51 rows (Tasks 8–10), `nexusRowSchema`, `US_JURISDICTION_COUNT`, `toSlug`.
- Produces: the invariants test that later tasks and `npm run check` rely on.

- [ ] **Step 1: Write the invariants test**

`tests/data/invariants.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema, US_JURISDICTION_COUNT } from "../../src/lib/schemas";
import { toSlug } from "../../src/lib/slug";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8"));

const NO_SALES_TAX = ["AK", "DE", "MT", "NH", "OR"];

describe("us-economic-nexus.json invariants", () => {
  const rows = nexusRowSchema.array().parse(read("us-economic-nexus.json"));

  it("has exactly 51 jurisdictions", () => {
    expect(rows).toHaveLength(US_JURISDICTION_COUNT);
  });
  it("has unique codes and unique slugs", () => {
    expect(new Set(rows.map((r) => r.code)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => toSlug(r.name))).size).toBe(rows.length);
  });
  it("is sorted by name", () => {
    const names = rows.map((r) => r.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it("includes DC and the five no-sales-tax states, marked as such", () => {
    expect(rows.some((r) => r.code === "DC")).toBe(true);
    for (const code of NO_SALES_TAX) {
      const row = rows.find((r) => r.code === code);
      expect(row, code).toBeDefined();
      expect(row?.has_state_sales_tax, code).toBe(false);
    }
  });
  it("every other jurisdiction has a statewide sales tax", () => {
    for (const r of rows.filter((r) => !NO_SALES_TAX.includes(r.code))) {
      expect(r.has_state_sales_tax, r.code).toBe(true);
    }
  });
  it("pending rows carry no figures and non-pending rows carry sources", () => {
    for (const r of rows) {
      if (r.verification.level === "pending") {
        expect(r.sales_threshold_usd, r.code).toBeNull();
        expect(r.transactions_threshold, r.code).toBeNull();
      } else {
        expect(r.sources.length, r.code).toBeGreaterThan(0);
      }
    }
  });
  it("no row claims professional review", () => {
    for (const r of rows) expect(r.review.status, r.code).toBe("unreviewed");
  });
});

describe("tools.json invariants", () => {
  const tools = toolRowSchema.array().parse(read("tools.json"));
  it("has unique slugs", () => {
    expect(new Set(tools.map((t) => t.slug)).size).toBe(tools.length);
  });
  it("is sorted by name", () => {
    const names = tools.map((t) => t.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it("no row claims professional review", () => {
    for (const t of tools) expect(t.review.status, t.slug).toBe("unreviewed");
  });
});

describe("changelog.json invariants", () => {
  it("has entries, newest first", () => {
    const entries = changelogEntrySchema.array().parse(read("changelog.json"));
    expect(entries.length).toBeGreaterThan(0);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1]!.date >= entries[i]!.date, `entry ${i}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/data/invariants.test.ts`
Expected: PASS. If a test fails, the defect is in the data from Tasks 8–10: fix the row according to the verification procedure (never by editing the test), note the fix in `data/changelog.json` if a rendered figure changed, and re-run.

- [ ] **Step 3: Confirm the backlog format**

Open `data/BACKLOG.md`; every bullet under `## Open` must follow the template (dataset/subject, claim, where seen, why not accepted, what would verify). Fix formatting only.

- [ ] **Step 4: Commit**

```bash
npm test
git add tests/data/invariants.test.ts data/
git commit -m "test: add dataset invariants for 51 US jurisdictions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Report: count of rows per verification level (official / corroborated / single_secondary / pending).

---

### Task 12: Tools and merchants-of-record rows

**Files:**
- Modify: `data/tools.json`, `data/BACKLOG.md`, `data/changelog.json`
- Test: `tests/data/parse.test.ts`, `tests/data/invariants.test.ts` (exist)

**Interfaces:**
- Consumes: `toolRowSchema` (Task 2).
- Produces: tool rows for every vendor below whose pricing page was fetched.

- [ ] **Step 1: Load WebFetch (`ToolSearch` query `select:WebFetch`) and fetch each vendor's pricing page**

Starting URLs. If a URL fails, fetch the vendor's root domain and ask for the pricing page URL, then fetch that. At most three fetches per vendor; if none works, skip the vendor and add a Backlog bullet.

Compliance software:
- Anrok: `https://www.anrok.com/pricing`
- Numeral: `https://www.numeralhq.com/pricing`
- Kintsugi: `https://www.trykintsugi.com/pricing`
- Zamp: `https://www.zamp.com/pricing`
- Quaderno: `https://www.quaderno.io/pricing`
- TaxJar: `https://www.taxjar.com/pricing`
- TaxCloud: `https://taxcloud.com/pricing`
- Avalara: `https://www.avalara.com/us/en/products/calculations.html` (then ask for pricing)
- Sphere: `https://www.getsphere.com/pricing`

Merchants of record:
- Paddle: `https://www.paddle.com/pricing`
- Lemon Squeezy: `https://www.lemonsqueezy.com/pricing`
- Polar: `https://polar.sh/pricing`
- Creem: `https://www.creem.io/pricing`
- FastSpring: `https://fastspring.com/pricing/`
- Gumroad: `https://gumroad.com/pricing`
- Dodo Payments: `https://dodopayments.com/pricing`

Prompt per page: `Quote verbatim every price on this page: per-filing fees, per-registration fees, per-jurisdiction monthly fees, percentage of revenue, per-transaction fixed fees, monthly subscription tiers and what each includes. State whether US sales tax filing is supported. If the page shows no numeric prices (only "contact sales" or "get a quote"), say QUOTE ONLY. Give the exact URL of this page.`

- [ ] **Step 2: Write one row per fetched vendor**

Mapping rules:
- Numeric prices present ⇒ pick the single `pricing_model` that matches the headline price (per filing / per jurisdiction per month / percent plus fixed / tiered subscription) and fill only the fields that the page states; `pricing_public: true`; `pricing.pricing_url` = the fetched URL.
- "Contact sales" only ⇒ `pricing_model: "quote_only"`, `pricing_public: false`, every numeric field null, `pricing.pricing_url` = the fetched URL.
- `category`: compliance_software for the first list, merchant_of_record for the second.
- `us_sales_tax_supported`: true only if the page or vendor site says so; otherwise false.
- `notes`: one or two sentences, quoted or closely paraphrased, describing what the price covers (e.g., "Registrations billed separately at $X."). No marketing language.
- `sources`: the pricing page (publisher = vendor name, title = page title), `accessed_on` today. `verification: { "level": "official", "verified_on": today }`. `review` unreviewed.
- Keep the array sorted by `name`.

Row template:
```json
{
  "slug": "vendor-slug",
  "name": "Vendor",
  "category": "compliance_software",
  "website_url": "https://vendor.example",
  "pricing_model": "per_filing",
  "pricing_public": true,
  "pricing": {
    "registration_fee_usd": null,
    "filing_fee_usd": null,
    "per_jurisdiction_month_usd": null,
    "percent_fee": null,
    "fixed_fee_usd": null,
    "starting_monthly_usd": null,
    "pricing_url": "https://vendor.example/pricing"
  },
  "us_sales_tax_supported": true,
  "notes": "",
  "sources": [
    { "url": "https://vendor.example/pricing", "publisher": "Vendor", "title": "Pricing", "accessed_on": "YYYY-MM-DD" }
  ],
  "verification": { "level": "official", "verified_on": "YYYY-MM-DD" },
  "review": { "status": "unreviewed", "by": null, "on": null }
}
```

- [ ] **Step 3: Extend the invariants test for tools**

In `tests/data/invariants.test.ts`, inside `describe("tools.json invariants", ...)`, add:
```ts
  it("has at least one tool in each category", () => {
    expect(tools.some((t) => t.category === "compliance_software")).toBe(true);
    expect(tools.some((t) => t.category === "merchant_of_record")).toBe(true);
  });
  it("quote_only rows have no prices and pricing_public false", () => {
    for (const t of tools.filter((t) => t.pricing_model === "quote_only")) {
      expect(t.pricing_public, t.slug).toBe(false);
      expect(Object.entries(t.pricing).filter(([k]) => k !== "pricing_url").every(([, v]) => v === null), t.slug).toBe(true);
    }
  });
```

- [ ] **Step 4: Run the data tests and fix rows until they pass**

Run: `npx vitest run tests/data`
Expected: PASS. If a whole category failed to fetch, stop and report; do not invent a row.

- [ ] **Step 5: Changelog entry and commit**

Prepend to `data/changelog.json`:
```json
{
  "date": "YYYY-MM-DD",
  "dataset": "tools",
  "subject": "Initial tools and merchants of record",
  "change": "Added <N> vendor rows from vendor pricing pages.",
  "source_url": null
}
```
```bash
npm test
git add data/tools.json data/BACKLOG.md data/changelog.json tests/data/invariants.test.ts
git commit -m "data: add compliance tools and merchants of record with sourced pricing

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Report: vendors added with their pricing model, vendors skipped and why.

---

### Task 13: Nexus pages: table, per-state pages, badges, sources, post-build assertions

**Files:**
- Create: `src/components/Badges.astro`, `src/components/SourceList.astro`, `src/components/ReportError.astro`, `src/components/NexusTable.astro`
- Create: `src/pages/us/economic-nexus/index.astro`, `src/pages/us/economic-nexus/[slug].astro`
- Create: `scripts/postbuild-assert.mjs`

**Interfaces:**
- Consumes: collections (Task 3), `toSlug`, `formatThreshold`, `ruleLabel`, `levelLabel` (Task 4), `siteConfig` (Task 1), 51 rows (Tasks 8–11).
- Produces: `Badges` props `{ level: VerificationLevel; verifiedOn: string; reviewStatus: "unreviewed" | "reviewed"; reviewedBy?: string | null; reviewedOn?: string | null }`; `SourceList` props `{ sources: Source[] }`; `ReportError` props `{ subject: string }`; `NexusTable` props `{ rows: NexusRow[] }`; routes `/us/economic-nexus/` and `/us/economic-nexus/<slug>/`; `npm run postbuild:assert`.

- [ ] **Step 1: Write the post-build assertion script (it is the test for this task)**

`scripts/postbuild-assert.mjs`:
```js
import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const EXPECTED_STATE_PAGES = 51;
const REQUIRED = [
  "index.html",
  "us/economic-nexus/index.html",
  "tools/index.html",
  "wizard/index.html",
  "changelog/index.html",
  "methodology/index.html",
  "about/index.html",
  "disclosure/index.html",
  "data/us-economic-nexus.json",
  "data/tools.json",
  "sitemap-index.xml",
  "robots.txt",
];

function fail(message) {
  console.error(`postbuild-assert: ${message}`);
  process.exit(1);
}

if (!existsSync(dist)) fail("dist/ is missing; run `npm run build` first");

const nexusDir = join(dist, "us", "economic-nexus");
if (!existsSync(nexusDir)) fail("missing dist/us/economic-nexus/");
const statePages = readdirSync(nexusDir).filter(
  (name) => statSync(join(nexusDir, name)).isDirectory() && existsSync(join(nexusDir, name, "index.html")),
);
if (statePages.length !== EXPECTED_STATE_PAGES) {
  fail(`expected ${EXPECTED_STATE_PAGES} state pages, found ${statePages.length}`);
}

const missing = REQUIRED.filter((rel) => !existsSync(join(dist, rel)));
if (missing.length > 0) fail(`missing in dist/: ${missing.join(", ")}`);

console.log(`postbuild-assert: OK (${statePages.length} state pages, ${REQUIRED.length} required files)`);
```

- [ ] **Step 2: Run it against the current build to see it fail**

Run: `npm run build && npm run postbuild:assert`
Expected: FAIL with "missing dist/us/economic-nexus/".

- [ ] **Step 3: Write the components**

`src/components/Badges.astro`:
```astro
---
import { levelLabel } from "../lib/format";
import type { VerificationLevel } from "../lib/schemas";

interface Props {
  level: VerificationLevel;
  verifiedOn: string;
  reviewStatus: "unreviewed" | "reviewed";
  reviewedBy?: string | null;
  reviewedOn?: string | null;
}

const { level, verifiedOn, reviewStatus, reviewedBy = null, reviewedOn = null } = Astro.props;
const reviewed = reviewStatus === "reviewed" && reviewedBy !== null && reviewedOn !== null;
---

<div class="badges">
  <span class={`badge badge-${level}`}>{levelLabel(level)}</span>
  <span class="badge badge-date">Verified {verifiedOn}</span>
  {
    reviewed ? (
      <span class="badge badge-reviewed">Reviewed by {reviewedBy} on {reviewedOn}</span>
    ) : (
      <span class="badge badge-unreviewed">Not yet professionally reviewed</span>
    )
  }
</div>
```

`src/components/SourceList.astro`:
```astro
---
import type { Source } from "../lib/schemas";

interface Props {
  sources: Source[];
}

const { sources } = Astro.props;
---

{
  sources.length === 0 ? (
    <p class="muted">No sources recorded.</p>
  ) : (
    <ul class="sources">
      {sources.map((s) => (
        <li>
          <a href={s.url} rel="noopener nofollow" target="_blank">
            {s.title}
          </a>
          , {s.publisher}, accessed {s.accessed_on}
        </li>
      ))}
    </ul>
  )
}
```

`src/components/ReportError.astro`:
```astro
---
import { siteConfig } from "../lib/config";

interface Props {
  subject: string;
}

const { subject } = Astro.props;
const email = siteConfig.owner.email.trim();
const href = email === "" ? null : `mailto:${email}?subject=${encodeURIComponent(subject)}`;
---

{
  href && (
    <p class="report">
      <a href={href}>Report an error</a> in this entry.
    </p>
  )
}
```

`src/components/NexusTable.astro`:
```astro
---
import { formatThreshold, ruleLabel } from "../lib/format";
import type { NexusRow } from "../lib/schemas";
import { toSlug } from "../lib/slug";

interface Props {
  rows: NexusRow[];
}

const { rows } = Astro.props;
const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
---

<div class="table-wrap">
  <table class="data-table">
    <thead>
      <tr>
        <th>Jurisdiction</th>
        <th>Threshold</th>
        <th>Rule</th>
        <th>Measurement period</th>
        <th>Effective</th>
        <th>Verification</th>
      </tr>
    </thead>
    <tbody>
      {
        sorted.map((r) => (
          <tr>
            <td>
              <a href={`/us/economic-nexus/${toSlug(r.name)}/`}>{r.name}</a> <span class="muted">{r.code}</span>
            </td>
            <td>{formatThreshold(r)}</td>
            <td>{ruleLabel(r.threshold_rule)}</td>
            <td>{r.measurement_period ?? "Not recorded"}</td>
            <td>{r.effective_date ?? "Not recorded"}</td>
            <td>
              <span class={`badge badge-${r.verification.level}`}>{r.verification.level.replace("_", " ")}</span>
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
</div>
```

- [ ] **Step 4: Write the two pages**

`src/pages/us/economic-nexus/index.astro`:
```astro
---
import { getCollection } from "astro:content";
import NexusTable from "../../../components/NexusTable.astro";
import Base from "../../../layouts/Base.astro";

const rows = (await getCollection("usNexus")).map((e) => e.data);
const byLevel = rows.reduce<Record<string, number>>((acc, r) => {
  acc[r.verification.level] = (acc[r.verification.level] ?? 0) + 1;
  return acc;
}, {});
const latest = rows.map((r) => r.verification.verified_on).sort().at(-1) ?? "n/a";
---

<Base
  title="US economic nexus thresholds by state"
  description="Economic-nexus sales and transaction thresholds for all 50 states and DC, each with sources and a verification date."
>
  <h1>US economic nexus thresholds by state</h1>
  <p>
    {rows.length} jurisdictions. Most recent verification: {latest}. Levels:
    {Object.entries(byLevel).map(([level, n]) => ` ${level.replace("_", " ")} ${n}`).join(",")}.
    Nexus is not the same as taxability; see the <a href="/methodology/">methodology</a>.
  </p>
  <NexusTable rows={rows} />
  <p class="muted">
    <a href="/data/us-economic-nexus.json">Download this table as JSON</a> · Try the <a href="/wizard/">registration wizard</a>.
  </p>
</Base>
```

`src/pages/us/economic-nexus/[slug].astro`:
```astro
---
import { getCollection } from "astro:content";
import Badges from "../../../components/Badges.astro";
import ReportError from "../../../components/ReportError.astro";
import SourceList from "../../../components/SourceList.astro";
import Base from "../../../layouts/Base.astro";
import { formatThreshold, ruleLabel } from "../../../lib/format";
import type { NexusRow } from "../../../lib/schemas";
import { toSlug } from "../../../lib/slug";

export async function getStaticPaths() {
  const entries = await getCollection("usNexus");
  return entries.map((e) => ({ params: { slug: toSlug(e.data.name) }, props: { row: e.data } }));
}

interface Props {
  row: NexusRow;
}

const { row } = Astro.props;
const pending = row.verification.level === "pending";
const title = `${row.name} economic nexus threshold`;
const description = pending
  ? `${row.name} economic-nexus threshold: verification pending.`
  : `${row.name}: ${formatThreshold(row)}. ${ruleLabel(row.threshold_rule)}. ${row.measurement_period ?? "Measurement period not recorded"}.`;
const yesNo = (v: boolean | null) => (v === null ? "Not recorded" : v ? "Yes" : "No");
---

<Base title={title} description={description}>
  <article>
    <h1>{row.name} <span class="muted">{row.code}</span></h1>
    <Badges
      level={row.verification.level}
      verifiedOn={row.verification.verified_on}
      reviewStatus={row.review.status}
      reviewedBy={row.review.by}
      reviewedOn={row.review.on}
    />
    {
      pending ? (
        <p class="notice">
          Threshold figures for {row.name} are pending verification and are not shown. See the
          <a href="/methodology/">methodology</a> for what that means.
        </p>
      ) : (
        <dl class="facts">
          <dt>Statewide sales tax</dt>
          <dd>{row.has_state_sales_tax ? "Yes" : "No"}</dd>
          <dt>Economic-nexus threshold</dt>
          <dd>{formatThreshold(row)}</dd>
          <dt>Rule</dt>
          <dd>{ruleLabel(row.threshold_rule)}</dd>
          <dt>Sales counted</dt>
          <dd>{row.sales_measure ?? "Not recorded"}</dd>
          <dt>Measurement period</dt>
          <dd>{row.measurement_period ?? "Not recorded"}</dd>
          <dt>Marketplace sales included</dt>
          <dd>{yesNo(row.includes_marketplace_sales)}</dd>
          <dt>Effective date</dt>
          <dd>{row.effective_date ?? "Not recorded"}</dd>
          <dt>Register</dt>
          <dd>
            {row.registration_url ? (
              <a href={row.registration_url} rel="noopener" target="_blank">
                State registration page
              </a>
            ) : (
              "Not recorded"
            )}
          </dd>
        </dl>
      )
    }
    {row.notes !== "" && <p class="notes">{row.notes}</p>}
    <h2>Sources</h2>
    <SourceList sources={row.sources} />
    <ReportError subject={`Correction: ${row.name} economic nexus`} />
    <p class="muted">
      <a href="/us/economic-nexus/">All US jurisdictions</a> · <a href="/wizard/">Registration wizard</a> ·
      <a href="/data/us-economic-nexus.json">Download JSON</a>
    </p>
  </article>
</Base>
```

- [ ] **Step 5: Build and run the assertion**

Run: `npm run typecheck && npm run build && npm run postbuild:assert`
Expected: typecheck 0 errors; build succeeds; the assertion still FAILS, but now only because `tools/index.html`, `wizard/index.html`, `changelog/index.html`, `methodology/index.html`, `about/index.html`, `disclosure/index.html` are missing (Tasks 14–15), and it reports 51 state pages. If it reports a different state-page count, a row's `name` produced a duplicate slug; fix the data.

- [ ] **Step 6: Commit**

```bash
git add scripts/postbuild-assert.mjs src/components/Badges.astro src/components/SourceList.astro src/components/ReportError.astro src/components/NexusTable.astro src/pages/us
git commit -m "feat: add nexus table, per-state pages and post-build assertions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Tools page and the wizard

**Files:**
- Create: `src/components/ToolsTable.astro`, `src/pages/tools/index.astro`
- Create: `src/components/wizard/Wizard.astro`, `src/components/wizard/wizard-client.ts`, `src/pages/wizard.astro`

**Interfaces:**
- Consumes: `evaluateAll`, `estimateToolCosts`, `parseMoney`, `parseCount` (Tasks 4–7), `fmtUsd`, `formatPricing`, `modelLabel` (Task 4), `outboundUrl` (Task 1), `toSlug`, collections.
- Produces: routes `/tools/` and `/wizard/`; DOM ids used by the client: `wizard-nexus-data`, `wizard-tools-data`, `wizard-form`, `home-state`, `lines`, `add-line`, `form-errors`, `results`, `summary`, `results-body`, `costs-body`, `caveats`.

- [ ] **Step 1: Write the tools table and page**

`src/components/ToolsTable.astro`:
```astro
---
import { outboundUrl } from "../lib/config";
import { formatPricing, modelLabel } from "../lib/format";
import type { ToolRow } from "../lib/schemas";

interface Props {
  tools: ToolRow[];
}

const { tools } = Astro.props;
const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));
---

{
  sorted.length === 0 ? (
    <p class="muted">No entries yet.</p>
  ) : (
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Pricing model</th>
            <th>Public pricing</th>
            <th>Verified</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr>
              <td>
                <a href={outboundUrl(t.slug, t.website_url)} rel="noopener nofollow" target="_blank">
                  {t.name}
                </a>
              </td>
              <td>{modelLabel(t.pricing_model)}</td>
              <td>
                {formatPricing(t)}
                {t.pricing.pricing_url && (
                  <>
                    {" "}
                    <a href={t.pricing.pricing_url} rel="noopener nofollow" target="_blank" class="muted">
                      source
                    </a>
                  </>
                )}
              </td>
              <td>
                <span class={`badge badge-${t.verification.level}`}>{t.verification.verified_on}</span>
              </td>
              <td>{t.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

`src/pages/tools/index.astro`:
```astro
---
import { getCollection } from "astro:content";
import ToolsTable from "../../components/ToolsTable.astro";
import Base from "../../layouts/Base.astro";

const tools = (await getCollection("tools")).map((e) => e.data);
const software = tools.filter((t) => t.category === "compliance_software");
const mor = tools.filter((t) => t.category === "merchant_of_record");
---

<Base
  title="Sales-tax compliance tools and merchants of record: pricing"
  description="Public pricing of US sales-tax compliance software and merchants of record, taken from each vendor's pricing page and dated."
>
  <h1>Tools and pricing</h1>
  <p>
    Every figure comes from the vendor's own pricing page on the date shown. Vendors without public pricing are
    marked "Custom quote". Outbound links are plain links unless listed on the
    <a href="/disclosure/">disclosure</a> page.
  </p>
  <h2>Compliance software</h2>
  <ToolsTable tools={software} />
  <h2>Merchants of record</h2>
  <p class="muted">A merchant of record sells to your customers in its own name and handles tax in place of your own registrations.</p>
  <ToolsTable tools={mor} />
  <p class="muted">
    <a href="/data/tools.json">Download this table as JSON</a> · Estimate your cost with the <a href="/wizard/">wizard</a>.
  </p>
</Base>
```

- [ ] **Step 2: Write the wizard component and client script**

`src/components/wizard/Wizard.astro`:
```astro
---
import { getCollection } from "astro:content";
import { FILINGS_PER_STATE_PER_YEAR } from "../../lib/engine/cost";

const rows = (await getCollection("usNexus")).map((e) => e.data).sort((a, b) => a.name.localeCompare(b.name));
const tools = (await getCollection("tools")).map((e) => e.data);
// Escape "<" so embedded JSON can never close the script tag.
const asJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
---

<section class="wizard">
  <script type="application/json" id="wizard-nexus-data" set:html={asJson(rows)}></script>
  <script type="application/json" id="wizard-tools-data" set:html={asJson(tools)}></script>

  <form id="wizard-form" novalidate>
    <fieldset>
      <legend>Your business</legend>
      <label for="home-state">Home state (physical presence), optional</label>
      <select id="home-state" name="homeState">
        <option value="">None, or outside the US</option>
        {rows.map((r) => <option value={r.code}>{r.name}</option>)}
      </select>
    </fieldset>

    <fieldset>
      <legend>Sales by state</legend>
      <p class="muted">
        Enter gross sales into each state over that state's measurement period. Transaction counts are optional but
        needed where a state also has a transaction threshold.
      </p>
      <div id="lines"></div>
      <button type="button" id="add-line">Add a state</button>
    </fieldset>

    <p id="form-errors" class="errors" role="alert" aria-live="polite"></p>
    <button type="submit" id="evaluate">Evaluate</button>
  </form>

  <section id="results" hidden>
    <h2>Results</h2>
    <p id="summary"></p>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>State</th>
            <th>Status</th>
            <th>Detail</th>
            <th>Verification</th>
          </tr>
        </thead>
        <tbody id="results-body"></tbody>
      </table>
    </div>

    <h2>Estimated annual cost by tool</h2>
    <p class="muted">
      Estimates only. Assumes {FILINGS_PER_STATE_PER_YEAR} filings per registered state per year. Excludes state
      registration fees, back taxes, penalties and interest. Nexus is not the same as taxability.
    </p>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Category</th>
            <th>Annual estimate</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody id="costs-body"></tbody>
      </table>
    </div>
    <ul class="caveats" id="caveats"></ul>
  </section>
</section>

<script src="./wizard-client.ts"></script>
```

`src/components/wizard/wizard-client.ts`:
```ts
import { estimateToolCosts } from "../../lib/engine/cost";
import { evaluateAll } from "../../lib/engine/nexus";
import { parseCount, parseMoney } from "../../lib/engine/parse";
import type { StateResult, WizardLine } from "../../lib/engine/types";
import { fmtUsd } from "../../lib/format";
import type { NexusRow, ToolRow } from "../../lib/schemas";
import { toSlug } from "../../lib/slug";

function readJson<T>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return JSON.parse(el.textContent ?? "null") as T;
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

const rows = readJson<NexusRow[]>("wizard-nexus-data");
const tools = readJson<ToolRow[]>("wizard-tools-data");
const byCode = new Map(rows.map((r) => [r.code, r] as const));

const form = byId<HTMLFormElement>("wizard-form");
const homeSelect = byId<HTMLSelectElement>("home-state");
const linesEl = byId<HTMLDivElement>("lines");
const addBtn = byId<HTMLButtonElement>("add-line");
const errorsEl = byId<HTMLParagraphElement>("form-errors");
const resultsEl = byId<HTMLElement>("results");
const summaryEl = byId<HTMLParagraphElement>("summary");
const resultsBody = byId<HTMLTableSectionElement>("results-body");
const costsBody = byId<HTMLTableSectionElement>("costs-body");
const caveatsEl = byId<HTMLUListElement>("caveats");

const STATUS_LABEL: Record<StateResult["status"], string> = {
  registration_likely_required: "Registration likely required",
  physical_presence: "Physical presence",
  at_threshold_check_wording: "At threshold: check wording",
  below_threshold: "Below threshold",
  insufficient_data: "Insufficient data",
  no_state_sales_tax: "No statewide sales tax",
};

function stateOptions(): string {
  return rows.map((r) => `<option value="${r.code}">${escapeHtml(r.name)}</option>`).join("");
}

function clearResults(): void {
  resultsEl.hidden = true;
  errorsEl.textContent = "";
}

function addLine(): void {
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = `
    <select class="line-state" aria-label="State">${stateOptions()}</select>
    <input class="line-sales" inputmode="decimal" placeholder="Gross sales, USD" aria-label="Gross sales in USD" />
    <input class="line-tx" inputmode="numeric" placeholder="Transactions (optional)" aria-label="Transactions, optional" />
    <button type="button" class="remove-line">Remove</button>`;
  div.querySelector(".remove-line")?.addEventListener("click", () => {
    div.remove();
    clearResults();
  });
  div.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", clearResults));
  linesEl.appendChild(div);
}

function readLines(): { lines: WizardLine[]; errors: string[] } {
  const errors: string[] = [];
  const lines: WizardLine[] = [];
  linesEl.querySelectorAll<HTMLDivElement>(".line").forEach((div, i) => {
    const code = (div.querySelector(".line-state") as HTMLSelectElement).value;
    const sales = parseMoney((div.querySelector(".line-sales") as HTMLInputElement).value);
    const tx = parseCount((div.querySelector(".line-tx") as HTMLInputElement).value);
    const name = byCode.get(code)?.name ?? code;
    if (sales === null) errors.push(`Line ${i + 1} (${name}): enter gross sales as a number, for example 250000.`);
    if (tx === null) errors.push(`Line ${i + 1} (${name}): transactions must be a whole number.`);
    if (sales !== null && tx !== null) {
      lines.push(tx === undefined ? { code, grossSalesUsd: sales } : { code, grossSalesUsd: sales, transactions: tx });
    }
  });
  return { lines, errors };
}

function render(): void {
  const { lines, errors } = readLines();
  const homeState = homeSelect.value === "" ? null : homeSelect.value;
  if (lines.length === 0 && homeState === null) errors.push("Add at least one state or choose a home state.");
  if (errors.length > 0) {
    errorsEl.textContent = errors.join(" ");
    resultsEl.hidden = true;
    return;
  }

  const out = evaluateAll({ homeState, lines }, rows);
  if (!out.ok) {
    errorsEl.textContent = out.errors.map((e) => e.message).join(" ");
    resultsEl.hidden = true;
    return;
  }

  errorsEl.textContent = "";
  summaryEl.textContent = `${out.registrationCount} of ${out.results.length} states indicate a registration obligation. Total sales entered: ${fmtUsd(out.totalSalesUsd)}.`;

  resultsBody.innerHTML = out.results
    .map(
      (r) => `
      <tr>
        <td><a href="/us/economic-nexus/${toSlug(r.name)}/">${escapeHtml(r.name)}</a></td>
        <td><span class="status status-${r.status}">${STATUS_LABEL[r.status]}</span></td>
        <td>${escapeHtml(r.message)}${r.notes ? ` <span class="muted">${escapeHtml(r.notes)}</span>` : ""}</td>
        <td><span class="badge badge-${r.verificationLevel}">${r.verificationLevel.replace("_", " ")}</span></td>
      </tr>`,
    )
    .join("");

  const costs = estimateToolCosts(tools, {
    registrationCount: out.registrationCount,
    totalSalesUsd: out.totalSalesUsd,
    totalTransactions: out.totalTransactions,
  }).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  costsBody.innerHTML = costs
    .map(
      (c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.category === "merchant_of_record" ? "Merchant of record" : "Compliance software"}</td>
        <td>${
          c.annualEstimateUsd === null
            ? "Custom quote"
            : `${c.label === "from" ? "From " : ""}${fmtUsd(c.annualEstimateUsd)} per year`
        }</td>
        <td>${c.notes.map(escapeHtml).join(" ")}</td>
      </tr>`,
    )
    .join("");

  caveatsEl.innerHTML = (out.results[0]?.caveats ?? []).map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  resultsEl.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});
addBtn.addEventListener("click", () => addLine());
homeSelect.addEventListener("change", clearResults);
addLine();
```

`src/pages/wizard.astro`:
```astro
---
import Wizard from "../components/wizard/Wizard.astro";
import Base from "../layouts/Base.astro";
---

<Base
  title="Where do I need to register for sales tax? US nexus wizard"
  description="Enter your sales by state to see where economic-nexus thresholds indicate a registration obligation, with sources, and estimate the annual cost by compliance tool."
>
  <h1>US registration wizard</h1>
  <p>
    Enter your gross sales by state. The wizard compares them with each state's published economic-nexus threshold and
    shows the sources behind every answer. It is information, not advice, and it does not evaluate whether your product
    is taxable.
  </p>
  <Wizard />
</Base>
```

- [ ] **Step 3: Typecheck, build, and smoke-test the wizard in a browser**

Run: `npm run typecheck && npm run build && npm run postbuild:assert`
Expected: typecheck 0 errors; build succeeds; the assertion fails only on the four pages still missing (changelog, methodology, about, disclosure).

Then run `npm run preview` and open `http://localhost:4321/wizard/` in a browser (or `curl -s http://localhost:4321/wizard/ | grep -c wizard-nexus-data`, expected `1`). In the browser: add a state, type `$600,000` for a state whose threshold is below that, submit, and confirm a result row and a cost table appear with no console errors. Stop the preview server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ToolsTable.astro src/pages/tools src/components/wizard src/pages/wizard.astro
git commit -m "feat: add tools pricing page and registration wizard

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 15: Home, changelog, methodology, about, disclosure, newsletter form

**Files:**
- Create: `src/components/NewsletterForm.astro`
- Modify: `src/pages/index.astro` (replace the placeholder)
- Create: `src/pages/changelog.astro`, `src/pages/methodology.astro`, `src/pages/about.astro`, `src/pages/disclosure.astro`

**Interfaces:**
- Consumes: collections, `siteConfig`, `displayName`, `hasOwnerDetails`, `FILINGS_PER_STATE_PER_YEAR`, `levelLabel`.
- Produces: the remaining routes; `npm run postbuild:assert` passes.

- [ ] **Step 1: Write the newsletter form**

`src/components/NewsletterForm.astro`:
```astro
---
import { siteConfig } from "../lib/config";

const action = siteConfig.newsletterActionUrl.trim();
---

{
  action !== "" && (
    <form class="newsletter" method="post" action={action}>
      <label for="newsletter-email">Get one email when a threshold or a price changes.</label>
      <div class="row">
        <input id="newsletter-email" name="email" type="email" required placeholder="you@company.com" />
        <button type="submit">Subscribe</button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Replace the home page**

`src/pages/index.astro`:
```astro
---
import { getCollection } from "astro:content";
import NewsletterForm from "../components/NewsletterForm.astro";
import Base from "../layouts/Base.astro";
import { siteConfig } from "../lib/config";

const rows = (await getCollection("usNexus")).map((e) => e.data);
const tools = (await getCollection("tools")).map((e) => e.data);
const latest = rows.map((r) => r.verification.verified_on).sort().at(-1) ?? "n/a";
const withFigures = rows.filter((r) => r.verification.level !== "pending").length;
---

<Base title="US sales-tax nexus thresholds and tool pricing" description={siteConfig.tagline}>
  <h1>{siteConfig.tagline}</h1>
  <p>
    For software and digital-product sellers. Every threshold and every price on this site links to the page it came
    from and shows the date it was checked. Nothing is typed from memory.
  </p>
  <ul>
    <li>
      <a href="/us/economic-nexus/">Economic-nexus thresholds</a> for {rows.length} US jurisdictions ({withFigures} with
      verified figures; most recent check {latest}).
    </li>
    <li><a href="/tools/">Pricing</a> for {tools.length} compliance tools and merchants of record.</li>
    <li><a href="/wizard/">The wizard</a>: enter sales by state, get a registration list and a cost estimate per tool.</li>
  </ul>
  <NewsletterForm />
  <p class="muted">
    Data changes are logged on the <a href="/changelog/">changelog</a>. How verification works:
    <a href="/methodology/">methodology</a>.
  </p>
</Base>
```

- [ ] **Step 3: Write the changelog page**

`src/pages/changelog.astro`:
```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";

const entries = (await getCollection("changelog"))
  .map((e) => e.data)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
---

<Base title="Changelog" description="Every change to a published threshold or price, with its date and source.">
  <h1>Changelog</h1>
  <p>Every change to a rendered figure is recorded here with its source.</p>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Dataset</th>
          <th>Subject</th>
          <th>Change</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {
          entries.map((e) => (
            <tr>
              <td>{e.date}</td>
              <td>{e.dataset}</td>
              <td>{e.subject}</td>
              <td>{e.change}</td>
              <td>
                {e.source_url ? (
                  <a href={e.source_url} rel="noopener nofollow" target="_blank">
                    source
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
</Base>
```

- [ ] **Step 4: Write the methodology page**

`src/pages/methodology.astro`:
```astro
---
import Base from "../layouts/Base.astro";
import { FILINGS_PER_STATE_PER_YEAR } from "../lib/engine/cost";
import { levelLabel } from "../lib/format";
---

<Base
  title="Methodology"
  description="How thresholds and prices on this site are verified, what the verification and review badges mean, and how to report an error."
>
  <h1>Methodology</h1>

  <h2>What this site is</h2>
  <p>
    A reference for software and digital-product sellers: US state economic-nexus thresholds, the public pricing of
    sales-tax compliance tools and merchants of record, and a wizard that compares your sales with the thresholds.
    It is information, not tax advice. Decisions about registration and filing belong with you and your adviser.
  </p>

  <h2>How a figure gets onto this site</h2>
  <ol>
    <li>A figure is recorded only from a page that was actually fetched. Nothing is typed from memory.</li>
    <li>Every row lists its sources with the date each was accessed, and a "verified" date for the row.</li>
    <li>
      If sources conflict on a threshold and no official page could be reached, the row is published as "pending" with
      no figures rather than with a guess.
    </li>
    <li>Every change to a published figure is recorded on the <a href="/changelog/">changelog</a>.</li>
  </ol>

  <h2>Verification badges</h2>
  <dl class="facts">
    <dt>{levelLabel("official")}</dt>
    <dd>The state's own tax department page (or the vendor's own pricing page) was fetched and states the figure.</dd>
    <dt>{levelLabel("corroborated")}</dt>
    <dd>Two independent secondary sources were fetched and agree.</dd>
    <dt>{levelLabel("single_secondary")}</dt>
    <dd>Only one secondary source could be fetched. Treat with care and check the state page before acting.</dd>
    <dt>{levelLabel("pending")}</dt>
    <dd>No reliable source could be fetched, or sources conflict. No figures are shown.</dd>
  </dl>

  <h2>Review badge</h2>
  <p>
    "Not yet professionally reviewed" means exactly that: no tax professional has signed off on the row. When a named
    reviewer does, the row shows their name and the date. Until then, treat every row as research, not advice.
  </p>

  <h2>What the wizard does and does not do</h2>
  <ul>
    <li>It compares the gross sales (and, if entered, transaction counts) you type with each state's published threshold.</li>
    <li>It flags your home state as physical presence without evaluating thresholds.</li>
    <li>It does not evaluate whether your product is taxable in a state. Nexus and taxability are separate questions.</li>
    <li>It does not know your filing frequency. Cost estimates assume {FILINGS_PER_STATE_PER_YEAR} filings per registered state per year.</li>
    <li>It does not store or send what you type. Everything runs in your browser.</li>
  </ul>

  <h2>Update cadence</h2>
  <p>
    All threshold rows are re-verified at least every six months and after state legislative sessions. Tool pricing is
    re-verified quarterly. The verified date on each row is the authority on freshness.
  </p>

  <h2>Reporting an error</h2>
  <p>
    Each entry has a "Report an error" link when a contact address is published. Include the state or vendor, the
    figure you believe is wrong, and a link to the page that shows the correct one.
  </p>
</Base>
```

- [ ] **Step 5: Write the about and disclosure pages**

`src/pages/about.astro`:
```astro
---
import Base from "../layouts/Base.astro";
import { displayName, hasOwnerDetails, siteConfig } from "../lib/config";

const name = displayName();
const owner = siteConfig.owner;
---

<Base title="About" description={`What ${name} is, who runs it, and what it is for.`}>
  <h1>About {name}</h1>
  <h2>What this is</h2>
  <p>
    A sourced reference for software and digital-product sellers who need to know where US sales-tax registration
    obligations arise and what the tools that handle them cost. Every figure links to its source and shows when it was
    checked. See the <a href="/methodology/">methodology</a>.
  </p>
  {
    hasOwnerDetails() && (
      <>
        <h2>Who runs it</h2>
        <p>
          {owner.name !== "" && <span>{owner.name}</span>}
          {owner.location !== "" && <span>, {owner.location}</span>}
          {owner.email !== "" && (
            <span>
              . Contact: <a href={`mailto:${owner.email}`}>{owner.email}</a>
            </span>
          )}
        </p>
        {siteConfig.reviewer.name !== "" && (
          <p>
            Reviewer of marked rows: {siteConfig.reviewer.name}
            {siteConfig.reviewer.credential !== "" && <span>, {siteConfig.reviewer.credential}</span>}. Only rows
            carrying the "Reviewed by" badge have been reviewed.
          </p>
        )}
      </>
    )
  }
  <h2>What it is not</h2>
  <p>It is not tax advice, and it does not replace a conversation with a qualified adviser about your situation.</p>
</Base>
```

`src/pages/disclosure.astro`:
```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import { siteConfig } from "../lib/config";

const tools = (await getCollection("tools")).map((e) => e.data);
const affiliateSlugs = Object.keys(siteConfig.affiliateUrls);
const affiliateNames = affiliateSlugs.map((slug) => tools.find((t) => t.slug === slug)?.name ?? slug);
---

<Base title="Disclosure" description="How this site is funded and which links, if any, are affiliate links.">
  <h1>Disclosure</h1>
  {
    affiliateNames.length === 0 ? (
      <p>
        This site currently has no affiliate, sponsorship or advertising relationships. Every link to a vendor is a
        plain link. If that changes, this page will list each relationship before the first such link goes live.
      </p>
    ) : (
      <>
        <p>
          Links to the following vendors are affiliate links. If you sign up through one of them, this site may earn a
          commission at no extra cost to you. Rankings and figures are not influenced by these relationships: every
          price comes from the vendor's own page and is dated.
        </p>
        <ul>{affiliateNames.map((n) => <li>{n}</li>)}</ul>
      </>
    )
  }
  <p>
    Data and verification are described in the <a href="/methodology/">methodology</a>.
  </p>
</Base>
```

- [ ] **Step 6: Run the full check**

Run: `npm run check`
Expected: typecheck 0 errors; all tests pass; build succeeds (with the placeholder `siteUrl` warning); `postbuild-assert: OK (51 state pages, 12 required files)`.

- [ ] **Step 7: Commit**

```bash
git add src/components/NewsletterForm.astro src/pages/index.astro src/pages/changelog.astro src/pages/methodology.astro src/pages/about.astro src/pages/disclosure.astro
git commit -m "feat: add home, changelog, methodology, about and disclosure pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 16: Documentation set

**Files:**
- Create: `README.md`, `docs/ROADMAP.md`, `docs/NEXT_STEPS.md`, `docs/DATA_PROVENANCE.md`, `docs/DEPLOY.md`
- Test: `tests/docs.test.ts`

**Interfaces:**
- Consumes: `CLAUDE.md` and `docs/SCOPE.md` (Task 1) which must remain unchanged.
- Produces: the documents a human or a future agent reads before touching anything.

- [ ] **Step 1: Write the failing docs test**

`tests/docs.test.ts`:
```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, root), "utf8");

const REQUIRED: Record<string, string[]> = {
  "CLAUDE.md": ["## Hard rules", "## Where things live"],
  "README.md": ["## Run", "## Data", "## Documents"],
  "docs/SCOPE.md": ["## In scope (v0.1)", "## Out of scope (v0.1)", "## Change control"],
  "docs/ROADMAP.md": ["## Why this slice", "## v0.1", "## v0.2", "## v0.3", "## Parking lot"],
  "docs/NEXT_STEPS.md": ["## Human-only steps", "## Agent steps", "## Never"],
  "docs/DATA_PROVENANCE.md": ["## Verification levels", "## Adding or re-verifying a row", "## Cadence", "## Backlog"],
  "docs/DEPLOY.md": ["## Cloudflare Pages", "## Custom domain", "## Alternatives"],
};

describe("documentation set", () => {
  for (const [file, headings] of Object.entries(REQUIRED)) {
    it(`${file} exists with its required sections`, () => {
      expect(existsSync(new URL(file, root)), file).toBe(true);
      const text = read(file);
      for (const h of headings) expect(text, `${file} missing "${h}"`).toContain(h);
    });
  }
  it("no document contains placeholder markers", () => {
    for (const file of Object.keys(REQUIRED)) {
      expect(read(file)).not.toMatch(/\bTBD\b|\bTODO\b|lorem ipsum/i);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/docs.test.ts`
Expected: FAIL on missing `README.md`, `docs/ROADMAP.md`, `docs/NEXT_STEPS.md`, `docs/DATA_PROVENANCE.md`, `docs/DEPLOY.md`.

- [ ] **Step 3: Write `README.md`**

````markdown
# SalesTax Engine (working title)

A static, sourced reference for software and digital-product sellers: US state economic-nexus thresholds,
public pricing of sales-tax compliance tools and merchants of record, and a wizard that compares your sales
with the thresholds and estimates annual cost per tool.

Every published figure links to the page it was read from and shows the date it was checked. Rows carry a
verification level and a review status that defaults to "not yet professionally reviewed".

## Run

Requires Node 22.

```bash
npm install
npm run dev        # local dev server
npm run check      # typecheck + tests + build + post-build assertions (run before any claim of "done")
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

## Data

| File | Contents |
|---|---|
| `data/us-economic-nexus.json` | 51 rows: 50 states + DC |
| `data/tools.json` | compliance software and merchants of record |
| `data/changelog.json` | every change to a published figure |
| `data/BACKLOG.md` | facts that could not be verified; never rendered |

Schemas live in `src/lib/schemas.ts`; a row without sources or a verified-on date fails the build.
How to add or re-verify a row: `docs/DATA_PROVENANCE.md`.

## Documents

- `CLAUDE.md`: rules for any agent working here. Read first.
- `docs/SCOPE.md`: what is in and out of v0.1; binding.
- `docs/ROADMAP.md`: why this slice, and what comes next with entry criteria.
- `docs/NEXT_STEPS.md`: ordered checklists for the human and for agents.
- `docs/DATA_PROVENANCE.md`: the verification standard and cadence.
- `docs/DEPLOY.md`: how to deploy.
- `docs/superpowers/specs/`: design specs. `docs/superpowers/plans/`: implementation plans.

## Configuration

Everything brand-specific lives in `site.config.ts`: site name, domain, owner contact, newsletter form URL,
affiliate URL map, reviewer. Empty values hide their UI.
````

- [ ] **Step 4: Write `docs/ROADMAP.md`**

```markdown
# Roadmap

## Why this slice

Decided 2026-10-06 after market research (figures below are from that research; third-party traffic numbers
are Similarweb/Semrush estimates).

- The original idea was a "Backlinko for taxes" blog monetised with ads. Research showed: tld-list.com, the model
  cited, runs no display ads and earns registrar affiliate commissions; display ads on Pakistan-geo traffic pay
  roughly $0.3 to $3.5 per 1,000 views; premium ad networks require 40 to 50 percent of traffic from the US, UK,
  Canada or Australia; small publishers lost about 60 percent of Google referrals year over year under AI
  Overviews; and Backlinko itself earned all revenue from courses sold to an email list.
- Among tax-adjacent niches, a comparison engine only works where many merchants pay recurring commissions on
  self-serve purchases and prices are public. US consumer tax software fails that test (affiliate earnings per
  click near zero, hidden prices). Crypto-tax software fits best as a pure comparison play but is seasonal and
  consumer-priced. Sales-tax and VAT compliance for software sellers was chosen because it is year-round, the buyer
  is a business, partner programs pay for 12 to 24 months or for life, two tiny independent sites already rank for
  "economic nexus threshold by state", and the dataset has a later API upsell.
- Comparison sites still standing in 2026 get 40 percent or more of visits direct and put a tool at the purchase
  moment; article-style review platforms lost 76 to 92 percent of organic traffic in two years. Hence: data tables
  plus a wizard, not articles.
- Founder constraint: Pakistan resident. Stripe and PayPal are unavailable; Paddle, Lemon Squeezy and Polar accept
  Pakistan-resident sellers; CJ, Awin and Amazon pay via Payoneer; many in-house affiliate programs pay by PayPal
  only, so each must be checked before it is relied on. IT-export income through a bank is taxed at a final 0.25
  percent for PSEB-registered exporters (extended to mid-2029). Affiliate commissions are not named in that statute.

## v0.1 (this build)

US economic-nexus dataset (51 rows), tools pricing dataset, US registration wizard with cost estimates, changelog,
methodology, about, disclosure, JSON endpoints, newsletter form (config-gated). Spec:
`docs/superpowers/specs/2026-10-06-salestax-engine-v0.1-design.md`.

Done when `npm run check` passes and the site is deployed on the real domain (human step).

## v0.2: international digital-services VAT/GST rows

Entry criteria, all required before a spec is written:
1. v0.1 live on the real domain for at least 30 days with hosting analytics enabled.
2. A written verification procedure for country rows using official sources only (tax authority or EU Commission
   pages), modelled on `docs/DATA_PROVENANCE.md`.
3. A decision on how seller location changes the wizard (EU-established vs non-EU seller; zero thresholds for
   non-resident digital sellers in many countries).

Scope sketch: one row per country with threshold, rate on digital services, registration mechanism, sources;
wizard extended with a seller-location input. Rows ship only when verified against an official source.

## v0.2 candidate: taxability of SaaS and digital goods by US state

Entry criterion: at least ten user requests via the report-error address, or search-demand evidence gathered
from Search Console after 60 days live.

## v0.3: partner programs

Entry criteria:
1. Site live at least 60 days.
2. Applications approved by the vendors concerned.
3. Payout method confirmed to work for a Pakistan resident (Payoneer or wire) before any URL is added.
4. Disclosure behaviour verified: the disclosure page lists each vendor automatically once its slug is in
   `site.config.ts`.

Scope: add affiliate URLs to `affiliateUrls` in `site.config.ts`. No code change.

## Later

- Paid dataset API for billing tools and fintechs. Entry: three inbound requests or one paying pilot.
- Per-tool pages. Entry: the tools table ranks on page one for at least one vendor pricing query.
- Filing frequency per state in the cost estimate. Entry: v0.2 shipped and a verified source for frequencies.

## Parking lot (not planned)

Puerto Rico row; local and home-rule tax rules (Colorado, Alabama, Louisiana, Alaska municipalities); notice-and-
report thresholds; marketplace facilitator rules; employer-of-record, LLC-formation and crypto-tax comparisons
(evaluated 2026-10-06 and set aside); articles or blog; user accounts; ads.
```

- [ ] **Step 5: Write `docs/NEXT_STEPS.md`**

```markdown
# Next steps

Two checklists. Do them in order. Each step says what "done" looks like. Nothing here adds scope; anything not
listed needs a spec first (see `docs/SCOPE.md`).

## Human-only steps

1. **Choose and buy the .com.** Then in `site.config.ts` set `siteName`, set `workingTitle: false`, and set
   `siteUrl` to `https://<your-domain>`. Done when `npm run build` prints no placeholder warning.
2. **Publish owner details.** Fill `owner.name`, `owner.email` (an address you are willing to publish) and
   `owner.location`. Done when the About page shows them and state pages show "Report an error".
3. **Create a GitHub repository and push `main`.** Done when `git remote -v` shows it and the push succeeds.
4. **Deploy** following `docs/DEPLOY.md` (Cloudflare Pages recommended), connect the domain, enable the host's web
   analytics. Done when `https://<your-domain>/sitemap-index.xml` loads over https.
5. **Register the property** in Google Search Console and Bing Webmaster Tools and submit the sitemap URL. Done when
   both consoles show the property verified.
6. **Newsletter.** Create an account with a form-based provider (Buttondown or Kit), copy the form action URL into
   `newsletterActionUrl`, redeploy. Done when a test subscription arrives in the provider.
7. **Reviewer workflow.** Agree with your Chartered Accountant brother how he reviews rows. When he has reviewed a
   row, he (or you on his written say-so) edits that row's `review` block to
   `{ "status": "reviewed", "by": "<his name, credential>", "on": "<date>" }` in a commit that changes nothing else,
   and you set `reviewer` in `site.config.ts`. Never mark a row reviewed without his review. Done when at least one
   row shows the reviewed badge.
8. **Re-verification calendar.** Create reminders: all nexus rows every six months and after state legislative
   sessions (most adjourn by June); tool pricing every quarter. Done when the reminders exist.
9. **Pakistan setup.** Open a Payoneer account; register with the Pakistan Software Export Board (freelancer or
   company); ask your bank how it codes inbound SaaS and affiliate receipts for the IT-export regime; confirm with
   your brother how the 0.25 percent final-tax regime and the 50 percent foreign-currency retention apply to you.
   Done when you have written answers to all three.
10. **Employer and SBP clearance.** Before launch, confirm in writing that your current employer, and SBP if you join
    it, permit this outside activity. Done when you have that confirmation.
11. **Partner programs (v0.3, not before day 60 live).** Apply to the vendors in `data/tools.json` that run partner
    programs; for each approval, confirm the payout method works for a Pakistan resident before adding the URL to
    `affiliateUrls`. Done when the disclosure page lists the vendor and the payout test succeeded.

## Agent steps

How to do routine maintenance without widening scope.

- **Re-verify a nexus row.** Follow `docs/DATA_PROVENANCE.md`: fetch the sources, compare, update figures only from
  fetched pages, set `verified_on` to today, add a `data/changelog.json` entry if any rendered figure changed, run
  `npm run check`, commit.
- **Add a tool row.** Fetch the vendor's pricing page; fill the row per the schema in `src/lib/schemas.ts`; keep the
  array sorted by name; add a changelog entry; run `npm run check`; commit.
- **Resolve a backlog item.** Fetch the official page named in the bullet; if it states the figure, update the row and
  move the bullet to `## Resolved` with the URL; otherwise leave it open.
- **Change copy.** Pages live in `src/pages/`; components in `src/components/`. Copy must never claim review or
  verification that the data does not carry.
- **Before saying "done".** Run `npm run check` and paste its final lines in your report.

## Never

- Never type a figure from memory. Never set `review.status` to `"reviewed"`. Never add affiliate URLs anywhere
  but `site.config.ts`. Never add a feature, page type, dataset or dependency without a new spec.
```

- [ ] **Step 6: Write `docs/DATA_PROVENANCE.md`**

```markdown
# Data provenance

This is the standard every data row follows. The schemas in `src/lib/schemas.ts` enforce the parts that can be
enforced mechanically; this document covers the rest.

## Principles

1. A figure (threshold, transaction count, fee, rate, effective date) enters a data file only if it was read on a
   page fetched during the task that added it. Nothing is typed from memory.
2. Every page that supplied information is listed in `sources` with `accessed_on`.
3. A row's `verification.verified_on` is the date its figures were last checked.
4. A row's `review` block starts as unreviewed and is changed only by the human reviewer.
5. If a figure cannot be verified, the row says so (`pending`) and shows no figure. A visible gap is preferred to a
   plausible guess.

## Verification levels

| Level | Meaning |
|---|---|
| `official` | The jurisdiction's own tax-department page (or the vendor's own pricing page) was fetched and states the figure. Where secondary sources disagree, the official page decides. |
| `corroborated` | Two independent secondary sources were fetched and agree on threshold amount, transaction threshold and rule. |
| `single_secondary` | Only one secondary source could be fetched or stated the figure. Rendered with a caution badge. |
| `pending` | Nothing reachable states the figure, or sources conflict and no official page was reachable. Figures are null; nothing is rendered but the label. |

Secondary sources used for US thresholds: the Sales Tax Institute economic-nexus state guide and Avalara's
state-by-state economic-nexus guide. Others may be added if they are independent and dated.

## Adding or re-verifying a row

1. Fetch the official page where reachable (start from the department domain; cite only the page that states the
   figure). Fetch at least one secondary source; two for `corroborated`.
2. Compare. Threshold or rule conflict without an official page: mark `pending`, log in the backlog. Conflict on a
   non-threshold field only (measurement period, effective date, which sales count, marketplace inclusion): keep the
   threshold, set that field to null, log in the backlog.
3. Set `comparator` only when a fetched source uses explicit wording ("more than" / "exceeds" ⇒ `exceeds`;
   "or more" / "at least" ⇒ `meets_or_exceeds`); otherwise null.
4. Record every page used in `sources` with today's `accessed_on`; set `verified_on` to today.
5. If any rendered figure changed, prepend an entry to `data/changelog.json` with the source URL.
6. Run `npm run check`. Fix the row, never the schema, until it passes. Commit.

## Tools rows

The vendor's own pricing page is the only acceptable source and makes the row `official`. If it shows no prices,
the row is `quote_only` with every numeric field null. Do not take prices from third-party review sites.

## Cadence

- US nexus rows: all rows at least every six months, and a pass after state legislative sessions (most adjourn by
  June) for states known to have pending bills.
- Tool rows: quarterly.
- Backlog: reviewed at each cadence pass; resolve or carry forward.

## Backlog

`data/BACKLOG.md` holds facts that were seen but not accepted. One bullet per fact under `## Open`:

`- [dataset/subject] Claim: ... | Where seen: <url> | Why not accepted: ... | What would verify it: ...`

When resolved, move the bullet under `## Resolved` and append `| Resolved: <date>, <url>`. The backlog is never read
by the build and never rendered.
```

- [ ] **Step 7: Write `docs/DEPLOY.md`**

```markdown
# Deploy

The site is static. `npm run build` writes `dist/`. Any static host works; Cloudflare Pages is recommended because
its free tier includes Web Analytics with no code on the page.

## Before the first deploy

1. `site.config.ts`: real `siteUrl`, `siteName`, `workingTitle: false`, owner details.
2. `npm run check` passes locally with no placeholder warning.
3. The repository is pushed to GitHub (or GitLab).

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
```

- [ ] **Step 8: Run the docs test and the full check**

Run: `npx vitest run tests/docs.test.ts && npm run check`
Expected: docs test PASS; full check PASS.

- [ ] **Step 9: Commit**

```bash
git add README.md docs/ROADMAP.md docs/NEXT_STEPS.md docs/DATA_PROVENANCE.md docs/DEPLOY.md tests/docs.test.ts
git commit -m "docs: add README, roadmap, next steps, provenance standard and deploy guide

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 17: Final verification and release tag

**Files:**
- Modify: `docs/superpowers/specs/2026-10-06-salestax-engine-v0.1-design.md` (status line only)

- [ ] **Step 1: Run the complete check from a clean install**

```bash
rm -rf node_modules dist .astro
npm ci
npm run check
```
Expected: `npm ci` succeeds from the lock file; typecheck 0 errors; all tests pass; build succeeds; `postbuild-assert: OK (51 state pages, 12 required files)`.

- [ ] **Step 2: Review the working tree for leftovers**

```bash
git status --porcelain
grep -rn "TODO\|TBD\|FIXME" src data docs/*.md CLAUDE.md README.md || echo "no placeholders"
```
Expected: empty `git status`; "no placeholders".

- [ ] **Step 3: Record the verification summary**

Count rows per verification level and append the result to the task report:
```bash
node -e 'const r=require("./data/us-economic-nexus.json");const c={};for(const x of r)c[x.verification.level]=(c[x.verification.level]||0)+1;console.log(c, r.length)'
node -e 'const t=require("./data/tools.json");console.log(t.length, t.filter(x=>x.pricing_public).length, "with public pricing")'
```

- [ ] **Step 4: Mark the spec as implemented and tag**

In the spec, change the line `Status: approved design, awaiting written-spec review` to
`Status: implemented in v0.1.0 (see docs/superpowers/plans/2026-10-06-salestax-engine-v0.1.md)`.

```bash
git add docs/superpowers/specs/2026-10-06-salestax-engine-v0.1-design.md
git commit -m "docs: mark v0.1 spec as implemented

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git tag -a v0.1.0 -m "SalesTax Engine v0.1.0: sourced US nexus dataset, tools pricing, wizard"
```

Report: the final `npm run check` output lines, the level counts, the vendor count, and anything left in `data/BACKLOG.md`.
