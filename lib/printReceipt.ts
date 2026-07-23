import { CanteenOrder } from "@/data/canteen";

/**
 * Helper to trigger isolated printing via a temporary invisible iframe.
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
    // Small timeout to allow images/fonts to render before print dialog opens
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
 * 1. THERMAL RECEIPT PRINTER HANDLER (58mm / 80mm Roll Paper)
 * Formats pure monospace, high-contrast, compact HTML for thermal POS roll printers.
 * Hides all background website UI and avoids scaling artifacts.
 */
export function printThermalReceipt(
  order: CanteenOrder,
  options?: { rollWidth?: "80mm" | "58mm" }
) {
  const width = options?.rollWidth ?? "80mm";
  const is58 = width === "58mm";

  // Group items by category for kitchen/stall tear slips
  const itemsByCategory = order.items.reduce((groups: Record<string, typeof order.items>, item) => {
    const cat = item.item.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
    return groups;
  }, {});

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Token_${order.tokenNumber}</title>
  <style>
    @page {
      size: ${width} auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${is58 ? "54mm" : "74mm"};
      margin: 0 auto;
      padding: 4px 2px;
      font-family: 'Courier New', Courier, monospace;
      font-size: ${is58 ? "10px" : "11px"};
      line-height: 1.2;
      color: #000000;
      background: #ffffff;
      font-weight: bold;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: 900; }
    .title { font-size: ${is58 ? "12px" : "14px"}; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }
    .subtitle { font-size: 9px; font-weight: normal; margin-bottom: 4px; }
    .token-box {
      border: 2px solid #000;
      padding: 4px;
      margin: 6px 0;
      text-align: center;
      background: #fff;
    }
    .token-no {
      font-size: ${is58 ? "16px" : "20px"};
      font-weight: 900;
      letter-spacing: 1px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .double-divider {
      border-top: 2px solid #000;
      margin: 6px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 2px 0;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
    }
    .item-table th {
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      text-align: left;
      font-size: 9px;
    }
    .item-table td {
      padding: 3px 0;
      vertical-align: top;
    }
    .tear-slip {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px dashed #000;
    }
    .stall-badge {
      border: 1px solid #000;
      padding: 1px 4px;
      font-size: 9px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <!-- MAIN CANTEEN HEADER -->
  <div class="text-center">
    <div class="title">SKSS KAMPALA CANTEEN</div>
    <div class="subtitle">Bukoto Complex, Kampala</div>
    <div class="subtitle">Swaminarayan Annakoot Seva</div>
  </div>

  <!-- TOKEN NUMBER DISPLAY -->
  <div class="token-box">
    <div>TOKEN NUMBER</div>
    <div class="token-no">${order.tokenNumber}</div>
  </div>

  <!-- ORDER META DETAILS -->
  <div class="row">
    <span>Table / Allocation:</span>
    <span class="bold">${order.tableName}</span>
  </div>
  <div class="row">
    <span>Customer:</span>
    <span>${order.customerName}</span>
  </div>
  <div class="row">
    <span>Phone:</span>
    <span>${order.customerPhone || "N/A"}</span>
  </div>
  <div class="row">
    <span>Time:</span>
    <span>${order.date} ${order.timestamp}</span>
  </div>

  <div class="divider"></div>

  <!-- ITEM LIST TABLE -->
  <table class="item-table">
    <thead>
      <tr>
        <th class="text-left" style="width: 55%;">ITEM</th>
        <th class="text-center" style="width: 15%;">QTY</th>
        <th class="text-right" style="width: 30%;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (i) => `
        <tr>
          <td class="text-left">
            <div>${i.item.name}</div>
            ${i.notes ? `<div style="font-size: 8px; font-style: italic;">* ${i.notes}</div>` : ""}
          </td>
          <td class="text-center bold">${i.qty}</td>
          <td class="text-right">UGX ${i.item.price * i.qty}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- FINANCIAL TOTALS -->
  <div class="row">
    <span>Subtotal:</span>
    <span>UGX ${order.subtotal}</span>
  </div>
  ${
    order.tax > 0
      ? `<div class="row"><span>GST / Tax:</span><span>UGX ${order.tax}</span></div>`
      : ""
  }
  ${
    order.serviceCharge > 0
      ? `<div class="row"><span>Service Tax:</span><span>UGX ${order.serviceCharge}</span></div>`
      : ""
  }
  ${
    order.discount > 0
      ? `<div class="row"><span>Discount:</span><span>- UGX ${order.discount}</span></div>`
      : ""
  }

  <div class="double-divider"></div>

  <div class="row" style="font-size: ${is58 ? "12px" : "14px"}; margin: 4px 0;">
    <span class="bold">TOTAL PAID:</span>
    <span class="bold">UGX ${order.total}</span>
  </div>

  <div class="divider"></div>

  <div class="text-center" style="margin: 4px 0;">
    <div>PAYMENT METHOD: ${order.paymentMethod === "UPI" ? "MOBILE MONEY / UPI" : order.paymentMethod}</div>
    <div class="bold" style="margin-top: 2px;">STATUS: ${order.paymentStatus}</div>
  </div>

  <!-- STALL TEAR SLIPS FOR KITCHEN COUNTERS -->
  ${Object.entries(itemsByCategory)
    .map(
      ([category, items]) => `
    <div class="tear-slip">
      <div class="text-center subtitle" style="font-size: 8px;">- - - - TEAR SLIP FOR STALL: ${category.toUpperCase()} - - - -</div>
      <div style="border: 1px solid #000; padding: 4px; margin-top: 4px;">
        <div class="row">
          <span class="bold">TOKEN: ${order.tokenNumber}</span>
          <span class="stall-badge">${category}</span>
        </div>
        <div class="row" style="font-size: 9px; font-weight: normal; margin-bottom: 4px;">
          <span>Table: ${order.tableName}</span>
          <span>${order.timestamp}</span>
        </div>
        <div class="divider" style="margin: 3px 0;"></div>
        ${items
          .map(
            (i) => `
          <div class="row">
            <span>${i.item.name}</span>
            <span class="bold">x ${i.qty}</span>
          </div>
          ${i.notes ? `<div style="font-size: 8px; font-style: italic; color: #333;">Note: ${i.notes}</div>` : ""}
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("")}

  <div class="divider"></div>
  <div class="text-center subtitle" style="margin-top: 6px;">
    Thank you! Present slip at pick-up counter.
  </div>
</body>
</html>
  `;

  executeIframePrint(html);
}

/**
 * 2. A4 DOCUMENT & INVOICE PRINTER HANDLER (Standard Full Page A4)
 * Formats a clean, professional full-size A4 letterhead invoice for bookkeeping,
 * accountants, or devotee official records.
 */
export function printA4Invoice(order: CanteenOrder) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice_${order.tokenNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-section h1 {
      font-size: 22px;
      color: #1e3a8a;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .logo-section p {
      color: #6b7280;
      font-size: 11px;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 900;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .token-pill {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      margin-top: 6px;
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .info-block label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #9ca3af;
      display: block;
      margin-bottom: 2px;
    }
    .info-block p {
      font-weight: 600;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f3f4f6;
      color: #374151;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-table {
      width: 300px;
    }
    .totals-table div {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals-table .grand-total {
      border-top: 2px solid #2563eb;
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      padding-top: 10px;
      margin-top: 4px;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
    }
    .stamp-box {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .sig-line {
      border-top: 1px solid #9ca3af;
      width: 200px;
      text-align: center;
      padding-top: 4px;
      font-size: 11px;
      color: #4b5563;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <h1>🕉️ SKSS KAMPALA CANTEEN</h1>
      <p>Bukoto Complex, Plot 42-44, Kampala, Uganda</p>
      <p>Email: canteen@pujasoftware.com | Tel: +256 700 000 000</p>
    </div>
    <div class="invoice-details">
      <div class="invoice-title">OFFICIAL RECEIPT</div>
      <div class="token-pill">TOKEN NO: ${order.tokenNumber}</div>
    </div>
  </div>

  <div class="grid-info">
    <div>
      <div class="info-block" style="margin-bottom: 10px;">
        <label>Devotee / Customer Name</label>
        <p>${order.customerName}</p>
      </div>
      <div class="info-block">
        <label>Contact Phone</label>
        <p>${order.customerPhone || "N/A"}</p>
      </div>
    </div>
    <div>
      <div class="info-block" style="margin-bottom: 10px;">
        <label>Date & Time Placed</label>
        <p>${order.date} • ${order.timestamp}</p>
      </div>
      <div class="info-block">
        <label>Table / Allocation</label>
        <p>${order.tableName}</p>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">Item Description</th>
        <th style="width: 20%;">Variety / Cat</th>
        <th class="text-center" style="width: 10%;">Qty</th>
        <th class="text-right" style="width: 10%;">Price</th>
        <th class="text-right" style="width: 10%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (i, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${i.item.name}</strong>
            ${i.notes ? `<div style="font-size: 11px; color: #6b7280; font-style: italic;">Note: ${i.notes}</div>` : ""}
          </td>
          <td>${i.item.category || "General"} (${i.item.variety})</td>
          <td class="text-center font-semibold">${i.qty}</td>
          <td class="text-right">UGX ${i.item.price}</td>
          <td class="text-right"><strong>UGX ${i.item.price * i.qty}</strong></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals-container">
    <div class="totals-table">
      <div>
        <span>Subtotal:</span>
        <span>UGX ${order.subtotal}</span>
      </div>
      ${
        order.tax > 0
          ? `<div><span>GST / Tax (5%):</span><span>UGX ${order.tax}</span></div>`
          : ""
      }
      ${
        order.serviceCharge > 0
          ? `<div><span>Service Tax (2.5%):</span><span>UGX ${order.serviceCharge}</span></div>`
          : ""
      }
      ${
        order.discount > 0
          ? `<div style="color: #dc2626;"><span>Discount:</span><span>- UGX ${order.discount}</span></div>`
          : ""
      }
      <div class="grand-total">
        <span>TOTAL AMOUNT:</span>
        <span>UGX ${order.total}</span>
      </div>
      <div style="font-size: 11px; color: #4b5563; margin-top: 6px;">
        <span>Payment Method:</span>
        <span>${order.paymentMethod === "UPI" ? "Mobile Money / UPI" : order.paymentMethod}</span>
      </div>
      <div style="font-size: 11px; color: #059669; font-weight: 700;">
        <span>Status:</span>
        <span>${order.paymentStatus}</span>
      </div>
    </div>
  </div>

  <div class="stamp-box">
    <div class="sig-line">
      Devotee Signature
    </div>
    <div class="sig-line">
      Authorized Cashier Signature
    </div>
  </div>

  <div class="footer" style="margin-top: 40px;">
    <p>Thank you for visiting Swami Canteen — Kampala. May Lord Swaminarayan bless you with joy and prosperity.</p>
    <p style="font-size: 10px; margin-top: 4px;">Computer-generated tax receipt. Valid for accounting verification.</p>
  </div>
</body>
</html>
  `;

  executeIframePrint(html);
}
