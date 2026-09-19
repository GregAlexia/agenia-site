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
| `essai-outils.html` | calculateur coût de revient restaurant gratuit · calcul prime cost |
| `agence-ia-haute-savoie.html` | agence IA Annecy · automatisation PME Haute-Savoie |
| `ressources/*` | quelles tâches automatiser · auditer ses process · calculer le ROI |

**Un titre passe sous 60 caractères**, sinon Google le tronque et la promesse
se perd en plein milieu. Une méta-description reste sous 155.

### Maillage interne

Le pied de page de l'accueil porte la colonne **Logiciels** : ce sont les seuls
liens internes vers les pages produit depuis la page la mieux référencée du
site. Une page sans lien entrant est explorée tard et mal. Chaque page se
termine par un bloc « À lire aussi » pour la même raison.

Le lien externe vers `margeo.vercel.app` qu'y portait le pied de page a été
retiré le 19/09/2026 : il envoyait l'autorité de l'accueil vers un autre domaine
à l'endroit exact où les pages produit en avaient besoin. Les deux liens qui
restent vers ce domaine sont dans le contenu déverrouillé, là où ils servent.

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
   `<head>` de `index.html`, puis commit + push → en ligne en une à deux minutes.
4. Menu **Sitemaps** → saisir `sitemap.xml` → Envoyer. Le fichier est déjà en
   ligne, l'étape doit passer en « Réussite » immédiatement.
5. **Inspection de l'URL** → « Demander une indexation » sur l'accueil et sur
   les quatre pages produit. C'est ce qui remplace l'attente du crawl naturel.

Compter de quelques jours à deux semaines pour les premières indexations, et
**trois à six mois** avant de juger un positionnement.

### 2. Fiche Google Business Profile — le levier local

Sur une zone peu concurrentielle, c'est ce qui rapporte le plus vite, et c'est
gratuit. **business.google.com** → créer la fiche avec exactement les mêmes
nom, adresse et téléphone que les mentions légales — une incohérence entre la
fiche et le site annule le bénéfice. Catégorie principale suggérée :
« Éditeur de logiciels » ; secondaire : « Consultant en informatique ».
La validation se fait par courrier postal ou par téléphone.

### 3. Le dépôt GitHub

`GregAlexia/agenia-site` est public et sort avant le site sur les requêtes de
marque. Il expose aussi un identifiant rattachable au propriétaire, ce que la
règle d'anonymat du site interdit partout ailleurs. **Décision du 19/09/2026 :
le passer en privé.** Attention : GitHub Pages depuis un dépôt privé exige un
compte **GitHub Pro** — sur un compte gratuit, le site cesserait d'être publié.
Vérifier le plan avant de basculer.

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
