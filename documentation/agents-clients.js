/* ============================================================
   AgenIA — Agents WhatsApp et chatbots : personnaliser pour un client
   Page rédigée en clair dans agents-clients.html (méthode générale,
   aucune donnée client). Ce script ne fait que vérifier la session
   avant d'afficher : le contenu n'est pas une donnée protégée par la
   base, seulement masqué à l'œil jusqu'à la connexion.
   ============================================================ */
(function () {
  "use strict";

  var chargement = document.getElementById("chargement");
  var agents = document.getElementById("agents");

  window.AgeniaAcces.demarrer(function (jeton, outils) {
    // Une policy RLS ne renvoie pas d'erreur : elle renvoie zéro ligne.
    // Un tableau vide signifie donc « ce jeton n'ouvre rien ».
    outils
      .requete("/rest/v1/documentation_pages?cle=eq.guide&select=cle", { jeton: jeton })
      .then(function (r) {
        if (!(r.ok && Array.isArray(r.json) && r.json.length)) {
          outils.echec("Session expirée, reconnectez-vous.");
          return;
        }
        outils.memoriser();
        chargement.hidden = true;
        agents.hidden = false;
      })
      .catch(function () {
        outils.echec("Problème de connexion. Réessayez.");
      });
  });
})();
