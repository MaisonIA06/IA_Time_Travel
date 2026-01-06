---
name: ""
overview: ""
todos: []
---

# Plan : Aventure Éducative IA (Mode Unique)

Ce plan transforme le jeu en une expérience structurée pour les collégiens : une phase d'apprentissage collective suivie d'un défi mélangé.

## 1. Simplification du Contenu (Fixtures)

-   **Fichier :** `backend/timeline/fixtures/events.json`
-   **Action :** Remplacer les termes complexes (ex: "Rétropropagation", "Transformers") par des concepts concrets (ex: "Comment l'IA apprend", "La naissance de ChatGPT").
-   **Événements cibles :**
    -   Ada Lovelace (la première programmeuse).
    -   Alan Turing (le test d'intelligence).
    -   ELIZA (le premier robot qui parle).
    -   Deep Blue (l'IA bat le champion d'échecs).
    -   Roomba (l'IA fait le ménage).
    -   AlphaGo (l'IA joue au Go).
    -   ChatGPT (l'IA qui écrit tout).

## 2. Mode Unique : "L'Aventure Temporelle"

-   **Fichiers :** `frontend/src/pages/Home.tsx`, `frontend/src/store/gameStore.ts`
-   **Action :** Supprimer le choix du mode (QCM/DnD) au profit d'un bouton unique "Lancer l'Aventure".
-   **Structure du Store :** Ajouter un état `phase` ('discovery' | 'quiz' | 'result').

## 3. Phase 1 : La Découverte (Apprentissage)

-   **Nouveau Composant :** `frontend/src/components/DiscoveryMode.tsx`
-   **Fonctionnement :**
    -   Affichage en plein écran d'un événement à la fois.
    -   **Contrôle Professeur :** Bouton "Événement Suivant" pour laisser le temps d'expliquer.
    -   **Notes Pédagogiques :** Petit encart "Le savais-tu ?" ou "Note pour le prof" pour chaque carte.

## 4. Phase 2 : Le Défi (Quiz Mélangé)

-   **Fichier :** `frontend/src/pages/Game.tsx`
-   **Action :** Une fois la découverte terminée, le quiz se lance automatiquement.
-   **Variété :** Le quiz alterne entre :
    -   **QCM simples** (4 choix d'années).
    -   **Vrai/Faux** (ex: "Deep Blue est un robot aspirateur ?").
    -   **Mini Drag & Drop** (remettre seulement 3 événements dans l'ordre).

## 5. Interface Animateur & Feedback

-   **Feedback :** Dans `frontend/src/components/FeedbackPanel.tsx`, ajouter une explication rapide après chaque réponse (même si l'élève a tort) pour renforcer l'apprentissage.
-   **Mode Classe :** S'assurer que le professeur peut mettre le jeu en pause.

## Implementation Todos

- [ ] Simplifier le fichier `events.json` avec des descriptions accessibles aux 11-15 ans. (id: `simplify-json`)
- [ ] Fusionner les modes de jeu dans `gameStore.ts` pour créer le flux "Découverte -> Quiz". (id: `unify-store`)
- [ ] Créer l'interface de la Phase de Découverte (Slideshow contrôlé). (id: `create-discovery`)
- [ ] Refondre la page `Home.tsx` pour simplifier le parcours utilisateur. (id: `simplify-home`)
- [ ] Adapter `Game.tsx` pour alterner les types de questions dynamiquement dans le quiz. (id: `mixed-quiz`)