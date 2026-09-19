/* ============================================================
   AgenIA — Plan de référencement
   Même montage que la Documentation : le texte vit en base sous la
   clé « referencement », compressé, et n'est lisible qu'au compte
   administrateur par une policy RLS. Le dépôt étant public, tout ce
   qui est écrit dans la page est téléchargeable — l'attribut [hidden]
   ne protège rien.

   Les cases à cocher arrivent avec le document, donc après coup : le
   câblage se fait à l'injection, comme les boutons « Copier » de la
   page Prospection. Un <script> injecté par innerHTML ne s'exécute
   jamais, le comportement vit donc forcément ici.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");
  var PREFIXE = "agenia_seo_tache_";

  /* L'avancement vit en localStorage, pas en base : c'est un pense-bête
     personnel, pas une donnée de l'entreprise. Il survit à la fermeture de
     l'onglet mais reste sur cette machine — cocher ailleurs ne cochera pas ici,
     ce qui est acceptable pour un espace à un seul compte. */
  function lire(cle) {
    try { return localStorage.getItem(PREFIXE + cle) === "1"; }
    catch (e) { return false; }
  }

  function ecrire(cle, coche) {
    try { localStorage.setItem(PREFIXE + cle, coche ? "1" : "0"); }
    catch (e) { /* navigation privée stricte : les cases marchent sans mémoire */ }
  }

  function cabler() {
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

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.referencement&select=html", { jeton: jeton })
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
          cabler();
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
