/* ============================================================
   Génère la version PDF des trois guides de /ressources/.

   Pourquoi un script plutôt que trois fichiers écrits à la main : le PDF est
   ce que le formulaire promet en échange des coordonnées. S'il décrit une
   version périmée de l'article, la promesse devient fausse sans que rien ne le
   signale. Le générer depuis la page elle-même garantit qu'il n'existe qu'un
   seul texte à maintenir.

   Mode d'emploi — à relancer après toute modification d'un guide :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-pdf.cjs

   Il faut Playwright et un Chromium. Le chemin ci-dessous est celui des
   environnements où ce script a été écrit ; ailleurs, laisser Playwright
   trouver son navigateur en retirant `executablePath`.

   ⚠️ **Ne pas installer Playwright dans le dépôt.** Le dépôt est publié en
   entier : un `node_modules/` posé ici serait téléchargeable depuis le site,
   et la règle « ni build ni dépendance » deviendrait fausse. L'installer
   ailleurs et pointer Node dessus :

     npm --prefix /un/dossier/hors/depot install playwright
     npx --prefix /un/dossier/hors/depot playwright install chromium
     NODE_PATH=/un/dossier/hors/depot/node_modules node outils/faire-pdf.cjs

   L'impression retire l'en-tête, le pied de page, le formulaire et le bloc
   « À lire ensuite » : un PDF qui contient le formulaire qu'on vient de
   remplir a l'air d'une erreur, et des liens de navigation morts sur papier
   n'aident personne.
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');

const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const BASE = process.env.BASE_URL || 'http://localhost:8420';

// Six guides : les trois français de /ressources/ et leurs jumeaux anglais de
// /en/. Chaque entrée dit quelle page imprimer et où écrire le PDF, parce que
// les deux langues ne rangent pas leurs fichiers pareil — l'anglais est à plat
// dans /en/, le français dans /ressources/.
const GUIDES = [
  ['/ressources/20-taches-a-automatiser.html',
   'ressources/pdf/20-taches-a-automatiser.pdf',
   '20 tâches à automatiser en premier'],
  ['/ressources/auditer-process-pme.html',
   'ressources/pdf/auditer-process-pme.pdf',
   "Auditer ses process avant d'automatiser"],
  ['/ressources/calculer-roi-automatisation.html',
   'ressources/pdf/calculer-roi-automatisation.pdf',
   "Calculer le ROI d'une automatisation"],
  ['/en/20-tasks-to-automate.html',
   'en/pdf/20-tasks-to-automate.pdf',
   '20 tasks to automate first'],
  ['/en/audit-before-you-automate.html',
   'en/pdf/audit-before-you-automate.pdf',
   'Why you should audit your processes before automating'],
  ['/en/automation-roi.html',
   'en/pdf/automation-roi.pdf',
   'Working out the ROI of an automation'],
];

// `:last-of-type` vise le bloc « À lire ensuite », qui termine chaque guide.
const IMPRESSION = `
  .site-header, .site-footer, #portail, #contenu, .pill,
  .res-article__inner > h2:last-of-type,
  .res-article__inner > ul:last-of-type { display: none !important; }
  body { background: #fff; }
  .res-article { padding: 0; }
  .res-article__inner { max-width: none; }
  h1 { font-size: 26pt; }
  .res-article h2 { font-size: 13pt; page-break-after: avoid; }
  p, li { font-size: 10.5pt; line-height: 1.55; }
  a { color: inherit; text-decoration: none; }
`;

(async () => {
  const br = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
  const page = await br.newPage();

  for (const [adresse, sortie, titre] of GUIDES) {
    fs.mkdirSync(require('path').dirname(sortie), { recursive: true });
    await page.goto(BASE + adresse, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: IMPRESSION });
    await page.pdf({
      path: sortie,
      format: 'A4',
      margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font:8pt Helvetica;color:#8b857a;width:100%;padding:0 18mm">AgenIA · www.agenia.pro</div>',
      footerTemplate:
        '<div style="font:8pt Helvetica;color:#8b857a;width:100%;padding:0 18mm;display:flex;justify-content:space-between">' +
        '<span>' + titre.replace(/'/g, '&rsquo;') + '</span><span class="pageNumber"></span></div>',
    });
    console.log('PDF écrit : ' + sortie);
  }

  await br.close();
})();
