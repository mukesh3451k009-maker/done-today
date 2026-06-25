const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const reviewSlides = Array.from(document.querySelectorAll(".review-slide"));
const prevReview = document.querySelector("[data-review-prev]");
const nextReview = document.querySelector("[data-review-next]");
let reviewIndex = 0;
let reviewTimer;

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 20);
};

const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("open");
  document.body.classList.remove("nav-open");
};

const openMenu = () => {
  if (!navToggle || !navMenu) return;
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navMenu.classList.toggle("open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
};

const showReview = (nextIndex) => {
  if (!reviewSlides.length) return;
  reviewSlides[reviewIndex].classList.remove("active");
  reviewIndex = (nextIndex + reviewSlides.length) % reviewSlides.length;
  reviewSlides[reviewIndex].classList.add("active");
};

const restartReviewTimer = () => {
  window.clearInterval(reviewTimer);
  reviewTimer = window.setInterval(() => showReview(reviewIndex + 1), 5200);
};

const animateCount = (element) => {
  const target = Number(element.dataset.count || 0);
  if (!target || element.dataset.done === "true") return;
  element.dataset.done = "true";
  const startTime = performance.now();
  const duration = 900;

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = (target * eased).toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
    else element.textContent = target.toFixed(1);
  };

  requestAnimationFrame(tick);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in-view");
    if (entry.target.querySelector("[data-count]")) {
      entry.target.querySelectorAll("[data-count]").forEach(animateCount);
    }
    if (entry.target.matches("[data-count]")) animateCount(entry.target);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: "0px 0px -40px" });

const setupMagneticButtons = () => {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      item.style.setProperty("--mx", `${x}px`);
      item.style.setProperty("--my", `${y}px`);
    });

    item.addEventListener("mouseleave", () => {
      item.style.setProperty("--mx", "0px");
      item.style.setProperty("--my", "0px");
    });
  });
};

const setupParallax = () => {
  const items = document.querySelectorAll("[data-parallax]");
  if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const update = () => {
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const distance = midpoint - window.innerHeight / 2;
      const shift = Math.max(-18, Math.min(18, distance * -0.035));
      item.style.transform = `translateY(${shift}px)`;
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle) navToggle.addEventListener("click", openMenu);
if (navMenu) navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

if (prevReview) {
  prevReview.addEventListener("click", () => {
    showReview(reviewIndex - 1);
    restartReviewTimer();
  });
}

if (nextReview) {
  nextReview.addEventListener("click", () => {
    showReview(reviewIndex + 1);
    restartReviewTimer();
  });
}

if (reviewSlides.length) restartReviewTimer();

document.querySelectorAll(".reveal, [data-count]").forEach((element) => revealObserver.observe(element));
setupMagneticButtons();
setupParallax();
