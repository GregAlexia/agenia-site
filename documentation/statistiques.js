/* ============================================================
   AgenIA — Statistiques du site agenia.pro
   Pages vues et visiteurs ayant laissé leur email pour accéder à un
   document. Tout vient d'un unique appel à la fonction
   site_agenia_statistiques(), qui refuse tout compte autre que
   l'administrateur et ne renvoie que des agrégats — les tables
   elles-mêmes restent illisibles depuis un navigateur.
   ============================================================ */
(function () {
  "use strict";

  var stats = document.getElementById("stats");

  var LIBELLES_SOURCE = {
    contact: "Formulaire de contact",
    demo_margeo: "Margeo",
    demo_prospeo: "Prospeo",
    demo_keo: "Démo Keo",
    demo_outils: "Outils Margeo",
    ressources: "Guides (ressources)",
  };
  var ORDRE_SOURCES = ["contact", "demo_margeo", "demo_prospeo", "demo_keo", "demo_outils", "ressources"];

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

  function tuile(valeur, libelle) {
    return '<div class="tuile"><b>' + valeur + "</b><span>" + libelle + "</span></div>";
  }

  /** Tableau à deux colonnes + jauge proportionnelle au maximum affiché. */
  function tableauJauge(lignes, enteteLibelle, cle, mise) {
    if (!lignes.length) return '<div class="vide">Aucune donnée pour l’instant.</div>';
    var max = Math.max.apply(null, lignes.map(function (l) { return l.vues; }).concat([1]));
    var corps = lignes.map(function (l) {
      var largeur = Math.max(6, (l.vues / max) * 100);
      return "<tr><td>" + mise(l[cle]) + '</td><td class="chiffre">' + l.vues +
        '</td><td style="width:90px"><div class="jauge" style="width:' + largeur + '%"></div></td></tr>';
    }).join("");
    return '<div class="scroll"><table class="donnees"><thead><tr><th>' + enteteLibelle +
      "</th><th>Vues</th><th></th></tr></thead><tbody>" + corps + "</tbody></table></div>";
  }

  function tableauProspects(prospects) {
    if (!prospects.length) {
      return '<div class="vide">Personne n’a encore laissé son email sur le site.</div>';
    }
    var corps = prospects.map(function (p) {
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
    return '<div class="scroll"><table class="donnees"><thead><tr>' +
      "<th>Date</th><th>Origine</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Détail</th>" +
      "</tr></thead><tbody>" + corps + "</tbody></table></div>";
  }

  function afficher(d) {
    var parSource = {};
    (d.parSource || []).forEach(function (r) { parSource[r.source] = r.total; });

    stats.innerHTML =
      '<h1 class="titre">Statistiques du site</h1>' +
      '<p class="sousTitre">Fréquentation d’agenia.pro et visiteurs ayant laissé leur email ' +
      "pour ouvrir un document — guides, démo Keo, outils Margeo ou formulaire de contact.</p>" +

      '<div class="tuiles">' +
        tuile(d.totalProspects, "Emails recueillis (total)") +
        tuile(d.totalVues30j, "Pages vues (30 jours)") +
        tuile((d.topPages || []).length, "Pages distinctes (30 jours)") +
      "</div>" +

      '<h2 class="section">Par origine</h2>' +
      '<p class="note">Chaque visiteur est rattaché à la porte par laquelle il a laissé son email.</p>' +
      '<div class="tuiles">' +
        ORDRE_SOURCES.map(function (s) {
          return tuile(parSource[s] || 0, LIBELLES_SOURCE[s]);
        }).join("") +
      "</div>" +

      '<h2 class="section">Fréquentation — 30 derniers jours</h2>' +
      '<p class="note">Comptage sans cookie ni identifiant de visiteur : ce sont des pages ' +
      "vues, pas des visiteurs uniques — deux passages de la même personne comptent deux fois.</p>" +
      '<div class="tables">' +
        tableauJauge(d.joursVues || [], "Jour", "jour", jourCourt) +
        tableauJauge(d.topPages || [], "Page", "chemin", echapper) +
      "</div>" +

      '<h2 class="section">Visiteurs identifiés</h2>' +
      '<p class="note">Les 200 plus récents.</p>' +
      tableauProspects(d.prospects || []);
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    stats.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/rpc/site_agenia_statistiques", { jeton: jeton, corps: {} })
      .then(function (r) {
        // La fonction refuse tout autre compte : un échec ici signifie que le
        // jeton n'ouvre pas cet écran, donc retour au portail.
        if (r.ok && r.json && typeof r.json.totalVues30j !== "undefined") {
          outils.memoriser();
          afficher(r.json);
        } else {
          outils.echec("Session expirée, reconnectez-vous.");
        }
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
