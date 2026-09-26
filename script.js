/* ============================================================
   Agenia — Interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Active le mode "JS" (le masquage des .reveal ne s'applique qu'alors) ---- */
  document.documentElement.classList.add("js");

  /* ============================================================
     Textes d'interface — français par défaut, anglais sous /en/
     Le script est partagé par les deux versions du site : dupliquer un
     script-en.js reviendrait à devoir corriger chaque bogue deux fois. La
     langue se lit sur <html lang>, seul endroit où elle est déjà déclarée.
     ============================================================ */
  var EN = (document.documentElement.lang || "fr").slice(0, 2) === "en";
  var T = EN
    ? {
        envoi: "Sending…",
        cleManquante: "Form not live yet: add your Web3Forms key (see README).",
        merci: "Thank you. Your enquiry has been sent — we come back to you within one working day.",
        echec: "Sorry, sending failed. Try again or write to contact@agenia.pro.",
        reseau: "Connection problem. Try again or write to contact@agenia.pro.",
        demo: "Product demo",
        newsletterMerci: "Noted ✓ — unsubscribe at any time by emailing contact@agenia.pro.",
      }
    : {
        envoi: "Envoi en cours…",
        cleManquante: "Formulaire pas encore activé : ajoutez votre clé Web3Forms (voir README).",
        merci: "Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24 h.",
        echec: "Oups, l'envoi a échoué. Réessayez ou écrivez-nous à contact@agenia.pro.",
        reseau: "Problème de connexion. Réessayez ou écrivez-nous à contact@agenia.pro.",
        demo: "Démo vidéo",
        newsletterMerci: "C'est noté ✓ — désabonnement à tout moment par email à contact@agenia.pro.",
      };
  window.AgeniaLangue = { en: EN, t: T };

  /* ============================================================
     Mesure d'audience et prospects — écriture directe dans Supabase
     Le site est statique (GitHub Pages) : la base lui sert de dos.
     Écriture SEULE : les policies n'autorisent que l'insertion, jamais la
     lecture — ces tables restent donc illisibles depuis le navigateur, y
     compris avec la clé publique ci-dessous.
     Jamais bloquant : une erreur réseau ne doit empêcher ni l'affichage de
     la page ni l'aboutissement d'un formulaire (Web3Forms reste l'envoi
     principal, celui qui prévient par email).
     ============================================================ */
  var SUPABASE_URL = "https://quygyeesmtxgykerjtjr.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yYSJTuUgs-IVI3TmPiuHYA_jAzEgFfx";

  function poster(table, donnees) {
    try {
      fetch(SUPABASE_URL + "/rest/v1/" + table, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          // Sans quoi la base renverrait la ligne créée — inutile ici, et
          // surtout inutilement bavard.
          Prefer: "return=minimal",
        },
        body: JSON.stringify(donnees),
      }).catch(function () {});
    } catch (e) {
      /* fetch indisponible ou bloqué : tant pis, ce n'est qu'une statistique */
    }
  }

  /* Le fuseau horaire du navigateur est la seule indication de lieu que cette
     page peut donner sans rien demander à personne : pas de cookie, pas de
     service tiers, aucune adresse IP manipulée ici. `Europe/Paris` situe mieux
     qu'un pays, mais c'est une déclaration — un VPN, un voyage ou une horloge
     mal réglée la faussent, et l'écran des statistiques le dit.
     Le pays, lui, n'est PAS envoyé d'ici : un déclencheur en base le déduit de
     l'adresse IP et écrase ce que le navigateur pourrait prétendre. Ce fichier
     est public ; ce qu'il envoie est donc, par nature, ce qu'un curieux peut
     falsifier. */
  function fuseau() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch (e) {
      return null;   // Intl absent ou muselé : une vue sans lieu vaut mieux qu'un échec
    }
  }

  // Une vue par chargement de page — aucun cookie, aucun identifiant de
  // visiteur (voir RGPD-REGISTRE.md).
  poster("site_agenia_vues", {
    chemin: location.pathname,
    referrer: document.referrer || null,
    fuseau: fuseau(),
  });

  // Exposé pour ressources/gate.js, qui capture les mêmes prospects que
  // Web3Forms (démo Keo, démo outils Margeo, ressources) mais n'a pas sa
  // propre logique réseau.
  window.AgeniaTrack = {
    prospect: function (source, form) {
      var data = new FormData(form);
      poster("site_agenia_prospects", {
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
    // Table distincte de site_agenia_prospects : un abonnement newsletter
    // n'est ni une demande de rappel ni un téléchargement, et la fusionner
    // aurait mélangé deux intentions dans les mêmes statistiques. Même table
    // que le pied de page de margeo.agenia.pro (dépôt margeresto-ia) — la
    // policy d'insertion n'y accepte que source = 'site-agenia' depuis ici.
    newsletter: function (email) {
      poster("newsletter_abonnements", {
        email: email,
        langue: EN ? "en" : "fr",
        source: "site-agenia",
      });
    },
  };

  /* =============================================================
     BANDEAU DE LANGUE — proposer l'autre version, jamais y renvoyer
     d'autorité.

     POURQUOI PAS UNE REDIRECTION. Google explore ce site en majorité
     depuis les États-Unis. Une redirection « visiteur non francophone →
     /en/ » enverrait donc son robot de l'accueil français vers l'anglais,
     et c'est l'indexation française — celle qui porte tout le
     référencement local — qui en paierait le prix. Un bandeau n'a aucun
     effet sur l'exploration, et laisse le visiteur maître de sa langue :
     une redirection qu'on subit n'a pas de bouton « non ».

     LA PAGE JUMELLE N'EST PAS DEVINÉE. Elle est lue dans le
     `<link rel="alternate" hreflang>` que chaque page porte déjà, et dont
     l'audit vérifie la réciprocité. Une table de correspondance écrite ici
     aurait divergé au premier renommage : `demo-margeo.html` devient
     `margeo.html`, `essai-outils.html` devient `free-tools.html` — rien
     n'est mécanique. Une page sans jumelle ne propose donc rien, ce qui
     est le bon comportement plutôt qu'un lien mort.
     ============================================================= */
  var CLE_LANGUE = "agenia_langue";

  /* Fuseaux des zones francophones. La base IANA regroupe des pays qui ne
     partagent pas la langue — `Africa/Abidjan` couvre aussi le Ghana
     anglophone, et le Québec est devenu un alias de `America/Toronto`,
     donc indiscernable de l'Ontario. Le principe tranche ces cas :
     français par défaut dès qu'il y a doute, sauf Toronto, écarté parce
     que l'anglophone y est très majoritaire — et qu'un Québécois annonce
     de toute façon `fr-CA`, testé avant le fuseau. */
  var FUSEAUX_FR = ("Europe/Paris Europe/Brussels Europe/Zurich Europe/Luxembourg " +
    "Europe/Monaco Africa/Casablanca Africa/Algiers Africa/Tunis Africa/Abidjan " +
    "Africa/Dakar Africa/Bamako Africa/Ouagadougou Africa/Niamey Africa/Ndjamena " +
    "Africa/Bangui Africa/Brazzaville Africa/Kinshasa Africa/Lubumbashi " +
    "Africa/Libreville Africa/Douala Africa/Porto-Novo Africa/Lome Africa/Conakry " +
    "Africa/Nouakchott Africa/Djibouti Africa/Bujumbura Africa/Kigali " +
    "Indian/Antananarivo Indian/Comoro Indian/Reunion Indian/Mayotte " +
    "America/Montreal America/Martinique America/Guadeloupe America/Cayenne " +
    "America/Miquelon Pacific/Noumea Pacific/Tahiti Pacific/Wallis").split(" ");

  /* Le bandeau s'adresse à qui ne lit PAS la langue de la page : il est donc
     écrit dans la langue de destination, jamais dans celle qu'on quitte.
     La phrase entière est le lien, et non un libellé d'action à côté d'elle :
     sur un écran de 390 px, message et bouton ne tiennent pas sur la même
     ligne, et le bandeau montait à trois lignes pour dire une chose simple. */
  var TEXTES_LANGUE = {
    en: { lien: "This page is also available in English", fermer: "Dismiss" },
    fr: { lien: "Cette page existe aussi en français", fermer: "Fermer" },
  };

  function choixLangue() {
    // localStorage lève en navigation privée sur certains navigateurs :
    // ne pas savoir vaut mieux que ne pas s'afficher.
    try { return localStorage.getItem(CLE_LANGUE); } catch (e) { return null; }
  }

  function retenirLangue(code) {
    try { localStorage.setItem(CLE_LANGUE, code); } catch (e) {}
  }

  /* La langue déclarée par le navigateur d'abord — c'est ce que le visiteur
     LIT. Le fuseau ensuite, qui est le lieu. Un Français à Londres reste
     donc en français ; un anglophone à Paris reste en français aussi, parce
     que la zone est francophone : c'est la règle demandée, et elle penche
     toujours du même côté en cas de doute. */
  function litLeFrancais() {
    var langues = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langues.length; i++) {
      if (/^fr(-|$)/i.test(langues[i])) return true;
    }
    var zone = fuseau();
    return !!zone && FUSEAUX_FR.indexOf(zone) !== -1;
  }

  function bandeauLangue() {
    // Un choix déjà exprimé vaut pour toujours : reproposer, c'est harceler
    // quelqu'un qui a répondu.
    if (choixLangue()) return;

    var ici = document.documentElement.lang === "en" ? "en" : "fr";
    var autre = ici === "fr" ? "en" : "fr";
    if (ici === "fr" ? litLeFrancais() : !litLeFrancais()) return;

    var jumelle = document.querySelector('link[rel="alternate"][hreflang="' + autre + '"]');
    if (!jumelle || !jumelle.href) return;

    var t = TEXTES_LANGUE[autre];
    var bandeau = document.createElement("aside");
    bandeau.className = "bandeau-langue";
    bandeau.lang = autre;
    bandeau.innerHTML =
      '<div class="container bandeau-langue__inner">' +
        '<a class="bandeau-langue__lien" hreflang="' + autre + '" lang="' + autre + '" href="' +
          jumelle.href + '">' + t.lien + " →</a>" +
        '<button class="bandeau-langue__fermer" type="button" aria-label="' + t.fermer + '">×</button>' +
      "</div>";
    // Avant l'en-tête, qui est collant : le bandeau défile donc avec la page
    // et cesse de manger de la hauteur dès qu'il a été lu.
    document.body.insertBefore(bandeau, document.body.firstChild);

    bandeau.querySelector(".bandeau-langue__lien").addEventListener("click", function () {
      retenirLangue(autre);
    });
    bandeau.querySelector(".bandeau-langue__fermer").addEventListener("click", function () {
      retenirLangue(ici);   // fermer, c'est choisir de rester
      bandeau.parentNode.removeChild(bandeau);
    });
  }

  bandeauLangue();

  // La bascule FR/EN de l'en-tête est un choix explicite au même titre que le
  // bandeau : elle doit donc l'éteindre pour de bon, sinon on proposerait à
  // l'arrivée exactement ce que le visiteur vient de quitter.
  Array.prototype.forEach.call(
    document.querySelectorAll(".lang-switch a[hreflang]"),
    function (a) {
      a.addEventListener("click", function () {
        retenirLangue(a.getAttribute("hreflang"));
      });
    }
  );

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
    // Referme le menu si on repasse en desktop. Le seuil suit celui de
    // styles.css : en dessous, le menu déroulant EST la navigation, et le
    // refermer laisserait la page sans aucun menu.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1150) closeMenu();
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
     Les quatre boutons « Être recontacté par email » des cartes produits
     portent data-objet : au clic, le menu « Votre demande » est prérempli,
     pour que le lead arrive déjà qualifié. Ce sont les seuls depuis que les
     boutons d'audit ouvrent Calendly — un agenda ne préremplit rien, et c'est
     la raison pour laquelle le chemin par formulaire a été gardé à côté du
     bouton WhatsApp plutôt que remplacé par lui. */
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
        setNote(T.cleManquante, false);
        return;
      }

      var original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = T.envoi;
      }
      setNote("");

      // Le sujet de l'email reprend l'objet choisi : les leads se trient
      // d'un coup d'œil dans la boîte de réception (Audit / Margeo / Keo…).
      // Les valeurs du menu sont les mêmes dans les deux langues, exprès : le
      // tri de la boîte de réception ne doit pas dépendre de la langue du
      // visiteur. Seul « [EN] » est ajouté, pour savoir en quelle langue
      // répondre avant même d'ouvrir le message.
      var sujet = form.querySelector('input[name="subject"]');
      if (sujet && objetSelect && objetSelect.value) {
        sujet.value = (EN ? "[EN] " : "") + "Demande " + objetSelect.value + " — agenia.pro";
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
            setNote(T.merci, true);
          } else {
            setNote(T.echec, false);
          }
        })
        .catch(function () {
          setNote(T.reseau, false);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = original;
          }
        });
    });
  }

  /* ---- Newsletter (pied de page, envoi AJAX vers Web3Forms) ----
     Présente sur l'accueil des deux langues seulement (index.html,
     en/index.html) : c'est le seul pied de page à porter la grille de
     navigation à trois colonnes — les vingt-deux autres pages n'ont qu'un
     pied minimal (copyright + réseaux sociaux), et y ajouter le formulaire
     l'aurait fait naître hors de tout contexte de marque. */
  var newsletterForm = document.getElementById("newsletterForm");
  var newsletterNote = document.getElementById("newsletterNote");
  if (newsletterForm) {
    var nlSubmitBtn = newsletterForm.querySelector('button[type="submit"]');
    var setNlNote = function (msg, ok) {
      if (!newsletterNote) return;
      newsletterNote.textContent = msg;
      newsletterNote.style.color = ok === false ? "#ff8a8a" : "var(--accent-3)";
    };

    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!newsletterForm.checkValidity()) {
        newsletterForm.reportValidity();
        return;
      }

      var key = newsletterForm.querySelector('input[name="access_key"]');
      if (key && /REMPLACER/.test(key.value)) {
        setNlNote(T.cleManquante, false);
        return;
      }

      var nlOriginal = nlSubmitBtn ? nlSubmitBtn.textContent : "";
      if (nlSubmitBtn) {
        nlSubmitBtn.disabled = true;
        nlSubmitBtn.textContent = T.envoi;
      }
      setNlNote("");

      var nlData = new FormData(newsletterForm);
      var nlEmail = nlData.get("email");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: nlData,
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (r) {
          if (r.ok && r.json.success) {
            window.AgeniaTrack.newsletter(nlEmail);
            newsletterForm.reset();
            setNlNote(T.newsletterMerci, true);
          } else {
            setNlNote(T.echec, false);
          }
        })
        .catch(function () {
          setNlNote(T.reseau, false);
        })
        .finally(function () {
          if (nlSubmitBtn) {
            nlSubmitBtn.disabled = false;
            nlSubmitBtn.textContent = nlOriginal;
          }
        });
    });
  }

  /* ============================================================
     Démos vidéo — chargement au clic seulement
     La façade est du HTML statique ; le lecteur n'apparaît qu'au clic.
     Deux raisons, dans cet ordre : le site ne pose aucun cookie et le dit
     dans ses mentions, or un lecteur YouTube chargé d'office en poserait
     avant tout consentement ; et quatre lecteurs sur la page d'accueil
     coûteraient plus cher en chargement que toute la page.
     Domaine `youtube-nocookie` : même lecteur, sans cookie publicitaire
     tant que la vidéo n'est pas lancée.
     `mute=1` : le son part coupé. Une vidéo qui se met à parler dans un
     bureau ou un transport se referme aussitôt, et le visiteur est perdu.
     C'est aussi ce qui rend `autoplay` fiable — les navigateurs refusent
     la lecture automatique avec son.
     ============================================================ */
  Array.prototype.forEach.call(document.querySelectorAll(".demo__ouvrir"), function (bouton) {
    bouton.addEventListener("click", function () {
      var id = bouton.getAttribute("data-video");
      if (!id) return;
      var cadre = document.createElement("iframe");
      cadre.src = "https://www.youtube-nocookie.com/embed/" + id +
                  "?autoplay=1&mute=1&rel=0&modestbranding=1";
      cadre.title = bouton.getAttribute("aria-label") || T.demo;
      cadre.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      cadre.setAttribute("allowfullscreen", "");
      cadre.setAttribute("loading", "lazy");
      var hote = bouton.parentNode;
      hote.replaceChild(cadre, bouton);
      cadre.focus();
    });
  });
})();
