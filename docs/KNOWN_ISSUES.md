# Known issues (v0.1.0)

Deferred findings from the per-task and final reviews of the v0.1 build (2026-10-06/07). None changes a published figure. Each line names the task review that raised it. Fix them under the normal change-control rule in `docs/SCOPE.md`: data wording fixes need no spec; UI or engine changes that alter behaviour do.

## Parked after the final review

- isOfficialHost guard accepts .us/.state. hosts beyond .gov/arsstc.org
- parseMoney strips internal whitespace so "12 50" → 1250
- home count says "4 with no statewide sales tax" while AK also has none at state level (counts partition 51 rows correctly)
- wizard unreviewed badge hard-coded rather than data-driven
- long level labels in nowrap badges on narrow screens
- wizard DOM logic has no automated test.

## Deferred during task reviews

- Task 1: outboundUrl uses ?? so an empty-string affiliate entry renders href="" (src/lib/config.ts:31); fix with ?.trim() || websiteUrl plus test.
- Task 1: hasOwnerDetails ignores owner.location while the site.config comment says "all empty => hidden"; align comment or logic.
- Task 1: engines.node ">=22" looser than @astrojs/compiler-rs ">=22.12.0".
- Task 1: displayName() default-argument branch untested.
- Task 1: CLAUDE.md/SCOPE.md reference docs created in Task 16 (expected).
- Task 1: robotsTxt resolves against siteUrl, so a siteUrl with a path component resolves differently with/without trailing slash (bare domains only in v0.1).
- Task 2: thin branch coverage on several refinements (sales_only null sales, and-rule, none with tx only, non-quote with pricing_public false, reviewed positive case, other URL fields, percent_fee > 100, verified_on required).
- Task 2: non-pending row with has_state_sales_tax true, rule none, null thresholds passes with a source (figureless loophole for data tasks; data tasks are instructed never to use it).
- Task 2: export naming (comparator/salesMeasure include .nullable(), thresholdRule does not); extra enum exports beyond the interface list.
- Task 2: finiteNumber redundant under zod 4.
- Task 3: astro check hint: z.string().url() deprecated in zod 4.6 (src/lib/schemas.ts:25); consider z.url() or the URL-constructor refine.
- Task 3: duplicate code/slug rows overwrite silently in the file loader (Task 11 invariants assert uniqueness; covered there).
- Task 3: id parsers throw bare TypeError on non-array JSON; schema gate still fails the build.
- Task 3: the two JSON endpoints are near-identical (plan-mandated); shared helper possible.
- Task 3: endpoint output lacks trailing newline.
- Task 4: parseMoney strips commas anywhere, so "12,50" → 1250 (100x silent mis-parse); tighten to ^\d{1,3}(,\d{3})*(\.\d+)?$|^\d+(\.\d+)?$ or echo parsed values back in the wizard.
- Task 4: parseMoney/parseCount unbounded: 400 digits → Infinity, fmtUsd(Infinity) → "$∞"; guard with Number.isFinite / isSafeInteger.
- Task 4: levelLabel("corroborated") says "two sources" while schema enforces ≥1; align copy with the procedure (two agreeing secondaries) or say "multiple".
- Task 4: `?? 0` fallbacks in formatPricing would print fabricated $0 on invalid data (dead on schema-valid data).
- Task 4: comparator prefix applies only to the first figure on or/and rules; ".5" rejected; "None recorded" branch untested; thin tests on slug punctuation, fmtUsd rounding, formatPricing branches; duplicated literals.
- Task 5: validate tests lack Infinity/-0/empty-lines/multi-error cases; transactions-error assertions weak; redundant CODE regex vs known set; seen.add on invalid path; CAVEATS not frozen at runtime; MeasureOutcome unused until Task 6.
- Task 6: result-field assertions thin (thresholds/comparator/period never asserted); validation-error test asserts only ok=false; empty-lines totalTransactions semantics untested; fallback "not enough data" message names no input (unreachable on valid data); and-rule all-at untested; ThresholdStatus could be Extract<StateStatus,…>; local fn named describe.
- Task 7: per_jurisdiction_month R=0 untested; percent_plus_fixed with null fixed fee and undefined T untested; rounding test does not pin half-up; spurious "fee of $0 omitted" note when fixed_fee_usd is exactly 0; constant test trivial.
- Task 8: KS note quotes TaxJar's 2021 transitional clause rather than the ongoing clause; CT measurement_period nulled over TaxJar's garbled cell though STI and Avalara agree verbatim; AZ comparator left null while KS comparator taken from TaxJar's cell (inconsistent policy); backlog wording "no official page reachable" where the domain was reachable but silent; BACKLOG header lists a "Where seen" field the bullet template lacks.
- Task 8: AK effective_date 2025-01-01 is the Code amendment date; municipal adoption can start later (notes say so); consider the state-page label wording.
- Task 9: NY effective_date decision explained only in notes (add bullet); NJ notes understate official marketplace wording; MA marketplace qualifier lacks a bullet; MN measurement-period wording gap (STI precise vs Avalara/TaxJar loose) lacks a bullet; KY 2018 notice cited only in notes/backlog, not sources (defensible).
- Task 12: Avalara row records the $69/state/month SST-qualified headline; notes should state "for qualified sellers" and the $79 standard price, or the row should use 79, otherwise the estimate understates cost for non-SST sellers.
- Task 12: Creem needs creem.io root as sources[1] for the US flag; Polar should cite the MoR docs page naming "US Sales Tax" and fix the root title; Creem "$0" quotes join label and value; TaxCloud note "19 per month" should read "$19"; report omitted npm run check output; tools-invariants.test.ts must be folded into invariants.test.ts in Task 11.
- Task 10: WA bullet/notes omit TaxJar's "Prior to March 14, 2019" sentence; RI measurement-period precision gap lacks a bullet; OH sales-measure conflict may be only apparent (retail = gross minus resale).
- Task 11: pending-branch of the null-figures test never runs (0 pending rows); row count asserted via constant rather than literal 51; localeCompare locale-dependent; JSON parsed at collection time for two blocks; same-day changelog ordering undetectable; Where-seen URLs duplicate Claim URLs.
- Task 13: compiler drops whitespace before inline links ("·Download JSON", "See themethodology"); sales_measure rendered as raw enum; meta description odd for no-sales-tax states; registration link lacks rel=nofollow; notes render on pending rows; table a11y (scope=col, caption, new-tab hint); localeCompare without locale; replace("_"," ") first-only.
- Task 15: reviewer paragraph on About sits inside the owner block, so a configured reviewer is hidden while owner name and email are empty (NEXT_STEPS orders owner details first).
- Task 15: whitespace dropped before inline links on home ("works:methodology") and in Base.astro footer ("see themethodology"); changelog copy says every change has a source while 3 rows show "—"; About sentence can start with ". Contact:" when only email set; About/Disclosure meta descriptions promise sections the body may omit; reviewer paragraph nested in owner block and shows before any row is reviewed; disclosure lists empty-URL affiliate keys; disclosure non-empty copy mentions "rankings"; same-date changelog order relies on collection order; changelog table a11y (aria-label on "source", caption, scope); newsletter input lacks autocomplete="email"; methodology never says "quarterly" (says 4 filings per year).
- Task 14: row `notes` leak developer text "(see data/BACKLOG.md)" into wizard results and state pages (26 rows); default blank line blocks the home-state-only path until removed (skip fully blank lines); "quarterly" never stated (says 4 filings per year); Add-a-state does not clear stale results.
- Task 14: per-line controls share generic labels; role=alert + aria-live=polite conflict; no focus move on results; level shown by colour only in ToolsTable; affiliate links will need rel=sponsored later; duplicate-state error lacks line number (engine); MoR note says "every line" when there are no lines; r.code unescaped in options (schema-safe).
- Task 16: step 9 "all three" vs four actions; step 1 done-condition tests only siteUrl; Resolved-bullet format drift vs BACKLOG; no worked example for the curl/strip/quote-check step and no script shipped; SCOPE↔ROADMAP fence gap for some out-of-scope items; README overclaims "a row without sources fails the build" (pending rows exempt); ROADMAP research/tax figures unsourced in-repo; docs test thin; stale-official vs official-decides cross-reference.
- Task 16: new bullet says department domains are in DATA_PROVENANCE 'or the plan' (only the plan has the table); older 'Resolve a backlog item' bullet still says 'the official page named in the bullet'.
