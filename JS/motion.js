import { animate, inView, stagger } from "motion";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const ease = [0.2, 0.8, 0.2, 1];

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

  document.querySelectorAll(".nav-link, .hero-cta, .see-all-link, .floating-cart").forEach((element) => {
    element.addEventListener("pointerenter", () => animate(element, { y: -2 }, { duration: 0.2, ease }));
    element.addEventListener("pointerleave", () => animate(element, { y: 0 }, { duration: 0.3, ease }));
  });

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
