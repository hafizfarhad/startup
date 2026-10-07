# Stripe Tax and other payment processors: US economic-nexus determination features (as of October 2026)

Scope note: all vendor documentation below was fetched on 2026-10-07 unless a page carries its own date. Stripe, Shopify Help Center, Square and PayPal help pages generally do not display "last updated" dates; where a date is shown it is quoted. US sales tax only. Competitor-authored comparisons (Galvix, TaxCloud, Zamp, NexusMonitor) are flagged as such.

## Key Question 1: Does Stripe Tax monitor US economic-nexus thresholds, for whom, how does it alert, what does it cost, and does it register the seller?

### Takeaway
Stripe Tax has a built-in "threshold monitoring" tool that compares Stripe-processed sales (plus off-Stripe invoices, Tax API transactions and, since a public preview, CSV-imported third-party transactions) against each state's economic-nexus threshold, shows a "Needs attention" status in the Dashboard and emails the account owner 1-2 days after a threshold is crossed. Monitoring is listed as "Included" at no separate charge in both pricing tiers and Stripe Tax fees only accrue where the seller is already registered; Stripe will register remote sellers in US states itself ("Register for me") but only on the Tax Complete subscription (from $90/month), and files US returns through TaxJar (a Stripe company) or partners.

### Cited Findings

**What it monitors and on what data**
- "Stripe Tax tracks your Stripe-processed sales (minus refunds) based on each customer's location and compares these sales against local tax registration thresholds. It uses your preset tax code and location attribution to calculate your total sales within the time windows defined by local tax rules." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- "Tax provides threshold monitoring primarily for payments processed by Stripe. The only out of band payments we currently include are invoices processed off of Stripe and transactions created using the Stripe Tax APIs." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Exceptions list on the same page: "We only monitor Stripe-processed sales or imported transactions"; "We assume that all sales are conducted with your preset tax code"; "We assume that all sales are taxable at the destination"; "obligations aren't monitored for your home US state or country"; "Obligations are only monitored in live mode"; "We can't differentiate between retail and wholesale sales"; "We can't differentiate between marketplace and non-marketplace sales"; "We don't monitor transactions that might contribute to exceeding a threshold to collect retail delivery fees, amusement taxes, or parking taxes"; "We treat obligations for tangible product sales and services the same." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Stripe notes that "Some US jurisdictions (such as Arizona, Indiana, and North Carolina) include nontaxable sales in their threshold calculations. This might require businesses that sell only nontaxable goods or services register and file a zero or information tax return." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Supported threshold time windows: "Previous or current year", "Previous year", "Rolling year by quarter", "Rolling 12 months". — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Location attribution order: (1) Stripe Tax validated address, (2) Customer object address, (3) AVS postal code, (4) card issuer country, (5) country-specific payment method, (6) customer IP address. For the US, "country-only information isn't enough to attribute locations to transactions. Transactions without state information appear under US unattributed revenue." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Latency: new transactions "are added to your monitoring threshold within 7 days (and often sooner...)"; refunds adjust thresholds "typically ... within 24-48 hours". — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Per-threshold transaction download exists but "Stripe Tax doesn't support historical reports on thresholds." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Disclaimer: "The threshold monitoring tool highlights potential registration obligations, but it's up to you to confirm whether registration is actually required in each jurisdiction." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Stripe's registration doc carries an explicit instruction (apparently aimed at its agent/LLM integration) not to advise: "Guide, don't advise: don't tell the user which jurisdictions they must register in or that they're legally obligated — route that determination to their tax advisor. Present the options (register directly, or ask Stripe or Taxually to register) and let the user choose." — [Stripe Docs: Register for sales tax, VAT, and GST](https://docs.stripe.com/tax/registering)

