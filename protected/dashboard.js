const API_BASE_URL = "https://princebookdepot-backend.onrender.com";

const $ = (id) => document.getElementById(id);
const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-PK")}`;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));
const orderAlertButton = $("enable-order-alerts");
const notificationRegistration = "serviceWorker" in navigator
  ? navigator.serviceWorker.register("../sw.js").then(() => navigator.serviceWorker.ready)
  : Promise.reject(new Error("Service worker notifications are not supported."));
let knownOrderIds = null;

function updateOrderAlertButton() {
  if (!orderAlertButton || !("Notification" in window)) return;
  orderAlertButton.textContent = Notification.permission === "granted" ? "Order alerts on" : "Enable order alerts";
  orderAlertButton.disabled = Notification.permission === "granted";
}

async function enableOrderAlerts() {
  if (!("Notification" in window)) {
    setDashboardStatus("This browser does not support website notifications.", true);
    return;
  }
  const permission = await Notification.requestPermission();
  updateOrderAlertButton();
  setDashboardStatus(permission === "granted" ? "Private order alerts enabled for this dashboard." : "Order alerts were not enabled.", permission !== "granted");
}

async function showOrderNotification(order) {
  const registration = await notificationRegistration;
  await registration.showNotification("New Prince Book Depot order", {
    body: `${order.orderId} from ${order.customer?.name || "a customer"}`,
    tag: order.orderId,
  });
}

function notifyForNewOrders(orders) {
  const currentIds = new Set(orders.map((order) => order.orderId));
  if (knownOrderIds && "Notification" in window && Notification.permission === "granted") {
    orders.filter((order) => !knownOrderIds.has(order.orderId)).forEach((order) => {
      showOrderNotification(order).catch(() => {});
    });
  }
  knownOrderIds = currentIds;
}

async function logout() {
  await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  window.location.replace("../login.html");
}
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
};

function setDashboardStatus(message, isError = false) {
  const status = $("dashboard-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function renderRecentOrders(orders) {
  const container = $("recent-orders");
  if (!orders.length) {
    container.innerHTML = '<div class="recent-empty">No orders have arrived yet.</div>';
    return;
  }
  container.innerHTML = orders.slice(0, 5).map((order) => {
    const status = String(order.status || "pending").toLowerCase();
    return `<a class="recent-order" href="./orders.html"><span class="recent-order-icon">${status === "pending" ? "!" : "✓"}</span><span class="recent-order-main"><strong>${escapeHtml(order.customer?.name || "Unknown customer")}</strong><small>${escapeHtml(order.orderId)} · ${formatDate(order.createdAt)}</small></span><span class="recent-order-end"><b>${money(order.pricing?.total)}</b><em class="status-${status}">${status}</em></span></a>`;
  }).join("");
}

const chartColors = {
  pending: "#f2b84b",
  confirmed: "#38b77a",
  processing: "#2699bd",
  shipped: "#7566c7",
  delivered: "#41a6a0",
  completed: "#0e7490",
  cancelled: "#d46b6b",
  returned: "#d58b50",
};

function renderStatusChart(orders) {
  const counts = {};
  orders.forEach((order) => {
    const status = String(order.status || "pending").toLowerCase();
    counts[status] = (counts[status] || 0) + 1;
  });
  const entries = Object.entries(counts).sort(([, first], [, second]) => second - first);
  const total = orders.length;
  $("status-total").textContent = total;
  let cursor = 0;
  const gradient = entries.map(([status, count]) => {
    const start = total ? (cursor / total) * 100 : 0;
    cursor += count;
    const end = total ? (cursor / total) * 100 : 0;
    return `${chartColors[status] || "#94a3b8"} ${start}% ${end}%`;
  });
  $("status-donut").style.background = total
    ? `conic-gradient(${gradient.join(",")})`
    : "conic-gradient(#dce7ee 0 100%)";
  $("status-legend").innerHTML = entries.length ? entries.map(([status, count]) => `<div class="legend-row"><span><i style="background:${chartColors[status] || "#94a3b8"}"></i>${escapeHtml(status)}</span><strong>${count}</strong></div>`).join("") : '<span class="chart-empty">No orders yet</span>';
}

function renderActivityChart(orders) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
  const values = days.map((day) => orders.filter((order) => {
    const created = new Date(order.createdAt);
    return created.toDateString() === day.toDateString();
  }).length);
  const maximum = Math.max(...values, 1);
  $("activity-chart").innerHTML = days.map((day, index) => `<div class="activity-column"><span class="activity-value">${values[index] || ""}</span><div class="activity-bar-track"><i style="height:${Math.max(values[index] ? 12 : 4, (values[index] / maximum) * 100)}%"></i></div><span class="activity-label">${day.toLocaleDateString("en-PK", { weekday: "short" }).slice(0, 3)}</span></div>`).join("");
}

