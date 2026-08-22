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

## Documentation protégée (/documentation)

La page `documentation/index.html` contient le guide interne, **chiffré en
AES-256-GCM** (clé dérivée du mot de passe par PBKDF2-SHA256, 250 000
itérations). Le déchiffrement se fait dans le navigateur après saisie du mot
de passe ; la source publique ne contient aucun contenu lisible.

### Changer (réinitialiser) le mot de passe — self-service

1. Ouvrez l'onglet **Actions** du dépôt →
   workflow **« Changer le mot de passe de la documentation »** →
   bouton **« Run workflow »**.
2. Saisissez le **mot de passe actuel** et le **nouveau** (12 caractères
   minimum — conseil : 4 mots séparés par des tirets, ex. `Mot-Mot-Mot-Mot-42`).
3. Lancez : la page est re-chiffrée, commitée et le site redéployé
   automatiquement (1 à 2 minutes). L'ancien mot de passe ne fonctionne plus.

Notes :
- Un **mauvais mot de passe actuel** fait échouer le workflow **sans rien
  modifier** — seul un détenteur du mot de passe en cours peut le changer.
- Les mots de passe ne sont ni stockés ni affichés dans les journaux.
- En local, la même rotation se fait avec :
  `ANCIEN_MDP=... NOUVEAU_MDP=... node outils/rotation-mdp.cjs` puis commit/push.
- **Mot de passe actuel oublié ?** Le contenu n'est pas récupérable depuis le
  dépôt (c'est le but du chiffrement). Il faut alors régénérer la page depuis
  le document source (voir `build_doc_protegee.py` du dossier de livraison)
  et remplacer `documentation/index.html`.

## Domaine personnalisé (optionnel)

Pour servir le site sur `www.agenia.pro` :

1. Repo → **Settings → Pages → Custom domain** : saisir `www.agenia.pro`.
2. Chez votre registrar, créer un enregistrement **CNAME** `www` → `gregalexia.github.io`.
3. Cocher **Enforce HTTPS** une fois le certificat émis.

## Référencement (SEO)

Voir **[`REFERENCEMENT.md`](REFERENCEMENT.md)** : ce qui est en place
(sitemap, canonical, Open Graph, données structurées) et la procédure pour
déclarer le site à Google Search Console.
