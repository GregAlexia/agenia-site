/* ============================================================
   AgenIA — Upwork : plan d'action, étude de marché, offres
   Même montage que la Documentation : le texte vit en base sous la
   clé « upwork », et n'est lisible qu'au compte administrateur par une
   policy RLS. Le dépôt étant public, tout ce qui est écrit dans la page
   est téléchargeable — l'attribut [hidden] ne protège rien.

   Le document arrive découpé en <section class="rubrique">, chacune
   portant son libellé ; le sous-menu se construit à partir d'elles,
   pour qu'une rubrique ajoutée en base apparaisse sans toucher ce
   fichier. Un <script> injecté par innerHTML ne s'exécute jamais : les
   cases à cocher et les boutons « Copier » sont donc câblés ici.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");
  var PREFIXE = "agenia_upwork_tache_";

  /* L'avancement vit en localStorage, comme celui du plan de
     référencement : un pense-bête personnel, propre à cette machine. */
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

  function cablerCopie() {
    var cartes = doc.querySelectorAll(".offre");
    Array.prototype.forEach.call(cartes, function (carte) {
      var source = carte.querySelector("[data-copy]");
      var bouton = carte.querySelector(".copy");
      if (!source || !bouton) return;

      bouton.addEventListener("click", function () {
        var fait = function () {
          bouton.textContent = "Copié";
          setTimeout(function () { bouton.textContent = "Copier"; }, 1800);
        };
        // Sans presse-papiers, on sélectionne le texte plutôt que de
        // laisser un bouton qui ne fait rien.
        var repli = function () {
          try {
            var sel = window.getSelection();
            var plage = document.createRange();
            plage.selectNodeContents(source);
            sel.removeAllRanges();
            sel.addRange(plage);
            bouton.textContent = "Texte sélectionné, faites Ctrl+C";
          } catch (e) {
            bouton.textContent = "Sélectionnez le texte";
          }
          setTimeout(function () { bouton.textContent = "Copier"; }, 2600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(source.innerText).then(fait, repli);
        } else {
          repli();
        }
      });
    });
  }

  /* Les rubriques restent toutes dans le DOM et se masquent par [hidden] :
     elles partagent une seule feuille de style, et les cases cochées d'une
     rubrique ne doivent pas être recréées à chaque changement d'onglet. */
  function construireSousMenu() {
    var rubriques = doc.querySelectorAll("section.rubrique");
    if (rubriques.length < 2) return;

    var nav = document.createElement("nav");
    nav.className = "sousMenu";
    nav.setAttribute("aria-label", "Rubriques Upwork");
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

    // Le fragment (#marche, #offres) rouvre la même rubrique au rechargement.
    var depart = 0;
    for (var k = 0; k < rubriques.length; k++) {
      if (location.hash === "#" + rubriques[k].id) depart = k;
    }
    ouvrir(depart, false);
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.upwork&select=html", { jeton: jeton })
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
          cablerCopie();
          construireSousMenu();
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
