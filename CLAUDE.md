# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**L'Aventure Temporelle de l'IA** — an educational web app (French, targeted at French collégiens aged 11–15) presenting the history of AI. Animated by a teacher, students go through two phases: **Découverte** (slideshow of historical events) then **Quiz** (MCQ on years + inline mini-games). Designed by the MIA (Mission Intelligence Artificielle).

The codebase comments, UI strings, and commit messages are in French — match that language when editing user-facing text.

## Common commands

All regular development runs through Docker Compose. There are two distinct stacks: **dev** (hot-reload, `DEBUG=True`, exposed ports) and **prod** (Gunicorn + nginx + HTTPS, described in `docs/DEPLOY.md`).

```bash
# --- Développement (local) ---
docker compose up --build

# --- Production (VPS) ---
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Stop (dev)
docker compose down              # or: ./stop-game.sh

# One-click launcher (dev — checks Docker, waits for health, opens browser)
./start-game.sh
```

Use the dev form for anything related to coding/testing on this machine. The prod form is only used on the deployment target; see `docs/DEPLOY.md` for the full runbook (domain, TLS, backups, rotation of `SECRET_KEY`, troubleshooting).

Endpoints once running (dev): frontend `http://localhost:5173`, API `http://localhost:8000`, Django admin `http://localhost:8000/admin/`.

**PostgreSQL port note**: Docker publishes Postgres on host port **5433** (not 5432) to avoid colliding with a local Postgres install. Inside the Docker network the port is still 5432.

### Backend (Django)

Runs inside the `backend` container. The compose command auto-runs `makemigrations`, `migrate`, and `loaddata events` on startup.

```bash
# Reload fixtures after editing backend/timeline/fixtures/events.json
docker compose exec backend python manage.py shell -c "from timeline.models import Event; Event.objects.all().delete()"
docker compose exec backend python manage.py loaddata events

# Tests (pytest-django, settings wired via backend/pytest.ini)
docker compose exec backend pytest
docker compose exec backend pytest timeline/tests.py::TestChaptersAPI
docker compose exec backend pytest -k test_list_events

# Lint (ruff config in backend/ruff.toml: line-length=100, py311, rules E/F/I/N/W)
docker compose exec backend ruff check .
docker compose exec backend ruff format .

# Create a superuser for /admin/
docker compose exec backend python manage.py createsuperuser
```

`conftest.py` loads the `events` fixture once per test session, so tests assume the full event catalogue is present.

### Frontend (React + Vite + TypeScript)

```bash
docker compose exec frontend npm run dev      # Vite dev server (auto-started by compose)
docker compose exec frontend npm run build    # tsc -b && vite build
docker compose exec frontend npm run lint     # eslint
docker compose exec frontend npm run preview  # serve built output
```

No frontend test runner is configured.

## Architecture

### Backend — single Django app `timeline`

- `timeline/models.py` — one model: `Event` (year, title, description_short, explanation, chapter, difficulty, tags JSON, people JSON, image_url). `chapter` is a `TextChoices`; currently only `chapter_1` is enabled in `ChapterChoices`, though tests and frontend types reference up to `chapter_4` — check both ends when adding chapters.
- `timeline/views.py` — function-based DRF views, no auth (`AllowAny`). Endpoints under `/api/v1/`:
  - `GET /chapters/` — list of chapters with event counts
  - `GET /events/?chapter=<id>` — events, optionally filtered
  - `GET /events/<pk>/` — event detail
  - `GET /quiz/?chapter=<id>&count=<n>&mode=mcq|dnd` — generates a randomized quiz. Years are used as the answer; distractors come from `generate_year_options()` which picks the closest other years in the catalogue and pads with `±3/5/10` offsets when needed.
  - `POST /quiz/check/` — validates a player's answer server-side (body: `{ event_id, answer }`) and returns correctness + the canonical explanation. Used to keep scoring logic authoritative and avoid leaking the answer in the bundle.
  - `GET /museum/sheets/` — returns the "fiches musée" payload (richer editorial content per event) consumed by the easter-egg `/museum` page.
- `timeline/fixtures/events.json` — source of truth for the event catalogue loaded at container start. Adding/removing events is a fixture edit, not a migration.
- `config/settings.py` — in `DEBUG` mode, `ALLOWED_HOSTS=*` and `CORS_ALLOW_ALL_ORIGINS=True` so animators can hit the backend from phones/tablets on the local LAN.

