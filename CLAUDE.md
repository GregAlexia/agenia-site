# agenia.pro — instructions de travail

Site vitrine d'**AgenIA**, agence d'IA et d'automatisation pour PME et ETI.
HTML / CSS / JS statique, **sans build ni dépendance**, servi par GitHub Pages
sur `www.agenia.pro`. **Écrire en français** — code, commentaires, commits,
interface : le site s'adresse à des dirigeants français.

Le `README.md` décrit *ce qu'est* le site. Ce fichier-ci dit *comment y
travailler* : les règles, et les pièges qui ont chacun coûté un incident.

---

## Git

Branche unique : **`main`**. Pousser sur `main`, c'est déployer — le workflow
`deploy-pages.yml` met en ligne en une à deux minutes. Il n'y a pas de
pré-production : relire avant de pousser est la seule barrière.

**Ne jamais réécrire l'historique.** Pas de force-push, pas de `rebase -i`
destructif. **Ne pas créer de pull request** sauf demande explicite. Messages de
commit en français, expliquant le **pourquoi** — le diff dit déjà le quoi. Ne
jamais y mentionner de nom de modèle.

---

## Anonymat du propriétaire — non négociable

**Le nom du propriétaire n'apparaît nulle part sur ce site**, ni dans le HTML,
ni dans un commentaire, ni dans un commit, ni dans les mentions légales.
L'entreprise s'y présente sous sa raison sociale et son numéro RCS, jamais sous
un nom de personne. Vérifier avant de pousser tout texte qui parle de « qui »
est derrière AgenIA.

---

## Le piège de fond : onze fichiers, un seul en-tête

Il n'y a pas de gabarit. L'en-tête, la navigation, le menu mobile et le pied de
page sont **répétés dans les onze pages publiques** :

```
index.html · demo-margeo.html · demo-prospeo.html · demo-keo.html
demo-planeo.html · essai-outils.html · mentions-legales.html
ressources/index.html
ressources/20-taches-a-automatiser.html · ressources/auditer-process-pme.html
ressources/calculer-roi-automatisation.html
```

La **grille des ressources** est dupliquée de la même façon, entre l'accueil
(`#guides`) et `ressources/index.html`.

Le bloc `<nav class="social">` du pied de page l'est aussi — mais il fait
exception : ses adresses étant absolues, il est **strictement identique dans les
onze fichiers**, sans variante en `../`. Un compte ajouté se recopie tel quel.

Toucher à la navigation sans les traiter toutes laisse un site incohérent, sans
erreur ni test rouge pour le signaler. **Après toute modification de
navigation, compter les occurrences** — et attention aux chemins : les pages de
`ressources/` pointent en `../`, les autres à la racine.

C'est le prix assumé de l'absence de build : ce qui est dans le dépôt est
exactement ce qui est servi.

---

## La gamme : quatre logiciels, et ce qu'on promet de chacun

**Margeo** (marges, restauration) · **Prospeo** (prospection) · **Keo** (agence
immobilière) · **Planeo** (visualisation 3D de plans). **Sans accent** — tranché
par le propriétaire le 3 septembre 2026 : c'est ce que portent les URL, et ce qui
se dicte au téléphone. L'application, elle, s'écrit encore « Margéo » dans son
propre dépôt ; c'est le site qui fait foi sur le nom.

**Un produit n'a de page à portail que s'il ouvre vraiment.** Annoncer une démo
qui n'existe pas coûte un prospect déçu, et une seule fois suffit à le perdre.
Trois des quatre ouvrent aujourd'hui — Margeo, Keo et Planeo.

**Prospeo ne renvoie vers aucune application.** La seule qui existe s'annonce
*outil interne*, sans marque ni contrôle d'accès : la lier depuis un site
commercial l'exposerait. Sa page recueille donc une demande d'accès, ouverte à la
main. Le jour où une version publique existe, c'est un `href` à changer.

**Vérifier avant de conclure qu'un produit est fermé.** Planeo a été annoncé
« bientôt » pendant une matinée, alors que sa démo tournait déjà sur
`planeo-3d.vercel.app`. La liste des projets Vercel du compte est la source qui
tranche — pas le souvenir qu'on en a.

