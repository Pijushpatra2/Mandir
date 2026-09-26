import * as XLSX from "xlsx";

export interface CanteenOrderExportRow {
  tokenNumber: string;
  orderId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  diningType: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CanteenItemExportRow {
  tokenNumber: string;
  orderDate: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * Exports Canteen Orders to an Excel (.xlsx) file with two detailed sheets:
 * 1. Orders Summary (Token, Devotee, Table, Payments, Totals)
 * 2. Item-Wise Details (Every ordered dish item with qty & price)
 */
export function exportCanteenOrdersToExcel(
  orders: any[],
  dateRangeLabel: string = "All_Dates"
) {
  if (!orders || orders.length === 0) {
    alert("No orders available to export.");
    return;
  }

  // 1. Prepare Sheet 1: Orders Summary
  const ordersSummaryData = orders.map((o) => {
    const totalItems = o.items ? o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) : 0;
    return {
      "Token No": o.tokenNumber || "—",
      "Order ID": o.id || "—",
      "Date": o.date || "—",
      "Time": o.timestamp || o.time || "—",
      "Customer / Devotee": o.customerName || "Walk-in Guest",
      "Phone": o.customerPhone || "—",
      "Table / Counter": o.tableName || "Counter",
      "Dining Option": o.diningOption || o.diningType || "DINE_IN",
      "Payment Method": o.paymentMethod || "CASH",
      "Payment Status": o.paymentStatus || "PAID",
      "Order Status": o.status || "COMPLETED",
      "Items Count": totalItems,
      "Subtotal (UGX)": Number(o.subtotal || o.total || 0),
      "Discount (UGX)": Number(o.discount || 0),
      "Tax (UGX)": Number(o.tax || 0),
      "Total Amount (UGX)": Number(o.total || 0),
    };
  });

  // Calculate totals
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => {
    return sum + (o.items ? o.items.reduce((iSum: number, it: any) => iSum + (it.quantity || 1), 0) : 0);
  }, 0);

  // Add Grand Total Row
  ordersSummaryData.push({
    "Token No": "TOTAL SUMMARY",
    "Order ID": `${orders.length} Orders`,
    "Date": "",
    "Time": "",
    "Customer / Devotee": "",
    "Phone": "",
    "Table / Counter": "",
    "Dining Option": "",
    "Payment Method": "",
    "Payment Status": "",
    "Order Status": "",
    "Items Count": totalItemsSold,
    "Subtotal (UGX)": totalRevenue,
    "Discount (UGX)": 0,
    "Tax (UGX)": 0,
    "Total Amount (UGX)": totalRevenue,
  });

