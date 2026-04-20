# 🕰️ L'Aventure Temporelle de l'IA

> Un jeu pédagogique conçu par la **MIA** (Mission Intelligence Artificielle) pour faire découvrir l'histoire de l'IA aux collégiens.

**L'Aventure Temporelle** est une application web interactive destinée à être animée par un professeur ou un animateur. Les élèves incarnent des "agents temporels" qui doivent explorer le passé pour reconstruire la frise chronologique de l'Intelligence Artificielle.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Public](https://img.shields.io/badge/public-Collégiens-orange)
![Goal](https://img.shields.io/badge/but-Pédagogique-green)

---

## 🚀 Déploiement en production

Pour héberger l'application sur un VPS (Ubuntu, HTTPS, nom de domaine),
suivez le guide pas-à-pas : **[`docs/DEPLOY.md`](docs/DEPLOY.md)**.

Le présent README couvre uniquement l'installation en **développement local**
via Docker Compose (voir plus bas).

---

## 🎯 Objectif Pédagogique

Ce projet vise à démystifier l'Intelligence Artificielle auprès des jeunes (11-15 ans) en leur montrant que :
- L'IA n'est pas une invention magique et récente, mais le fruit d'une longue histoire.
- De grands scientifiques (hommes et femmes) ont contribué à cette évolution.
- Les concepts de base (programmation, tests, réseaux de neurones) peuvent être compris par tous.

---

## 🎮 Le Parcours de Jeu

L'expérience est conçue en deux phases complémentaires pour favoriser l'apprentissage :

### 1. Phase de Découverte (Apprentissage Collectif)
- **Slideshow interactif** : L'animateur présente chaque événement marquant sur grand écran.
- **Explications simples** : Chaque carte contient une description courte et un encadré *"Le savais-tu ?"* pour approfondir un concept sans complexité.
- **Support à l'animation** : Des notes sont présentes pour aider l'animateur à guider la discussion.

### 2. Phase de Quiz (Validation des Connaissances)
- **Mix de questions** : QCM, Vrai/Faux et mini-jeux de mise en ordre.
- **Feedback immédiat** : Après chaque réponse, une correction pédagogique rappelle l'essentiel de l'événement.
- **Système de score** : Valorise la réussite, la rapidité et la régularité (séries de bonnes réponses).

---

## 🏗️ Architecture Technique

```
IA Time Travel/
├── backend/          # Django + Django REST Framework
│   ├── config/       # Paramètres du projet
│   └── timeline/     # Gestion des événements et génération de quiz
├── frontend/         # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # UI (Design futuriste/cyber)
│   │   ├── pages/        # Découverte, Quiz, Résultats
│   │   ├── games/        # Logique des mini-jeux
│   │   └── store/        # État global (Zustand)
│   └── ...
└── docker-compose.yml
```

---

## 🚀 Installation & Démarrage

Le projet est entièrement conteneurisé pour faciliter son déploiement dans les établissements scolaires.

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/) installés.

### Lancement
1. **Démarrer les services**
   ```bash
   docker compose up --build
   ```

2. **Initialiser les données pédagogiques**
   (Dans un nouveau terminal, à la racine) :
   ```bash
   docker compose exec backend python manage.py shell -c "from timeline.models import Event; Event.objects.all().delete()"
   docker compose exec backend python manage.py loaddata events
   ```

3. **Accéder au jeu**
   - **Interface Joueur/Animateur** : [http://localhost:5173](http://localhost:5173)
   - **Administration (Backend)** : [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 📚 L'Histoire de l'IA (8 Étapes Clés)

L'aventure actuelle se concentre sur les moments fondateurs :
1. **1843** : Ada Lovelace (La première programmeuse)
2. **1950** : Le Test de Turing (Les machines peuvent-elles penser ?)
3. **1956** : Conférence de Dartmouth (La naissance du mot IA)
4. **1966** : ELIZA (Le premier chatbot)
5. **1997** : Deep Blue (L'IA bat le champion d'échecs)
6. **2011** : Siri (L'IA dans notre poche)
7. **2016** : AlphaGo (L'IA et la stratégie complexe)
8. **2022** : ChatGPT (L'IA générative pour tous)

---

## 📦 Technologies Utilisées

- **Frontend** : React 18, TypeScript, Zustand (Gestion d'état), @dnd-kit (Drag & Drop), Framer Motion.
- **Backend** : Django 4.2, Django REST Framework, PostgreSQL.
- **Design** : CSS moderne (Thème Cyber/Néon) adapté pour une lecture claire.

---

## 🤝 À propos de la MIA

La **MIA (Mission Intelligence Artificielle)** œuvre pour une meilleure compréhension des technologies de demain par les citoyens d'aujourd'hui. Ce projet est une ressource libre destinée aux enseignants et médiateurs numériques.

---
Développé avec ❤️ par la **MIA** pour l'avenir de nos collégiens.
