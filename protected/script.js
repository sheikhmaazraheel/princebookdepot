const API_BASE =
  "https://princebookdepot-backend.onrender.com";

const form =
  document.getElementById("product-form");

const imageInput =
  form?.elements?.image;

const imagePreview =
  document.getElementById("image-preview");

const statusBox =
  document.getElementById("status");

const submitButton =
  document.getElementById("submit-button");


// ============================================================
// SAFETY CHECK
// ============================================================

if (!form) {
  console.error(
    "❌ Product form not found. Expected #product-form."
  );
}


// ============================================================
// IMAGE PREVIEW
// ============================================================

if (imageInput) {
  imageInput.addEventListener(
    "change",
    () => {
      const file =
        imageInput.files?.[0];

      if (!file) {
        if (imagePreview) {
          imagePreview.removeAttribute("src");
          imagePreview.style.display = "none";
        }

        return;
      }

      if (!file.type.startsWith("image/")) {
        if (statusBox) {
          statusBox.className = "error";
          statusBox.textContent =
            "Please select an image file.";
        }

        imageInput.value = "";

        if (imagePreview) {
          imagePreview.removeAttribute("src");
          imagePreview.style.display = "none";
        }

        return;
      }

      /*
       * The preview is optional.
       * If your HTML has #image-preview it will show.
       * If it does not, uploading will still work.
       */
      if (imagePreview) {
        const previewUrl =
          URL.createObjectURL(file);

        imagePreview.src =
          previewUrl;

        imagePreview.style.display =
          "block";
      }
    }
  );
}


// ============================================================
// FILE → BASE64 DATA URI
// ============================================================

function fileToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Could not read the selected image."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


// ============================================================
// STATUS HELPER
// ============================================================

function setStatus(
  message,
  type = ""
) {
  if (!statusBox) return;

  statusBox.className =
    type;

  statusBox.textContent =
    message;
}


// ============================================================
// SUBMIT PRODUCT
// ============================================================

if (form) {
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      setStatus("");

      if (!imageInput) {
        setStatus(
          "Image input was not found.",
          "error"
        );

        return;
      }

      const file =
        imageInput.files?.[0];

      if (!file) {
        setStatus(
          "Please choose a product image.",
          "error"
        );

        return;
      }

      // Only images
      if (
        !file.type.startsWith("image/")
      ) {
        setStatus(
          "Only image files are allowed.",
          "error"
        );

        return;
      }

      // 5 MB frontend safety limit
      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setStatus(
          "Image must be 5 MB or smaller.",
          "error"
        );

        return;
      }

      if (submitButton) {
        submitButton.disabled =
          true;

        submitButton.textContent =
          "Uploading image...";
      }

      try {
        // ------------------------------------------------------
        // Convert image to Base64
        // ------------------------------------------------------

        const imageData =
          await fileToDataUrl(file);


        if (submitButton) {
          submitButton.textContent =
            "Saving product...";
        }


        // ------------------------------------------------------
        // Build product object
        // ------------------------------------------------------

        const productData = {
          id:
            form.elements.id?.value
              .trim(),

          name:
            form.elements.name?.value
              .trim(),

          price:
            form.elements.price?.value,

          discount:
            form.elements.discount?.value,

          category:
            form.elements.category?.value,

          mostPopular:
            form.elements.mostPopular?.checked ||
            false,

          thisWeekBest:
            form.elements.thisWeekBest?.checked ||
            false,

          featured:
            form.elements.featured?.checked ||
            false,

          available:
            form.elements.available?.checked ??
            true,

          image:
            imageData
        };


        // ------------------------------------------------------
        // Send JSON to Render
        // ------------------------------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/products`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  productData
                )
            }
          );


        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }


        // ------------------------------------------------------
        // Server error
        // ------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data.message ||
            `Server returned ${response.status}.`
          );
        }


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        setStatus(
          `Product ${data.product.id} saved successfully.`,
          "success"
        );

        console.log(
          "✅ Product saved:",
          data.product
        );

        console.log(
          "☁️ Cloudinary image:",
          data.product.image
        );


        // ------------------------------------------------------
        // Reset form
        // ------------------------------------------------------

        form.reset();


        // Available should remain checked
        if (form.elements.available) {
          form.elements.available.checked =
            true;
        }


        // Image preview is optional
        if (imagePreview) {
          imagePreview.removeAttribute(
            "src"
          );

          imagePreview.style.display =
            "none";
        }


      } catch (error) {
        console.error(
          "Product upload error:",
          error
        );

        setStatus(
          error.message ||
          "Something went wrong.",
          "error"
        );

      } finally {
        if (submitButton) {
          submitButton.disabled =
            false;

          submitButton.textContent =
            "Save Product";
        }
      }
    }
  );
}