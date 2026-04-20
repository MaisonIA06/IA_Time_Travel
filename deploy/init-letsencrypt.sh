#!/usr/bin/env bash
# deploy/init-letsencrypt.sh
#
# Bootstrap des certificats Let's Encrypt pour IA Time Traveler.
# Inspire du script officiel certbot-nginx :
#   https://github.com/wmnnd/nginx-certbot/blob/master/init-letsencrypt.sh
#
# Usage :
#   1. cp .env.prod.example .env.prod && editer
#   2. Le DNS de $DOMAIN_NAME doit pointer vers ce VPS.
#   3. ./deploy/init-letsencrypt.sh
#
# Le script :
#   - cree un certificat auto-signe provisoire (pour que nginx demarre),
#   - demarre nginx,
#   - supprime le cert temporaire,
#   - demande un cert via staging Let's Encrypt (validation),
#   - en cas de succes, demande le cert prod definitif,
#   - recharge nginx.

set -euo pipefail

# -- Chargement du .env.prod -------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erreur : $ENV_FILE introuvable. Copier .env.prod.example et le remplir." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
. "$ENV_FILE"
set +a

: "${DOMAIN_NAME:?DOMAIN_NAME doit etre defini dans .env.prod}"
: "${CERTBOT_EMAIL:?CERTBOT_EMAIL doit etre defini dans .env.prod}"

DOMAINS=("$DOMAIN_NAME")
# Si DJANGO_ALLOWED_HOSTS contient www.DOMAIN_NAME, on l'ajoute aussi.
if [[ ",${DJANGO_ALLOWED_HOSTS:-}," == *",www.$DOMAIN_NAME,"* ]]; then
  DOMAINS+=("www.$DOMAIN_NAME")
fi

RSA_KEY_SIZE=4096
DATA_PATH="$PROJECT_ROOT/deploy/certbot"
STAGING=${STAGING:-1}      # 1 par defaut pour eviter le rate-limit Let's Encrypt.

COMPOSE="docker compose -f $PROJECT_ROOT/docker-compose.prod.yml --env-file $ENV_FILE"

# -- Verifications preliminaires ---------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  echo "Erreur : docker introuvable." >&2
  exit 1
fi

# -- Telechargement des options TLS recommandees -----------------------------
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] \
   || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  echo "### Telechargement des parametres TLS recommandes ..."
  mkdir -p "$DATA_PATH/conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    > "$DATA_PATH/conf/options-ssl-nginx.conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    > "$DATA_PATH/conf/ssl-dhparams.pem"
fi

# -- Creation du certificat auto-signe provisoire ----------------------------
CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME"
echo "### Creation d'un certificat provisoire pour $DOMAIN_NAME ..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN_NAME"
$COMPOSE run --rm --entrypoint sh certbot -c "\
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
    -keyout '$CERT_PATH/privkey.pem' \
    -out '$CERT_PATH/fullchain.pem' \
    -subj '/CN=localhost'"

# -- Demarrage de nginx ------------------------------------------------------
echo "### Demarrage de nginx ..."
$COMPOSE up --force-recreate -d nginx

# -- Suppression du certificat provisoire ------------------------------------
echo "### Suppression du certificat provisoire pour $DOMAIN_NAME ..."
$COMPOSE run --rm --entrypoint sh certbot -c "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN_NAME && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN_NAME && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN_NAME.conf"

# -- Demande du vrai certificat ----------------------------------------------
echo "### Demande d'un certificat Let's Encrypt pour ${DOMAINS[*]} ..."
DOMAIN_ARGS=()
for d in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=("-d" "$d")
done

STAGING_ARGS=()
if [ "$STAGING" != "0" ]; then
  STAGING_ARGS+=("--staging")
  echo "### Mode STAGING Let's Encrypt (certificat non reconnu par les navigateurs)."
  echo "### Relancer avec STAGING=0 apres validation pour obtenir le cert prod."
fi

$COMPOSE run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  "${STAGING_ARGS[@]}" \
  --email "$CERTBOT_EMAIL" \
  "${DOMAIN_ARGS[@]}" \
  --rsa-key-size "$RSA_KEY_SIZE" \
  --agree-tos \
  --no-eff-email \
  --force-renewal

# -- Rechargement de nginx ---------------------------------------------------
echo "### Rechargement de nginx ..."
$COMPOSE exec nginx nginx -s reload

echo "### Termine. Verifier https://$DOMAIN_NAME"
