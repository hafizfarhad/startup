import type { NexusRow, ToolRow, VerificationLevel } from "./schemas";

export function fmtUsd(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function ruleLabel(rule: NexusRow["threshold_rule"]): string {
  switch (rule) {
    case "sales_only":
      return "Sales only";
    case "sales_or_transactions":
      return "Sales or transactions";
    case "sales_and_transactions":
      return "Sales and transactions";
    case "none":
      return "None recorded";
  }
}

export function modelLabel(model: ToolRow["pricing_model"]): string {
  switch (model) {
    case "per_filing":
      return "Per filing";
    case "per_jurisdiction_month":
      return "Per jurisdiction per month";
    case "percent_plus_fixed":
      return "Percent of revenue plus fixed fee";
    case "tiered_subscription":
      return "Tiered subscription";
    case "quote_only":
      return "Quote only";
  }
}

export function levelLabel(level: VerificationLevel): string {
  switch (level) {
    case "official":
      return "Verified against official source";
    case "corroborated":
      return "Corroborated by two sources";
    case "single_secondary":
      return "Single secondary source: use with caution";
    case "pending":
      return "Verification pending";
  }
}

export function formatThreshold(row: NexusRow): string {
  if (row.verification.level === "pending") return "Verification pending";
  if (!row.has_state_sales_tax && row.threshold_rule === "none") return "No statewide sales tax";
  const parts: string[] = [];
  if (row.sales_threshold_usd !== null) parts.push(fmtUsd(row.sales_threshold_usd));
  if (row.transactions_threshold !== null) parts.push(`${fmtInt(row.transactions_threshold)} transactions`);
  if (parts.length === 0) return "None recorded";
  const joiner = row.threshold_rule === "sales_and_transactions" ? " and " : " or ";
  const prefix =
    row.comparator === "exceeds" ? "More than " : row.comparator === "meets_or_exceeds" ? "At least " : "";
  return prefix + parts.join(joiner);
}

export function formatPricing(tool: ToolRow): string {
  const p = tool.pricing;
  switch (tool.pricing_model) {
    case "quote_only":
      return "Custom quote";
    case "per_filing":
      return [
        p.filing_fee_usd !== null ? `${fmtUsd(p.filing_fee_usd)} per filing` : null,
        p.registration_fee_usd !== null ? `${fmtUsd(p.registration_fee_usd)} per registration` : null,
      ]
        .filter((s): s is string => s !== null)
        .join(", ");
    case "per_jurisdiction_month":
      return `${fmtUsd(p.per_jurisdiction_month_usd ?? 0)} per jurisdiction per month`;
    case "tiered_subscription":
      return `From ${fmtUsd(p.starting_monthly_usd ?? 0)} per month`;
    case "percent_plus_fixed":
      return `${p.percent_fee ?? 0}%${p.fixed_fee_usd !== null ? ` + ${fmtUsd(p.fixed_fee_usd)} per transaction` : " of revenue"}`;
  }
}
