/* ============================================================
   Génère l'épingle Pinterest d'un article depuis outils/pinterest-post.html.

   Mode d'emploi :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-pinterest.cjs

   Une seule image par article (pas un carrousel comme Instagram) : modifier
   l'objet PIN ci-dessous pour le prochain article avant de relancer — tag,
   titre (reprendre telle quelle la phrase de hook déjà validée dans CARTES
   de faire-instagram.cjs, jamais une reformulation ni le H1 du blog : un
   seul hook validé par le propriétaire sert les deux réseaux), quatre
   points au plus séparés par `|` dans `points` (chiffres en chiffres,
   jamais en lettres — voir reseauteo,
   .claude/skills/agenia-contenu/reference/hooks.md), et en option
   `illustration`/`props` pour la mascotte en situation, même convention que
   faire-instagram.cjs (script à valider avant l'image, voir
   reference/mascotte.md).

   ⚠️ Changer aussi SLUG ci-dessous pour le nouvel article, pas seulement
   PIN : le nom du fichier de sortie en dépend, et l'oublier écrase
   l'épingle de l'article précédent au lieu d'en écrire une nouvelle.

   Il faut Playwright et un Chromium.

   ⚠️ **Ne pas installer Playwright dans le dépôt.** Le dépôt est publié en
   entier : un `node_modules/` posé ici serait téléchargeable depuis le site,
   et la règle « ni build ni dépendance » deviendrait fausse (voir la même
   remarque dans faire-pdf.cjs et faire-instagram.cjs). L'installer ailleurs
   et pointer Node dessus :

     npm --prefix /un/dossier/hors/depot install playwright
     npx --prefix /un/dossier/hors/depot playwright install chromium
     NODE_PATH=/un/dossier/hors/depot/node_modules node outils/faire-pinterest.cjs
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');

const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const BASE = process.env.BASE_URL || 'http://localhost:8420';

const SLUG = 'buffer-publier-instagram-sans-meta';

// Épingle validée le 28/09/2026 : reprend le hook « Accroche contrariante »
// du carrousel Instagram (même scène de mascotte) — voir reseauteo,
// .claude/skills/agenia-contenu/reference/mascotte.md pour le processus de
// validation de la mascotte à suivre pour la prochaine épingle.
const PIN = {
  tag: 'Outils & comparatifs',
  // Même hook que la carte 1 (type: 'hook') de CARTES dans faire-instagram.cjs.
  titre: 'Payer Buffer. Ou construire sa propre revue Meta.',
  points: [
    '3 canaux et 10 publications programmées sur le plan gratuit de Buffer.',
    "0 démarche technique pour connecter Instagram — l'écran officiel de Meta suffit.",
    "60 jours : durée de vie d'un jeton d'accès Meta, à renouveler soi-même en direct.",
    '100 publications par compte et par 24h, le plafond réel d’Instagram une fois en ligne.',
  ].join('|'),
  cta: "Lire l'article complet",
  illustration: 'mascotte/reflexion.png',
  props: "bulle:Revue Meta,telephone:Jetons à renouveler,email:Connexion Buffer,resultat:On garde Buffer",
};

(async () => {
  fs.mkdirSync('assets/pinterest', { recursive: true });

  const br = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
  const ctx = await br.newContext({ viewport: { width: 1000, height: 1500 } });

  const params = new URLSearchParams(PIN);
  const page = await ctx.newPage();
  await page.goto(BASE + '/outils/pinterest-post.html?' + params.toString(), { waitUntil: 'networkidle' });
  // Les fontes sont auto-hébergées : sans cette attente, la capture peut
  // partir avec la police de repli, ce qui ne se voit qu'une fois en ligne.
  await page.evaluate(() => document.fonts.ready);
  const sortie = `assets/pinterest/${SLUG}.jpg`;
  await page.screenshot({ path: sortie, type: 'jpeg', quality: 92 });
  console.log('écrit : ' + sortie);
  await page.close();

  await br.close();
})();