  // 2. Prepare Sheet 2: Item-wise breakdown
  const itemWiseData: any[] = [];
  orders.forEach((o) => {
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach((item: any) => {
        itemWiseData.push({
          "Token No": o.tokenNumber || "—",
          "Order Date": o.date || "—",
          "Item Name": item.name || item.itemName || "Item",
          "Category": item.category || "Canteen",
          "Quantity": Number(item.quantity || 1),
          "Unit Price (UGX)": Number(item.price || 0),
          "Line Total (UGX)": Number(item.price || 0) * Number(item.quantity || 1),
        });
      });
    }
  });

  // 3. Create Workbook and add sheets
  const wb = XLSX.utils.book_new();

  const wsOrders = XLSX.utils.json_to_sheet(ordersSummaryData);
  const wsItems = XLSX.utils.json_to_sheet(itemWiseData.length > 0 ? itemWiseData : [{ "Info": "No items recorded" }]);

  // Set column widths for readability
  wsOrders["!cols"] = [
    { wch: 12 }, // Token No
    { wch: 22 }, // Order ID
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 22 }, // Customer
    { wch: 16 }, // Phone
    { wch: 16 }, // Table
    { wch: 14 }, // Dining
    { wch: 15 }, // Payment Method
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Order Status
    { wch: 12 }, // Items Count
    { wch: 15 }, // Subtotal
    { wch: 15 }, // Discount
    { wch: 12 }, // Tax
    { wch: 18 }, // Total Amount
  ];

  if (itemWiseData.length > 0) {
    wsItems["!cols"] = [
      { wch: 12 }, // Token No
      { wch: 12 }, // Order Date
      { wch: 25 }, // Item Name
      { wch: 16 }, // Category
      { wch: 10 }, // Quantity
      { wch: 16 }, // Unit Price
      { wch: 16 }, // Line Total
    ];
  }

  XLSX.utils.book_append_sheet(wb, wsOrders, "Orders Summary");
  XLSX.utils.book_append_sheet(wb, wsItems, "Item-Wise Sales");

  // 4. Download Excel file
  const cleanLabel = dateRangeLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Canteen_Orders_${cleanLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Generic Excel export helper for any tabular data
 */
export function exportTableToExcel(data: any[], sheetName: string, fileName: string) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Exports Store Requisitions to Excel (.xlsx) with two detailed sheets:
 * 1. Requisitions Summary (REQ Number, Requester, Shopkeeper, Status, Progress %, Notes)
 * 2. Item-Wise Detailed Ledger (Requested Qty, Approved Qty, Issued Qty, Remaining Balance, Remarks)
 */
export function exportRequisitionsToExcel(
  requisitions: any[],
  fileNamePrefix: string = "Store_Requisitions"
) {
  if (!requisitions || requisitions.length === 0) {
    alert("No requisitions data available to export.");
    return;
  }

  // 1. Prepare Sheet 1: Requisitions Summary
  const summaryRows = requisitions.map((r) => {
    return {
      "Requisition No": r.requisition_number || "—",
      "Date Requested": r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
      "Department": r.department || "CANTEEN",
      "Requested By": r.requested_by_name || "—",
      "Requester Role": r.requested_by_role || "—",
      "Priority": r.priority || "NORMAL",
      "Status": (r.status || "").replace(/_/g, " "),
      "Target Shopkeeper": r.target_shopkeeper_name || "Not Assigned",
      "Target Store": r.target_store_name || "Main Temple Store",
      "Total Items": Number(r.total_items_count || (r.items ? r.items.length : 0)),
      "Fulfilled Items": Number(r.fulfilled_items_count || 0),
      "Fulfillment %": `${Number(r.fulfillment_progress_pct || 0)}%`,
      "Approved By Admin": r.admin_name || (r.approved_at ? "Approved" : "—"),
      "Date Approved": r.approved_at ? new Date(r.approved_at).toLocaleDateString() : "—",
      "Requester Notes": r.requester_notes || "—",
      "Admin Notes": r.admin_notes || "—",
      "Shopkeeper Remarks": r.shopkeeper_notes || "—",
    };
  });

  // 2. Prepare Sheet 2: Item-Wise Detailed Ledger
  const itemWiseRows: any[] = [];
  requisitions.forEach((r) => {
    if (r.items && Array.isArray(r.items) && r.items.length > 0) {
      r.items.forEach((item: any) => {
        itemWiseRows.push({
          "Requisition No": r.requisition_number || "—",
          "Date": r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
          "Department": r.department || "CANTEEN",
          "Item Name": item.item_name || "—",
          "Category": item.category || "General Grocery",
          "Unit": item.unit || "kg",
          "Requested Qty": Number(item.requested_qty || 0),
          "Approved Qty": Number(item.approved_qty || 0),
          "Given / Issued Qty": Number(item.issued_qty || 0),
          "Remaining Balance": Number(item.remaining_qty || 0),
          "Item Status": item.item_status || "PENDING",
          "Assigned Shopkeeper": r.target_shopkeeper_name || "—",
          "Shopkeeper Remarks / Stock Notes": item.shopkeeper_remarks || "—",
        });
      });
    }
  });

  // 3. Create Workbook and add sheets
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsItems = XLSX.utils.json_to_sheet(
    itemWiseRows.length > 0 ? itemWiseRows : [{ "Info": "No item breakdown records found" }]
  );

  // Set column widths for summary sheet
  wsSummary["!cols"] = [
    { wch: 18 }, // Requisition No
    { wch: 14 }, // Date
    { wch: 14 }, // Department
    { wch: 20 }, // Requested By
    { wch: 16 }, // Requester Role
    { wch: 12 }, // Priority
    { wch: 22 }, // Status
    { wch: 22 }, // Target Shopkeeper
    { wch: 20 }, // Target Store
    { wch: 12 }, // Total Items
    { wch: 14 }, // Fulfilled Items
    { wch: 14 }, // Fulfillment %
    { wch: 18 }, // Approved By
    { wch: 14 }, // Date Approved
    { wch: 25 }, // Requester Notes
    { wch: 25 }, // Admin Notes
    { wch: 25 }, // Shopkeeper Remarks
  ];

  // Set column widths for item-wise sheet
  if (itemWiseRows.length > 0) {
    wsItems["!cols"] = [
      { wch: 18 }, // Requisition No
      { wch: 14 }, // Date
      { wch: 14 }, // Department
      { wch: 28 }, // Item Name
      { wch: 18 }, // Category
      { wch: 10 }, // Unit
      { wch: 14 }, // Requested Qty
      { wch: 14 }, // Approved Qty
      { wch: 18 }, // Given / Issued Qty
      { wch: 18 }, // Remaining Balance
      { wch: 14 }, // Item Status
      { wch: 20 }, // Assigned Shopkeeper
      { wch: 30 }, // Shopkeeper Remarks
    ];
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, "Requisitions Summary");
  XLSX.utils.book_append_sheet(wb, wsItems, "Item-Wise Inventory Ledger");

  // 4. Download Excel file
  const cleanPrefix = fileNamePrefix.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanPrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export a single requisition to Excel
 */
export function exportSingleRequisitionToExcel(req: any) {
  exportRequisitionsToExcel([req], `Requisition_${req.requisition_number || req.id}`);
}