**Imported (non-Stripe) transactions**
- "Import transaction data from third-party platforms into Stripe Tax using CSV files. Consolidate sales data from multiple platforms to get a unified view of your tax obligations"; benefit listed as "Unified tax obligation monitoring: Monitor thresholds for all sales channels, including non-Stripe transactions." — [Stripe Docs: Import transactions into Stripe Tax](https://docs.stripe.com/tax/imports)
- Requirements and limits: CSV only, max 50MB, one row per line item, each line requires a Stripe `product_tax_code`, US/CA buyer postal code required; "You can import historical transaction data for any period on or after October 1, 2023"; "You can't remove imported transactions" (only void/version them). — [Stripe Docs: Import transactions into Stripe Tax](https://docs.stripe.com/tax/imports)
- Cost: "During the public preview, you can import CSV transactions for no fee. These imports also don't count against any entitlements or API usage limits." — [Stripe Docs: Import transactions into Stripe Tax](https://docs.stripe.com/tax/imports)
- Example `provider` values in the CSV spec include `amazon`, `tax_jar`, `shopify`. — [Stripe Docs: Import transactions into Stripe Tax](https://docs.stripe.com/tax/imports)

**Alerts**
- "Stripe Tax alerts you to potential tax obligations (known as economic nexus in the US) when your business reaches 10,000 USD in yearly revenue. We send notifications after you hit a threshold in any location. Stripe sends tax threshold notifications by email, and displays them in the Dashboard to the account owner." Emails come "from support+updates@stripe.com to the account owner's email" and list "locations generating over 5% of your revenue where you're not registered" plus a count of smaller locations. — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Preconditions: "You've opted into Stripe Tax"; "You've had 10,000 USD in revenue in the previous year"; "You don't have an active live mode tax registration for the location"; "You haven't received any tax threshold notification within the past 7 days." Timing: "After you cross a threshold, Stripe sends you a notification within 1 or 2 days"; subsequent changes are batched weekly. Preferences per location/region or full opt-out at Tax settings. — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Dashboard statuses: "Needs attention" (threshold exceeded / incomplete setup / draft application), "Collecting tax", "Not collecting tax", "Issue", "Registration in progress". — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Connect platforms: by default connected-account transactions "don't count toward your platform's tax registration thresholds"; a platform can opt to be "held liable" and then destination charges (and separate charges with `on_behalf_of`) are counted. A "tax threshold monitoring" embedded component lets connected accounts see their own thresholds; it is in "Private preview" and "doesn't include information such as unattributed revenue." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring); [Stripe Docs: Tax threshold monitoring embedded component](https://docs.stripe.com/connect/supported-embedded-components/tax-threshold-monitoring)

**Pricing**
- Tax Basic (pay-as-you-go): no-code "0.5% per transaction, where you're registered to collect taxes"; API "50¢ per transaction, where you're registered to collect taxes", "Each transaction includes 10 calculation API calls. 5¢ per calculation API call above 10." Tax obligation alerts/threshold monitoring shown as "Included" in both Tax Basic and Tax Complete. — [Stripe Tax pricing](https://stripe.com/tax/pricing)
- Tax Complete tiers (monthly, 1-year contracts): $90 (200 transactions, 2,000 calculations, 2 registrations, 4 filings); $430 (1,000 / 10,000 / 4 / 12); $1,000 (2,500 / 25,000 / 6 / 20); $1,500 (5,000 / 50,000 / 10 / 32); overages apply; non-US registration/filing examples cited: Colombia registration $1,050, Japan filing $4,745. Fees apply "only in jurisdictions where you have an active tax registration." — [Stripe Support: Understanding Stripe Tax pricing](https://support.stripe.com/questions/understanding-stripe-tax-pricing); [Stripe Tax pricing](https://stripe.com/tax/pricing)
- "Additional fees may apply for registrations and filings outside of the US, or if you exceed your plan's limits." — [Stripe Tax pricing](https://stripe.com/tax/pricing)

**Registration**
- "If you're an eligible remote seller with Tax Complete, select Register for me in the Dashboard to have Stripe prepare and submit your registration to the US tax authority." "Registrations are only available as part of a Tax Complete subscription." — [Stripe Docs: Use Stripe to register for sales tax](https://docs.stripe.com/tax/use-stripe-to-register)
- Performed by Stripe staff, not a partner: "One of Stripe's tax experts typically completes your registration with the state in 30 days or less. December, January, and February are high-volume months... registration takes 60 days or less." — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- Eligibility limits: must "Be a remote, out-of-state seller with no physical presence in the state"; "Have a US bank account" (for fee states); "Not have received a notice or set up an online account with the jurisdiction"; "Have no prior acquisitions of an existing business"; "No support for in-state registrations." — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- State fees passed through (debited by ACH): Arizona 12 USD + 1-50 USD per local jurisdiction; Colorado 16 USD per site + 50 USD deposit; Connecticut 100 USD; Hawaii 20 USD; Indiana 25 USD; Nevada 15 USD + deposit; South Carolina 50 USD; Washington 50 USD + 5 USD per DBA; West Virginia 30 USD; Wisconsin 20 USD; Wyoming 60 USD. — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- Non-US registrations are handed to a partner: "For tax jurisdictions outside the US, you can ask Stripe to register on your behalf through a Taxually account." — [Stripe Docs: Register for sales tax, VAT, and GST](https://docs.stripe.com/tax/registering)
- "Register for me ... doesn't prepare returns or remit tax." — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)

**Filing (hand-offs)**
- "Stripe files your US sales tax through TaxJar, a Stripe company"; "Automated US filing is available in all 46 US locations with a state-level sales and use tax"; "For TaxJar to file on your behalf, you need a Tax Complete subscription plan"; a US bank account is required. Imported CSV transactions can be added to a filing period. Filings exclude "Manual invoices created in Stripe without Stripe Tax applied", "Transactions using manual tax rates", and "Sales processed before Stripe Tax was enabled". — [Stripe Docs: File with Stripe in the US](https://docs.stripe.com/tax/file-with-stripe)
- Filing partners: Taxually (Tax Complete filing credits apply), Marosa (EU VAT, separate pricing), Hands-off Sales Tax (US/Canada, "Pricing starts at $55/return"). "Pricing varies by partner and filing location." — [Stripe Docs: File and remit](https://docs.stripe.com/tax/filing)

### Inferences
- Because Stripe Tax fees are charged only "where you're registered to collect taxes" and monitoring is "Included", a Stripe seller who has not yet registered anywhere can run threshold monitoring at zero marginal cost after opting into Stripe Tax; the cost appears once registrations are added and tax is calculated.
- Stripe does not document any "approaching threshold" (e.g., 80%) alert; notifications are documented only after a threshold is exceeded. Shopify (below) and competitors (Zamp) differentiate on pre-threshold alerts.
- The monitoring page's two statements (out-of-band limited to off-Stripe invoices and Tax API; "or imported transactions") are reconciled by the imports page: CSV imports are counted, but only if the seller does the export/format/upload work and maps every line to a Stripe product tax code.
- A seller is only eligible for "Register for me" if they are a pure remote seller with no state notice; sellers with physical presence or who already received a nexus notice are out of scope and must self-register or use a third party.

### Gaps
- No Stripe page states how many sellers use threshold monitoring or any measured accuracy/false-positive rate.
- The Stripe docs do not state whether the imports public preview has a planned end date or future price.
- Stripe does not document what happens to monitoring for Tax Basic users who never register (e.g., whether alerts continue indefinitely) beyond the stated preconditions.

## Key Question 2: Does Stripe publish a public, free state-by-state threshold table or nexus calculator outside the product? Is it sourced and dated?

### Takeaway
Stripe publishes per-state threshold details inside its public docs (one page per state, each linking to the state tax authority) and a grace-period table, but there is no single downloadable table, no public calculator, no API that exposes thresholds, and the docs pages are undated; Stripe's marketing guides are dated but only describe thresholds narratively and expressly disclaim accuracy.

### Cited Findings
- Per-state docs page example (New York): "Threshold: 500,000 USD and 100 transactions (both thresholds required)"; "Included transactions: Sales of tangible personal property, including wholesale and marketplace sales"; evaluation window "in previous four sales tax quarters"; "The thresholds exclude sales of services"; "Registration resources: New York Department of Taxation and Finance" (links to tax.ny.gov). No "last updated" date appears on the page. — [Stripe Docs: Collect tax in New York](https://docs.stripe.com/tax/supported-countries/united-states/collect-tax?tax-jurisdiction-united-states=new-york)
- The US index page links to 52 region pages (50 states, DC, Puerto Rico) and says "For each state and territory below, you can find information about registration thresholds, supported tax calculations, and relevant resources." — [Stripe Docs: Collect tax in the United States](https://docs.stripe.com/tax/supported-countries/united-states)
- A public grace-period-by-state table (e.g., "Texas: 1st day of the following month, 4 months after the threshold is exceeded based on a rolling 12 months"; "New York: 30 days after the threshold is exceeded") is published on the registration page, undated. — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- Marketing guide "Introduction to US sales tax and economic nexus": "Last updated November 24, 2025"; no state-by-state table; states only that "In most states, the threshold for economic nexus is $100,000 in sales or 200 transactions over 12 months... in Texas and California the threshold is $500,000"; no state DOR citations. — [Stripe Guides: Introduction to US sales tax and economic nexus](https://stripe.com/guides/introduction-to-us-sales-tax-and-economic-nexus)
- Marketing article "Sales Tax Nexus Laws: A State-by-State Guide": "Last updated July 21, 2026"; narrative list of deviations (New York $500,000 and 100 transactions; California $500,000; Texas $500,000; Alabama $250,000; Mississippi $250,000; Connecticut $100,000 and 200 transactions); cites South Dakota v. Wayfair and Streamlined Sales Tax FAQs, no state DOR links; disclaimer: "Stripe does not warrant or guarantee the accurateness, completeness, adequacy, or currency of the information in the article." — [Stripe Resources: Sales Tax Nexus Laws](https://stripe.com/resources/more/sales-tax-nexus-laws)
- Stripe's Tax Registrations API is for recording the seller's own registrations ("add your registrations to Stripe using ... Tax Registrations API"), not for reading threshold data. — [Stripe Docs: Register for sales tax, VAT, and GST](https://docs.stripe.com/tax/registering)

### Inferences
- The most authoritative public Stripe threshold data is scattered across 52 undated docs pages; a user wanting a comparison table must assemble it manually. This is less convenient than the single-page tables competitors (TaxCloud, Numeral, Avalara, etc.) publish, but Stripe's pages do link each state's tax authority.
- Stripe publishes no interactive nexus calculator or dataset download; its "calculator" is the authenticated Dashboard tool.

### Gaps
- I did not find any Stripe changelog documenting when state threshold values were last reviewed (e.g., for 2025-2026 state changes such as transaction-count repeals).
- Could not confirm whether Stripe's edge/preview docs expose a machine-readable threshold list; none was found in search.

## Key Question 3: Shopify Tax — liability insights, data scope, alerts, cost, public tables, registration and filing

### Takeaway
Shopify Tax's "tax liability insights" show economic-nexus status by state ("Action required" when a threshold is met; "Monitoring" at 80% of a threshold) using net Shopify orders plus imported orders with valid shipping addresses; Shopify Tax is free on the first $100,000 of US sales (now described as lifetime for stores created after May 13, 2026) then 0.35% (0.25% Plus) per order in states where collection is on; Shopify publishes an undated per-state threshold reference with links to state authorities; it does not register sellers, and its Sovos-powered automated filing ($75/$50 per return) is currently closed to new enrollment.

### Cited Findings
- Liability insights scope: "Tax liability is displayed for states that have economic nexus tax laws at the state level"; physical nexus: "When you have a business location in one or more states, you automatically have a physical liability." — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Data used: "Transactions that occur within Shopify. This includes marketplace transactions, where required by state law." and "Orders imported into Shopify that include valid shipping addresses." Orders without addresses are excluded. — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Calculation basis: "Tax liability is calculated using net sales, not gross sales. Net sales are sales less refunds, shipping, or tax." — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Statuses: "Action required" for identified potential liabilities and "Monitoring" for states reaching 80% of threshold; "Sales aren't reflected immediately in your tax liabilities and might take a few days to update." — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Disclaimer: "This is not a substitute for advice from a tax authority or a tax professional. It's your responsibility to determine where you need to charge and to remit taxes." — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Pricing (marketing page, accessed 2026-10-07): "Shopify Tax is free on your first $100,000 of lifetime sales"; "0.35% calculation fee" ("0.25% for Shopify Plus merchants") on orders in states where tax collection is activated; example $30 t-shirt = $0.11 ($0.08 Plus); pricing stated to apply to "stores created after May 13, 2026, with less than $25,000,000 USD annual sales", others to contact a Customer Success Manager; "Liability insights: Understand your liability with a state-by-state obligation overview" listed as a feature; filing and registration not included. — [Shopify Tax](https://www.shopify.com/tax)
- Original 2022 launch terms (dated Oct 13, 2022): "There will never be costs for the first $100,000 of US sales each calendar year"; "0.35% (0.25% for Shopify Plus merchants)"; cap of "$0.99 per transaction"; "Total annual Shopify Tax costs will be capped at $5,000 USD for Shopify Plus stores" (2023 promotion). — [Value Added Resource (Oct 13, 2022)](https://www.valueaddedresource.net/shopify-tax-helps-merchants-with-sales-tax-but-at-what-cost/)
- Secondary 2026 summary: fee "capped at a maximum of $0.99 per order" and "a maximum of $5,000 per year per region"; free "first $100,000 in annual or lifetime sales (depending on when the store was created)". — [TaxCloud: Shopify Sales Tax Setup Guide (2026)](https://taxcloud.com/blog/the-ultimate-shopify-sales-tax-guide/) (competitor)
- Public threshold reference: per-state accordion tables, e.g., New York "$500,000 USD in sales and 100 orders" (previous four tax quarters); California "$500,000 USD in sales" (previous or current calendar year); Texas "$500,000" (12-month rolling); Alabama "$250,000"; Mississippi "$250,000"; Connecticut "$100,000 USD in sales and 200 orders"; Illinois "$100,000 USD in sales or 200 orders"; links to state tax authorities; no "last updated" date; disclaimer: "The following information is a general guide to US sales taxes and doesn't replace any official government information or regulations." — [Shopify Help Center: US tax reference](https://help.shopify.com/en/manual/taxes/us/us-tax-reference)
- Registration: the help page directs users to "register for sales tax with the state's tax authority" and links to authorities; no Shopify registration service. — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability); "Shopify doesn't handle sales tax registration at all." — [TaxCloud: Does Shopify file sales tax?](https://taxcloud.com/blog/does-shopify-file-sales-tax/) (competitor)
- Filing: Sovos announced on June 10, 2025 that it "partnered with Shopify to launch Shopify Tax automated filing ... available to eligible merchants in the United States using Shopify Tax." — [Sovos press release (June 10, 2025)](https://sovos.com/press-releases/sovos-partners-with-shopify-to-automate-sales-tax-filing-and-remittance-for-merchants/)
- Filing price: "$75 for each return generated by automated filing" (Basic, Grow, Advanced); "$50" (Plus); "Fees charged for your returns are based on generated returns, not filing"; unfiled returns due to errors "aren't refundable". — [Shopify Help Center: Automated filing pricing](https://help.shopify.com/en/manual/taxes/shopify-tax/automated-filing/pricing)
- Filing status and scope: "Automated filing is closed to new enrollment"; "available only for stores in the United States"; "not available if you used a tax service other than Shopify Tax in 2025"; excluded data: "Imported orders. Sales channels that aren't connected to Shopify. Marketplaces where you aren't the merchant of record, such as Amazon, Meta, or TikTok." — [Shopify Help Center: Automated filing considerations](https://help.shopify.com/en/manual/taxes/shopify-tax/automated-filing/considerations)
- Merchant confusion example: a store owner asked (Jan 8, 2024) whether tax would "only be automatically applied to customers once the store's total sales in the United States reach the $100,000 threshold"; a community member (not Shopify staff) answered (Feb 28, 2024) that the $100,000 is Shopify's billing threshold, distinct from state nexus thresholds, and that merchants must manually add states to collect in. — [Shopify Community thread](https://community.shopify.com/t/clarification-on-automatic-tax-application-and-100-000-threshold-for-shopify-tax/283178)

### Inferences
- Shopify's "Monitoring" status at 80% is the only documented pre-threshold signal among the six processors reviewed; Stripe documents only post-crossing alerts.
- Shopify's liability insights ingest imported orders with addresses, so a multi-channel seller can approximate cross-channel monitoring by importing orders, but Shopify's own filing product then excludes those imported orders, so the two features are inconsistent in scope.
- The shift in wording from "$100,000 ... each calendar year" (2022) to "$100,000 of lifetime sales" (2026 marketing page, for stores created after May 13, 2026) indicates a pricing tightening; the exact terms for older stores are not stated publicly.

### Gaps
- I could not retrieve a Help Center page that pins current Shopify Tax pricing (the help.shopify.com/en/manual/taxes/us/shopify-tax URL returned only an intro page), so the $0.99 per-order and $5,000 per-year caps for 2026 rest on secondary sources (TaxCloud 2026; Value Added Resource 2022).
- Whether liability insights are also available on the free "Basic Tax" tier (vs only Shopify Tax) was not confirmed from a Shopify page; the marketing page lists it under Shopify Tax.
- The liability page does not say whether Shopify emails merchants when a state reaches "Action required"; no alert channel is documented there.

## Key Question 4: Square — what does it do for nexus?

### Takeaway
Square calculates tax from seller-configured rates or an automatic US rate lookup limited to states the seller has "enrolled", and explicitly says enrollment "does not constitute registration"; it has no economic-nexus threshold monitoring, and its only public nexus content is a 2015 (pre-Wayfair) blog post.

### Cited Findings
- Square Online offers "Apply automatically generated tax rates" or "Manually apply taxes based on destination"; "Square sets your tax enrollment based on your Square locations, but you can always add more if you plan to ship orders from a state in which you have a business presence"; "Tax enrollment retrieves the applicable tax rate based on your inputs during the order process, but does not constitute registration with any tax authority." No fee is mentioned for automatic calculation; no mention of economic nexus thresholds. — [Square Support: Create and manage sales tax settings](https://squareup.com/help/us/en/article/5061-create-and-manage-your-tax-settings)
- Square disclaimer: "we cannot guarantee the applicability and accuracy of our tax tools. We also cannot offer tax advice or consulting services. It is solely your responsibility to accurately configure, charge, collect, and remit applicable taxes on your orders." — [Square Support: Create and manage sales tax settings](https://squareup.com/help/us/en/article/5061-create-and-manage-your-tax-settings)
- Square community moderators (Dec 9 and Dec 12, 2023) answering nexus questions said taxes are "calculated based on your settings" and directed sellers to "reach out to an Accountant or the Revenue Department of your State". — [Square Community: Square Online Tax Nexus Questions](https://community.squareup.com/t5/Online-Store/Square-Online-Tax-Nexus-Questions/m-p/698511)
- Square's public "Sales Tax Nexus, A Crash Course" is dated Jan 22, 2015 (pre-Wayfair, no thresholds). — [Square: Sales tax guide collection](https://squareup.com/us/en/townsquare/sales-tax-nexus-a-crash-course)
- Third-party vendor claim (competitor/vendor source): "Square's dashboard shows your transaction history and sales data, but it doesn't automatically categorize sales by state or flag nexus thresholds." — [NexusMonitor blog: Track Sales Tax Nexus on Square (2026)](https://nexusmonitor.app/blog/track-sales-tax-nexus-square-2026)

### Inferences
- Square's "tax enrollment" model requires the seller to already know where they have nexus; Square supplies rates, not a nexus decision.

### Gaps
- No Square page on economic nexus thresholds post-2018 was found; Square publishes no threshold table.

## Key Question 5: PayPal — what does it do for nexus?

### Takeaway
PayPal (Payments Standard, Checkout, POS/Zettle) applies sales tax only at rates the seller enters by state or ZIP in the account profile; it does not determine rates, nexus or thresholds, and its help content says tax correctness is the seller's responsibility.

### Cited Findings
- "From the sales tax settings in your PayPal account profile, you can create sales tax rates for a state, zip code, or zip code range"; "After you set up sales tax rates in your account profile, PayPal calculates the tax for purchase transactions automatically ... based on the shipping addresses they provide"; most-specific rate wins. — [PayPal Developer: Customize PayPal checkout pages (Payments Standard)](https://developer.paypal.com/api/nvp-soap/paypal-payments-standard/integration-guide/checkout-settings/) (note: this URL and the ProfileAndTools URL returned HTTP 404 on direct fetch on 2026-10-07; content is from search snippets)
- PayPal POS help: "Remember, it's your responsibility to make sure you're collecting the right amount of tax for your region. Consult with a tax expert if you're unsure." No mention of nexus. — [PayPal Help: How do I set up taxes in my Point of Sale?](https://www.paypal.com/us/cshelp/article/how-do-i-set-up-taxes-in-my-point-of-sale-help584)
- TaxJar's guide confirms the model: "You'll need to know the tax rate ahead of time—PayPal won't figure it out for you." — [TaxJar: Sales Tax Guide for PayPal Users](https://www.taxjar.com/sales-tax/paypal-sales-tax)
- Older context (2015): Avalara's guidance that sellers must separately determine nexus before configuring PayPal rates. — [Avalara blog (Apr 2015)](https://www.avalara.com/blog/en/north-america/2015/04/what-online-sellers-need-to-know-about-setting-up-paypal.html) (dated, pre-Wayfair)

### Inferences
- PayPal offers less than Square: no automatic rate lookup, no state enrollment concept, and no nexus signal of any kind.

### Gaps
- No PayPal page discussing economic nexus or thresholds was found; PayPal's corporate newsroom piece "5 Keys to Sales Tax Compliance" surfaced in search but was not fetched and its date is unknown.

## Key Question 6: Adyen — what does it do for nexus?

### Takeaway
No merchant-facing sales-tax calculation or nexus feature was found in Adyen's docs or help center; Adyen's "sales tax" content concerns the tax Adyen charges merchants on its own invoices (Adyen's nexus, not the merchant's), US 1099-K tax forms for platforms, and Level 2/3 card data fields.

### Cited Findings
- "Adyen adds VAT / GST / sales tax on invoices to our merchants." "Adyen is registered for sales tax in most states in the US, and will charge sales tax as applicable based on the merchant's state and location within that state." — [Adyen Help: What kind of tax is applied to my invoice?](https://help.adyen.com/knowledge/finance/invoices/what-kind-of-tax-is-applied-to-my-invoice)
- "On 1 May 2021, Adyen started charging sales tax for certain services rendered in some US states in which we have nexus"; "Adyen does not deduct sales tax or value-added tax (VAT) from your settlement batches." — [Adyen Docs: Payment processing invoice](https://docs.adyen.com/reporting/invoice-reconciliation/payment-processing-invoice)
- A search restricted to docs.adyen.com, help.adyen.com and adyen.com for "sales tax calculation nexus merchant" returned only invoice-tax, 1099-K tax-form, and Level 2/3 data pages. — [Adyen Docs: Level 2/3 data](https://docs.adyen.com/payment-methods/cards/enhanced-scheme-data/l2-l3); [Adyen Docs: Provide tax forms (US only)](https://docs.adyen.com/marketplaces/us-tax-forms)
- A third-party marketplace guide claims platforms using Adyen for Platforms "can calculate and collect applicable taxes" and "configure tax rates and rules within Adyen's platform" — this is Sharetribe's description, not Adyen documentation, and no Adyen page corroborating a tax-rate engine was found. — [Sharetribe: Adyen for Platforms overview (2026)](https://www.sharetribe.com/academy/marketplace-payments/adyen-for-platforms-overview/)

### Inferences
- Adyen merchants must use an external tax engine (Avalara, Vertex, etc.) for calculation and any nexus tracking; Adyen provides only the tax-amount field pass-through for Level 2/3 interchange.

### Gaps
- No Adyen partner page for a sales-tax engine was found; absence in search is not proof there is none.

## Key Question 7: Braintree — what does it do for nexus?

### Takeaway
Braintree (a PayPal service) has no native tax settings or nexus tracking; it only accepts a `taxAmount` field for Level 2/3 interchange qualification, and relies on third-party tax tools (TaxJar, Avalara, Zip2Tax, TaxCloud) integrated at the merchant's application layer.

### Cited Findings
- "Braintree doesn't have its own tax settings and uses third-party integration for sales tax calculation"; listed integrations: "TaxJar, Zip2Tax, Avalara". — [TaxValet: Braintree sales tax software integration](https://thetaxvalet.com/connectors-search/braintree)
- Level 2: "include the taxAmount field in the Transaction: Sale call"; "US merchants must pass a taxAmount between 0.1% and 22% for Visa transactions, and between 0.1% and 30% for Mastercard transactions"; the "tax amount does not add to the total transaction amount." — [Braintree Docs: Level 2 and 3 processing required fields](https://developer.paypal.com/braintree/docs/reference/general/level-2-and-3-processing/required-fields/php/); [Braintree Docs: Transaction: Sale](https://developer.paypal.com/braintree/docs/reference/request/transaction/sale/php/)
- TaxCloud announced a Braintree partnership in March 2013 (dated). — [PRWeb (Mar 2013)](https://www.prweb.com/releases/2013/3/prweb10570985.htm)
- A paid-reviews site notes "Braintree does offer these partnerships but with limited documentation to help you get the integration up and running." — [Paddle: Braintree alternatives](https://www.paddle.com/alternatives/braintree) (competitor)

### Inferences
- For nexus purposes Braintree is equivalent to Adyen: a pure gateway whose only tax surface is a field the merchant must fill.

### Gaps
- No current Braintree page listing tax partners was found; the TaxCloud partnership is 13 years old and its current status is unverified.

## Key Question 8: What these processors do NOT do (cross-channel aggregation, neutral comparisons, sourcing, datasets/APIs)

### Takeaway
None of the six provides automatic cross-channel aggregation (Stripe and Shopify accept manual CSV/order imports; the others accept nothing), none publishes a neutral comparison of compliance tools or merchants of record (each funnels to its own product or named partners), none publishes a dated, sourced master threshold table, and none exposes thresholds as a downloadable dataset or API.

### Cited Findings
- Stripe cross-channel: only via manual CSV import, one row per line item with Stripe tax codes, data on/after Oct 1, 2023, "public preview". — [Stripe Docs: Import transactions](https://docs.stripe.com/tax/imports)
- Stripe cannot distinguish marketplace from direct sales for thresholds: "We can't differentiate between marketplace and non-marketplace sales." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Shopify cross-channel: liability insights count "Orders imported into Shopify that include valid shipping addresses" but filing excludes "Imported orders. Sales channels that aren't connected to Shopify. Marketplaces where you aren't the merchant of record." — [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability); [Shopify Help Center: Automated filing considerations](https://help.shopify.com/en/manual/taxes/shopify-tax/automated-filing/considerations)
- Stripe's partner list is confined to its marketplace partners (Taxually, Marosa, Hands-off Sales Tax, TaxJar) with "Pricing varies by partner"; no comparison of outside tools. — [Stripe Docs: File and remit](https://docs.stripe.com/tax/filing)
- Stripe's public guides disclaim currency: "Stripe does not warrant or guarantee the accurateness, completeness, adequacy, or currency of the information." — [Stripe Resources: Sales Tax Nexus Laws (updated July 21, 2026)](https://stripe.com/resources/more/sales-tax-nexus-laws)
- Shopify's reference carries no date and a general-guide disclaimer. — [Shopify Help Center: US tax reference](https://help.shopify.com/en/manual/taxes/us/us-tax-reference)
- Square, PayPal, Adyen and Braintree publish no state threshold tables (see Questions 4-7 sources).
- Third-party monitors exist precisely to fill the gap, e.g., NexusMonitor "connects to Shopify, WooCommerce, and Square" and "watches economic nexus thresholds across 46+ states and warns you before you cross them." — [NexusMonitor blog (2026)](https://nexusmonitor.app/blog/track-sales-tax-nexus-square-2026) (vendor claim)

### Inferences
- A seller who sells on Shopify + Amazon + Stripe-powered site has no processor-native tool that aggregates all three automatically; Stripe's CSV import is the closest, but the burden of extraction, tax-code mapping and re-uploading rests on the seller.
- Neither Stripe nor Shopify cites the statute or DOR bulletin behind each threshold on the page where the threshold appears; both link to the DOR homepage/registration portal instead.

### Gaps
- No evidence either way on whether Stripe or Shopify internally track threshold-law change dates; nothing public.

## Key Question 9: Public statements or reviews on the accuracy or limits of Stripe Tax threshold monitoring

### Takeaway
Independent commentary (mostly from competitors, 2026) consistently cites one limit: Stripe monitors only Stripe-processed plus imported sales, so multi-channel sellers can cross a state threshold without an alert; Stripe's own docs acknowledge the assumptions (preset tax code, destination taxability, no retail/wholesale or marketplace distinction). No measured accuracy studies or substantive Reddit/G2 complaints specific to threshold accuracy were found.

### Cited Findings
- Galvix (competitor; updated Sept 23, 2026): Stripe monitors "solely on transactions processed through its own payment infrastructure"; "a seller whose combined sales across all channels cross a state's $100,000 threshold may never receive a Stripe alert"; also claims "Returns prepared through Stripe's filing partners are submitted to state authorities without a dedicated specialist reviewing each return before state submission"; and asserts Stripe "does not handle the actual state registration process on the business's behalf" — contradicted by Stripe's "Register for me" documentation (Tax Complete). — [Galvix: How Stripe Sales Tax Automation Works](https://www.galvix.com/article/stripe-sales-tax-automation-guide/); contradicted by [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- TaxCloud (competitor; updated June 10, 2026): "A major drawback of Stripe Tax is that it only monitors nexus for Stripe-processed sales and imported transactions"; "Stripe Tax is designed primarily for businesses that already rely on Stripe for payment processing." — [TaxCloud: Anrok vs. Stripe Tax](https://taxcloud.com/blog/anrok-vs-stripe-tax-comparison/)
- Zamp (competitor; published May 4, 2026, updated Sept 15, 2026): Stripe Tax "monitors economic nexus thresholds for Stripe-processed sales and flags when revenue crosses a state threshold"; businesses with "multi-channel sales ... often compare it with flexible managed services." Zamp separately claims it "delivers 80% of nexus alerts before the threshold is crossed" (self-promotional). — [Zamp: Best Sales Tax Automation Software for Stripe](https://zamp.com/blog/best-sales-tax-automation-software-stripe/); [Zamp: Ecommerce sales tax software comparison](https://zamp.com/blog/ecommerce-sales-tax-software-comparison-guide)
- G2 ratings reported second-hand by Zamp: TaxJar (Stripe) 4.7/5 across 252 reviews, with "several reviewers note a decline in support quality after the Stripe acquisition." — [Zamp: Ecommerce sales tax software comparison (2026)](https://zamp.com/blog/ecommerce-sales-tax-software-comparison-guide) (secondary; competitor)
- Acodei (Stripe-QuickBooks integration vendor; undated): "Calculation is automatic. Registration and filing involve either you or a partner, so 'Stripe Tax handles my taxes' is not quite the right mental model." — [Acodei glossary: Stripe Tax](https://www.acodei.com/glossary/stripe-tax)
- Stripe's own limits: "Stripe only notifies you when you have exceeded a tax threshold based on Stripe's calculations"; "it's up to you to confirm whether registration is actually required." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)

### Inferences
- The one concrete factual error found in competitor commentary (Galvix saying Stripe does not register sellers) suggests that third-party reviews lag Stripe's product changes; the Stripe docs should be treated as authoritative on current features.
- The absence of accuracy complaints is weak evidence: Stripe's alerts are conservative (only after crossing, only Stripe data), so the likelier failure mode is a missed obligation that the seller never attributes to Stripe.

### Gaps
- A targeted search for Reddit threads about wrong/missed Stripe Tax nexus alerts returned only Stripe's own pages; no first-hand user reports were found.
- No G2 page for "Stripe Tax" (as distinct from TaxJar) was fetched; the 4.7/252 figure is for TaxJar as reported by a competitor.

## Key Question 10: What does a seller who does NOT use the processor, or who sells through several channels, get?

### Takeaway
Non-customers get only public reading material: Stripe's undated per-state docs pages (thresholds, included-transaction notes, DOR links, grace periods) and dated marketing guides; Shopify's undated per-state reference with DOR links. All in-product monitoring requires an account (Stripe: opt into Stripe Tax; Shopify: a store). Multi-channel sellers must import data manually (Stripe CSV, Shopify order import) and Square/PayPal/Adyen/Braintree offer nothing.

### Cited Findings
- Stripe monitoring requires: "You've opted into Stripe Tax" and monitoring is "only in live mode." — [Stripe Docs: Monitor your obligations](https://docs.stripe.com/tax/monitoring)
- Stripe public per-state pages are open (e.g., New York thresholds and link to tax.ny.gov). — [Stripe Docs: Collect tax in New York](https://docs.stripe.com/tax/supported-countries/united-states/collect-tax?tax-jurisdiction-united-states=new-york)
- Stripe public grace-period table is open. — [Stripe Docs: Use Stripe to register](https://docs.stripe.com/tax/use-stripe-to-register)
- Stripe CSV import (free in preview) is the route for non-Stripe channels but requires a Stripe account and Stripe tax codes per line. — [Stripe Docs: Import transactions](https://docs.stripe.com/tax/imports)
- Shopify public reference is open; liability insights are inside the admin and count imported orders with addresses. — [Shopify Help Center: US tax reference](https://help.shopify.com/en/manual/taxes/us/us-tax-reference); [Shopify Help Center: US tax liability](https://help.shopify.com/en/manual/taxes/us/us-tax-liability)
- Square: rates only, "does not constitute registration"; PayPal: seller-entered rates; Adyen and Braintree: tax-amount field only. — [Square Support](https://squareup.com/help/us/en/article/5061-create-and-manage-your-tax-settings); [PayPal Help](https://www.paypal.com/us/cshelp/article/how-do-i-set-up-taxes-in-my-point-of-sale-help584); [Adyen Docs L2/L3](https://docs.adyen.com/payment-methods/cards/enhanced-scheme-data/l2-l3); [Braintree Docs](https://developer.paypal.com/braintree/docs/reference/general/level-2-and-3-processing/required-fields/php/)

### Inferences
- The processors' public threshold content is a by-product of product documentation, not a maintained reference: no dates, no statute citations, no change history, no export. That is the main white space for a neutral, sourced, dated nexus wizard.
- The only free, in-product nexus monitoring with any cross-channel reach is Stripe's (via CSV import) and Shopify's (via imported orders); both are tied to holding an account and both exclude the processor's own filing scope for imported data.

### Gaps
- Whether a Stripe account with zero Stripe payment volume can rely solely on CSV imports for monitoring (and whether the $10,000 prior-year revenue alert precondition counts imported revenue) is not stated in Stripe's docs.
