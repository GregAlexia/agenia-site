/* ============================================================
   Agenia — Interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Active le mode "JS" (le masquage des .reveal ne s'applique qu'alors) ---- */
  document.documentElement.classList.add("js");

  /* ---- Année dynamique dans le footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Header : ombre/bordure au scroll ---- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    var closeMenu = function () {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      menu.style.display = "none";
    };
    var openMenu = function () {
      toggle.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      menu.style.display = "flex";
    };
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    // Referme le menu si on repasse en desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---- Apparition au scroll (reveal) ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Formulaire de contact ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      // Validation simple ; on laisse le mailto s'ouvrir si valide
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }
      if (note) {
        note.textContent =
          "Merci ! Votre client mail va s'ouvrir. Nous revenons vers vous sous 24 h.";
      }
    });
  }
})();