---

## Content-Security-Policy

Chaque page porte sa CSP en `<meta http-equiv>`. Deux conséquences :

- **Un nouvel hôte contacté doit être ajouté à `connect-src`** de toutes les
  pages concernées, sinon la requête est refusée en silence côté navigateur.
  Aujourd'hui : `api.web3forms.com` et le projet Supabase. Les lecteurs vidéo
  demandent en plus **`frame-src https://www.youtube-nocookie.com`** sur
  `index.html` : `frame-src` non déclaré retombe sur `default-src 'self'`, donc
  l'iframe est bloquée.
- **`style-src` doit garder `'unsafe-inline'`.** Sans lui, toute largeur posée
  en JavaScript est ignorée — les barres de jauge des statistiques ne s'étaient
  pas affichées, sans la moindre erreur visible — et le contenu importé de la
  documentation perdrait sa mise en forme.

---

## Les démos vidéo ne chargent rien avant le clic

Les cartes produits **et les pages produit** portent une **façade** : un cadre
16/9 en HTML statique, que `script.js` remplace par un lecteur `youtube-nocookie`
**au clic seulement**. Sur les pages produit elle vit dans `#contenu`, donc
derrière le portail : la vidéo est ce qu'on obtient en laissant ses coordonnées,
pas ce qu'on voit avant.

Les quatre produits en ont une. Si un cinquième arrivait sans vidéo, **ne pas
laisser sa carte vide** : la grille s'aligne sur la carte la plus haute, et un
vide s'y lit comme un défaut plutôt que comme une absence — le cadre en
pointillés qu'a porté Prospeo une journée est dans l'historique.

Ce n'est pas une optimisation, c'est une contrainte. Le site ne pose aucun
cookie et s'en prévaut — l'écran des statistiques affiche « comptage sans cookie
ni identifiant de visiteur », et il n'y a donc pas de bandeau de consentement.
Un lecteur YouTube chargé d'office déposerait des traceurs tiers avant tout
consentement, rendrait cette phrase fausse et exigerait le bandeau. **Ne jamais
remplacer la façade par une iframe posée directement dans le HTML.**

La façade n'appelle pas non plus la vignette YouTube : `i.ytimg.com` est un
tiers comme un autre.

**Le son part coupé** (`mute=1`). Une vidéo qui se met à parler dans un bureau
ou un transport se referme aussitôt, et le visiteur est perdu. C'est aussi ce
qui rend `autoplay` fiable : les navigateurs refusent la lecture automatique
avec son. La façade l'annonce — sans quoi on croit la vidéo muette et on ne
pense pas à rétablir le son.

⚠️ **Piège de mise en page** : `#produit .card` est un flex colonne en
`align-items: flex-start`, qui rétrécit ses enfants. La largeur de la façade est
restaurée par la règle `#produit .card > p…, .card__list, #produit .demo` — un
nouvel élément pleine largeur dans ces cartes doit y être ajouté, sinon il
s'affiche à la largeur de son texte.

---

## Espace interne (`documentation/`)

Quatre pages, un seul module d'accès (`acces.js`) : le guide, le playbook de
prospection, les statistiques et l'audit. **Un onglet ajouté doit l'être dans les
quatre** — c'est le même piège que l'en-tête des pages publiques, en plus petit.

- **Un seul compte y entre.** Une politique RLS Supabase n'ouvre le contenu
  qu'à l'adresse administrateur, et la fonction de statistiques refuse tout
  autre appelant. La clé publique du dépôt ne donne accès à rien en lecture.
- **L'adresse du compte ne s'affiche jamais.** Le champ s'appelle « compte »,
  pas « email ». C'est une demande explicite : l'information reste
  confidentielle. Ne pas la réintroduire, même dans un message d'aide.
- **La réinitialisation passe par un code à 6 chiffres, jamais par un lien.**
  Ce point a coûté plusieurs allers-retours : un lien de récupération Supabase
  ouvre l'URL de l'application *Margeo*, parce qu'une adresse de redirection
  absente de la liste blanche du projet est **ignorée en silence** au profit de
  la Site URL. Le code supprime la dépendance entière. **agenia.pro et Margeo
  sont deux applications à gérer indépendamment** — ne jamais réintroduire de
  lien de l'une vers l'authentification de l'autre.

