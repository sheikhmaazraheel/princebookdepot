const githubURL = "https://sheikhmaazraheel.github.io/princebookdepot";
const API_BASE_URL = "https://princebookdepot-backend.onrender.com";
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
// Applies the generic .fade-up / .fade-up-stagger scroll-reveal treatment
// to section-level content (headings, About, footer, category rail) using
// the same shared revealObserver as the product cards. Wrapped so that if
// anything here goes wrong, the target elements are made visible rather
// than silently staying hidden forever.
document.addEventListener("DOMContentLoaded", () => {
  const revealTargets = document.querySelectorAll(
    ".home-section-header, .about-container > h2, .about-container > p"
  );
  const staggerTargets = document.querySelectorAll(
    ".about-boxes, .category-circles, .footer-top"
  );

  try {
    revealTargets.forEach((el) => {
      el.classList.add("fade-up");
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });

    staggerTargets.forEach((el) => {
      el.classList.add("fade-up-stagger");
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  } catch (err) {
    console.error("Scroll-reveal setup failed, showing content as-is:", err);
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    staggerTargets.forEach((el) => el.classList.add("is-visible"));
  }
});

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
  const bundlesContainer = document.getElementById("bundles-products");
  const popularLoader = document.getElementById("popular-loader");
  const bestsellerLoader = document.getElementById("bestseller-loader");
  const featuredLoader = document.getElementById("featured-loader");
  const bundlesLoader = document.getElementById("bundles-loader");

  if (
    document.body.dataset.category ||
    popularContainer ||
    bestsellerContainer ||
    featuredContainer ||
    bundlesContainer
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
      [popularLoader, bestsellerLoader, featuredLoader, bundlesLoader].forEach((productLoader) => {
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

    function renderProducts(categoryProducts, popularProducts, bestsellerProducts, featuredProducts, bundleProducts) {
      if (container) container.innerHTML = "";
      if (popularContainer) popularContainer.innerHTML = "";
      if (bestsellerContainer) bestsellerContainer.innerHTML = "";
      if (featuredContainer) featuredContainer.innerHTML = "";
      if (bundlesContainer) bundlesContainer.innerHTML = "";

        allProducts = categoryProducts.length ? categoryProducts : [
          ...(popularProducts || []),
          ...(bestsellerProducts || []),
          ...(featuredProducts || []),
          ...(bundleProducts || []),
        ];

        // ----- Category listing pages (English/Urdu novels, Poetry, Academic) -----
        if (category && container) {
          loader.style.display = "none";
          container.style.display = "grid";
          categoryProducts.forEach((product) => {
            container.appendChild(createProductCard(product));
          });
        }

        // ----- Home page: Featured For You / Most Popular / Best Sellers / Bundles -----
        if (popularContainer || bestsellerContainer || featuredContainer || bundlesContainer) {
          if (popularLoader) popularLoader.style.display = "none";
          if (bestsellerLoader) bestsellerLoader.style.display = "none";
          if (featuredLoader) featuredLoader.style.display = "none";
          if (bundlesLoader) bundlesLoader.style.display = "none";

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
          if (bundlesContainer) {
            bundlesContainer.style.display = "grid";
            (bundleProducts || []).forEach((product) => {
              bundlesContainer.appendChild(
                createProductCard(product, "bundle-")
              );
            });
          }

          initAutoScrollRail(featuredContainer);
          initAutoScrollRail(popularContainer);
          initAutoScrollRail(bestsellerContainer);
          initAutoScrollRail(bundlesContainer);
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
          fetchProducts({ category: "Bundle" }),
        ];

    Promise.all(requests)
      .then((results) => {
        if (category) {
          renderProducts(results[0], [], [], [], []);
          return;
        }

        renderProducts([], results[0], results[1], results[2], results[3]);
      })
      .catch((error) => {
        console.error("Unable to load products:", error);
        showProductLoadError();
      });
  }
  // ============== Cart and checkout =================
  const cartItems = document.getElementById("cart-items");
  const checkoutForm = document.getElementById("checkout-form");
  const money = (value) => `Rs.${Number(value).toLocaleString("en-PK")}`;
  const getCartSubtotal = () => Object.values(pbdcart).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0
  );

  function getOrderId() {
    let orderId = localStorage.getItem("pbdorderId");
    if (!orderId && Object.keys(pbdcart).length) {
      orderId = generateOrderId();
      localStorage.setItem("pbdorderId", orderId);
    }
    return orderId || "Pending";
  }

  function createCartItem(id, item, compact = false) {
    const row = document.createElement("article");
    row.className = compact ? "checkout-item" : "cart-item";
    const amount = Number(item.price || 0) * Number(item.quantity || 0);
    row.innerHTML = `
      <div class="cart-item-cover" aria-hidden="true">▦</div>
      <div class="cart-item-info"><strong>${item.name || "Unnamed book"}</strong><span>${money(item.price || 0)} each</span></div>
      ${compact ? `<span class="checkout-item-qty">×${item.quantity}</span>` : `<div class="cart-quantity"><button type="button" class="qty-btn" data-id="${id}" data-change="-1" aria-label="Decrease quantity">−</button><strong>${item.quantity}</strong><button type="button" class="qty-btn" data-id="${id}" data-change="1" aria-label="Increase quantity">+</button></div>`}
      <strong class="cart-item-amount">${money(amount)}</strong>`;
    return row;
  }

  if (cartItems) {
    const emptyCart = document.getElementById("empty-cart");
    const itemCount = document.getElementById("cart-item-count");
    const orderId = document.getElementById("order-id");
    const subtotal = getCartSubtotal();
    const items = Object.entries(pbdcart);
    items.forEach(([id, item]) => cartItems.appendChild(createCartItem(id, item)));
    if (emptyCart) emptyCart.hidden = items.length > 0;
    if (itemCount) itemCount.textContent = `${items.reduce((sum, [, item]) => sum + Number(item.quantity || 0), 0)} items`;
    if (orderId) orderId.textContent = getOrderId();
    const subtotalElement = document.getElementById("summary-subtotal");
    const totalElement = document.getElementById("summary-total");
    if (subtotalElement) subtotalElement.textContent = money(subtotal);
    if (totalElement) totalElement.textContent = money(subtotal);
    const continueButton = document.getElementById("place-order");
    if (continueButton && !items.length) continueButton.setAttribute("aria-disabled", "true");

    cartItems.addEventListener("click", (event) => {
      const button = event.target.closest(".qty-btn");
      if (!button || !pbdcart[button.dataset.id]) return;
      pbdcart[button.dataset.id].quantity += Number(button.dataset.change);
      if (pbdcart[button.dataset.id].quantity <= 0) delete pbdcart[button.dataset.id];
      localStorage.setItem("pbdcart", JSON.stringify(pbdcart));
      window.location.reload();
    });
  }

  if (checkoutForm) {
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutOrderId = document.getElementById("checkout-order-id");
    const checkoutSubtotal = document.getElementById("checkout-subtotal");
    const checkoutDelivery = document.getElementById("checkout-delivery");
    const checkoutTotal = document.getElementById("checkout-total");
    const zone = document.getElementById("zone");
    const message = document.getElementById("checkout-message");
    const subtotal = getCartSubtotal();
    const items = Object.entries(pbdcart);

    items.forEach(([id, item]) => checkoutItems.appendChild(createCartItem(id, item, true)));
    checkoutOrderId.textContent = getOrderId();
    checkoutSubtotal.textContent = money(subtotal);
    checkoutTotal.textContent = money(subtotal);
    document.getElementById("orderId").value = getOrderId();
    document.getElementById("cart-items").value = items.map(([, item]) => `${item.name} (x${item.quantity})`).join(", ");

    const locationStorageKey = "pbdCheckoutLocation";
    const locationFields = {
      latitude: document.getElementById("latitude"),
      longitude: document.getElementById("longitude"),
      accuracy: document.getElementById("locationAccuracy"),
      capturedAt: document.getElementById("locationCapturedAt"),
    };
    const locationButton = document.getElementById("use-location");
    const locationStatus = document.getElementById("location-status");

    function setLocationFields(location) {
      if (!location) return;
      locationFields.latitude.value = location.latitude;
      locationFields.longitude.value = location.longitude;
      locationFields.accuracy.value = location.accuracy;
      locationFields.capturedAt.value = location.capturedAt;
    }

    function requestCheckoutLocation() {
      if (!navigator.geolocation) {
        locationStatus.textContent = "Location access is not available in this browser. You can continue without it.";
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "Requesting permission...";
      locationStatus.textContent = "Please allow location access in your browser prompt.";

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const location = {
            latitude: Number(coords.latitude.toFixed(8)),
            longitude: Number(coords.longitude.toFixed(8)),
            accuracy: Math.round(coords.accuracy),
            capturedAt: new Date().toISOString(),
          };
          localStorage.setItem(locationStorageKey, JSON.stringify(location));
          setLocationFields(location);
          locationButton.disabled = false;
          locationButton.textContent = "Refresh my location";
          locationStatus.textContent = `Location captured. Accuracy approximately ${location.accuracy} metres.`;
        },
        (error) => {
          const statusMessage = error.code === error.PERMISSION_DENIED
            ? "Location permission was not granted. You can allow it in browser settings and try again."
            : "We could not determine your location. You can try again or continue without it.";
          locationButton.disabled = false;
          locationButton.textContent = "Allow location access";
          locationStatus.textContent = statusMessage;
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    let savedLocation = null;
    try {
      savedLocation = JSON.parse(localStorage.getItem(locationStorageKey) || "null");
    } catch (error) {
      localStorage.removeItem(locationStorageKey);
    }
    if (savedLocation?.latitude && savedLocation?.longitude) {
      setLocationFields(savedLocation);
      locationButton.textContent = "Refresh my location";
      locationStatus.textContent = `Saved location available. Accuracy approximately ${savedLocation.accuracy} metres.`;
    } else if (!sessionStorage.getItem("pbdLocationPermissionAsked")) {
      sessionStorage.setItem("pbdLocationPermissionAsked", "true");
      setTimeout(requestCheckoutLocation, 350);
    }

    locationButton.addEventListener("click", requestCheckoutLocation);

    function updateCheckoutTotal() {
      const charge = Number(zone.selectedOptions[0]?.dataset.charge || 0);
      checkoutDelivery.textContent = charge ? money(charge) : "Select a zone";
      checkoutTotal.textContent = money(subtotal + charge);
      document.getElementById("total").value = subtotal + charge;
    }
    zone.addEventListener("change", updateCheckoutTotal);

    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!checkoutForm.reportValidity() || !items.length) return;

      const submitButton = checkoutForm.querySelector("button[type=submit]");
      const paymentMethod = checkoutForm.querySelector('input[name="payment"]:checked')?.value;
      const payload = {
        customer: {
          name: document.getElementById("firstName").value.trim(),
          contact: document.getElementById("contact").value.trim(),
          email: document.getElementById("email").value.trim(),
        },
        delivery: {
          city: "Karachi",
          area: document.getElementById("area").value.trim(),
          zone: zone.value,
          address: document.getElementById("address").value.trim(),
          landmark: document.getElementById("landmark").value.trim(),
        },
        paymentMethod,
        items: items.map(([productId, item]) => ({
          productId,
          quantity: Number(item.quantity),
        })),
      };

      if (locationFields.latitude.value && locationFields.longitude.value) {
        payload.location = {
          latitude: Number(locationFields.latitude.value),
          longitude: Number(locationFields.longitude.value),
          accuracy: Number(locationFields.accuracy.value),
          capturedAt: locationFields.capturedAt.value,
        };
      }

      submitButton.disabled = true;
      submitButton.textContent = "Saving your order...";
      message.classList.remove("is-success");
      message.textContent = "";

      fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success) {
            throw new Error(data.message || "We could not save your order. Please try again.");
          }
          return data;
        })
        .then((data) => {
          const savedOrderId = data.order.orderId;
          checkoutOrderId.textContent = savedOrderId;
          document.getElementById("orderId").value = savedOrderId;
          message.textContent = data.order.whatsapp?.sent
            ? `Order ${savedOrderId} has been received. Please confirm it from the WhatsApp message we sent to your phone.`
            : `Order ${savedOrderId} has been received. We will contact you shortly to confirm delivery.`;
          message.classList.add("is-success");
          submitButton.textContent = "Order received ✓";
          localStorage.removeItem("pbdcart");
          localStorage.removeItem("pbdorderId");
          localStorage.removeItem(locationStorageKey);
          sessionStorage.removeItem("pbdLocationPermissionAsked");
        })
        .catch((error) => {
          message.textContent = error.message;
          submitButton.disabled = false;
          submitButton.textContent = "Review and confirm order →";
        });
    });
  }
  
  // ============== Search Functionality ===============
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchClear = document.getElementById("searchClear");

  function filterProducts(query, products) {
    const normalizedQuery = query.toLocaleLowerCase();
    const activeCategory = document.body.dataset.category?.trim().toLocaleLowerCase();
    const seenIds = new Set();

    return (products || []).filter((product) => {
      const productId = String(product.id || "");
      const category = String(product.category || "").trim().toLocaleLowerCase();
      const searchableText = [product.name, product.category, product.id]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesCategory = !activeCategory || category === activeCategory;
      const isDuplicate = seenIds.has(productId);
      if (productId) seenIds.add(productId);
      return matchesCategory && !isDuplicate && searchableText.includes(normalizedQuery);
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    }[character]));
  }

  function displayResults(products, resultsContainer) {
    if (!resultsContainer) return;

    if (products.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results">No books matched that search.</p>`;
      resultsContainer.classList.add("show");
      searchInput?.setAttribute("aria-expanded", "true");
      return;
    }

    resultsContainer.innerHTML = products
      .map(
        (product) => `
        <a href="#${escapeHtml(product.id)}" class="search-result" data-product-id="${escapeHtml(product.id)}" role="option">
          <img src="${escapeHtml(getProductImageUrl(product))}" alt="" onerror="this.style.display='none'">
          <div class="result-text">
            <p class="result-name">${escapeHtml(product.name || "Unnamed Product")}</p>
            <p class="result-details">${escapeHtml(product.category || "Collection")} <span>·</span> Rs. ${Number(product.price || 0).toLocaleString("en-PK")}</p>
          </div>
          <span class="result-arrow" aria-hidden="true">↗</span>
        </a>
      `
      )
      .join("");
    resultsContainer.classList.add("show");
    searchInput?.setAttribute("aria-expanded", "true");
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
      searchInput?.setAttribute("aria-expanded", "false");
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
    searchClear?.addEventListener("click", () => {
      input.value = "";
      searchClear.hidden = true;
      handleSearch("", results);
      input.focus();
    });
    input.addEventListener("input", () => {
      if (searchClear) searchClear.hidden = input.value.trim().length === 0;
    });
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
          input.setAttribute("aria-expanded", "false");
        }
      }, 200);
    });

    results.addEventListener("click", (event) => {
      const result = event.target.closest(".search-result");
      if (!result) return;
      const product = [...document.querySelectorAll(".Product")].find(
        (card) => card.dataset.id === result.dataset.productId
      );
      if (product) {
        event.preventDefault();
        product.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        product.classList.add("search-result-focus");
        setTimeout(() => product.classList.remove("search-result-focus"), 1200);
      }
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
      searchInput.setAttribute("aria-expanded", "false");
    }
  });
});