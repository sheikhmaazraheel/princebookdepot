const githubURL = "https://sheikhmaazraheel.github.io/princebookdepot";
// ====== MOBILE NAVBAR LOGIC ======
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const closeBtn = document.getElementById("close-menu");
  const mobileMenu = document.getElementById("mobile-menu");

  function openMenu() {
    document.body.classList.add("show-nav");
    hamburger.style.display = "none";
    if (mobileMenu) {
      mobileMenu.classList.remove("closing");
      mobileMenu.style.transition = "transform 0.3s cubic-bezier(0.4,0,0.2,1)";
    }
  }

  function closeMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add("closing");
      mobileMenu.style.transition = "transform 0.3s cubic-bezier(0.4,0,0.2,1)";
      setTimeout(() => {
        document.body.classList.remove("show-nav");
        mobileMenu.classList.remove("closing");
        hamburger.style.display = "block";
      }, 200); // Match transition duration
    }
  }

  if (hamburger) hamburger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("show-nav")) {
      closeMenu();
    }
  });
});

// ============== Rendering Products ===============
document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  const cartCount = document.querySelector(".cart-count");
  // Get Cart Product Count
  function getCartProductCount() {
    return Object.keys(cart).length;
  }
  // Get Cart Total
  function getCartTotal() {
    let popupSubtotal = 0;
    Object.keys(cart).forEach((id) => {
      const item = cart[id];
      const price = item.price || 0;
      const qty = item.quantity || 0;
      const amount = price * qty;
      popupSubtotal += amount;
    });
    return popupSubtotal;
  }

  // Shared Cart Logic Setup
  function setupCartForProduct(product) {
    const addToCartBtn = product.querySelector(".add-to-cart-button");
    const qtyControls = product.querySelector(".quantity-controls");
    const qtyDisplay = product.querySelector(".quantity");
    const increaseBtn = product.querySelector(".increase");
    const decreaseBtn = product.querySelector(".decrease");

    const productId = product.dataset.id;
    const productName = product.dataset.name;
    const productPrice = parseFloat(product.dataset.price);

    // ✅ Load cart from localStorage

    let quantity = cart[productId]?.quantity || 0;

    // ✅ If product is already in cart, show quantity controls
    if (quantity > 0) {
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    }

    // ➕ Add to Cart
    addToCartBtn.addEventListener("click", () => {
      quantity = 1;
      cart[productId] = { name: productName, price: productPrice, quantity };
      localStorage.setItem("cart", JSON.stringify(cart));

      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
      const cartPopup = document.getElementById("cart-popup");
      if (!cartPopup.classList.contains("show")) {
        cartPopup.classList.add("show-before");
        const popupCount = document.querySelector(".popupCartCount");
        const popupTotal = document.querySelector(".popupCartTotal");

        popupCount.textContent = getCartProductCount();
        popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;

        setTimeout(() => {
          cartPopup.classList.remove("show-before");
          cartPopup.classList.add("show");
        }, 200);
      } else {
        const popupCount = document.querySelector(".popupCartCount");
        const popupTotal = document.querySelector(".popupCartTotal");

        popupCount.textContent = getCartProductCount();
        popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
      }
      cartCount.textContent = getCartProductCount();
    });

    // ➕ Increase Quantity
    increaseBtn.addEventListener("click", () => {
      quantity++;
      cart[productId].quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cart));

      qtyDisplay.textContent = quantity;
      qtyDisplay.style.transform = "scale(1.2)";
      setTimeout(() => {
        qtyDisplay.style.transform = "scale(1)";
      }, 150);
      const popupCount = document.querySelector(".popupCartCount");
      const popupTotal = document.querySelector(".popupCartTotal");

      popupCount.textContent = getCartProductCount();
      popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
      cartCount.textContent = getCartProductCount();
    });

    // ➖ Decrease Quantity
    decreaseBtn.addEventListener("click", () => {
      quantity--;

      if (quantity <= 0) {
        delete cart[productId];
        localStorage.setItem("cart", JSON.stringify(cart));
        addToCartBtn.style.display = "inline-block";
        qtyControls.classList.remove("active");
        if (Object.keys(cart).length === 0) {
          const cartPopup = document.getElementById("cart-popup");
          if (cartPopup.classList.contains("show")) {
            cartPopup.classList.remove("show");
          }
        } else {
          const popupCount = document.querySelector(".popupCartCount");
          const popupTotal = document.querySelector(".popupCartTotal");

          popupCount.textContent = getCartProductCount();
          popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
        }
      } else {
        cart[productId].quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        qtyDisplay.textContent = quantity;

        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => {
          qtyDisplay.style.transform = "scale(1)";
        }, 150);

        const popupCount = document.querySelector(".popupCartCount");
        const popupTotal = document.querySelector(".popupCartTotal");

        popupCount.textContent = getCartProductCount();
        popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
      }
      cartCount.textContent = getCartProductCount();
    });
  }
  cartCount.textContent = getCartProductCount();
  // ✅ PRODUCT PAGES
  if (document.body.dataset.category) {
    const category = document.body.dataset.category;
    const loader = document.getElementById("loader");
    const container = document.getElementById("Product-grid");
    container.style.display = "none";
    fetch(
      "https://script.google.com/macros/s/AKfycbxMoDKCh-ywDckfEeyLklRSSHO6932khQ5-DegVL0FqRwza98AgDrgSQAxgW10b31tm/exec"
    )
      .then((res) => res.json())
      .then((products) => {
        loader.style.display = "none";
        container.style.display = "grid";

        const filtered = products.filter(
          (p) => p.category === category && !!p.availible
        );

        filtered.forEach((product) => {
          console.log("Rendering Products");
          const div = document.createElement("div");
          const basePrice = parseFloat(product.price);
          const discount = parseFloat(product.discount) || 0;
          const finalPrice = Math.round(
            basePrice - (basePrice * discount) / 100
          );
          div.className = "Product";
          div.id = `${product.id}`;
          div.dataset.id = product.id;
          div.dataset.name = product.name;
          div.dataset.price = finalPrice;
          if(product.discount>0){          
          div.innerHTML = `
            <div class="discount">${product.discount || 0}%</div>
            <img src="${product.image}" alt="${product.name}" />
            <div class="Product-name">${product.name}</div>
            <div><span class="price">Rs.${basePrice}</span> <span class="dicounted-price">Rs.${finalPrice}</span></div>
            <button class="add-to-cart-button">Add to Cart</button>
            <div class="quantity-controls">
              <button class="decrease">−</button>
              <span class="quantity">1</span>
              <button class="increase">+</button>
            </div>
            `;
          } else{
            div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" />
            <div class="Product-name">${product.name}</div>
            <div><span class="price">Rs.${basePrice}</span> <span class="dicounted-price">Rs.${finalPrice}</span></div>
            <button class="add-to-cart-button">Add to Cart</button>
            <div class="quantity-controls">
              <button class="decrease">−</button>
              <span class="quantity">1</span>
              <button class="increase">+</button>
            </div>
            `;
          }
          container.appendChild(div);
          setupCartForProduct(div); // Hook cart logic
          document.querySelectorAll(".Product").forEach(setupCartForProduct);
        });
        if (Object.keys(cart).length > 0 && document.body.dataset.category) {
          const cartPopup = document.getElementById("cart-popup");
          if (!cartPopup.classList.contains("show")) {
            cartPopup.classList.add("show-before");
            const popupCount = document.querySelector(".popupCartCount");
            const popupTotal = document.querySelector(".popupCartTotal");

            popupCount.textContent = getCartProductCount();
            popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;

            setTimeout(() => {
              cartPopup.classList.remove("show-before");
              cartPopup.classList.add("show");
            }, 200);
          }
        }
      });
  }
  console.log("Hello");
  // ✅ CART PAGE
  const cartItemsTbody = document.getElementById("cart-items");
  const orderIdSpan = document.getElementById("order-id");
  const Quantity = document.getElementById("Quantity-heading");
  const cartSummary = document.getElementById("cart-summary");
  const cartTable = document.getElementById("cart-table");
  const cartHeadings = document.getElementById("summary-headings");
  const totalRow = document.getElementById("total");
  const totalColumn = document.getElementById("totalColumn");

  let subtotal = 0;
  let total = 0;
  if (cartItemsTbody) {
    cartItemsTbody.innerHTML = "";

    Object.keys(cart).forEach((id) => {
      const item = cart[id];
      const price = item.price || 0;
      const qty = item.quantity || 0;
      const amount = price * qty;
      subtotal += amount;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name || "Unnamed"}</td>
        <td>${price}</td>
        <td class="qty-cell">
          <button class="qty-btn decrease" data-id="${id}">−</button>
          <span class="quantity" id="qty-${id}">${qty}</span>
          <button class="qty-btn increase" data-id="${id}">+</button>
        </td>
        <td >${amount}</td>
      `;

      cartItemsTbody.appendChild(row);
    });

    // ======= SYNC COLUMNS WIDTH
    function syncColumnWidths() {
      // Get first row of cartTable
      const cartTableRow = cartTable.rows[0];
      // Sum width of first three columns
      const width1 = cartTableRow.cells[0].getBoundingClientRect().width;
      const width2 = cartTableRow.cells[1].getBoundingClientRect().width;
      const width3 = cartTableRow.cells[2].getBoundingClientRect().width;
      const totalWidth = width1 + width2 + width3;

      // Apply the calculated width
      cartHeadings.style.width = totalWidth + "px";
      totalColumn.style.width = totalWidth + "px";
    }

    // Run on load and on resize
    window.addEventListener("load", syncColumnWidths);
    window.addEventListener("resize", syncColumnWidths);

    //  ======== ADDING CART SUMMARY
    let deliveryCharges = 0;
    if (subtotal != 0) {
      deliveryCharges = 150;
    }
    total = subtotal + deliveryCharges;
    const deliveryCell = document.getElementById("delivery-charges");

    const Summaryrow = document.createElement("tr");
    Summaryrow.innerHTML = ` 
          <td id="summary-headings">Sub-total :</td>
          <td id="summary-data">Rs.${subtotal}</td>
    `;
    deliveryCell.innerHTML = `Rs.${deliveryCharges}`;
    cartSummary.prepend(Summaryrow);
    const Row = document.createElement("tr");
    Row.innerHTML = ` 
          <td id="summary-headings">Total :</td>
          <td id="summary-data">Rs.${total}</td>
        
    `;
    totalRow.appendChild(Row);
    const smallScreenQuery = window.matchMedia("(max-width:768px)");
    function changeQuantityText() {
      if (smallScreenQuery.matches) {
        Quantity.textContent = "Qty.";
      }
    }
    changeQuantityText();
    document.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const isIncrease = button.classList.contains("increase");
        const cart = JSON.parse(localStorage.getItem("cart")) || {};
        const item = cart[id];

        if (!item) return;

        // Update quantity
        item.quantity += isIncrease ? 1 : -1;

        // If quantity is 0, remove item
        if (item.quantity <= 0) {
          delete cart[id];
        } else {
          cart[id] = item;
        }

        // Save and reload
        localStorage.setItem("cart", JSON.stringify(cart));
        cartCount.textContent = getCartProductCount();
        location.reload();
      });
    });
  }

  // ORDER ID
  function generateOrderId() {
    // ...existing code for order id generation...
  }

  // ...existing code...

  // ============== Search Functionality ===============
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const CACHE_KEY = "prince_book_depot_products";
  const CACHE_EXPIRY_KEY = "prince_book_depot_cache_expiry";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  async function fetchProducts() {
    // Check if cached data exists and is not expired
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    const now = Date.now();

    if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
      try {
        const products = JSON.parse(cachedData);
        if (Array.isArray(products)) {
          console.log("Using cached products");
          return products;
        }
      } catch (err) {
        console.error("Error parsing cached products:", err);
      }
    }

    // Fetch new data if no valid cache
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbxMoDKCh-ywDckfEeyLklRSSHO6932khQ5-DegVL0FqRwza98AgDrgSQAxgW10b31tm/exec",
        {
          method: "GET",
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const products = await res.json();
      console.log("Products fetched:", products);

      if (!products || !Array.isArray(products)) {
        throw new Error("Invalid product data received");
      }

      // Cache products and set expiry
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(CACHE_EXPIRY_KEY, now + CACHE_DURATION);
      return products;
    } catch (err) {
      console.error("Fetch products error:", err);
      const errorMsg = `<p class="no-results" style="color: #2E5077; font-weight: bold;">Error: Unable to load products. Please try again later.</p>`;
      if (searchResults) searchResults.innerHTML = errorMsg;
      if (searchResults) searchResults.classList.add("show");
      return [];
    }
  }

  function filterProducts(query, products) {
    if (!products) return [];
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query.toLowerCase()) &&
        product.category.trim().toLowerCase() === document.body.dataset.category.trim().toLocaleLowerCase()
    );
  }

  function displayResults(products, resultsContainer) {
    if (!resultsContainer) return;

    if (products.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results" style="color: #2E5077; font-weight: bold;">No products found.</p>`;
      resultsContainer.classList.add("show");
      return;
    }

    resultsContainer.innerHTML = products
      .map(
        (product) => `
        <a href="${githubURL}/${product.category}#${
          product.id
        }" class="block p-3 hover:bg-gradient-to-r hover:from-#E6F0FA hover:to-#B3D4FF flex items-center gap-3 border-b border-gray-200">
          <img src="${product.image || ""}" alt="${
          product.name || "Product"
        }" class="w-12 h-12 object-cover rounded" onerror="this.style.display='none'">
          <div class="result-text">
            <p class="result-name" style="color: #2E5077; font-weight: bold;">${
              product.name || "Unnamed Product"
            }</p>
            <p class="result-details" style="color: #1D3758; font-size: 0.9rem;">${
              product.category || "Unknown"
            } - Rs. ${product.price?.toFixed(2) || "N/A"}</p>
          </div>
        </a>
      `
      )
      .join("");
    resultsContainer.classList.add("show");
  }

  // Debounce function to limit search processing
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async function handleSearch(query, resultsContainer) {
    if (!resultsContainer) return;

    if (query.length < 1) {
      resultsContainer.classList.remove("show");
      resultsContainer.innerHTML = "";
      return;
    }

    const products = await fetchProducts(); // Use cached or fetch
    const filteredProducts = filterProducts(query, products);
    displayResults(filteredProducts, resultsContainer);
  }

  function setupSearch(input, results) {
    if (!input || !results) return;

    // Debounced search handler
    const debouncedSearch = debounce(
      (value) => handleSearch(value, results),
      300
    );

    input.addEventListener("input", (e) =>
      debouncedSearch(e.target.value.trim())
    );
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 1) {
        debouncedSearch(input.value.trim());
      }
    });
    input.addEventListener("blur", () => {
      // Delay hiding results to allow clicking
      setTimeout(() => {
        if (!input.contains(document.activeElement)) {
          results.classList.remove("show");
          results.innerHTML = "";
        }
      }, 200);
    });
  }

  setupSearch(searchInput, searchResults);

  // Close results when clicking outside
  document.addEventListener("click", (e) => {
    if (
      searchInput &&
      searchResults &&
      !searchInput.contains(e.target) &&
      !searchResults.contains(e.target)
    ) {
      searchResults.classList.remove("show");
      searchResults.innerHTML = "";
    }
  });

  // Pre-fetch products on page load
  document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(); // Cache products immediately
  });
});
