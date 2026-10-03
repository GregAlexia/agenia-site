/* ============================================================
   AgenIA — Veille concurrentielle et branding
   Même montage que la Documentation : le texte vit en base sous la
   clé « veille », compressé, et n'est lisible qu'au compte
   administrateur par une policy RLS. Le dépôt étant public, tout ce
   qui est écrit dans la page est téléchargeable — l'attribut [hidden]
   ne protège rien.

   Copie affichée de docs/VEILLE-CONTENU.md (dépôt reseauteo) — la
   source à modifier reste ce fichier markdown, pas cette page.

   La veille IA US vit sous sa propre clé, « veille-ia-us », et
   s'affiche à la suite : la greffer dans « veille » la ferait écraser
   à la prochaine recopie du markdown. Elle est facultative — son
   absence ne doit pas masquer la veille principale.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    // Lancée en même temps pour ne pas doubler l'attente ; une erreur
    // se résout en chaîne vide plutôt que d'échouer le tout.
    var veilleUs = outils
      .requete("/rest/v1/documentation_pages?cle=eq.veille-ia-us&select=html", { jeton: jeton })
      .then(function (r) {
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) return "";
        return outils.decompresser(r.json[0].html);
      })
      .catch(function () { return ""; });

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.veille&select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return Promise.all([outils.decompresser(r.json[0].html), veilleUs]).then(function (parts) {
          outils.memoriser();
          doc.innerHTML = parts[0] + parts[1];
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
