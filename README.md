# Agenia — Site vitrine

Site vitrine de **Agenia** ([www.agenia.pro](https://www.agenia.pro)), éditeur de
logiciels IA pour PME et ETI — et, quand aucun produit ne convient, concepteur de
solutions sur mesure.

Site statique (HTML / CSS / JS, sans build ni dépendance), déployé
automatiquement sur **GitHub Pages** à chaque push sur `main`.

## Structure

**Pages publiques françaises** — douze, toutes autonomes, toutes avec le même en-tête et le
même pied de page, et **toutes indexables** depuis le 19 septembre 2026 :

| Fichier | Rôle |
|---------|------|
| `index.html` | Page de vente principale, à ancres (`#services`, `#methode`, `#resultats`, `#secteurs`, `#produit`, `#faq`, `#contact`) |
| `demo-margeo.html` · `demo-prospeo.html` · `demo-keo.html` · `demo-planeo.html` | Une page de vente par produit. Le contenu est public ; seuls la vidéo et l'accès à l'application se déverrouillent contre coordonnées |
| `essai-outils.html` | Les huit calculateurs gratuits, décrits en clair ; le lien d'ouverture est déverrouillé |
| `agence-ia-haute-savoie.html` | Page de référencement local : Annecy, le Genevois, la Haute-Savoie |
| `ressources/index.html` + 3 articles | Guides, lisibles en entier ; c'est la version PDF qui est déverrouillée |
| `ressources/pdf/` | Les trois guides en PDF, régénérés depuis les pages elles-mêmes |
| `mentions-legales.html` | Mentions et confidentialité (ancre `#confidentialite`) |

**Version anglaise** — `en/`, ouverte le 20 septembre 2026 : les douze mêmes
pages, à plat dans un seul dossier, avec des adresses en anglais.

| Fichier `en/` | Page française correspondante |
|---------------|-------------------------------|
| `index.html` | `index.html` |
| `margeo.html` · `prospeo.html` · `keo.html` · `planeo.html` | les quatre `demo-*.html` |
| `free-tools.html` | `essai-outils.html` |
| `ai-agency-geneva-haute-savoie.html` | `agence-ia-haute-savoie.html` |
| `resources.html` | `ressources/index.html` |
| `20-tasks-to-automate.html` · `audit-before-you-automate.html` · `automation-roi.html` | les trois guides de `ressources/` |
| `legal-notice.html` | `mentions-legales.html` |

Chaque page déclare sa jumelle en `hreflang`, **dans les deux sens**, et porte
dans son en-tête un lien vers elle — vers la **même page** dans l'autre langue,
jamais vers l'accueil. Le français reste le `x-default`.

Trois choses **ne sont pas** dupliquées, et c'est voulu : `styles.css`,
`script.js` et `ressources/gate.js` sont partagés (les pages de `en/` les
appellent en `../`), les textes d'interface des deux scripts se choisissant sur
`<html lang>`. `documentation/` n'a pas de version anglaise : c'est un espace
interne.

Deux différences assumées avec le français : la page locale est **réorientée**
vers les entreprises anglophones du bassin genevois plutôt que traduite mot pour
mot — personne ne cherche « AI agency Haute-Savoie » en anglais — et les trois
guides anglais **n'ont pas encore de PDF**, donc pas de formulaire de
téléchargement (voir « Régénérer les PDF » plus bas).

**Espace interne** — `documentation/`, fermé au seul compte administrateur :

| Fichier | Rôle |
|---------|------|
| `documentation/index.html` | Le guide ZénithIA, lu en base après connexion |
| `documentation/prospection.html` | Le playbook de cold mailing vers les artisans |
| `documentation/statistiques.html` | Audience du site, prospects collectés, export tableur et suppression |
| `documentation/audit.html` | Audit technique et fonctionnel, **exécuté à chaque ouverture** |
| `documentation/referencement.html` | Le plan de référencement : pourquoi chaque action, et comment la faire |
| `documentation/acces.js` | Connexion, réinitialisation et décompression, **partagé par les cinq pages** |
| `documentation/style.css` | Feuille propre à l'espace interne |

**Communs** :

| Fichier | Rôle |
|---------|------|
| `styles.css` | Design du site public (thème sombre, dégradés, responsive, animations) |
| `script.js` | Menu mobile, apparition au scroll, formulaire — **et la mesure d'audience** |
| `ressources/gate.js` | Le déverrouillage contre coordonnées, commun aux neuf pages qui en ont un |
| `.github/workflows/deploy-pages.yml` | Déploiement automatique sur GitHub Pages |
| `outils/og-image.html` | Gabarit de l'image de partage. **Non liée depuis le site** : c'est un outil, pas une page |
| `outils/faire-pdf.cjs` | Régénère les PDF des guides depuis les pages elles-mêmes |
| `_redirects` | Ce que l'hébergeur ne doit **pas** servir : notes de travail et outils. Lu par Cloudflare Pages |
| `REFERENCEMENT.md` | La stratégie de référencement, les requêtes visées page par page, et ce qui reste à faire à la main |

Le site n'a **ni build ni dépendance** : ce qui est dans le dépôt est
exactement ce qui est servi. Un fichier modifié est en ligne en une à deux
minutes, sans étape intermédiaire — c'est la contrepartie de devoir répéter
l'en-tête et le pied de page dans vingt-quatre fichiers.

## Modifier le site depuis n'importe quel PC

1. Éditez les fichiers (directement sur github.com via le crayon ✏️, ou en
   clonant le dépôt : `git clone https://github.com/GregAlexia/agenia-site`).
2. Poussez sur `main` (ou validez la modif sur github.com).
3. Le workflow GitHub Pages redéploie automatiquement en 1–2 minutes.

## Aperçu en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## La gamme mise en avant

AgenIA édite quatre logiciels — **Margeo** (marges en restauration), **Prospeo**
(prospection commerciale), **Keo** (gestion d'agence immobilière) et **Planeo**
(visualisation 3D de plans de construction). Le 31 août 2026, la section produits
est remontée juste après l'accroche : c'est elle qu'on vient voir désormais, le
conseil sur mesure restant plus bas, comme ce qui a rendu ces produits possibles.

La carte « Huit calculateurs gratuits » a quitté la section produits le
3 septembre pour la section **Ressources**, où elle est à sa place : ce n'est pas
un produit, c'est une porte d'entrée gratuite. Les deux grilles y gagnent — quatre
logiciels d'un côté, quatre ressources de l'autre, deux lignes de deux chacune.

⚠️ **La grille des ressources existe en double** : sur l'accueil (`#guides`) et
sur `ressources/index.html`. Une ressource ajoutée d'un seul côté passe
inaperçue — l'audit ne le voit pas, les deux pages restant valides.

Deux règles tenues dans les cartes :

- **Pas de portail sans produit ouvert.** Une démo annoncée qui n'existe pas ne
  se rattrape pas auprès du visiteur qui l'a cliquée. Corollaire découvert le
  31 août : vérifier avant de conclure qu'un produit est fermé — Planeo a porté
  un « bientôt » pendant une matinée alors que sa démo tournait déjà.
- **Pas de lien vers un outil interne.** Prospeo recueille une demande d'accès
  ouverte à la main, parce que la seule application de prospection en ligne
  aujourd'hui s'annonce « outil interne », sans marque ni contrôle d'accès.

## Le prix : aucun, volontairement

Margeo a affiché « à partir de 149 € HT/mois » le 31 août ; le propriétaire l'a
retiré le 3 septembre. **Ne pas le réintroduire sans demande explicite.**

Si la question revient : le prix reste consultable sur la page tarifs de
l'application (`Landing.tsx`, offre Solo à 149 €, Multi à 249 €). Le jour où un
prix réapparaît ici, il doit venir de là — deux prix différents pour le même
produit se paient au premier prospect qui les compare.

## Reste à ajuster

- **Chiffres de la page de vente** (-70 %, ×3, < 6 sem.) : ce sont des **ordres
  de grandeur**, et la page le dit désormais explicitement, deux fois. À
  remplacer par des résultats réels dès qu'il y en a — un chiffre sourcé vaut
  trois chiffres ronds, et un chiffre non étayé sur une page de vente est une
  pratique commerciale trompeuse au sens du code de la consommation.
- **Prix de Prospeo, Keo et Planeo**, quand ils seront arrêtés.

Le formulaire, l'email et le téléphone, eux, sont en service.

## Les démos vidéo

Les quatre cartes produits et les quatre pages produit portent leur vidéo de
démonstration.

Le cadre est une **façade** : rien n'est demandé à YouTube avant le clic, pas
même la vignette. Le détail et la raison — le site ne pose aucun cookie et s'en
prévaut — sont dans `CLAUDE.md`.

Sur les pages produit, la façade vit derrière le portail : la vidéo est ce qu'on
obtient en laissant ses coordonnées.

**Le son part coupé**, et la façade le dit. Le visiteur rétablit le son d'un
clic sur le lecteur.

Les vidéos sont hébergées sur la chaîne YouTube d'AgenIA. **Une vidéo passée en
« privée » afficherait « Vidéo non disponible »** sur la page d'accueil : le
réglage qui convient est « non répertoriée », qui s'intègre sans apparaître dans
la recherche.

## L'aperçu de partage

Ce qui s'affiche quand quelqu'un colle l'adresse dans LinkedIn, WhatsApp ou
Slack : `og:title`, `og:description` et surtout **`assets/og-image.jpg`**, la
seule moitié qu'on regarde vraiment.

**Ces trois éléments doivent dire la même chose que l'accroche de la page.** Un
titre de partage qui promet autre chose que ce qu'on lit en arrivant fait
repartir — et l'image, elle, avait gardé le positionnement d'agence pendant deux
refontes d'accroche, sans que rien ne le signale : aucun contrôle ne lit une
image.

Pour la régénérer, `outils/og-image.html` est son gabarit — mêmes fontes et
mêmes teintes que le site, le mode d'emploi est dans son en-tête.

⚠️ **Les réseaux sociaux mettent l'image en cache**, parfois des semaines. Après
un changement, forcer la relecture par leur outil de débogage plutôt que
conclure que le déploiement a échoué.

## Les réseaux sociaux

Le pied de page des douze pages porte cinq icônes — Facebook, Instagram,
YouTube, Pinterest, LinkedIn — qui ouvrent les comptes d'AgenIA dans un
nouvel onglet. **L'ordre est celui d'ajout des comptes**, choisi par le
propriétaire : un compte qui arrive se met à la suite, il ne se classe pas.

Chaque compte ajouté ici doit l'être **aussi dans le `sameAs`** des données
structurées de l'accueil, sinon c'est un signal de plus perdu pour distinguer
AgenIA de ses homonymes (voir `REFERENCEMENT.md`).

Les icônes sont des **SVG écrits dans le HTML** : aucune requête
supplémentaire, aucune fonte d'icônes, et la couleur suit le texte
(`fill: currentColor`), donc elles s'adaptent seules si la palette change.

Le bloc est **rigoureusement identique dans les douze fichiers** parce que les
adresses sont absolues : contrairement à la navigation, il n'a pas de variante
en `../` pour les pages de `ressources/`. Un compte ajouté se copie donc tel
quel partout.

## Formulaires (Web3Forms)

Les formulaires envoient par email via [Web3Forms](https://web3forms.com)
(250 messages/mois, sans compte). La clé d'accès est **publique par
construction** : Web3Forms ne sait délivrer qu'à l'adresse propriétaire de la
clé, `contact@agenia.pro`. Quelqu'un qui la copie ne peut donc que vous écrire.
C'est aussi pourquoi elle sert de mailer à `documentation_demander_code()` côté
Postgres : un code de réinitialisation ne peut structurellement pas partir
ailleurs.

## Mesure d'audience et prospects

`script.js` écrit **directement dans Supabase** : une ligne par page vue
(`site_agenia_vues`), une ligne par formulaire abouti (`site_agenia_prospects`,
avec l'origine : contact, Margeo, Prospeo, Keo, Planeo, outils, ressources). Les résultats
se lisent sur `documentation/statistiques.html`.

Quatre propriétés qui ne sont pas des détails :

- **Écriture seule.** Les policies n'autorisent que l'insertion. Ces tables sont
  illisibles depuis le navigateur, y compris avec la clé publique du dépôt ; la
  lecture passe par une fonction agrégée réservée au compte administrateur.
- **Jamais bloquant.** Une erreur réseau ne doit empêcher ni l'affichage d'une
  page ni l'aboutissement d'un formulaire. Web3Forms reste l'envoi principal,
  celui qui prévient par email ; la base n'est là que pour le décompte.
- **Sans passer par une autre application.** Ces écritures transitaient d'abord
  par des routes de Margeo. Le 24 août 2026 on a relevé **zéro ligne
  collectée** : la production de cette autre application était restée sur du
  code où les routes n'existaient pas, le pré-vol CORS échouait, et le POST
  n'était jamais émis. Aucune alerte — une mesure silencieusement morte est pire
  que pas de mesure, puisqu'on la croit vraie. Écrire en direct a supprimé la
  panne **et sa cause** : les deux produits ne se conditionnent plus.
- **La liste des origines est fermée**, côté base. Ajouter une page à portail
  demande donc trois gestes solidaires : la source dans `ressources/gate.js`, le
  libellé dans `documentation/statistiques.js`, et **une migration** qui étend la
  contrainte de la policy d'insertion. Sans le troisième, la ligne est rejetée et
  le prospect perdu sans erreur visible — l'écriture étant volontairement non
  bloquante.

## Exporter et supprimer des prospects

L'écran des statistiques permet de cocher des visiteurs, de les **exporter** et
de les **supprimer**. Deux décisions valent d'être connues.

**L'export produit un CSV, pas un `.xlsx`.** Un vrai classeur Excel est un ZIP de
fichiers XML, qu'on ne fabrique pas sans bibliothèque — et la CSP du site
n'autorise aucun script externe. Le CSV est donc calibré pour Excel français :
BOM UTF-8 (sans lui, Excel lit en ANSI et massacre les accents) et
point-virgule comme séparateur. Il s'ouvre par double-clic. Les retours à la
ligne d'un message sont aplatis, les guillemets doublés.

Sans sélection, l'export prend tout : c'est le geste attendu quand on clique
« exporter » sans avoir rien coché.

**La suppression passe par une fonction, pas par une policy DELETE.** La table
n'a volontairement aucune policy de lecture ; ouvrir une porte d'écriture en
créerait une seconde à surveiller. `site_agenia_supprimer_prospects(uuid[])` est
gardée comme la fonction de statistiques — hors du compte administrateur, elle
lève `42501` — et **un tableau vide ne supprime rien**, sans quoi un appel
malformé viderait la table en silence. Après suppression l'écran se recharge :
retirer les lignes à la main laisserait les totaux faux sans que rien ne le dise.

Côté RGPD, c'est ce qui rend l'effacement praticable : une demande de suppression
se traite en deux clics, là où il fallait auparavant intervenir en base.

## Audit du site (/documentation/audit.html)

Un audit qui **s'exécute** plutôt qu'un rapport qui se rédige. Il relit les pages
réellement servies et rend son verdict à chaque ouverture ; un rapport écrit
serait juste le jour de sa rédaction, puis faux sans prévenir — et il rassurerait
d'autant plus.

Il **explore** au lieu de lister : il part de l'accueil et suit les liens. Une
liste de pages inscrite dans le code oublierait une page nouvelle exactement
comme l'en-tête l'oublie — le défaut qu'il est censé attraper. Ce qu'il contrôle
est donc ce que le site expose.

Ce qu'il vérifie : cohérence des deux menus page à page, titres et
méta-descriptions, canoniques, viewport, CSP (dont la présence des hôtes
réellement contactés), liens internes morts, sitemap contre pages indexables,
textes alternatifs, intégrité des portails (formulaire, clé Web3Forms, case de
consentement, contenu bien masqué à l'arrivée), et enfin **la chaîne de collecte
vue depuis la base** — c'est le seul contrôle qui distingue une mesure vivante
d'une mesure morte.

Ce qu'il ne voit pas est écrit en bas de la page, et cela n'est pas décoratif :
un audit qui tait ses angles morts est plus dangereux qu'un audit absent.

## Documentation interne (/documentation)

La page s'ouvre avec le **compte administrateur du site**, et lui seul. Le
contenu du guide n'est plus dans ce dépôt : il vit dans la base Supabase, table
`documentation_contenu`, dont une politique RLS n'en autorise la lecture qu'à ce
compte. La page ne fait que l'afficher après connexion.

### Pourquoi ce modèle a remplacé le précédent

L'ancienne version chiffrait le guide avec une clé **dérivée du mot de passe**.
C'était solide, mais cela liait le contenu au mot de passe : celui-ci perdu, le
guide devenait définitivement illisible — ce qui est arrivé le 24 août 2026. Le
bloc chiffré d'origine n'a pas été détruit, il reste dans l'historique Git
(commit `f244f29`) et redeviendrait exploitable si le mot de passe refaisait
surface.

Désormais le mot de passe n'ouvre que le compte ; le contenu, lui, ne dépend
plus de lui. Le perdre ne fait plus rien perdre.

### Mot de passe oublié

Bouton **« Mot de passe oublié ? »** sur la page : un code à 6 chiffres part
vers l'adresse du compte, à saisir sur place avec le nouveau mot de passe.
Aucun lien, aucune redirection — donc rien qui dépende de la configuration
d'une autre application.

Deux fonctions Postgres portent ce parcours (migrations `documentation_agenia_*`
du projet Supabase) :

| Fonction | Rôle |
|---|---|
| `documentation_demander_code()` | Tire un code aléatoire, n'en conserve que l'empreinte SHA-256, et l'envoie par email. **N'accepte aucune adresse en paramètre** : la destination est fixée côté serveur, un appelant ne peut donc pas détourner le code vers la sienne |
| `documentation_reinitialiser(code, mdp)` | Vérifie le code, puis pose le nouveau mot de passe (bcrypt, coût 10) |

Garde-fous : un envoi par minute, code valable 15 minutes, usage unique, cinq
tentatives au plus — la tentative est décomptée **avant** la vérification, sans
quoi un code faux ne coûterait rien et la recherche exhaustive redeviendrait
possible.

### Ce que contient la page

Le **guide consolidé ZénithIA** — la synthèse des échanges de la communauté,
190 Ko de HTML, 29 chapitres, 49 tableaux et 214 ancres.

Il est rangé **compressé** : gzip puis base64. C'est 76 Ko au lieu de 190 sur le
réseau, et la colonne reste du texte, donc transportable par n'importe quel
outil SQL. `documentation.js` reconnaît le format à la lecture plutôt qu'à un
drapeau en base : un contenu qui commence par `<` est du HTML tel quel, tout
autre est décodé puis décompressé par `DecompressionStream("gzip")`.

### Mettre le contenu à jour

Une écriture dans `documentation_pages.html`, à la bonne clé, suffit. Il n'y a plus rien à
chiffrer, à recompiler ni à redéployer : la page lit la base à chaque ouverture.
Y écrire du HTML en clair fonctionne aussi — c'est le sens de la détection
ci-dessus.

Trois clés aujourd'hui : `guide`, `prospection`, `referencement`. La colonne
`titre` est **obligatoire**.

⚠️ **Le contenu ne doit jamais être écrit dans le fichier `.html` de la page.**
Le dépôt est public et servi tel quel&nbsp;: l'attribut `[hidden]` cache le bloc
à l'œil, pas au téléchargement. Ce qui protège ces documents, c'est la politique
RLS de la base — rien d'autre.

## Domaine personnalisé (optionnel)

Pour servir le site sur `www.agenia.pro` :

1. Repo → **Settings → Pages → Custom domain** : saisir `www.agenia.pro`.
2. Chez votre registrar, créer un enregistrement **CNAME** `www` → `gregalexia.github.io`.
3. Cocher **Enforce HTTPS** une fois le certificat émis.

## Référencement (SEO)

Le site était indexable sur **trois pages**, dont les mentions légales — tout
le reste portait `noindex` parce qu'un formulaire cachait le contenu. Le
19 septembre 2026, les neuf autres ont été ouvertes : ce qui décrit un produit
ou compose un guide est public, seuls la vidéo, l'accès à l'application et la
version PDF restent derrière le formulaire. Douze pages sont maintenant
indexables.

⚠️ **C'est réversible sans bruit.** Remonter un formulaire devant un contenu, ou
réintroduire un `noindex`, ne fait rougir aucun test. Le contrôle tient en dix
secondes : ouvrir la page en navigation privée sans rien remplir.

Le détail — requêtes visées page par page, ce qu'on ne déclare pas dans les
données structurées et pourquoi, Search Console, fiche Google Business Profile,
et le dépôt GitHub à passer en privé — est dans
**[`REFERENCEMENT.md`](REFERENCEMENT.md)**.

### Régénérer les PDF des guides

Ils sont produits depuis les pages elles-mêmes, pour n'avoir qu'un seul texte à
maintenir. **Après toute modification d'un guide, relancer la génération** —
sinon le PDF promis par le formulaire décrit une version périmée de l'article.

```bash
python3 -m http.server 8420 &
node outils/faire-pdf.cjs
```

Le mode d'emploi complet est dans l'en-tête du script.

**Les trois guides anglais n'ont pas encore de PDF.** Le script ne génère que
les trois guides français, et il demande Playwright et un Chromium, absents de
la machine où la version anglaise a été écrite. Conséquence assumée : les pages
`en/20-tasks-to-automate.html`, `en/audit-before-you-automate.html` et
`en/automation-roi.html` publient l'article entier — c'est lui qui est indexé —
mais n'ont **pas** de formulaire de téléchargement, là où leurs jumelles
françaises en ont un. Le jour où les PDF existent, il faut ajouter les trois
pages à la liste `GUIDES` du script, un dossier `en/pdf/`, la ligne
`Disallow: /en/pdf/` dans `robots.txt` (même raison que pour `/ressources/pdf/`
— le PDF reprend l'article mot pour mot et lui fait concurrence dans l'index),
et remettre le bloc `#portail` / `#contenu` dans les trois pages.
