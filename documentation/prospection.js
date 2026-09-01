/* ============================================================
   AgenIA — Prospection : le playbook de cold mailing
   Même mécanique que la page Documentation, autre clé en base
   (documentation_pages, clé « prospection »).

   Le document apporte sa propre feuille de style, cloisonnée sous
   #doc à l'import : sans cela ses règles `body` et `:root`
   repeindraient la page entière, barre de navigation comprise.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  /* Les modèles d'emails ont un bouton « Copier ». Le script d'origine
     accompagnait le document, mais un <script> injecté par innerHTML ne
     s'exécute jamais : le comportement vit donc ici, où la CSP l'autorise. */
  function brancherCopie() {
    var cartes = doc.querySelectorAll(".mail");
    Array.prototype.forEach.call(cartes, function (carte) {
      var source = carte.querySelector("[data-copy]");
      var bouton = carte.querySelector(".copy");
      if (!source || !bouton) return;

      bouton.addEventListener("click", function () {
        var fait = function () {
          bouton.textContent = "Copié";
          bouton.setAttribute("data-done", "1");
          setTimeout(function () {
            bouton.textContent = "Copier";
            bouton.removeAttribute("data-done");
          }, 1800);
        };
        // Sans presse-papiers (contexte non sécurisé, permission refusée),
        // on sélectionne le texte : l'utilisateur finit au clavier plutôt
        // que de rester devant un bouton qui ne fait rien.
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

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.prospection&select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return outils.decompresser(r.json[0].html).then(function (html) {
          outils.memoriser();
          doc.innerHTML = html;
          brancherCopie();
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
