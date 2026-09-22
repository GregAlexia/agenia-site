/* ============================================================
   Régénère les images de partage depuis outils/og-image.html.

       assets/og-image.jpg      français
       assets/og-image-en.jpg   anglais

   Mode d'emploi — à relancer après tout changement d'accroche :

     cd <racine du dépôt>
     python3 -m http.server 8420 &
     node outils/faire-og.cjs

   Il faut Playwright et un Chromium ; CHROMIUM_PATH permet de désigner le
   binaire quand Playwright ne le trouve pas seul.

   La capture se fait à l'échelle 1, en JPEG directement : sans bibliothèque
   d'images dans l'environnement, capturer en 2400 px puis réduire n'est pas
   possible, et 1200 px suffit largement — les réseaux sociaux affichent cette
   image autour de 600 px de large.

   ⚠️ Les réseaux mettent l'image en cache, parfois des semaines. Après une
   régénération, forcer la relecture par leur outil de débogage plutôt que
   conclure que le déploiement a échoué.
   ============================================================ */
const { chromium } = require('playwright');

const CHROMIUM = process.env.CHROMIUM_PATH || undefined;
const BASE = process.env.BASE_URL || 'http://localhost:8420';

const IMAGES = [
  ['', 'assets/og-image.jpg'],
  ['?lang=en', 'assets/og-image-en.jpg'],
];

(async () => {
  const br = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
  const ctx = await br.newContext({ viewport: { width: 1200, height: 630 } });

  for (const [param, sortie] of IMAGES) {
    const page = await ctx.newPage();
    await page.goto(BASE + '/outils/og-image.html' + param, { waitUntil: 'networkidle' });
    // Les fontes sont auto-hébergées : sans cette attente, la capture peut
    // partir avec la police de repli, ce qui ne se voit qu'une fois en ligne.
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: sortie, type: 'jpeg', quality: 88 });
    console.log('écrit : ' + sortie);
    await page.close();
  }

  await br.close();
})();
