/* ============================================================
   Génère l'épingle Pinterest d'un article depuis outils/pinterest-post.html.

   Mode d'emploi :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-pinterest.cjs

   Une seule image par article (pas un carrousel comme Instagram) : modifier
   l'objet PIN ci-dessous pour le prochain article avant de relancer — tag,
   titre (reprendre le H1 du blog pour la recherche Pinterest), quatre points
   au plus séparés par `|` dans `points` (chiffres en chiffres, jamais en
   lettres — voir reseauteo, .claude/skills/agenia-contenu/reference/hooks.md),
   et en option `illustration`/`props` pour la mascotte en situation, même
   convention que faire-instagram.cjs (script à valider avant l'image, voir
   reference/mascotte.md).

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

const SLUG = 'automatiser-prospection-mal-cadree';

// Épingle validée le 28/09/2026 pour cet article — voir reseauteo,
// .claude/skills/agenia-contenu/reference/mascotte.md pour le processus de
// validation de la mascotte à suivre pour la prochaine épingle.
const PIN = {
  tag: 'Automatisation & process',
  titre: "Automatiser une prospection mal cadrée l'aggrave",
  points: [
    '0 corrélation entre volume envoyé et taux de réponse, si le ciblage est mauvais.',
    "1 lead noté doit être routé en minutes, pas dormir dans une file d'attente.",
    '20 à 50 emails par jour, 4 à 5 relances maximum, avant que le taux de plaintes grimpe.',
    '1 heure pour cadrer le client visé. 3 semaines perdues si on la saute.',
  ].join('|'),
  cta: "Lire l'article complet",
  illustration: 'mascotte/hausse-epaules.png',
  props: 'email:Emails envoyés,telephone:Appels passés,bulle:Le patron demande,resultat:0 RDV obtenu',
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
