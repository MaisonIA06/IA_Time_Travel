#!/usr/bin/env bash
# ============================================================
#  🛑  L'Aventure Temporelle de l'IA — Arrêt
#  Arrête proprement tous les services du jeu.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[IA Time Travel] Arrêt des services..."

if command -v notify-send &>/dev/null; then
    notify-send -i applications-games "🕰️ IA Time Travel" "Arrêt du jeu en cours... 🛑" 2>/dev/null || true
fi

docker compose down 2>/dev/null

echo "[✓] Tous les services sont arrêtés. À bientôt ! 👋"

if command -v notify-send &>/dev/null; then
    notify-send -i applications-games "🕰️ IA Time Travel" "Le jeu est arrêté. À bientôt ! 👋" 2>/dev/null || true
fi
