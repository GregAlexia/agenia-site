# agenia.pro — instructions de travail

Site vitrine d'**AgenIA**, agence d'IA et d'automatisation pour PME et ETI.
HTML / CSS / JS statique, **sans build ni dépendance**, servi par GitHub Pages
sur `www.agenia.pro`. **Écrire en français** — code, commentaires, commits,
noms de variables et de fichiers de travail. La seule exception est le
**contenu visible des pages de `en/`**, qui est en anglais parce que c'est sa
raison d'être ; ses commentaires HTML, eux, restent en français comme partout
ailleurs. Le site s'adresse d'abord à des dirigeants français.

Le `README.md` décrit *ce qu'est* le site. Ce fichier-ci dit *comment y
travailler* : les règles, et les pièges qui ont chacun coûté un incident.

---

## Git

Branche unique : **`main`**. Pousser sur `main`, c'est déployer — le workflow
`deploy-pages.yml` met en ligne en une à deux minutes d'ordinaire, **mais pas
toujours** : le 22/09/2026 il est resté quinze minutes sur « Déployer sur
GitHub Pages ». Il n'y a pas de pré-production : relire avant de pousser est la
seule barrière.

**« Ça ne marche pas » après un envoi ne veut pas dire que le code est faux.**
Avant de rouvrir le fichier, éliminer les deux couches qui séparent le dépôt de
l'écran : l'action est-elle terminée
(`api.github.com/repos/GregAlexia/agenia-site/actions/runs?per_page=1`, champ
`status`), et la page n'est-elle pas en cache — GitHub Pages la fait garder une
dizaine de minutes, **Ctrl+Maj+R** tranche. La passerelle réseau de l'agent
bloque `www.agenia.pro` : l'audit et les contrôles Playwright tournent sur la
copie locale servie par `python3 -m http.server`, jamais sur le site en ligne.
Ce que l'agent peut atteindre, c'est `api.github.com`, qui dit quel commit Pages
a publié (`/deployments?environment=github-pages`).

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

## Le piège de fond : vingt-quatre fichiers, un seul en-tête

Il n'y a pas de gabarit. L'en-tête, la navigation, le menu mobile et le pied de
page sont **répétés dans les vingt-quatre pages publiques** — douze en
français, douze en anglais depuis le 20 septembre 2026 :

```
index.html · demo-margeo.html · demo-prospeo.html · demo-keo.html
demo-planeo.html · essai-outils.html · agence-ia-haute-savoie.html
mentions-legales.html · ressources/index.html
ressources/20-taches-a-automatiser.html · ressources/auditer-process-pme.html
ressources/calculer-roi-automatisation.html

en/index.html · en/margeo.html · en/prospeo.html · en/keo.html
en/planeo.html · en/free-tools.html · en/ai-agency-geneva-haute-savoie.html
en/legal-notice.html · en/resources.html · en/20-tasks-to-automate.html
en/audit-before-you-automate.html · en/automation-roi.html
```

**Une page ajoutée d'un côté doit l'être de l'autre**, sans quoi son `hreflang`
pointe dans le vide. Écrire l'anglais en français, ou l'inverse, est l'erreur
qui se voit le moins : relire la page dans sa langue avant de pousser.

La **grille des ressources** est dupliquée de la même façon, entre l'accueil
(`#guides`) et `ressources/index.html`.

Le bloc `<nav class="social">` du pied de page l'est aussi — mais il fait
exception : ses adresses étant absolues, il est **strictement identique dans les
douze fichiers**, sans variante en `../`. Un compte ajouté se recopie tel quel
— et se déclare **aussi dans le `sameAs`** de l'accueil.

