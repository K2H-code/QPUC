// =====================================================================
//  RÉGLAGES DES PUBLICITÉS (Google AdMob)
// =====================================================================
//  Les pubs ne s'affichent QUE dans l'application Android (pas sur la
//  version web de GitHub Pages).
//
//  ⚠ Les identifiants ci-dessous sont les identifiants de TEST officiels
//  de Google : ils affichent de fausses pubs, sans risque pour ton compte.
//
//  Pour passer aux vraies pubs :
//   1. Crée ton compte sur admob.google.com et ajoute l'application
//      (identifiant com.khsan.qpuc).
//   2. Remplace androidAppId, rewardedId et interstitialId par TES
//      identifiants AdMob.
//   3. Mets testing à false.
//  Ne clique JAMAIS sur tes vraies pubs toi-même : AdMob peut suspendre
//  ton compte.
// =====================================================================

const ADS_CONFIG = {
  enabled: true,   // false = aucune pub (mets false pour désactiver d'un coup)
  testing: true,   // true = pubs de test ; false = vraies pubs

  // Identifiants de TEST de Google (à remplacer plus tard)
  androidAppId:   "ca-app-pub-3940256099942544~3347511713",
  rewardedId:     "ca-app-pub-3940256099942544/5224354917",  // pub avec récompense (2 pubs = +1 étoile)
  interstitialId: "ca-app-pub-3940256099942544/1033173712",  // pub plein écran

  interstitialEvery: 5,  // une pub plein écran toutes les 5 questions jouées (0 = jamais)
  adsPerStar: 2,         // nombre de pubs à regarder pour gagner 1 étoile
  maxAdStarsPerDay: 3,   // nombre maximum d'étoiles gagnées avec des pubs par jour
};
