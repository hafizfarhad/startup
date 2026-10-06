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
