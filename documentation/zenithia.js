/* ============================================================
   AgenIA — ZénithIA : dossier partenaire et préparation de séance
   Même montage que l'onglet Upwork : le texte vit en base sous la clé
   « zenithia », lisible au seul compte administrateur par une policy
   RLS. Le dépôt étant public, rien du dossier n'est écrit ici — il
   parle de personnes réelles, c'est une raison de plus.

   Le document arrive découpé en <section class="rubrique"> ; le
   sous-menu se construit à partir d'elles, pour qu'une rubrique ajoutée
   en base (compte rendu de séance, suivi des missions) apparaisse sans
   toucher ce fichier. Un <script> injecté par innerHTML ne s'exécute
   jamais : les cases à cocher sont donc câblées ici.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");
  var PREFIXE = "agenia_zenithia_tache_";

  /* L'avancement vit en localStorage, comme pour Upwork : un pense-bête
     personnel, propre à cette machine, sans écriture en base. */
  function lire(cle) {
    try { return localStorage.getItem(PREFIXE + cle) === "1"; }
    catch (e) { return false; }
  }

  function ecrire(cle, coche) {
    try { localStorage.setItem(PREFIXE + cle, coche ? "1" : "0"); }
    catch (e) { /* navigation privée stricte : les cases marchent sans mémoire */ }
  }

  function cablerCases() {
    var cases = doc.querySelectorAll("input[type=checkbox][data-tache]");
    Array.prototype.forEach.call(cases, function (c) {
      var cle = c.getAttribute("data-tache");
      var etiquette = c.parentNode;
      c.checked = lire(cle);
      etiquette.classList.toggle("faite", c.checked);
      c.addEventListener("change", function () {
        ecrire(cle, c.checked);
        etiquette.classList.toggle("faite", c.checked);
      });
    });
  }

  /* Les rubriques restent toutes dans le DOM et se masquent par [hidden] :
     les cases cochées d'une rubrique ne doivent pas être recréées à chaque
     changement de sous-onglet. */
  function construireSousMenu() {
    var rubriques = doc.querySelectorAll("section.rubrique");
    if (rubriques.length < 2) return;

    var nav = document.createElement("nav");
    nav.className = "sousMenu";
    nav.setAttribute("aria-label", "Rubriques ZénithIA");
    var boutons = [];

    Array.prototype.forEach.call(rubriques, function (r, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = r.getAttribute("data-libelle") || r.id;
      b.addEventListener("click", function () { ouvrir(i, true); });
      nav.appendChild(b);
      boutons.push(b);
    });
    doc.insertBefore(nav, rubriques[0]);

    function ouvrir(n, majFragment) {
      for (var j = 0; j < rubriques.length; j++) {
        var actif = j === n;
        rubriques[j].hidden = !actif;
        boutons[j].className = actif ? "actif" : "";
        if (actif) boutons[j].setAttribute("aria-current", "page");
        else boutons[j].removeAttribute("aria-current");
      }
      if (majFragment && history.replaceState) {
        history.replaceState(null, "", n === 0 ? location.pathname : "#" + rubriques[n].id);
      }
    }

    // Le fragment (#societe, #fondateurs…) rouvre la même rubrique au rechargement.
    var depart = 0;
    for (var k = 0; k < rubriques.length; k++) {
      if (location.hash === "#" + rubriques[k].id) depart = k;
    }
    ouvrir(depart, false);
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.zenithia&select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return outils.decompresser(r.json[0].html).then(function (html) {
          outils.memoriser();
          doc.innerHTML = html;
          cablerCases();
          construireSousMenu();
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
