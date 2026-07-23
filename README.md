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
- **Formulaire** : ouvre le client mail (`mailto:`). Pour une vraie soumission,
  branchez Formspree, Basin, ou un webhook n8n (attribut `action` du `<form>`).
- **Mentions légales / Confidentialité** : liens dans le pied de page à compléter.
- **Chiffres** (-70 %, x3, etc.) : illustratifs, à ajuster à votre réalité.

## Domaine personnalisé (optionnel)

Pour servir le site sur `www.agenia.pro` :

1. Repo → **Settings → Pages → Custom domain** : saisir `www.agenia.pro`.
2. Chez votre registrar, créer un enregistrement **CNAME** `www` → `gregalexia.github.io`.
3. Cocher **Enforce HTTPS** une fois le certificat émis.
