#!/bin/sh
set -e

# Entrypoint Django : migrations + (re)chargement des fixtures, puis lancement du serveur.
# - En dev (DJANGO_SETTINGS_MODULE=config.settings.dev ou config.settings) : runserver.
# - En prod (DJANGO_SETTINGS_MODULE=config.settings.prod)                    : gunicorn.

SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings}"

echo "[entrypoint] DJANGO_SETTINGS_MODULE=${SETTINGS_MODULE}"

# Migrations
python manage.py migrate --noinput

# Fixtures (best effort : ignore si les fichiers ne sont pas livrés)
python manage.py loaddata events museum_sheets 2>/dev/null || true

# Collectstatic uniquement hors mode dev (pas utile avec runserver + DEBUG=True)
case "${SETTINGS_MODULE}" in
  *dev*|config.settings)
    exec python manage.py runserver 0.0.0.0:8000
    ;;
  *)
    python manage.py collectstatic --noinput || true
    exec gunicorn config.wsgi:application \
      --workers "${GUNICORN_WORKERS:-3}" \
      --bind 0.0.0.0:8000 \
      --access-logfile -
    ;;
esac