Toucher à la navigation sans les traiter toutes laisse un site incohérent, sans
erreur ni test rouge pour le signaler. **Après toute modification de
navigation, compter les occurrences** — et attention aux chemins : les pages de
`ressources/` pointent en `../`, celles de `en/` aussi (elles partagent
`styles.css`, `script.js` et `ressources/gate.js` avec le français, plutôt que
d'en avoir une copie), les autres pointent à la racine.

C'est le prix assumé de l'absence de build : ce qui est dans le dépôt est
exactement ce qui est servi.

**Et il faut le prendre au pied de la lettre** : le dépôt est publié en entier,
donc `CLAUDE.md`, `README.md` et les gabarits d'`outils/` sont téléchargeables
depuis le site. C'est à quoi sert `_redirects`, qui les renvoie à l'accueil —
**un document interne ajouté à la racine doit y être ajouté**. Attention, ce
fichier n'est lu que par Cloudflare Pages.

---

## Sur téléphone, c'est toujours un mot trop long

Deux règles ont fait déborder le site horizontalement, et aucune ne se voyait
sur un écran d'ordinateur.

⚠️ **`white-space: nowrap` sur `.btn`.** Un libellé long ne pouvait jamais
revenir à la ligne : il sortait de l'écran — et comme les cartes sont des
éléments de grille à `min-width: auto`, il les élargissait avec lui. Six pages
débordaient sur un iPhone SE, **une dès 375 px**, avec barre de défilement
horizontale sur tout le site. Retiré le 22/09/2026 : le retour à la ligne ne se
produit que faute de place, donc rien ne change sur grand écran.

⚠️ **`minmax(320px, 1fr)` dans une grille.** La piste fait 320 px même quand le
conteneur n'en offre que 272. Écrire **`minmax(min(320px, 100%), 1fr)`** — la
forme sans `min()` est un débordement qui attend son écran.

⚠️ **L'en-tête est collant, donc il mange le haut de toute ancre.** Sans
`[id] { scroll-margin-top }`, un lien de menu dépose le titre de la section
*derrière* la barre — mesuré à 65 px quand elle en occupe 77. Corrigé le
22/09/2026 ; la règle doit suivre si la hauteur de l'en-tête change.

**Le contrôle** : mesurer `scrollWidth − clientWidth` sur les vingt-quatre
pages, de 320 à 412 px. C'est trois lignes de Playwright, et c'est le seul moyen
de voir ce qu'aucune relecture ne montre. Les seuils utiles : **320** (vieil
iPhone SE), **375** (iPhone 8 et SE 2022, encore très répandus), **390** (iPhone
récents), **412** (Android courants).

---

## L'en-tête tient à une place près

Le conteneur est plafonné à 1160 px, donc **la barre dispose de la même largeur
à 1200 px de fenêtre qu'à 2560** : ce qui ne tient pas à 1160 ne tiendra jamais.

⚠️ **Le logo était le seul élément compressible, et il absorbait le dépassement
en silence.** Le 21/09/2026 il s'affichait à 20 px de large au lieu de 112 sur
toutes les pages françaises — sans erreur, sans test rouge, juste une marque
écrasée que personne ne remarque en relisant du code. La cause était une entrée
de menu de plus qu'en anglais. `flex: 0 0 auto` sur `.brand` et `.brand__logo`
retire cette soupape : un élément ajouté à l'en-tête fait désormais **déborder**
la barre, ce qui se voit.

Corollaire : **avant d'ajouter quoi que ce soit à l'en-tête, mesurer.** Sept
entrées de menu, la bascule de langue et le bouton d'appel remplissent déjà les
1160 px.

**`documentation/` n'est plus dans le menu public** (21/09/2026) — c'est un
espace d'administration protégé par mot de passe, il n'a rien à faire dans la
navigation d'un site commercial, et la version anglaise ne l'a jamais porté. Il
reste atteignable par le pied de page, côté français uniquement.

**Le bouton « Parler à un expert » ouvre Calendly**, pas l'ancre `#contact`.
C'est un lien externe en nouvel onglet, jamais un widget — voir la section sur
la prise de rendez-vous dans `README.md`.

**Les attributs `width`/`height` du logo doivent décrire l'image réelle**
(352×220). Ils servent à réserver la place avant le chargement ; un rapport faux
provoque un saut de mise en page que Google mesure. Ils annonçaient 330×220
jusqu'au 21/09/2026.

---

## Les deux langues

**`hreflang` se déclare dans les deux sens.** Une page qui désigne sa jumelle
sans être désignée en retour voit sa déclaration purement ignorée — l'erreur ne
produit aucun symptôme visible, juste deux pages qui se font concurrence dans
l'index. Le français est le `x-default`.

**La bascule mène à la même page, jamais à l'accueil.** Un visiteur renvoyé à
l'accueil parce qu'il a changé de langue a perdu ce qu'il lisait, et c'est la
façon la plus sûre de le faire partir. La bascule reste visible sous 1150 px,
seul élément d'en-tête à ne pas basculer dans le menu déroulant : qui tombe
dans la mauvaise langue doit pouvoir en sortir sans ouvrir un menu qu'il ne
sait pas lire.

