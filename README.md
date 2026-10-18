# Question pour un Camer 🇨🇲

Un jeu de quiz sombre aux couleurs du Cameroun (vert, rouge, or). Tu traverses un parcours de
**42 niveaux** répartis en **7 ères de l'évolution du monde** : Préhistoire, Antiquité, Moyen Âge, Découvertes, ère industrielle, XXe siècle, ère numérique.

## Comment ça marche

- Une question par niveau. Chaque bonne réponse fait **monter la cagnotte** (la bulle dorée à droite).
  Le gain augmente à chaque ère : 5 000 F, 10 000 F, 20 000 F, 30 000 F, 50 000 F, 75 000 F, puis 100 000 F par niveau.
- Une mauvaise réponse ramène la cagnotte à **0 F**. Tu gardes ta place sur le parcours et tu rejoues le niveau.
- Les **étoiles ★** remplacent les jokers : elles offrent une seconde chance après un échec
  (la cagnotte est sauvée et tu retentes le niveau avec une nouvelle question).
- Pour gagner des étoiles : **1 étoile tous les 10 niveaux réussis**, ou en relevant les
  **défis du jour** (3 défis tirés chaque jour, 1 ou 2 étoiles chacun).
- La progression est sauvegardée dans le navigateur (localStorage).

## Tester en local

Ouvre simplement `index.html` dans ton navigateur. Aucune installation nécessaire.

## Publier sur GitHub (GitHub Pages)

1. Crée un dépôt GitHub (ex. `question-pour-un-camer`).
2. Envoie-y tous les fichiers de ce dossier, **y compris** `.github/workflows/pages.yml` :
   ```bash
   git init
   git add .
   git commit -m "Nouvelle version du jeu"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/question-pour-un-camer.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Le jeu est publié à chaque push sur `https://TON-PSEUDO.github.io/question-pour-un-camer/`.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Les écrans : accueil, parcours, jeu, victoire, fenêtres |
| `style.css` | Tout le design (couleurs, bulle de cagnotte, boutons, carte) |
| `questions.js` | Les 7 ères, leurs gains, leurs couleurs et **toutes les questions** |
| `game.js` | La logique : cagnotte, étoiles, défis du jour, carte du parcours, sauvegarde |
| `.github/workflows/pages.yml` | La publication automatique sur GitHub Pages |
| `.github/workflows/android.yml` | La fabrication automatique de l'APK |
| `package.json` | Les outils nécessaires à l'APK (Capacitor) |
| `capacitor.config.json` | Nom et identifiant de l'application |
| `scripts/prepare-www.js` | Copie le jeu dans `www/` avant de fabriquer l'APK |
| `scripts/patch-android.js` | Ajoute l'identifiant AdMob au projet Android pendant la fabrication |
| `ads-config.js` | Réglages des publicités (identifiants, fréquence, limites) |
| `assets/icon.png` | L'icône de l'application |
| `.gitignore` | Dossiers à ne pas envoyer sur GitHub |

## Fabriquer l'APK Android (sur GitHub, sans Android Studio)

L'application s'appelle **Question pour un Camer** et son identifiant est `com.khsan.qpuc`.
Le jeu est enveloppé dans une vraie application Android avec [Capacitor](https://capacitorjs.com).

1. Envoie tous les fichiers du dossier sur ton dépôt GitHub (branche `main`), **y compris** :
   `package.json`, `capacitor.config.json`, `scripts/`, `assets/icon.png` et `.github/workflows/android.yml`.
2. Sur GitHub, ouvre l'onglet **Actions**, choisis **Construire l'APK Android**, puis **Run workflow**
   (le workflow se lance aussi tout seul à chaque envoi sur `main`).
3. Attends 5 à 10 minutes. Quand la ligne est verte, ouvre-la et télécharge
   **Question-pour-un-Camer-APK** tout en bas (section *Artifacts*) : c'est un zip qui contient `question-pour-un-camer.apk`.
4. Sur le téléphone : ouvre l'APK et autorise l'installation d'applications inconnues si Android le demande.

**Lien de téléchargement direct (Release)** : crée un tag, par exemple `v1.0.0`
(`git tag v1.0.0 && git push origin v1.0.0`). L'APK est alors attaché à la page *Releases* du dépôt.

**Remarques**
- L'APK produit est un APK « debug » : parfait pour tester et partager. Pour le Play Store, il faudra une clé de signature et un fichier AAB.
- Si tu ajoutes un fichier au jeu (image, son...), ajoute son nom dans la liste de `scripts/prepare-www.js`.
- Pour changer l'icône, remplace `assets/icon.png` (carré, 1024×1024 minimum).

## Publicités (Google AdMob)

Les pubs ne s'affichent **que dans l'application Android**, pas sur la version web.
- **Pub avec récompense** : après une mauvaise réponse (sans étoile), le joueur peut regarder **2 pubs** pour gagner
  **1 ★** et sauver sa cagnotte. Le même bouton existe dans la fenêtre « Défis du jour ». Limite : 3 étoiles par pub et par jour.
- **Pub plein écran** : une toutes les 5 questions jouées, juste avant la question suivante.

Tout se règle dans `ads-config.js`. Pour l'instant, **seules des pubs de test** (identifiants de test de Google) sont utilisées : fausses pubs, sans risque,
pas besoin de compte Play Store. Plus tard, pour passer aux vraies pubs :
1. Crée un compte sur [admob.google.com](https://admob.google.com) et ajoute l'application (identifiant `com.khsan.qpuc`).
2. Crée un bloc « Avec récompense » et un bloc « Interstitielle ».
3. Dans `ads-config.js`, remplace `androidAppId`, `rewardedId` et `interstitialId` par tes identifiants, puis mets `testing: false`.
4. Ne clique jamais toi-même sur tes vraies pubs : AdMob peut suspendre ton compte.

Pour tout désactiver : `enabled: false` dans `ads-config.js`.
Si tu publies sur le Play Store, une politique de confidentialité (une page web) est demandée.

## Modifier le jeu

- **Ajouter des questions** : dans `questions.js`, ajoute une ligne dans l'ère voulue :
  `{ q: "Ta question ?", ok: "La bonne réponse", ko: ["Faux 1", "Faux 2", "Faux 3"] }`.
  L'ordre des réponses est mélangé automatiquement. Il y a plus de questions que de niveaux dans chaque ère : plus tu en ajoutes, plus les parties varient.
- **Changer les gains** : champ `gain` de chaque ère dans `questions.js`.
- **Changer la fréquence des étoiles** : `STAR_EVERY` dans `questions.js`.
- **Changer les défis du jour** : liste `CHALLENGES` au début de `game.js`.
- **Changer les couleurs** : variables au début de `style.css`.
