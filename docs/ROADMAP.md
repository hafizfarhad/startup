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
