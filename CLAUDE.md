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
