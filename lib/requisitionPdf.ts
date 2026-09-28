import { StoreRequisition } from "@/types/requisition.types";

/**
 * Format currency in Uganda Shillings (UGX) or number
 */
function formatCurrency(amount: number | string | undefined | null): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format date in readable format
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Helper to trigger isolated printing via an invisible iframe.
 * Allows user to "Save as PDF" or print cleanly in Black & White.
 */
function executeIframePrint(htmlContent: string) {
  if (typeof window === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }
}

/**
 * Generates an official, high-contrast Black & White (B&W) A4 printable template
 * and triggers the browser print dialog (which allows saving as PDF).
 */
export function exportRequisitionToBWPDF(req: StoreRequisition) {
  const items = req.items || [];

  // Calculate totals
  let totalRequestedUnits = 0;
  let totalApprovedUnits = 0;
  let totalIssuedUnits = 0;
  let computedGrandTotal = 0;

  items.forEach((it) => {
    const reqQ = Number(it.requested_qty) || 0;
    const appQ = Number(it.approved_qty ?? it.requested_qty) || 0;
    const issQ = Number(it.issued_qty) || 0;
    const uPrice = Number(it.unit_price) || 0;
    const lineTotal = Number(it.total_price) || (appQ > 0 ? appQ * uPrice : reqQ * uPrice);

    totalRequestedUnits += reqQ;
    totalApprovedUnits += appQ;
    totalIssuedUnits += issQ;
    computedGrandTotal += lineTotal;
  });

  const finalGrandTotal = Number(req.total_amount) > 0 ? Number(req.total_amount) : computedGrandTotal;
  const isManual = req.target_shopkeeper_type === "MANUAL" || !req.target_shopkeeper_id;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Requisition_${req.requisition_number}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #000000;
      background: #ffffff;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      width: 100%;
      max-width: 100%;
    }

    /* Header */
    .header {
      border-bottom: 2px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 1px;
    }
    .doc-type {
      font-size: 13px;
      font-weight: 800;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-box {
      text-align: right;
    }
    .req-number {
      font-size: 16px;
      font-weight: 900;
      font-family: 'Courier New', Courier, monospace;
      border: 2px solid #000000;
      padding: 3px 8px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .date-line {
      font-size: 10px;
      color: #000000;
      font-weight: 600;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      border: 1px solid #000000;
      margin-bottom: 14px;
    }
    .info-col {
      padding: 8px 10px;
      border-right: 1px solid #000000;
    }
    .info-col:last-child {
      border-right: none;
    }
    .info-heading {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .info-label {
      font-weight: 700;
      width: 85px;
      flex-shrink: 0;
      text-transform: uppercase;
      font-size: 9px;
    }
    .info-val {
      font-weight: 600;
      word-break: break-word;
    }
    .badge {
      display: inline-block;
      border: 1px solid #000000;
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
    }

    /* Items Table */
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10px;
    }
    table.items-table th {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      border-left: 1px solid #000000;
      border-right: 1px solid #000000;
      padding: 5px 6px;
      text-align: left;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.3px;
    }
    table.items-table td {
      border: 1px solid #000000;
      padding: 5px 6px;
      vertical-align: middle;
    }
    table.items-table tr.even {
      background: #f7f7f7;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }

    /* Totals Box */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 14px;
    }
    .totals-table {
      width: 320px;
      border-collapse: collapse;
      font-size: 10px;
    }
    .totals-table td {
      padding: 4px 8px;
      border: 1px solid #000000;
    }
    .totals-table tr.grand-total td {
      font-size: 12px;
      font-weight: 900;
      border-top: 2px solid #000000;
      border-bottom: 3px double #000000;
      background: #f0f0f0;
    }

    /* Notes Section */
    .notes-box {
      border: 1px solid #000000;
      padding: 8px 10px;
      margin-bottom: 14px;
      font-size: 10px;
    }
    .notes-title {
      font-weight: 900;
      text-transform: uppercase;
      font-size: 9px;
      margin-bottom: 3px;
      border-bottom: 1px dashed #000000;
      padding-bottom: 2px;
    }
    .notes-text {
      font-style: italic;
    }

    /* Signatures */
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px solid #000000;
      padding: 8px;
      height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-label {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 1px solid #000000;
      padding-bottom: 2px;
    }
    .sig-line {
      border-top: 1px dashed #000000;
      padding-top: 3px;
      font-size: 9px;
      display: flex;
      justify-content: space-between;
      color: #333333;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #000000;
      padding-top: 4px;
      margin-top: 14px;
      font-size: 8px;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">Shree Swaminarayan Temple</div>
        <div class="brand-sub">Kampala, Uganda • Mandir Provisions & Store Desk</div>
        <div class="doc-type">Material Store Requisition & Disbursement Slip</div>
      </div>
      <div class="meta-box">
        <div class="req-number">${req.requisition_number}</div>
        <div class="date-line">Date: ${formatDate(req.created_at)}</div>
        <div class="date-line">Priority: <strong>${req.priority}</strong></div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="info-grid">
      <!-- Col 1: Requester Details -->
      <div class="info-col">
        <div class="info-heading">1. Requisition Details</div>
        <div class="info-row">
          <span class="info-label">Department:</span>
          <span class="info-val font-bold">${(req.department || "CANTEEN").replace(/_/g, " ")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Requested By:</span>
          <span class="info-val">${req.requested_by_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Designation:</span>
          <span class="info-val">${req.requested_by_role || "Canteen Manager"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-val badge">${req.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      <!-- Col 2: Storekeeper Details -->
      <div class="info-col">
        <div class="info-heading">2. Storekeeper Details</div>
        <div class="info-row">
          <span class="info-label">Storekeeper:</span>
          <span class="info-val font-bold">${req.target_shopkeeper_name || "Unassigned"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-val">${isManual ? "Manual Storekeeper" : "Registered Staff"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-val font-mono">${req.target_shopkeeper_email || "—"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-val">${req.target_shopkeeper_phone || "—"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Target Store:</span>
          <span class="info-val">${req.target_store_name || "Main Store"}</span>
        </div>
      </div>

      <!-- Col 3: Admin & Fulfillment -->
      <div class="info-col">
        <div class="info-heading">3. Approval & Dispatch</div>
        <div class="info-row">
          <span class="info-label">Reviewed By:</span>
          <span class="info-val font-bold">${req.admin_name || "Pending Admin Review"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Approved On:</span>
          <span class="info-val">${formatDate(req.approved_at)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dispatched:</span>
          <span class="info-val">${formatDate(req.dispatched_at)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Progress:</span>
          <span class="info-val font-bold">${req.fulfillment_progress_pct || 0}% Fulfilled</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 28px;" class="text-center">#</th>
          <th>Item Description</th>
          <th style="width: 90px;">Category</th>
          <th style="width: 45px;" class="text-center">Unit</th>
          <th style="width: 50px;" class="text-center">Req Qty</th>
          <th style="width: 50px;" class="text-center">Appr Qty</th>
          <th style="width: 50px;" class="text-center">Given</th>
          <th style="width: 50px;" class="text-center">Rem</th>
          <th style="width: 75px;" class="text-right">Unit Price</th>
          <th style="width: 85px;" class="text-right">Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => {
          const reqQ = Number(it.requested_qty) || 0;
          const appQ = Number(it.approved_qty ?? it.requested_qty) || 0;
          const issQ = Number(it.issued_qty) || 0;
          const remQ = Number(it.remaining_qty) || 0;
          const uPrice = Number(it.unit_price) || 0;
          const lineTotal = Number(it.total_price) || (appQ > 0 ? appQ * uPrice : reqQ * uPrice);

          return `
          <tr class="${idx % 2 === 1 ? 'even' : ''}">
            <td class="text-center font-bold">${idx + 1}</td>
            <td class="font-bold">${it.item_name}</td>
            <td>${it.category || "General"}</td>
            <td class="text-center">${it.unit || "kg"}</td>
            <td class="text-center font-mono">${reqQ}</td>
            <td class="text-center font-mono font-bold">${appQ}</td>
            <td class="text-center font-mono">${issQ}</td>
            <td class="text-center font-mono">${remQ}</td>
            <td class="text-right font-mono">${formatCurrency(uPrice)}</td>
            <td class="text-right font-mono font-bold">${formatCurrency(lineTotal)}</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Totals Table -->
    <div class="totals-wrapper">
      <table class="totals-table">
        <tr>
          <td class="font-bold">Total Unique Items</td>
          <td class="text-right font-mono font-bold">${items.length}</td>
        </tr>
        <tr>
          <td class="font-bold">Total Requested Units</td>
          <td class="text-right font-mono">${totalRequestedUnits.toFixed(1)}</td>
        </tr>
        <tr>
          <td class="font-bold">Total Approved Units</td>
          <td class="text-right font-mono">${totalApprovedUnits.toFixed(1)}</td>
        </tr>
        <tr class="grand-total">
          <td>GRAND TOTAL AMOUNT (UGX)</td>
          <td class="text-right font-mono">UGX ${formatCurrency(finalGrandTotal)}</td>
        </tr>
      </table>
    </div>

    <!-- Notes if any -->
    ${req.requester_notes ? `
    <div class="notes-box">
      <div class="notes-title">Canteen Manager's Requisition Notes / Purpose</div>
      <div class="notes-text">"${req.requester_notes}"</div>
    </div>
    ` : ''}

    ${req.admin_notes ? `
    <div class="notes-box">
      <div class="notes-title">Administrator Approval Instructions</div>
      <div class="notes-text">"${req.admin_notes}"</div>
    </div>
    ` : ''}

    ${req.shopkeeper_notes ? `
    <div class="notes-box">
      <div class="notes-title">Storekeeper Fulfillment / Dispatch Remarks</div>
      <div class="notes-text">"${req.shopkeeper_notes}"</div>
    </div>
    ` : ''}

    <!-- Signatures -->
    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-label">1. Requested By (Canteen Manager)</div>
        <div>
          <div style="font-weight: 700; margin-bottom: 2px;">${req.requested_by_name}</div>
        </div>
        <div class="sig-line">
          <span>Signature</span>
          <span>Date: ${new Date(req.created_at).toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      <div class="sig-box">
        <div class="sig-label">2. Approved By (Temple Admin)</div>
        <div>
          <div style="font-weight: 700; margin-bottom: 2px;">${req.admin_name || "Pending Approval"}</div>
        </div>
        <div class="sig-line">
          <span>Signature</span>
          <span>Date: ${req.approved_at ? new Date(req.approved_at).toLocaleDateString("en-GB") : "—"}</span>
        </div>
      </div>

      <div class="sig-box">
        <div class="sig-label">3. Issued / Dispatched By (Storekeeper)</div>
        <div>
          <div style="font-weight: 700; margin-bottom: 2px;">${req.target_shopkeeper_name || "Storekeeper"}</div>
        </div>
        <div class="sig-line">
          <span>Signature</span>
          <span>Date: ${req.dispatched_at ? new Date(req.dispatched_at).toLocaleDateString("en-GB") : "—"}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>Official Record • SKSS Temple Kampala</span>
      <span>Voucher: ${req.requisition_number}</span>
      <span>System Generated Document • Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`;

  executeIframePrint(html);
}
