# IA Time Traveler 🕰️

> Jeu éducatif pour découvrir l'histoire de l'Intelligence Artificielle

**IA Time Traveler** est une WebApp éducative destinée aux collégiens. Les élèves incarnent des "agents temporels" et doivent reconstruire l'histoire de l'IA en plaçant des événements sur une frise chronologique.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Fonctionnalités

- **Quiz chronologique** : Deviner l'année des événements majeurs de l'IA
- **Mode Drag & Drop** : Placer les événements sur une frise interactive
- **Mini-jeux** : Remettre en ordre, Vrai/Faux
- **Design futuriste** : Interface dark avec effets néon et canvas interactif

## 🏗️ Architecture

```
IA Time Travel/
├── backend/          # Django + DRF
│   ├── config/       # Configuration Django
│   └── timeline/     # App événements et quiz
├── frontend/         # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── pages/        # Pages de l'application
│   │   ├── games/        # Mini-jeux
│   │   ├── store/        # État global (Zustand)
│   │   └── api/          # Client API
│   └── ...
└── docker-compose.yml
```

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose installés
- Git

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd "IA Time Travel"
```

2. **Créer les fichiers d'environnement**

Créer `.env` à la racine :
```env
# Database
POSTGRES_DB=ia_timetravel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Backend
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Frontend
VITE_API_URL=http://localhost:8000
```

Créer `frontend/.env` :
```env
VITE_API_URL=http://localhost:8000
```

3. **Lancer les conteneurs**
```bash
docker compose up --build
```

4. **Accéder à l'application**
- Frontend : http://localhost:5173
- API Backend : http://localhost:8000/api/v1/
- Admin Django : http://localhost:8000/admin/

### Créer un superutilisateur (optionnel)

```bash
docker compose exec backend python manage.py createsuperuser
```

## 📖 Utilisation

1. Aller sur http://localhost:5173
2. Choisir un chapitre
3. Cliquer sur "Lancer l'Aventure"
4. Parcourir les événements et répondre au quiz

## 📚 Chapitres disponibles

1. **Précurseurs & Pionniers (1800-1960)** : Ada Lovelace, Turing, Dartmouth...
2. **Programmes & Systèmes experts (1960-1990)** : ELIZA, MYCIN, premiers robots...
3. **Grandes victoires (1990-2010)** : Deep Blue, Watson, débuts du deep learning...
4. **Deep Learning & IA génératives (2010-...)** : AlphaGo, Transformers, ChatGPT...

## 🎯 Système de scoring

| Action | Points |
|--------|--------|
| Bonne réponse | +100 |
| Bonus rapidité | +0 à +50 |
| Série (streak) | +20 par bonne réponse consécutive (max +100) |
| Mauvaise réponse | -30 |

## 🛠️ Développement

### Backend (Django)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows

# Installer les dépendances
pip install -r requirements.txt

# Migrations
python manage.py migrate

# Charger les fixtures
python manage.py loaddata events

# Lancer le serveur
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

### Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/chapters/` | Liste des chapitres |
| GET | `/api/v1/events/` | Liste des événements |
| GET | `/api/v1/quiz/?chapter=...` | Générer un quiz |

## 🎨 Design System

Le projet utilise un thème "dark futuriste" avec des variables CSS centralisées :

```css
--aa-bg: #0a0a0f;          /* Fond principal */
--aa-accent: #00d4ff;       /* Accent cyan */
--aa-accent-secondary: #8b5cf6;  /* Accent violet */
--aa-success: #10b981;      /* Succès */
--aa-error: #ef4444;        /* Erreur */
```

## 📦 Technologies utilisées

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- django-cors-headers

### Frontend
- React 18
- TypeScript
- Vite
- Zustand (state management)
- @dnd-kit (drag and drop)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

Développé avec ❤️ pour l'éducation

