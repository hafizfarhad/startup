# Next steps

Two checklists. Do them in order. Each step says what "done" looks like. Nothing here adds scope; anything not
listed needs a spec first (see `docs/SCOPE.md`).
These documents reference the owner's personal and professional circumstances; keep the repository private.

## Human-only steps

1. **Employer and SBP clearance.** Before spending money or publishing anything, confirm in writing that your
   current employer, and SBP if you join it, permit this outside activity. Done when you have that confirmation.
2. **Choose and buy the .com.** Then in `site.config.ts` set `siteName`, set `workingTitle: false`, and set
   `siteUrl` to `https://<your-domain>`. Done when `npm run build` prints no placeholder warning.
3. **Publish owner details.** Fill `owner.name`, `owner.email` (an address you are willing to publish) and
   `owner.location`. Done when the About page shows them and state pages show "Report an error".
4. **Create a PRIVATE GitHub repository and push `main`.** Keep it private: these documents describe your personal
   circumstances. Done when `git remote -v` shows it, the push succeeds, and the repository visibility is Private.
5. **Deploy** following `docs/DEPLOY.md` (Cloudflare Pages recommended), connect the domain, enable the host's web
   analytics. Done when `https://<your-domain>/sitemap-index.xml` loads over https.
6. **Register the property** in Google Search Console and Bing Webmaster Tools and submit the sitemap URL. Done when
   both consoles show the property verified.
7. **Newsletter.** Create an account with a form-based provider (Buttondown or Kit), copy the form action URL into
   `newsletterActionUrl`, redeploy. Done when a test subscription arrives in the provider.
8. **Reviewer workflow.** Agree with your Chartered Accountant brother how he reviews rows. When he has reviewed a
   row, he (or you on his written say-so) edits that row's `review` block to
   `{ "status": "reviewed", "by": "<his name, credential>", "on": "<date>" }` in a commit that changes nothing else,
   and you set `reviewer` in `site.config.ts`. Never mark a row reviewed without his review. Done when at least one
   row shows the reviewed badge.
9. **Re-verification calendar.** Create reminders: all nexus rows every six months and after state legislative
   sessions (most adjourn by June); tool pricing every quarter. Done when the reminders exist.
10. **Pakistan setup.** Open a Payoneer account; register with the Pakistan Software Export Board (freelancer or
    company); ask your bank how it codes inbound SaaS and affiliate receipts for the IT-export regime; confirm with
    your brother how the 0.25 percent final-tax regime and the 50 percent foreign-currency retention apply to you.
    Done when you have written answers to all three.
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
- **Resolve the open backlog bullets.** As of 2026-10-06 there are 44 under `## Open`, covering 29 states plus one
  vendor: effective dates, measurement periods, which sales count, comparator wording, marketplace inclusion,
  threshold qualifiers and one transaction-threshold question, plus whether Dodo Payments files US sales tax. For
  each: start from the state's revenue-department domain (listed in `docs/DATA_PROVENANCE.md`'s procedure or the
  plan), find the page that states the rule, and if it does, update the row from that page, add it to `sources`,
  add a changelog entry if a rendered figure changes, bump `verified_on`, and move the bullet to `## Resolved` with
  the URL. If no official page states it, leave the bullet open.
- **Change copy.** Pages live in `src/pages/`; components in `src/components/`. Copy must never claim review or
  verification that the data does not carry.
- **Before saying "done".** Run `npm run check` and paste its final lines in your report.

## Never

- Never type a figure from memory. Never set `review.status` to `"reviewed"`. Never add affiliate URLs anywhere
  but `site.config.ts`. Never add a feature, page type, dataset or dependency without a new spec.
