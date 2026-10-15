// Copie les fichiers du jeu dans le dossier www/, que Capacitor embarque dans l'APK.
// Si tu ajoutes un fichier au jeu (image, son, police...), ajoute-le à cette liste.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "www");
const files = ["index.html", "style.css", "questions.js", "game.js"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const f of files) {
  const src = path.join(root, f);
  if (!fs.existsSync(src)) {
    console.error("Fichier manquant : " + f);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(out, f));
}
console.log("www/ prêt : " + files.join(", "));
