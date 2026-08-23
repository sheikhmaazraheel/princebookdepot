import { animate, inView, stagger } from "motion";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  animate(
    ".hero-content",
    { opacity: [0, 1], y: [24, 0] },
    { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }
  );

  inView(".home-section, .categories, .about-section, .site-footer", (element) => {
    animate(
      element.querySelectorAll(".heading, .home-section-header, .about-box, .footer-col"),
      { opacity: [0, 1], y: [18, 0] },
      { duration: 0.55, delay: stagger(0.06), ease: [0.2, 0.8, 0.2, 1] }
    );
  }, { amount: 0.18 });

  const animateCards = (container) => {
    const cards = [...container.querySelectorAll(".Product:not([data-motion-ready])")];
    if (!cards.length) return;
    cards.forEach((card) => card.setAttribute("data-motion-ready", "true"));
    animate(
      cards,
      { opacity: [0, 1], scale: [0.96, 1], y: [18, 0] },
      { duration: 0.45, delay: stagger(0.055), ease: [0.2, 0.8, 0.2, 1] }
    );
  };

  document.querySelectorAll(".Product-grid, .product-scroller").forEach((container) => {
    animateCards(container);
    new MutationObserver(() => animateCards(container)).observe(container, { childList: true });
  });
}
