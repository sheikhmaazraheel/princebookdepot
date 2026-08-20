const API_BASE_URL = "https://princebookdepot-backend.onrender.com";

const ordersList = document.getElementById("orders-list");
const emptyState = document.getElementById("orders-empty");
const statusMessage = document.getElementById("orders-status");
const statusFilter = document.getElementById("status-filter");
const refreshButton = document.getElementById("refresh-orders");
const loadedOrders = new Map();

const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-PK")}`;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
};

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function openOrderSlip(order) {
  if (!order) return;

  const items = (order.items || []).map((item) => `
    <tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${money(item.lineTotal)}</td></tr>
  `).join("");
  const location = order.location?.latitude !== undefined && order.location?.longitude !== undefined
    ? `${order.location.latitude}, ${order.location.longitude} (accuracy: ${escapeHtml(order.location.accuracy || "unknown")}m)`
    : "Not shared";
  const slipWindow = window.open("", "_blank", "width=900,height=1000");

  if (!slipWindow) {
    setStatus("Please allow pop-ups to print or download the order slip.", true);
    return;
  }

  slipWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order Slip ${escapeHtml(order.orderId)}</title><style>
    @page{size:A5 portrait;margin:0} :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;padding:20px;background:#e8f0f6;color:#182536;font-family:Arial,Helvetica,sans-serif}.slip{width:148mm;min-height:210mm;margin:0 auto;background:#fff;padding:13mm;box-shadow:0 14px 38px rgba(16,37,61,.14)}.slip-header{display:flex;justify-content:space-between;gap:14px;padding-bottom:13px;border-bottom:2px solid #17324f}.brand{color:#17324f;font-size:17px;font-weight:800;letter-spacing:.07em}.brand span{display:block;margin-top:5px;color:#0e7490;font-size:7px;letter-spacing:.14em}.slip-title{text-align:right}.slip-title h1{margin:0;color:#0e7490;font-size:19px}.slip-title p{margin:4px 0 0;color:#718096;font-size:8px}.meta{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px;margin:13px 0;padding:9px;border-radius:7px;background:#f4f8fb}.meta span{display:block;margin-bottom:3px;color:#8492a2;font-size:7px;text-transform:uppercase;letter-spacing:.07em}.meta strong{color:#30465f;font-size:8px}.section-title{margin:14px 0 5px;color:#17324f;font-size:8px;letter-spacing:.1em;text-transform:uppercase}.address{padding:8px;border-left:2px solid #19aeca;background:#f7fafc;color:#52677c;font-size:8px;line-height:1.5}table{width:100%;border-collapse:collapse;font-size:8px}th{padding:7px 5px;background:#17324f;color:#fff;text-align:left;font-size:7px;text-transform:uppercase;letter-spacing:.04em}td{padding:7px 5px;border-bottom:1px solid #e2eaf1;color:#52677c}th:not(:first-child),td:not(:first-child){text-align:right}.totals{width:190px;margin:12px 0 0 auto}.totals td{border:0;padding:4px 5px}.totals tr:last-child td{padding-top:7px;border-top:1px solid #17324f;color:#0e7490;font-size:11px;font-weight:800}.footer{display:flex;justify-content:space-between;gap:12px;margin-top:18px;padding-top:10px;border-top:1px solid #e2eaf1;color:#8492a2;font-size:7px;line-height:1.4}.print-action{display:block;width:148mm;margin:14px auto 0;padding:11px;border:0;border-radius:7px;background:#0e7490;color:#fff;font-weight:800;cursor:pointer}@media print{body{padding:0;background:#fff}.slip{width:148mm;min-height:210mm;padding:13mm;box-shadow:none}.print-action{display:none}}@media(max-width:600px){body{padding:0}.slip{width:100%;min-height:100vh;padding:24px}.meta{grid-template-columns:1fr 1fr}.slip-header{display:block}.slip-title{text-align:left;margin-top:12px}.totals{width:100%}.print-action{width:calc(100% - 48px)}}
  </style></head><body><main class="slip"><header class="slip-header"><div class="brand">PRINCE BOOK DEPOT<span>BOOKS WORTH DELIVERING</span></div><div class="slip-title"><h1>Order Slip</h1><p>Customer copy</p></div></header><section class="meta"><div><span>Order ID</span><strong>${escapeHtml(order.orderId)}</strong></div><div><span>Date</span><strong>${formatDate(order.createdAt)}</strong></div><div><span>Status</span><strong>${escapeHtml(order.status)}</strong></div></section><h2 class="section-title">Customer</h2><div class="address"><strong>${escapeHtml(order.customer?.name)}</strong><br>${escapeHtml(order.customer?.contact)}${order.customer?.email ? `<br>${escapeHtml(order.customer.email)}` : ""}</div><h2 class="section-title">Delivery</h2><div class="address">${escapeHtml(order.delivery?.address)}<br>${escapeHtml(order.delivery?.area)}, ${escapeHtml(order.delivery?.city)}<br>${escapeHtml(order.delivery?.landmark)} · ${escapeHtml(order.delivery?.zone)}<br>Location: ${location}</div><h2 class="section-title">Items</h2><table><thead><tr><th>Book</th><th>Qty.</th><th>Unit</th><th>Amount</th></tr></thead><tbody>${items}</tbody></table><table class="totals"><tr><td>Subtotal</td><td>${money(order.pricing?.subtotal)}</td></tr><tr><td>Delivery</td><td>${money(order.pricing?.deliveryCharge)}</td></tr><tr><td>Total</td><td>${money(order.pricing?.total)}</td></tr></table><div class="footer"><span>Payment: ${escapeHtml(order.paymentMethod)}</span><span>Prince Book Depot · Karachi</span></div></main><button class="print-action" onclick="window.print()">Print / Save as PDF</button></body></html>`);
  slipWindow.document.close();
  slipWindow.focus();
  setTimeout(() => slipWindow.print(), 300);
}

function renderOrder(order) {
  const location = order.location?.latitude !== undefined && order.location?.longitude !== undefined
    ? `<a class="location-link" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(`${order.location.latitude},${order.location.longitude}`)}">Open precise location ↗</a><p>Accuracy: ${escapeHtml(order.location.accuracy || "Unknown")} metres</p>`
    : "<p>Location was not shared.</p>";
  const items = (order.items || []).map((item) => `<div class="order-item"><span>${escapeHtml(item.name)} ×${item.quantity}</span><strong>${money(item.lineTotal)}</strong></div>`).join("");
  const status = escapeHtml(order.status || "pending").toLowerCase();

  return `<details class="order-card">
    <summary class="order-summary">
      <div class="order-main"><strong>${escapeHtml(order.orderId)}</strong><span>${formatDate(order.createdAt)}</span></div>
      <div class="order-customer"><strong>${escapeHtml(order.customer?.name || "Unknown customer")}</strong><span>${escapeHtml(order.delivery?.area || "No area")}</span></div>
      <div class="order-total"><span>Total</span><strong>${money(order.pricing?.total)}</strong></div>
      <span class="status-badge status-${status}">${status}</span>
      <span class="order-chevron" aria-hidden="true">›</span>
    </summary>
    <div class="order-details">
      <section class="detail-block"><h3>Customer and delivery</h3><p><strong>Contact:</strong> ${escapeHtml(order.customer?.contact || "Not provided")}</p><p><strong>Email:</strong> ${escapeHtml(order.customer?.email || "Not provided")}</p><p><strong>Address:</strong> ${escapeHtml(order.delivery?.address || "Not provided")}</p><p><strong>Landmark:</strong> ${escapeHtml(order.delivery?.landmark || "Not provided")}</p><p><strong>Zone:</strong> ${escapeHtml(order.delivery?.zone || "Not provided")} · ${money(order.pricing?.deliveryCharge)} delivery</p><p>${location}</p></section>
      <section class="detail-block"><h3>Order contents</h3><div class="order-items">${items || "<p>No items recorded.</p>"}</div><p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod || "Not provided")}</p><p><strong>Subtotal:</strong> ${money(order.pricing?.subtotal)}</p><button type="button" class="order-slip-button" data-order-id="${escapeHtml(order.orderId)}">Print / Save order slip</button></section>
      <section class="detail-block order-status-control"><h3>Update order</h3><label for="status-${escapeHtml(order.orderId)}">Order status</label><select id="status-${escapeHtml(order.orderId)}" class="order-status-select" data-order-id="${escapeHtml(order.orderId)}"><option value="pending" ${status === "pending" ? "selected" : ""}>Pending</option><option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option><option value="processing" ${status === "processing" ? "selected" : ""}>Processing</option><option value="shipped" ${status === "shipped" ? "selected" : ""}>Shipped</option><option value="delivered" ${status === "delivered" ? "selected" : ""}>Delivered</option><option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option><option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option><option value="returned" ${status === "returned" ? "selected" : ""}>Returned</option></select><small class="status-update-note">Last changed: ${formatDate(order.statusUpdatedAt || order.updatedAt)}</small></section>
    </div>
  </details>`;
}

