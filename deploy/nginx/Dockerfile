FROM nginx:1.25-alpine

# envsubst est fourni par gettext (pre-install sur nginx:alpine via package gettext).
RUN apk add --no-cache gettext

# La config template est injectee via variables d'environnement au demarrage
# (voir docker-compose.prod.yml et le point d'entree qui fait envsubst).
COPY default.conf /etc/nginx/templates/default.conf.template

# Les conf.d sera ecrase au demarrage par le conteneur apres envsubst.
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 80 443
