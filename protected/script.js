const API_BASE =
  "https://princebookdepot-backend.onrender.com";


// ============================================================
// COMMON HELPERS
// ============================================================

function setStatus(
  element,
  message,
  type = ""
) {
  if (!element) return;

  element.className =
    type;

  element.textContent =
    message;
}


function fileToDataUrl(
  file
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          reader.result
        );

      reader.onerror = () =>
        reject(
          new Error(
            "Could not read the selected image."
          )
        );

      reader.readAsDataURL(
        file
      );
    }
  );
}


function validateImage(
  file
) {

  if (!file) {
    throw new Error(
      "Please choose an image."
    );
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Only image files are allowed."
    );
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new Error(
      "Image must be 5 MB or smaller."
    );
  }
}


// ============================================================
// ADD PRODUCT PAGE
// ============================================================

const productForm =
  document.getElementById(
    "product-form"
  );


if (productForm) {

  const imageInput =
    productForm.elements.image;

  const imagePreview =
    document.getElementById(
      "image-preview"
    );

  const statusBox =
    document.getElementById(
      "status"
    );

  const submitButton =
    document.getElementById(
      "submit-button"
    );


  // ----------------------------------------------------------
  // Image preview
  // ----------------------------------------------------------

  if (imageInput) {

    imageInput.addEventListener(
      "change",
      () => {

        const file =
          imageInput.files?.[0];


        if (!file) {

          if (imagePreview) {

            imagePreview
              .removeAttribute(
                "src"
              );

            imagePreview.style.display =
              "none";
          }

          return;
        }


        try {

          validateImage(
            file
          );

        } catch (error) {

          setStatus(
            statusBox,
            error.message,
            "error"
          );

          imageInput.value =
            "";

          return;
        }


        if (imagePreview) {

          const previewUrl =
            URL.createObjectURL(
              file
            );

          imagePreview.src =
            previewUrl;

          imagePreview.style.display =
            "block";
        }

      }
    );
  }


  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  productForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      setStatus(
        statusBox,
        ""
      );


      try {

        const file =
          imageInput?.files?.[0];


        validateImage(
          file
        );


        submitButton.disabled =
          true;

        submitButton.textContent =
          "Uploading image...";


        const imageData =
          await fileToDataUrl(
            file
          );


        const productData = {

          id:
            productForm.elements.id
              ?.value.trim(),

          name:
            productForm.elements.name
              ?.value.trim(),

          price:
            productForm.elements.price
              ?.value,

          discount:
            productForm.elements.discount
              ?.value,

          category:
            productForm.elements.category
              ?.value,

          mostPopular:
            productForm.elements.mostPopular
              ?.checked || false,

          thisWeekBest:
            productForm.elements.thisWeekBest
              ?.checked || false,

          featured:
            productForm.elements.featured
              ?.checked || false,

          available:
            productForm.elements.available
              ?.checked ?? true,

          image:
            imageData,

        };


        submitButton.textContent =
          "Saving product...";


        const response =
          await fetch(
            `${API_BASE}/api/products`,
            {

              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  productData
                ),

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server returned ${response.status}.`
          );
        }


        setStatus(
          statusBox,
          `Product ${data.product.id} saved successfully.`,
          "success"
        );


        productForm.reset();


        if (
          productForm.elements.available
        ) {
          productForm.elements.available
            .checked = true;
        }


        if (imagePreview) {

          imagePreview
            .removeAttribute(
              "src"
            );

          imagePreview.style.display =
            "none";
        }


        console.log(
          "✅ Product created:",
          data.product
        );

      } catch (error) {

        console.error(
          "Product upload error:",
          error
        );


        setStatus(
          statusBox,
          error.message ||
            "Something went wrong.",
          "error"
        );

      } finally {

        submitButton.disabled =
          false;

        submitButton.textContent =
          "Save Product";
      }

    }
  );
}


// ============================================================
// EDIT PRODUCT PAGE
// ============================================================

const loadProductForm =
  document.getElementById(
    "load-product-form"
  );

const editProductForm =
  document.getElementById(
    "edit-product-form"
  );


if (
  loadProductForm &&
  editProductForm
) {

  const searchInput =
    document.getElementById(
      "search-product"
    );

  const loadButton =
    document.getElementById(
      "load-product-btn"
    );

  const searchStatus =
    document.getElementById(
      "search-status"
    );

  const editStatus =
    document.getElementById(
      "edit-status"
    );

  const saveButton =
    document.getElementById(
      "save-product-btn"
    );

  const deleteButton =
    document.getElementById(
      "delete-product-btn"
    );

  const newImageInput =
    document.getElementById(
      "new-image"
    );

  const newImagePreview =
    document.getElementById(
      "new-image-preview"
    );

  const newImagePreviewImg =
    document.getElementById(
      "new-image-preview-img"
    );

  const currentProductImage =
    document.getElementById(
      "current-product-image"
    );

  const currentProductImageLarge =
    document.getElementById(
      "current-product-image-large"
    );

  const currentProductName =
    document.getElementById(
      "current-product-name"
    );

  const currentProductId =
    document.getElementById(
      "current-product-id"
    );

  const currentProductPrice =
    document.getElementById(
      "current-product-price"
    );


  let currentProductIdValue =
    null;


  // ----------------------------------------------------------
  // Hide edit form initially
  // ----------------------------------------------------------

  editProductForm.classList.remove(
    "visible"
  );


  // ----------------------------------------------------------
  // Load Product
  // ----------------------------------------------------------

  loadProductForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const query =
        searchInput.value.trim();


      if (!query) {

        setStatus(
          searchStatus,
          "Enter a Product ID or Product Name.",
          "error"
        );

        return;
      }


      setStatus(
        searchStatus,
        "Searching..."
      );


      loadButton.disabled =
        true;

      loadButton.textContent =
        "Loading...";


      try {

        const response =
          await fetch(
            `${API_BASE}/api/products?search=${encodeURIComponent(query)}`
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server returned ${response.status}.`
          );
        }


        const products =
          Array.isArray(
            data.products
          )
            ? data.products
            : [];


        if (
          products.length ===
          0
        ) {

          throw new Error(
            "Product not found."
          );
        }


        /*
         * The server searches by both ID and name.
         *
         * Prefer an exact ID/name match when multiple
         * results are returned.
         */

        const normalizedQuery =
          query.toLowerCase();


        const exactMatch =
          products.find(
            (product) =>
              product.id?.toLowerCase() ===
                normalizedQuery ||
              product.name?.toLowerCase() ===
                normalizedQuery
          );


        const product =
          exactMatch ||
          products[0];


        currentProductIdValue =
          product.id;


        // ------------------------------------------------------
        // Populate form
        // ------------------------------------------------------

        editProductForm.elements.id.value =
          product.id || "";

        editProductForm.elements.name.value =
          product.name || "";

        editProductForm.elements.price.value =
          product.price ?? "";

        editProductForm.elements.discount.value =
          product.discount ?? 0;

        editProductForm.elements.category.value =
          product.category || "";


        editProductForm.elements.mostPopular.checked =
          Boolean(
            product.mostPopular
          );


        editProductForm.elements.thisWeekBest.checked =
          Boolean(
            product.thisWeekBest
          );


        editProductForm.elements.featured.checked =
          Boolean(
            product.featured
          );


        editProductForm.elements.available.checked =
          Boolean(
            product.available
          );


        // ------------------------------------------------------
        // Product summary
        // ------------------------------------------------------

        currentProductName.textContent =
          product.name ||
          "Unnamed Product";


        currentProductId.textContent =
          `ID: ${product.id}`;


        currentProductPrice.textContent =
          `Rs.${Number(
            product.price || 0
          ).toLocaleString()}`;


        const imageUrl =
          product.imageUrl ||
          product.image ||
          "";


        if (imageUrl) {

          currentProductImage.src =
            imageUrl;

          currentProductImageLarge.src =
            imageUrl;

        } else {

          currentProductImage.removeAttribute(
            "src"
          );

          currentProductImageLarge.removeAttribute(
            "src"
          );
        }


        // ------------------------------------------------------
        // Reset replacement image
        // ------------------------------------------------------

        newImageInput.value =
          "";

        newImagePreview.style.display =
          "none";

        newImagePreviewImg.removeAttribute(
          "src"
        );


        // ------------------------------------------------------
        // Show edit form
        // ------------------------------------------------------

        editProductForm.classList.add(
          "visible"
        );


        setStatus(
          searchStatus,
          `Loaded ${product.name}.`,
          "success"
        );


        setStatus(
          editStatus,
          ""
        );


      } catch (error) {

        console.error(
          "Load product error:",
          error
        );


        editProductForm.classList.remove(
          "visible"
        );


        setStatus(
          searchStatus,
          error.message ||
            "Failed to load product.",
          "error"
        );

      } finally {

        loadButton.disabled =
          false;

        loadButton.textContent =
          "Load Product";

      }

    }
  );


  // ----------------------------------------------------------
  // New image preview
  // ----------------------------------------------------------

  newImageInput.addEventListener(
    "change",
    () => {

      const file =
        newImageInput.files?.[0];


      if (!file) {

        newImagePreview.style.display =
          "none";

        newImagePreviewImg
          .removeAttribute(
            "src"
          );

        return;
      }


      try {

        validateImage(
          file
        );

      } catch (error) {

        setStatus(
          editStatus,
          error.message,
          "error"
        );

        newImageInput.value =
          "";

        return;
      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      newImagePreviewImg.src =
        previewUrl;

      newImagePreview.style.display =
        "block";

    }
  );


  // ----------------------------------------------------------
  // Save changes
  // ----------------------------------------------------------

  editProductForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      if (
        !currentProductIdValue
      ) {

        setStatus(
          editStatus,
          "Load a product first.",
          "error"
        );

        return;
      }


      setStatus(
        editStatus,
        ""
      );


      saveButton.disabled =
        true;

      deleteButton.disabled =
        true;

      saveButton.textContent =
        "Saving...";


      try {

        const productData = {

          name:
            editProductForm.elements.name
              .value.trim(),

          price:
            editProductForm.elements.price
              .value,

          discount:
            editProductForm.elements.discount
              .value,

          category:
            editProductForm.elements.category
              .value,

          mostPopular:
            editProductForm.elements.mostPopular
              .checked,

          thisWeekBest:
            editProductForm.elements.thisWeekBest
              .checked,

          featured:
            editProductForm.elements.featured
              .checked,

          available:
            editProductForm.elements.available
              .checked,

        };


        // ------------------------------------------------------
        // Only send image when user selected a replacement
        // ------------------------------------------------------

        const newImage =
          newImageInput.files?.[0];


        if (newImage) {

          saveButton.textContent =
            "Uploading new image...";


          productData.image =
            await fileToDataUrl(
              newImage
            );
        }


        saveButton.textContent =
          "Saving changes...";


        const response =
          await fetch(
            `${API_BASE}/api/products/${encodeURIComponent(
              currentProductIdValue
            )}`,
            {

              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  productData
                ),

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server returned ${response.status}.`
          );
        }


        const updatedProduct =
          data.product;


        // ------------------------------------------------------
        // Update preview immediately
        // ------------------------------------------------------

        const updatedImage =
          updatedProduct.imageUrl ||
          updatedProduct.image ||
          "";


        if (updatedImage) {

          currentProductImage.src =
            updatedImage;

          currentProductImageLarge.src =
            updatedImage;
        }


        currentProductName.textContent =
          updatedProduct.name;


        currentProductPrice.textContent =
          `Rs.${Number(
            updatedProduct.price || 0
          ).toLocaleString()}`;


        currentProductId.textContent =
          `ID: ${updatedProduct.id}`;


        // Clear selected replacement
        newImageInput.value = "";

        newImagePreview.style.display =
          "none";


        setStatus(
          editStatus,
          "Product updated successfully.",
          "success"
        );


        console.log(
          "✅ Product updated:",
          updatedProduct
        );


      } catch (error) {

        console.error(
          "Update product error:",
          error
        );


        setStatus(
          editStatus,
          error.message ||
            "Failed to update product.",
          "error"
        );

      } finally {

        saveButton.disabled =
          false;

        deleteButton.disabled =
          false;

        saveButton.textContent =
          "Save Changes";
      }

    }
  );


  // ----------------------------------------------------------
  // Delete Product
  // ----------------------------------------------------------

  deleteButton.addEventListener(
    "click",
    async () => {

      if (
        !currentProductIdValue
      ) {

        setStatus(
          editStatus,
          "Load a product first.",
          "error"
        );

        return;
      }


      const productName =
        currentProductName.textContent ||
        currentProductIdValue;


      const confirmed =
        window.confirm(
          `Delete "${productName}" permanently?\n\nThis will remove the product from MongoDB and delete its Cloudinary image.`
        );


      if (!confirmed) {
        return;
      }


      saveButton.disabled =
        true;

      deleteButton.disabled =
        true;

      deleteButton.textContent =
        "Deleting...";


      try {

        const response =
          await fetch(
            `${API_BASE}/api/products/${encodeURIComponent(
              currentProductIdValue
            )}`,
            {
              method:
                "DELETE",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server returned ${response.status}.`
          );
        }


        setStatus(
          editStatus,
          "Product deleted successfully.",
          "success"
        );


        currentProductIdValue =
          null;


        editProductForm.reset();


        editProductForm.classList.remove(
          "visible"
        );


        currentProductImage.removeAttribute(
          "src"
        );

        currentProductImageLarge.removeAttribute(
          "src"
        );


        searchInput.value =
          "";


        setStatus(
          searchStatus,
          "Product deleted.",
          "success"
        );


        console.log(
          "✅ Product deleted."
        );


      } catch (error) {

        console.error(
          "Delete product error:",
          error
        );


        setStatus(
          editStatus,
          error.message ||
            "Failed to delete product.",
          "error"
        );

      } finally {

        saveButton.disabled =
          false;

        deleteButton.disabled =
          false;

        deleteButton.textContent =
          "Delete Product";
      }

    }
  );

}