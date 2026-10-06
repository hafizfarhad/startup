import type { NexusRow, ToolRow } from "../src/lib/schemas";

export const DATE = "2026-01-15";
export const SRC = {
  url: "https://example.com/source",
  publisher: "Example Publisher",
  title: "Example source page",
  accessed_on: DATE,
};

export function makeRow(overrides: Partial<NexusRow> = {}): NexusRow {
  return {
    code: "ZZ",
    name: "Testland",
    has_state_sales_tax: true,
    sales_threshold_usd: 100000,
    transactions_threshold: null,
    threshold_rule: "sales_only",
    comparator: null,
    sales_measure: "gross",
    measurement_period: "Previous or current calendar year",
    includes_marketplace_sales: null,
    effective_date: "2019-01-01",
    registration_url: null,
    notes: "",
    sources: [SRC],
    verification: { level: "corroborated", verified_on: DATE },
    review: { status: "unreviewed", by: null, on: null },
    ...overrides,
  };
}

export function makeTool(overrides: Partial<ToolRow> = {}): ToolRow {
  return {
    slug: "example-tool",
    name: "Example Tool",
    category: "compliance_software",
    website_url: "https://example.com",
    pricing_model: "per_filing",
    pricing_public: true,
    pricing: {
      registration_fee_usd: 150,
      filing_fee_usd: 75,
      per_jurisdiction_month_usd: null,
      percent_fee: null,
      fixed_fee_usd: null,
      starting_monthly_usd: null,
      pricing_url: "https://example.com/pricing",
    },
    us_sales_tax_supported: true,
    notes: "",
    sources: [SRC],
    verification: { level: "official", verified_on: DATE },
    review: { status: "unreviewed", by: null, on: null },
    ...overrides,
  };
}
