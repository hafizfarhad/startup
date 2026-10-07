import { fmtUsd } from "../format";
import type { ToolRow } from "../schemas";

export const FILINGS_PER_STATE_PER_YEAR = 4;

export type CostSummary = {
  registrationCount: number;
  totalSalesUsd: number;
  totalTransactions: number | undefined;
};

export type ToolCostEstimate = {
  slug: string;
  name: string;
  category: ToolRow["category"];
  pricingModel: ToolRow["pricing_model"];
  annualEstimateUsd: number | null;
  label: "estimate" | "from" | "custom_quote";
  notes: string[];
};

export function estimateToolCost(tool: ToolRow, summary: CostSummary): ToolCostEstimate {
  const base = { slug: tool.slug, name: tool.name, category: tool.category, pricingModel: tool.pricing_model };
  const p = tool.pricing;
  const R = summary.registrationCount;

  switch (tool.pricing_model) {
    case "quote_only":
      return { ...base, annualEstimateUsd: null, label: "custom_quote", notes: ["Pricing is not public; request a quote."] };

    case "per_filing": {
      const notes = [`Assumes ${FILINGS_PER_STATE_PER_YEAR} filings per registered state per year.`];
      if (p.registration_fee_usd === null) notes.push("Registration fee not published; excluded.");
      if (R === 0) notes.push("No registrations indicated.");
      const total = R * (p.registration_fee_usd ?? 0) + R * FILINGS_PER_STATE_PER_YEAR * (p.filing_fee_usd ?? 0);
      return { ...base, annualEstimateUsd: Math.round(total), label: "estimate", notes };
    }

    case "per_jurisdiction_month": {
      const notes = R === 0 ? ["No registrations indicated."] : [];
      const total = R * (p.per_jurisdiction_month_usd ?? 0) * 12;
      return { ...base, annualEstimateUsd: Math.round(total), label: "estimate", notes };
    }

    case "tiered_subscription": {
      if (R === 0) {
        return { ...base, annualEstimateUsd: 0, label: "estimate", notes: ["No registrations indicated."] };
      }
      return {
        ...base,
        annualEstimateUsd: Math.round((p.starting_monthly_usd ?? 0) * 12),
        label: "from",
        notes: ["Starting tier; higher tiers may apply at your volume."],
      };
    }

    case "percent_plus_fixed": {
      const notes = ["Merchants of record collect and remit in place of your own registrations."];
      const percentPart = ((p.percent_fee ?? 0) / 100) * summary.totalSalesUsd;
      let fixedPart = 0;
      if (p.fixed_fee_usd !== null) {
        if (summary.totalTransactions === undefined) {
          notes.push(
            `Per-transaction fee of ${fmtUsd(p.fixed_fee_usd)} omitted: enter transaction counts on every line to include it.`,
          );
        } else {
          fixedPart = p.fixed_fee_usd * summary.totalTransactions;
        }
      }
      return { ...base, annualEstimateUsd: Math.round(percentPart + fixedPart), label: "estimate", notes };
    }
  }
}

export function estimateToolCosts(tools: ToolRow[], summary: CostSummary): ToolCostEstimate[] {
  return tools.map((tool) => estimateToolCost(tool, summary));
}
