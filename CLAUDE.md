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

## Le piège de fond : neuf fichiers, un seul en-tête

Il n'y a pas de gabarit. L'en-tête, la navigation, le menu mobile et le pied de
page sont **répétés dans les neuf pages publiques** :

```
index.html · demo-margeo.html · demo-keo.html · essai-outils.html
mentions-legales.html · ressources/index.html
ressources/20-taches-a-automatiser.html · ressources/auditer-process-pme.html
ressources/calculer-roi-automatisation.html
```

Toucher à la navigation sans les traiter toutes laisse un site incohérent, sans
erreur ni test rouge pour le signaler. **Après toute modification de
navigation, compter les occurrences** — et attention aux chemins : les pages de
`ressources/` pointent en `../`, les autres à la racine.

C'est le prix assumé de l'absence de build : ce qui est dans le dépôt est
exactement ce qui est servi.

---

## Content-Security-Policy

Chaque page porte sa CSP en `<meta http-equiv>`. Deux conséquences :

- **Un nouvel hôte contacté doit être ajouté à `connect-src`** de toutes les
  pages concernées, sinon la requête est refusée en silence côté navigateur.
  Aujourd'hui : `api.web3forms.com` et le projet Supabase.
- **`style-src` doit garder `'unsafe-inline'`.** Sans lui, toute largeur posée
  en JavaScript est ignorée — les barres de jauge des statistiques ne s'étaient
  pas affichées, sans la moindre erreur visible — et le contenu importé de la
  documentation perdrait sa mise en forme.

---

## Espace interne (`documentation/`)

Deux pages, un seul module d'accès (`acces.js`) : le guide et les statistiques.

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

### Le contenu du guide vit en base, compressé

`documentation_contenu.html` contient le guide ZénithIA en **gzip puis base64**
(76 Ko au lieu de 190). `documentation.js` reconnaît le format à la lecture : un
contenu commençant par `<` est du HTML tel quel, tout autre est décompressé.
Écrire du HTML en clair dans la colonne reste donc valide.

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

---

## Style

**Les commentaires expliquent le pourquoi, jamais le quoi.** Le code dit déjà ce
qu'il fait ; un commentaire utile porte la décision, l'alternative écartée ou le
piège évité. Écrire dans le style du fichier environnant.

Le JavaScript est en **ES5 dans une IIFE** (`var`, `function`, pas de module) —
c'est la convention de tous les fichiers du site, la suivre plutôt que
d'introduire une syntaxe plus récente au cas par cas.
