# Référencement (SEO)

Ce que le site fait pour être trouvé sur Google, **pourquoi** il le fait ainsi,
et ce qui reste à faire à la main. À tenir à jour quand une page indexable
apparaît ou disparaît.

---

## Le point de départ, 19 septembre 2026

Trois constats, vérifiés et non supposés, qui expliquent tout ce qui suit.

**1. Le site n'était indexable que sur trois pages, dont les mentions légales.**
Les quatre pages produit, la page des calculateurs et les trois guides portaient
`noindex` — leur contenu était caché derrière un formulaire, donc il n'y avait
rien à indexer. Google n'avait qu'une seule page commerciale : l'accueil. **Un
site à une page ne se classe sur rien.** C'était la cause racine, et tout le
reste du référencement n'était qu'un décor autour d'elle.

**2. Le nom « Agenia » est très disputé.** Une recherche sur `agenia.pro`
remonte `agenia.ai`, `agenia.app.br`, Agenia SRL (une société de conseil
italienne), une police de caractères du même nom, un thème WordPress — et le
dépôt GitHub du site, qui sortait avant le site lui-même. **La marque seule ne
ramènera pas de trafic.** Il faut viser ce que le client tape quand il ne nous
connaît pas encore.

**3. « Margeo » est déjà occupé dans sa propre niche.** `margeo.co` se présente
comme « gestion des coûts alimentaires pour restaurants », et il existe aussi
`margeoapp.com` et une fiche Capterra au même nom. Se battre sur le mot
« Margeo » coûterait cher pour un résultat improbable. **On vise donc le
problème, pas le nom du produit** : « logiciel calcul marge restaurant »,
« coût de revient d'un plat », pas « Margeo ».

---

## La règle qui découle de tout ça

> **Ce qui doit être trouvé doit être lisible sans rien remplir.**

Un formulaire placé devant le contenu est un mur pour Google exactement comme
pour un visiteur qui ne nous connaît pas. La capture de prospects n'a pas
disparu pour autant — elle a changé de place :

| Type de page | Ce qui est public | Ce qui reste derrière le formulaire |
|---|---|---|
| Pages produit | Le problème, ce que fait le logiciel, pour qui, la FAQ | La **vidéo** de démo et l'**accès** à l'application |
| Calculateurs | Ce que fait chacun des huit, la FAQ | Le **lien d'ouverture** des outils |
| Guides | L'**article entier** | La version **PDF** imprimable |

Le point de capture est donc conservé partout, et il est même mieux qualifié :
quelqu'un qui remplit après avoir lu sait ce qu'il demande.

**Test avant de pousser une page** : afficher la page dans une fenêtre de
navigation privée, sans rien remplir. Ce qui est lisible est ce que Google
verra. Si c'est un formulaire, la page ne ramènera personne.

---

## Ce qui est en place

| Élément | Où | Détail |
|---|---|---|
| `robots.txt` | racine | Autorise le crawl, refuse `/ressources/pdf/`, déclare le sitemap |
| `sitemap.xml` | racine | Les **12 pages indexables**, avec `lastmod` réel |
| `<link rel="canonical">` | 12 pages publiques | Une URL de référence par page |
| Open Graph + Twitter Card | 12 pages publiques | Rendu correct sur LinkedIn, WhatsApp, Slack |
| `assets/og-image.jpg` | `assets/` | Image de partage 1200×630, gabarit dans `outils/og-image.html` |
| JSON-LD `Organization` | `index.html` | Identité, marques, RCS, et **`sameAs`** vers les trois comptes sociaux |
| JSON-LD `WebSite` | `index.html` | — |
| JSON-LD `FAQPage` | `index.html` | Les 5 questions de la section FAQ |
| JSON-LD `SoftwareApplication` | 4 pages produit | Le logiciel décrit comme une entité : catégorie, fonctions, public |
| JSON-LD `Article` | 3 guides | Titre, dates, auteur = l'organisation |
| JSON-LD `ProfessionalService` | `agence-ia-haute-savoie.html` | Adresse, coordonnées, zone desservie |
| JSON-LD `BreadcrumbList` | toutes sauf l'accueil | Fil d'Ariane |
| JSON-LD `ItemList` | `ressources/index.html` | Liste des guides |

