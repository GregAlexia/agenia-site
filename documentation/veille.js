/* ============================================================
   AgenIA — Veille concurrentielle et branding
   Même montage que la Documentation : le texte vit en base sous la
   clé « veille », compressé, et n'est lisible qu'au compte
   administrateur par une policy RLS. Le dépôt étant public, tout ce
   qui est écrit dans la page est téléchargeable — l'attribut [hidden]
   ne protège rien.

   Copie affichée de docs/VEILLE-CONTENU.md (dépôt reseauteo) — la
   source à modifier reste ce fichier markdown, pas cette page.

   La veille IA US vit sous sa propre clé, « veille-ia-us », et forme
   une sous-rubrique de l'onglet : la greffer dans « veille » la ferait
   écraser à la prochaine recopie du markdown. Elle est facultative —
   son absence retire la sous-rubrique sans masquer la veille principale.
   Le fragment #ia-us ouvre directement la sous-rubrique, pour qu'un
   lien ou un rechargement retombe au même endroit.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  var RUBRIQUES = [
    { fragment: "", libelle: "Concurrence et branding" },
    { fragment: "ia-us", libelle: "Tendances IA US" },
  ];

  function afficher(principale, iaUs) {
    if (!iaUs) {
      doc.innerHTML = principale;
      return;
    }
    var contenus = [principale, iaUs];
    var boutons = "";
    for (var i = 0; i < RUBRIQUES.length; i++) {
      boutons += '<button type="button" data-rubrique="' + i + '">' + RUBRIQUES[i].libelle + "</button>";
    }
    doc.innerHTML = '<nav class="sousMenu" aria-label="Rubriques de la veille">' + boutons + '</nav><div id="vue"></div>';
    var vue = document.getElementById("vue");
    var liste = doc.querySelectorAll(".sousMenu button");

    // Le contenu est remplacé plutôt que masqué : deux blocs cachés par
    // [hidden] laisseraient leurs feuilles de style se marcher dessus.
    function ouvrir(n, majFragment) {
      vue.innerHTML = contenus[n];
      for (var j = 0; j < liste.length; j++) {
        var actif = j === n;
        liste[j].className = actif ? "actif" : "";
        if (actif) liste[j].setAttribute("aria-current", "page");
        else liste[j].removeAttribute("aria-current");
      }
      if (majFragment && history.replaceState) {
        history.replaceState(null, "", RUBRIQUES[n].fragment ? "#" + RUBRIQUES[n].fragment : location.pathname);
      }
    }

    for (var k = 0; k < liste.length; k++) {
      liste[k].addEventListener("click", function () {
        ouvrir(parseInt(this.getAttribute("data-rubrique"), 10), true);
      });
    }
    ouvrir(location.hash === "#ia-us" ? 1 : 0, false);
  }

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
          afficher(parts[0], parts[1]);
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
