# syntax=docker/dockerfile:1.6

# ---------- Stage 1 : builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (package.json + lockfile pour build reproductible)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Sources + build statique
COPY . .
RUN npm run build


# ---------- Stage 2 : runtime ----------
FROM nginx:1.25-alpine AS runtime

# wget pour healthcheck + libcap pour autoriser le binding port 80 en non-root
RUN apk add --no-cache wget libcap \
 && setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Permissions pour exécution non-root :
# - redirection du pid hors /var/run (qui exige root)
# - chown des dossiers que nginx écrit
RUN sed -i 's|pid /var/run/nginx.pid;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
 && chown -R nginx:nginx /usr/share/nginx/html \
                       /var/cache/nginx \
                       /var/log/nginx \
                       /etc/nginx/conf.d \
 && touch /tmp/nginx.pid \
 && chown nginx:nginx /tmp/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
