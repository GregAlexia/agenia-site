# Agenia — Site vitrine

Site vitrine de **Agenia** ([www.agenia.pro](https://www.agenia.pro)), agence
d'intelligence artificielle et d'automatisation pour PME et ETI.

Site statique (HTML / CSS / JS, sans build ni dépendance), déployé
automatiquement sur **GitHub Pages** à chaque push sur `main`.

## Structure

| Fichier | Rôle |
|---------|------|
| `index.html` | Structure et contenu (page unique à ancres) |
| `styles.css` | Design (thème sombre, dégradés, responsive, animations) |
| `script.js`  | Menu mobile, apparition au scroll, formulaire |
| `.github/workflows/deploy-pages.yml` | Déploiement automatique sur GitHub Pages |
| `REFERENCEMENT.md` | Ce qui est en place pour le SEO (sitemap, canonical, données structurées) et la procédure Search Console |

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

## À personnaliser

- **Email** : `contact@agenia.pro` (liens `mailto:` dans `index.html` et le pied de page)
- **Téléphone** : `+33 6 51 74 81 33` — **valeur factice à remplacer**
- **Formulaire** : envoie les messages par email via **Web3Forms**. À activer
  en 1 minute (voir « Activer le formulaire de contact » ci-dessous).
- **Mentions légales / Confidentialité** : liens dans le pied de page à compléter.
- **Chiffres** (-70 %, x3, etc.) : illustratifs, à ajuster à votre réalité.

## Activer le formulaire de contact (Web3Forms)

Le formulaire envoie les demandes par email via [Web3Forms](https://web3forms.com)
(gratuit, sans compte, 250 messages/mois). Pour l'activer :

1. Allez sur **https://web3forms.com** → saisissez l'email de réception
   (ex. `contact@agenia.pro`) → vous recevez une **clé d'accès** (Access Key)
   par email.
2. Dans `index.html`, remplacez `REMPLACER_PAR_VOTRE_CLE_WEB3FORMS` par cette clé :
   ```html
   <input type="hidden" name="access_key" value="votre-cle-ici" />
   ```
3. Poussez la modif sur `main` → le site se redéploie, le formulaire est actif.

> Tant que la clé n'est pas renseignée, le formulaire affiche un message
> d'avertissement au lieu d'envoyer. Les messages arrivent ensuite directement
> dans la boîte email indiquée à l'étape 1.

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

### Mettre le contenu à jour

Une écriture dans `documentation_contenu.html` suffit. Il n'y a plus rien à
chiffrer, à recompiler ni à redéployer : la page lit la base à chaque ouverture.

## Domaine personnalisé (optionnel)

Pour servir le site sur `www.agenia.pro` :

1. Repo → **Settings → Pages → Custom domain** : saisir `www.agenia.pro`.
2. Chez votre registrar, créer un enregistrement **CNAME** `www` → `gregalexia.github.io`.
3. Cocher **Enforce HTTPS** une fois le certificat émis.

## Référencement (SEO)

Voir **[`REFERENCEMENT.md`](REFERENCEMENT.md)** : ce qui est en place
(sitemap, canonical, Open Graph, données structurées) et la procédure pour
déclarer le site à Google Search Console.
