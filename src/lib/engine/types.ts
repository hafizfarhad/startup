import type { NexusRow, Source, VerificationLevel } from "../schemas";

export type WizardLine = { code: string; grossSalesUsd: number; transactions?: number };
export type WizardInput = { homeState: string | null; lines: WizardLine[] };

export type StateStatus =
  | "no_state_sales_tax"
  | "physical_presence"
  | "insufficient_data"
  | "registration_likely_required"
  | "at_threshold_check_wording"
  | "below_threshold";

export type MeasureOutcome = "trigger" | "at" | "below" | "unknown";

export type StateResult = {
  code: string;
  name: string;
  status: StateStatus;
  rule: NexusRow["threshold_rule"];
  salesThresholdUsd: number | null;
  transactionsThreshold: number | null;
  comparator: NexusRow["comparator"];
  measurementPeriod: string | null;
  salesMeasure: NexusRow["sales_measure"];
  verificationLevel: VerificationLevel;
  sources: Source[];
  notes: string;
  message: string;
  caveats: string[];
};

export type ValidationError = { field: string; message: string; index?: number };

export type EvaluateResult =
  | {
      ok: true;
      results: StateResult[];
      registrationCount: number;
      totalSalesUsd: number;
      totalTransactions: number | undefined;
    }
  | { ok: false; errors: ValidationError[] };

export const CAVEATS: readonly string[] = [
  "Economic nexus is not the same as taxability. A state can require registration even if your product is exempt there, and your product may be taxable in a state where you have no nexus.",
  "Marketplace-facilitated sales may count toward thresholds differently by state.",
  "Thresholds are measured over each state's own period, shown per state, not over your fiscal year.",
];