### Les balises de vérification de propriété

`index.html` porte, juste après le `canonical`, les jetons par lesquels les
plateformes vérifient qu'on est bien chez soi. Aujourd'hui : **Pinterest**
(`p:domain_verify`, posé le 19/09/2026). Search Console posera le sien au même
endroit.

Ce ne sont **pas des secrets** — ils sont faits pour être lus publiquement, et
ne donnent aucun droit sur le site ; ils prouvent l'inverse. En revanche,
**ne jamais les retirer** : la revendication est revérifiée périodiquement, et
une balise disparue la révoque sans prévenir.

Elles vont sur **`index.html` uniquement**, pas sur les douze pages : la
plateforme vérifie l'URL qu'on lui a donnée, et douze copies d'un jeton sont
douze occasions d'en oublier une.

### `sameAs` : à quoi il sert vraiment ici

Ce n'est pas un ornement. Avec cinq homonymes qui occupent le nom, `sameAs` est
ce qui dit à Google que *cette* entreprise-ci est celle qui tient ces comptes
Facebook, Instagram et YouTube. **Tout compte social ajouté doit être ajouté
là**, sinon c'est un signal perdu.

### Ce qu'on ne déclare pas, et pourquoi

Les `SoftwareApplication` ne portent **ni `offers` ni `aggregateRating`**. Ce
sont pourtant eux qui déclenchent l'extrait enrichi avec les étoiles. Les
inventer est une fausse déclaration que Google sanctionne — et il n'y a
aujourd'hui ni grille tarifaire publique (décision du 3 septembre 2026) ni
avis clients réels. Le jour où l'un des deux existe, c'est là qu'il se déclare.

Même raison pour l'absence de `SearchAction` dans `WebSite` : le site n'a pas
de moteur de recherche interne, et en déclarer un produirait une boîte de
recherche qui ne marche pas.

### Pages indexables

Les **12 pages publiques** sont toutes indexables et toutes au sitemap.

Restent hors index, volontairement :

- **`/documentation/`** — `noindex, nofollow`, protégée par mot de passe. Elle
  n'est **pas** refusée dans `robots.txt`, et c'est délibéré : un robot à qui
  l'on interdit d'explorer une page ne peut pas lire le `noindex` qu'elle
  contient, et elle finirait indexée sans titre plutôt qu'absente.
- **`/ressources/pdf/`** — refusé au crawl. Ces PDF reprennent mot pour mot
  l'article qui les précède ; laissés libres, ils lui feraient concurrence dans
  l'index, et c'est parfois le PDF qui l'emporte — un document sans navigation,
  sans lien et sans formulaire.

**Quand ajouter une page au sitemap** : dès qu'elle porte `index, follow`. Une
page `noindex` n'a rien à y faire, et une page indexable absente du sitemap est
trouvée plus tard.

---

## Ce que chaque page doit aller chercher

Le titre et le `h1` sont écrits pour ces intentions-là. Les changer sans raison
casse un travail de positionnement qui met des mois à s'installer.

| Page | Intention visée |
|---|---|
| `/` | La marque, et « éditeur de logiciels IA pour PME » |
| `demo-margeo.html` | logiciel calcul marge restaurant · coût de revient d'un plat · food cost |
| `demo-prospeo.html` | logiciel prospection commerciale IA · outil de prospection B2B |
| `demo-keo.html` | logiciel gestion agence immobilière · automatisation quittance de loyer |
| `demo-planeo.html` | plan de permis de construire en 3D · visualiser sa maison avant construction |
| `essai-outils.html` | calculateur coût de revient restaurant · calcul prime cost · calculateur food cost |
| `agence-ia-haute-savoie.html` | agence IA Annecy · automatisation PME Haute-Savoie |
| `ressources/*` | quelles tâches automatiser · auditer ses process · calculer le ROI |

