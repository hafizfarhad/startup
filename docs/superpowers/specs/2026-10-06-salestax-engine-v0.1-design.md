# SalesTax Engine v0.1 — Design Spec

Status: implemented in v0.1.0 (see docs/superpowers/plans/2026-10-06-salestax-engine-v0.1.md)
Date: 2026-10-06
Working title: "SalesTax Engine" (rename in `site.config.ts` once the real .com is bought)
Supersedes: nothing (first spec)

---

## 1. Purpose

A static, data-driven website for software and digital-product sellers that answers one question
for the United States: **in which states does my sales volume create an economic-nexus registration
obligation, and what would each compliance tool or merchant of record charge to handle it?**

It is the first slice of a larger idea (country-by-country indirect-tax rules plus tool comparison)
chosen after market research on 2026-10-06. The research verdict and the reasons for picking this
slice are summarized in `docs/ROADMAP.md`; they are not repeated here.

### 1.1 Who it is for

- Founders and finance leads of SaaS / digital-product companies selling into US states.
- Secondary: accountants advising those sellers; developers integrating tax tooling.

### 1.2 Success criteria for v0.1

1. `npm run check` passes: typecheck, unit tests, data invariants, production build, post-build assertions.
2. Every rendered data row has at least one source URL and a verified-on date (enforced by schema).
3. The wizard returns the correct status for every engine test case, including edge cases.
4. The site contains **no** claim the data was professionally reviewed until a row's review block says so.
5. A new agent can read `CLAUDE.md`, `docs/SCOPE.md`, `docs/NEXT_STEPS.md` and continue without widening scope.

### 1.3 Brief as agreed with the owner

Owner said: build the primary idea here; do not hallucinate; do not scope-creep; write next steps so a
future agent does not scope-creep either; do next steps properly and exactly.

Owner chose (2026-10-06): US first, international rows deferred to v0.2; stack Astro + TypeScript.

Agreed assumptions:
- Unverifiable facts are excluded from the site and listed in `data/BACKLOG.md`, never shown as fact.
- No "reviewed by a Chartered Accountant" claim until the reviewer actually marks rows reviewed.
- No affiliate links at launch (no program has approved the owner). Vendor links are plain; one config
  map swaps in affiliate URLs later; a disclosure page exists from day one.
- Newsletter capture renders only when a provider URL is configured. The agent cannot create that account.
- The agent cannot buy the domain or connect hosting. Deliverable is a build-ready static site plus exact
  deploy steps in `docs/DEPLOY.md`.

---

## 2. Scope

### 2.1 In scope (v0.1)

| # | Item |
|---|------|
| 1 | US economic-nexus dataset: 50 states + DC = exactly 51 rows. States with no statewide sales tax (AK*, DE, MT, NH, OR) are explicit rows. *Alaska has no state sales tax but has a statewide remote-seller regime via local jurisdictions; it is modelled as `has_state_sales_tax: false` with the local-regime facts in `notes` and, if verified, the threshold fields filled and `threshold_rule` set accordingly. |
| 2 | Tools dataset: US sales-tax compliance software and merchants of record, with public pricing where it exists. |
| 3 | Registration wizard for US sales with per-tool annual cost estimate. |
| 4 | Pages: home, nexus table, one page per jurisdiction (51), tools table, wizard, changelog, methodology, about, disclosure. |
| 5 | JSON endpoints serving the validated datasets. |
| 6 | Newsletter form (config-gated), sitemap, robots.txt. |
| 7 | Documentation set (section 11) and this spec. |

### 2.2 Out of scope (v0.1) — each is a roadmap item, not a feature to slip in

- International VAT/GST rows and seller-location logic (v0.2).
- Taxability of SaaS / digital goods by state (v0.2 candidate).
- Per-tool detail pages, articles/blog, guides prose beyond the methodology page.
- User accounts, saved results, paid API, server-side code, databases.
- Affiliate links, sponsorships, ads, analytics scripts (hosting-level analytics is a deploy step, not code).
- Filing-frequency per state (the wizard uses a stated assumption instead).
- Multi-language, dark mode toggles, design systems, UI frameworks.

### 2.3 Change control

Any addition to section 2.1 requires a new spec under `docs/superpowers/specs/` and a roadmap entry
before code is written. This rule is restated in `CLAUDE.md` and `docs/SCOPE.md`.

---

## 3. Architecture

