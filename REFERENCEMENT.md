# Référencement (SEO)

Ce document recense ce qui a été mis en place pour le référencement du site,
et la procédure pour le déclarer aux moteurs de recherche. À tenir à jour
quand une page indexable apparaît ou disparaît.

## Ce qui est en place

| Élément | Où | Détail |
|---|---|---|
| `robots.txt` | racine | Autorise tout le crawl, référence le sitemap |
| `sitemap.xml` | racine | Liste uniquement les pages **indexables** (voir plus bas) |
| `<link rel="canonical">` | 6 pages publiques | Une URL de référence par page, évite le contenu dupliqué |
| Open Graph + Twitter Card | 6 pages publiques | Titre, description, image de partage (1200×630) pour un rendu correct sur LinkedIn/WhatsApp/Slack |
| `assets/og-image.jpg` | racine assets | Image de partage sociale, générée dans la charte éditoriale du site (logo, accroche, 60 Ko) |
| JSON-LD `Organization` + `WebSite` | `index.html` | Identité de l'entreprise — **aucun nom de personne physique**, cf. `mentions-legales.html` |
| JSON-LD `FAQPage` | `index.html` | Les 5 questions de la section FAQ, éligibles aux extraits enrichis Google |
| JSON-LD `BreadcrumbList` | 5 pages (toutes sauf l'accueil) | Fil d'Ariane pour le contexte de navigation |
| JSON-LD `ItemList` | `ressources/index.html` | Liste des guides disponibles |

### Pages indexables vs `noindex`

Seules 3 pages sont dans `sitemap.xml` et autorisées à l'indexation
(`index, follow`) : l'accueil, `/ressources/` et `mentions-legales.html`.

Les 3 articles de `/ressources/*.html` portent `noindex, follow` : le
contenu est masqué tant qu'un formulaire n'est pas rempli (voir
`README.md` de la section Ressources), donc ce qu'un robot verrait sans
soumettre le formulaire n'est que le portail de capture — rien d'utile à
indexer. Le lien reste malgré tout partageable (Open Graph fonctionne,
seul le référencement Google est désactivé).

`/documentation/` porte `noindex, nofollow` (contenu chiffré, protégé par
mot de passe) et n'apparaît pas non plus dans le sitemap.

**Quand ajouter une page au sitemap** : uniquement si elle porte
`index, follow` (ou aucune balise `robots`, ce qui revient au même par
défaut). Une page `noindex` n'a rien à faire dans le sitemap.

---

## Déclarer le site à Google Search Console

Le domaine servi est `www.agenia.pro` (fichier `CNAME` à la racine).

### 1. Compte

Ouvrir **search.google.com/search-console** avec le compte Google qui doit
gérer le site (idéalement `contact@agenia.pro` si ce Gmail existe, sinon un
compte personnel — l'outil n'affiche rien de public).

### 2. Ajouter la propriété — type « Préfixe d'URL »

Deux types de propriété existent :

- **Domaine** — couvre `agenia.pro` + `www.agenia.pro` + tous les
  sous-domaines, mais exige un enregistrement TXT chez le registrar DNS (OVH)
- **Préfixe d'URL** — couvre uniquement `https://www.agenia.pro/`, vérifiable
  par un simple fichier ou une balise HTML, sans toucher au DNS

→ Choisir **Préfixe d'URL**, saisir `https://www.agenia.pro/`. Le site ne
répond que sur `www` (pas sur le domaine nu), inutile de complexifier.

### 3. Vérifier la propriété — balise HTML meta

Méthode la plus simple pour ce site :

1. Choisir « Balise HTML » dans la liste des méthodes de vérification
2. Google fournit une ligne du type :
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXX" />
   ```
3. Ajouter cette ligne dans le `<head>` de `index.html`, commit + push sur
   `main` → le site se redéploie automatiquement (~20-30 secondes)
4. Revenir sur Search Console et cliquer **Vérifier**

*(Alternative sans toucher au code : méthode « fichier HTML » — déposer
soi-même le fichier `.html` fourni par Google à la racine du dépôt via
l'interface GitHub.)*

### 4. Soumettre le sitemap

Propriété vérifiée → menu latéral **Sitemaps** → champ « Ajouter un
sitemap » → saisir `sitemap.xml` (Search Console complète automatiquement
avec `https://www.agenia.pro/`) → **Envoyer**.

Le fichier est déjà en ligne à `https://www.agenia.pro/sitemap.xml`, cette
étape doit passer en statut « Réussite » immédiatement.

### 5. Suivre l'indexation

- **Pages** (menu latéral) : quelles pages sont indexées vs explorées mais
  non indexées, au fil des jours
- **Inspection de l'URL** (barre de recherche en haut) : coller une URL
  précise et cliquer « Demander une indexation » force un passage du robot
  plus rapide que d'attendre le crawl naturel — utile pour l'accueil et
  `/ressources/` juste après une mise à jour

L'indexation initiale prend généralement de quelques jours à deux semaines.

### 6. Optionnel — Bing Webmaster Tools

Bing (et Yahoo, qui utilise son index) reste une part non négligeable du
trafic en France. **bing.com/webmasters** propose un **import direct depuis
Google Search Console** (connexion au même compte Google), qui reprend la
vérification et le sitemap en un clic.

---

## Maintenir dans le temps

- Toute nouvelle page publique indexable (`index, follow` ou pas de balise
  `robots`) doit être ajoutée à `sitemap.xml`, avec `canonical`, Open Graph
  et Twitter Card — copier le bloc `<head>` d'une page existante comme
  `ressources/index.html`
- Toute page gated ou protégée reste en `noindex` et hors sitemap
- Le fichier `assets/og-image.jpg` sert d'image de partage par défaut à
  toutes les pages ; une page qui mériterait sa propre image (un article à
  fort potentiel de partage, par exemple) peut définir son propre
  `og:image` sans toucher aux autres pages
