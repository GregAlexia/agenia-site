# Agenia — Site vitrine

Site vitrine de **Agenia** ([www.agenia.pro](https://www.agenia.pro)), agence
d'intelligence artificielle et d'automatisation pour PME et ETI.

Site statique (HTML / CSS / JS, sans build ni dépendance), déployé
automatiquement sur **GitHub Pages** à chaque push sur `main`.

## Structure

**Pages publiques** — neuf, toutes autonomes, toutes avec le même en-tête et le
même pied de page :

| Fichier | Rôle |
|---------|------|
| `index.html` | Page de vente principale, à ancres (`#services`, `#methode`, `#resultats`, `#secteurs`, `#produit`, `#faq`, `#contact`) |
| `demo-margeo.html` · `demo-keo.html` · `essai-outils.html` | Les trois produits : contenu déverrouillé contre coordonnées, avant d'ouvrir l'application |
| `ressources/index.html` + 3 articles | Guides, même déverrouillage |
| `mentions-legales.html` | Mentions et confidentialité (ancre `#confidentialite`) |

**Espace interne** — `documentation/`, fermé au seul compte administrateur :

| Fichier | Rôle |
|---------|------|
| `documentation/index.html` | Le guide ZénithIA, lu en base après connexion |
| `documentation/statistiques.html` | Audience du site et prospects collectés |
| `documentation/acces.js` | Connexion et réinitialisation, **partagé par les deux pages** |
| `documentation/style.css` | Feuille propre à l'espace interne |

**Communs** :

| Fichier | Rôle |
|---------|------|
| `styles.css` | Design du site public (thème sombre, dégradés, responsive, animations) |
| `script.js` | Menu mobile, apparition au scroll, formulaire — **et la mesure d'audience** |
| `ressources/gate.js` | Le déverrouillage contre coordonnées, commun aux sept pages qui en ont un |
| `.github/workflows/deploy-pages.yml` | Déploiement automatique sur GitHub Pages |
| `REFERENCEMENT.md` | Ce qui est en place pour le SEO (sitemap, canonical, données structurées) et la procédure Search Console |

Le site n'a **ni build ni dépendance** : ce qui est dans le dépôt est
exactement ce qui est servi. Un fichier modifié est en ligne en une à deux
minutes, sans étape intermédiaire — c'est la contrepartie de devoir répéter
l'en-tête et le pied de page dans neuf fichiers.

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

## Reste à ajuster

- **Chiffres de la page de vente** (-70 %, ×3, etc.) : illustratifs, à remplacer
  par des résultats réels dès qu'il y en a.

Le formulaire, l'email et le téléphone, eux, sont en service.

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
avec l'origine : contact, Margeo, démo Keo, outils, ressources). Les résultats
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

Une écriture dans `documentation_contenu.html` suffit. Il n'y a plus rien à
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
