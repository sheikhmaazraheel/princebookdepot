import { animate, inView, stagger } from "motion";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const ease = [0.2, 0.8, 0.2, 1];
  document.documentElement.classList.add("motion-ready");

  animate("body", { opacity: [0, 1] }, { duration: 0.55, ease });

  animate(
    ".hero-content",
    { opacity: [0, 1], y: [24, 0] },
    { duration: 0.8, ease }
  );

  animate(
    ".hero-badge",
    { opacity: [0, 1], scale: [0.8, 1], rotate: [12, 4] },
    { duration: 0.75, delay: 0.28, ease }
  );

  animate(
    ".hero-title",
    { opacity: [0, 1], y: [22, 0], letterSpacing: ["0.04em", "0em"] },
    { duration: 0.9, delay: 0.08, ease }
  );

  animate(
    ".hero-cta",
    { opacity: [0, 1], scale: [0.92, 1], y: [16, 0] },
    { duration: 0.65, delay: 0.42, ease }
  );

  const hero = document.querySelector(".hero");
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      hero.style.setProperty("--hero-x", `${x * 1.4}%`);
      hero.style.setProperty("--hero-y", `${y * 1.4}%`);
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-x", "0%");
      hero.style.setProperty("--hero-y", "0%");
    }, { passive: true });
  }

  inView(".home-section, .categories, .about-section, .site-footer", (element) => {
    animate(
      element.querySelectorAll(".heading, .home-section-header, .about-box, .footer-col"),
      { opacity: [0, 1], y: [18, 0] },
      { duration: 0.55, delay: stagger(0.06), ease }
    );
  }, { amount: 0.18 });

  const animateCards = (container) => {
    const cards = [...container.querySelectorAll(".Product:not([data-motion-ready])")];
    if (!cards.length) return;
    cards.forEach((card) => card.setAttribute("data-motion-ready", "true"));
    animate(
      cards,
      { opacity: [0, 1], scale: [0.96, 1], y: [18, 0] },
      { duration: 0.45, delay: stagger(0.055), ease }
    );

    cards.forEach((card) => {
      let hoverAnimation;
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        hoverAnimation?.stop();
        hoverAnimation = animate(card, {
          rotateX: y * -3,
          rotateY: x * 3,
          y: -7,
        }, { duration: 0.28, ease });
      });
      card.addEventListener("pointerleave", () => {
        hoverAnimation?.stop();
        hoverAnimation = animate(card, { rotateX: 0, rotateY: 0, y: 0 }, { duration: 0.5, ease });
      });
    });
  };

  document.querySelectorAll(".nav-link, .hero-cta, .see-all-link, .floating-cart, .whatsapp-button, .instagram-button, .facebook-button").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
      animate(element, { x, y }, { duration: 0.18, ease });
    });
    element.addEventListener("pointerleave", () => animate(element, { x: 0, y: 0 }, { duration: 0.35, ease }));
  });

  const depthTargets = [...document.querySelectorAll(".hero-content, .categories, .storefront-search, .home-section, .about-container, .footer-top")];
  let depthFrame = null;
  window.addEventListener("scroll", () => {
    if (depthFrame) return;
    depthFrame = requestAnimationFrame(() => {
      const viewportCenter = window.innerHeight * 0.5;
      depthTargets.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        const distance = (bounds.top + bounds.height * 0.5 - viewportCenter) / window.innerHeight;
        element.style.setProperty("--scroll-depth", `${Math.max(-1, Math.min(1, distance)) * -10}px`);
      });
      depthFrame = null;
    });
  }, { passive: true });

  const progressBar = document.createElement("div");
  progressBar.className = "motion-scroll-progress";
  document.body.appendChild(progressBar);
  let scrollFrame = null;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0})`;
      scrollFrame = null;
    });
  }, { passive: true });

  document.querySelectorAll(".Product-grid, .product-scroller").forEach((container) => {
    animateCards(container);
    new MutationObserver(() => animateCards(container)).observe(container, { childList: true });
  });
}
