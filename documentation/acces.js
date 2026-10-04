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
  // Compte autorisé. Cette adresse est en clair dans un fichier public et c'est
  // aussi celle des mentions légales : on ne prétend plus la cacher. Ce qui
  // protège l'accès, c'est le mot de passe PLUS le code d'une application
  // d'authentification (TOTP), exigé par la base dès qu'un facteur est enrôlé.
  var COMPTE_EMAIL = "contact@agenia.pro";

  var portail, contenu, msg, champMdp, bouton, lienOubli, formCode,
      champCode, champNouveau, champNouveau2, boutonCode, deconnexion;
  var etapeMfa, mfaTexte, mfaQr, mfaSaisie, champMfa, boutonMfa, boutonPlusTard;
  // Jeton obtenu avec le seul mot de passe (niveau aal1) : il ne sert qu'à
  // dialoguer avec l'API d'authentification pour passer le second facteur.
  var mfa = { jeton: null, facteurs: [] };
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
      method: o.methode || (o.corps ? "POST" : "GET"),
      headers: entetes,
      body: o.corps ? JSON.stringify(o.corps) : undefined,
    }).then(function (res) {
      return res.json().then(
        function (json) { return { ok: res.ok, json: json }; },
        function () { return { ok: res.ok, json: null }; }
      );
    });
  }

  /* Les documents volumineux sont rangés compressés (gzip puis base64) : la
     colonne reste du texte, donc écrivable par n'importe quel outil SQL, et il
     transite trois fois moins d'octets. Le format se reconnaît à la lecture
     plutôt qu'à un drapeau en base — un contenu qui commence par « < » est du
     HTML tel quel. DecompressionStream est présent partout depuis 2023 ; on ne
     réimporte pas une bibliothèque pour cela. */
  function decompresser(charge) {
    if (charge.charAt(0) === "<") return Promise.resolve(charge);
    var binaire = atob(charge);
    var octets = new Uint8Array(binaire.length);
    for (var i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
    var flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(flux).text();
  }

  function retourPortail(texte) {
    try { sessionStorage.removeItem(STOCKAGE); } catch (e) { /* stockage indisponible */ }
    contenu.hidden = true;
    portail.hidden = false;
    reinitialiserEtape();
    if (texte) setMsg(texte, true);
  }

  /* ---- Second facteur (TOTP) ---------------------------------------------
     Après le mot de passe, la base délivre un jeton aal1. Selon l'état du
     compte, deux parcours : un facteur est déjà vérifié → on demande le code
     du moment ; aucun → on propose de l'enrôler (QR à scanner), faute de quoi
     le premier venu qui connaît le mot de passe pourrait le faire à la place
     du propriétaire. Le jeton aal2 renvoyé par la vérification est celui que
     les politiques RLS acceptent. */

  function elementsMdp() {
    return [
      document.querySelector('label[for="mdp"]'), champMdp, bouton,
      document.getElementById("lignelien"),
    ];
  }

  function reinitialiserEtape() {
    mfa.jeton = null;
    mfa.facteurs = [];
    if (!etapeMfa) return;
    etapeMfa.hidden = true;
    mfaQr.textContent = "";
    champMfa.value = "";
    mfaSaisie.hidden = false;
    elementsMdp().forEach(function (el) { if (el) el.hidden = false; });
  }

  function montrerEtape(texte, avecQr) {
    elementsMdp().forEach(function (el) { if (el) el.hidden = true; });
    formCode.hidden = true;
    mfaTexte.textContent = texte;
    mfaQr.hidden = !avecQr;
    boutonPlusTard.hidden = !avecQr;
    etapeMfa.hidden = false;
    champMfa.value = "";
    champMfa.focus();
  }

  function enroler(brouillons) {
    // Un enrôlement abandonné laisse un facteur non vérifié ; on le retire
    // pour ne pas en accumuler (la limite par compte est de dix).
    Promise.all(brouillons.map(function (f) {
      return requete("/auth/v1/factors/" + f.id, { jeton: mfa.jeton, methode: "DELETE" });
    }))
      .then(function () {
        return requete("/auth/v1/factors", {
          jeton: mfa.jeton,
          corps: { factor_type: "totp", friendly_name: "AgenIA " + Date.now(), issuer: "AgenIA" },
        });
      })
      .then(function (r) {
        if (!r.ok || !r.json || !r.json.id || !r.json.totp) {
          // Typiquement : TOTP non activé dans le projet. On laisse entrer au
          // niveau mot de passe seul plutôt que de bloquer le propriétaire.
          montrerEtape("La double vérification n'est pas disponible pour le moment.", false);
          mfaSaisie.hidden = true;
          boutonPlusTard.hidden = false;
          boutonPlusTard.textContent = "Continuer avec le mot de passe seul";
          setMsg("", false);
          return;
        }
        mfa.facteurs = [r.json.id];
        mfaQr.textContent = "";
        var qr = r.json.totp.qr_code;
        // L'API renvoie le dessin en SVG brut (« <svg … »), sans le préfixe
        // data: — c'est au client de l'ajouter. On accepte aussi la forme déjà
        // préfixée, au cas où le format changerait. Dans une balise <img>, un
        // SVG n'exécute aucun script : l'afficher ainsi est sans risque.
        var src = null;
        if (typeof qr === "string") {
          if (qr.indexOf("<svg") === 0) src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qr);
          else if (qr.indexOf("data:image/svg+xml") === 0) src = qr;
        }
        if (src) {
          var img = document.createElement("img");
          img.src = src;
          img.alt = "Code QR à scanner avec l'application d'authentification";
          img.width = img.height = 168;
          mfaQr.appendChild(img);
        }
        var secret = document.createElement("p");
        secret.textContent = "Ou saisissez cette clé : ";
        var code = document.createElement("code");
        code.textContent = r.json.totp.secret || "";
        secret.appendChild(code);
        mfaQr.appendChild(secret);
        montrerEtape(
          "Première connexion : scannez ce code avec une application d'authentification (Google Authenticator, Authy, 1Password…), puis saisissez le code à 6 chiffres qu'elle affiche.",
          true
        );
        setMsg("", false);
      })
      .catch(function () {
        setMsg("Problème de connexion. Réessayez.", true);
      });
  }

  function apresMotDePasse(jeton) {
    mfa.jeton = jeton;
    setMsg("Vérification du compte…", false);
    // La liste des facteurs vérifiés vient de la base (fonction réservée au
    // compte) plutôt que de /auth/v1/user : la décision d'enrôler ou de
    // demander un code ne dépend ainsi que d'une source que nous maîtrisons et
    // testons. Le projet est partagé avec Margéo, dont les comptes portent
    // leurs propres facteurs : la fonction ne renvoie que ceux de ce compte.
    requete("/rest/v1/rpc/documentation_facteurs", { jeton: jeton, corps: {} })
      .then(function (r) {
        if (!r.ok || !Array.isArray(r.json)) {
          setMsg("Problème de connexion. Réessayez.", true);
          return;
        }
        if (r.json.length) {
          mfa.facteurs = r.json;
          mfaQr.textContent = "";
          montrerEtape("Saisissez le code à 6 chiffres de votre application d'authentification.", false);
          setMsg("", false);
          return;
        }
        // Aucun facteur : enrôlement. Les tentatives abandonnées se retirent.
        return requete("/auth/v1/user", { jeton: jeton }).then(function (u) {
          var brouillons = ((u.ok && u.json && u.json.factors) || []).filter(function (f) {
            return f.factor_type === "totp" && f.status !== "verified";
          });
          enroler(brouillons);
        });
      })
      .catch(function () {
        setMsg("Problème de connexion. Réessayez.", true);
      });
  }

  // Un compte peut porter deux facteurs (application de téléphone et reste d'un
  // autre enrôlement) : on essaie chacun, du plus récent au plus ancien.
  function essayerFacteur(i, code) {
    if (i >= mfa.facteurs.length) return Promise.resolve(null);
    var base = "/auth/v1/factors/" + mfa.facteurs[i];
    return requete(base + "/challenge", { jeton: mfa.jeton, corps: {} })
      .then(function (c) {
        if (!c.ok || !c.json || !c.json.id) return null;
        return requete(base + "/verify", {
          jeton: mfa.jeton,
          corps: { challenge_id: c.json.id, code: code },
        });
      })
      .then(function (v) {
        if (v && v.ok && v.json && v.json.access_token) return v.json.access_token;
        return essayerFacteur(i + 1, code);
      });
  }

  function verifierCode() {
    var code = champMfa.value.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(code) || !mfa.facteurs.length) {
      setMsg("Le code comporte 6 chiffres.", true);
      return;
    }
    boutonMfa.disabled = true;
    setMsg("Vérification…", false);
    essayerFacteur(0, code)
      .then(function (jeton) {
        boutonMfa.disabled = false;
        if (jeton) {
          setMsg("", false);
          reinitialiserEtape();
          ouvrirSession(jeton);
        } else {
          setMsg("Code incorrect ou expiré.", true);
          champMfa.value = "";
          champMfa.focus();
        }
      })
      .catch(function () {
        boutonMfa.disabled = false;
        setMsg("Problème de connexion. Réessayez.", true);
      });
  }

  function construireEtape() {
    etapeMfa = document.createElement("div");
    etapeMfa.id = "etapeMfa";
    etapeMfa.hidden = true;

    mfaTexte = document.createElement("p");
    mfaTexte.id = "mfaTexte";
    etapeMfa.appendChild(mfaTexte);

    mfaQr = document.createElement("div");
    mfaQr.id = "mfaQr";
    mfaQr.hidden = true;
    etapeMfa.appendChild(mfaQr);

    mfaSaisie = document.createElement("div");
    mfaSaisie.id = "mfaSaisie";
    etapeMfa.appendChild(mfaSaisie);

    var etiquette = document.createElement("label");
    etiquette.setAttribute("for", "mfaCode");
    etiquette.textContent = "Code à 6 chiffres";
    mfaSaisie.appendChild(etiquette);

    champMfa = document.createElement("input");
    champMfa.id = "mfaCode";
    champMfa.type = "text";
    champMfa.inputMode = "numeric";
    champMfa.autocomplete = "one-time-code";
    champMfa.maxLength = 7; // « 123 456 » avec l'espace du milieu
    mfaSaisie.appendChild(champMfa);

    boutonMfa = document.createElement("button");
    boutonMfa.id = "mfaValider";
    boutonMfa.type = "button";
    boutonMfa.textContent = "Valider";
    mfaSaisie.appendChild(boutonMfa);

    boutonPlusTard = document.createElement("button");
    boutonPlusTard.id = "mfaPlusTard";
    boutonPlusTard.type = "button";
    boutonPlusTard.textContent = "Plus tard (mot de passe seul)";
    boutonPlusTard.hidden = true;
    etapeMfa.appendChild(boutonPlusTard);

    msg.parentNode.insertBefore(etapeMfa, msg);

    boutonMfa.addEventListener("click", verifierCode);
    champMfa.addEventListener("keydown", function (e) {
      if (e.key === "Enter") verifierCode();
    });
    boutonPlusTard.addEventListener("click", function () {
      var jeton = mfa.jeton;
      reinitialiserEtape();
      if (jeton) ouvrirSession(jeton);
    });
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
      decompresser: decompresser,
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
            apresMotDePasse(r.json.access_token);
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
          setMsg("Si un code est envoyé, il arrive à l'adresse du compte administrateur : 8 chiffres, valables 15 minutes. Un nouveau code ne peut être demandé qu'au bout de 15 minutes, et trois fois par jour au plus.", false);
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

      construireEtape();
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