- **Static site**: Astro (current major on npm at build time), `output: 'static'`. No SSR, no adapters.
- **Language**: TypeScript everywhere (`strict: true`).
- **Data**: JSON files in `data/`, loaded as Astro content collections with the file loader and validated by
  Zod schemas in `src/content.config.ts`. A row that violates the schema fails `astro build`.
- **Engine**: pure TypeScript functions in `src/lib/engine/` with no DOM or Astro imports, so they are unit-testable
  and later reusable by an API without change.
- **Wizard UI**: one client script (`src/components/wizard/wizard-client.ts`) that imports the engine and the
  datasets serialized into the page. No framework.
- **Styling**: one plain CSS file, mobile-first, system font stack.
- **Tests**: Vitest. Build verification via npm scripts.
- **Hosting**: any static host. Recommended Cloudflare Pages (free tier, built-in Web Analytics without code).

### 3.1 Directory layout

```
startup/
  CLAUDE.md
  README.md
  package.json  astro.config.mjs  tsconfig.json  vitest.config.ts
  site.config.ts
  data/
    us-economic-nexus.json
    tools.json
    changelog.json
    BACKLOG.md
  src/
    content.config.ts
    lib/
      engine/
        types.ts          shared types
        nexus.ts          evaluateState(), evaluateAll()
        cost.ts           estimateToolCosts()
        validate.ts       input validation helpers
        index.ts          barrel
      slug.ts             jurisdiction slug helper
      config.ts           re-export of site.config with derived values
    components/
      Badges.astro        verification + review badges
      SourceList.astro
      NexusTable.astro
      ToolsTable.astro
      NewsletterForm.astro
      ReportError.astro
      wizard/
        Wizard.astro
        wizard-client.ts
    layouts/Base.astro
    pages/
      index.astro
      us/economic-nexus/index.astro
      us/economic-nexus/[slug].astro
      tools/index.astro
      wizard.astro
      changelog.astro
      methodology.astro
      about.astro
      disclosure.astro
      data/us-economic-nexus.json.ts
      data/tools.json.ts
    styles/global.css
  public/robots.txt
  tests/
    engine/nexus.test.ts
    engine/cost.test.ts
    engine/validate.test.ts
    data/schemas.test.ts
    data/invariants.test.ts
  scripts/
    postbuild-assert.mjs   counts pages and endpoints in dist/
  docs/
    SCOPE.md  ROADMAP.md  NEXT_STEPS.md  DATA_PROVENANCE.md  DEPLOY.md
    superpowers/specs/  superpowers/plans/
```

---

## 4. Configuration (`site.config.ts`)

```ts
export const siteConfig = {
  siteName: "SalesTax Engine",
  workingTitle: true,              // while true, UI appends "(working title)"
  siteUrl: "https://example.com",  // replace with the real domain before first deploy
  tagline: "US economic-nexus thresholds and compliance-tool pricing, sourced and dated.",
  owner: { name: "", email: "", location: "" },  // all empty => About details and Report-error link hidden
  newsletterActionUrl: "",         // empty => newsletter form not rendered
  affiliateUrls: {} as Record<string, string>,   // tool slug => affiliate URL; empty => plain website links
  reviewer: { name: "", credential: "" },        // shown only on rows whose review.status === "reviewed"
};
```

Rules:
- All brand text and URLs come from this file. No other file hardcodes the site name or domain.
- `siteUrl` must be an absolute https URL; build warns (not fails) while it equals the placeholder.
- Empty strings hide the dependent UI; nothing renders a placeholder like "TODO" or "Your name here".

---

## 5. Data model

All dates are ISO `YYYY-MM-DD`. All URLs are absolute `https://`. Money is in USD as plain numbers.

### 5.1 Shared blocks

```ts
Source = { url: string; publisher: string; title: string; accessed_on: Date }
Verification = { level: "official" | "corroborated" | "single_secondary" | "pending"; verified_on: Date }
Review = { status: "unreviewed" | "reviewed"; by: string | null; on: Date | null }
```

- `official`: the jurisdiction's own government page (or vendor's own pricing page) was fetched and agrees.
- `corroborated`: at least two independent secondary sources were fetched and agree.
- `single_secondary`: one secondary source only. Renders with a caution badge.
- `pending`: nothing verifiable was reachable. Renders as "verification pending" with **no figures**.
- `review.status === "reviewed"` requires non-null `by` and `on`.

### 5.2 US economic-nexus row (`data/us-economic-nexus.json`, array)

