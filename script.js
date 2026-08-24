/* ============================================================
   Agenia — Interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Active le mode "JS" (le masquage des .reveal ne s'applique qu'alors) ---- */
  document.documentElement.classList.add("js");

  /* ============================================================
     Suivi côté Duopilot (margeo.vercel.app) — pages vues + prospects
     Le site est statique (GitHub Pages, sans base de données) : les deux
     routes ci-dessous sont celles de l'appli Duopilot, qui a le backend.
     Jamais bloquant : une erreur réseau ne doit jamais empêcher la page de
     s'afficher ni un formulaire d'aboutir (Web3Forms reste l'envoi principal).
     ============================================================ */
  var DUOPILOT = "https://margeo.vercel.app";

  function poster(chemin, donnees) {
    try {
      fetch(DUOPILOT + chemin, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      }).catch(function () {});
    } catch (e) {
      /* fetch indisponible ou bloqué : tant pis, ce n'est qu'une statistique */
    }
  }

  // Une vue par chargement de page — aucun cookie, aucun identifiant de
  // visiteur (voir RGPD-REGISTRE.md).
  poster("/api/site-agenia/vues", {
    chemin: location.pathname,
    referrer: document.referrer || null,
  });

  // Exposé pour ressources/gate.js, qui capture les mêmes prospects que
  // Web3Forms (démo Keo, démo outils Duopilot, ressources) mais n'a pas sa
  // propre logique réseau.
  window.AgeniaTrack = {
    prospect: function (source, form) {
      var data = new FormData(form);
      poster("/api/site-agenia/prospects", {
        source: source,
        nom: data.get("prenom") || data.get("name") || "",
        email: data.get("email") || "",
        telephone: data.get("telephone") || "",
        entreprise: data.get("company") || "",
        objet: data.get("objet") || "",
        ressource: data.get("ressource") || "",
        message: data.get("message") || "",
        page: location.pathname,
      });
    },
  };

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

  /* ---- Présélection de l'objet du formulaire ----
     Les boutons « Réserver mon audit », « Être recontacté » (produits)
     portent data-objet : au clic, le menu « Votre demande » est prérempli,
     pour que chaque lead arrive déjà qualifié. */
  var objetSelect = document.getElementById("objet");
  if (objetSelect) {
    document.querySelectorAll("a[data-objet]").forEach(function (lien) {
      lien.addEventListener("click", function () {
        objetSelect.value = lien.getAttribute("data-objet");
      });
    });
  }

  /* ---- Formulaire de contact (envoi AJAX vers Web3Forms) ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var setNote = function (msg, ok) {
      if (!note) return;
      note.textContent = msg;
      note.style.color = ok === false ? "#ff8a8a" : "var(--accent-3)";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validation navigateur native
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Garde-fou : clé Web3Forms non configurée
      var key = form.querySelector('input[name="access_key"]');
      if (key && /REMPLACER/.test(key.value)) {
        setNote(
          "Formulaire pas encore activé : ajoutez votre clé Web3Forms (voir README).",
          false
        );
        return;
      }

      var original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";
      }
      setNote("");

      // Le sujet de l'email reprend l'objet choisi : les leads se trient
      // d'un coup d'œil dans la boîte de réception (Audit / Duopilot / Keo…).
      var sujet = form.querySelector('input[name="subject"]');
      if (sujet && objetSelect && objetSelect.value) {
        sujet.value = "Demande " + objetSelect.value + " — agenia.pro";
      }

      var data = new FormData(form);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (r) {
          if (r.ok && r.json.success) {
            window.AgeniaTrack.prospect("contact", form);
            form.reset();
            setNote(
              "Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24 h.",
              true
            );
          } else {
            setNote(
              "Oups, l'envoi a échoué. Réessayez ou écrivez-nous à contact@agenia.pro.",
              false
            );
          }
        })
        .catch(function () {
          setNote(
            "Problème de connexion. Réessayez ou écrivez-nous à contact@agenia.pro.",
            false
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = original;
          }
        });
    });
  }
})();
