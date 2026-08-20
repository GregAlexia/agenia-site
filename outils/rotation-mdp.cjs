#!/usr/bin/env node
/**
 * Rotation du mot de passe de la documentation protégée.
 *
 * Déchiffre documentation/index.html avec l'ANCIEN mot de passe, re-chiffre
 * le contenu avec le NOUVEAU (AES-256-GCM, clé dérivée par PBKDF2-SHA256,
 * 250 000 itérations) et réécrit la page. Rien n'est stocké en clair.
 *
 * Usage :
 *   node outils/rotation-mdp.cjs            (mots de passe via variables d'env)
 *     ANCIEN_MDP=...  NOUVEAU_MDP=...  node outils/rotation-mdp.cjs
 *
 * Si l'ancien mot de passe est faux, le déchiffrement échoue et RIEN n'est
 * modifié — seul un détenteur du mot de passe actuel peut le changer.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FICHIER = path.join(__dirname, "..", "documentation", "index.html");
const ITERATIONS = 250000;

const ancien = process.env.ANCIEN_MDP;
const nouveau = process.env.NOUVEAU_MDP;

if (!ancien || !nouveau) {
  console.error("Erreur : définir ANCIEN_MDP et NOUVEAU_MDP (variables d'environnement).");
  process.exit(1);
}
if (nouveau.length < 12) {
  console.error("Erreur : le nouveau mot de passe doit faire au moins 12 caractères.");
  console.error("Conseil : une phrase de 4 mots sans rapport (ex. Mot1-Mot2-Mot3-Mot4-42).");
  process.exit(1);
}

const page = fs.readFileSync(FICHIER, "utf8");
const m = page.match(/const COFFRE = (\{[\s\S]*?\});/);
if (!m) {
  console.error("Erreur : bloc COFFRE introuvable dans documentation/index.html.");
  process.exit(1);
}
const coffre = JSON.parse(m[1]);

// --- Déchiffrement avec l'ancien mot de passe ---
let clair;
try {
  const cle = crypto.pbkdf2Sync(
    ancien, Buffer.from(coffre.sel, "base64"), coffre.iterations, 32, "sha256");
  const donnees = Buffer.from(coffre.donnees, "base64");
  const tag = donnees.subarray(donnees.length - 16);
  const corps = donnees.subarray(0, donnees.length - 16);
  const d = crypto.createDecipheriv("aes-256-gcm", cle, Buffer.from(coffre.iv, "base64"));
  d.setAuthTag(tag);
  clair = Buffer.concat([d.update(corps), d.final()]);
} catch (e) {
  console.error("Échec du déchiffrement : l'ANCIEN mot de passe est incorrect.");
  console.error("Aucune modification effectuée.");
  process.exit(2);
}

// --- Re-chiffrement avec le nouveau mot de passe ---
const sel = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const cle2 = crypto.pbkdf2Sync(nouveau, sel, ITERATIONS, 32, "sha256");
const c = crypto.createCipheriv("aes-256-gcm", cle2, iv);
const chiffre = Buffer.concat([c.update(clair), c.final(), c.getAuthTag()]);

const nouveauCoffre = JSON.stringify({
  sel: sel.toString("base64"),
  iv: iv.toString("base64"),
  donnees: chiffre.toString("base64"),
  iterations: ITERATIONS,
});

fs.writeFileSync(FICHIER, page.replace(m[0], "const COFFRE = " + nouveauCoffre + ";"));

// --- Vérification aller-retour avec le nouveau mot de passe ---
const relu = fs.readFileSync(FICHIER, "utf8").match(/const COFFRE = (\{[\s\S]*?\});/);
const cv = JSON.parse(relu[1]);
const cleV = crypto.pbkdf2Sync(nouveau, Buffer.from(cv.sel, "base64"), cv.iterations, 32, "sha256");
const dv = Buffer.from(cv.donnees, "base64");
const dec = crypto.createDecipheriv("aes-256-gcm", cleV, Buffer.from(cv.iv, "base64"));
dec.setAuthTag(dv.subarray(dv.length - 16));
const verif = Buffer.concat([dec.update(dv.subarray(0, dv.length - 16)), dec.final()]);
if (!verif.equals(clair)) {
  console.error("Erreur interne : la vérification aller-retour a échoué.");
  process.exit(3);
}

console.log("Mot de passe changé avec succès.");
console.log(`Contenu re-chiffré : ${clair.length.toLocaleString("fr-FR")} octets, AES-256-GCM, PBKDF2 ${ITERATIONS.toLocaleString("fr-FR")} itérations.`);
console.log("L'ancien mot de passe ne fonctionne plus.");