| Field | Type | Rule |
|---|---|---|
| `code` | string | USPS 2-letter code, `DC` allowed; unique |
| `name` | string | official state name |
| `has_state_sales_tax` | boolean | |
| `sales_threshold_usd` | number \| null | null when none |
| `transactions_threshold` | integer \| null | null when none |
| `threshold_rule` | `"sales_only" \| "sales_or_transactions" \| "sales_and_transactions" \| "none"` | |
| `comparator` | `"exceeds" \| "meets_or_exceeds" \| null` | null when the source does not state it |
| `sales_measure` | `"gross" \| "taxable" \| "retail" \| null` | which sales count toward the threshold |
| `measurement_period` | string \| null | as the source phrases it |
| `includes_marketplace_sales` | boolean \| null | |
| `effective_date` | Date \| null | |
| `registration_url` | URL \| null | |
| `notes` | string | may be empty |
| `sources` | Source[] | min 1 unless `verification.level === "pending"` |
| `verification` | Verification | required |
| `review` | Review | required |

Schema refinements (build fails if violated):
- `has_state_sales_tax === false` ⇒ `threshold_rule === "none"` and both thresholds null, **except** a row may carry
  thresholds with `has_state_sales_tax === false` only when `notes` is non-empty (Alaska local regime case).
- `threshold_rule === "sales_only"` ⇒ `sales_threshold_usd` non-null and `transactions_threshold` null.
- `threshold_rule` involving transactions ⇒ both thresholds non-null.
- `threshold_rule === "none"` ⇒ both thresholds null.
- `verification.level === "pending"` ⇒ both thresholds null, `comparator` null, `measurement_period` null.
- `verified_on` and every `accessed_on` ≤ build date.

### 5.3 Tool row (`data/tools.json`, array)

| Field | Type | Rule |
|---|---|---|
| `slug` | string | kebab-case, unique |
| `name` | string | |
| `category` | `"compliance_software" \| "merchant_of_record"` | |
| `website_url` | URL | |
| `pricing_model` | `"per_filing" \| "per_jurisdiction_month" \| "percent_plus_fixed" \| "tiered_subscription" \| "quote_only"` | |
| `pricing_public` | boolean | false ⇔ `quote_only` |
| `pricing.registration_fee_usd` | number \| null | |
| `pricing.filing_fee_usd` | number \| null | required for `per_filing` |
| `pricing.per_jurisdiction_month_usd` | number \| null | required for `per_jurisdiction_month` |
| `pricing.percent_fee` | number \| null | percent, e.g. `5` = 5 %; required for `percent_plus_fixed` |
| `pricing.fixed_fee_usd` | number \| null | per transaction; optional for `percent_plus_fixed` |
| `pricing.starting_monthly_usd` | number \| null | required for `tiered_subscription` |
| `pricing.pricing_url` | URL \| null | |
| `us_sales_tax_supported` | boolean | |
| `notes` | string | |
| `sources`, `verification`, `review` | as 5.1 | `quote_only` rows still need ≥1 source (the pricing page or docs that show no public price) |

`quote_only` ⇒ all numeric pricing fields null. Affiliate URLs are **not** in this file; they live only in `site.config.ts`.

### 5.4 Changelog entry (`data/changelog.json`, array, newest first)

`{ date: Date; dataset: "us-economic-nexus" | "tools" | "site"; subject: string; change: string; source_url: URL | null }`

### 5.5 Backlog (`data/BACKLOG.md`)

Markdown list. One bullet per unverified or conflicting fact: what was claimed, where, why it was not accepted,
what would verify it. Never read by the build.

---

## 6. Data verification standard

Applied during the v0.1 build and on every later edit (details and cadence in `docs/DATA_PROVENANCE.md`):

1. For each jurisdiction, fetch the state revenue department's remote-seller page where reachable and at least one
   reputable aggregator (e.g., Sales Tax Institute economic-nexus state guide, Avalara state guide, TaxJar/Stripe/
   Anrok/Numeral state guides). Record every page actually fetched as a `Source` with `accessed_on`.
2. Assign `verification.level` per section 5.1. Two secondary sources that disagree ⇒ do not render a figure:
   use the official page if reachable, otherwise mark `pending` and record the conflict in `BACKLOG.md`.
3. For tools, the vendor's own pricing page is the official source. If it shows no prices, the row is `quote_only`.
4. A figure is never typed from memory. If it cannot be fetched, it is `pending`.
5. Every change to a rendered figure gets a `changelog.json` entry and bumps the row's `verified_on`.

---

## 7. Engine (wizard logic)

