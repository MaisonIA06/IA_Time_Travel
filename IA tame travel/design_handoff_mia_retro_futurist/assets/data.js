// data.js — catalogue d'événements & fiches musée

window.EVENTS = [
  {
    id: 1, year: 1843, title: "Ada Lovelace",
    subtitle: "La première programmeuse",
    chapter: "Les Pionniers", tag: "Programmation",
    short: "Ada Lovelace écrit le premier algorithme destiné à être exécuté par une machine — la machine analytique de Charles Babbage — près d'un siècle avant le premier ordinateur.",
    didYouKnow: "Ada imaginait déjà que les machines pourraient composer de la musique. On appelle aujourd'hui le langage Ada en son honneur.",
    place: "Londres, Angleterre",
    color: "terra"
  },
  {
    id: 2, year: 1950, title: "Le Test de Turing",
    subtitle: "Les machines peuvent-elles penser ?",
    chapter: "Les Fondations", tag: "Philosophie",
    short: "Alan Turing propose un jeu d'imitation : si une personne ne sait plus distinguer l'humain de la machine à travers un dialogue écrit, alors la machine « pense ».",
    didYouKnow: "Turing avait également aidé à casser le code allemand Enigma pendant la Seconde Guerre mondiale.",
    place: "Manchester, Angleterre",
    color: "blue"
  },
  {
    id: 3, year: 1956, title: "Conférence de Dartmouth",
    subtitle: "La naissance du mot « IA »",
    chapter: "Les Fondations", tag: "Histoire",
    short: "Pendant l'été, dix scientifiques se réunissent pour fonder un nouveau champ de recherche. John McCarthy invente l'expression « Intelligence Artificielle ».",
    didYouKnow: "Les participants pensaient résoudre l'IA en deux mois. 70 ans plus tard, on y travaille toujours.",
    place: "Dartmouth College, USA",
    color: "terra"
  },
  {
    id: 4, year: 1966, title: "ELIZA",
    subtitle: "Le premier chatbot",
    chapter: "Les Machines Parlantes", tag: "Dialogue",
    short: "Joseph Weizenbaum crée ELIZA, un programme qui simule un psychothérapeute en reformulant les phrases de son interlocuteur.",
    didYouKnow: "Certains utilisateurs étaient convaincus qu'ELIZA les comprenait vraiment. On appelle ça « l'effet ELIZA ».",
    place: "MIT, USA",
    color: "green"
  },
  {
    id: 5, year: 1997, title: "Deep Blue",
    subtitle: "L'IA bat le champion d'échecs",
    chapter: "Les Victoires", tag: "Jeux",
    short: "Le super-ordinateur Deep Blue, d'IBM, bat Garry Kasparov, champion du monde d'échecs, dans un match de 6 parties.",
    didYouKnow: "Deep Blue analysait 200 millions de positions par seconde. Un humain en analyse trois.",
    place: "New York, USA",
    color: "blue"
  },
  {
    id: 6, year: 2011, title: "Siri",
    subtitle: "L'IA dans notre poche",
    chapter: "L'IA du quotidien", tag: "Assistant",
    short: "Apple intègre Siri à l'iPhone 4S. Pour la première fois, un assistant vocal intelligent devient grand public.",
    didYouKnow: "Siri est née d'un projet militaire de la DARPA nommé CALO, racheté puis transformé par Apple.",
    place: "Cupertino, USA",
    color: "terra"
  },
  {
    id: 7, year: 2016, title: "AlphaGo",
    subtitle: "L'IA et la stratégie complexe",
    chapter: "Les Victoires", tag: "Jeux",
    short: "AlphaGo, développé par DeepMind, bat le champion Lee Sedol au jeu de go, un jeu jugé trop complexe pour une machine.",
    didYouKnow: "Le coup n°37 d'AlphaGo a stupéfait les experts — un coup qu'aucun humain n'aurait osé jouer.",
    place: "Séoul, Corée du Sud",
    color: "green"
  },
  {
    id: 8, year: 2022, title: "ChatGPT",
    subtitle: "L'IA générative pour tous",
    chapter: "L'Époque Actuelle", tag: "IA générative",
    short: "OpenAI lance ChatGPT. En 5 jours, l'outil dépasse le million d'utilisateurs — l'adoption la plus rapide de l'histoire logicielle.",
    didYouKnow: "ChatGPT a été entraîné sur l'équivalent de millions de livres — mais il ne « sait » rien, il prédit le mot suivant.",
    place: "San Francisco, USA",
    color: "terra"
  },
];

window.MINIGAMES = [
  { id: "duel", title: "Duel des dates", sub: "Lequel est le plus ancien ?" },
  { id: "decade", title: "Décennie Rush", sub: "Chaque événement à sa décennie" },
  { id: "beforeAfter", title: "Avant ou Après ?", sub: "Situer par rapport à une année" },
  { id: "race", title: "Course contre le Temps", sub: "Questions en chaîne, timer global" },
];
