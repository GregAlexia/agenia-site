/* ============================================================
   AgenIA — Nouveau mot de passe (compte administrateur)
   Page autonome : lit le jeton de récupération dans le #fragment de
   l'URL (déposé directement ici par Supabase Auth, redirect_to pointe
   sur CETTE page — aucun passage par margeo.vercel.app) et enregistre
   le nouveau mot de passe en appelant Supabase directement. La
   réinitialisation d'agenia.pro reste ainsi entièrement indépendante
   de l'application Duopilot.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://quygyeesmtxgykerjtjr.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yYSJTuUgs-IVI3TmPiuHYA_jAzEgFfx";

  var zoneErreur = document.getElementById("zoneErreur");
  var zoneForm = document.getElementById("zoneForm");
  var zoneSucces = document.getElementById("zoneSucces");
  var champPw = document.getElementById("pw");
  var champPw2 = document.getElementById("pw2");
  var bouton = document.getElementById("valider");
  var msg = document.getElementById("msg");

  function setMsg(texte, erreur) {
    msg.textContent = texte;
    msg.style.color = erreur ? "#a8342a" : "#6b635a";
  }

  function lireFragment() {
    var params = {};
    location.hash.replace(/^#/, "").split("&").forEach(function (paire) {
      if (!paire) return;
      var kv = paire.split("=");
      params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    });
    return params;
  }

  var fragment = lireFragment();
  var jeton = fragment.access_token;

  if (!jeton || fragment.type !== "recovery") {
    zoneForm.hidden = true;
    zoneErreur.hidden = false;
  } else {
    // Le jeton ne doit pas rester visible dans l'adresse ni dans l'historique.
    history.replaceState(null, "", location.pathname);

    bouton.addEventListener("click", function () {
      var pw = champPw.value;
      var pw2 = champPw2.value;
      if (pw.length < 8) {
        setMsg("Le mot de passe doit faire au moins 8 caractères.", true);
        return;
      }
      if (pw !== pw2) {
        setMsg("Les deux mots de passe ne correspondent pas.", true);
        return;
      }
      bouton.disabled = true;
      setMsg("Enregistrement…", false);
      fetch(SUPABASE_URL + "/auth/v1/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + jeton,
        },
        body: JSON.stringify({ password: pw }),
      })
        .then(function (res) {
          bouton.disabled = false;
          if (res.ok) {
            zoneForm.hidden = true;
            zoneSucces.hidden = false;
          } else {
            setMsg(
              "Le lien a peut-être expiré. Redemandez-en un depuis la page Statistiques.",
              true
            );
          }
        })
        .catch(function () {
          bouton.disabled = false;
          setMsg("Problème de connexion. Réessayez.", true);
        });
    });

    champPw2.addEventListener("keydown", function (e) {
      if (e.key === "Enter") bouton.click();
    });
  }
})();
