/* ============================================================
   AgenIA — Portail commun de l'espace interne
   Partagé par la documentation et les statistiques : une seule
   mécanique de connexion, un seul parcours de réinitialisation.
   Chaque page fournit ce qu'elle veut faire du jeton obtenu.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://quygyeesmtxgykerjtjr.supabase.co";
  // Clé publique : elle n'ouvre aucun droit par elle-même. Ce qui protège les
  // données, ce sont les politiques RLS côté base, pas la discrétion de la clé.
  var SUPABASE_ANON_KEY = "sb_publishable_yYSJTuUgs-IVI3TmPiuHYA_jAzEgFfx";
  var STOCKAGE = "agenia_doc_jeton";
  // Compte autorisé, fixé ici et jamais affiché : la page ne doit pas indiquer
  // à un visiteur quelle adresse ouvre l'accès.
  var COMPTE_EMAIL = "contact@agenia.pro";

  var portail, contenu, msg, champMdp, bouton, lienOubli, formCode,
      champCode, champNouveau, champNouveau2, boutonCode, deconnexion;
  var surSession = function () {};

  function setMsg(texte, erreur) {
    msg.textContent = texte;
    msg.style.color = erreur ? "#a8342a" : "#6b635a";
  }

  function requete(chemin, options) {
    var o = options || {};
    var entetes = { apikey: SUPABASE_ANON_KEY };
    if (o.jeton) entetes.Authorization = "Bearer " + o.jeton;
    if (o.corps) entetes["Content-Type"] = "application/json";
    return fetch(SUPABASE_URL + chemin, {
      method: o.corps ? "POST" : "GET",
      headers: entetes,
      body: o.corps ? JSON.stringify(o.corps) : undefined,
    }).then(function (res) {
      return res.json().then(
        function (json) { return { ok: res.ok, json: json }; },
        function () { return { ok: res.ok, json: null }; }
      );
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
    // La page décide quoi charger ; elle rappelle `echec` si le jeton
    // n'ouvre finalement rien (une policy RLS ne renvoie pas d'erreur mais
    // zéro ligne, c'est donc à l'appelant de trancher).
    surSession(jeton, {
      memoriser: function () {
        try { sessionStorage.setItem(STOCKAGE, jeton); } catch (e) { /* pas grave */ }
      },
      echec: retourPortail,
      requete: requete,
    });
  }

  function brancher() {
    bouton.addEventListener("click", function () {
      var motdepasse = champMdp.value;
      if (!motdepasse) return;
      bouton.disabled = true;
      setMsg("Connexion en cours…", false);
      requete("/auth/v1/token?grant_type=password", {
        corps: { email: COMPTE_EMAIL, password: motdepasse },
      })
        .then(function (r) {
          bouton.disabled = false;
          if (r.ok && r.json && r.json.access_token) {
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
      requete("/rest/v1/rpc/documentation_demander_code", { corps: {} })
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
      requete("/rest/v1/rpc/documentation_reinitialiser", {
        corps: { p_code: code, p_mdp: mdp },
      })
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

    if (deconnexion) {
      deconnexion.addEventListener("click", function () {
        retourPortail("");
        champMdp.value = "";
        champMdp.focus();
      });
    }
  }

  window.AgeniaAcces = {
    /** `rappel(jeton, outils)` est appelé dès qu'une session est ouverte. */
    demarrer: function (rappel) {
      surSession = rappel;
      portail = document.getElementById("portail");
      contenu = document.getElementById("contenu");
      msg = document.getElementById("msg");
      champMdp = document.getElementById("mdp");
      bouton = document.getElementById("valider");
      lienOubli = document.getElementById("lienOubli");
      formCode = document.getElementById("formCode");
      champCode = document.getElementById("code");
      champNouveau = document.getElementById("nouveauMdp");
      champNouveau2 = document.getElementById("nouveauMdp2");
      boutonCode = document.getElementById("validerCode");
      deconnexion = document.getElementById("deconnexion");

      brancher();

      // Onglet déjà ouvert : on retente sans redemander. Un jeton périmé est
      // simplement refusé, et retourPortail() reprend la main.
      try {
        var memo = sessionStorage.getItem(STOCKAGE);
        if (memo) ouvrirSession(memo);
      } catch (e) { /* stockage indisponible : le portail s'affiche normalement */ }
    },
  };
})();