function renderCategoryChart(products) {
  const categories = {};
  products.filter((product) => product.available !== false).forEach((product) => {
    const category = product.category || "Other";
    categories[category] = (categories[category] || 0) + 1;
  });
  const entries = Object.entries(categories).sort(([, first], [, second]) => second - first);
  const maximum = Math.max(...entries.map(([, count]) => count), 1);
  $("category-chart").innerHTML = entries.length ? entries.map(([category, count]) => `<div class="category-row"><div><span>${escapeHtml(category.replaceAll("-", " "))}</span><strong>${count}</strong></div><div class="category-track"><i style="width:${(count / maximum) * 100}%"></i></div></div>`).join("") : '<span class="chart-empty">No catalogue data yet</span>';
}

async function loadDashboard() {
  const refresh = $("refresh-dashboard");
  refresh.disabled = true;
  refresh.innerHTML = "Refreshing <span aria-hidden=\"true\">↻</span>";
  setDashboardStatus("Syncing store activity...");

  try {
    const [productsResponse, ordersResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/products?limit=200`, { credentials: "include" }),
      fetch(`${API_BASE_URL}/api/orders?limit=200`, { credentials: "include" }),
    ]);
    const productsData = await productsResponse.json().catch(() => ({}));
    const ordersData = await ordersResponse.json().catch(() => ({}));
    if (!productsResponse.ok || !productsData.success) throw new Error(productsData.message || "Could not load catalogue data.");
    if (!ordersResponse.ok || !ordersData.success) throw new Error(ordersData.message || "Could not load order data.");

    const products = Array.isArray(productsData.products) ? productsData.products : [];
    const orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
    notifyForNewOrders(orders);
    const activeOrders = orders.filter((order) => !["cancelled", "returned"].includes(order.status));
    const pending = orders.filter((order) => order.status === "pending").length;
    const activeValue = activeOrders.reduce((sum, order) => sum + Number(order.pricing?.total || 0), 0);

    $("product-count").textContent = products.length;
    $("available-count").textContent = products.filter((product) => product.available !== false).length;
    $("pending-count").textContent = pending;
    $("order-value").textContent = money(activeValue);
    $("pulse-pending").textContent = pending;
    $("pulse-message").textContent = pending ? `${pending} order${pending === 1 ? "" : "s"} waiting for review` : "The queue is clear";
    $("pulse-detail").textContent = pending ? "Open the order queue to confirm, process, or print a parcel slip." : "New customer orders will appear here as they arrive.";
    $("pulse-progress").style.width = `${Math.min(100, pending * 18)}%`;
    renderRecentOrders(orders);
    renderStatusChart(orders);
    renderActivityChart(orders);
    renderCategoryChart(products);
    $("analytics-updated").textContent = `Updated ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`;
    setDashboardStatus(`Updated ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`);
  } catch (error) {
    setDashboardStatus(error.message, true);
    $("recent-orders").innerHTML = '<div class="recent-empty">Live data is temporarily unavailable. Use the links above to continue working.</div>';
  } finally {
    refresh.disabled = false;
    refresh.innerHTML = "Refresh <span aria-hidden=\"true\">↻</span>";
  }
}

$("refresh-dashboard").addEventListener("click", loadDashboard);
$("logout-dashboard").addEventListener("click", logout);
orderAlertButton?.addEventListener("click", enableOrderAlerts);
updateOrderAlertButton();
loadDashboard();
setInterval(loadDashboard, 30000);
