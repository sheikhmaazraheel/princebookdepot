const API_BASE_URL = "https://princebookdepot-backend.onrender.com";
const rows = document.getElementById("product-rows");
const status = document.getElementById("catalogue-status");
const saveButton = document.getElementById("save-products");
const changeCount = document.getElementById("change-count");
const emptyTable = document.getElementById("empty-table");
const searchInput = document.getElementById("catalogue-search");
let products = [];
let selectedCategory = "all";
const dirtyIds = new Set();

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));
const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-PK")}`;

function setStatus(message, type = "") {
  status.textContent = message;
  status.className = `catalogue-status ${type}`;
}

function filteredProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  return products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const text = [product.id, product.name, product.author].filter(Boolean).join(" ").toLocaleLowerCase();
    return matchesCategory && (!query || text.includes(query));
  });
}

function finalPrice(price, discount) {
  return Math.round(Number(price || 0) - (Number(price || 0) * Number(discount || 0)) / 100);
}

function updateChangeState() {
  const count = dirtyIds.size;
  saveButton.disabled = count === 0;
  changeCount.textContent = count ? `${count} unsaved ${count === 1 ? "change" : "changes"}` : "No unsaved changes";
}

function render() {
  const visibleProducts = filteredProducts();
  rows.innerHTML = visibleProducts.map((product) => `
    <tr data-id="${escapeHtml(product.id)}">
      <th scope="row"><input class="cell-input name-input" data-field="name" value="${escapeHtml(product.name)}" aria-label="Product name for ${escapeHtml(product.id)}" /><small>${escapeHtml(product.id)}</small></th>
      <td><input class="cell-input" data-field="author" maxlength="120" value="${escapeHtml(product.author || "")}" placeholder="Add author" aria-label="Author name for ${escapeHtml(product.name)}" /></td>
      <td><input class="cell-input number-input" data-field="price" type="number" min="0" step="0.01" value="${Number(product.price || 0)}" aria-label="Price for ${escapeHtml(product.name)}" /></td>
      <td><input class="cell-input number-input" data-field="discount" type="number" min="0" max="100" step="0.01" value="${Number(product.discount || 0)}" aria-label="Discount for ${escapeHtml(product.name)}" /></td>
      <td class="final-price">${money(product.finalPrice ?? finalPrice(product.price, product.discount))}</td>
      <td><span class="category-chip">${escapeHtml(String(product.category || "").replaceAll("-", " "))}</span></td>
    </tr>
  `).join("");
  emptyTable.hidden = visibleProducts.length > 0;
  updateChangeState();
}

function markDirty(input) {
  const row = input.closest("tr");
  const product = products.find((item) => item.id === row.dataset.id);
  if (!product) return;
  product[input.dataset.field] = input.dataset.field === "author" || input.dataset.field === "name" ? input.value : Number(input.value);
  row.classList.add("is-dirty");
  if (input.dataset.field === "price" || input.dataset.field === "discount") {
    row.querySelector(".final-price").textContent = money(finalPrice(product.price, product.discount));
  }
  dirtyIds.add(product.id);
  updateChangeState();
}

rows.addEventListener("input", (event) => {
  if (event.target.matches(".cell-input")) markDirty(event.target);
});

document.querySelectorAll(".category-tab").forEach((tab) => tab.addEventListener("click", () => {
  selectedCategory = tab.dataset.category;
  document.querySelectorAll(".category-tab").forEach((item) => {
    const active = item === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  render();
}));
searchInput.addEventListener("input", render);

saveButton.addEventListener("click", async () => {
  const updates = products.filter((product) => dirtyIds.has(product.id)).map(({ id, name, author, price, discount }) => ({ id, name, author, price, discount }));
  if (!updates.length) return;
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";
  setStatus("Saving catalogue changes...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/bulk`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || `Server returned ${response.status}.`);
    products = data.products;
    dirtyIds.clear();
    render();
    setStatus(data.message, "success");
  } catch (error) {
    setStatus(error.message || "Could not save catalogue changes.", "error");
    updateChangeState();
  } finally {
    saveButton.textContent = "Save changes →";
  }
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Could not load products.");
    products = Array.isArray(data.products) ? data.products : [];
    render();
    setStatus(`${products.length} product${products.length === 1 ? "" : "s"} in catalogue.`);
  } catch (error) {
    setStatus(error.message || "Could not load products.", "error");
  }
}

loadProducts();
