const API_BASE =
  "https://princebookdepot-backend.onrender.com";

const form =
  document.getElementById(
    "product-form"
  );

const imageInput =
  form.elements.image;

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


// ============================================================
// IMAGE PREVIEW
// ============================================================

imageInput.addEventListener(
  "change",
  () => {

    const file =
      imageInput.files?.[0];


    if (!file) {

      imagePreview.removeAttribute(
        "src"
      );

      imagePreview.style.display =
        "none";

      return;
    }


    // Only images
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      statusBox.className =
        "error";

      statusBox.textContent =
        "Please select an image file.";

      imageInput.value =
        "";

      imagePreview.style.display =
        "none";

      return;
    }


    const previewUrl =
      URL.createObjectURL(
        file
      );


    imagePreview.src =
      previewUrl;

    imagePreview.style.display =
      "block";
  }
);


// ============================================================
// FILE → BASE64 DATA URI
// ============================================================

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


      reader.onload = () => {

        resolve(
          reader.result
        );

      };


      reader.onerror = () => {

        reject(
          new Error(
            "Could not read the selected image."
          )
        );

      };


      reader.readAsDataURL(
        file
      );
    }
  );

}


// ============================================================
// SUBMIT PRODUCT
// ============================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    statusBox.className =
      "";

    statusBox.textContent =
      "";


    const file =
      imageInput.files?.[0];


    if (!file) {

      statusBox.className =
        "error";

      statusBox.textContent =
        "Please choose a product image.";

      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      statusBox.className =
        "error";

      statusBox.textContent =
        "Only image files are allowed.";

      return;
    }


    // 5 MB frontend safety check
    if (
      file.size >
      5 * 1024 * 1024
    ) {

      statusBox.className =
        "error";

      statusBox.textContent =
        "Image must be 5 MB or smaller.";

      return;
    }


    submitButton.disabled =
      true;

    submitButton.textContent =
      "Uploading image...";


    try {

      // --------------------------------------------------------
      // Convert image to Base64
      // --------------------------------------------------------

      const imageData =
        await fileToDataUrl(
          file
        );


      submitButton.textContent =
        "Saving product...";


      // --------------------------------------------------------
      // Build JSON payload
      // --------------------------------------------------------

      const productData = {

        id:
          form.elements.id.value
            .trim(),

        name:
          form.elements.name.value
            .trim(),

        price:
          form.elements.price.value,

        discount:
          form.elements.discount.value,

        category:
          form.elements.category.value,

        mostPopular:
          form.elements.mostPopular.checked,

        thisWeekBest:
          form.elements.thisWeekBest.checked,

        featured:
          form.elements.featured.checked,

        available:
          form.elements.available.checked,

        image:
          imageData,

      };


      // --------------------------------------------------------
      // Send to Render
      // --------------------------------------------------------

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


      let data;

      try {

        data =
          await response.json();

      } catch {

        throw new Error(
          "The server returned an invalid response."
        );

      }


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          `Server returned ${response.status}.`
        );

      }


      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      statusBox.className =
        "success";

      statusBox.textContent =
        `Product ${data.product.id} saved successfully.`;


      form.reset();


      // Keep Available checked
      if (
        form.elements.available
      ) {

        form.elements.available.checked =
          true;

      }


      imagePreview.removeAttribute(
        "src"
      );

      imagePreview.style.display =
        "none";


      console.log(
        "✅ Product saved:",
        data.product
      );


      console.log(
        "☁️ Cloudinary image:",
        data.product.image
      );


    } catch (error) {

      console.error(
        "Product upload error:",
        error
      );


      statusBox.className =
        "error";

      statusBox.textContent =
        error.message ||
        "Something went wrong.";

    } finally {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Save Product";

    }

  }
);