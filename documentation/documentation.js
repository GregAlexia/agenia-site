/* ============================================================
   AgenIA — Documentation interne
   Le contenu vit en base (table documentation_contenu) et non dans
   ce dépôt public : c'est une politique RLS qui en autorise la
   lecture, au seul compte administrateur. La connexion et la
   réinitialisation sont assurées par acces.js, partagé avec la page
   des statistiques.

   Le guide fait 190 Ko de HTML. Il est donc rangé compressé (gzip
   puis base64) plutôt qu'en clair : 76 Ko transitent au lieu de 190,
   et la colonne reste du texte, transportable par n'importe quel
   outil SQL. Le format est reconnu à la lecture, pas à un drapeau en
   base — un contenu qui commence par « < » est du HTML tel quel.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  // DecompressionStream est présent sur tous les navigateurs à jour
  // depuis 2023 ; on ne réimporte pas une bibliothèque pour cela.
  function decompresser(charge) {
    if (charge.charAt(0) === "<") return Promise.resolve(charge);

    var binaire = atob(charge);
    var octets = new Uint8Array(binaire.length);
    for (var i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);

    var flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(flux).text();
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_contenu?select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return decompresser(r.json[0].html).then(function (html) {
          outils.memoriser();
          doc.innerHTML = html;
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
