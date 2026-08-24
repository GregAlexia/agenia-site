/* ============================================================
   AgenIA — Documentation interne
   Le contenu vit en base (table documentation_contenu) et non dans
   ce dépôt public : c'est une politique RLS qui en autorise la
   lecture, au seul compte administrateur. La connexion et la
   réinitialisation sont assurées par acces.js, partagé avec la page
   des statistiques.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_contenu?select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html) {
          outils.memoriser();
          doc.innerHTML = r.json[0].html;
        } else {
          outils.echec("Session expirée, reconnectez-vous.");
        }
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
