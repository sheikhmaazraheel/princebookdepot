const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "";

const form = document.getElementById("product-form");
const imageInput = form.elements.image;
const previewBox = document.getElementById("preview-box");
const preview = document.getElementById("preview-img");
const statusBox = document.getElementById("status");
const submitButton = document.getElementById("submit-button");

let previewUrl = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (!file) {
    preview.removeAttribute("src");
    previewBox.hidden = true;
    return;
  }

  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  previewBox.hidden = false;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusBox.className = "";
  statusBox.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = imageInput.files?.[0];

  if (!file) {
    statusBox.className = "error";
    statusBox.textContent = "Please select a product image.";
    return;
  }

  const formData = new FormData(form);

  // Explicitly send checkbox values because unchecked checkboxes are omitted
  // from FormData by the browser.
  formData.set(
    "mostPopular",
    form.elements.mostPopular.checked ? "true" : "false"
  );

  formData.set(
    "thisWeekBest",
    form.elements.thisWeekBest.checked ? "true" : "false"
  );

  formData.set(
    "featured",
    form.elements.featured.checked ? "true" : "false"
  );

  formData.set(
    "available",
    form.elements.available.checked ? "true" : "false"
  );

  submitButton.disabled = true;
  submitButton.textContent = "Saving Product...";

  try {
    const response = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      body: formData,
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to save product.");
    }

    statusBox.className = "success";
    statusBox.textContent =
      `✓ ${data.product.name} (${data.product.id}) saved successfully.`;

    form.reset();
    form.elements.available.checked = true;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    preview.removeAttribute("src");
    previewBox.hidden = true;
  } catch (error) {
    console.error("Product upload error:", error);

    statusBox.className = "error";
    statusBox.textContent = error.message || "Something went wrong.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Product";
  }
});
