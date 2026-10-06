/** Parses user-typed money like "$1,200,000.00". Returns null when blank or invalid. */
export function parseMoney(text: string): number | null {
  const cleaned = text.replace(/[\s$,]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Parses an optional whole-number count. Blank ⇒ undefined (not provided); invalid ⇒ null. */
export function parseCount(text: string): number | undefined | null {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return undefined;
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}