### 7.1 Inputs

```ts
WizardInput = {
  homeState: string | null;                      // USPS code or null
  lines: { code: string; grossSalesUsd: number; transactions?: number }[];  // one per state entered
}
```
Validation: codes must exist in the dataset; `grossSalesUsd` finite and ≥ 0; `transactions` integer ≥ 0 if present;
duplicate codes rejected. Invalid input yields a typed error list, never a throw.

### 7.2 Per-state status

Statuses: `no_state_sales_tax | physical_presence | insufficient_data | registration_likely_required |
at_threshold_check_wording | below_threshold`.

Evaluated in this order; the first matching step decides:

1. `no_state_sales_tax` — row has `has_state_sales_tax === false` **and** `threshold_rule === "none"`.
2. `physical_presence` — `code === homeState`. Thresholds are not evaluated; message says registration is generally
   required where you have physical presence.
3. `insufficient_data` — row `verification.level === "pending"`, or `threshold_rule === "none"` on a row that has a
   sales tax (no economic-nexus rule recorded).
4. Threshold evaluation. First classify each measure the rule uses as one of `trigger | at | below | unknown`:
   - value missing (transactions not supplied) ⇒ `unknown`;
   - comparator `exceeds`: value > threshold ⇒ `trigger`, else `below` (equality is `below`);
   - comparator `meets_or_exceeds`: value ≥ threshold ⇒ `trigger`, else `below`;
   - comparator `null`: value > threshold ⇒ `trigger`; value == threshold ⇒ `at`; else `below`.
   The row's single `comparator` applies to both the sales and the transactions measure.
   Then combine:
   - `sales_only`: the sales outcome maps directly (`trigger`⇒`registration_likely_required`,
     `at`⇒`at_threshold_check_wording`, `below`⇒`below_threshold`).
   - `sales_or_transactions`: any `trigger` ⇒ `registration_likely_required`; else any `at` ⇒
     `at_threshold_check_wording`; else any `unknown` ⇒ `insufficient_data`; else `below_threshold`.
   - `sales_and_transactions`: any `below` ⇒ `below_threshold`; else any `unknown` ⇒ `insufficient_data`;
     else all `trigger` ⇒ `registration_likely_required`; else `at_threshold_check_wording`.

Each result carries: status, the rule and thresholds applied, `measurement_period`, `sales_measure`, caveats
(fixed strings: nexus ≠ taxability; marketplace sales may count differently; thresholds are measured over the state's
period, not your fiscal year), and the row's sources and verification level. `insufficient_data` results say which
input would resolve them (e.g., "enter a transaction count").

### 7.3 Cost estimate

Let `R` = number of states with status `registration_likely_required` or `physical_presence`,
`S` = total gross sales across the lines entered, `T` = total transactions across the lines entered (undefined if any line omitted it).
Assumption constant `FILINGS_PER_STATE_PER_YEAR = 4` (quarterly), displayed on the page.

| pricing_model | Annual estimate |
|---|---|
| `per_filing` | `R × (registration_fee_usd ?? 0) + R × 4 × filing_fee_usd`; note when registration fee is null |
| `per_jurisdiction_month` | `R × per_jurisdiction_month_usd × 12` |
| `tiered_subscription` | `starting_monthly_usd × 12`, labelled "from" |
| `percent_plus_fixed` | `percent_fee/100 × S + (fixed_fee_usd ?? 0) × T`; if `T` undefined, omit the fixed part and say so |
| `quote_only` | no number; "custom quote" |

Rules: `R === 0` ⇒ compliance-software estimates are 0 with the note "no registrations indicated"; MoR estimates
still compute from `S`. Round to whole dollars. Every figure is labelled "estimate" and excludes state registration
fees, back taxes, penalties and interest. The page states that merchants of record replace, rather than add to,
a seller's own registrations.

---

## 8. Pages and UI

