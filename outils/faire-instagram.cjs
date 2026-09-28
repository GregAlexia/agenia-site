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
  { type: 'hook', tag: 'Automatisation & process',
    titre: 'Plus de volume. Même taux de réponse. 0 surprise.',
    illustration: 'mascotte/hausse-epaules.png',
    corps: 'La mascotte AgenIA hausse les épaules : on arrose toute la liste, le bon prospect reste sec.' },
  { type: 'point', tag: '01 · Le symptôme', num: '1 / 5',
    titre: 'Vous envoyez 2 fois plus. Ça ne change rien.',
    corps: "C'est le signe d'un ciblage mal cadré — pas d'un outil mal réglé. Envoyer davantage à la mauvaise cible ne fait qu'agrandir la même erreur." },
  { type: 'point', tag: '02 · Les signaux', num: '2 / 5',
    titre: '« On regarde et on revient vers vous. »',
    corps: "Une question sur le prix ou le délai mérite une relance dans l'heure. Un accusé de réception poli peut patienter dans une séquence standard." },
  { type: 'point', tag: '03 · La vitesse', num: '3 / 5',
    titre: 'Un lead noté et oublié. C’est un lead perdu.',
    corps: "Traité dans la minute, il convertit. Oublié dans une file d'attente, le scoring n'a servi à rien." },
  { type: 'point', tag: '04 · Les limites', num: '4 / 5',
    titre: '50 emails par jour. Un domaine grillé pour un mois.',
    corps: "Au-delà de 20 à 50 emails par jour et 4 à 5 relances, le taux de plaintes grimpe — et il faut ensuite des semaines pour reconstruire la réputation d'envoi." },
  { type: 'quote', tag: "Le regard d'AgenIA", num: '5 / 5',
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