**Les textes d'interface de `script.js` et de `gate.js` se choisissent sur
`<html lang>`**, dans l'objet `T` en tête de `script.js`. Un message ajouté
d'un côté doit l'être de l'autre. Ne pas dupliquer ces scripts : un bogue
corrigé deux fois est un bogue corrigé une fois sur deux.

**Les attributs `name` des formulaires et les valeurs des menus restent en
français dans les deux langues.** Ce sont des clés, pas du texte affiché :
Web3Forms, la base et le tri de la boîte de réception les lisent. Seul
`[EN]` est ajouté devant l'objet de l'email, pour savoir en quelle langue
répondre avant d'ouvrir le message. Même chose pour la `source` des prospects :
`en/margeo.html` compte en `demo_margeo`, comme `demo-margeo.html` — la policy
d'insertion de `site_agenia_prospects` n'accepte que cette liste, et les
statistiques comptent un produit, pas une langue.

**La page locale anglaise n'est pas une traduction.** `agence-ia-haute-savoie`
vise « agence IA Annecy », tapé par des dirigeants français. Traduite mot pour
mot, elle ne viserait personne. Sa jumelle vise le lecteur anglophone qui
existe vraiment dans la zone : les entreprises internationales du bassin
genevois.

---

## La gamme : quatre logiciels, et ce qu'on promet de chacun

**Margeo** (marges, restauration) · **Prospeo** (prospection) · **Keo** (agence
immobilière) · **Planeo** (visualisation 3D de plans). **Sans accent** — tranché
par le propriétaire le 3 septembre 2026 : c'est ce que portent les URL, et ce qui
se dicte au téléphone. L'application, elle, s'écrit encore « Margéo » dans son
propre dépôt ; c'est le site qui fait foi sur le nom.

**Un produit n'a de page à portail que s'il ouvre vraiment.** Annoncer une démo
qui n'existe pas coûte un prospect déçu, et une seule fois suffit à le perdre.
**Les quatre ouvrent aujourd'hui**, chacun sur son sous-domaine :
`margeo` · `prospeo` · `planeo` · `keo`, tous en `.agenia.pro`.

Le bouton « Découvrir » de la carte **quitte le site** pour les quatre. Plus
aucune adresse `.vercel.app` n'est servie depuis le site.

**Keo est le seul dont le lien change avec la langue** : `/presentation` et
`/en/presentation`. Il est le seul dont la destination soit traduite ; les trois
autres ouvrent une application dont l'interface ne dépend pas du lien. **Un lien
sortant vers une page qui existe dans les deux langues doit viser celle du
visiteur** — l'envoyer sur l'autre annule ce que la page anglaise vient de
gagner. À vérifier à chaque nouveau lien sortant, produit par produit : c'est
une propriété de la destination, pas une règle générale du site.

> **Prospeo a été l'exception inverse, et c'est instructif.** Ce fichier a porté
> jusqu'au 24/09/2026 : « Prospeo ne renvoie vers aucune application, la lier
> l'exposerait ». C'était vrai, puis le propriétaire a publié l'application sur
> son sous-domaine le matin même où il a demandé le lien. Une règle qui décrit un
> **état** vieillit sans prévenir, contrairement à une règle qui décrit une
> contrainte. Avant de refuser un lien au nom d'une phrase d'ici, **vérifier
> l'état réel** — la liste des projets Vercel tranche, pas le souvenir qu'on en
> a. C'est la même leçon que Planeo, annoncé « bientôt » pendant une matinée
> alors que sa démo tournait déjà.

**Ce qui reste vrai, en revanche** : ne pas lier depuis le site une application
sans contrôle d'accès *sans le dire*. Les sous-domaines de production sont
publics — la protection Vercel ne couvre que les adresses `.vercel.app`, pas les
domaines personnalisés.

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

**Une donnée de plus sur le visiteur, c'est quatre fichiers, pas un.** La page
de confidentialité a affirmé pendant des mois que « le site ne collecte des
données que lorsque vous remplissez un formulaire », alors que chaque page vue
était comptée depuis le 24 août. Rien ne l'avait signalé : un texte juridique
devenu faux ne casse aucun test et ne rougit dans aucun audit. Donc, à chaque
champ ajouté à `site_agenia_vues` ou `site_agenia_prospects` :
`mentions-legales.html#confidentialite`, `en/legal-notice.html#privacy`,
`RGPD-REGISTRE.md` (dépôt `margeresto-ia`) — et une **durée de conservation**
qui soit tenue par une purge, sinon ne pas l'annoncer.

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

