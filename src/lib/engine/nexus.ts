import { fmtInt, fmtUsd } from "../format";
import type { NexusRow } from "../schemas";
import {
  CAVEATS,
  type EvaluateResult,
  type MeasureOutcome,
  type StateResult,
  type WizardInput,
  type WizardLine,
} from "./types";
import { validateInput } from "./validate";

export type ThresholdStatus =
  | "registration_likely_required"
  | "at_threshold_check_wording"
  | "below_threshold"
  | "insufficient_data";

type ActiveRule = Exclude<NexusRow["threshold_rule"], "none">;

export function classifyMeasure(
  value: number | undefined,
  threshold: number,
  comparator: NexusRow["comparator"],
): MeasureOutcome {
  if (value === undefined) return "unknown";
  if (value > threshold) return "trigger";
  if (value === threshold) {
    if (comparator === "meets_or_exceeds") return "trigger";
    if (comparator === "exceeds") return "below";
    return "at";
  }
  return "below";
}

function mapSingle(outcome: MeasureOutcome): ThresholdStatus {
  switch (outcome) {
    case "trigger":
      return "registration_likely_required";
    case "at":
      return "at_threshold_check_wording";
    case "below":
      return "below_threshold";
    case "unknown":
      return "insufficient_data";
  }
}

export function combineOutcomes(rule: ActiveRule, sales: MeasureOutcome, tx: MeasureOutcome): ThresholdStatus {
  if (rule === "sales_only") return mapSingle(sales);
  const outcomes: MeasureOutcome[] = [sales, tx];
  if (rule === "sales_or_transactions") {
    if (outcomes.includes("trigger")) return "registration_likely_required";
    if (outcomes.includes("at")) return "at_threshold_check_wording";
    if (outcomes.includes("unknown")) return "insufficient_data";
    return "below_threshold";
  }
  if (outcomes.includes("below")) return "below_threshold";
  if (outcomes.includes("unknown")) return "insufficient_data";
  if (outcomes.every((o) => o === "trigger")) return "registration_likely_required";
  return "at_threshold_check_wording";
}

function thresholdText(row: NexusRow): string {
  const parts: string[] = [];
  if (row.sales_threshold_usd !== null) parts.push(fmtUsd(row.sales_threshold_usd));
  if (row.transactions_threshold !== null) parts.push(`${fmtInt(row.transactions_threshold)} transactions`);
  return parts.join(row.threshold_rule === "sales_and_transactions" ? " and " : " or ");
}

function describe(row: NexusRow, status: ThresholdStatus, line: WizardLine): string {
  const period = row.measurement_period ? ` (${row.measurement_period})` : "";
  const threshold = thresholdText(row);
  switch (status) {
    case "registration_likely_required":
      return `Your figures meet ${row.name}'s threshold of ${threshold}${period}. Registration is likely required.`;
    case "below_threshold":
      return `Your figures are below ${row.name}'s threshold of ${threshold}${period}.`;
    case "at_threshold_check_wording":
      return `Your figures sit exactly at ${row.name}'s threshold of ${threshold}${period}. Check whether the state's rule says "exceeds" or "meets or exceeds".`;
    case "insufficient_data":
      return line.transactions === undefined && row.transactions_threshold !== null
        ? `Enter a transaction count. ${row.name} also applies a ${fmtInt(row.transactions_threshold)}-transaction threshold.`
        : `${row.name}: not enough data to evaluate.`;
  }
}

export function evaluateState(row: NexusRow, line: WizardLine | null, homeState: string | null): StateResult {
  const base = {
    code: row.code,
    name: row.name,
    rule: row.threshold_rule,
    salesThresholdUsd: row.sales_threshold_usd,
    transactionsThreshold: row.transactions_threshold,
    comparator: row.comparator,
    measurementPeriod: row.measurement_period,
    salesMeasure: row.sales_measure,
    verificationLevel: row.verification.level,
    sources: row.sources,
    notes: row.notes,
    caveats: [...CAVEATS],
  };

  if (!row.has_state_sales_tax && row.threshold_rule === "none") {
    return { ...base, status: "no_state_sales_tax", message: `${row.name} has no statewide sales tax.` };
  }
  if (homeState !== null && row.code === homeState) {
    return {
      ...base,
      status: "physical_presence",
      message: `You selected ${row.name} as your home state. Registration is generally required where you have physical presence, regardless of sales thresholds.`,
    };
  }
  if (row.verification.level === "pending") {
    return {
      ...base,
      status: "insufficient_data",
      message: `${row.name}: threshold data is pending verification, so no determination can be made.`,
    };
  }
  if (row.threshold_rule === "none" || row.sales_threshold_usd === null) {
    return {
      ...base,
      status: "insufficient_data",
      message: `${row.name}: no economic-nexus rule is recorded for this state.`,
    };
  }
  if (line === null) {
    return { ...base, status: "insufficient_data", message: `${row.name}: enter your sales to evaluate.` };
  }

  const sales = classifyMeasure(line.grossSalesUsd, row.sales_threshold_usd, row.comparator);
  const tx: MeasureOutcome =
    row.transactions_threshold === null
      ? "unknown"
      : classifyMeasure(line.transactions, row.transactions_threshold, row.comparator);
  const status = combineOutcomes(row.threshold_rule, sales, tx);
  return { ...base, status, message: describe(row, status, line) };
}

export function evaluateAll(input: WizardInput, rows: NexusRow[]): EvaluateResult {
  const errors = validateInput(input, rows);
  if (errors.length > 0) return { ok: false, errors };

  const byCode = new Map(rows.map((r) => [r.code, r] as const));
  const lineByCode = new Map(input.lines.map((l) => [l.code, l] as const));
  const codes = [...lineByCode.keys()];
  if (input.homeState !== null && !lineByCode.has(input.homeState)) codes.push(input.homeState);

  const results = codes.map((code) => {
    const row = byCode.get(code);
    if (!row) throw new Error(`validated code missing from dataset: ${code}`);
    return evaluateState(row, lineByCode.get(code) ?? null, input.homeState);
  });

  const registrationCount = results.filter(
    (r) => r.status === "registration_likely_required" || r.status === "physical_presence",
  ).length;
  const totalSalesUsd = input.lines.reduce((sum, l) => sum + l.grossSalesUsd, 0);
  const allHaveTx = input.lines.length > 0 && input.lines.every((l) => l.transactions !== undefined);
  const totalTransactions = allHaveTx ? input.lines.reduce((sum, l) => sum + (l.transactions ?? 0), 0) : undefined;

  return { ok: true, results, registrationCount, totalSalesUsd, totalTransactions };
}
