# Agenia — Site vitrine

Site vitrine de **Agenia** ([www.agenia.pro](https://www.agenia.pro)), éditeur de
logiciels IA pour PME et ETI — et, quand aucun produit ne convient, concepteur de
solutions sur mesure.

Site statique (HTML / CSS / JS, sans build ni dépendance), déployé
automatiquement sur **GitHub Pages** à chaque push sur `main`.

## Structure

**Pages publiques** — onze, toutes autonomes, toutes avec le même en-tête et le
même pied de page :

| Fichier | Rôle |
|---------|------|
| `index.html` | Page de vente principale, à ancres (`#services`, `#methode`, `#resultats`, `#secteurs`, `#produit`, `#faq`, `#contact`) |
| `demo-margeo.html` · `demo-prospeo.html` · `demo-keo.html` · `demo-planeo.html` | Un portail par produit : contenu déverrouillé contre coordonnées, avant d'ouvrir la démo |
| `essai-outils.html` | Les calculateurs gratuits, atteints depuis la section Ressources |
| `ressources/index.html` + 3 articles | Guides, même déverrouillage |
| `mentions-legales.html` | Mentions et confidentialité (ancre `#confidentialite`) |

**Espace interne** — `documentation/`, fermé au seul compte administrateur :

| Fichier | Rôle |
|---------|------|
| `documentation/index.html` | Le guide ZénithIA, lu en base après connexion |
| `documentation/prospection.html` | Le playbook de cold mailing vers les artisans |
| `documentation/statistiques.html` | Audience du site, prospects collectés, export tableur et suppression |
| `documentation/audit.html` | Audit technique et fonctionnel, **exécuté à chaque ouverture** |
| `documentation/acces.js` | Connexion, réinitialisation et décompression, **partagé par les quatre pages** |
| `documentation/style.css` | Feuille propre à l'espace interne |

**Communs** :

| Fichier | Rôle |
|---------|------|
| `styles.css` | Design du site public (thème sombre, dégradés, responsive, animations) |
| `script.js` | Menu mobile, apparition au scroll, formulaire — **et la mesure d'audience** |
| `ressources/gate.js` | Le déverrouillage contre coordonnées, commun aux neuf pages qui en ont un |
| `.github/workflows/deploy-pages.yml` | Déploiement automatique sur GitHub Pages |
| `outils/og-image.html` | Gabarit de l'image de partage. **Non liée depuis le site** : c'est un outil, pas une page |
| `REFERENCEMENT.md` | Ce qui est en place pour le SEO (sitemap, canonical, données structurées) et la procédure Search Console |

Le site n'a **ni build ni dépendance** : ce qui est dans le dépôt est
exactement ce qui est servi. Un fichier modifié est en ligne en une à deux
minutes, sans étape intermédiaire — c'est la contrepartie de devoir répéter
l'en-tête et le pied de page dans onze fichiers.

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

## Domaine personnalisé (optionnel)

Pour servir le site sur `www.agenia.pro` :

1. Repo → **Settings → Pages → Custom domain** : saisir `www.agenia.pro`.
2. Chez votre registrar, créer un enregistrement **CNAME** `www` → `gregalexia.github.io`.
3. Cocher **Enforce HTTPS** une fois le certificat émis.

## Référencement (SEO)

Voir **[`REFERENCEMENT.md`](REFERENCEMENT.md)** : ce qui est en place
(sitemap, canonical, Open Graph, données structurées) et la procédure pour
déclarer le site à Google Search Console.
