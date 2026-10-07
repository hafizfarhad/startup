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
