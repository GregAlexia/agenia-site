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

   « Connecteurs & Claude » vit sous sa propre clé,
   « claude-connecteurs », et forme une sous-rubrique : la greffer
   dans le guide la ferait écraser à la prochaine recopie de celui-ci.
   Elle est facultative — son absence retire la sous-rubrique sans
   masquer le guide. Le fragment #claude l'ouvre directement.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  var RUBRIQUES = [
    { fragment: "", libelle: "Guide" },
    { fragment: "claude", libelle: "Connecteurs & Claude" },
  ];

  function afficher(guide, claude) {
    if (!claude) {
      doc.innerHTML = guide;
      return;
    }
    var contenus = [guide, claude];
    var boutons = "";
    for (var i = 0; i < RUBRIQUES.length; i++) {
      boutons += '<button type="button" data-rubrique="' + i + '">' + RUBRIQUES[i].libelle + "</button>";
    }
    doc.innerHTML = '<nav class="sousMenu" aria-label="Rubriques de la documentation">' + boutons + '</nav><div id="vue"></div>';
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
    ouvrir(location.hash === "#claude" ? 1 : 0, false);
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    // Lancée en même temps pour ne pas doubler l'attente ; une erreur
    // se résout en chaîne vide plutôt que d'échouer le tout.
    var claude = outils
      .requete("/rest/v1/documentation_pages?cle=eq.claude-connecteurs&select=html", { jeton: jeton })
      .then(function (r) {
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) return "";
        return outils.decompresser(r.json[0].html);
      })
      .catch(function () { return ""; });

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.guide&select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return Promise.all([outils.decompresser(r.json[0].html), claude]).then(function (parts) {
          outils.memoriser();
          afficher(parts[0], parts[1]);
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
