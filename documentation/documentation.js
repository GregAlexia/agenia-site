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
   #securite, #cibl, #margeo, #planeo, #maileo, #couteo, #keo, #trimailo,
   #documeo, #keo-comptes, #prompt-analyse, #prd, #prd-documeo, #plan-documeo, #claude, #astuces, #cles-api, #n8n-hostinger)
   ouvre directement la sienne, au chargement comme depuis un lien écrit
   dans une page.

   Les rubriques d'un même groupe (les analyses des SaaS, les PRD) partagent un
   seul onglet, qui déplie une seconde rangée. Chacune garde son propre
   fragment : les liens déjà donnés vers #cibl ou #margeo marchent
   toujours, et #analyses ouvre la première du groupe.
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
    { cle: "analyse-cibl", fragment: "cibl", libelle: "Analyse Cibl", groupe: "analyses", court: "Cibl" },
    { cle: "analyse-margeo", fragment: "margeo", libelle: "Analyse Margéo", groupe: "analyses", court: "Margéo" },
    { cle: "analyse-planeo", fragment: "planeo", libelle: "Analyse Planeo", groupe: "analyses", court: "Planeo" },
    { cle: "analyse-maileo", fragment: "maileo", libelle: "Analyse Maileo", groupe: "analyses", court: "Maileo" },
    { cle: "analyse-couteo", fragment: "couteo", libelle: "Analyse Coûtéo", groupe: "analyses", court: "Coûtéo" },
    { cle: "analyse-keo", fragment: "keo", libelle: "Analyse Keo", groupe: "analyses", court: "Keo" },
    { cle: "analyse-trimailo", fragment: "trimailo", libelle: "Analyse Trimailo", groupe: "analyses", court: "Trimailo" },
    { cle: "analyse-documeo", fragment: "documeo", libelle: "Analyse Documéo", groupe: "analyses", court: "Documéo" },
    // Keo a deux analyses : la démonstration (#keo, 04/10) et la version avec
    // comptes, celle qu'un client signerait — la seconde ne remplace pas la première.
    { cle: "analyse-keo-comptes", fragment: "keo-comptes", libelle: "Analyse Keo (comptes)", groupe: "analyses", court: "Keo (comptes)" },
    // Le prompt qui produit les analyses ci-dessus : une nouvelle analyse
    // s'insère avant lui, pour qu'il reste au bout de la rangée.
    { cle: "prompt-analyse", fragment: "prompt-analyse", libelle: "Prompt d'analyse", groupe: "analyses", court: "Prompt d'analyse" },
    // Le gabarit d'abord, puis les PRD remplis sur ce gabarit, chacun suivi de
    // son plan de construction : #prd garde son lien, #prd-groupe ouvre le premier.
    { cle: "prd-modele", fragment: "prd", libelle: "PRD modèle", groupe: "prd", court: "Modèle" },
    { cle: "prd-documeo", fragment: "prd-documeo", libelle: "PRD Documéo", groupe: "prd", court: "PRD Documéo" },
    { cle: "plan-documeo", fragment: "plan-documeo", libelle: "Plan de construction Documéo", groupe: "prd", court: "Plan Documéo" },
    { cle: "claude-connecteurs", fragment: "claude", libelle: "Connecteurs & Claude" },
    { cle: "claude-astuces", fragment: "astuces", libelle: "Tips & tricks" },
    { cle: "bp-cles-api", fragment: "cles-api", libelle: "Best practices", groupe: "bonnes", court: "Clés API Anthropic" },
    { cle: "bp-n8n", fragment: "n8n-hostinger", libelle: "Best practices — n8n", groupe: "bonnes", court: "n8n sur Hostinger" },
  ];

  var GROUPES = {
    analyses: { fragment: "analyses", libelle: "Analyses SaaS" },
    // Une page restée seule (l'autre clé absente en base) s'affiche comme un
    // onglet ordinaire, sous son libellé long.
    bonnes: { fragment: "bonnes-pratiques", libelle: "Best practices" },
    prd: { fragment: "prd-groupe", libelle: "PRD" },
  };

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

  /* Un groupe réduit à une seule rubrique présente redevient un onglet
     ordinaire, sous son libellé long : un sous-menu d'un seul choix
     ferait cliquer deux fois pour rien. Le groupe prend la place de son
     premier membre dans la rangée. */
  function regrouper(presentes) {
    var effectifs = {};
    presentes.forEach(function (p) {
      if (p.groupe) effectifs[p.groupe] = (effectifs[p.groupe] || 0) + 1;
    });
    var onglets = [];
    var parGroupe = {};
    presentes.forEach(function (p, i) {
      if (p.groupe && effectifs[p.groupe] > 1) {
        if (!parGroupe[p.groupe]) {
          parGroupe[p.groupe] = { groupe: p.groupe, libelle: GROUPES[p.groupe].libelle, membres: [] };
          onglets.push(parGroupe[p.groupe]);
        }
        parGroupe[p.groupe].membres.push(i);
      } else {
        onglets.push({ libelle: p.libelle, membres: [i] });
      }
    });
    return onglets;
  }

  function afficher(presentes) {
    if (presentes.length === 1) {
      doc.innerHTML = presentes[0].html;
      cablerCases(doc);
      return;
    }
    var onglets = regrouper(presentes);
    var ongletDe = [];
    var boutons = "";
    onglets.forEach(function (o, k) {
      o.membres.forEach(function (i) { ongletDe[i] = k; });
      boutons += '<button type="button" data-onglet="' + k + '"' + (o.groupe ? ' class="groupe"' : "") + ">" + o.libelle + "</button>";
    });
    doc.innerHTML = '<nav class="sousMenu" aria-label="Rubriques de la documentation">' + boutons + "</nav>" +
      '<nav class="sousMenu2" hidden></nav><div id="vue"></div>';
    var vue = document.getElementById("vue");
    var rangee2 = doc.querySelector(".sousMenu2");
    var liste = doc.querySelectorAll(".sousMenu button");
    // Revenir sur le groupe rouvre la dernière rubrique lue, pas la première.
    var derniere = {};

    function marquer(bouton, actif) {
      var classes = bouton.className.replace(/\s*\bactif\b/g, "");
      bouton.className = actif ? (classes ? classes + " actif" : "actif") : classes;
      if (actif) bouton.setAttribute("aria-current", "page");
      else bouton.removeAttribute("aria-current");
    }

    // Le contenu est remplacé plutôt que masqué : deux blocs cachés par
    // [hidden] laisseraient leurs feuilles de style se marcher dessus.
    function ouvrir(n, majFragment) {
      var onglet = onglets[ongletDe[n]];
      vue.innerHTML = presentes[n].html;
      cablerCases(vue);
      for (var j = 0; j < liste.length; j++) marquer(liste[j], j === ongletDe[n]);

      if (onglet.groupe) {
        derniere[onglet.groupe] = n;
        var html = "";
        onglet.membres.forEach(function (i) {
          html += '<button type="button" data-rubrique="' + i + '">' + presentes[i].court + "</button>";
        });
        rangee2.innerHTML = html;
        rangee2.setAttribute("aria-label", onglet.libelle);
        Array.prototype.forEach.call(rangee2.querySelectorAll("button"), function (b) {
          marquer(b, parseInt(b.getAttribute("data-rubrique"), 10) === n);
        });
        rangee2.hidden = false;
        doc.querySelector(".sousMenu").classList.add("deplie");
      } else {
        rangee2.hidden = true;
        rangee2.innerHTML = "";
        doc.querySelector(".sousMenu").classList.remove("deplie");
      }

      if (majFragment && history.replaceState) {
        history.replaceState(null, "", presentes[n].fragment ? "#" + presentes[n].fragment : location.pathname);
      }
    }

    for (var k = 0; k < liste.length; k++) {
      liste[k].addEventListener("click", function () {
        var o = onglets[parseInt(this.getAttribute("data-onglet"), 10)];
        ouvrir(o.groupe && derniere[o.groupe] !== undefined ? derniere[o.groupe] : o.membres[0], true);
      });
    }
    // Un seul écouteur pour la seconde rangée : ses boutons sont recréés
    // à chaque ouverture.
    rangee2.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-rubrique]");
      if (b) ouvrir(parseInt(b.getAttribute("data-rubrique"), 10), true);
    });

    // -1 : le fragment ne désigne aucune rubrique présente.
    function rubriqueDuFragment() {
      var trouvee = -1;
      for (var m = 1; m < presentes.length; m++) {
        if (location.hash === "#" + presentes[m].fragment) trouvee = m;
      }
      // Le fragment d'un groupe ouvre son premier membre, même quand le groupe,
      // réduit à une rubrique, s'affiche comme un onglet ordinaire : un lien
      // #bonnes-pratiques donné aujourd'hui doit encore marcher demain.
      onglets.forEach(function (o) {
        var g = presentes[o.membres[0]].groupe;
        if (g && location.hash === "#" + GROUPES[g].fragment) trouvee = o.membres[0];
      });
      return trouvee;
    }

    var depart = rubriqueDuFragment();
    ouvrir(depart < 0 ? 0 : depart, false);

    // Un lien <a href="#cibl"> écrit dans une page en base ne fait que
    // changer le fragment : sans cet écouteur, il ne changerait pas de
    // rubrique. replaceState, lui, ne déclenche pas l'évènement.
    window.addEventListener("hashchange", function () {
      var n = rubriqueDuFragment();
      if (n < 0 && !location.hash) n = 0;
      if (n < 0) return;
      ouvrir(n, false);
      doc.scrollIntoView();
    });
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    function charger(cle) {
      return outils.requete("/rest/v1/documentation_pages?cle=eq." + cle + "&select=html", { jeton: jeton });
    }

    // Les sous-rubriques facultatives partent en même temps que le guide,
    // pour ne pas additionner les attentes ; une erreur réseau se résout en
    // chaîne vide plutôt que d'échouer le tout.
    // Une ligne présente mais indécompressable, elle, garde son onglet et le
    // dit : le 06/10/2026, un base64 altéré à la recopie a fait disparaître
    // l'onglet Trimailo sans le moindre message, et l'enquête a d'abord
    // accusé le cache.
    var facultatives = RUBRIQUES.slice(1).map(function (r) {
      return charger(r.cle)
        .then(function (rep) {
          if (!(rep.ok && Array.isArray(rep.json) && rep.json.length && rep.json[0].html)) return "";
          return outils.decompresser(rep.json[0].html).catch(function () {
            return '<p><strong>Contenu illisible.</strong> La ligne « ' + r.cle +
              " » existe en base, mais sa compression est corrompue : la réenregistrer, en vérifiant son empreinte md5.</p>";
          });
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
              presentes.push({
                fragment: RUBRIQUES[i].fragment, libelle: RUBRIQUES[i].libelle,
                groupe: RUBRIQUES[i].groupe, court: RUBRIQUES[i].court, html: contenus[i],
              });
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
