/* ============================================================
   AgenIA — Documentation interne
   Le contenu vit en base et non dans ce dépôt public : c'est une
   politique RLS qui en autorise la lecture, au seul compte
   administrateur. La connexion et la réinitialisation sont assurées
   par acces.js, partagé par les pages de cet espace.

   Le guide vit dans documentation_pages, sous la clé « guide » — la
   table qui porte tous les documents de cet espace. Il y est rangé
   compressé ; c'est acces.js qui sait le déplier, puisque la page
   Prospection en a besoin aussi.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.guide&select=html", { jeton: jeton })
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
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
