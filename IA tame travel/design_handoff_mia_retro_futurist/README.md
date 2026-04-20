# Handoff — L'Aventure Temporelle de l'IA · Redesign rétro-futuriste MIA

## Overview
Refonte UI/UX complète de **L'Aventure Temporelle de l'IA**, jeu éducatif MIA
pour collégiens (11-15 ans) sur l'histoire de l'IA. Cible principale :
projection grand écran en classe, animée par un·e professeur·e.

Direction visuelle : **rétro-futuriste × brutalisme MIA**. La machine à remonter
le temps "CHRONOS-06" devient la métaphore globale — l'interface se lit comme un
instrument scientifique vintage (cadrans, jauges, flip-board de dates, papier
millimétré, tampons d'archives, overlay CRT).

## About the Design Files

Les fichiers HTML/CSS/JSX fournis sont des **références de design**, pas du code
de production à copier tel quel. Votre tâche est de **recréer ces maquettes dans
votre stack existante** :

- Frontend : **React 18 + TypeScript + Vite**
- Gestion d'état : **Zustand** (`src/store/gameStore.ts` — NE PAS modifier la
  logique, seulement la présentation)
- Routage : React Router (`/`, `/game`, `/end`, `/museum`)
- Styles : ajouter ces tokens dans `src/styles/theme-mai.css` (déjà
  partiellement en place) + composants avec CSS Modules ou CSS plat (suivre
  les conventions existantes dans `src/components/*.css`)

Le prototype est du React via Babel inline — le code JSX est directement
adaptable en fichiers `.tsx` de votre frontend.

## Fidelity

**High-fidelity (hifi)**. Couleurs, typographies, espacements et interactions
sont finaux. Recréez pixel-par-pixel en adaptant aux conventions du repo.

## Direction visuelle en une phrase

> Un instrument de laboratoire temporel en papier épais, lu au travers d'un
> écran cathodique — brutalisme MIA (bordures noires 3px, ombres dures décalées,
> aplats nets) mâtiné d'accessoires rétro-futuristes (flip-digits, cadrans,
> scanlines, tampons).

## Design Tokens

Toutes les valeurs sont ajustées pour s'insérer dans le `--mai-*` existant.
Aligner `theme-mai.css` sur ces valeurs (plusieurs sont déjà présentes) :

```css
:root {
  /* === Palette MIA officielle (inchangée) === */
  --mai-blue-deep:     #163458;
  --mai-blue-quantum:  #98A8C6;
  --mai-blue-lumen:    #C2D4EF;
  --mai-red-lovelace:  #994845;
  --mai-red-terra:     #AE6557;
  --mai-red-auria:     #F2B2A5;
  --mai-gray-matter:   #C0C0BE;
  --mai-green-bloom:   #E5EAA8;
  --mai-green-neura:   #F1F4D0;

  /* === Nouveaux tokens "papier/instrument" === */
  --mai-paper:         #F5F2EC;   /* fond principal */
  --mai-paper-warm:    #EFE9DA;   /* panneaux chauds */
  --mai-paper-deep:    #E8E0CC;
  --mai-ink:           #0F2238;   /* bordures, traits, texte principal */
  --mai-ink-soft:      #2B4062;   /* texte secondaire */

  /* === Typo ===
     Pogonia reste la typo de marque. Pour les chiffres, annotations et
     "sortie instrument", utiliser une mono (JetBrains Mono).               */
  --mai-font-title: 'Pogonia', 'Space Grotesk', system-ui, sans-serif;
  --mai-font-body:  'Pogonia', 'Space Grotesk', system-ui, sans-serif;
  --mai-font-mono:  'JetBrains Mono', ui-monospace, Menlo, monospace;

  /* === Bordures brutalistes (déjà en place) === */
  --mai-border-width:       2px;
  --mai-border-width-thick: 3px;   /* bordures de panels */

  /* === Ombres dures (hard shadows, pas de flou) === */
  --mai-shadow-sm:     3px 3px 0 0 var(--mai-ink);
  --mai-shadow-md:     6px 6px 0 0 var(--mai-ink);
  --mai-shadow-lg:     10px 10px 0 0 var(--mai-ink);
  --mai-shadow-accent: 6px 6px 0 0 var(--mai-red-lovelace);

  /* === Radii : STRICTEMENT 0 (brutalisme) === */
  --mai-radius-sm: 0; --mai-radius-md: 0; --mai-radius-lg: 0;

  /* === Tracking === */
  --mai-tracking-mono: 0.16em;   /* labels */
  --mai-tracking-ultra: 0.30em;  /* micro-labels "ARCHIVE", "SYS OK" */
  --mai-tracking-tight: -0.035em;/* titres display */
}
```