## Ce qui doit être trouvé doit être lisible sans rien remplir

Le 19 septembre 2026, **huit des onze pages publiques d'alors portaient
`noindex`** parce que leur contenu était masqué par un formulaire. Le site
n'était donc indexable que sur l'accueil et les mentions légales — invisible
de Google jusque sur son propre nom, que se disputent par ailleurs `agenia.ai`,
une société italienne, une application brésilienne et une police de caractères.

Depuis, la ligne de partage est la suivante, et **elle ne se renégocie pas page
par page** :

| Public, donc indexable | Derrière le formulaire |
|---|---|
| Ce que fait le produit, pour qui, la FAQ | La **vidéo** et l'**accès** à l'application |
| L'article entier d'un guide | Sa version **PDF** |

La capture de prospects n'a pas été sacrifiée : elle a été déplacée, et elle
qualifie mieux — quelqu'un qui remplit après avoir lu sait ce qu'il demande.

⚠️ **Le piège est silencieux.** Remonter un formulaire devant un contenu, ou
réintroduire un `noindex`, annule des mois de positionnement sans qu'aucun test
ne rougisse. La vérification tient en dix secondes : ouvrir la page en
navigation privée, sans rien remplir — ce qui est lisible est ce que Google
verra. `documentation/audit.html` dit aussi, page par page, si elle est
indexable.

**Ne jamais inventer d'avis, de note ou de prix** dans les données structurées,
même « en attendant » : c'est une fausse déclaration que Google sanctionne.
C'est pourquoi les quatre `SoftwareApplication` n'ont ni `offers` ni
`aggregateRating`, alors que ce sont eux qui donnent les étoiles.

Le reste — requêtes visées page par page, Search Console, fiche Google Business
Profile, le dépôt GitHub à passer en privé — est dans
[`REFERENCEMENT.md`](REFERENCEMENT.md).

---

## Espace interne (`documentation/`)

Cinq pages, un seul module d'accès (`acces.js`) : le guide, le playbook de
prospection, les statistiques, l'audit et le plan de référencement. **Un onglet
ajouté doit l'être dans les cinq** — c'est le même piège que l'en-tête des pages
publiques, en plus petit.

⚠️ **Le contenu d'un onglet va en base, jamais dans la page.** Le dépôt est
public et servi tel quel : `[hidden]` cache à l'œil, pas au téléchargement. La
page Référencement a été écrite en clair dans son fichier avant d'être corrigée
— n'importe qui aurait lu le plan dans le source, alors que le portail laisse
croire l'inverse. Ce qui est protégé ici l'est par une policy RLS.

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

L'écran étant derrière la connexion, un agent ne peut pas l'ouvrir tel quel. La
parade tient en une page jetable posée à la racine du site local : un `<div
id="audit">`, un `window.AgeniaAcces.demarrer` qui rappelle tout de suite avec
un `outils.requete` rendant des statistiques plausibles, puis
`<script src="/documentation/audit.js">`. L'exploration des pages — la seule
partie qui dépend des fichiers qu'on vient de modifier — tourne alors hors
ligne. **Effacer cette page avant de committer** : à la racine, elle serait
publiée.

**L'audit connaît les deux langues, et c'est à maintenir.** Chaque menu est
comparé à l'accueil *de sa langue*, et le lien de confidentialité est reconnu
sous ses deux orthographes (`confidentialite` et `privacy`). Sans cela, les
douze pages de `en/` remontaient trente-trois constats, tous faux — un audit
qui crie au loup cesse d'être lu, ce qui est pire que pas d'audit. **Une
troisième langue demanderait le même traitement** : ajouter son accueil à
`DEPART` et l'enseigner à `langue()`.

---

## Style

**Les commentaires expliquent le pourquoi, jamais le quoi.** Le code dit déjà ce
qu'il fait ; un commentaire utile porte la décision, l'alternative écartée ou le
piège évité. Écrire dans le style du fichier environnant.

Le JavaScript est en **ES5 dans une IIFE** (`var`, `function`, pas de module) —
c'est la convention de tous les fichiers du site, la suivre plutôt que
d'introduire une syntaxe plus récente au cas par cas.
