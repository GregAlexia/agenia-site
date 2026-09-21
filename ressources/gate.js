/* ============================================================
   AgenIA — Déverrouillage des ressources gated
   Capture Prénom/Email/Téléphone via Web3Forms, débloque le
   contenu de l'article, et mémorise le déblocage (localStorage)
   pour que le visiteur n'ait pas à ressaisir ses coordonnées.
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("formRessource");
  var portail = document.getElementById("portail");
  var contenu = document.getElementById("contenu");
  var note = document.getElementById("rNote");
  if (!form || !portail || !contenu) return;

  var slug = location.pathname.split("/").pop();
  var cleStockage = "agenia_ressource_" + slug;

  // Textes d'interface : fournis par script.js, chargé avant celui-ci sur
  // toutes les pages qui portent un portail. Le repli couvre le cas où il
  // manquerait — le déverrouillage doit marcher même sans lui.
  var T = (window.AgeniaLangue && window.AgeniaLangue.t) || {
    envoi: "Envoi en cours…",
    echec: "Oups, l'envoi a échoué. Réessayez ou écrivez-nous à contact@agenia.pro.",
    reseau: "Problème de connexion. Réessayez ou écrivez-nous à contact@agenia.pro.",
  };

  // Ce même script gate les pages produit, essai-outils.html et
  // les articles de ressources/ : la source se déduit du chemin plutôt que d'un
  // champ répété dans chaque page.
  // Toute source ajoutée ici doit l'être aussi dans la contrainte de la policy
  // d'insertion de site_agenia_prospects, sinon la ligne est rejetée en silence.
  // Les pages anglaises portent un nom court (margeo.html) là où les pages
  // françaises portent demo-margeo.html : on teste la FIN du chemin, qui est
  // commune aux deux. Les valeurs, elles, restent identiques dans les deux
  // langues — la policy d'insertion de site_agenia_prospects n'accepte que
  // cette liste, et les statistiques comptent un produit, pas une langue.
  var finit = function (suffixe) {
    var chemin = location.pathname;
    return chemin.indexOf(suffixe) === chemin.length - suffixe.length;
  };
  var source =
    finit("margeo.html") ? "demo_margeo" :
    finit("prospeo.html") ? "demo_prospeo" :
    finit("keo.html") ? "demo_keo" :
    finit("planeo.html") ? "demo_planeo" :
    (finit("essai-outils.html") || finit("free-tools.html")) ? "demo_outils" :
    "ressources";

  var debloquer = function () {
    portail.hidden = true;
    contenu.hidden = false;
  };

  // Déjà débloqué lors d'une visite précédente (même navigateur) : on saute le formulaire.
  try {
    if (localStorage.getItem(cleStockage) === "ok") {
      debloquer();
      return;
    }
  } catch (e) {
    /* stockage indisponible (navigation privée stricte) : on retombe sur le formulaire */
  }

  var submitBtn = form.querySelector('button[type="submit"]');
  var setNote = function (msg, ok) {
    if (!note) return;
    note.textContent = msg;
    note.style.color = ok === false ? "#a8342a" : "#1f7a43";
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var original = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = T.envoi;
    }
    setNote("");

    var data = new FormData(form);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (r) {
        if (r.ok && r.json.success) {
          if (window.AgeniaTrack) window.AgeniaTrack.prospect(source, form);
          try {
            localStorage.setItem(cleStockage, "ok");
          } catch (e) {
            /* pas grave : le contenu se débloque quand même pour cette visite */
          }
          debloquer();
          contenu.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          setNote(T.echec, false);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = original;
          }
        }
      })
      .catch(function () {
        setNote(T.reseau, false);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      });
  });
})();
