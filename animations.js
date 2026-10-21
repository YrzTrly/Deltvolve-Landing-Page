/* ==========================================================
   DELTVOLVE: SITE-WIDE ANIMATIONS
   Load this AFTER slideshow.js, just before </body>.
   Each section is independent, so you can delete any one.
   ========================================================== */

(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  /* 1. SCROLL PROGRESS BAR */
  if (!reduce) {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    const updateBar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    };
    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();
  }

  /* 2. PARTICLE NETWORK BACKGROUND */
  if (!reduce) {
    const canvas = document.createElement("canvas");
    canvas.id = "particles";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;
    let particles = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 130;
    const MOUSE_DIST = 160;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(25, Math.min(90, Math.floor((w * h) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.4 + 0.8,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        // gently pushed away from the cursor
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 110 && md > 0) {
          p.x += (mdx / md) * 1.2;
          p.y += (mdy / md) * 1.2;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 166, 255, 0.55)";
        ctx.fill();
      }

      // lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle =
              "rgba(0, 166, 255, " + (1 - d / LINK_DIST) * 0.22 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // brighter lines to the cursor
        const a = particles[i];
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < MOUSE_DIST) {
          ctx.strokeStyle =
            "rgba(120, 210, 255, " + (1 - md / MOUSE_DIST) * 0.5 + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    document.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    resize();
    frame();
  }

  /* 3. CURSOR GLOW (desktop only) */
  if (!reduce && finePointer) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.prepend(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add("is-on");
    });
    document.addEventListener("mouseleave", () =>
      glow.classList.remove("is-on"),
    );

    (function follow() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      glow.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* 4. NAVBAR: highlight the link of the section you are viewing */
  (function () {
    const links = Array.from(
      document.querySelectorAll('#list-items a[href^="#"]'),
    );
    const linkFor = new Map();
    links.forEach((a) => linkFor.set(a.getAttribute("href").slice(1), a));

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          const link = linkFor.get(entry.target.id);
          if (link) link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    document.querySelectorAll("section, footer").forEach((s) => spy.observe(s));
  })();

  /* 5. HERO TRIANGLE: tilts toward the mouse (desktop only) */
  (function () {
    const hero = document.querySelector(".hero");
    const image = document.querySelector(".hero-image");
    if (!hero || !image || reduce || !finePointer) return;

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      image.style.transform =
        "perspective(900px) rotateY(" + x * 18 + "deg) rotateX(" + -y * 18 + "deg)";
    });
    hero.addEventListener("mouseleave", () => {
      image.style.transform = "";
    });
  })();

  /* 6. CARD SPOTLIGHT: light follows the cursor inside cards */
  if (finePointer) {
    document.querySelectorAll(".project-card, .faq__item").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* 7. POP-IN ON SCROLL (cards, FAQ, slideshow, CTA, footer) */
  (function () {
    if (reduce || !("IntersectionObserver" in window)) return;

    const items = document.querySelectorAll(
      ".project-card, .faq__item, .footer-brand, .footer-links, " +
        ".footer-contact, .visitor-pathways__slider, #cta_container",
    );

    const countPerParent = new Map();
    items.forEach((el) => {
      const n = countPerParent.get(el.parentElement) || 0;
      countPerParent.set(el.parentElement, n + 1);
      el.style.setProperty("--pop-delay", n * 0.15 + "s");
      el.classList.add("pop");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pop--in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    items.forEach((el) => observer.observe(el));
  })();

  /* 8. BAND TEXT: split each marquee phrase into separate glitching words */
  (function () {
    document.querySelectorAll(".marquee-content span").forEach((span) => {
      const words = span.textContent.trim().split(/\s+/);
      span.textContent = "";
      span.classList.add("band-text");

      words.forEach((word, i) => {
        const w = document.createElement("b");
        w.className = "glitch glitch--" + (i + 1);
        w.dataset.text = word;
        w.textContent = word;
        span.appendChild(w);
      });
    });
  })();

  /* 9. SLIDESHOW: mark the visible slide so its text can animate in */
  (function () {
    const slider = document.querySelector(".visitor-pathways__slider");
    const viewport = document.querySelector(".visitor-pathways__viewport");
    if (!slider || !viewport || !("IntersectionObserver" in window)) return;

    // Only start once the slideshow has scrolled into view
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          slider.classList.add("in-view");
          seen.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    seen.observe(slider);

    // Track which slide is currently showing
    const active = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "is-active",
            entry.isIntersecting && entry.intersectionRatio >= 0.6,
          );
        });
      },
      { root: viewport, threshold: [0, 0.6] },
    );
    viewport
      .querySelectorAll(".visitor-pathways__slide")
      .forEach((s) => active.observe(s));
  })();
})();