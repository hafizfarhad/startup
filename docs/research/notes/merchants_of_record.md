# Merchants of Record (MoRs) for software/digital products and US sales-tax nexus — as of 7 October 2026

Scope: Lemon Squeezy (Stripe), Paddle, Polar, FastSpring, Gumroad, Creem, Dodo Payments. All official pages were fetched 2026-10-07 unless a different "read" date is shown. Prices are as published on that date; MoR pricing has changed several times in 2026 (Polar in May, Lemon Squeezy's parent Stripe launching Managed Payments), so re-verify before publishing.

Note on how the MoR model works (common to all seven): the MoR is the reseller/"seller of record" on the customer's receipt and card statement, so it — not the developer — is the entity that registers for, collects and remits sales tax/VAT/GST. Every vendor below says this in some form; the clearest official statements are Paddle's ("Paddle acts as a reseller of your product, and is, therefore, the 'seller on record'" and is "responsible for the collection and payment of VAT and tax instead of you" — [Paddle Help](https://www.paddle.com/help/start/intro-to-paddle/how-paddle-is-able-to-take-on-your-vat-and-tax-responsibilities)) and Lemon Squeezy's ("As Lemon Squeezy is a merchant of record, you shouldn't need to report sales tax for sales you make through Lemon Squeezy" — [Lemon Squeezy Docs](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat)). None of the seven publishes a list of the US states in which it is itself registered.

---

## Key Question 1 — For each MoR: fee structure, what is/isn't covered for US sales tax, and whether a seller still needs to think about nexus

### Takeaway
Six of the seven publish a headline rate (Paddle and Lemon Squeezy 5% + 50¢; Polar 5% + 50¢ free tier down to 3.4% + 30¢ at $400/mo; Dodo 4% + 40¢; Creem 3.9% + 40¢; Gumroad 10% + 50¢); FastSpring is quote-only. All seven bundle US sales tax registration/collection/remittance for sales made through the MoR, and none publishes a state-by-state list of its own registrations. Official docs are consistent that the seller keeps income-tax obligations; only Lemon Squeezy's docs explicitly scope the relief to "sales you make through Lemon Squeezy", and no vendor explicitly addresses nexus arising from off-platform sales.

### Cited Findings

**Lemon Squeezy (owned by Stripe)**
- Headline fee "5% + 50¢" per transaction; "no monthly platform fees"; sales tax and VAT "collection and filing as Merchant of Record" included; payouts by bank wire or PayPal "twice a month" to 200+ countries; page links a "2026 Update: Lemon Squeezy + Stripe Managed Payments" — [Lemon Squeezy Pricing](https://www.lemonsqueezy.com/pricing)
- Surcharges per fee docs: "+1.5% for international (outside of the US) transactions"; "+1.5% for PayPal transactions"; "+0.5% for subscription payments"; payouts via Stripe to US bank free, non-US bank 1%; PayPal payout US "$0.50", non-US "3% capped at $30"; abandoned-cart recoveries "+5%"; affiliate referrals "+3%" (merchant side) and "+2%" (affiliate side). No last-updated date on the page — [Lemon Squeezy Docs: Fees](https://docs.lemonsqueezy.com/help/getting-started/fees)
- US coverage/residual obligations: the tax doc does not name states; it says "you shouldn't need to report sales tax for sales you make through Lemon Squeezy" but "you may need to pay tax on the income you receive from Lemon Squeezy in the form of payouts"; collected tax "will [be] deduct[ed] from your next payout so that we can report and remit it"; tax-inclusive pricing is an optional store setting; no publication date — [Lemon Squeezy Docs: Sales Tax and VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat)
- The marketing page positions MoR as covering "all applicable jurisdictions" — [Lemon Squeezy: Merchant of Record](https://www.lemonsqueezy.com/reporting/merchant-of-record) (title/snippet only; not fetched in full)

**Paddle**
- "5% + 50¢ per Checkout transaction" on the Pay-as-you-go plan; custom pricing for high volume; "No monthly fees, migration fees, or hidden extras"; "Tax and compliance" (sales tax and VAT) and "Fraud protection" including chargeback defence are listed as included — [Paddle Pricing](https://www.paddle.com/pricing)
- Payouts: monthly; balance converts on the 1st, "Paddle will send your payment by the 15th", up to 3 working days to land; minimum $100/£100/€100 (adjustable up to $100,000); methods are wire transfer or Payoneer; currencies USD/GBP/EUR; no Paddle fee in most countries but a "$15 SWIFT fee may be applicable" in some — [Paddle Help: When and how do I get paid?](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid)
- Product limits (AUP last updated 13 April 2026): bans physical products "that require physical delivery"; "pure consulting or advisory services"; "donations, crowdfunding, community access, advertising, and sponsorship"; marketplaces; MLM/referral schemes; adult content and dating; gambling; regulated financial products and crypto exchanges; technical support services; system cleaners/antivirus; VPNs and proxies; CAPTCHA solving; resale of Microsoft/Adobe products; deepfakes/voice impersonation; and others (21 categories) — [Paddle Help: AUP](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)
- Tax model: Paddle "acts as a reseller of your product, and is, therefore, the 'seller on record'" and is "responsible for the collection and payment of VAT and tax instead of you"; the page does not list seller carve-outs or the number of jurisdictions, and has no date — [Paddle Help: How Paddle is able to take on your VAT and tax responsibilities](https://www.paddle.com/help/start/intro-to-paddle/how-paddle-is-able-to-take-on-your-vat-and-tax-responsibilities)
- Paddle's help-centre page on which countries it charges tax in returned HTTP 404 on 2026-10-07 — [dead URL](https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-in); the tax help index is at [Paddle Help: Tax](https://www.paddle.com/help/sell/tax)

**Polar**
- Four plans (fees doc): Starter free, "5% + 50¢"; Pro $20/mo, "3.8% + 40¢"; Growth $100/mo, "3.6% + 35¢"; Scale $400/mo, "3.4% + 30¢". Add-ons: "+1.5%" international (non-US) cards; "+0.5%" on subscription payments for Early Members only; "$15" per dispute (non-refundable); payout fees "$2/month per active payout" plus "0.25% + $0.25 per withdrawal" and cross-border conversion 0.25% (EU) or 1% (other). Transaction fees are not refunded on refunds. Grandfathered "Early Member" rate for organisations created before 27 May 2026: "4% + 40¢" + 0.5% subscription fee, kept "as long as you stay on it" — [Polar Docs: Fees](https://polar.sh/docs/merchant-of-record/fees)
- Plans announced 20 May 2026; previous flat rate was 4% + 40¢ (+0.5% subscriptions); Polar's rationale: "operational costs are more fixed than variable" and "risk decreases as customer volume grows"; it frames paid tiers as "transparency and product-led growth over sales" instead of negotiated discounts — [Polar Blog: Introducing Polar Plans](https://polar.sh/blog/introducing-polar-plans)
- Tax doc: Polar "take[s] on the liability for international sales taxes on your behalf"; gives only one US example ("Texas (United States) does not [require registration] until you've sold for more than $500,000"); says "you're always responsible for your own income/revenue tax in your country of residency"; states "Stripe Tax does not do this" (remit); no date and no state list — [Polar Docs: Tax](https://polar.sh/docs/merchant-of-record/tax)
- Product limits: prohibited list includes physical products, human services, donations/crowdfunding/community access, marketplaces, adult content, gambling, trading/crypto/NFT/financial advice, cheats, downloaders/IPTV, bulk SMS, pseudoscience, medical advice, deepfakes, OSINT; a "restricted" list requiring enhanced review includes eBooks, AI content-generation tools, VPN/VPS, directories, pre-orders/paid waitlists, ticket sales; OFAC SDN restrictions apply to sellers — [Polar Docs: Acceptable Use](https://polar.sh/docs/merchant-of-record/acceptable-use)

**Creem (Armitage Labs OÜ)**
- "3.9% + $0.40" per successful transaction; "$0" monthly and setup; "Automatic VAT, GST, and sales tax collection and remittance in 50+ countries"; payouts "on the 1st and 15th of every month to your bank account or crypto wallet" (USDC mentioned); "no minimum volume requirement"; a "Partner plan" with custom pricing. The pricing page presents chargeback protection, revenue splits etc. as "built in, not bolted on" and lists no separate surcharges — [Creem Pricing](https://www.creem.io/pricing)
- Creem's own docs do list feature surcharges: split payments "incur a 2% fee"; affiliate-platform transactions carry "an additional 2% fee"; international (non-EU) payouts cost "7 USD/EUR or 1% of the payout amount, whichever is higher"; minimum payout balance 50 USD/EUR; payouts 1st and 15th — [Creem Docs: Revenue Splits](https://docs.creem.io/features/split-payments); [Creem Docs: Payouts (GitHub source)](https://github.com/armitage-labs/creem/blob/main/packages/docs/merchant-of-record/finance/payouts.mdx). A competitor review additionally claims 5% on abandoned-cart recovery, 2% on stablecoin payouts and a $25 chargeback fee — [Dodo Payments blog (competitor)](https://dodopayments.com/blogs/creem-io-review). Conflict: the pricing page's "no hidden fees" framing vs. the docs' feature-specific fees.

**Dodo Payments**
- "4% + 40c per domestic US transaction (cards & wallets)"; "+1.5%" for non-US cards/APMs; India "4% + 15c"; ACH "1.5% (capped at $15 per transaction)"; SEPA 1.5% capped €15; "+0.5%" for subscriptions/usage-based; "+3%" PayPal; "+3%" BNPL; "0.5%" bring-your-own-processor; recovery tools "Free to use (5% on recovered amount)"; "$1 per refund"; "$30 per dispute"; "$18" Visa RDR; "$27" Ethoca alert; "$15 per deflection"; "$25" USD SWIFT payout; tax compliance "(VAT, GST, sales tax)" across "220+ countries and regions"; no monthly plans — [Dodo Payments Pricing](https://dodopayments.com/pricing)
- Payouts: default bi-monthly (1st–15th paid on the 18th; 16th–month-end paid on the 4th); weekly available on request for higher volumes; monthly option paid on the 11th; minimum USD payout $50; payout currencies USD/GBP/EUR — [Dodo Docs: Payouts Process](https://docs.dodopayments.com/features/payouts/payout-structure)
- Its nexus guide tells US-only sellers with a finance team that DIY may be preferable, and frames MoR as absorbing "the full sales tax stack" — [Dodo Blog: Sales Tax Nexus for SaaS](https://dodopayments.com/blogs/sales-tax-nexus-saas-when-to-collect)

**FastSpring**
- No published rate: "simple, flat-rate pricing" set "based on volume of sales and custom rates can be negotiated"; "we have no minimum transaction volume"; fees "automatically withheld" from payouts; sales tax & VAT collection and remittance included as MoR; supports SaaS, software, games, mobile apps, courses, and — unlike Paddle/Polar — physical goods and services; quote form required — [FastSpring Pricing](https://fastspring.com/pricing/)
- Third-party estimates (unverified, secondary): roughly 5.9% + $0.95 or a flat 8.9% — [SupportYourApp review](https://supportyourapp.com/blog/fastspring-review/); median contract about $3,229/yr per Vendr's buyer data — [Vendr: FastSpring](https://www.vendr.com/marketplace/fastspring). Treat as indicative only.
- FastSpring claims to file "1,200+ tax returns each year" and that "FastSpring is the only solution in this guide that takes on indirect tax liability for you" (vs. Avalara/TaxJar) — [FastSpring Blog: SaaS Tax Software](https://fastspring.com/blog/saas-tax-software/) (14 March 2023)

**Gumroad**
- "10% + $0.50" for direct sales; "30%" for sales via Gumroad Discover; MoR since 1 January 2025: "Gumroad will automatically handle all sales tax collection and remittance worldwide"; payouts by direct deposit or PayPal "varies by country" — [Gumroad Pricing](https://gumroad.com/pricing)
- Card processing is charged separately at 2.9% + 30¢ per third-party fee guides — [Checkout Page: Gumroad fees](https://checkoutpage.com/blog/gumroad-fees); a creator's forwarded copy of the Jan-2025 announcement email ("Gumroad is becoming a Merchant of Record") — [Substack note](https://substack.com/@kristinagod/note/c-81098335)
- On $10,000/month of $50 orders Gumroad costs $1,450 (14.5%) vs. $600 for Paddle/Lemon Squeezy — [flaviocopes.com, 29 Sep 2026](https://flaviocopes.com/payment-provider-fees/)

**Stripe Managed Payments (relevant because it is Lemon Squeezy's successor)**
- "Managed Payments charges a 3.5% fee for each successful transaction"; it is "in addition to the standard Stripe payment processing fees"; calculated on "the full transaction amount, including any indirect taxes" — [Stripe Support: Managed Payments pricing](https://support.stripe.com/questions/managed-payments-pricing)
- Competitors compute the all-in US domestic rate as ~6.4% + $0.30 — [Dodo Payments blog (competitor)](https://dodopayments.com/blogs/stripe-managed-payments-fees-explained); [Creem blog (competitor)](https://www.creem.io/blog/stripe-managed-payments-alternative)

### Inferences
- The "5% + 50¢" headline has become the reference price (Paddle, Lemon Squeezy, Polar Starter, and effectively FastSpring per third-party estimates); the newer entrants (Creem, Dodo, Polar paid tiers) compete 1–1.6 points below it but recover margin through surcharges on international cards, PayPal, subscriptions, payouts and disputes. Any cost comparison must therefore model the seller's mix (US vs. international, subscription vs. one-off, payout country).
- Because no MoR publishes its own state registration list, a seller cannot verify from public pages that tax is being collected in a specific state; the reassurance rests on the MoR's contractual assumption of liability, not on disclosed registrations.
- Lemon Squeezy's wording ("sales you make through Lemon Squeezy") is the only official acknowledgement that the relief is channel-specific; it follows that a seller who also sells direct (own Stripe checkout, app stores, invoices) still has to track nexus for those channels, but no MoR page spells this out.

### Gaps
- No MoR publishes the list of US states (or the count) in which it is registered; Paddle's relevant help URL is dead.
- FastSpring's actual rate card is not public; third-party figures are unverified.
- Gumroad's help-centre article on sales tax ([URL](https://gumroad.com/help/article/121-sales-tax-on-gumroad)) is JavaScript-rendered and returned only a title; whether Gumroad adds tax on top of price in all US states could not be confirmed from the primary page.
- Creem's full fee schedule (chargeback fee, stablecoin payout fee, abandoned-cart fee) could only be confirmed via a competitor's review and partial Creem docs.

---

## Key Question 2 — What educational content do they publish on US economic nexus? Sourced and dated, or generic marketing? Any free calculators?

### Takeaway
All seven publish SEO-style nexus/sales-tax articles, but none publishes a sourced, dated, neutral state-threshold dataset: Paddle's US content is dated 2019 ("as of 2020"), Lemon Squeezy's January 2024, FastSpring's March 2023; the 2026 pieces from Dodo and Creem are dated and bylined (Dodo) but cite no state Department of Revenue sources and end in a pitch. No MoR offers a nexus calculator or "do I need to register" quiz; the only MoR-built interactive tax tool found, Paddle's "SaaS Sales Tax Agony Index", now redirects to a blog post.

### Cited Findings

**Paddle**
- "US Sales Tax Changes: What Software Businesses Should Know" — published 7 March 2019 by Dan Wilkinson; the only threshold language is "some are as low as just $100,000 annual revenue or just 100 transactions"; no state table, no citations to state authorities, no tool; closes with "With Paddle, companies have complete peace of mind. No need to hire extra people, no need to become overnight tax experts" — [Paddle Blog](https://www.paddle.com/blog/us-sales-tax-changes-what-software-businesses-should-know)
- "SaaS sales tax in the U.S.: Is SaaS taxable?" — states "These are the laws as of 2020"; paragraph-form state summaries, no table, no economic-nexus thresholds, only New York's Department of Taxation and Finance is cited; no calculator; concludes by recommending "partnering with a merchant of record (MoR) like Paddle" — [Paddle Resources](https://www.paddle.com/resources/saas-sales-tax)
- Paddle's "SaaS Sales Tax Agony Index" (search listing title: "Top #98 Most Painful Jurisdictions"; an EU sub-page titled "European Union VAT in 2022") ranked jurisdictions by "registration & filing requirements, tax rates & penalties" — [tax-agony.paddle.com](https://tax-agony.paddle.com/). On 2026-10-07 that domain returned a 301 redirect to [a Paddle blog post](https://www.paddle.com/blog/saas-sales-tax-state-wide-and-international), which timed out when fetched; whether the interactive index still exists is unverified.
- Paddle maintains a tax topic hub and a gated PDF guide ("Navigating Your Sales Tax Liability") — [Paddle Resources: Tax](https://www.paddle.com/resources/topic/tax); [Paddle Offers: SaaS Sales Tax Guide](https://www.paddle.com/offers/saas-sales-tax-guide) (titles only; not fetched)
- Paddle also runs vendor-owned "alternatives" pages against compliance tools, e.g. TaxJar — [Paddle: TaxJar Alternatives](https://www.paddle.com/alternatives/taxjar) (title only)

**Lemon Squeezy**
- "Get your SaaS company ready for Sales Tax in The US" — 28 January 2024, by Morgan Williams; gives two examples (Georgia "$100,000 or 200 sales"; Mississippi "$250,000"); no comprehensive state list; cites Quaderno (a tax-software vendor) rather than state DORs for its maps; no update notice; no calculator; pitches "we calculate, collect, and remit all your taxes" and a Typing Mind case study ("300% increase in monthly recurring revenue") — [Lemon Squeezy Blog](https://www.lemonsqueezy.com/blog/saas-sales-tax-usa)
- "Ecommerce sales tax: Top 7 things you need to know" — general explainer — [Lemon Squeezy Blog](https://www.lemonsqueezy.com/blog/ecommerce-sales-tax-top-7-things-to-know) (title/snippet only)

**FastSpring**
- "A Complete Guide to SaaS Tax Software" — 14 March 2023, by EJ Brown; lists SaaS taxability by state (e.g. "SaaS is taxable in Alaska, Arizona, Hawaii, Kentucky, Louisiana, Massachusetts, New Mexico, New York, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Utah, Washington, and West Virginia"); only one threshold ("For many states, the economic nexus threshold is $100,000"); cites Wayfair but no state sources; no tool; contrasts itself with Avalara's disclaimer that "you are responsible for determining the appropriate tax codes" — [FastSpring Blog](https://fastspring.com/blog/saas-tax-software/)

**Dodo Payments**
- "Sales Tax Nexus for SaaS: When to Register and How to Track Thresholds" — published 10 June 2026, by Aarthi Poonia; includes a threshold table for ~11 states (e.g. California "$500,000", Florida "$100,000", New York "$500,000" and 100 transactions); no links to DOR pages or statutes, only "Always verify the current rule with the state's Department of Revenue before registering"; no calculator (a manual spreadsheet template instead); pitches "4% + 40c on the Standard Plan" but, notably, recommends DIY for "US-only operations with finance teams" — [Dodo Blog](https://dodopayments.com/blogs/sales-tax-nexus-saas-when-to-collect)
- Also publishes "Sales Tax on Digital Goods by State: Complete 2026 Guide" — [Dodo Blog](https://dodopayments.com/blogs/sales-tax-digital-goods-by-state) (title/snippet only) and "Stripe Tax Explained" — [Dodo Blog](https://dodopayments.com/blogs/stripe-tax-explained) (title only)

**Creem**
- "Texas Sales Tax: The 2026 Guide" — 2 July 2026, no byline; figures given ("6.25%" state, "8.25% max", "80% of the charge is taxed" for SaaS, "$500,000 in total Texas revenue over the preceding 12 months"); no Texas Comptroller or statute citations; misspells "Waifair"; no tax calculator (only a payment-fee calculator); closes "Instead of becoming a part-time tax filer in 20 jurisdictions, you ship product" — [Creem Blog](https://www.creem.io/blog/texas-sales-tax)
- Other 2026 pieces: "Sales Tax Internet Sales: Complete 2026 Compliance Guide" ("45 states plus DC have economic nexus laws") — [Creem Blog](https://www.creem.io/blog/sales-tax-internet-sales-complete-2026-compliance-guide); "States With No Sales Tax" — [Creem Blog](https://www.creem.io/blog/states-with-no-sales-tax) (titles/snippets only)

**Polar**
- Only the tax doc (Texas $500k example; no state table; no date) — [Polar Docs: Tax](https://polar.sh/docs/merchant-of-record/tax). No nexus blog content surfaced in searches.

**Gumroad**
- No US nexus educational content surfaced; its pricing page's two sentences on MoR are the extent of public tax content found — [Gumroad Pricing](https://gumroad.com/pricing)

**Who does publish neutral, dated state-threshold tables (for contrast)** — compliance-tool and processor vendors, not MoRs: Stripe's guide — [Stripe](https://stripe.com/guides/introduction-to-us-sales-tax-and-economic-nexus); Avalara's state-by-state guide — [Avalara](https://www.avalara.com/us/en/learn/guides/state-by-state-guide-economic-nexus-laws.html); Kintsugi, Numeral, TaxCloud, Zamp, Commenda and Galvix tables appeared in the same searches (e.g. [Kintsugi](https://trykintsugi.com/sales-tax-guides/usa/economic-nexus), [Numeral](https://www.numeral.com/blog/economic-nexus), [TaxCloud](https://taxcloud.com/blog/sales-tax-nexus-by-state/)). These were not fetched or assessed for sourcing.

**Free calculators that exist are fee calculators, not nexus calculators**, and are mostly third-party: Paritydeals' Polar fee calculator — [Paritydeals](https://www.paritydeals.com/polar-fee-calculator/); Checkout Page's Gumroad fee calculator — [Checkout Page](https://checkoutpage.com/tools/gumroad-fee-calculator); Feeschecker's Paddle fee calculator — [Feeschecker](https://www.feeschecker.com/paddle-fee-calculator); Foundlie's Dodo fee calculator — [Foundlie](https://foundlie.com/tools/dodo-payments-fee-calculator); Creem's own "/payment-fee-calculator" (referenced in its Texas post). A multi-provider fee calculator at saasfeecalculator.com appeared in search results but the host did not resolve on 2026-10-07.

### Inferences
- The incumbent MoRs' US nexus content is stale (2019–2024) because their pitch does not depend on the seller knowing thresholds; the challengers (Dodo, Creem) publish fresh 2026 pieces as SEO funnels but still omit primary-source citations, so there is no MoR-published artefact a seller could rely on as a dated, sourced threshold table.
- A neutral, sourced, dated threshold dataset plus a "do I need to register" flow is a content gap among MoRs; the MoR commercial incentive is to argue thresholds are irrelevant, so this gap is unlikely to be filled by them.

### Gaps
- Could not confirm whether Paddle's interactive Tax Agony Index is still live (redirect target timed out).
- Paddle's "SaaS sales tax state-wide and international" blog (the redirect target) was not assessed for date/sourcing.
- Dodo's "Sales Tax on Digital Goods by State" and Creem's "Internet Sales" guide were not fetched; their sourcing is unknown.

---

## Key Question 3 — Honest "MoR vs. Stripe + compliance tool" cost comparisons with numbers; who publishes "Paddle vs Lemon Squeezy" comparisons and how they rank

### Takeaway
The only sourced, dated comparisons with explicit registration/filing-cost assumptions come from independent sites (aliteq.com, 3 Oct 2026; flaviocopes.com, 29 Sep 2026); vendor comparisons (Fungies, Creem, Dodo) assert that Stripe's "real" cost approaches MoR cost but either cite no sources or do not quantify filing costs. "Paddle vs Lemon Squeezy" search results are dominated by competitor MoRs (Fungies, Comecero, Dodo) and affiliate/review sites; neither Paddle nor Lemon Squeezy publishes a head-to-head page against the other.

### Cited Findings

**Independent comparisons with numbers**
- aliteq.com, published 3 October 2026 (author "Ledger"): models a $29/month plan. Per-sale cost US card | international card: Stripe + Billing + Stripe Tax $1.34 | $1.92 (you file); Paddle $1.95 | $1.95; Lemon Squeezy $2.10 | $2.53; Stripe Managed Payments $2.36 | $2.79. Break-even "MRR = 29 × monthly filing cost ÷ extra fee per subscriber"; at $300/month of filing cost the MoR pays off below roughly $27,500 MRR (Paddle), $12,800 (Lemon Squeezy), $9,200 (Managed Payments). Filing cost bands offered: ~$0 (US-only below thresholds or reverse-charged EU B2B), ~$100 ("handful of filings a year, mostly automated"), $300–600 ("several jurisdictions, an accountant who files"). Sources listed: vendor pricing pages read 3 Oct 2026 plus EU OSS, gov.uk and SD/CA/TX state pages — [aliteq.com](https://aliteq.com/merchant-of-record-vs-stripe-tax)
- aliteq.com also ranks the cheapest MoR across Paddle, Lemon Squeezy, Polar, Creem, Dodo and FastSpring — [aliteq.com](https://aliteq.com/cheapest-merchant-of-record) (title only)
- flaviocopes.com (indie developer), 29 September 2026: $10,000/month as 200 × $50 one-off US domestic sales, no tax collected. Monthly cost: Stripe $350 (3.5%); Creem $470 (4.7%); Polar Pro $480 (4.8%); Dodo $480 (4.8%); Paddle $600 (6.0%); Lemon Squeezy $600 (6.0%); Gumroad $1,450 (14.5%). Adding Stripe Tax Basic (0.5%) takes Stripe to $400; Stripe Tax Complete "$90+ monthly minimum" to $440. Author picks Creem for new products and values the MoR time saving at roughly one accounting hour a month — [flaviocopes.com](https://flaviocopes.com/payment-provider-fees/)

**Vendor-published comparisons (competitor-authored; treat claims accordingly)**
- Fungies.io (an MoR) "Merchant of Record vs Stripe: The Complete 2026 Comparison": claims that at $20K MRR with 50% international customers Stripe costs "~$580/month in transaction fees plus $600–$1,200/year in tax software, potentially $3,000+ in accountant fees, and 10+ hours per month" and concludes MoRs are "roughly the same price as Stripe + tax tooling" — [Fungies](https://fungies.io/merchant-of-record-vs-stripe/) (search summary; not fetched in full)
- Creem "Honest payment fee breakdown", 8 June 2026: Stripe "2.9% + 30¢" headline but "5.4% in reality for global SaaS"; Paddle "5.5%" all-in; Lemon Squeezy "7.5%" all-in on international subscriptions; acknowledges Stripe leaves you owing "US sales tax in 45 states" but does not quantify filing costs; no external sources — [Creem Blog](https://www.creem.io/blog/honest-payment-fee-breakdown-creem-vs-stripe-paddle-ls)
- Dodo Payments publishes a dense cluster of competitor pieces: "Cheapest Merchant of Record for SaaS in 2026" — [Dodo](https://dodopayments.com/blogs/cheapest-merchant-of-record); "Top 7 Merchant of Record Platforms 2026" — [Dodo](https://dodopayments.com/blogs/best-merchant-of-record-platforms); reviews of Lemon Squeezy, Polar, Creem, Gumroad and Stripe Managed Payments — [Dodo: Lemon Squeezy review](https://dodopayments.com/blogs/lemonsqueezy-review), [Dodo: Polar review](https://dodopayments.com/blogs/polar-sh-review), [Dodo: Creem review](https://dodopayments.com/blogs/creem-io-review), [Dodo: Gumroad fees](https://dodopayments.com/blogs/gumroad-fees-explained), [Dodo: Stripe Managed Payments fees](https://dodopayments.com/blogs/stripe-managed-payments-fees-explained) (titles/snippets only)
- Creem likewise: "Best Merchant of Record for SaaS in 2026" — [Creem](https://www.creem.io/blog/best-merchant-of-record-saas-2026); "Stripe Alternatives for SaaS: 7 Options That Handle Tax" — [Creem](https://www.creem.io/blog/stripe-alternatives-for-saas); "Why Stripe Managed Payments Is the Most Expensive MoR" — [Creem](https://www.creem.io/blog/stripe-managed-payments-alternative) (titles only)
- Compliance-tool vendors publish the mirror image: Commenda's "Paddle Sales Tax: What Merchant of Record Misses" — [Commenda](https://www.commenda.io/integrations/paddle/global-indirect-tax-software-for-paddle) (title only)

**Who ranks for "Paddle vs Lemon Squeezy" (proxy: WebSearch result sets on 2026-10-07; not a Google SERP audit)**
- Query "Paddle vs Lemon Squeezy comparison 2026" returned, in order: fungies.io (competitor MoR), resources.rework.com, comecero.com (competitor billing vendor), saasaf.ai, devpick.io, apiscout.dev, artisangrowthstrategies.com, saaslens.app, globalsolo.global, contracollective.com — e.g. [Fungies](https://fungies.io/paddle-vs-lemon-squeezy/), [Comecero](https://comecero.com/blog/paddle-vs-lemon-squeezy), [Rework](https://resources.rework.com/tools/billing-revenue/paddle-vs-lemon-squeezy), [Contra Collective](https://contracollective.com/blog/paddle-vs-lemon-squeezy-merchant-of-record-digital-commerce-2026)
- Query "paddle.com lemon squeezy alternative comparison page" returned fungies.io (two pages), saasworthy.com, saasaf.ai, seeto.ai, solodevstack.com, wpsmartpay.com, churntools.com, contracollective.com — e.g. [SaaSworthy](https://www.saasworthy.com/compare/paddle-vs-lemon-squeezy?pIds=843%2C33161), [ChurnTools](https://churntools.com/blog/best-paddle-alternatives). No paddle.com or lemonsqueezy.com URL appeared in either set.
- Consensus of these pages: identical 5% + 50¢ headline; Paddle "wins for SaaS with complex billing needs", Lemon Squeezy "for digital products" and simpler setup; Lemon Squeezy's "roadmap now lives inside Stripe" — [Fungies](https://fungies.io/paddle-vs-lemon-squeezy/); [Artisan Growth Strategies](https://www.artisangrowthstrategies.com/blog/paddle-vs-stripe-vs-lemon-squeezy-2026)

### Inferences
- The honest comparisons converge on the same structure: MoR premium over Stripe + Stripe Tax is roughly 0.6–1.2 points per sale for US cards, and the MoR wins only while the seller's avoided registration/filing cost exceeds that premium — which the independent authors put at the low-five-figure to ~$27k MRR range depending on vendor and filing-cost assumption. This is the "break-even MRR" framing a neutral tool could reproduce.
- Comparison SERPs are a competitor-marketing battleground: the newest MoRs (Fungies, Dodo, Creem, Comecero) publish review pages about each rival, so a reader rarely reaches a vendor-neutral source without knowing to look for one.

### Gaps
- No true Google ranking data was collected; WebSearch result order is only a proxy.
- Fungies' MoR-vs-Stripe piece and the Dodo/Creem comparison pages were seen only via search summaries/titles, not fetched.
- No comparison was found that models the cost of running registrations through a specific compliance tool (Avalara/TaxJar/Numeral/Kintsugi) with that tool's actual pricing; aliteq uses generic filing-cost bands and flaviocopes uses Stripe Tax Complete's "$90+ minimum".

---

## Key Question 4 — Known pain points sellers report with MoRs (approval, payouts, pricing changes, support)

### Takeaway
Lemon Squeezy has by far the most visible complaints (Trustpilot 1.2/5 on 178 reviews, 88% one-star; themes: identity-verification failures, weeks-long support silence, account freezes under "review", slow or opaque application rejections), with its own CEO acknowledging "slower support responses and less frequent product updates". Paddle's pain points are approval/AUP strictness, net-15 monthly payouts with a $100 minimum, API constraints and reputational fallout from a June 2025 $5M FTC settlement; Polar's is a May 2026 price restructuring that moved the free tier from 4% + 40¢ to 5% + 50¢. All seller quotes below are anecdotal.

### Cited Findings

**Lemon Squeezy**
- Trustpilot (fetched 2026-10-07): TrustScore 1.2/5; 178 reviews; 5-star 6%, 4-star <1%, 3-star 1%, 2-star 4%, 1-star 88%. Representative recent complaints: "Impossible to verify my identity therefore I cant activate store or sell items" (Sep 2026); "Contacted support which you can only do via email, and no response. For days" (Aug 2026); "They took our money, accepted multiple payments, and then suddenly froze our account under some vague 'review'" (Oct 2025); "Ten days to reject a product they never looked at" (Aug 2026) — [Trustpilot: Lemon Squeezy](https://www.trustpilot.com/review/lemonsqueezy.com). (A search snippet elsewhere cited "3.5/5"; the direct fetch shows 1.2 — the fetched figure is used.)
- Official acknowledgement, 28 Jan 2026: the CEO cites "slower support responses and less frequent product updates" caused by building Stripe Managed Payments — [Lemon Squeezy Blog: 2026 Update](https://www.lemonsqueezy.com/blog/2026-update)
- Third-party roundups of complaints (anecdotal aggregation): unexpected account reviews freezing payouts; makers "publicly migrating away citing slower support response times and unclear product direction"; one user's "payout had been failing for 3 months with no response" — [BuildMVPFast](https://www.buildmvpfast.com/blog/lemon-squeezy-vs-polar-paddle-merchant-of-record-2026); [Solobuild](https://solobuild.io/articles/stripe-vs-lemon-squeezy-vs-paddle-solo-founders); [TryOrBye](https://www.tryorbye.com/products/lemonsqueezy) (search summaries)
- Pricing pain: international and PayPal surcharges of 1.5% each plus 0.5% on subscriptions mean an international PayPal subscription pays 8.5% + 50¢ before payout fees — derived from [Lemon Squeezy Docs: Fees](https://docs.lemonsqueezy.com/help/getting-started/fees); Creem frames this as "7% + 50¢ for international subscriptions" — [Creem Blog](https://www.creem.io/blog/honest-payment-fee-breakdown-creem-vs-stripe-paddle-ls)

**Paddle**
- Approval/AUP: 21 banned categories, including whole software segments (VPNs, system cleaners/antivirus, tech-support tools, CAPTCHA solvers), AUP revised 13 April 2026 — [Paddle Help: AUP](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)
- Payout cadence: once a month, sent by the 15th, $100 minimum, wire/Payoneer only — [Paddle Help: When and how do I get paid?](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid); a comparison site characterises this as a deliberate fraud-screening design rather than ad-hoc holds — [Solobuild](https://solobuild.io/articles/stripe-vs-lemon-squeezy-vs-paddle-solo-founders) (anecdotal)
- FTC: on 17 June 2025 Paddle.com and its US subsidiary agreed to pay $5 million and accept a permanent ban on processing for tech-support telemarketers; the FTC said Paddle processed over $37 million for Restoro/Reimage (Apr 2020–Jun 2023) and $12.5 million for PC Vark despite chargeback rates above 7% — [BleepingComputer](https://www.bleepingcomputer.com/news/security/paddle-settles-for-5-million-over-facilitating-tech-support-scams/); [PYMNTS](https://www.pymnts.com/news/regulation/2025/ftc-settlement-bans-paddle-from-processing-payments-for-tech-support-telemarketers/); [Mondaq](https://www.mondaq.com/unitedstates/advertising-marketing-branding/1640778/ftc-settles-with-paddle-for-$5-million-over-alleged-role-in-deceptive-tech-support-schemes). The AUP's tech-support and system-cleaner bans are consistent with the settlement's terms.
- Single developer account (2019, updated 2024): PHP-centric API, inconsistent endpoints, one webhook URL per account, effective cost on small subscriptions "approximately 12-13%" after currency conversion, anxiety that the acceptable-business list is "eerily (and silently) evolving"; support praised as "outstanding" — [jasminek.net](https://jasminek.net/blog/paddle-problems) (anecdotal)
- Indie Hackers threads (2019–2024, anecdotal): reasons to leave Stripe for Paddle were VAT handling and invoicing; reasons to prefer Stripe were API flexibility and owning the customer relationship — [Indie Hackers: Stripe vs Paddle](https://www.indiehackers.com/post/stripe-vs-paddle-89161b0d5c); [Indie Hackers: We're Migrating from Stripe to Paddle](https://www.indiehackers.com/post/we-re-migrating-from-stripe-to-paddle-QCDp5mQYzoaK1e77ZW5e); [Indie Hackers: Anyone used Paddle?](https://www.indiehackers.com/post/anyone-used-paddle-715161419f)

**Polar**
- Pricing change: on 20 May 2026 Polar replaced its flat 4% + 40¢ with tiered plans whose free tier is 5% + 50¢; accounts created before 27 May 2026 keep the old rate only if they never upgrade — [Polar Blog](https://polar.sh/blog/introducing-polar-plans); [Polar Docs: Fees](https://polar.sh/docs/merchant-of-record/fees). Competitors immediately published "after the rate increase" reviews — [Fungies](https://fungies.io/polar-sh-review-2026/); [Dodo](https://dodopayments.com/blogs/polar-sh-review) (titles)
- Payout fees ($2/month + 0.25% + $0.25 per withdrawal) and a long "restricted" list requiring enhanced review (eBooks, AI content tools, VPNs) — [Polar Docs: Fees](https://polar.sh/docs/merchant-of-record/fees); [Polar Docs: Acceptable Use](https://polar.sh/docs/merchant-of-record/acceptable-use)

**Creem / Dodo**
- The main published criticism is "hidden" feature surcharges vs. a "no hidden fees" headline (Creem: 2% splits, 2% affiliates, $7/1% non-EU payouts, $25 chargebacks; Dodo: $30 chargebacks, $1 refunds, +3% PayPal/BNPL, $25 SWIFT) — [Dodo on Creem (competitor)](https://dodopayments.com/blogs/creem-io-review); [Dodo Pricing](https://dodopayments.com/pricing); [Creem Docs: Revenue Splits](https://docs.creem.io/features/split-payments)

**Gumroad**
- Pain point is price: 10% + 50¢ plus separate card processing (~2.9% + 30¢) and 30% via Discover; third-party guides put effective take at roughly 13–19% — [Checkout Page](https://checkoutpage.com/blog/gumroad-fees); [Swell](https://www.swell.is/content/gumroad-pricing); [flaviocopes.com](https://flaviocopes.com/payment-provider-fees/)

### Inferences
- The complaint pattern is structural to the MoR model rather than vendor-specific: because the MoR carries fraud, chargeback and tax liability, it must gate onboarding (KYC/AUP review), hold or batch payouts, and can freeze accounts unilaterally — the three most common grievances.
- Lemon Squeezy's post-acquisition drift (public roadmap removed per reviewers, slower support acknowledged by its CEO) is the single largest driver of 2025–26 "alternatives" searches, which competitor MoRs are monetising with comparison content.

### Gaps
- WebSearch did not surface specific r/SaaS or r/microsaas threads from 2025–26; pain-point evidence here is from Trustpilot, Indie Hackers (older) and comparison blogs, all anecdotal.
- No Trustpilot/G2 figures were collected for Paddle, Polar, Creem, Dodo, FastSpring or Gumroad.
- A Bootstrapped.fm thread on "FastSpring and US state sales taxes economic 'Nexus' tracking" could not be fetched (DNS failure) — [URL](https://discuss.bootstrapped.fm/t/fastspring-and-us-state-sales-taxes-economic-nexus-tracking/5573).

---

## Key Question 5 — Lemon Squeezy's status after Stripe's acquisition (2024)

### Takeaway
Stripe acquired Lemon Squeezy on 26 July 2024; as of the company's 28 January 2026 update Lemon Squeezy still operates at 5% + 50¢ with no announced price change, but its CEO states the team's focus is Stripe Managed Payments (Stripe's own MoR, 3.5% on top of standard Stripe fees, early access in 35+ countries) and that the goal is to "provide Lemon Squeezy users an easy way to migrate". No official page states whether new sign-ups are still accepted, though Aug–Sep 2026 Trustpilot reviews describe people applying and being verified/rejected, which implies onboarding remained open.

### Cited Findings
- Acquisition announced 26 July 2024, terms undisclosed — [TechCrunch](https://techcrunch.com/2024/07/26/stripe-acquires-payment-processing-startup-lemon-squeezy/); Lemon Squeezy's own post — [Lemon Squeezy Blog](https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy)
- 28 January 2026 update by CEO JR Farr: acknowledges "slower support responses and less frequent product updates"; describes Stripe Managed Payments as Stripe's MoR "currently in early access" supporting "merchants in 35+ countries" with expansion "later in 2026" and public access coming "very soon"; states the aim to "provide Lemon Squeezy users an easy way to migrate to Stripe Managed Payments" and to ensure "a great experience moving over to Stripe"; gives no migration timeline, no Lemon Squeezy pricing change, and does not say whether new sellers are accepted — [Lemon Squeezy Blog: 2026 Update](https://www.lemonsqueezy.com/blog/2026-update)
- Lemon Squeezy's pricing page still shows "5% + 50¢" and links the 2026 update — [Lemon Squeezy Pricing](https://www.lemonsqueezy.com/pricing)
- Stripe Managed Payments fee: "3.5% fee for each successful transaction", "in addition to the standard Stripe payment processing fees", computed on the tax-inclusive amount — [Stripe Support](https://support.stripe.com/questions/managed-payments-pricing); Stripe's Managed Payments help topic index — [Stripe Support](https://support.stripe.com/topics/managed-payments)
- Secondary reporting (not primary; dates as stated by those sites): "both platforms remain operationally separate as of 2026"; Managed Payments "still in public preview as of early 2026"; "by April 2026, Stripe had shipped Managed Payments into its own API, adding a managed_payments flag to Checkout Sessions and Payment Links" — [iTechGuides](https://www.itechguides.com/stripe-acquires-payment-processing-startup-lemon-squeezy-what-the-deal-means-in-2026/); [DevTonic Studios](https://devtonicstudios.com/is-lemon-squeezy-still-safe-stripe-acquisition/); [Dodo (competitor)](https://dodopayments.com/blogs/lemon-squeezy-vs-stripe) (search summaries; unverified)
- A competitor article on the acquisition's 2026 implications returned HTTP 404 on 2026-10-07 — [Fungies (dead URL)](https://fungies.io/lemon-squeezy-stripe-acquisition-saas-founders-2026/)
- Reviewers report Lemon Squeezy "removed its public roadmap" after the acquisition — [TryOrBye](https://www.tryorbye.com/products/lemonsqueezy) (search summary; anecdotal)
- Price comparison of successor vs. predecessor on a $29 plan: Lemon Squeezy $2.10 (US) / $2.53 (intl) vs. Stripe Managed Payments $2.36 / $2.79 — [aliteq.com, 3 Oct 2026](https://aliteq.com/merchant-of-record-vs-stripe-tax)

### Inferences
- Lemon Squeezy is in maintenance mode: no pricing or feature announcements since the acquisition, an explicit migration intent, and a successor product that is priced higher (~6.4% + 30¢ all-in domestic vs. 5% + 50¢). Sellers evaluating MoRs in late 2026 therefore face a choice between a sunsetting product, a pricier Stripe-native MoR, and the cheaper challengers — which is exactly the decision the comparison content in Q3 targets.
- Because Stripe Managed Payments' fee is charged on the tax-inclusive amount, the effective premium over a tax-exclusive MoR rate is slightly larger than headline comparisons suggest in high-tax jurisdictions.

### Gaps
- No official statement found on whether Lemon Squeezy accepts new sellers in October 2026; inference from Trustpilot timing only.
- No official migration timeline, migration tooling, or sunset date for Lemon Squeezy was found.
- Stripe Managed Payments' current availability status (early access vs. GA) and country list were not confirmed from a dated Stripe page.
