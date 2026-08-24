/* ============================================================
   AgenIA — Documentation interne
   Accès réservé au compte administrateur du site. Le contenu vit
   en base (Supabase) et non plus dans ce dépôt public : c'est la
   politique RLS qui en autorise la lecture, au seul compte prévu.
   Réinitialisation par code à 6 chiffres — aucun lien, aucune
   redirection, donc rien qui dépende d'une autre application.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://quygyeesmtxgykerjtjr.supabase.co";
  // Clé publique : elle n'ouvre aucun droit par elle-même. Ce qui protège le
  // contenu, c'est la politique RLS côté base, pas la discrétion de cette clé.
  var SUPABASE_ANON_KEY = "sb_publishable_yYSJTuUgs-IVI3TmPiuHYA_jAzEgFfx";
  var STOCKAGE = "agenia_doc_jeton";
  // Compte autorisé, fixé ici et jamais affiché : la page ne doit pas divulguer
  // à un visiteur quelle adresse ouvre l'accès.
  var COMPTE_EMAIL = "contact@agenia.pro";

  var portail = document.getElementById("portail");
  var contenu = document.getElementById("contenu");
  var doc = document.getElementById("doc");
  var msg = document.getElementById("msg");
  var champMdp = document.getElementById("mdp");
  var bouton = document.getElementById("valider");
  var lienOubli = document.getElementById("lienOubli");
  var formCode = document.getElementById("formCode");
  var champCode = document.getElementById("code");
  var champNouveau = document.getElementById("nouveauMdp");
  var champNouveau2 = document.getElementById("nouveauMdp2");
  var boutonCode = document.getElementById("validerCode");
  var deconnexion = document.getElementById("deconnexion");

  function setMsg(texte, erreur) {
    msg.textContent = texte;
    msg.style.color = erreur ? "#a8342a" : "#6b635a";
  }

  function connecter(motdepasse) {
    return fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email: COMPTE_EMAIL, password: motdepasse }),
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    });
  }

  function chargerDoc(jeton) {
    return fetch(SUPABASE_URL + "/rest/v1/documentation_contenu?select=html", {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + jeton },
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    });
  }

  function appelerRpc(nom, corps) {
    return fetch(SUPABASE_URL + "/rest/v1/rpc/" + nom, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify(corps || {}),
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    });
  }

  function retourPortail(texte) {
    try { sessionStorage.removeItem(STOCKAGE); } catch (e) { /* stockage indisponible */ }
    contenu.hidden = true;
    portail.hidden = false;
    if (texte) setMsg(texte, true);
  }

  function ouvrirSession(jeton) {
    portail.hidden = true;
    contenu.hidden = false;
    doc.innerHTML = '<div id="chargement">Chargement…</div>';
    chargerDoc(jeton)
      .then(function (r) {
        // Une politique RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
        // Un tableau vide signifie donc « ce jeton n'ouvre pas ce contenu ».
        if (r.ok && Array.isArray(r.json) && r.json.length && r.json[0].html) {
          try { sessionStorage.setItem(STOCKAGE, jeton); } catch (e) { /* pas grave */ }
          doc.innerHTML = r.json[0].html;
        } else {
          retourPortail("Session expirée, reconnectez-vous.");
        }
      })
      .catch(function () {
        retourPortail("Problème de connexion. Réessayez.");
      });
  }

  bouton.addEventListener("click", function () {
    var motdepasse = champMdp.value;
    if (!motdepasse) return;
    bouton.disabled = true;
    setMsg("Connexion en cours…", false);
    connecter(motdepasse)
      .then(function (r) {
        bouton.disabled = false;
        if (r.ok && r.json.access_token) {
          setMsg("", false);
          ouvrirSession(r.json.access_token);
        } else {
          setMsg("Mot de passe incorrect.", true);
          champMdp.value = "";
        }
      })
      .catch(function () {
        bouton.disabled = false;
        setMsg("Problème de connexion. Réessayez.", true);
      });
  });

  champMdp.addEventListener("keydown", function (e) {
    if (e.key === "Enter") bouton.click();
  });

  lienOubli.addEventListener("click", function () {
    lienOubli.disabled = true;
    setMsg("Envoi en cours…", false);
    appelerRpc("documentation_demander_code")
      .then(function () {
        formCode.hidden = false;
        champCode.focus();
        // L'adresse n'est jamais nommée : elle reste une information interne.
        setMsg("Un code à 6 chiffres vient d'être envoyé à l'adresse du compte administrateur.", false);
      })
      .catch(function () {
        setMsg("Problème de connexion. Réessayez.", true);
      })
      .then(function () {
        lienOubli.disabled = false;
      });
  });

  boutonCode.addEventListener("click", function () {
    var code = champCode.value.trim();
    var mdp = champNouveau.value;
    if (!code || !mdp) return;
    if (mdp !== champNouveau2.value) {
      setMsg("Les deux mots de passe ne correspondent pas.", true);
      return;
    }
    boutonCode.disabled = true;
    setMsg("Enregistrement…", false);
    appelerRpc("documentation_reinitialiser", { p_code: code, p_mdp: mdp })
      .then(function (r) {
        boutonCode.disabled = false;
        if (r.ok && r.json && r.json.ok) {
          formCode.hidden = true;
          champCode.value = champNouveau.value = champNouveau2.value = "";
          setMsg("Mot de passe enregistré. Vous pouvez vous connecter.", false);
          champMdp.focus();
        } else {
          setMsg((r.json && r.json.erreur) || "Code invalide ou expiré.", true);
        }
      })
      .catch(function () {
        boutonCode.disabled = false;
        setMsg("Problème de connexion. Réessayez.", true);
      });
  });

  champNouveau2.addEventListener("keydown", function (e) {
    if (e.key === "Enter") boutonCode.click();
  });

  deconnexion.addEventListener("click", function () {
    retourPortail("");
    champMdp.value = "";
    champMdp.focus();
  });

  // Onglet déjà ouvert : on retente sans redemander. Un jeton périmé est
  // simplement refusé par la base, et retourPortail() reprend la main.
  try {
    var memo = sessionStorage.getItem(STOCKAGE);
    if (memo) ouvrirSession(memo);
  } catch (e) { /* stockage indisponible : le portail s'affiche normalement */ }
})();