### Frontend — React SPA driven by Zustand

- Routes (`App.tsx`): `/` (Home), `/game` (Game), `/end` (End), plus `/museum` — an easter-egg page (reached from a hidden entry point in the UI) that browses the "fiches musée" returned by `GET /api/v1/museum/sheets/`. Treat `/museum` as non-essential to the main learning loop; it's a bonus exploration mode.
- `src/store/gameStore.ts` is the heart of the game loop. A single `useGameStore` holds:
  - `phase`: `'discovery' | 'quiz' | 'feedback' | 'minigame' | 'result'` — pages/components key off this.
  - Scoring rules live as module constants at the top of the file: `POINTS_CORRECT=100`, `POINTS_WRONG=-30`, `BONUS_TIME_MAX=50` (decays linearly over 5s), `STREAK_BONUS=20` per correct answer capped at `STREAK_BONUS_CAP=100`. Score floors at 0. Adjust here, not in components.
  - Mini-games are injected automatically every 3 questions via `nextQuestion()`. Implementations live in `src/games/`:
    - `OrderGame.tsx` — remise en ordre chronologique (drag-and-drop)
    - `TrueFalseGame.tsx` — vrai/faux rapide
    - **`DateDuelGame.tsx`** — *Duel des dates* : deux événements affichés côte-à-côte, le joueur choisit lequel est le plus ancien
    - **`DecadeRushGame.tsx`** — *Décennie Rush* : rattacher une série d'événements à la bonne décennie dans un temps limité
    - **`BeforeAfterGame.tsx`** — *Avant ou Après* : situer un événement par rapport à une année pivot
    - **`TimeRaceGame.tsx`** — *Course contre le temps* : enchaînement de questions avec timer global décroissant
    Each mini-game calls `completeMiniGame(bonusPoints)` to return to the quiz phase. Add new ones by extending the `MiniGameType` union and the dispatcher in `pages/Game.tsx`.
  - The `'discovery'` phase is the slideshow that precedes the quiz — `nextDiscovery()` walks through `quizItems` then flips `phase` to `'quiz'` and resets `startTime`.
- `src/api/client.ts` — thin `fetch` wrapper. **The API base URL is derived dynamically from `window.location.hostname` + port 8000** (with `VITE_API_URL` as an override). This is deliberate so remote devices on the same LAN reach the backend via the host's LAN IP. Don't hardcode `localhost`. The client also wraps `POST /quiz/check/` for authoritative answer validation.
- `src/components/` is mostly cyber/neon presentation (`CyberGrid`, `GlitchText`, `HolographicCard`, `TimeVortex`, transitions). `ui/` holds the small shared primitives. `EasterEgg/` contains hidden interactions (including a Neural Snake mini-game and the hidden entry point to `/museum`) — treat as non-essential.
- Drag-and-drop uses `@dnd-kit`; ordering/timeline mini-games need both pointer and touch sensors for tablet use.

#### Theming (MIA brand)

- `src/styles/theme-mai.css` defines the MIA brand tokens as CSS custom properties prefixed **`--mai-*`** (colors, spacing, radii, shadows) and registers the **Pogonia** custom font via `@font-face`. Reach for these tokens in new components rather than hardcoding hex values, so the visual identity stays consistent across the app and the `/museum` page.
- `src/styles/variables.css` still holds the legacy cyber/neon palette used by the gameplay screens. New UI introduced for the MIA identity (museum, marketing screens) should use the `--mai-*` tokens.

### How the two sides talk

The frontend reads event data from the API and posts answers to `/quiz/check/` for server-side validation, but **no run is persisted** — there is no "submit run" endpoint. Scores, streaks, and history live entirely in the Zustand store for a single session. If you add persistence (a `Run` model, results endpoint, etc.), expect to touch both `timeline/` and `gameStore.ts` together.

Event content (titles, descriptions, explanations, difficulty) ships through the `/quiz/` response's `items[]`, so the same `QuizItem` shape feeds both the discovery slideshow and the quiz UI — keep fields consistent when editing serializers or TypeScript types (`frontend/src/types/index.ts`).