> ⚠️ **« gratuit » est sorti de l'intention visée le 22/09/2026.** Les huit
> calculateurs sont passés derrière authentification côté Margeo : ils sont
> compris dans l'abonnement et s'ouvrent dès la démonstration. Viser une requête
> qu'on ne satisfait plus fait rebondir la visite et coûte la position — et
> promettre « gratuit » dans un titre qui mène à une connexion est une promesse
> fausse avant d'être un problème de référencement. La page garde son adresse,
> donc son antériorité ; c'est la promesse qui a changé, pas l'URL.

**Un titre passe sous 60 caractères**, sinon Google le tronque et la promesse
se perd en plein milieu. Une méta-description reste sous 155.

### Maillage interne

L'accueil mène aux pages produit par deux chemins : la colonne **Logiciels** du
pied de page, et le bouton « Découvrir » de chaque carte. C'est la page la mieux
référencée du site, donc celle dont les liens comptent le plus — une page sans
lien entrant est explorée tard et mal. Chaque page se termine par un bloc
« À lire aussi » pour la même raison.

**Les quatre pages produit n'ont plus que le premier chemin** : Margeo depuis
le 22/09/2026, les trois autres depuis le 24/09. Leur bouton de carte ouvre
l'application au lieu de la page produit. Restent le pied de page, la page
Haute-Savoie et — pour Margeo — `essai-outils.html` ; l'audit atteint toujours
ces pages en suivant les liens, **et c'est le seuil à ne pas franchir**. La
prochaine fois qu'un lien interne de l'accueil disparaît, c'est ce seuil qu'il
faut regarder d'abord, pas l'esthétique de la carte.

Le lien externe vers l'application que portait le pied de page a été retiré le
19/09/2026 : il envoyait l'autorité de l'accueil vers un autre domaine à
l'endroit exact où les pages produit en avaient besoin. **Les boutons de carte
en réintroduisent quatre sur l'accueil** — c'est le prix assumé du raccourci, et
la raison de compter ce que l'on envoie dehors plutôt que de l'étendre par
réflexe.

Chaque produit a son propre sous-domaine, tous vérifiés côté hébergeur :
`margeo`, `prospeo`, `planeo` et `keo` en `.agenia.pro`. Plus aucune adresse
`.vercel.app` n'est servie depuis le site. **Keo est le seul dont le lien change
avec la langue** — `/presentation` et `/en/presentation` — parce qu'il est le
seul dont la page de destination est traduite : envoyer un anglophone sur la
version française annulerait ce que la page anglaise vient de gagner. Les
commentaires HTML qui signalent ces liens sont numérotés par produit et par
langue — `URL Margeo (n/3)`, `URL Keo (n/2)`, `URL Planeo (n/2)`,
`URL Prospeo (1/1)` — pour qu'un changement d'adresse n'en oublie aucun.

---

## Ce qui reste à faire à la main

### 1. Google Search Console — indispensable, et non fait

Rien de ce qui précède ne se mesure sans elle, et l'indexation initiale peut
être demandée plutôt qu'attendue.

1. Ouvrir **search.google.com/search-console** avec le compte Google qui doit
   gérer le site.
2. Propriété de type **Préfixe d'URL**, saisir `https://www.agenia.pro/`. Le
   type « Domaine » couvre plus large mais exige un enregistrement TXT chez OVH,
   et le site ne répond que sur `www`.
3. Vérification par **balise HTML** : Google fournit une ligne
   `<meta name="google-site-verification" content="…" />`, à coller dans le
   `<head>` de `index.html`, puis commit + push. En ligne en une à deux minutes
   d'ordinaire — attendre que l'action GitHub soit terminée avant de cliquer
   « Vérifier », sinon Google lit la page d'avant et refuse.
4. Menu **Sitemaps** → saisir `sitemap.xml` → Envoyer. Le fichier est déjà en
   ligne, l'étape doit passer en « Réussite » immédiatement.
