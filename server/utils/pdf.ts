import { chromium } from "playwright";
import type { QuoteOutput } from "../../shared/pricing";
import { formatCurrency } from "./currency";

export type QuotePdfDto = QuoteOutput & {
  meta?: {
    projectTitle?: string;
    clientName?: string;
    createdAt?: string;
  };
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(dto: QuotePdfDto): string {
  const { meta, breakdown } = dto;
  const projectTitle = meta?.projectTitle ?? "Untitled Quote";
  const clientName = meta?.clientName ?? "-";
  const createdAt = meta?.createdAt
    ? new Date(meta.createdAt).toLocaleDateString("id-ID")
    : new Date().toLocaleDateString("id-ID");

  const developmentRows = breakdown.development
    .map(
      (line) => `
        <tr>
          <td>${escapeHtml(line.role)}</td>
          <td>${line.qty}</td>
          <td>${line.days}</td>
          <td>${formatCurrency(line.ratePerDay)}</td>
          <td class="text-right">${formatCurrency(line.lineTotal)}</td>
        </tr>
      `,
    )
    .join("");

  const productionRows = breakdown.production
    .map(
      (line) => `
        <tr>
          <td>${escapeHtml(line.name)}</td>
          <td>${line.qty}</td>
          <td>${line.days}</td>
          <td>${formatCurrency(line.ratePerDay)}</td>
          <td class="text-right">${formatCurrency(line.lineTotal)}</td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Quote Preview</title>
    <style>
      body {
        font-family: "Helvetica Neue", Arial, sans-serif;
        margin: 24px;
        color: #111827;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 4px;
      }
      h2 {
        font-size: 18px;
        margin-top: 32px;
        margin-bottom: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      th, td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        font-size: 12px;
      }
      th {
        background-color: #f3f4f6;
        text-align: left;
        font-weight: 600;
      }
      .text-right { text-align: right; }
      .summary {
        margin-top: 16px;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 4px;
      }
      .summary-row strong {
        font-size: 16px;
      }
      .meta {
        margin-bottom: 16px;
        font-size: 13px;
        color: #4b5563;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Project Quote</h1>
      <div class="meta">
        <div><strong>Project:</strong> ${escapeHtml(projectTitle)}</div>
        <div><strong>Client:</strong> ${escapeHtml(clientName)}</div>
        <div><strong>Date:</strong> ${escapeHtml(createdAt)}</div>
        <div><strong>Project Type:</strong> ${escapeHtml(dto.projectType)}</div>
      </div>
    </header>

    <section>
      <h2>Development (Crew)</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Qty</th>
            <th>Days</th>
            <th>Rate / Day</th>
            <th class="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${developmentRows || "<tr><td colspan=\"5\">No crew items</td></tr>"}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Production (Gear & OOP)</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Days</th>
            <th>Rate / Day</th>
            <th class="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${productionRows || "<tr><td colspan=\"5\">No gear items</td></tr>"}
        </tbody>
      </table>
    </section>

    <section class="summary">
      <div class="summary-row"><span>Base Crew</span><span>${formatCurrency(dto.baseCrew)}</span></div>
      <div class="summary-row"><span>Base Gear</span><span>${formatCurrency(dto.baseGear)}</span></div>
      <div class="summary-row"><span>Out-of-Pocket</span><span>${formatCurrency(dto.baseOOP)}</span></div>
      <div class="summary-row"><span>Base Cost</span><span>${formatCurrency(dto.baseCost)}</span></div>
      <div class="summary-row"><span>Complexity Multiplier</span><span>${dto.complexity.multiplier.toFixed(2)}×</span></div>
      <div class="summary-row"><span>Skill Multiplier</span><span>${dto.skillMultiplier.toFixed(2)}×</span></div>
      <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(dto.subtotal)}</span></div>
      <div class="summary-row"><span>Contingency (${(dto.contingencyPct * 100).toFixed(1)}%)</span><span>${formatCurrency(dto.contingency)}</span></div>
      <div class="summary-row"><strong>Grand Total</strong><strong>${formatCurrency(dto.grandTotal)}</strong></div>
      ${
        dto.clientPrice !== undefined
          ? `<div class="summary-row"><span>Client Price</span><span>${formatCurrency(dto.clientPrice)}</span></div>`
          : ""
      }
      ${
        dto.nettProfit !== undefined
          ? `<div class="summary-row"><span>Estimated Nett Profit</span><span>${formatCurrency(dto.nettProfit)}</span></div>`
          : ""
      }
    </section>
  </body>
</html>
`;
}

export async function generateQuotePDF(quoteDto: QuotePdfDto): Promise<Buffer> {
  const html = buildHtml(quoteDto);
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });
    await page.close();
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
