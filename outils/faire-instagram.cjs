/* ============================================================
   Génère les images d'un carrousel Instagram depuis outils/instagram-post.html.

   Mode d'emploi :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-instagram.cjs

   La liste CARTES ci-dessous est celle du carrousel validé pour l'article
   « Automatiser une prospection mal cadrée l'aggrave » — à remplacer par les
   cartes du prochain article avant de relancer. Chaque carte correspond à un
   paramètre de outils/instagram-post.html ; voir son en-tête pour le détail
   des types (hook / point / quote / cta).

   Format « Mythe vs Réalité » depuis le 28/09/2026 : une veille des formats
   qui font le plus swiper en carrousel B2B/tech a fait ressortir ce format
   au-dessus du carrousel « À savoir » point par point utilisé jusque-là — la
   promesse chiffrée du hook (« 3 mythes ») annonce exactement le nombre de
   cartes mythe/réalité qui suivent, voir reseauteo docs/DASHBOARD-CONTENU.md
   pour l'analyse complète. Le hook de cet article reste la même phrase que
   celle reprise par outils/pinterest-post.html — un seul hook validé pour
   les deux formats.

   Il faut Playwright et un Chromium.

   ⚠️ **Ne pas installer Playwright dans le dépôt.** Le dépôt est publié en
   entier : un `node_modules/` posé ici serait téléchargeable depuis le site,
   et la règle « ni build ni dépendance » deviendrait fausse (voir la même
   remarque dans faire-pdf.cjs). L'installer ailleurs et pointer Node dessus :

     npm --prefix /un/dossier/hors/depot install playwright
     npx --prefix /un/dossier/hors/depot playwright install chromium
     NODE_PATH=/un/dossier/hors/depot/node_modules node outils/faire-instagram.cjs
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');

const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const BASE = process.env.BASE_URL || 'http://localhost:8420';

const SLUG = 'automatiser-prospection-mal-cadree';
const DOSSIER = `assets/instagram/${SLUG}`;

const CARTES = [
  // Personnage remplacé le 28/09/2026 : la mascotte AgenIA est désormais un
  // personnage illustré (plus le robot des premières cartes), recadré depuis
  // la planche fournie par le propriétaire — voir reseauteo,
  // .claude/skills/agenia-contenu/reference/mascotte.md. Pose « réflexion »
  // (main au menton), qui porte le doute du hook mieux que la précédente.
  { type: 'hook', tag: '3 mythes qui coûtent cher',
    titre: '3 mythes sur la prospection automatisée.',
    illustration: 'mascotte/reflexion.png',
    props: "email:Plus d'emails,bulle:Lead noté,telephone:Plus de relances,resultat:0 RDV obtenu" },
  { type: 'point', tag: 'Mythe', num: '1 / 3',
    titre: 'Plus vous envoyez, plus on vous répond.',
    corps: "Réalité : sans ciblage, le volume n'aide pas. Il agrandit la même erreur, plus vite." },
  { type: 'point', tag: 'Mythe', num: '2 / 3',
    titre: 'Un lead noté est un lead traité.',
    corps: "Réalité : oublié dans une file d'attente, le scoring n'a servi à rien. Il faut un routage en minutes." },
  { type: 'point', tag: 'Mythe', num: '3 / 3',
    titre: 'Plus de relances, plus de chances.',
    corps: 'Réalité : au-delà de 4 à 5 relances, le taux de plaintes grimpe. Un domaine grillé ne se répare pas vite.' },
  { type: 'quote', tag: "Le regard d'AgenIA",
    titre: 'Un cadrage non fait aujourd’hui. 3 semaines perdues demain.',
    corps: 'Poser la définition du client visé prend 1 heure. Ne pas le faire coûte.' },
  { type: 'cta', tag: 'À lire en entier',
    titre: 'Un call de 30 minutes. Ou des semaines de relances dans le vide.',
    corps: "L'article complet, sources incluses → lien en bio." },
];

(async () => {
  fs.mkdirSync(DOSSIER, { recursive: true });

  const br = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
  const ctx = await br.newContext({ viewport: { width: 1080, height: 1080 } });

  for (let i = 0; i < CARTES.length; i++) {
    const params = new URLSearchParams(CARTES[i]);
    const page = await ctx.newPage();
    await page.goto(BASE + '/outils/instagram-post.html?' + params.toString(), { waitUntil: 'networkidle' });
    // Les fontes sont auto-hébergées : sans cette attente, la capture peut
    // partir avec la police de repli, ce qui ne se voit qu'une fois en ligne.
    await page.evaluate(() => document.fonts.ready);
    const sortie = `${DOSSIER}/${i + 1}.jpg`;
    await page.screenshot({ path: sortie, type: 'jpeg', quality: 92 });
    console.log('écrit : ' + sortie);
    await page.close();
  }

  await br.close();
})();