5. **Inspection de l'URL** → « Demander une indexation » sur l'accueil et sur
   les quatre pages produit. C'est ce qui remplace l'attente du crawl naturel.

Compter de quelques jours à deux semaines pour les premières indexations, et
**trois à six mois** avant de juger un positionnement.

### 2. Fiche Google Business Profile — le levier local

Sur une zone peu concurrentielle, c'est ce qui rapporte le plus vite, et c'est
gratuit. La fiche apparaît dans le encadré de droite sur une recherche de
marque, et dans le bloc cartographique sur « agence IA Annecy ».

**La règle qui décide de tout : le NAP.** Nom, adresse, téléphone doivent être
**identiques au caractère près** entre la fiche, `mentions-legales.html` et le
JSON-LD de `agence-ia-haute-savoie.html`. Une incohérence — « Rte » au lieu de
« Route », un 04 au lieu du 06 — et Google cesse de croire qu'il s'agit de la
même entreprise. C'est l'erreur qui annule le bénéfice de la fiche.

Aujourd'hui, la référence est :

```
AgenIA
2303 Route de Croasse, 74270 Desingy, France
+33 6 51 74 81 33
contact@agenia.pro
https://www.agenia.pro/
```

**Marche à suivre**

1. **business.google.com** → « Gérer maintenant », avec le compte Google qui
   gérera aussi Search Console.
2. Nom : **AgenIA**, exactement. Pas « AgenIA — logiciels IA », pas de
   mot-clé ajouté : Google suspend les fiches dont le nom ne correspond pas à
   l'enseigne réelle, et le gain de référencement est nul.
3. **Catégorie principale : « Éditeur de logiciels ».** C'est elle qui
   détermine sur quelles recherches la fiche peut sortir, donc c'est le champ
   le plus important de la fiche. Catégories secondaires :
   « Consultant en informatique », « Service d'assistance informatique ».
4. **Adresse** : l'activité se fait chez le client ou à distance, donc cocher
   **« Je livre des biens et services à mes clients »** et masquer l'adresse.
   Une adresse de domicile affichée n'apporte rien et expose. Définir ensuite
   la **zone desservie** : Haute-Savoie, plus Annecy, Annemasse,
   Saint-Julien-en-Genevois, Rumilly, Thonon-les-Bains.
5. **Validation** : par téléphone, par courrier postal (carte avec code, 5 à
   14 jours) ou par vidéo selon ce que Google propose. Tant qu'elle n'est pas
   faite, la fiche n'existe pas publiquement.
6. Une fois validée : **site web** → `https://www.agenia.pro/`, description de
   750 caractères reprenant les mots de la page locale, **horaires**, et
   quelques **photos** — logo, captures des logiciels. Une fiche sans photo
   reçoit nettement moins de clics.

**Ensuite, deux choses seulement comptent :**

- **Les avis.** C'est le premier critère de classement local, et le seul qui
  ne s'achète pas honnêtement. Demander un avis à chaque client satisfait, au
  moment où il est satisfait. Répondre à tous, y compris les mauvais.
- **Publier de temps en temps.** Une actualité par mois suffit à signaler que
  la fiche est vivante.

Quand la fiche est en ligne, **ajouter son URL dans le `sameAs`** de
`index.html` : c'est un signal de plus pour trancher l'homonymie.

### 3. Le dépôt GitHub — sortir du public, sans payer

Le dépôt `agenia-site` est public. Il sort avant le site sur les requêtes de
marque, mais ce n'est pas le pire : **il expose le propriétaire, et pas
seulement dans son URL.**

L'historique porte **34 commits signés d'un nom de personne et d'une adresse
Gmail personnelle**, lisibles par n'importe qui. C'est la constatation qui a
tranché la décision, le 19/09/2026 :

- **Transférer le dépôt à une organisation ne suffit pas.** L'URL change,
  l'historique part avec. Idée écartée pour cette raison.
- **Réécrire l'historique n'est pas une option** — interdit par les règles du
  projet, et GitHub garde de toute façon les anciens commits accessibles par
  leur empreinte.
