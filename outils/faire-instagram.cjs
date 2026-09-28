/* ============================================================
   Génère les images d'un carrousel Instagram depuis outils/instagram-post.html.

   Mode d'emploi :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-instagram.cjs

   La liste CARTES ci-dessous est celle du carrousel validé pour l'article
   « Buffer suffit-il à publier sur Instagram sans Meta ? » — à remplacer par
   les cartes du prochain article avant de relancer. Chaque carte correspond
   à un paramètre de outils/instagram-post.html ; voir son en-tête pour le
   détail des types (hook / point / quote / cta).

   ⚠️ Changer aussi SLUG ci-dessous pour le nouvel article, pas seulement
   CARTES : DOSSIER en dépend, et l'oublier écrit les nouvelles images
   par-dessus celles de l'article précédent au lieu d'un nouveau dossier.

   Format « Accroche contrariante + preuve » (reseauteo,
   .claude/skills/agenia-contenu/reference/formats-viraux.md, formule 2) —
   changé depuis « Mythe vs Réalité » du premier article, pour varier la
   structure d'un article à l'autre plutôt que la reproduire par réflexe.
   Le hook de cet article reste la même phrase que celle reprise par
   outils/faire-pinterest.cjs — un seul hook validé pour les deux formats.

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

const SLUG = 'buffer-publier-instagram-sans-meta';
const DOSSIER = `assets/instagram/${SLUG}`;

const CARTES = [
  // Scène validée le 28/09/2026 — même pose « réflexion » que le premier
  // article (voir reseauteo, .claude/skills/agenia-contenu/reference/
  // mascotte.md) : le doute qu'elle porte colle à un choix qu'on pèse
  // (Buffer ou construire soi-même), pas seulement à un échec.
  { type: 'hook', tag: 'Buffer ou DIY ?',
    titre: 'Payer Buffer. Ou construire sa propre revue Meta.',
    illustration: 'mascotte/reflexion.png',
    props: "bulle:Revue Meta,telephone:Jetons à renouveler,email:Connexion Buffer,resultat:On garde Buffer" },
  { type: 'point', tag: 'Coût caché', num: '1 / 3',
    titre: 'La revue Meta se compte en semaines.',
    corps: "Chaque permission se demande séparément, avec sa propre démonstration filmée. Buffer l'a déjà fait à votre place." },
  { type: 'point', tag: 'Coût caché', num: '2 / 3',
    titre: 'Le plan gratuit couvre 3 canaux.',
    corps: '10 publications programmées à l’avance — largement assez pour un rythme hebdomadaire.' },
  { type: 'point', tag: 'Coût caché', num: '3 / 3',
    titre: 'Construire sa propre intégration a un coût continu.',
    corps: 'Jetons à renouveler tous les 60 jours, contrôle annuel obligatoire, statut Tech Provider à maintenir.' },
  { type: 'quote', tag: "Le regard d'AgenIA",
    titre: "On l'a chiffré avant de choisir, pas après.",
    corps: "Buffer n'est pas un choix par défaut. C'est un calcul qu'on referait à chaque palier de croissance." },
  { type: 'cta', tag: 'À lire en entier',
    titre: '30 minutes pour savoir si Buffer suffit à votre volume.',
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