### Les documents vivent en base, compressés

Table `documentation_pages`, une ligne par document (`cle` = `guide`,
`prospection`). Ils y sont rangés en **gzip puis base64** : la colonne reste du
texte, donc écrivable par n'importe quel outil SQL, et il transite trois fois
moins d'octets. `acces.js` expose `outils.decompresser`, qui reconnaît le format
à la lecture — un contenu commençant par `<` est du HTML tel quel. Écrire du HTML
en clair reste donc valide.

**Un document apporte souvent sa propre feuille de style.** Elle doit être
cloisonnée sous `#doc` avant d'être stockée, sinon ses règles `body` et `:root`
repeignent la page entière, barre de navigation comprise. Attention aux trois
pièges rencontrés en important le playbook : retirer les commentaires CSS
**avant** de préfixer (sinon le préfixe se colle au commentaire et le sélecteur
suivant reste global), traiter aussi ce qui suit une requête média, et supprimer
les blocs `prefers-color-scheme: dark` — l'espace interne est en clair, un
article qui bascule seul donnerait un encart noir au milieu du blanc.

**Un `<script>` injecté par `innerHTML` ne s'exécute jamais.** Le comportement
qui accompagne un document (boutons « Copier », replis…) vit donc dans le
fichier `.js` de la page.

### Transférer un document volumineux

La base n'est joignable que par un canal qui ne transporte que des requêtes SQL,
et **une recopie manuelle altère silencieusement des caractères** : quatre l'ont
été en important le playbook, pour une longueur pourtant identique. Donc
**toujours vérifier `md5(html)` contre l'empreinte locale** après écriture, et
bisecter par `md5(substr(...))` en cas d'écart plutôt que de tout renvoyer.

---

## Secrets

**Aucun secret dans le dépôt.** Deux clés y figurent pourtant, et légitimement :

| Clé | Pourquoi elle peut être publique |
|---|---|
| Web3Forms | Le service ne délivre qu'à l'adresse propriétaire de la clé. La copier ne permet que de vous écrire |
| Supabase `sb_publishable_…` | Les policies n'autorisent que l'insertion dans deux tables. Elle ne lit rien |

Toute autre clé — service role, jeton d'API, chaîne de connexion — n'a rien à
faire ici. Et ce qui coûte de l'argent ou envoie un email se vérifie **avant**
d'être déclenché, jamais après.

---

## Vérifier

**Il n'y a pas de CI** : personne ne lancera de contrôle à votre place, et le
push déploie directement.

```bash
python3 -m http.server 8420      # puis http://localhost:8420
```

Pour l'espace interne, la seule vérification qui tranche est un pilotage
Playwright avec les réponses Supabase simulées : c'est ce qui a révélé, là où la
relecture n'avait rien vu, qu'un `display:flex` posé sur `#portail` battait
l'attribut `[hidden]` — le portail de connexion restait affiché **par-dessus**
le contenu après une connexion réussie. D'où la règle : `#portail[hidden] {
display: none; }`, et plus généralement **un identifiant qui pose un `display`
doit reprendre son cas `[hidden]`**.

Autre piège de test : rejouer la même page en ne changeant que le `#fragment`
ne réexécute pas le script. Ouvrir une page neuve par scénario.

**`documentation/audit.html` contrôle le site en continu** — cohérence des menus,
liens morts, CSP, sitemap, intégrité des portails, vivacité de la collecte.
L'ouvrir après une modification structurelle coûte dix secondes et remplace une
relecture. Et un audit vert doit rester capable de virer au rouge : le vérifier
en injectant une faute, puis en la retirant.

---

## Style

**Les commentaires expliquent le pourquoi, jamais le quoi.** Le code dit déjà ce
qu'il fait ; un commentaire utile porte la décision, l'alternative écartée ou le
piège évité. Écrire dans le style du fichier environnant.

Le JavaScript est en **ES5 dans une IIFE** (`var`, `function`, pas de module) —
c'est la convention de tous les fichiers du site, la suivre plutôt que
d'introduire une syntaxe plus récente au cas par cas.
