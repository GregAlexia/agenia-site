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

  // Ce même script gate les pages produit, essai-outils.html et
  // les articles de ressources/ : la source se déduit du chemin plutôt que d'un
  // champ répété dans chaque page.
  // Toute source ajoutée ici doit l'être aussi dans la contrainte de la policy
  // d'insertion de site_agenia_prospects, sinon la ligne est rejetée en silence.
  var source =
    location.pathname.indexOf("demo-margeo.html") !== -1 ? "demo_margeo" :
    location.pathname.indexOf("demo-prospeo.html") !== -1 ? "demo_prospeo" :
    location.pathname.indexOf("demo-keo.html") !== -1 ? "demo_keo" :
    location.pathname.indexOf("demo-planeo.html") !== -1 ? "demo_planeo" :
    location.pathname.indexOf("essai-outils.html") !== -1 ? "demo_outils" :
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
      submitBtn.textContent = "Envoi en cours…";
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
          setNote(
            "Oups, l'envoi a échoué. Réessayez ou écrivez-nous à contact@agenia.pro.",
            false
          );
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = original;
          }
        }
      })
      .catch(function () {
        setNote(
          "Problème de connexion. Réessayez ou écrivez-nous à contact@agenia.pro.",
          false
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      });
  });
})();
