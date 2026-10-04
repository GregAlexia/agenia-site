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

   Les autres sous-rubriques vivent chacune sous leur propre clé : les
   greffer dans le guide les ferait écraser à la prochaine recopie de
   celui-ci. Elles sont facultatives — une clé absente retire sa
   sous-rubrique sans masquer le reste. Le fragment (#priorites,
   #securite, #analyse, #margeo, #planeo, #prd, #claude, #astuces) ouvre
   directement la sienne.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  // La première est obligatoire : sans le guide, la session est jugée
  // expirée. Ajouter une sous-rubrique = ajouter une ligne ici et sa clé en base.
  var RUBRIQUES = [
    { cle: "guide", fragment: "", libelle: "Guide" },
    { cle: "priorites", fragment: "priorites", libelle: "Priorités" },
    { cle: "securite", fragment: "securite", libelle: "Sécurité" },
    { cle: "analyse-site", fragment: "analyse", libelle: "Analyse du site" },
    { cle: "analyse-margeo", fragment: "margeo", libelle: "Analyse Margéo" },
    { cle: "analyse-planeo", fragment: "planeo", libelle: "Analyse Planeo" },
    { cle: "prd-modele", fragment: "prd", libelle: "PRD modèle" },
    { cle: "claude-connecteurs", fragment: "claude", libelle: "Connecteurs & Claude" },
    { cle: "claude-astuces", fragment: "astuces", libelle: "Tips & tricks" },
  ];

  /* L'avancement des cases vit en localStorage, comme dans l'onglet
     Upwork : un pense-bête propre à cette machine, pas une donnée partagée. */
  var PREFIXE = "agenia_doc_tache_";

  function cablerCases(racine) {
    var cases = racine.querySelectorAll("input[type=checkbox][data-tache]");
    Array.prototype.forEach.call(cases, function (c) {
      var cle = c.getAttribute("data-tache");
      var etiquette = c.parentNode;
      try { c.checked = localStorage.getItem(PREFIXE + cle) === "1"; } catch (e) { c.checked = false; }
      etiquette.classList.toggle("faite", c.checked);
      c.addEventListener("change", function () {
        try { localStorage.setItem(PREFIXE + cle, c.checked ? "1" : "0"); }
        catch (e) { /* navigation privée stricte : les cases marchent sans mémoire */ }
        etiquette.classList.toggle("faite", c.checked);
      });
    });
  }

  function afficher(presentes) {
    if (presentes.length === 1) {
      doc.innerHTML = presentes[0].html;
      cablerCases(doc);
      return;
    }
    var boutons = "";
    for (var i = 0; i < presentes.length; i++) {
      boutons += '<button type="button" data-rubrique="' + i + '">' + presentes[i].libelle + "</button>";
    }
    doc.innerHTML = '<nav class="sousMenu" aria-label="Rubriques de la documentation">' + boutons + '</nav><div id="vue"></div>';
    var vue = document.getElementById("vue");
    var liste = doc.querySelectorAll(".sousMenu button");

    // Le contenu est remplacé plutôt que masqué : deux blocs cachés par
    // [hidden] laisseraient leurs feuilles de style se marcher dessus.
    function ouvrir(n, majFragment) {
      vue.innerHTML = presentes[n].html;
      cablerCases(vue);
      for (var j = 0; j < liste.length; j++) {
        var actif = j === n;
        liste[j].className = actif ? "actif" : "";
        if (actif) liste[j].setAttribute("aria-current", "page");
        else liste[j].removeAttribute("aria-current");
      }
      if (majFragment && history.replaceState) {
        history.replaceState(null, "", presentes[n].fragment ? "#" + presentes[n].fragment : location.pathname);
      }
    }

    for (var k = 0; k < liste.length; k++) {
      liste[k].addEventListener("click", function () {
        ouvrir(parseInt(this.getAttribute("data-rubrique"), 10), true);
      });
    }

    var depart = 0;
    for (var m = 1; m < presentes.length; m++) {
      if (location.hash === "#" + presentes[m].fragment) depart = m;
    }
    ouvrir(depart, false);
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    function charger(cle) {
      return outils.requete("/rest/v1/documentation_pages?cle=eq." + cle + "&select=html", { jeton: jeton });
    }

    // Les sous-rubriques facultatives partent en même temps que le guide,
    // pour ne pas additionner les attentes ; une erreur se résout en
    // chaîne vide plutôt que d'échouer le tout.
    var facultatives = RUBRIQUES.slice(1).map(function (r) {
      return charger(r.cle)
        .then(function (rep) {
          if (!(rep.ok && Array.isArray(rep.json) && rep.json.length && rep.json[0].html)) return "";
          return outils.decompresser(rep.json[0].html);
        })
        .catch(function () { return ""; });
    });

    charger(RUBRIQUES[0].cle)
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return Promise.all([outils.decompresser(r.json[0].html)].concat(facultatives)).then(function (contenus) {
          outils.memoriser();
          var presentes = [];
          for (var i = 0; i < RUBRIQUES.length; i++) {
            if (contenus[i]) {
              presentes.push({ fragment: RUBRIQUES[i].fragment, libelle: RUBRIQUES[i].libelle, html: contenus[i] });
            }
          }
          afficher(presentes);
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