| Route | Content |
|---|---|
| `/` | Pitch, counts (jurisdictions, tools), link to wizard, newsletter form (gated) |
| `/us/economic-nexus/` | Full table: state, threshold(s), rule, measurement period, effective date, verification badge, link |
| `/us/economic-nexus/[slug]/` | One page per row; slug = lowercase name, spaces→hyphens (`new-york`, `district-of-columbia`). All fields, sources, badges, registration link, report-error link (gated) |
| `/tools/` | Table of all tool rows grouped by category; pricing figures or "custom quote"; outbound link = affiliate URL if configured else website |
| `/wizard/` | Form (home state, add-a-state lines) → results table + cost table; no page reload; URL-shareable state is **not** in scope |
| `/changelog/` | Entries newest first |
| `/methodology/` | Verification levels, review status meaning, update cadence, disclaimer "not tax advice", how to report errors |
| `/about/` | Who runs the site (from config; hidden fields omitted), what it is for |
| `/disclosure/` | States current affiliate relationships truthfully: none at launch; auto-lists configured affiliate slugs when present |
| `/data/us-economic-nexus.json`, `/data/tools.json` | Validated datasets, pretty-printed |
| `/sitemap-index.xml`, `/robots.txt` | Standard |

UI rules: every data page shows verified-on date, verification badge, review badge ("Not yet professionally reviewed"
unless reviewed), and sources. Caution badge for `single_secondary`. "Verification pending" state pages show no figures.
Working-title suffix while `workingTitle` is true. Plain CSS, readable at 360 px width, no horizontal scroll except
inside tables, which scroll horizontally within their container.

---

## 9. Error handling

- Build: schema violations, duplicate codes/slugs, wrong row count, future dates ⇒ build fails with the offending row identified.
- Engine: returns `{ ok: false, errors: [...] }` on invalid input; never throws to the UI.
- UI: inline validation messages; disabled submit until the form is valid; results cleared on input change.
- Config: empty values hide sections; placeholder `siteUrl` logs a build warning.
- No runtime fetches, so no network error states exist beyond the newsletter form's native POST.

---

## 10. Testing

Test-first for the engine and schemas. Vitest in `tests/`.

- `engine/nexus.test.ts`: each rule × trigger/no-trigger; comparator `exceeds` vs `meets_or_exceeds` vs null at exact
  threshold; no-sales-tax state; home state; pending row; missing transactions in each rule; duplicate/invalid codes.
- `engine/cost.test.ts`: each pricing model; `R = 0`; missing `T` for MoR; rounding; null registration fee note.
- `engine/validate.test.ts`: input validation matrix.
- `data/schemas.test.ts`: fixture rows that must pass and must fail for each refinement in sections 5.2–5.4.
- `data/invariants.test.ts` (runs against real data): exactly 51 nexus rows; unique codes and slugs; all URLs https;
  no `verified_on`/`accessed_on` in the future; no rendered figure on `pending` rows; `quote_only` rows have null prices.
- `npm run check` = `astro check` + `vitest run` + `astro build` + `node scripts/postbuild-assert.mjs`
  (asserts 51 state pages, both JSON endpoints, sitemap present).

---

## 11. Documentation set

| File | Purpose |
|---|---|
| `CLAUDE.md` | Agent rules: read `docs/SCOPE.md` first; no feature without a new spec; no row without sources; never type a figure from memory; run `npm run check` before claiming done; where things live |
| `README.md` | What the project is, how to run, test, build, where data lives, link to docs |
| `docs/SCOPE.md` | Sections 2.1–2.3 of this spec in standalone form |
| `docs/ROADMAP.md` | Why this slice was chosen (research summary with dates), v0.2 and v0.3 definitions with entry criteria, parking lot |
| `docs/NEXT_STEPS.md` | Two ordered checklists: **Human only** (domain, config, deploy, newsletter provider, reviewer workflow, partner-program applications, PSEB registration, employer clearance) and **Agent** (how to add/re-verify a row, add a tool, add a changelog entry, run checks). Each step states its done-condition |
| `docs/DATA_PROVENANCE.md` | Section 6 in full, re-verification cadence (all rows at least every 6 months and after each state legislative session; tools quarterly), backlog format |
| `docs/DEPLOY.md` | Cloudflare Pages steps (build `npm run build`, output `dist`, Node 22), Netlify/Vercel equivalents, custom domain, enable hosting analytics |

---

## 12. Deployment

Static `dist/`. Node 22. No environment variables are required by the build. Recommended host: Cloudflare Pages.
The agent does not deploy; `docs/DEPLOY.md` gives exact steps for the human.

---

## 13. Items only the human can do (tracked in `docs/NEXT_STEPS.md`)

Buy the domain and set `siteUrl`; fill `owner`; create a newsletter provider account and set `newsletterActionUrl`;
set up the reviewer workflow with the Chartered Accountant (edit a row's `review` block in a reviewed commit);
apply to partner programs (v0.3) and confirm payout methods work for a Pakistan resident before linking;
register with PSEB; confirm employer / SBP rules on outside business before launch.
