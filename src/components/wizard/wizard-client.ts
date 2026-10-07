import { estimateToolCosts } from "../../lib/engine/cost";
import { evaluateAll } from "../../lib/engine/nexus";
import { parseCount, parseMoney } from "../../lib/engine/parse";
import type { StateResult, WizardLine } from "../../lib/engine/types";
import { fmtUsd, levelLabel } from "../../lib/format";
import type { NexusRow, ToolRow } from "../../lib/schemas";
import { toSlug } from "../../lib/slug";

function readJson<T>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return JSON.parse(el.textContent ?? "null") as T;
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

const rows = readJson<NexusRow[]>("wizard-nexus-data");
const tools = readJson<ToolRow[]>("wizard-tools-data");
const byCode = new Map(rows.map((r) => [r.code, r] as const));
const toolBySlug = new Map(tools.map((t) => [t.slug, t] as const));

const form = byId<HTMLFormElement>("wizard-form");
const homeSelect = byId<HTMLSelectElement>("home-state");
const linesEl = byId<HTMLDivElement>("lines");
const addBtn = byId<HTMLButtonElement>("add-line");
const errorsEl = byId<HTMLParagraphElement>("form-errors");
const resultsEl = byId<HTMLElement>("results");
const summaryEl = byId<HTMLParagraphElement>("summary");
const resultsBody = byId<HTMLTableSectionElement>("results-body");
const costsBody = byId<HTMLTableSectionElement>("costs-body");
const caveatsEl = byId<HTMLUListElement>("caveats");

const STATUS_LABEL: Record<StateResult["status"], string> = {
  registration_likely_required: "Registration likely required",
  physical_presence: "Physical presence",
  at_threshold_check_wording: "At threshold: check wording",
  below_threshold: "Below threshold",
  insufficient_data: "Insufficient data",
  no_state_sales_tax: "No statewide sales tax",
};

function stateOptions(): string {
  return rows.map((r) => `<option value="${r.code}">${escapeHtml(r.name)}</option>`).join("");
}

function clearResults(): void {
  resultsEl.hidden = true;
  errorsEl.textContent = "";
}

function addLine(): void {
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = `
    <select class="line-state" aria-label="State">${stateOptions()}</select>
    <input class="line-sales" inputmode="decimal" placeholder="Gross sales, USD (e.g. 250000)" aria-label="Gross sales in USD" />
    <input class="line-tx" inputmode="numeric" placeholder="Transactions (optional)" aria-label="Transactions, optional" />
    <button type="button" class="remove-line">Remove</button>`;
  div.querySelector(".remove-line")?.addEventListener("click", () => {
    div.remove();
    clearResults();
  });
  div.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", clearResults));
  linesEl.appendChild(div);
}

function readLines(): { lines: WizardLine[]; errors: string[] } {
  const errors: string[] = [];
  const lines: WizardLine[] = [];
  linesEl.querySelectorAll<HTMLDivElement>(".line").forEach((div, i) => {
    const code = (div.querySelector(".line-state") as HTMLSelectElement).value;
    const salesText = (div.querySelector(".line-sales") as HTMLInputElement).value;
    const txText = (div.querySelector(".line-tx") as HTMLInputElement).value;
    // A completely blank line is ignored so a home-state-only submission works without clicking Remove.
    if (salesText.trim() === "" && txText.trim() === "") return;
    const sales = parseMoney(salesText);
    const tx = parseCount(txText);
    const name = byCode.get(code)?.name ?? code;
    if (sales === null) errors.push(`Line ${i + 1} (${name}): enter gross sales as a number, for example 250000.`);
    if (tx === null) errors.push(`Line ${i + 1} (${name}): transactions must be a whole number.`);
    if (sales !== null && tx !== null) {
      lines.push(tx === undefined ? { code, grossSalesUsd: sales } : { code, grossSalesUsd: sales, transactions: tx });
    }
  });
  return { lines, errors };
}

function render(): void {
  const { lines, errors } = readLines();
  const homeState = homeSelect.value === "" ? null : homeSelect.value;
  if (lines.length === 0 && homeState === null) errors.push("Add at least one state or choose a home state.");
  if (errors.length > 0) {
    errorsEl.textContent = errors.join(" ");
    resultsEl.hidden = true;
    return;
  }

  const out = evaluateAll({ homeState, lines }, rows);
  if (!out.ok) {
    errorsEl.textContent = out.errors.map((e) => e.message).join(" ");
    resultsEl.hidden = true;
    return;
  }

  errorsEl.textContent = "";
  summaryEl.textContent = `${out.registrationCount} of ${out.results.length} states indicate a registration obligation. Total sales entered: ${fmtUsd(out.totalSalesUsd)}.`;

  const lineByCode = new Map(lines.map((l) => [l.code, l] as const));
  resultsBody.innerHTML = out.results
    .map((r) => {
      const slug = toSlug(r.name);
      const line = lineByCode.get(r.code);
      const entered = line
        ? `<span class="muted">Entered ${fmtUsd(line.grossSalesUsd)}${
            line.transactions !== undefined ? ` and ${line.transactions.toLocaleString("en-US")} transactions` : ""
          }.</span> `
        : "";
      const sourceLink = ` <a href="/us/economic-nexus/${slug}/">${r.sources.length} source${r.sources.length === 1 ? "" : "s"}</a>`;
      return `
      <tr>
        <td><a href="/us/economic-nexus/${slug}/">${escapeHtml(r.name)}</a></td>
        <td><span class="status status-${r.status}">${STATUS_LABEL[r.status]}</span></td>
        <td>${entered}${escapeHtml(r.message)}${r.notes ? ` <span class="muted">${escapeHtml(r.notes)}</span>` : ""}${sourceLink}</td>
        <td><span class="badge badge-${r.verificationLevel}">${levelLabel(r.verificationLevel)}</span> <span class="muted">Verified ${r.verifiedOn}</span></td>
      </tr>`;
    })
    .join("");

  const costs = estimateToolCosts(tools, {
    registrationCount: out.registrationCount,
    totalSalesUsd: out.totalSalesUsd,
    totalTransactions: out.totalTransactions,
  }).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  costsBody.innerHTML = costs
    .map((c) => {
      // Vendors whose pages do not state US sales-tax support get no estimate.
      const unsupported = toolBySlug.get(c.slug)?.us_sales_tax_supported === false;
      const estimate = unsupported
        ? "Not confirmed for US sales tax"
        : c.annualEstimateUsd === null
          ? "Custom quote"
          : `${c.label === "from" ? "From " : ""}${fmtUsd(c.annualEstimateUsd)} per year`;
      const notes = unsupported
        ? "This vendor's pages do not state US sales-tax support."
        : c.notes.map(escapeHtml).join(" ");
      return `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.category === "merchant_of_record" ? "Merchant of record" : "Compliance software"}</td>
        <td>${estimate}</td>
        <td>${notes}</td>
      </tr>`;
    })
    .join("");

  caveatsEl.innerHTML = (out.results[0]?.caveats ?? []).map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  resultsEl.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});
addBtn.addEventListener("click", () => addLine());
homeSelect.addEventListener("change", clearResults);
addLine();
