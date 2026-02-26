#!/usr/bin/env bash
# Wrapper silencieux pour le lanceur .desktop
# Ouvre un terminal GNOME et lance le jeu dedans.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

gnome-terminal --title="🕰️ IA Time Travel" -- bash -c "cd \"$SCRIPT_DIR\" && ./start-game.sh; echo ''; echo 'Appuyez sur Entrée pour fermer...'; read"
