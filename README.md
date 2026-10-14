# Question pour un Camer 🇨🇲

Un jeu de quiz sombre aux couleurs du Cameroun (vert, rouge, or). Tu traverses un parcours de
**36 niveaux** réparti en **6 ères de la vie** : Naissance, Enfance, Adolescence, Jeunesse, Vie adulte, Sagesse.

## Comment ça marche

- Une question par niveau. Chaque bonne réponse fait **monter la cagnotte** (la bulle dorée à droite).
  Le gain augmente à chaque ère : 5 000 F, 10 000 F, 20 000 F, 30 000 F, 50 000 F, puis 100 000 F par niveau.
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
| `questions.js` | Les 6 ères, leurs gains, leurs couleurs et **toutes les questions** |
| `game.js` | La logique : cagnotte, étoiles, défis du jour, carte du parcours, sauvegarde |
| `.github/workflows/pages.yml` | La publication automatique sur GitHub Pages |

## Modifier le jeu

- **Ajouter des questions** : dans `questions.js`, ajoute une ligne dans l'ère voulue :
  `{ q: "Ta question ?", ok: "La bonne réponse", ko: ["Faux 1", "Faux 2", "Faux 3"] }`.
  L'ordre des réponses est mélangé automatiquement. Il y a 8 questions par ère pour 6 niveaux : plus tu en ajoutes, plus les parties varient.
- **Changer les gains** : champ `gain` de chaque ère dans `questions.js`.
- **Changer la fréquence des étoiles** : `STAR_EVERY` dans `questions.js`.
- **Changer les défis du jour** : liste `CHALLENGES` au début de `game.js`.
- **Changer les couleurs** : variables au début de `style.css`.
"# QPUC" 
"# QPUC" 
"# QPUC" 
