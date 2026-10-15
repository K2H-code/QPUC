// =====================================================================
//  DONNÉES DU JEU : les 6 ères de la vie et leurs questions
// =====================================================================
//  - Chaque ère contient LEVELS_PER_ERA niveaux (une question par niveau).
//  - Pour chaque question : q = la question, ok = la bonne réponse,
//    ko = les 3 mauvaises réponses. L'ordre des 4 réponses est mélangé
//    automatiquement à chaque affichage.
//  - Ajoute autant de questions que tu veux dans une ère : le jeu en tire
//    une au hasard (sans répéter tant qu'il en reste).
// =====================================================================

const LEVELS_PER_ERA = 6; // nombre de niveaux par ère
const STAR_EVERY = 10;    // 1 étoile gagnée tous les 10 niveaux réussis

const ERAS = [
  {
    id: "naissance",
    name: "La Naissance",
    subtitle: "Les premiers pas",
    emoji: "👶",
    gain: 5000,
    tint: "#0c3b2d", dark: "#062a1f", accent: "#19b38a",
    deco: ["🍼", "🌱", "🌅", "🕊️", "🌍"],
    questions: [
      { q: "Quelle est la capitale politique du Cameroun ?", ok: "Yaoundé", ko: ["Douala", "Garoua", "Bafoussam"] },
      { q: "Quelles sont les deux langues officielles du Cameroun ?", ok: "Français et anglais", ko: ["Français et espagnol", "Anglais et arabe", "Français et allemand"] },
      { q: "Quelles couleurs trouve-t-on sur le drapeau du Cameroun ?", ok: "Vert, rouge et jaune", ko: ["Bleu, blanc et rouge", "Noir, rouge et or", "Vert, blanc et orange"] },
      { q: "Comment surnomme-t-on l'équipe nationale de football du Cameroun ?", ok: "Les Lions Indomptables", ko: ["Les Éléphants", "Les Aigles", "Les Panthères"] },
      { q: "Quelle est la monnaie utilisée au Cameroun ?", ok: "Le franc CFA (XAF)", ko: ["Le naira", "Le cedi", "Le dirham"] },
      { q: "Quelle est la capitale économique du Cameroun ?", ok: "Douala", ko: ["Limbé", "Kribi", "Ngaoundéré"] },
      { q: "Quel océan borde la côte du Cameroun ?", ok: "L'océan Atlantique", ko: ["L'océan Pacifique", "L'océan Indien", "L'océan Arctique"] },
      { q: "Quel plat à base de feuilles amères et d'arachides est très célèbre au Cameroun ?", ok: "Le ndolé", ko: ["Le thiéboudienne", "L'attiéké", "Le tô"] },
    ],
  },
  {
    id: "enfance",
    name: "L'Enfance",
    subtitle: "Jeux et école",
    emoji: "🧒",
    gain: 10000,
    tint: "#3a3008", dark: "#2a2205", accent: "#fcd116",
    deco: ["⚽", "🪁", "📚", "🥭", "🎈"],
    questions: [
      { q: "Combien font 7 × 8 ?", ok: "56", ko: ["48", "54", "64"] },
      { q: "Quel animal est surnommé le « roi des animaux » ?", ok: "Le lion", ko: ["L'éléphant", "Le crocodile", "Le gorille"] },
      { q: "Quel fruit a une écorce verte et une chair rouge pleine de pépins noirs ?", ok: "La pastèque", ko: ["La mangue", "L'ananas", "La papaye"] },
      { q: "Quelle couleur obtient-on en mélangeant du bleu et du jaune ?", ok: "Le vert", ko: ["Le violet", "L'orange", "Le marron"] },
      { q: "Quel est le plus grand animal terrestre ?", ok: "L'éléphant d'Afrique", ko: ["La girafe", "Le rhinocéros", "L'hippopotame"] },
      { q: "Combien de lettres compte l'alphabet français ?", ok: "26", ko: ["24", "25", "28"] },
      { q: "Quel instrument de musique à peau se joue avec les mains et rythme les danses africaines ?", ok: "Le tambour (tam-tam)", ko: ["La flûte", "La harpe", "Le violon"] },
      { q: "Combien de jours compte une année normale (non bissextile) ?", ok: "365", ko: ["360", "364", "366"] },
    ],
  },
  {
    id: "adolescence",
    name: "L'Adolescence",
    subtitle: "Collège et lycée",
    emoji: "🎒",
    gain: 20000,
    tint: "#3d0d15", dark: "#2b080e", accent: "#e63946",
    deco: ["🧪", "📐", "🎧", "🌋", "🗺️"],
    questions: [
      { q: "Quel est le point culminant du Cameroun ?", ok: "Le mont Cameroun", ko: ["Le mont Oku", "Le mont Manengouba", "Le mont Kala"] },
      { q: "Quel fleuve forme l'estuaire sur lequel est bâtie la ville de Douala ?", ok: "Le Wouri", ko: ["La Sanaga", "Le Logone", "Le Nyong"] },
      { q: "Quelle planète est la plus proche du Soleil ?", ok: "Mercure", ko: ["Vénus", "Mars", "Jupiter"] },
      { q: "En quelle année le Cameroun français a-t-il accédé à l'indépendance ?", ok: "1960", ko: ["1958", "1961", "1972"] },
      { q: "Quelle est la formule chimique de l'eau ?", ok: "H₂O", ko: ["CO₂", "O₂", "NaCl"] },
      { q: "Quel est le plus long fleuve d'Afrique ?", ok: "Le Nil", ko: ["Le Congo", "Le Niger", "Le Zambèze"] },
      { q: "Quelle ville est le chef-lieu de la région du Nord-Ouest du Cameroun ?", ok: "Bamenda", ko: ["Buea", "Bafoussam", "Ebolowa"] },
      { q: "Lequel de ces pays n'a PAS de frontière avec le Cameroun ?", ok: "Le Ghana", ko: ["Le Tchad", "Le Nigeria", "Le Gabon"] },
    ],
  },
  {
    id: "jeunesse",
    name: "La Jeunesse",
    subtitle: "Études et passions",
    emoji: "🎓",
    gain: 30000,
    tint: "#0e4331", dark: "#07301f", accent: "#2ed39c",
    deco: ["🎵", "🎓", "⚽", "💡", "🎤"],
    questions: [
      { q: "Quel attaquant camerounais a été quatre fois Ballon d'or africain ?", ok: "Samuel Eto'o", ko: ["Roger Milla", "Vincent Aboubakar", "Patrick Mboma"] },
      { q: "Quel musicien camerounais a popularisé le makossa dans le monde avec « Soul Makossa » ?", ok: "Manu Dibango", ko: ["Richard Bona", "Petit Pays", "Charlotte Dipanda"] },
      { q: "En quelle année le Cameroun est-il devenu la première équipe africaine à atteindre les quarts de finale d'une Coupe du monde ?", ok: "1990", ko: ["1982", "1994", "1998"] },
      { q: "Quel rythme camerounais est originaire du peuple Béti, dans le Centre et le Sud ?", ok: "Le bikutsi", ko: ["Le makossa", "Le coupé-décalé", "Le zouk"] },
      { q: "Qui a écrit le roman « Une vie de boy » ?", ok: "Ferdinand Oyono", ko: ["Mongo Beti", "Calixthe Beyala", "Cheikh Hamidou Kane"] },
      { q: "Quelle langue compte le plus de locuteurs natifs dans le monde ?", ok: "Le mandarin", ko: ["L'anglais", "L'espagnol", "Le français"] },
      { q: "Quel défenseur camerounais, ancien de Liverpool, a participé à quatre Coupes du monde ?", ok: "Rigobert Song", ko: ["Joël Matip", "Samuel Eto'o", "Roger Milla"] },
      { q: "Quelle est la capitale du Nigeria, pays voisin du Cameroun ?", ok: "Abuja", ko: ["Lagos", "Kano", "Ibadan"] },
    ],
  },
  {
    id: "adulte",
    name: "La Vie adulte",
    subtitle: "Travail et famille",
    emoji: "💼",
    gain: 50000,
    tint: "#43310a", dark: "#2f2206", accent: "#ffcf33",
    deco: ["🏠", "💼", "🚢", "🛢️", "☕"],
    questions: [
      { q: "Quel produit agricole est l'une des grandes exportations du Cameroun, avec le café ?", ok: "Le cacao", ko: ["Le blé", "La betterave à sucre", "Le seigle"] },
      { q: "Quel est le plus grand port du Cameroun ?", ok: "Douala", ko: ["Kribi", "Limbé", "Garoua"] },
      { q: "Quelle ressource naturelle le Cameroun extrait-il et exporte-t-il, notamment au large de ses côtes ?", ok: "Le pétrole", ko: ["Le charbon", "L'uranium", "Le lithium"] },
      { q: "Combien de régions compte le Cameroun ?", ok: "10", ko: ["8", "9", "12"] },
      { q: "Quelle institution émet le franc CFA utilisé au Cameroun ?", ok: "La BEAC", ko: ["La BCEAO", "La Banque mondiale", "La BAD"] },
      { q: "Quelle fête nationale est célébrée le 20 mai au Cameroun ?", ok: "La fête de l'Unité", ko: ["La fête de la Jeunesse", "La fête du Travail", "La fête de l'Assomption"] },
      { q: "Quel moyen de paiement sur téléphone, proposé par des opérateurs comme MTN et Orange, est très répandu au Cameroun ?", ok: "Le Mobile Money", ko: ["Le chèque de voyage", "Le télégramme", "Le troc"] },
      { q: "Quelle ville du sud du Cameroun abrite un port en eau profonde ?", ok: "Kribi", ko: ["Garoua", "Bertoua", "Maroua"] },
    ],
  },
  {
    id: "sagesse",
    name: "La Sagesse",
    subtitle: "Mémoire et traditions",
    emoji: "🌳",
    gain: 100000,
    tint: "#4a0f1a", dark: "#330a12", accent: "#ff5a6a",
    deco: ["🌳", "📜", "🥁", "👑", "🏺"],
    questions: [
      { q: "Qui fut le premier président du Cameroun ?", ok: "Ahmadou Ahidjo", ko: ["Paul Biya", "John Ngu Foncha", "Ruben Um Nyobè"] },
      { q: "En quelle année le sud du Cameroun britannique a-t-il rejoint la République du Cameroun (réunification) ?", ok: "1961", ko: ["1960", "1972", "1984"] },
      { q: "Quelle puissance européenne a colonisé le Cameroun à partir de 1884 ?", ok: "L'Allemagne", ko: ["Le Portugal", "La Belgique", "L'Espagne"] },
      { q: "Après la Première Guerre mondiale, le Cameroun est placé sous mandat de la Société des Nations. Confié à quels deux pays ?", ok: "La France et le Royaume-Uni", ko: ["La France et l'Allemagne", "Le Royaume-Uni et la Belgique", "La France et l'Espagne"] },
      { q: "Comment s'appelle la grande fête traditionnelle du peuple Sawa, célébrée à Douala ?", ok: "Le Ngondo", ko: ["Le Nguon", "Le Dipri", "Le Fespaco"] },
      { q: "Quelle ville est la capitale du royaume Bamoun ?", ok: "Foumban", ko: ["Bafoussam", "Dschang", "Bamenda"] },
      { q: "Quel instrument à cordes accompagne les épopées orales des peuples Fang-Béti ?", ok: "Le mvet", ko: ["Le balafon", "La kora", "Le djembé"] },
      { q: "Quel surnom donne-t-on au Cameroun parce qu'il réunit les grands paysages d'Afrique ?", ok: "L'Afrique en miniature", ko: ["La Perle d'Afrique", "Le Géant de l'Afrique", "Le Pays des mille collines"] },
    ],
  },
];
