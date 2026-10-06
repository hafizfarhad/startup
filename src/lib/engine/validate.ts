import type { NexusRow } from "../schemas";
import type { ValidationError, WizardInput } from "./types";

const CODE = /^[A-Z]{2}$/;

export function validateInput(input: WizardInput, rows: NexusRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const known = new Set(rows.map((r) => r.code));

  if (input.homeState !== null && !known.has(input.homeState)) {
    errors.push({ field: "homeState", message: `Unknown state code "${input.homeState}"` });
  }

  const seen = new Set<string>();
  input.lines.forEach((line, index) => {
    if (!CODE.test(line.code) || !known.has(line.code)) {
      errors.push({ field: "code", index, message: `Unknown state code "${line.code}"` });
    } else if (seen.has(line.code)) {
      errors.push({ field: "code", index, message: `State "${line.code}" entered more than once` });
    }
    seen.add(line.code);

    if (!Number.isFinite(line.grossSalesUsd) || line.grossSalesUsd < 0) {
      errors.push({ field: "grossSalesUsd", index, message: "Gross sales must be a number of 0 or more" });
    }
    if (line.transactions !== undefined && (!Number.isInteger(line.transactions) || line.transactions < 0)) {
      errors.push({ field: "transactions", index, message: "Transactions must be a whole number of 0 or more" });
    }
  });

  return errors;
}
