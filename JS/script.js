const githubURL = "https://sheikhmaazraheel.github.io/princebookdepot";
let allProducts = [];

function getProductImageUrl(product) {
  const imageUrl = product.imageUrl || product.image || "";
  return imageUrl.replace(/^http:\/\//i, "https://");
}

// Cards fade/slide into view the first time they enter the viewport.
// One shared observer for the whole page (cheaper than one per card).
const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

// Auto-advances a horizontally-scrolling product rail (Most Popular /
// Best Sellers) while it is visible on screen, pausing when the user
// scrolls/touches it themselves and resuming a few seconds after they
// stop, and pausing entirely while it's off-screen. Respects
// prefers-reduced-motion.
function initAutoScrollRail(container) {
  if (!container) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const INTERVAL_MS = 3500; // time to "look" at each set of products
  const RESUME_DELAY_MS = 4000; // wait this long after user interaction
  let timer = null;
  let resumeTimer = null;
  let isVisible = false;

  function getStep() {
    const firstCard = container.querySelector(".Product");
    if (!firstCard) return container.clientWidth;
    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function advance() {
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 4) return; // nothing to scroll
    const step = getStep();
    const next = container.scrollLeft + step;
    container.scrollTo({
      left: next >= maxScroll - 4 ? 0 : next, // loop back to the start
      behavior: "smooth",
    });
  }

  function start() {
    if (timer) return;
    timer = setInterval(advance, INTERVAL_MS);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function pauseThenResume() {
    stop();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (isVisible) start();
    }, RESUME_DELAY_MS);
  }

  container.addEventListener("pointerdown", pauseThenResume);
  container.addEventListener("touchstart", pauseThenResume, { passive: true });
  container.addEventListener("wheel", pauseThenResume, { passive: true });
  container.addEventListener("mouseenter", stop);
  container.addEventListener("mouseleave", () => {
    if (isVisible) start();
  });

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) start();
          else stop();
        });
      },
      { threshold: 0.35 }
    );
    visibilityObserver.observe(container);
  } else {
    isVisible = true;
    start();
  }
}
// ====== MODERN NAVBAR ======
document.addEventListener("DOMContentLoaded", function () {
  const siteHeader = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navClose = document.getElementById("nav-close");
  const navOverlay = document.getElementById("nav-overlay");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  function setNavOpen(isOpen) {
    if (!siteHeader) return;
    siteHeader.classList.toggle("nav-open", isOpen);
    document.body.classList.toggle("nav-locked", isOpen);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(isOpen));
    if (mobileDrawer) mobileDrawer.setAttribute("aria-hidden", String(!isOpen));
    if (navOverlay) navOverlay.hidden = !isOpen;
  }

  function openNav() {
    setNavOpen(true);
  }

  function closeNav() {
    setNavOpen(false);
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      const trigger = dropdown.querySelector(".nav-dropdown-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  if (navToggle) navToggle.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navOverlay) navOverlay.addEventListener("click", closeNav);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && siteHeader?.classList.contains("nav-open")) {
      closeNav();
    }
  });

  mobileDrawer?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".nav-dropdown-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains("is-open");
      dropdowns.forEach((item) => {
        item.classList.remove("is-open");
        const btn = item.querySelector(".nav-dropdown-trigger");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
      dropdown.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      const trigger = dropdown.querySelector(".nav-dropdown-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  });

  const pageKey = (() => {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const map = {
      "index.html": "home",
      "English-novels.html": "english-novels",
      "Urdu-novels.html": "urdu-novels",
      "Academic-books.html": "academic-books",
      "Poetry.html": "poetry",
      "cart.html": "cart",
      "checkout.html": "checkout",
    };
    return map[path] || "";
  })();

  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.dataset.nav === pageKey) {
      el.classList.add("is-active");
    }
  });

  window.addEventListener("scroll", () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  });
});

function updateCartCountDisplay(count) {
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
    el.dataset.count = String(count);
    el.classList.remove("cart-count--pop");
    void el.offsetWidth;
    if (count > 0) el.classList.add("cart-count--pop");
  });
}