- Donc **seul un dépôt privé referme réellement la fuite.**

Or **un dépôt privé est gratuit**. Ce qui exige GitHub Pro (4 $/mois), c'est
uniquement *publier un site GitHub Pages depuis un dépôt privé*. Il suffit donc
que le site soit servi par un autre hébergeur.

**Décision : dépôt privé + Cloudflare Pages**, qui déploie depuis un dépôt
GitHub privé gratuitement, usage commercial autorisé, domaine personnalisé
compris. Coût : zéro, plus un enregistrement DNS à changer.

**L'ordre compte, sous peine de couper le site :**

1. Créer le projet Cloudflare Pages sur le dépôt **encore public**, et vérifier
   qu'il sert bien le site sur son adresse `*.pages.dev`.
2. Déclarer le domaine `www.agenia.pro` dans Cloudflare Pages.
3. Chez OVH, faire pointer le CNAME `www` vers l'adresse `*.pages.dev` au lieu
   de `gregalexia.github.io`. ⚠️ **Ne pas déléguer les serveurs de noms à
   Cloudflare** : la zone porte les enregistrements de messagerie, et le piège
   du double SPF est documenté dans `EMAIL-CONTACT.md` du dépôt de
   l'application. Un seul enregistrement change, rien d'autre.
4. Vérifier que `www.agenia.pro` répond bien depuis Cloudflare, certificat
   compris.
5. **Alors seulement**, passer le dépôt en privé. GitHub dépubliera son Pages,
   ce qui n'a plus d'importance.
6. Retirer `.github/workflows/deploy-pages.yml` et le fichier `CNAME`, tous
   deux devenus sans objet.

**À faire en plus, gratuit et immédiat** : GitHub → Settings → Emails →
*« Keep my email addresses private »* et *« Block command line pushes that
expose my email »*. Ça n'efface pas les 34 commits, ça arrête d'en produire.

**Une fois le dépôt privé**, demander la suppression de l'ancienne URL sur
`search.google.com/search-console/remove-outdated-content` — l'outil public,
qui accepte une URL devenue 404. Celui de Search Console ne vaut que pour ses
propres propriétés, et `github.com` n'en est pas une.

### 3 bis. Le dépôt entier est servi en ligne

`deploy-pages.yml` publie `path: .`, c'est-à-dire **tout le dépôt**. Donc
`www.agenia.pro/CLAUDE.md`, `/README.md` et `/REFERENCEMENT.md` — ce fichier —
sont téléchargeables par qui tape l'adresse. Rien n'y est un secret au sens
strict, mais ce sont des notes internes, et elles n'ont pas à être publiques.

À refermer au moment de la bascule vers Cloudflare, dont le fichier
`_redirects` permet de les rendre inaccessibles sans introduire d'étape de
construction.

### 4. Bing Webmaster Tools — dix minutes

**bing.com/webmasters** propose un **import direct depuis Google Search
Console**, qui reprend vérification et sitemap en un clic. Bing et Yahoo restent
une part non négligeable du trafic français.

---

## Maintenir dans le temps

- Toute page publique nouvelle : `index, follow`, `canonical`, Open Graph,
  Twitter Card, un `BreadcrumbList`, une entrée au sitemap, et **au moins un
  lien entrant** depuis une page existante. Copier le `<head>` de
  `agence-ia-haute-savoie.html`, qui est le plus complet.
- `lastmod` n'est un signal que s'il est vrai. Ne le bouger que quand le
  contenu change réellement.
- **Ne jamais inventer d'avis, de note ou de prix** dans les données
  structurées, même « en attendant ».
- Un contenu qui redevient invisible — un formulaire remonté devant un article,
  un `noindex` réintroduit — annule des mois de travail sans qu'aucun test ne
  rougisse. `documentation/audit.html` affiche, pour chaque page explorée, si
  elle est indexable : la colonne de droite doit dire « oui » partout sauf pour
  ce qui est listé plus haut.
