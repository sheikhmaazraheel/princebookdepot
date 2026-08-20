const API_BASE_URL = "https://princebookdepot-backend.onrender.com";

const ordersList = document.getElementById("orders-list");
const emptyState = document.getElementById("orders-empty");
const statusMessage = document.getElementById("orders-status");
const statusFilter = document.getElementById("status-filter");
const refreshButton = document.getElementById("refresh-orders");

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
      <section class="detail-block"><h3>Order contents</h3><div class="order-items">${items || "<p>No items recorded.</p>"}</div><p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod || "Not provided")}</p><p><strong>Subtotal:</strong> ${money(order.pricing?.subtotal)}</p></section>
      <section class="detail-block order-status-control"><h3>Update order</h3><label for="status-${escapeHtml(order.orderId)}">Order status</label><select id="status-${escapeHtml(order.orderId)}" class="order-status-select" data-order-id="${escapeHtml(order.orderId)}"><option value="pending" ${status === "pending" ? "selected" : ""}>Pending</option><option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option><option value="processing" ${status === "processing" ? "selected" : ""}>Processing</option><option value="shipped" ${status === "shipped" ? "selected" : ""}>Shipped</option><option value="delivered" ${status === "delivered" ? "selected" : ""}>Delivered</option><option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option><option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option><option value="returned" ${status === "returned" ? "selected" : ""}>Returned</option></select><small class="status-update-note">Last changed: ${formatDate(order.statusUpdatedAt || order.updatedAt)}</small></section>
    </div>
  </details>`;
}

function updateMetrics(orders) {
  const totalValue = orders.reduce((sum, order) => sum + Number(order.pricing?.total || 0), 0);
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
loadOrders();