function updateMetrics(orders) {
  const revenueOrders = orders.filter((order) => !["cancelled", "returned"].includes(order.status));
  const totalValue = revenueOrders.reduce((sum, order) => sum + Number(order.pricing?.total || 0), 0);
  document.getElementById("metric-total").textContent = orders.length;
  document.getElementById("metric-pending").textContent = orders.filter((order) => order.status === "pending").length;
  document.getElementById("metric-confirmed").textContent = orders.filter((order) => order.status === "confirmed").length;
  document.getElementById("metric-revenue").textContent = money(totalValue);
}

async function updateOrderStatus(select) {
  const orderId = select.dataset.orderId;
  const nextStatus = select.value;
  const previousStatus = select.dataset.previousStatus || nextStatus;
  select.disabled = true;
  setStatus(`Updating ${orderId}...`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Could not update order status.");
    select.dataset.previousStatus = nextStatus;
    setStatus(`${orderId} is now ${nextStatus}.`);
    await loadOrders();
  } catch (error) {
    select.value = previousStatus;
    setStatus(error.message, true);
    select.disabled = false;
  }
}

async function loadOrders() {
  refreshButton.disabled = true;
  refreshButton.textContent = "Loading orders...";
  setStatus("Loading the order queue...");
  const query = statusFilter.value ? `?status=${encodeURIComponent(statusFilter.value)}&limit=200` : "?limit=200";

  try {
    const response = await fetch(`${API_BASE_URL}/api/orders${query}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Could not load orders.");
    const orders = Array.isArray(data.orders) ? data.orders : [];
    loadedOrders.clear();
    orders.forEach((order) => loadedOrders.set(order.orderId, order));
    ordersList.innerHTML = orders.map(renderOrder).join("");
    emptyState.hidden = orders.length > 0;
    updateMetrics(orders);
    document.getElementById("orders-updated").textContent = `Updated ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`;
    setStatus(orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"} loaded.` : "");
  } catch (error) {
    ordersList.innerHTML = "";
    emptyState.hidden = true;
    setStatus(error.message, true);
  } finally {
    refreshButton.disabled = false;
    refreshButton.innerHTML = "Refresh orders <span aria-hidden=\"true\">↻</span>";
  }
}

statusFilter.addEventListener("change", loadOrders);
refreshButton.addEventListener("click", loadOrders);
ordersList.addEventListener("change", (event) => {
  const select = event.target.closest(".order-status-select");
  if (select) updateOrderStatus(select);
});
ordersList.addEventListener("click", (event) => {
  const button = event.target.closest(".order-slip-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  openOrderSlip(loadedOrders.get(button.dataset.orderId));
});
loadOrders();
