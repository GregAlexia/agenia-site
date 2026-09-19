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

   L'impression retire l'en-tête, le pied de page, le formulaire et le bloc
   « À lire ensuite » : un PDF qui contient le formulaire qu'on vient de
   remplir a l'air d'une erreur, et des liens de navigation morts sur papier
   n'aident personne.
   ============================================================ */
const { chromium } = require('playwright');

const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const BASE = process.env.BASE_URL || 'http://localhost:8420';

const GUIDES = [
  ['20-taches-a-automatiser', '20 tâches à automatiser en premier'],
  ['auditer-process-pme', "Auditer ses process avant d'automatiser"],
  ['calculer-roi-automatisation', "Calculer le ROI d'une automatisation"],
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

  for (const [slug, titre] of GUIDES) {
    await page.goto(BASE + '/ressources/' + slug + '.html', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: IMPRESSION });
    await page.pdf({
      path: 'ressources/pdf/' + slug + '.pdf',
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
    console.log('PDF écrit : ressources/pdf/' + slug + '.pdf');
  }

  await br.close();
})();