### Échelle typographique

| Rôle                | Font-family | Weight | Size                          | Tracking         | Transform |
|---------------------|-------------|--------|-------------------------------|------------------|-----------|
| Display (H1 accueil)| title       | 700    | clamp(3rem, 7vw, 6rem)        | -0.035em         | none      |
| H2 écrans           | title       | 700    | clamp(2.2rem, 3.6vw, 3.2rem)  | -0.03em          | none      |
| H3                  | title       | 700    | clamp(1.25rem, 2vw, 1.75rem)  | -0.02em          | none      |
| Sous-titre italique | title       | 400 *i*| 18–22px                       | 0                | none      |
| Body                | body        | 400    | 15–17px · line-height 1.45    | 0                | none      |
| Label micro         | mono        | 400    | 10–11px                       | 0.30em           | UPPERCASE |
| Label standard      | mono        | 500    | 11–12px                       | 0.16–0.20em      | UPPERCASE |
| Flip-digit (chiffre)| mono        | 700    | 20–72px (selon contexte)      | 0                | none      |

### Espacements
Échelle 4/8/12/16/24/32/40/48 px. Éviter les valeurs impaires hors `1/2px`
(traits, séparateurs).

## Primitives à ajouter au design system

### 1. `Panel`
Fond `--mai-paper` ou blanc, bordure `3px solid --mai-ink`, ombre dure
`6px 6px 0 --mai-ink` (ou `--mai-red-lovelace` pour accent). Radius 0.

### 2. `Button` (.btn)
- Base : border 3px, padding `14px 22px`, uppercase, letter-spacing 0.16em,
  weight 600, shadow `5px 5px 0 --mai-ink`.
