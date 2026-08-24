/* ============================================================
   AgenIA — Statistiques du site (réservé à contact@agenia.pro)
   Connexion directe à Supabase Auth (même compte que le login
   Duopilot), puis lecture de /api/site-agenia/stats avec le jeton
   reçu. Rien n'est stocké au-delà de la session du navigateur.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://quygyeesmtxgykerjtjr.supabase.co";
  // Clé publique (publishable) : sans risque à exposer côté client, elle ne
  // donne aucun droit par elle-même — c'est le jeton obtenu APRÈS
  // authentification qui est vérifié côté serveur (voir route.ts).
  var SUPABASE_ANON_KEY = "sb_publishable_yYSJTuUgs-IVI3TmPiuHYA_jAzEgFfx";
  var DUOPILOT = "https://margeo.vercel.app";
  var STOCKAGE = "agenia_stats_jeton";
  // Seul compte autorisé — jamais affiché ni modifiable depuis la page (voir
  // aussi le garde côté serveur, estAdminSite, qui revérifie indépendamment).
  var COMPTE_EMAIL = "contact@agenia.pro";

  var portail = document.getElementById("portail");
  var contenu = document.getElementById("contenu");
  var corps = document.getElementById("corps");
  var msg = document.getElementById("msg");
  var bouton = document.getElementById("valider");
  var champMdp = document.getElementById("mdp");
  var boutonOubli = document.getElementById("boutonOubli");
  var deconnexion = document.getElementById("deconnexion");

  var LIBELLES_SOURCE = {
    contact: "Contact",
    demo_keo: "Démo Keo",
    demo_outils: "Démo outils Duopilot",
    ressources: "Ressource",
  };

  function setMsg(texte, erreur) {
    msg.textContent = texte;
    msg.style.color = erreur ? "#a8342a" : "#6b635a";
  }

  function echapper(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function jourCourt(iso) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }

  function dateCourte(iso) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  function connecter(motdepasse) {
    return fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email: COMPTE_EMAIL, password: motdepasse }),
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    });
  }

  // Déclenche l'email de réinitialisation Supabase pour le seul compte
  // autorisé — sans quitter cette page ni en ouvrir une autre. Le lien reçu
  // par email pointe vers reinitialiser-mot-de-passe.html, SUR CE MÊME site
  // (voir ce fichier) : la réinitialisation d'agenia.pro reste entièrement
  // indépendante de l'application Duopilot (margeo.vercel.app), même si les
  // deux comptes vivent dans le même projet Supabase.
  function demanderReinitialisation() {
    var redirection = location.origin + "/reinitialiser-mot-de-passe.html";
    return fetch(
      SUPABASE_URL + "/auth/v1/recover?redirect_to=" + encodeURIComponent(redirection),
      {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: COMPTE_EMAIL }),
      }
    );
  }

  function chargerStats(jeton) {
    return fetch(DUOPILOT + "/api/site-agenia/stats", {
      headers: { Authorization: "Bearer " + jeton },
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    });
  }

  function tableauJours(jours) {
    if (!jours.length) return '<div class="vide">Aucune donnée.</div>';
    var max = Math.max.apply(null, jours.map(function (j) { return j.vues; }).concat([1]));
    var lignes = jours.map(function (j) {
      var largeur = Math.max(6, (j.vues / max) * 100);
      return "<tr><td>" + jourCourt(j.jour) + '</td><td class="chiffre">' + j.vues +
        '</td><td style="width:96px"><div class="barre" style="width:' + largeur + '%"></div></td></tr>';
    }).join("");
    return '<table><thead><tr><th>Jour</th><th>Vues</th><th></th></tr></thead><tbody>' + lignes + "</tbody></table>";
  }

  function tableauPages(pages) {
    if (!pages.length) return '<div class="vide">Aucune donnée.</div>';
    var max = Math.max.apply(null, pages.map(function (p) { return p.vues; }).concat([1]));
    var lignes = pages.map(function (p) {
      var largeur = Math.max(6, (p.vues / max) * 100);
      return "<tr><td>" + echapper(p.chemin) + '</td><td class="chiffre">' + p.vues +
        '</td><td style="width:96px"><div class="barre" style="width:' + largeur + '%"></div></td></tr>';
    }).join("");
    return '<table><thead><tr><th>Page</th><th>Vues</th><th></th></tr></thead><tbody>' + lignes + "</tbody></table>";
  }

  function tableauProspects(prospects) {
    if (!prospects.length) return '<div class="vide">Aucun prospect pour l’instant.</div>';
    var lignes = prospects.map(function (p) {
      var detail = [];
      if (p.entreprise) detail.push(echapper(p.entreprise));
      if (p.objet) detail.push(echapper(p.objet));
      if (p.ressource) detail.push(echapper(p.ressource));
      if (p.message) detail.push(echapper(p.message));
      return "<tr>" +
        "<td>" + dateCourte(p.created_at) + "</td>" +
        '<td><span class="puce">' + (LIBELLES_SOURCE[p.source] || echapper(p.source)) + "</span></td>" +
        "<td>" + echapper(p.nom || "—") + "</td>" +
        "<td>" + echapper(p.email) + "</td>" +
        "<td>" + echapper(p.telephone || "—") + "</td>" +
        '<td class="detail">' + (detail.length ? detail.map(function (d) { return "<span>" + d + "</span>"; }).join("") : "—") + "</td>" +
        "</tr>";
    }).join("");
    return '<div class="scroll"><table><thead><tr><th>Date</th><th>Origine</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Détail</th></tr></thead><tbody>' +
      lignes + "</tbody></table></div>";
  }

  function afficherStats(d) {
    var tuiles =
      '<div class="tuiles">' +
      '<div class="tuile"><b>' + d.totalProspects + "</b><span>Prospects (total)</span></div>" +
      '<div class="tuile"><b>' + d.totalVues30j + "</b><span>Pages vues (30 j)</span></div>" +
      '<div class="tuile"><b>' + d.topPages.length + "</b><span>Pages distinctes (30 j)</span></div>" +
      "</div>";

    var parSourceMap = {};
    d.parSource.forEach(function (r) { parSourceMap[r.source] = r.total; });
    var origines = ["contact", "demo_keo", "demo_outils", "ressources"].map(function (s) {
      return '<div class="tuile"><b>' + (parSourceMap[s] || 0) + "</b><span>" + LIBELLES_SOURCE[s] + "</span></div>";
    }).join("");

    corps.className = "";
    corps.innerHTML =
      tuiles +
      "<h2>Prospects par origine</h2>" +
      '<div class="tuiles">' + origines + "</div>" +
      "<h2>Pages vues — 30 derniers jours</h2>" +
      '<p class="note">Compteur sans cookie ni identifiant de visiteur — des vues, pas des visiteurs uniques.</p>' +
      '<div class="tables">' + tableauJours(d.joursVues) + tableauPages(d.topPages) + "</div>" +
      "<h2>Derniers prospects</h2>" +
      tableauProspects(d.prospects);
  }

  function retourPortail(texte) {
    try { sessionStorage.removeItem(STOCKAGE); } catch (e) { /* stockage indisponible */ }
    contenu.hidden = true;
    portail.hidden = false;
    if (texte) setMsg(texte, true);
  }

  function ouvrirSession(jeton) {
    portail.hidden = true;
    contenu.hidden = false;
    corps.className = "chargement";
    corps.textContent = "Chargement…";
    chargerStats(jeton)
      .then(function (r) {
        if (r.ok) {
          try { sessionStorage.setItem(STOCKAGE, jeton); } catch (e) { /* pas grave */ }
          afficherStats(r.json);
        } else {
          retourPortail("Session expirée, reconnectez-vous.");
        }
      })
      .catch(function () {
        retourPortail("Problème de connexion. Réessayez.");
      });
  }

  bouton.addEventListener("click", function () {
    var motdepasse = champMdp.value;
    if (!motdepasse) return;
    bouton.disabled = true;
    setMsg("Connexion en cours…", false);
    connecter(motdepasse)
      .then(function (r) {
        bouton.disabled = false;
        if (r.ok && r.json.access_token) {
          ouvrirSession(r.json.access_token);
        } else {
          setMsg("Mot de passe incorrect.", true);
          champMdp.value = "";
        }
      })
      .catch(function () {
        bouton.disabled = false;
        setMsg("Problème de connexion. Réessayez.", true);
      });
  });

  champMdp.addEventListener("keydown", function (e) {
    if (e.key === "Enter") bouton.click();
  });

  if (boutonOubli) {
    boutonOubli.addEventListener("click", function () {
      boutonOubli.disabled = true;
      setMsg("Envoi en cours…", false);
      demanderReinitialisation()
        .then(function () {
          setMsg("Un email de réinitialisation vient d'être envoyé à contact@agenia.pro.", false);
        })
        .catch(function () {
          setMsg("Problème de connexion. Réessayez.", true);
        })
        .then(function () {
          boutonOubli.disabled = false;
        });
    });
  }

  if (deconnexion) {
    deconnexion.addEventListener("click", function () {
      retourPortail("");
      champMdp.value = "";
      champMdp.focus();
    });
  }

  // Onglet déjà connecté (sessionStorage, propre à cet onglet) : on retente
  // sans redemander. Le jeton, s'il a expiré, est simplement refusé par la
  // route côté serveur — retourPortail() reprend la main normalement.
  try {
    var memo = sessionStorage.getItem(STOCKAGE);
    if (memo) ouvrirSession(memo);
  } catch (e) { /* stockage indisponible : formulaire affiché normalement */ }
})();
