#!/usr/bin/env bash
# ============================================================
#  🕰️  L'Aventure Temporelle de l'IA — Lanceur
#  Double-cliquez sur ce script (ou sur le raccourci .desktop)
#  pour démarrer le jeu automatiquement.
# ============================================================

set -euo pipefail

# --- Répertoire du projet (là où se trouve ce script) --------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Couleurs pour le terminal (si lancé depuis un terminal) --
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Fonctions utilitaires -----------------------------------
log()   { echo -e "${CYAN}[IA Time Travel]${NC} $*"; }
ok()    { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[⚠]${NC} $*"; }
fail()  { echo -e "${RED}[✗]${NC} $*"; }

notify() {
    # Notification bureau si disponible
    if command -v notify-send &>/dev/null; then
        notify-send -i applications-games "🕰️ IA Time Travel" "$1" 2>/dev/null || true
    fi
}

show_error_dialog() {
    if command -v zenity &>/dev/null; then
        zenity --error --title="IA Time Travel - Erreur" --text="$1" --width=400 2>/dev/null || true
    fi
}

# --- 1. Vérifier Docker --------------------------------------
log "Vérification de Docker..."

if ! command -v docker &>/dev/null; then
    MSG="Docker n'est pas installé.\nInstallez-le : https://docs.docker.com/engine/install/ubuntu/"
    fail "$MSG"
    show_error_dialog "$MSG"
    exit 1
fi

if ! docker info &>/dev/null 2>&1; then
    # Docker daemon n'est pas démarré — essayer de le lancer
    warn "Le service Docker n'est pas démarré. Tentative de démarrage..."
    
    if command -v systemctl &>/dev/null; then
        # Essayer sans sudo d'abord (si l'utilisateur a les droits)
        systemctl start docker 2>/dev/null || \
        pkexec systemctl start docker 2>/dev/null || \
        {
            MSG="Impossible de démarrer le service Docker.\nLancez manuellement : sudo systemctl start docker"
            fail "$MSG"
            show_error_dialog "$MSG"
            exit 1
        }
        # Attendre que Docker soit prêt
        for i in $(seq 1 15); do
            docker info &>/dev/null 2>&1 && break
            sleep 1
        done
    fi
    
    if ! docker info &>/dev/null 2>&1; then
        MSG="Le service Docker ne répond pas.\nVérifiez avec : sudo systemctl status docker"
        fail "$MSG"
        show_error_dialog "$MSG"
        exit 1
    fi
fi

ok "Docker est opérationnel."

# --- 2. Vérifier docker compose --------------------------------
if ! docker compose version &>/dev/null 2>&1; then
    MSG="Docker Compose n'est pas disponible.\nInstallez le plugin : sudo apt install docker-compose-plugin"
    fail "$MSG"
    show_error_dialog "$MSG"
    exit 1
fi

ok "Docker Compose détecté."

# --- 3. Lancer les conteneurs ---------------------------------
log "Démarrage des services (base de données, backend, frontend)..."
notify "Démarrage du jeu en cours... ⏳"

# Afficher une fenêtre de progression avec zenity si disponible
if command -v zenity &>/dev/null; then
    (
        echo "5"
        echo "# Construction des images Docker..."
        
        # Lancer docker compose en arrière-plan
        docker compose up --build -d 2>&1 | while IFS= read -r line; do
            # On ne met pas à jour le pourcentage à chaque ligne pour éviter le spam
            echo "# $line"
        done
        
        echo "40"
        echo "# Services démarrés, attente de la base de données..."
        
        # Attendre que la base de données soit prête
        for i in $(seq 1 30); do
            if docker compose exec -T db pg_isready -U postgres &>/dev/null 2>&1; then
                break
            fi
            echo "$(( 40 + i ))"
            echo "# Attente de PostgreSQL... ($i/30)"
            sleep 2
        done
        
        echo "70"
        echo "# Base de données prête ! Attente du backend..."
        
        # Attendre que le backend réponde
        for i in $(seq 1 30); do
            if curl -sf http://localhost:8000/api/v1/chapters/ &>/dev/null 2>&1; then
                break
            fi
            echo "$(( 70 + i ))"
            echo "# Attente du backend Django... ($i/30)"
            sleep 2
        done
        
        echo "90"
        echo "# Backend prêt ! Attente du frontend..."
        
        # Attendre que le frontend réponde
        for i in $(seq 1 20); do
            if curl -sf http://localhost:5173/ &>/dev/null 2>&1; then
                break
            fi
            echo "$(( 90 + i / 2 ))"
            echo "# Attente du frontend Vite... ($i/20)"
            sleep 2
        done
        
        echo "100"
        echo "# Jeu prêt ! Ouverture du navigateur..."
    ) | zenity --progress \
        --title="🕰️ L'Aventure Temporelle de l'IA" \
        --text="Initialisation..." \
        --percentage=0 \
        --auto-close \
        --width=450 \
        2>/dev/null

    # Vérifier si l'utilisateur a annulé
    if [ $? -ne 0 ]; then
        warn "Lancement annulé par l'utilisateur."
        log "Arrêt des services..."
        docker compose down 2>/dev/null || true
        exit 0
    fi
else
    # Sans zenity, lancement simple dans le terminal
    docker compose up --build -d
    
    log "Attente que les services soient prêts..."
    
    # Attendre le backend
    for i in $(seq 1 60); do
        if curl -sf http://localhost:8000/api/v1/chapters/ &>/dev/null 2>&1; then
            ok "Backend prêt !"
            break
        fi
        sleep 2
    done
    
    # Attendre le frontend
    for i in $(seq 1 30); do
        if curl -sf http://localhost:5173/ &>/dev/null 2>&1; then
            ok "Frontend prêt !"
            break
        fi
        sleep 2
    done
fi

# --- 4. Ouvrir le navigateur ----------------------------------
log "Ouverture du navigateur..."
notify "Le jeu est prêt ! 🎮 Ouverture du navigateur..."

if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:5173" &>/dev/null 2>&1 &
elif command -v firefox &>/dev/null; then
    firefox "http://localhost:5173" &>/dev/null 2>&1 &
elif command -v google-chrome &>/dev/null; then
    google-chrome "http://localhost:5173" &>/dev/null 2>&1 &
fi

# --- 5. Afficher les infos ------------------------------------
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🕰️  L'Aventure Temporelle de l'IA est lancée !            ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  🎮 Jeu        : ${CYAN}http://localhost:5173${GREEN}                     ║${NC}"
echo -e "${GREEN}║  ⚙️  API        : ${CYAN}http://localhost:8000${GREEN}                     ║${NC}"
echo -e "${GREEN}║  🛑 Arrêter    : ${YELLOW}./stop-game.sh${GREEN}                            ║${NC}"
echo -e "${GREEN}║                  ou Ctrl+C dans ce terminal                 ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# --- 6. Garder le script actif et gérer l'arrêt propre --------
cleanup() {
    echo ""
    log "Arrêt des services..."
    notify "Arrêt du jeu en cours... 🛑"
    cd "$SCRIPT_DIR"
    docker compose down 2>/dev/null || true
    ok "Services arrêtés. À bientôt ! 👋"
    notify "Le jeu est arrêté. À bientôt ! 👋"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Suivre les logs en temps réel
docker compose logs -f 2>/dev/null || true
