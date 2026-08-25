/* ============================================================
   AgenIA — Audit technique et fonctionnel d'agenia.pro

   POURQUOI UN AUDIT QUI S'EXÉCUTE, ET NON UN RAPPORT ÉCRIT.
   Un rapport rédigé une fois est juste le jour où on l'écrit, puis il vieillit
   sans prévenir — et il rassure d'autant plus qu'il est faux. Cette page relit
   le site réellement servi, à chaque ouverture. Elle ne peut donc pas mentir sur
   autre chose que ce qu'elle ne sait pas contrôler, et cela est dit en bas.

   POURQUOI ELLE EXPLORE AU LIEU DE LISTER.
   Le site n'a pas de gabarit : l'en-tête est recopié dans chaque page. Une page
   ajoutée en oubliant un onglet de navigation ne produit aucune erreur. Une
   liste de pages écrite ici oublierait cette page-là exactement de la même
   façon. L'audit part donc de l'accueil et suit les liens : ce qu'il contrôle
   est ce que le site expose, pas ce que ce fichier croit savoir.
   ============================================================ */
(function () {
  "use strict";

  var cible = document.getElementById("audit");

  var DEPART = ["/index.html", "/ressources/"];
  var PLAFOND_PAGES = 30;   // garde-fou : une boucle de liens ne doit pas tourner sans fin
  var GRAVE = "grave", AVERT = "avert", OK = "ok";

  // ---------------------------------------------------------------- outils

  function echapper(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  /** `/ressources/` et `/ressources/index.html` désignent la même page. */
  function normaliser(chemin) {
    var p = chemin.split("#")[0].split("?")[0];
    if (p.charAt(p.length - 1) === "/") p += "index.html";
    return p;
  }

  function estInterne(href) {
    if (!href) return false;
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return false;
    return true;
  }

  function texteNav(doc, selecteur) {
    var liens = doc.querySelectorAll(selecteur);
    return Array.prototype.map.call(liens, function (a) {
      return (a.textContent || "").replace(/\s+/g, " ").trim();
    }).filter(function (t) { return t; });
  }

  function lire(chemin) {
    return fetch(chemin, { credentials: "omit" }).then(function (res) {
      return res.text().then(function (texte) {
        return { statut: res.status, ok: res.ok, texte: texte };
      });
    }, function () {
      return { statut: 0, ok: false, texte: "" };
    });
  }

  // ------------------------------------------------- collecte des constats

  var constats = [];
  /** @param niveau ok | avert | grave ; `quoi` dit la conséquence, pas le symptôme. */
  function noter(section, page, niveau, quoi) {
    constats.push({ section: section, page: page, niveau: niveau, quoi: quoi });
  }

  // ------------------------------------------------- contrôles d'une page

  function auditerPage(chemin, doc, brut, reference) {
    var S = "Pages publiques";
    var h = doc.documentElement;

    if (!h || h.getAttribute("lang") !== "fr") {
      noter(S, chemin, AVERT, "Attribut lang absent ou différent de « fr » : les lecteurs d'écran et les moteurs devinent la langue.");
    }

    var titre = doc.querySelector("title");
    var t = titre ? titre.textContent.trim() : "";
    if (!t) noter(S, chemin, GRAVE, "Aucun titre : c'est la ligne bleue des résultats Google et le nom de l'onglet.");
    else if (t.length > 65) noter(S, chemin, AVERT, "Titre de " + t.length + " caractères : Google le tronquera au-delà de ~60.");

    var desc = doc.querySelector('meta[name="description"]');
    var d = desc ? (desc.getAttribute("content") || "").trim() : "";
    if (!d) noter(S, chemin, AVERT, "Pas de méta-description : Google composera lui-même le résumé affiché.");
    else if (d.length < 50 || d.length > 165) {
      noter(S, chemin, AVERT, "Méta-description de " + d.length + " caractères (viser 50 à 160).");
    }

    var canon = doc.querySelector('link[rel="canonical"]');
    if (!canon) {
      noter(S, chemin, AVERT, "Pas d'URL canonique : deux adresses menant ici seraient vues comme deux pages.");
    } else {
      var attendu = normaliser(chemin);
      var pose = normaliser(canon.getAttribute("href") || "").replace(/^https?:\/\/[^/]+/, "");
      if (pose !== attendu) {
        noter(S, chemin, GRAVE, "L'URL canonique désigne " + echapper(pose) + " au lieu de cette page : Google indexera l'autre.");
      }
    }

    if (!doc.querySelector('meta[name="viewport"]')) {
      noter(S, chemin, GRAVE, "Pas de méta viewport : la page s'affichera dézoomée sur téléphone.");
    }

    // --- Content-Security-Policy
    var csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!csp) {
      noter("Sécurité", chemin, GRAVE, "Aucune CSP : plus rien n'encadre ce que la page a le droit de charger ou de contacter.");
    } else {
      var v = csp.getAttribute("content") || "";
      if (v.indexOf("object-src 'none'") === -1) noter("Sécurité", chemin, AVERT, "CSP sans object-src 'none'.");
      if (v.indexOf("base-uri 'self'") === -1) noter("Sécurité", chemin, AVERT, "CSP sans base-uri 'self' : une balise base injectée détournerait les liens relatifs.");
      if (brut.indexOf("supabase.co") !== -1 && v.indexOf("supabase.co") === -1) {
        noter("Sécurité", chemin, GRAVE, "La page contacte Supabase mais l'hôte manque à connect-src : l'appel est refusé en silence.");
      }
      if (brut.indexOf("api.web3forms.com") !== -1 && v.indexOf("api.web3forms.com") === -1) {
        noter("Sécurité", chemin, GRAVE, "La page envoie vers Web3Forms mais l'hôte manque à la CSP : l'envoi échouera.");
      }
    }

    // --- Navigation : le piège du site sans gabarit
    var S2 = "Cohérence de navigation";
    var nav = texteNav(doc, "nav.nav a");
    var mobile = texteNav(doc, ".mobile-menu a:not(.btn)");
    if (!nav.length) {
      noter(S2, chemin, GRAVE, "Aucune navigation principale : la page est un cul-de-sac.");
    } else if (reference) {
      if (nav.join("|") !== reference.join("|")) {
        noter(S2, chemin, GRAVE, "Menu principal différent de celui de l'accueil — ici : " + echapper(nav.join(" · ")) + ".");
      }
      if (mobile.join("|") !== reference.join("|")) {
        noter(S2, chemin, GRAVE, "Menu mobile différent du menu principal — un visiteur sur téléphone ne voit pas les mêmes pages.");
      }
    }

    if (!doc.querySelector(".site-footer")) {
      noter(S2, chemin, AVERT, "Pas de pied de page : les mentions légales n'y sont donc pas atteignables.");
    } else if (!doc.querySelector('.site-footer a[href*="mentions-legales"]')) {
      noter(S2, chemin, GRAVE, "Pied de page sans lien vers les mentions légales — obligation d'affichage.");
    }

    // --- Images
    var sansAlt = Array.prototype.filter.call(doc.querySelectorAll("img"), function (i) {
      return !i.getAttribute("alt") && i.getAttribute("aria-hidden") !== "true";
    });
    if (sansAlt.length) {
      noter("Accessibilité", chemin, AVERT, sansAlt.length + " image(s) sans texte alternatif.");
    }

    // --- Chaîne de mesure
    var S3 = "Collecte";
    if (brut.indexOf("script.js") === -1) {
      noter(S3, chemin, GRAVE, "script.js absent : cette page n'est comptée nulle part.");
    }

    // --- Pages à portail
    var portail = doc.getElementById("portail");
    if (portail) {
      if (!doc.getElementById("contenu")) {
        noter(S3, chemin, GRAVE, "Portail sans bloc #contenu à déverrouiller.");
      }
      if (!doc.getElementById("formRessource")) {
        noter(S3, chemin, GRAVE, "Portail sans formulaire : rien ne peut être déverrouillé.");
      }
      if (brut.indexOf("gate.js") === -1) {
        noter(S3, chemin, GRAVE, "Portail sans gate.js : le formulaire ne débloquera rien.");
      }
      var cle = doc.querySelector('input[name="access_key"]');
      if (!cle || !(cle.getAttribute("value") || "").trim()) {
        noter(S3, chemin, GRAVE, "Formulaire sans clé Web3Forms : le prospect ne vous parviendra pas par email.");
      }
      if (!doc.querySelector('.res-gate__consent input[type="checkbox"]')) {
        noter("RGPD", chemin, GRAVE, "Portail sans case de consentement : la collecte se fait sans base légale affichée.");
      }
      if (!doc.querySelector('a[href*="confidentialite"]')) {
        noter("RGPD", chemin, AVERT, "Portail sans lien vers la politique de confidentialité.");
      }
      var visible = doc.getElementById("contenu");
      if (visible && !visible.hasAttribute("hidden")) {
        noter(S3, chemin, GRAVE, "Le contenu réservé n'est pas masqué à l'arrivée : le portail ne protège rien.");
      }
    }

    // --- Liens sortis de la page
    var liens = [];
    Array.prototype.forEach.call(doc.querySelectorAll("a[href]"), function (a) {
      var href = a.getAttribute("href");
      if (!estInterne(href)) {
        if (/^https?:/i.test(href) && a.getAttribute("target") === "_blank" && !/noopener/.test(a.getAttribute("rel") || "")) {
          noter("Sécurité", chemin, AVERT, "Lien externe ouvert en nouvel onglet sans rel=noopener.");
        }
        return;
      }
      var base = chemin.replace(/[^/]*$/, "");
      var resolu = href.charAt(0) === "/" ? href : base + href;
      // Résolution des ../ à la main : pas de new URL(), on reste en ES5.
      var morceaux = [];
      resolu.split("/").forEach(function (m) {
        if (m === "..") morceaux.pop();
        else if (m !== "." ) morceaux.push(m);
      });
      liens.push(normaliser(morceaux.join("/")));
    });
    return liens;
  }

  // -------------------------------------------------------- l'exploration

  function explorer() {
    var vues = {}, aVoir = DEPART.map(normaliser), pages = [], liensAttendus = {}, echecs = [];
    var reference = null;

    function suivant() {
      if (!aVoir.length || pages.length >= PLAFOND_PAGES) return Promise.resolve();
      var chemin = aVoir.shift();
      if (vues[chemin]) return suivant();
      vues[chemin] = true;

      return lire(chemin).then(function (r) {
        if (!r.ok) {
          noter("Pages publiques", chemin, GRAVE, "Page injoignable (code " + r.statut + ").");
          echecs.push(chemin);
          return suivant();
        }
        var doc = new DOMParser().parseFromString(r.texte, "text/html");
        if (chemin === "/index.html") reference = texteNav(doc, "nav.nav a");

        var liens = auditerPage(chemin, doc, r.texte, reference);
        pages.push({ chemin: chemin, doc: doc, brut: r.texte });

        liens.forEach(function (l) {
          liensAttendus[l] = (liensAttendus[l] || 0) + 1;
          // L'espace interne a son propre gabarit : on ne l'audite pas comme une page publique.
          if (l.indexOf("/documentation/") === 0) return;
          if (!vues[l] && aVoir.indexOf(l) === -1) aVoir.push(l);
        });
        return suivant();
      });
    }

    return suivant().then(function () {
      return { pages: pages, liens: liensAttendus, reference: reference, echecs: echecs };
    });
  }

  // ------------------------------------------------ liens morts et sitemap

  function verifierLiens(liens, connues, dejaSignalees) {
    // Une page déjà signalée injoignable par l'exploration ne l'est pas une
    // seconde fois ici : deux lignes pour un seul défaut fausseraient le total,
    // et un total qui exagère finit par ne plus être lu.
    var aTester = Object.keys(liens).filter(function (l) {
      return connues.indexOf(l) === -1 && dejaSignalees.indexOf(l) === -1;
    });
    return Promise.all(aTester.map(function (l) {
      return lire(l).then(function (r) {
        if (!r.ok) {
          noter("Liens", l, GRAVE, "Cible d'un lien du site introuvable (code " + r.statut + "), citée " + liens[l] + " fois.");
        }
      });
    }));
  }

  function verifierReferencement(pages) {
    return Promise.all([lire("/sitemap.xml"), lire("/robots.txt")]).then(function (r) {
      var sitemap = r[0], robots = r[1];

      if (!sitemap.ok) {
        noter("Référencement", "/sitemap.xml", GRAVE, "Sitemap absent : Google découvrira les pages plus lentement.");
      }
      if (!robots.ok) {
        noter("Référencement", "/robots.txt", AVERT, "robots.txt absent.");
      } else if (robots.texte.indexOf("sitemap") === -1 && robots.texte.indexOf("Sitemap") === -1) {
        noter("Référencement", "/robots.txt", AVERT, "robots.txt ne désigne pas le sitemap.");
      }

      var declarees = [];
      if (sitemap.ok) {
        var m = sitemap.texte.match(/<loc>([^<]+)<\/loc>/g) || [];
        declarees = m.map(function (b) {
          return normaliser(b.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, "") || "/index.html");
        });
      }

      // Une page indexable absente du sitemap n'est pas une faute, mais une
      // page listée qui n'existe pas en est une : elle use le budget d'exploration.
      declarees.forEach(function (u) {
        var connue = pages.some(function (p) { return p.chemin === u; });
        if (!connue) {
          noter("Référencement", u, AVERT, "Déclarée au sitemap mais jamais atteinte depuis l'accueil.");
        }
      });

      pages.forEach(function (p) {
        var rb = p.doc.querySelector('meta[name="robots"]');
        var noindex = rb && /noindex/i.test(rb.getAttribute("content") || "");
        if (!noindex && declarees.indexOf(p.chemin) === -1) {
          noter("Référencement", p.chemin, AVERT, "Indexable mais absente du sitemap.");
        }
        if (noindex && declarees.indexOf(p.chemin) !== -1) {
          noter("Référencement", p.chemin, GRAVE, "Déclarée au sitemap alors qu'elle porte noindex : ordres contradictoires.");
        }
      });

      return declarees.length;
    });
  }

  // ---------------------------------------------- contrôles fonctionnels

  function verifierDonnees(outils, jeton) {
    return Promise.all([
      outils.requete("/rest/v1/rpc/site_agenia_statistiques", { jeton: jeton, corps: {} }),
      outils.requete("/rest/v1/documentation_contenu?select=html", { jeton: jeton }),
    ]).then(function (r) {
      var stats = r[0], contenu = r[1];
      var resume = { vues30j: null, prospects: null, guide: null };

      if (!stats.ok || !stats.json || typeof stats.json.totalVues30j === "undefined") {
        noter("Chaîne de collecte", "base", GRAVE, "La fonction de statistiques ne répond pas : l'écran des statistiques est aveugle.");
      } else {
        resume.vues30j = stats.json.totalVues30j;
        resume.prospects = stats.json.totalProspects;
        var jours = stats.json.joursVues || [];
        if (!jours.length) {
          noter("Chaîne de collecte", "base", GRAVE,
            "Aucune page vue enregistrée sur 30 jours. Une mesure morte est pire que pas de mesure : on la croit vraie.");
        } else {
          var dernier = new Date(jours[0].jour + "T12:00:00Z");
          var ecart = Math.floor((Date.now() - dernier.getTime()) / 86400000);
          if (ecart >= 2) {
            noter("Chaîne de collecte", "base", AVERT,
              "Dernière page vue enregistrée il y a " + ecart + " jours — vérifier que la collecte n'est pas retombée.");
          }
        }
      }

      if (!contenu.ok || !contenu.json || !contenu.json.length || !contenu.json[0].html) {
        noter("Espace interne", "documentation_contenu", GRAVE, "Le guide est vide ou illisible : la page Documentation n'affichera rien.");
      } else {
        resume.guide = contenu.json[0].html.length;
      }
      return resume;
    });
  }

  // ------------------------------------------------------------ affichage

  function pastille(n) {
    var mot = n === GRAVE ? "À corriger" : n === AVERT ? "À surveiller" : "OK";
    return '<span class="etat etat--' + n + '">' + mot + "</span>";
  }

  function tableauConstats() {
    if (!constats.length) {
      return '<div class="vide">Aucun écart relevé. Tous les contrôles ci-dessous sont passés.</div>';
    }
    var poids = { grave: 0, avert: 1, ok: 2 };
    var tries = constats.slice().sort(function (a, b) {
      return poids[a.niveau] - poids[b.niveau] || a.section.localeCompare(b.section);
    });
    var corps = tries.map(function (c) {
      return "<tr><td>" + pastille(c.niveau) + "</td><td>" + echapper(c.section) +
        '</td><td><code>' + echapper(c.page) + "</code></td><td>" + c.quoi + "</td></tr>";
    }).join("");
    return '<div class="scroll"><table class="donnees"><thead><tr>' +
      "<th>État</th><th>Domaine</th><th>Page</th><th>Conséquence si rien n'est fait</th>" +
      "</tr></thead><tbody>" + corps + "</tbody></table></div>";
  }

  function afficher(pages, declarees, resume) {
    var graves = constats.filter(function (c) { return c.niveau === GRAVE; }).length;
    var averts = constats.filter(function (c) { return c.niveau === AVERT; }).length;
    var etat = graves ? GRAVE : averts ? AVERT : OK;

    function tuile(valeur, libelle, classe) {
      return '<div class="tuile' + (classe ? " tuile--" + classe : "") + '"><b>' + valeur +
        "</b><span>" + libelle + "</span></div>";
    }

    cible.innerHTML =
      '<h1 class="titre">Audit du site</h1>' +
      '<p class="sousTitre">Exécuté à l’instant, sur les pages réellement servies par ' +
      'agenia.pro — pas sur ce que le dépôt est censé contenir. Relancer la page relance l’audit.</p>' +

      '<div class="tuiles">' +
        tuile(graves, "À corriger", graves ? GRAVE : OK) +
        tuile(averts, "À surveiller", averts ? AVERT : OK) +
        tuile(pages.length, "Pages explorées") +
        tuile(declarees, "Pages au sitemap") +
      "</div>" +

      '<h2 class="section">Verdict</h2>' +
      "<p class=\"note\">" + (
        etat === OK ? "Rien à corriger. Le site est cohérent sur tous les points contrôlés ci-dessous." :
        etat === AVERT ? "Rien de cassé, mais " + averts + " point(s) méritent une décision." :
        graves + " point(s) empêchent quelque chose de fonctionner ou d’être trouvé."
      ) + "</p>" +
      tableauConstats() +

      '<h2 class="section">Chaîne de collecte</h2>' +
      '<p class="note">Ce que la base contient vraiment — le seul contrôle qui distingue ' +
      "une collecte vivante d’une collecte silencieusement morte.</p>" +
      '<div class="tuiles">' +
        tuile(resume.vues30j === null ? "—" : resume.vues30j, "Pages vues (30 jours)",
              resume.vues30j ? OK : GRAVE) +
        tuile(resume.prospects === null ? "—" : resume.prospects, "Emails recueillis") +
        tuile(resume.guide ? Math.round(resume.guide / 1024) + " Ko" : "—", "Guide en base",
              resume.guide ? OK : GRAVE) +
      "</div>" +

      '<h2 class="section">Pages explorées</h2>' +
      '<p class="note">Atteintes en suivant les liens depuis l’accueil. Une page absente ' +
      "de cette liste n’est liée depuis nulle part.</p>" +
      '<div class="scroll"><table class="donnees"><thead><tr><th>Page</th><th>Titre</th>' +
      "<th>Indexable</th></tr></thead><tbody>" +
      pages.map(function (p) {
        var t = p.doc.querySelector("title");
        var rb = p.doc.querySelector('meta[name="robots"]');
        var noindex = rb && /noindex/i.test(rb.getAttribute("content") || "");
        return "<tr><td><code>" + echapper(p.chemin) + "</code></td><td>" +
          echapper(t ? t.textContent.trim() : "—") + '</td><td><span class="puce">' +
          (noindex ? "non" : "oui") + "</span></td></tr>";
      }).join("") + "</tbody></table></div>" +

      '<h2 class="section">Ce que cet audit ne voit pas</h2>' +
      '<p class="note">Le dire est ce qui l’empêche d’être trompeur.</p>' +
      "<ul class=\"note\">" +
        "<li>Les <b>en-têtes HTTP</b> servis par GitHub Pages — la CSP est lue depuis la balise " +
          "de la page, pas depuis la réponse du serveur.</li>" +
        "<li>Les <b>performances réelles</b> et le rendu visuel : cet audit lit le HTML, il ne " +
          "le peint pas.</li>" +
        "<li>L’<b>accessibilité au-delà des textes alternatifs</b> — contrastes, ordre de " +
          "tabulation, lecteurs d’écran.</li>" +
        "<li>Les <b>applications externes</b> (Margeo, Keo) : elles ont leur propre cycle de vie.</li>" +
        "<li>La <b>justesse des contenus</b> — un chiffre faux sur la page de vente reste un " +
          "chiffre bien balisé.</li>" +
      "</ul>";
  }

  // ------------------------------------------------------------ démarrage

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    cible.innerHTML = '<div id="chargement">Audit en cours…</div>';
    constats = [];

    // Les statistiques d'abord : elles seules disent si le jeton ouvre cet écran.
    verifierDonnees(outils, jeton)
      .then(function (resume) {
        outils.memoriser();
        return explorer().then(function (exploration) {
          var connues = exploration.pages.map(function (p) { return p.chemin; });
          return Promise.all([
            verifierLiens(exploration.liens, connues, exploration.echecs),
            verifierReferencement(exploration.pages),
          ]).then(function (res) {
            afficher(exploration.pages, res[1], resume);
          });
        });
      })
      .catch(function () {
        outils.echec("Session expirée, reconnectez-vous.");
      });
  });
})();
