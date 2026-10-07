/**
 * Parses user-typed US money like "$1,200,000.00". Returns null when blank or invalid.
 * Accepts only plain digits or comma-grouped thousands, with up to two decimal places, so
 * European or mistyped input ("12,50", "250.000") is rejected instead of silently mis-read.
 */
export function parseMoney(text: string): number | null {
  const cleaned = text.replace(/[\s$]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned) && !/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned.replace(/,/g, ""));
}

/** Parses an optional whole-number count. Blank ⇒ undefined (not provided); invalid ⇒ null. */
export function parseCount(text: string): number | undefined | null {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return undefined;
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}
