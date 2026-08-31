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
    demo_planeo: "Démo Planeo",
    demo_outils: "Outils Margeo",
    ressources: "Guides (ressources)",
  };
  var ORDRE_SOURCES = ["contact", "demo_margeo", "demo_prospeo", "demo_keo", "demo_planeo", "demo_outils", "ressources"];

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
      return '<tr data-id="' + echapper(p.id) + '">' +
        '<td class="coche"><input type="checkbox" class="ligne" aria-label="Sélectionner ce visiteur"></td>' +
        "<td>" + dateCourte(p.created_at) + "</td>" +
        '<td><span class="puce">' + (LIBELLES_SOURCE[p.source] || echapper(p.source)) + "</span></td>" +
        "<td>" + echapper(p.nom || "—") + "</td>" +
        "<td>" + echapper(p.email) + "</td>" +
        "<td>" + echapper(p.telephone || "—") + "</td>" +
        '<td class="detail">' + (detail.length ? detail.map(function (d) { return "<span>" + d + "</span>"; }).join("") : "—") + "</td>" +
        "</tr>";
    }).join("");
    return '<div class="scroll"><table class="donnees" id="tableProspects"><thead><tr>' +
      '<th class="coche"><input type="checkbox" id="tout" aria-label="Tout sélectionner"></th>' +
      "<th>Date</th><th>Origine</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Détail</th>" +
      "</tr></thead><tbody>" + corps + "</tbody></table></div>";
  }

  /* ---------------------------------------------------------------
     Export tableur.
     CSV plutôt que .xlsx : un vrai classeur Excel est un ZIP de XML,
     qu'on ne fabrique pas sans bibliothèque — et la CSP du site
     n'autorise aucun script externe. Le CSV produit ici s'ouvre par
     double-clic dans Excel français : BOM UTF-8 pour que les accents
     tiennent, point-virgule comme séparateur puisque c'est ce
     qu'attend Excel en locale française.
     --------------------------------------------------------------- */
  var COLONNES = [
    ["Date", function (p) { return p.created_at; }],
    ["Origine", function (p) { return LIBELLES_SOURCE[p.source] || p.source; }],
    ["Nom", function (p) { return p.nom; }],
    ["Email", function (p) { return p.email; }],
    ["Téléphone", function (p) { return p.telephone; }],
    ["Entreprise", function (p) { return p.entreprise; }],
    ["Objet", function (p) { return p.objet; }],
    ["Ressource", function (p) { return p.ressource; }],
    ["Message", function (p) { return p.message; }],
    ["Page", function (p) { return p.page; }],
  ];

  function champCsv(valeur) {
    var v = valeur == null ? "" : String(valeur);
    // Un retour à la ligne dans un message casserait la lecture par les
    // tableurs les plus simples ; on l'aplatit plutôt que de le citer.
    v = v.replace(/[\r\n]+/g, " ");
    return '"' + v.replace(/"/g, '""') + '"';
  }

  function exporter(prospects) {
    var lignes = [COLONNES.map(function (c) { return champCsv(c[0]); }).join(";")];
    prospects.forEach(function (p) {
      lignes.push(COLONNES.map(function (c) { return champCsv(c[1](p)); }).join(";"));
    });
    // \uFEFF : sans ce BOM, Excel lit le fichier en ANSI et massacre les accents.
    var blob = new Blob(["\uFEFF" + lignes.join("\r\n")],
                        { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "prospects-agenia-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Libérer plus tôt annulerait le téléchargement sur certains navigateurs.
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function afficher(d) {
    var parSource = {};
    (d.parSource || []).forEach(function (r) { parSource[r.source] = r.total; });

    stats.innerHTML =
      '<h1 class="titre">Statistiques du site</h1>' +
      '<p class="sousTitre">Fréquentation d’agenia.pro et visiteurs ayant laissé leur email ' +
      "pour ouvrir un document — guides, démos produit, outils gratuits ou formulaire de contact.</p>" +

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
      '<p class="note">Les 200 plus récents. Cochez des lignes pour n’exporter ' +
      "ou ne supprimer qu’elles ; sans sélection, l’export prend tout.</p>" +
      (d.prospects && d.prospects.length ? barreOutils() : "") +
      tableauProspects(d.prospects || []);

    if (d.prospects && d.prospects.length) cabler(d.prospects);
  }

  function barreOutils() {
    return '<div class="outils">' +
      '<button id="btnExport" type="button">Exporter vers Excel</button>' +
      '<button id="btnSuppr" type="button" class="danger" disabled>Supprimer</button>' +
      '<span id="compteSel" class="compte"></span>' +
      "</div>";
  }

  /** Câble sélection, export et suppression sur le tableau qui vient d'être rendu. */
  function cabler(prospects) {
    var table = document.getElementById("tableProspects");
    var tout = document.getElementById("tout");
    var btnSuppr = document.getElementById("btnSuppr");
    var btnExport = document.getElementById("btnExport");
    var compte = document.getElementById("compteSel");
    var parId = {};
    prospects.forEach(function (p) { parId[p.id] = p; });

    function cochees() {
      return Array.prototype.filter.call(table.querySelectorAll("tbody tr"), function (tr) {
        return tr.querySelector(".ligne").checked;
      }).map(function (tr) { return tr.getAttribute("data-id"); });
    }

    function rafraichir() {
      var n = cochees().length;
      btnSuppr.disabled = n === 0;
      compte.textContent = n ? n + (n > 1 ? " lignes sélectionnées" : " ligne sélectionnée") : "";
      tout.checked = n > 0 && n === table.querySelectorAll("tbody tr").length;
    }

    tout.addEventListener("change", function () {
      Array.prototype.forEach.call(table.querySelectorAll("tbody .ligne"), function (c) {
        c.checked = tout.checked;
      });
      rafraichir();
    });
    table.addEventListener("change", function (e) {
      if (e.target.classList.contains("ligne")) rafraichir();
    });

    btnExport.addEventListener("click", function () {
      var ids = cochees();
      // Sans sélection, on exporte tout : c'est le geste attendu quand on
      // clique « exporter » sans avoir rien coché.
      exporter(ids.length ? ids.map(function (i) { return parId[i]; }) : prospects);
    });

    btnSuppr.addEventListener("click", function () {
      var ids = cochees();
      if (!ids.length) return;
      // La suppression est définitive et porte sur des données personnelles :
      // elle se confirme, et le message dit le nombre exact.
      if (!window.confirm(
        "Supprimer définitivement " + ids.length +
        (ids.length > 1 ? " visiteurs" : " visiteur") +
        " ? Cette action est irréversible.")) return;

      btnSuppr.disabled = true;
      btnSuppr.textContent = "Suppression…";
      contexte.outils
        .requete("/rest/v1/rpc/site_agenia_supprimer_prospects",
                 { jeton: contexte.jeton, corps: { p_ids: ids } })
        .then(function (r) {
          if (!r.ok) throw new Error("refus");
          // On recharge plutôt que de retirer les lignes à la main : les tuiles
          // et les totaux par origine deviendraient faux, sans que rien ne le dise.
          charger();
        })
        .catch(function () {
          btnSuppr.disabled = false;
          btnSuppr.textContent = "Supprimer";
          window.alert("La suppression a échoué. Reconnectez-vous puis réessayez.");
        });
    });

    rafraichir();
  }

  // Le jeton et les outils servent aussi après le premier rendu — une
  // suppression recharge l'écran — d'où ce contexte plutôt qu'une fermeture.
  var contexte = { jeton: null, outils: null };

  function charger() {
    stats.innerHTML = '<div id="chargement">Chargement…</div>';

    contexte.outils
      .requete("/rest/v1/rpc/site_agenia_statistiques", { jeton: contexte.jeton, corps: {} })
      .then(function (r) {
        // La fonction refuse tout autre compte : un échec ici signifie que le
        // jeton n'ouvre pas cet écran, donc retour au portail.
        if (r.ok && r.json && typeof r.json.totalVues30j !== "undefined") {
          contexte.outils.memoriser();
          afficher(r.json);
        } else {
          contexte.outils.echec("Session expirée, reconnectez-vous.");
        }
      })
      .catch(function () {
        contexte.outils.echec("Problème de connexion. Réessayez.");
      });
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    contexte.jeton = jeton;
    contexte.outils = outils;
    charger();
  });
})();
