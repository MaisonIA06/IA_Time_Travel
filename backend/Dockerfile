# syntax=docker/dockerfile:1.6

# ---------- Stage 1 : builder ----------
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt


# ---------- Stage 2 : runtime ----------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=config.settings

# Dépendances runtime : libpq pour psycopg2, curl pour healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# User non-root (uid 1000)
RUN groupadd --system --gid 1000 django \
 && useradd  --system --uid 1000 --gid django --home-dir /app --shell /bin/bash django

WORKDIR /app

COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
 && rm -rf /wheels

COPY . /app
RUN chmod +x /app/docker-entrypoint.sh

# Collectstatic au build : on tente d'abord prod settings, fallback dev.
# Ne doit jamais casser le build si les settings prod ne sont pas encore présents.
RUN set -eux; \
    mkdir -p /app/staticfiles; \
    (DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py collectstatic --noinput 2>/dev/null) \
      || (DJANGO_SETTINGS_MODULE=config.settings python manage.py collectstatic --noinput 2>/dev/null) \
      || echo "[build] collectstatic skipped"

RUN chown -R django:django /app

USER django

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:8000/api/v1/chapters/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
