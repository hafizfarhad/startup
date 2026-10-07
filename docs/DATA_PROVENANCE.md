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

## Field definitions

- `effective_date` is the date the CURRENTLY STATED threshold and rule took effect. When a cited source states a later
  change (for example a transaction threshold removed on a date), that later date is used and the original law date is
  kept in `notes`. When sources conflict on that date, the field is null and a backlog bullet records both values. The
  site labels this column "Current rule since".
- `comparator` is set only from explicit wording in a source's threshold text ("more than" or "exceeds" ⇒ `exceeds`;
  "or more" or "at least" ⇒ `meets_or_exceeds`). One explicit source suffices; conflicting explicit wording between
  sources ⇒ null plus a backlog bullet; mixed wording inside one source ⇒ null plus a note.
- A qualifying condition that is not a threshold (for example "plus specified activities") does not break
  corroboration; it is quoted in `notes` and logged as an unresolved qualifier in the backlog.
- A stale official page (dated before a change that all current secondary sources report) does not override them; the
  row stays `corroborated` and the backlog names the official URL to re-check.

## Adding or re-verifying a row

1. Download each page with `curl -sL <url> -o <file>` into a scratch directory and read the actual table cells from
   the stripped HTML. Summarising fetch tools have been observed to drop cells and change answers between calls; use
   them only as a cross-check. Before committing, script-check that every double-quoted string in `notes` and in
   backlog bullets appears in the downloaded page text.
2. Fetch the official page where reachable (start from the department domain; cite only the page that states the
   figure). Fetch at least one secondary source; two for `corroborated`.
3. Compare. Threshold or rule conflict without an official page: mark `pending`, log in the backlog. Conflict on a
   non-threshold field only (measurement period, effective date, which sales count, marketplace inclusion): keep the
   threshold, set that field to null, log in the backlog.
4. Set `comparator` only when a fetched source uses explicit wording ("more than" / "exceeds" ⇒ `exceeds`;
   "or more" / "at least" ⇒ `meets_or_exceeds`); otherwise null.
5. Record every page used in `sources` with today's `accessed_on`; set `verified_on` to today.
6. If any rendered figure changed, prepend an entry to `data/changelog.json` with the source URL.
7. Run `npm run check`. Fix the row, never the schema, until it passes. Commit.

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
