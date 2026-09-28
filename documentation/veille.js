/* ============================================================
   AgenIA — Veille concurrentielle et branding
   Même montage que la Documentation : le texte vit en base sous la
   clé « veille », compressé, et n'est lisible qu'au compte
   administrateur par une policy RLS. Le dépôt étant public, tout ce
   qui est écrit dans la page est téléchargeable — l'attribut [hidden]
   ne protège rien.

   Copie affichée de docs/VEILLE-CONTENU.md (dépôt reseauteo) — la
   source à modifier reste ce fichier markdown, pas cette page.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.veille&select=html", { jeton: jeton })
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
