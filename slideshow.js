const slider = document.querySelector(".visitor-pathways__slider");

if (slider) {
    const track = slider.querySelector(".visitor-pathways__slides");
    const slides = slider.querySelectorAll(".visitor-pathways__slide");
    const prevBtn = slider.querySelector(".visitor-pathways__arrow--prev");
    const nextBtn = slider.querySelector(".visitor-pathways__arrow--next");
    const dotsBox = slider.querySelector(".visitor-pathways__dots");

    let current = 0;
    let timer = null;

    // Build one dot per slide
    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "visitor-pathways__dot";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => goTo(i, true));
        dotsBox.appendChild(dot);
    });
    const dots = dotsBox.querySelectorAll(".visitor-pathways__dot");

    function goTo(index, userAction) {
        current = (index + slides.length) % slides.length; // wraps around
        track.style.transform = "translateX(-" + current * 100 + "%)";
        dots.forEach((d, i) =>
            d.classList.toggle("visitor-pathways__dot--active", i === current)
        );
        if (userAction) restartAutoplay();
    }

    prevBtn.addEventListener("click", () => goTo(current - 1, true));
    nextBtn.addEventListener("click", () => goTo(current + 1, true));

    // Autoplay every 6 seconds, paused while the mouse is over the slideshow
    function startAutoplay() {
        timer = setInterval(() => goTo(current + 1), 6000);
    }
    function stopAutoplay() {
        clearInterval(timer);
    }
    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // Swipe support on phones
    let touchStartX = 0;
    slider.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) goTo(current + (diff < 0 ? 1 : -1), true);
    });

    goTo(0);
    startAutoplay();
}

/* SCROLL REVEAL */
(function () {
  const selectors = [
    ".hero-text h1",
    ".hero-text h3",
    ".what-we-do__eyebrow",
    ".what-we-do__heading",
    ".what-we-do__description",
    ".what-we-do__tagline",
    ".projects__heading",
    ".projects__description",
    ".project-card__title",
    ".project-card__description",
    "#founder_text h1",
    "#founder_text p",
    "#founder_text i",
    ".faq__heading",
    ".faq__description",
    "#cta_container h1",
    "#cta_container h3",
  ];

  const items = document.querySelectorAll(selectors.join(","));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) return;

  // Stagger items that share a parent, so they appear one after another
  const countPerParent = new Map();
  items.forEach((el) => {
    const n = countPerParent.get(el.parentElement) || 0;
    countPerParent.set(el.parentElement, n + 1);
    el.style.setProperty("--reveal-delay", n * 0.15 + "s");
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--visible");
          observer.unobserve(entry.target); // reveal once only
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );

  items.forEach((el) => observer.observe(el));
})();