// ============== Rendering Products ===============
document.addEventListener("DOMContentLoaded", () => {
  let pbdcart = JSON.parse(localStorage.getItem("pbdcart")) || {};
  // Get Cart Product Count
  function getCartProductCount() {
    return Object.keys(pbdcart).length;
  }
  // Get Cart Total
  function getCartTotal() {
    let popupSubtotal = 0;
    Object.keys(pbdcart).forEach((id) => {
      const item = pbdcart[id];
      const price = item.price || 0;
      const qty = item.quantity || 0;
      const amount = price * qty;
      popupSubtotal += amount;
    });
    return popupSubtotal;
  }
  // Change Quantity Text
  function changeQuantityText(query, QuantityHeader) {
      if (query) {
        QuantityHeader.textContent = "Qty.";
      }
    }
    // PopUp Update
    function updateCartPopup() {
      const popupCount = document.querySelector(".popupCartCount");
      const popupTotal = document.querySelector(".popupCartTotal");

      popupCount.textContent = getCartProductCount();
      popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
    }

      // ORDER ID
  function generateOrderId() {
    const now = new Date();
    const pad = (val) => String(val).padStart(2, "0");
    return `PBD-${pad(now.getDate())}${pad(
      now.getMonth() + 1
    )}${now.getFullYear()}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds()
    )}${String(now.getMilliseconds()).padStart(3, "0")}`;
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

    let quantity = pbdcart[productId]?.quantity || 0;

    // ✅ If product is already in cart, show quantity controls
    if (quantity > 0) {
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    }

    // ➕ Add to Cart
    addToCartBtn.addEventListener("click", () => {
      quantity = 1;
      pbdcart[productId] = { name: productName, price: productPrice, quantity };
      localStorage.setItem("pbdcart", JSON.stringify(pbdcart));

      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
      const cartPopup = document.getElementById("cart-popup");
      if (!cartPopup.classList.contains("show")) {
        cartPopup.classList.add("show-before");
        updateCartPopup();

        setTimeout(() => {
          cartPopup.classList.remove("show-before");
          cartPopup.classList.add("show");
        }, 200);
      } else {
        updateCartPopup();
      }
      updateCartCountDisplay(getCartProductCount());
    });

    // ➕ Increase Quantity
    increaseBtn.addEventListener("click", () => {
      quantity++;
      pbdcart[productId].quantity = quantity;
      localStorage.setItem("pbdcart", JSON.stringify(pbdcart));

      qtyDisplay.textContent = quantity;
      qtyDisplay.style.transform = "scale(1.2)";
      setTimeout(() => {
        qtyDisplay.style.transform = "scale(1)";
      }, 150);
      updateCartPopup();
      updateCartCountDisplay(getCartProductCount());
    });

    // ➖ Decrease Quantity
    decreaseBtn.addEventListener("click", () => {
      quantity--;

      if (quantity <= 0) {
        delete pbdcart[productId];
        localStorage.setItem("pbdcart", JSON.stringify(pbdcart));
        addToCartBtn.style.display = "inline-block";
        qtyControls.classList.remove("active");
        if (Object.keys(pbdcart).length === 0) {
          const cartPopup = document.getElementById("cart-popup");
          if (cartPopup.classList.contains("show")) {
            cartPopup.classList.remove("show");
          }
        } else {
          updateCartPopup();
        }
      } else {
        pbdcart[productId].quantity = quantity;
        localStorage.setItem("pbdcart", JSON.stringify(pbdcart));
        qtyDisplay.textContent = quantity;

        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => {
          qtyDisplay.style.transform = "scale(1)";
        }, 150);
        updateCartPopup();
      }
      updateCartCountDisplay(getCartProductCount());
    });
  }
  updateCartCountDisplay(getCartProductCount());

  // Builds one product card (with cart logic already hooked up).
  // idPrefix lets the same product be rendered into more than one
  // section on a page (e.g. "Most Popular" and "Best Sellers" on the
  // homepage) without ending up with duplicate element ids.
  function createProductCard(product, idPrefix = "") {
    const div = document.createElement("div");
    const basePrice = parseFloat(product.price);
    const discount = parseFloat(product.discount) || 0;
    const finalPrice = Math.round(basePrice - (basePrice * discount) / 100);
    div.className = "Product";
    div.id = `${idPrefix}${product.id}`;
    div.dataset.id = product.id;
    div.dataset.name = product.name;
    div.dataset.price = finalPrice;
    if (product.discount > 0) {
      div.innerHTML = `
      <div class="discount">${product.discount || 0}%</div>
      <img src="${getProductImageUrl(product)}" alt="${product.name}" />
      <div class="Product-name">${product.name}</div>
      <div><span class="price">Rs.${basePrice}</span> <span class="discounted-price">Rs.${finalPrice}</span></div>
      <button class="add-to-cart-button">Add to Cart</button>
      <div class="quantity-controls">
        <button class="decrease">−</button>
        <span class="quantity">1</span>
        <button class="increase">+</button>
      </div>
      `;
    } else {
      div.innerHTML = `
      <img src="${getProductImageUrl(product)}" alt="${product.name}" />
      <div class="Product-name">${product.name}</div>
      <div><span class="price">Rs.${basePrice}</span> <span class="discounted-price">Rs.${finalPrice}</span></div>
      <button class="add-to-cart-button">Add to Cart</button>
      <div class="quantity-controls">
        <button class="decrease">−</button>
        <span class="quantity">1</span>
        <button class="increase">+</button>
      </div>
      `;
    }
    setupCartForProduct(div); // Hook cart logic

    div.classList.add("reveal");
    if (revealObserver) revealObserver.observe(div);
    else div.classList.add("is-visible");

    return div;
  }

  // ✅ PRODUCT PAGES + HOME PAGE PRODUCT RAILS
  const popularContainer = document.getElementById("popular-products");
  const bestsellerContainer = document.getElementById("bestseller-products");
  const featuredContainer = document.getElementById("featured-products");
  const popularLoader = document.getElementById("popular-loader");
  const bestsellerLoader = document.getElementById("bestseller-loader");
  const featuredLoader = document.getElementById("featured-loader");

  if (
    document.body.dataset.category ||
    popularContainer ||
    bestsellerContainer ||
    featuredContainer
  ) {
    const category = document.body.dataset.category;
    const loader = document.getElementById("loader");
    const container = document.getElementById("Product-grid");
    if (container) container.style.display = "none";

    const productApiUrl = "https://princebookdepot-backend.onrender.com/api/products";

    function showProductLoadError() {
      if (loader) {
        loader.innerHTML = "<p>Products are temporarily unavailable. Please refresh and try again.</p>";
      }
      [popularLoader, bestsellerLoader, featuredLoader].forEach((productLoader) => {
        if (productLoader) {
          productLoader.innerHTML = "<p>Products are temporarily unavailable. Please refresh and try again.</p>";
        }
      });
    }

    async function fetchProducts(params, attempt = 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const query = new URLSearchParams({ available: "true", ...params });

      try {
        const response = await fetch(`${productApiUrl}?${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Product API returned ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Product API returned an invalid response.");
        }

        return data.products;
      } catch (error) {
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchProducts(params, attempt + 1);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    function renderProducts(categoryProducts, popularProducts, bestsellerProducts, featuredProducts) {
      if (container) container.innerHTML = "";
      if (popularContainer) popularContainer.innerHTML = "";
      if (bestsellerContainer) bestsellerContainer.innerHTML = "";
      if (featuredContainer) featuredContainer.innerHTML = "";

        allProducts = categoryProducts.length ? categoryProducts : [
          ...(popularProducts || []),
          ...(bestsellerProducts || []),
          ...(featuredProducts || []),
        ];

        // ----- Category listing pages (English/Urdu novels, Poetry, Academic) -----
        if (category && container) {
          loader.style.display = "none";
          container.style.display = "grid";
          categoryProducts.forEach((product) => {
            container.appendChild(createProductCard(product));
          });
        }

        // ----- Home page: Featured For You / Most Popular / Best Sellers -----
        if (popularContainer || bestsellerContainer || featuredContainer) {
          if (popularLoader) popularLoader.style.display = "none";
          if (bestsellerLoader) bestsellerLoader.style.display = "none";
          if (featuredLoader) featuredLoader.style.display = "none";

          if (featuredContainer) {
            featuredContainer.style.display = "grid";
            (featuredProducts || []).forEach((product) => {
              featuredContainer.appendChild(
                createProductCard(product, "featured-")
              );
            });
          }
          if (popularContainer) {
            popularContainer.style.display = "grid";
            popularProducts.forEach((product) => {
              popularContainer.appendChild(createProductCard(product, "popular-"));
            });
          }
          if (bestsellerContainer) {
            bestsellerContainer.style.display = "grid";
            bestsellerProducts.forEach((product) => {
              bestsellerContainer.appendChild(
                createProductCard(product, "bestseller-")
              );
            });
          }

          initAutoScrollRail(featuredContainer);
          initAutoScrollRail(popularContainer);
          initAutoScrollRail(bestsellerContainer);
        }

        // Show cart popup if cart contains items and this page has one
        const cartPopup = document.getElementById("cart-popup");
        if (Object.keys(pbdcart).length > 0 && cartPopup) {
          if (!cartPopup.classList.contains("show")) {
            cartPopup.classList.add("show-before");
            updateCartPopup();
            setTimeout(() => {
              cartPopup.classList.remove("show-before");
              cartPopup.classList.add("show");
            }, 200);
          }
        }
    }

    const requests = category
      ? [fetchProducts({ category })]
      : [
          fetchProducts({ category: "English-novels", mostPopular: "true" }),
          fetchProducts({ category: "English-novels", thisWeekBest: "true" }),
          fetchProducts({ featured: "true" }),
        ];

    Promise.all(requests)
      .then((results) => {
        if (category) {
          renderProducts(results[0], [], [], []);
          return;
        }

        renderProducts([], results[0], results[1], results[2]);
      })
      .catch((error) => {
        console.error("Unable to load products:", error);
        showProductLoadError();
      });
  }
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
// Loop through cart items and create rows
    Object.keys(pbdcart).forEach((id) => {
      const item = pbdcart[id];
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

    const smallScreenQuery = window.matchMedia("(max-width:768px)").matches;
    // Update quantity text based on screen size
    changeQuantityText(smallScreenQuery, Quantity);
    // Cart quantity buttons
    document.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const isIncrease = button.classList.contains("increase");
        const pbdcart = JSON.parse(localStorage.getItem("pbdcart")) || {};
        const item = pbdcart[id];

        if (!item) return;

        // Update quantity
        item.quantity += isIncrease ? 1 : -1;

        // If quantity is 0, remove item
        if (item.quantity <= 0) {
          delete pbdcart[id];
        } else {
          pbdcart[id] = item;
        }

        // Save and reload
        localStorage.setItem("pbdcart", JSON.stringify(pbdcart));
        updateCartCountDisplay(getCartProductCount());
        location.reload();
      });
    });
    let pbdorderId = localStorage.getItem("pbdorderId");
  if (Object.keys(pbdcart).length) {
    if (!pbdorderId) {
      pbdorderId = generateOrderId();
    }
    localStorage.setItem("pbdorderId", pbdorderId);
  }
  orderIdSpan.textContent = pbdorderId;
  }
  
  // ============== Search Functionality ===============
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  function filterProducts(query, products) {
    if (!products) return [];
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query.toLowerCase()) &&
        product.category.trim().toLowerCase() ===
          document.body.dataset.category.trim().toLocaleLowerCase()
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
        <a href="#${
          product.id
        }" class="block p-3 hover:bg-gradient-to-r hover:from-#E6F0FA hover:to-#B3D4FF flex items-center gap-3 border-b border-gray-200">
          <img src="${getProductImageUrl(product)}" alt="${
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
    const filteredProducts = filterProducts(query, allProducts);
    displayResults(filteredProducts, resultsContainer);
  }

  function setupSearch(input, results) {
    if (!input || !results) return;

    // Debounced search handler
    const debouncedSearch = debounce(
      (value) => handleSearch(value, results),
      100
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
});