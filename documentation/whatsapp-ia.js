/* ============================================================
   AgenIA — Besoins WhatsApp × IA : veille des offres Upwork
   Même mécanique que les autres onglets (documentation_pages, clé
   « whatsapp-ia »). Le document stocké porte sa mise en page et ses
   données, dans un <script type="application/json"> : innerHTML ne
   l'exécute pas, mais son texte reste lisible. Toute l'analyse reste
   donc en base, derrière la policy RLS ; ce fichier public ne contient
   que la façon de l'afficher, filtres et tris compris.
   ============================================================ */
(function () {
  "use strict";

  var doc = document.getElementById("doc");

  var NIVEAUX = {
    C: ["Cœur", "var(--c)"],
    I: ["Intégration", "var(--i)"],
    P: ["Périphérique", "var(--p)"],
    X: ["Hors sujet", "var(--line)"]
  };
  var ORDRE_NIVEAU = { C: 0, I: 1, P: 2, X: 3 };
  var SOURCES = { G: "Veille mondiale", E: "Sélection Europe" };
  var EXPERIENCES = ["Entry Level", "Intermediate", "Expert"];

  // Les synthèses viennent de pages tierces : on n'injecte jamais leur
  // texte tel quel dans le HTML.
  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function el(id) { return doc.querySelector("#wa-" + id); }

  function points(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "●" : "○";
    return s;
  }

  // Un titre suffit à retrouver une offre dans la recherche Upwork : c'est
  // le repli quand le lien direct refuse de s'ouvrir.
  function lienRecherche(titre) {
    var mots = titre.replace(/\([^)]*\)/g, " ").replace(/[|–—:&+\/]/g, " ")
      .split(/\s+/).filter(Boolean).slice(0, 7).join(" ");
    return "https://www.upwork.com/nx/search/jobs/?sort=recency&q=" + encodeURIComponent(mots);
  }

  function actif(l) { return l.niv === "C" || l.niv === "I"; }

  function montant(b) {
    var m = b.match(/[\d ]+/);
    return m ? parseFloat(m[0].replace(/ /g, "")) || 0 : 0;
  }

  function afficher(d) {
    var lignes = d.lignes, cats = {}, ordreCats = [];
    d.cats.forEach(function (c) { cats[c.cle] = c; ordreCats.push(c.cle); });
    var europe = lignes.filter(function (l) { return l.src === "E"; });

    /* ---- Chiffres clés ---- */
    var fixes = lignes.filter(function (l) { return l.niv !== "X" && /^Fixe/.test(l.b); })
      .map(function (l) { return montant(l.b); }).sort(function (a, b) { return a - b; });
    var mediane = fixes[Math.floor(fixes.length / 2)];
    el("stats").innerHTML = [
      [lignes.length, "offres classées (" + (lignes.length - europe.length) + " mondiales + " + europe.length + " Europe)"],
      [lignes.filter(function (l) { return l.niv === "C"; }).length, "où WhatsApp + IA/automatisation est le cœur de la mission"],
      [lignes.filter(actif).length, "qui automatisent une étape du parcours client"],
      [mediane + " $", "budget médian des offres à prix fixe (" + fixes.length + ")"]
    ].map(function (s) {
      return '<div class="stat"><b>' + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>";
    }).join("");

    /* ---- Offres où un PoC est facile ---- */
    var top = lignes.filter(function (l) { return l.poc && l.poc.note >= 4; });
    top.sort(function (a, b) {
      return (b.poc.note - a.poc.note) || ((b.direct ? 1 : 0) - (a.direct ? 1 : 0)) || (montant(b.b) - montant(a.b));
    });
    el("poc").innerHTML = top.map(function (l, i) {
      return '<article class="pc' + (l.poc.note === 5 ? " five" : "") + '">' +
        '<div class="pch"><span class="rank">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" +
        '<span class="score s' + l.poc.note + '">' + points(l.poc.note) + "</span>" +
        '<span class="eff">' + esc(l.poc.effort) + "</span></div>" +
        '<h3><a class="jl" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.t) + "</a></h3>" +
        "<p>" + esc(l.poc.idee) + "</p>" +
        '<div class="meta"><span>' + esc(l.b) + "</span><span>" + esc(l.xp || "—") + "</span><span>" + esc(l.pays) + "</span>" +
        '<span><a class="jl" href="' + esc(lienRecherche(l.t)) + '" target="_blank" rel="noopener">recherche</a></span></div>' +
        '<div class="stk">' + esc(l.poc.stack) + "</div></article>";
    }).join("");

    /* ---- Process client ---- */
    el("flow").innerHTML = d.etapes.map(function (s, i) {
      var js = lignes.filter(function (l) { return l.cat === s.cat && actif(l); });
      var eu = js.filter(function (l) { return l.src === "E"; }).length;
      return '<div class="step"><span class="k">Étape ' + (i + 1) + "</span><h3>" + esc(s.titre) + "</h3>" +
        '<span class="num">' + js.length + "<small> offres · " + eu + " Europe</small></span>" +
        "<p>" + esc(s.texte) + '</p><div class="ex">' + esc(s.exemple) + "</div></div>";
    }).join("");
    function nb(k) { return lignes.filter(function (l) { return l.cat === k && l.niv !== "X"; }).length; }
    el("eco").innerHTML = "<div><b>Autour du process.</b> " + nb("PRODUIT") + " offres de vendeurs d'IA WhatsApp, " +
      nb("HUMAIN") + " postes humains qui écrivent sur WhatsApp, " + nb("MKT") + " missions marketing, " + nb("VOIX") + " voix.</div>" +
      "<div><b>Lecture.</b> L'étape 2 (qualifier et réserver) et l'étape 5 (brancher au CRM) concentrent la demande ; l'étape 7 conditionne toutes les autres.</div>";

    /* ---- Matrice Europe ---- */
    var catsEu = ordreCats.filter(function (k) { return europe.some(function (l) { return l.cat === k; }); });
    var maxi = 1;
    catsEu.forEach(function (k) {
      EXPERIENCES.forEach(function (x) {
        maxi = Math.max(maxi, europe.filter(function (l) { return l.cat === k && l.xp === x; }).length);
      });
    });
    var mx = "<thead><tr><th>Catégorie</th>" + EXPERIENCES.map(function (x) { return "<th>" + x.replace(" Level", "") + "</th>"; }).join("") + "<th>Total</th></tr></thead><tbody>";
    catsEu.forEach(function (k) {
      mx += "<tr><td>" + esc(cats[k].l) + "</td>";
      EXPERIENCES.forEach(function (x) {
        var n = europe.filter(function (l) { return l.cat === k && l.xp === x; }).length;
        mx += "<td>" + (n ? '<span class="heat" style="background:color-mix(in srgb,var(--accent) ' + (Math.round(n / maxi * 70) + 8) + '%,transparent)">' + n + "</span>" : '<span style="color:var(--muted)">·</span>') + "</td>";
      });
      mx += "<td><b>" + europe.filter(function (l) { return l.cat === k; }).length + "</b></td></tr>";
    });
    mx += "<tr><td><b>Total</b></td>" + EXPERIENCES.map(function (x) {
      return "<td><b>" + europe.filter(function (l) { return l.xp === x; }).length + "</b></td>";
    }).join("") + "<td><b>" + europe.length + "</b></td></tr></tbody>";
    el("mx").innerHTML = mx;

    /* ---- Catégories et thématiques ---- */
    el("cats").innerHTML = ordreCats.map(function (k) {
      return '<div class="cat"><span class="n">' + lignes.filter(function (l) { return l.cat === k; }).length +
        "</span><div><h3>" + esc(cats[k].l) + "</h3><p>" + esc(cats[k].d) + "</p></div></div>";
    }).join("");
    el("themes").innerHTML = d.themes.map(function (t) {
      return '<div class="theme"><h3>' + esc(t.titre) + "</h3><p>" + esc(t.texte) + '</p><div class="ev">' + esc(t.preuve) + "</div></div>";
    }).join("");

    /* ---- Barres par catégorie ---- */
    var fcat = el("fcat");
    fcat.innerHTML += ordreCats.map(function (k) { return '<option value="' + k + '">' + esc(cats[k].l) + "</option>"; }).join("");
    var source = "";
    function barres() {
      var data = lignes.filter(function (l) { return !source || l.src === source; });
      var cles = ordreCats.filter(function (k) { return data.some(function (l) { return l.cat === k; }); });
      var max = 1;
      cles.forEach(function (k) { max = Math.max(max, data.filter(function (l) { return l.cat === k; }).length); });
      el("bars").innerHTML = cles.map(function (k) {
        var js = data.filter(function (l) { return l.cat === k; });
        var seg = ["C", "I", "P", "X"].map(function (n) {
          var c = js.filter(function (l) { return l.niv === n; }).length;
          return c ? '<i style="width:' + (c / max * 100) + "%;background:" + NIVEAUX[n][1] + '" title="' + NIVEAUX[n][0] + " : " + c + '"></i>' : "";
        }).join("");
        return '<button type="button" class="bar" data-c="' + k + '"><span>' + esc(cats[k].l) + '</span><span class="track">' + seg + "</span><em>" + js.length + "</em></button>";
      }).join("");
    }

    /* ---- Tableau ---- */
    var tri = "cat", croissant = true;
    function cleTri(l) {
      if (tri === "cat") return ordreCats.indexOf(l.cat) * 10 + ORDRE_NIVEAU[l.niv];
      if (tri === "niv") return ORDRE_NIVEAU[l.niv];
      if (tri === "poc") return l.poc ? l.poc.note : 0;
      return String(l[tri] || "").toLowerCase();
    }
    function cellulePoc(l) {
      if (!l.poc) return '<span class="muted">—</span>';
      return '<span class="score s' + l.poc.note + '" title="' + esc(l.poc.idee) + '">' + points(l.poc.note) + '</span><div class="eff">' + esc(l.poc.effort) + "</div>";
    }
    function tableau() {
      var q = el("q").value.toLowerCase(), c = fcat.value, n = el("flv").value,
          s = el("fsrc").value, x = el("fxp").value, p = el("fpoc").value;
      var r = lignes.filter(function (l) {
        return (!p || (l.poc && l.poc.note >= +p)) && (!c || l.cat === c) && (!n || l.niv === n) &&
          (!s || l.src === s) && (!x || l.xp === x) &&
          (!q || [l.t, l.synth, l.sect, l.outils, l.pays].join(" ").toLowerCase().indexOf(q) !== -1);
      });
      r.sort(function (a, b) {
        var u = cleTri(a), v = cleTri(b);
        return (u > v ? 1 : u < v ? -1 : 0) * (croissant ? 1 : -1);
      });
      el("tb").innerHTML = r.map(function (l) {
        return '<tr><td class="t"><a class="jl" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.t) + "</a>" +
          (l.direct ? "" : '<span class="srch">recherche</span>') + "</td>" +
          "<td>" + cellulePoc(l) + "</td>" +
          '<td><span class="pill" style="color:' + cats[l.cat].col + '">' + esc(cats[l.cat].l) + "</span></td>" +
          '<td><span class="lv"><i class="dot" style="background:' + NIVEAUX[l.niv][1] + '"></i>' + NIVEAUX[l.niv][0] + "</span></td>" +
          '<td class="sum">' + esc(l.synth) + '<div class="lk"><code>' + (l.id ? "~" + l.id : "sans identifiant") + "</code>" +
          '<button type="button" class="cp" data-u="' + esc(l.url) + '">Copier le lien</button>' +
          (l.direct ? '<a class="jl" href="' + esc(lienRecherche(l.t)) + '" target="_blank" rel="noopener">recherche</a>' : "") + "</div></td>" +
          '<td class="s">' + esc(l.sect) + '</td><td class="s">' + esc(l.outils) + '</td><td class="b">' + esc(l.b) + "</td>" +
          '<td class="s">' + esc(l.xp || "—") + '</td><td class="s">' + esc(l.pays) + '</td><td class="s">' + SOURCES[l.src] + "</td></tr>";
      }).join("");
      el("count").textContent = r.length + " offre" + (r.length > 1 ? "s" : "");
    }

    // L'en-tête du tableau est dans le document stocké ; on y associe les
    // clés de tri par position plutôt que d'y écrire des attributs.
    var clesColonnes = ["t", "poc", "cat", "niv", "synth", "sect", "outils", "b", "xp", "pays", "src"];
    Array.prototype.forEach.call(doc.querySelectorAll(".wa table:not(#wa-mx) thead th"), function (th, i) {
      th.addEventListener("click", function () {
        var k = clesColonnes[i];
        croissant = tri === k ? !croissant : true;
        tri = k;
        tableau();
      });
    });
    ["q", "fcat", "flv", "fsrc", "fxp", "fpoc"].forEach(function (id) {
      el(id).addEventListener("input", tableau);
    });
    Array.prototype.forEach.call(doc.querySelectorAll("#wa-srcTabs button"), function (b) {
      b.addEventListener("click", function () {
        source = b.getAttribute("data-s");
        Array.prototype.forEach.call(doc.querySelectorAll("#wa-srcTabs button"), function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        barres();
      });
    });

    // Délégation : les barres et les boutons « Copier » sont recréés à
    // chaque filtre, un écouteur posé sur eux serait perdu.
    doc.addEventListener("click", function (e) {
      var barre = e.target.closest(".wa .bar");
      if (barre) {
        fcat.value = fcat.value === barre.getAttribute("data-c") ? "" : barre.getAttribute("data-c");
        el("fsrc").value = source;
        tableau();
        el("q").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      var bouton = e.target.closest(".wa .cp");
      if (!bouton) return;
      var url = bouton.getAttribute("data-u");
      var fait = function () {
        bouton.textContent = "Lien copié";
        setTimeout(function () { bouton.textContent = "Copier le lien"; }, 1600);
      };
      // Sans presse-papiers, on affiche l'adresse : mieux vaut la copier à
      // la main que rester devant un bouton qui ne fait rien.
      var repli = function () { bouton.textContent = url; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(fait, repli);
      } else {
        repli();
      }
    });

    barres();
    tableau();
  }

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    doc.innerHTML = '<div id="chargement">Chargement…</div>';

    outils
      .requete("/rest/v1/documentation_pages?cle=eq.whatsapp-ia&select=html", { jeton: jeton })
      .then(function (r) {
        // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        if (!(r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        return outils.decompresser(r.json[0].html).then(function (html) {
          outils.memoriser();
          doc.innerHTML = html;
          var source = doc.querySelector("#wa-donnees");
          afficher(JSON.parse(source.textContent));
        });
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