- Hover : `translate(-2px, -2px)` + shadow `7px 7px 0`.
- Active : `translate(2px, 2px)` + shadow `2px 2px 0`.
- Variantes : `primary` (fond `--mai-blue-deep`, ombre `--mai-red-lovelace`),
  `accent` (fond `--mai-red-lovelace`), `ghost` (transparent, pas d'ombre).
- **Pas** de border-radius, **pas** de dégradé.

### 3. `FlipYear` (split-flap)
Chaque chiffre dans un bloc `--mai-ink` avec couleur `--mai-green-bloom`,
bordure 3px, trait horizontal au milieu à 49.5% pour simuler la séparation
des volets. Police mono, bold. Voir `assets/components.jsx > FlipYear`.
Tailles typiques : 20, 36, 44, 52, 72.

### 4. `Placeholder` imagery
Fond coloré (par événement) + rayures diagonales à 45° `repeating-linear-gradient`
+ cadre pointillé interne + légende mono `[ ARCHIVE ]` + titre.
**Remplacer plus tard** par les vraies illustrations/portraits.

### 5. `Dial` (cadran)
SVG-free, CSS pur : disque radial `#fff → #EFE9DA → #C0C0BE`, 11 ticks noirs
tous les 28°, aiguille colorée pivotant de -140° à +140° selon `value`
(0 → 1). Utilisé sur l'accueil (Énergie / Flux / Stabilité).

### 6. `Stamp` (tampon)
Span rotated -4° (ou ±3°), bordure 3px currentColor, padding `8px 18px`, font
mono bold, letter-spacing 0.25em. Deux petits cercles en `::before` / `::after`
pour le motif tampon. Couleurs : `--mai-red-lovelace`, `--mai-ink`,
`--mai-green-bloom`.

### 7. `Corners`
Quatre équerres 28x28, bordure 3px, placées aux 4 coins du viewport — signent
l'"instrument". Pointer-events none.

### 8. Chrome persistant (header + footer)
- **Header** (`.instrument-top`) : seal MIA + titre central ALLCAPS mono
  + "readouts" (pastille LED + texte mono). Bordure bas 3px.
- **Footer** (`.instrument-bottom`) : breadcrumb + boutons-vignettes + tag
  `MIA · 2026`. Bordure haut 3px.

### 9. Overlays
- **`.paper-bg`** : grille millimétrée (16px fin + 80px épais),
  `mix-blend-mode: multiply`, opacité 0.8.
- **`.grain`** : SVG feTurbulence inline en data-URI, opacité 0.35, multiply.
- **`.crt`** : scanlines `repeating-linear-gradient` 1px/3px en multiply +
  balayage vertical animé 6s (`crt-scan`). Doit être **désactivable** via
  Tweaks.

## Screens / Views

Référence pixels : viewport cible 1440×900 (projection classe), ratio 16:9 à
16:10 — l'architecture tient aussi en 1920×1080.

### 1. Home — `/` (HomeScreen)
**But** : accueil + présentation de la mission + bouton "Activer la machine".

**Layout** : grille 2 colonnes `1.1fr | 1fr`, séparateur 3px.
- **Gauche (papier)** :
  - Stamp `MIA — Édition 2026` + label `Dossier N°IA-001`
  - Label accent `Mission Intelligence Artificielle présente`
  - Titre display 3 lignes : "L'Aventure / **Temporelle** / de l'*I.A.*"
    — le mot "Temporelle" dans un bloc `--mai-ink` texte `--mai-green-bloom`,
    rotation -1°, shadow `6px 6px 0 --mai-red-lovelace`
    — "I.A." en italique couleur `--mai-red-lovelace`.
  - Paragraphe intro 17px, line-height 1.45, max 520px.
  - CTA row : `btn primary` "▶ Activer la machine" + `btn ghost` "Consulter
    les archives".
  - Strip stats 4 colonnes : `08 ÉPOQUES / 4 MINI-JEUX / 45' DURÉE / 11-15 ÂGES`.
- **Droite (panneau instrument, fond `--mai-paper-warm`)** :
  - Bandeau "Unité Chronologique / Modèle MIA-VIII" + `CHRONOS-06` mono 22px
    + jauge LED 5 segments qui se remplissent (animation 1%/80ms).
  - Écran central `--mai-ink`, 4 cercles concentriques vert bloom translucide,
    aiguille verte qui tourne (8s linear infinite), **8 points** répartis en
    cercle (un par événement) aux couleurs terra/green/blue, chaque point avec
    un ring pulsant (`pulseRing` 2.4s) et l'année affichée dessous en mono.
    Au centre : label `DESTINATION`, `FlipYear` 1843 (size 52), puis
    `↔ 2 0 2 2` vert.
  - Bas : 3 cadrans (`Dial`) Énergie/Flux/Stabilité + journal de bord mono
    avec 3 lignes `> Condensateurs en charge…`.

**Comportement** :
- Bouton primary → `setView('discovery')`, reset `discoveryIdx`.
- Bouton ghost → `setView('museum')`.

### 2. Discovery — slideshow animateur (DiscoveryScreen)
**But** : l'animateur présente chaque événement à la classe, un par page.

**Layout** : grille 2 colonnes `1.1fr | 1fr`.
- **Gauche (papier warm)** :
  - Watermark année gigantesque (360px, opacité 0.06) en bas-droite.
  - Header : label chapitre + label accent catégorie + compteur `[ 01 / 08 ]`.
  - `FlipYear` 72.
  - H2 titre événement.
  - Sous-titre italique `« ... »` rouge lovelace.
  - Paragraphe court 17px (max 560px).
  - **Panel "Le savais-tu ?"** : fond `--mai-green-neura`, bordure 3px,
    shadow `5px 5px 0 --mai-ink`, label mono + phrase display 16px.
  - Bas : hint mono `◀ → Utilisez les flèches` + boutons Précédent/Suivant.
    Dernière slide : bouton devient `accent` "Lancer le quiz →".
- **Droite (fond `--mai-ink`, texte blanc)** :
  - Header : `Spécimen Chronologique` + coordonnées géographiques fantaisistes
    `LAT X° N · LONG Y° E` (`--mai-green-bloom`).
  - `Placeholder` plein-bleed, avec :
    - overlay scanlines horizontales 2px/3px `rgba(194,212,239,0.08)`
    - 4 crosshairs vert bloom aux coins
    - `Stamp Archivé` vert, rotation -4°, bas-droite
  - Strip meta 3 cellules : Lieu / Année / Catégorie (bordures verticales
    `rgba(194,212,239,0.3)`).
  - Barre de progression tout en bas : segments verts bloom pour les slides
    visitées, fond translucide sinon.

**Comportement** :
- `ArrowRight` = suivant, `ArrowLeft` = précédent.
- Transition `fadeInUp` 380ms à chaque changement.

### 3. Quiz — QCM (QuizScreen)
**Layout** : 2 colonnes `1fr | 1.3fr`.
- **Gauche (papier warm)** : timer mono en haut-droite (vire rouge si
  `elapsed > 5s`), `FlipYear` caché (seul le titre s'affiche), placeholder
  image 220px, paragraphe court, puis strip score (Score / Série ×N / Bonnes
  réponses N/8).
- **Droite** : 2×2 grille d'options. Chaque option = bouton blanc, bordure 3px,
  shadow 6px, label `OPTION A`, `FlipYear` 44.
  - Après click : bonne réponse vire `--mai-green-bloom`, mauvaise vire
    `--mai-red-auria`, les autres s'atténuent. Un `Stamp` "Correct" / "Erreur"
    apparaît dans la carte cliquée.
  - Panel feedback en dessous : fond vert-neura si correct (ombre `--mai-ink`)
    ou papier-warm si faux (ombre `--mai-red-lovelace`) avec gain de points
    affiché et phrase "Le savais-tu ?".
- Bouton primary "Question suivante →" / "Voir les résultats →" apparaît
  après réponse.

**Scoring** (identique au repo — à lire depuis `gameStore.ts`) :
- +100 base + bonus vitesse `max(0, 50 - floor(elapsed * 10))`.
- -30 si faux, score floor à 0.
- streak += 1 si correct, reset sinon.

### 4. Mini-jeux (MiniGamesHub)
**Layout** : tabs horizontales en haut (4 jeux) + viewport plein.

Tab active : fond `--mai-ink`, texte blanc, label mono `JEU / 0N` + titre
display 18.

#### 4a. Duel des dates (DuelGame)
Deux cartes événement côte à côte, séparées par un bandeau central
`--mai-ink` 80px de large avec "VS" display 38. Date masquée jusqu'au clic,
puis `FlipYear` révélé + stamp "Plus ancien" sur la bonne carte. +50 pts.

#### 4b. Décennie Rush (DecadeRushGame)
File d'attente (cards cliquables, bordure 2px) en haut + grille de 6 slots
décennie en bas (pointillés 3px). Click événement → click décennie → placé.
Affichage ✓/✗ en live selon exactitude.

#### 4c. Avant ou Après (BeforeAfterGame)
2 panels :
- **Gauche (papier warm)** : événement + résumé + `FlipYear` (apparaît après
  réponse).
- **Droite (dark `--mai-ink`, shadow `--mai-red-lovelace`)** : `FlipYear` de
  l'année pivot + 2 gros boutons "← Avant" / "Après →" 26px.
Bonne réponse : +60, fond vert-bloom. Mauvaise : fond red-auria.

#### 4d. Course contre le Temps (TimeRaceGame)
Timer 45s global, barre de progression pleine largeur (vert bloom → rouge si
<10s). Panel événement gauche (vire vert-neura bonne rép / red-auria mauvaise,
transition 180ms), 4 options grille 2×2 à droite. +30 pts par bonne réponse,
pas de pénalité.

### 5. Result — Rapport de mission (ResultScreen)
**Layout** : 2 colonnes `1.2fr | 1fr`.
- **Gauche (white, shadow `10px 10px 0 --mai-red-lovelace`)** :
  - Watermark "FIN" 280px rouge lovelace 0.06.
  - Labels "Rapport de mission" + "Classé Confidentiel".
  - Rang agent (calcul : >=80% "Historien·ne Temporel·le", >=60% "Agent",
    >=40% "Cadet·te", sinon "Apprenti·e") — display géant coloré selon rang.
  - Strip 3 cellules : Score / Correctes N/8 / Précision %.
  - Barre de progression 28px hauteur, remplie vert bloom à `pct%`, texte
    centré `X% DE LA FRISE RECONSTITUÉE`.
  - CTAs "Nouvelle mission" (primary, reset état) + "Ouvrir les archives".
- **Droite (paper-warm)** : liste frise — une ligne par événement avec mini
  `FlipYear` 20 + titre + chapitre + case à cocher vert/gris.

### 6. Museum — Archives (MuseumScreen)
Easter-egg "fiches musée".
**Layout** : sidebar 280px + contenu.
- **Sidebar (paper-warm)** : liste de 8 fiches cliquables. Fiche active =
  fond `--mai-ink`, texte blanc, shadow `3px 3px 0 --mai-red-lovelace`.
- **Contenu** : grid 2 colonnes.
  - Header pleine largeur : label fiche + titre display + sous-titre italique
    rouge + Stamp "Archive · YYYY" + bouton retour.
  - Col 1 : placeholder portrait 360px + strip meta 3 cellules
    (Année/Lieu/Catégorie).
  - Col 2 : Résumé body 17px + Panel "Le savais-tu ?" vert-neura + Panel
    dark "Coordonnées temporelles" avec `FlipYear` 44 et coord mono.

## Interactions & Behavior

### Transitions
- Écran → écran : fade 200ms (laisser React gérer).
- Card reveal (découverte, quiz) : `fadeInUp` 380ms cubic-bezier(0.2, 0, 0, 1).
- Boutons : shadow + translate 120ms.
- Feedback réponse : changement de fond 180-220ms.

### Hover / Active (boutons)
```
.btn:hover  { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--mai-ink); }
.btn:active { transform: translate(2px, 2px);   box-shadow: 2px 2px 0 var(--mai-ink); }
```

### Focus
```
outline: 3px solid var(--mai-red-lovelace); outline-offset: 2px;
```
(Pas de `outline: none`.)

### Responsive
Cible principale : 1280-1920 de large. En dessous de 1100, passer la plupart
des grilles 2 colonnes en stack vertical. Mobile n'est pas prioritaire
(usage = grand écran classe), mais tablette animateur (≥1024) doit
rester utilisable.

### CRT / Grain (Tweaks)
- CRT **activable** (défaut ON en classe, mais peut fatiguer les yeux sur
  longue session → toggle).
- Grain : pareil, toggle dans Tweaks.
- Implémenter en overlay global z-index 60, `pointer-events: none`,
  `mix-blend-mode: multiply`.

## State Management

Intégrer dans le `useGameStore` existant (Zustand) — **ne pas dupliquer**. Les
nouveaux écrans lisent `phase`, `quizItems`, `score`, `streak`, `correctCount`,
`currentIndex` déjà présents. Ajouts suggérés :
- `settings: { crt: boolean, grain: boolean }` persistés en `localStorage`.
- `miniGameSelection: MiniGameType` pour le hub mini-jeux standalone.

Le prototype HTML utilise un state local `state.view` pour simuler les routes —
dans votre repo, garder React Router (`/`, `/game`, `/end`, `/museum`).

## Assets

### À intégrer (depuis `design/charte/`)
- `MIA_Couleur.png` — logo couleur, header si besoin
- `MIA_Blanc.png` — logo blanc pour fond sombre (écran Discovery droite,
  panel "Coordonnées temporelles")
- `MIA-IconsBleu_*.png` / `MIA-IconsTerraCotta_*.png` — 11 pictos officiels
  disponibles (Atelier, Scolaire, Inspirer, Robotique, Sensibiliser…).
  Les utiliser pour typer les chapitres ou les cartes événement.
- `Avatar_bleu.png` / `Avatar_rouge.png` — avatars Agent Temporel·le à
  afficher sur l'écran de résultats (à côté du rang).

### Portraits historiques
Le prototype utilise des **placeholders rayés** (cf `Placeholder` component).
Il faudra les remplacer par des portraits N&B des personnages — Ada Lovelace,
Turing, Weizenbaum, Kasparov, Lee Sedol, etc. (domaine public ou sous
licence libre). Garder le traitement **monochrome teinté** selon la couleur
d'événement (multiply + overlay couleur).

### Typo
- **Pogonia** (déjà en place via `@font-face` dans `theme-mai.css`) — titres,
  body, boutons.
- **JetBrains Mono** (Google Fonts) — chiffres `FlipYear`, tous les labels
  uppercase, readouts, coordonnées. **À ajouter** au projet :
  ```html
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  ```

## Fichiers fournis

```
design_handoff_mia_retro_futurist/
├── README.md                              ← ce fichier
├── L'Aventure Temporelle MIA.html         ← prototype complet (ouvrir dans navigateur)
├── screenshots/                           ← captures PNG des 10 écrans
│   ├── 01-home.png
│   ├── 02-discovery.png
│   ├── 03-quiz.png
│   ├── 04-quiz-feedback.png
│   ├── 05-minigames-duel.png
│   ├── 06-minigames-decade.png
│   ├── 07-minigames-beforeafter.png
│   ├── 08-minigames-race.png
│   ├── 09-result.png
│   └── 10-museum.png
└── assets/
    ├── styles.css                         ← tokens + primitives CSS
    ├── data.js                            ← catalogue d'événements de démo
    ├── components.jsx                     ← FlipYear, Dial, Placeholder, Stamp…
    ├── screen-home.jsx
    ├── screen-discovery.jsx
    ├── screen-quiz.jsx
    ├── screen-minigames.jsx               ← 4 mini-jeux (Duel, Décennie, Avant/Après, Course)
    └── screen-result-museum.jsx
```

## Plan d'intégration recommandé

1. **Tokens** — mettre à jour `theme-mai.css` avec `--mai-paper*`, `--mai-ink*`,
   ombres, tracking, fonts (ajouter JetBrains Mono).
2. **Primitives** — créer `src/components/ui/` :
   - `FlipYear.tsx`, `FlipYear.css`
   - `Dial.tsx`, `Dial.css`
   - `Stamp.tsx`, `Stamp.css`
   - `Placeholder.tsx`, `Placeholder.css`
   - Panel/Button/Label de base (si absents).
3. **Chrome** — `src/layouts/InstrumentLayout.tsx` (header + footer +
   overlays CRT/grain/grain + `Corners`). Wrapper de `<Outlet/>`.
4. **Écrans** — remplacer un à un : Home, Game (Discovery → Quiz → Feedback
   → Result), MiniGames, Museum. Brancher le store existant au lieu du state
   local.
5. **Settings** — panneau Tweaks → traduire en page Settings animateur ou
   raccourci clavier `s` pour toggle CRT/grain.
6. **Assets** — brancher les vrais portraits + icônes MIA pour typer les
   chapitres.

## Ce qu'il FAUT garder de l'existant

- `gameStore.ts` (logique de scoring, phases, mini-games dispatch)
- API client `src/api/client.ts` (dérivation dynamique de l'URL)
- Routing `App.tsx`
- i18n FR — **tout le texte** est en français, garder cette contrainte

## Ce qu'il FAUT remplacer

- Tous les `.css` de `src/components/` (look cyber/neon legacy)
- Composants `CyberGrid`, `GlitchText`, `HolographicCard`, `TimeVortex` —
  supprimer ou renommer en variantes "museum only" si vous tenez à les garder
  comme easter-egg.
- `src/styles/variables.css` (legacy cyber) → consolider dans `theme-mai.css`.

## Ouverture des maquettes

Ouvrez `L'Aventure Temporelle MIA.html` dans un navigateur moderne (Chrome/
Firefox). Navigation :
- Barre inférieure : sauter d'un écran à l'autre.
- ← → sur l'écran Découverte.
- Mini-jeux : 4 tabs en haut de l'écran Mini-jeux.
- Tweaks : bouton "Tweaks" dans la toolbar (dans Claude.ai) pour toggler
  CRT/grain et réinitialiser la session.

---

*Direction : MIA — Mission Intelligence Artificielle. Édition 2026.*
