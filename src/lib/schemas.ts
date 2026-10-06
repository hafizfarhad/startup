import { z } from "astro/zod";

export const US_JURISDICTION_COUNT = 51;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ONE_DAY_MS = 86_400_000;

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isRealDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export const isoDate = z
  .string()
  .regex(ISO_DATE, "must be YYYY-MM-DD")
  .refine(isRealDate, "must be a real calendar date")
  .refine((s) => s <= todayIso(new Date(Date.now() + ONE_DAY_MS)), "must not be in the future (one day of timezone tolerance)");

export const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "must be https");

const finiteNumber = z.number().refine(Number.isFinite, "must be finite");
const nonNegative = finiteNumber.refine((n) => n >= 0, "must be 0 or more");

export const sourceSchema = z.object({
  url: httpsUrl,
  publisher: z.string().min(1),
  title: z.string().min(1),
  accessed_on: isoDate,
});

export const verificationLevel = z.enum(["official", "corroborated", "single_secondary", "pending"]);

export const verificationSchema = z.object({
  level: verificationLevel,
  verified_on: isoDate,
});

export const reviewSchema = z
  .object({
    status: z.enum(["unreviewed", "reviewed"]),
    by: z.string().min(1).nullable(),
    on: isoDate.nullable(),
  })
  .refine((r) => r.status !== "reviewed" || (r.by !== null && r.on !== null), {
    message: "reviewed rows need `by` and `on`",
  });

export const thresholdRule = z.enum(["sales_only", "sales_or_transactions", "sales_and_transactions", "none"]);
export const comparator = z.enum(["exceeds", "meets_or_exceeds"]).nullable();
export const salesMeasure = z.enum(["gross", "taxable", "retail"]).nullable();

export const nexusRowSchema = z
  .object({
    code: z.string().regex(/^[A-Z]{2}$/, "two-letter USPS code"),
    name: z.string().min(1),
    has_state_sales_tax: z.boolean(),
    sales_threshold_usd: nonNegative.nullable(),
    transactions_threshold: z.number().int().nonnegative().nullable(),
    threshold_rule: thresholdRule,
    comparator,
    sales_measure: salesMeasure,
    measurement_period: z.string().min(1).nullable(),
    includes_marketplace_sales: z.boolean().nullable(),
    effective_date: isoDate.nullable(),
    registration_url: httpsUrl.nullable(),
    notes: z.string(),
    sources: z.array(sourceSchema),
    verification: verificationSchema,
    review: reviewSchema,
  })
  .superRefine((row, ctx) => {
    const pending = row.verification.level === "pending";
    const hasSales = row.sales_threshold_usd !== null;
    const hasTx = row.transactions_threshold !== null;
    const issue = (message: string) => ctx.addIssue({ code: "custom", message: `${row.code}: ${message}` });

    if (!pending && row.sources.length === 0) issue("non-pending rows need at least one source");
    if (pending && (hasSales || hasTx || row.comparator !== null || row.measurement_period !== null)) {
      issue("pending rows must not carry figures");
    }
    if (row.threshold_rule === "none" && (hasSales || hasTx)) issue("rule none must have null thresholds");
    if (row.threshold_rule === "sales_only" && (!hasSales || hasTx)) {
      issue("sales_only needs a sales threshold and no transaction threshold");
    }
    if (
      (row.threshold_rule === "sales_or_transactions" || row.threshold_rule === "sales_and_transactions") &&
      (!hasSales || !hasTx)
    ) {
      issue("rules involving transactions need both thresholds");
    }
    if (!row.has_state_sales_tax && row.threshold_rule !== "none" && row.notes.trim() === "") {
      issue("a no-sales-tax jurisdiction with thresholds must explain the regime in notes");
    }
  });

export const toolCategory = z.enum(["compliance_software", "merchant_of_record"]);
export const pricingModel = z.enum([
  "per_filing",
  "per_jurisdiction_month",
  "percent_plus_fixed",
  "tiered_subscription",
  "quote_only",
]);

export const pricingSchema = z.object({
  registration_fee_usd: nonNegative.nullable(),
  filing_fee_usd: nonNegative.nullable(),
  per_jurisdiction_month_usd: nonNegative.nullable(),
  percent_fee: finiteNumber.refine((n) => n >= 0 && n <= 100, "percent between 0 and 100").nullable(),
  fixed_fee_usd: nonNegative.nullable(),
  starting_monthly_usd: nonNegative.nullable(),
  pricing_url: httpsUrl.nullable(),
});

export const toolRowSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case slug"),
    name: z.string().min(1),
    category: toolCategory,
    website_url: httpsUrl,
    pricing_model: pricingModel,
    pricing_public: z.boolean(),
    pricing: pricingSchema,
    us_sales_tax_supported: z.boolean(),
    notes: z.string(),
    sources: z.array(sourceSchema).min(1),
    verification: verificationSchema,
    review: reviewSchema,
  })
  .superRefine((row, ctx) => {
    const p = row.pricing;
    const numeric = [
      p.registration_fee_usd,
      p.filing_fee_usd,
      p.per_jurisdiction_month_usd,
      p.percent_fee,
      p.fixed_fee_usd,
      p.starting_monthly_usd,
    ];
    const quote = row.pricing_model === "quote_only";
    const issue = (message: string) => ctx.addIssue({ code: "custom", message: `${row.slug}: ${message}` });

    if (row.verification.level === "pending") issue("tools are included only once their pricing page was fetched");
    if (quote === row.pricing_public) issue("pricing_public must be false exactly when pricing_model is quote_only");
    if (quote && numeric.some((v) => v !== null)) issue("quote_only rows must have null prices");
    if (row.pricing_model === "per_filing" && p.filing_fee_usd === null) issue("per_filing needs filing_fee_usd");
    if (row.pricing_model === "per_jurisdiction_month" && p.per_jurisdiction_month_usd === null) {
      issue("per_jurisdiction_month needs per_jurisdiction_month_usd");
    }
    if (row.pricing_model === "percent_plus_fixed" && p.percent_fee === null) issue("percent_plus_fixed needs percent_fee");
    if (row.pricing_model === "tiered_subscription" && p.starting_monthly_usd === null) {
      issue("tiered_subscription needs starting_monthly_usd");
    }
  });

export const changelogEntrySchema = z.object({
  date: isoDate,
  dataset: z.enum(["us-economic-nexus", "tools", "site"]),
  subject: z.string().min(1),
  change: z.string().min(1),
  source_url: httpsUrl.nullable(),
});

export type Source = z.infer<typeof sourceSchema>;
export type VerificationLevel = z.infer<typeof verificationLevel>;
export type NexusRow = z.infer<typeof nexusRowSchema>;
export type ToolRow = z.infer<typeof toolRowSchema>;
export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;
