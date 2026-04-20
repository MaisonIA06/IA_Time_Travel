# Guide de déploiement en production (VPS)

Ce guide vous accompagne pas-à-pas pour déployer **L'Aventure Temporelle de l'IA**
sur un serveur Linux accessible publiquement (VPS). Il s'adresse à un·e
administrateur·trice système, et suppose un accès root (ou `sudo`) sur la
machine cible.

> Objectif : obtenir une instance sécurisée, servie en HTTPS, accessible via
> votre nom de domaine, et redémarrant automatiquement après un reboot.

---

## 1. Pré-requis côté VPS

| Ressource | Valeur recommandée |
|-----------|--------------------|
| Système | **Ubuntu 22.04 LTS** (Debian 12 compatible) |
| CPU | 2 vCPU minimum |
| RAM | 4 Go minimum (2 Go possible mais juste) |
| Disque | 20 Go SSD |
| Ports ouverts | **80/tcp** et **443/tcp** (entrée) |
| Nom de domaine | un enregistrement `A` pointant vers l'IP publique du VPS |
| Utilisateur | un compte non-root avec `sudo` (ex. `deploy`) |

Vérifiez que votre domaine répond bien :

```bash
dig +short votredomaine.com
# Doit renvoyer l'IP publique de votre VPS
```

Pensez à ouvrir les ports sur le pare-feu :

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt challenge)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 2. Installer Docker et Docker Compose v2

```bash
# Dépendances
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Clé GPG officielle
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installation
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
                        docker-buildx-plugin docker-compose-plugin

# Autoriser votre utilisateur à utiliser Docker sans sudo
sudo usermod -aG docker $USER
# Reconnectez-vous (ou `newgrp docker`) pour que le groupe soit actif
```

Vérification :

```bash
docker --version          # Docker Engine >= 24
docker compose version    # Docker Compose v2.x
```

---

## 3. Cloner le dépôt

Par convention on place les services dans `/opt` :

```bash
sudo mkdir -p /opt/ia-time-travel
sudo chown $USER:$USER /opt/ia-time-travel
git clone https://github.com/MaisonIA06/IA_Time_Travel.git /opt/ia-time-travel
cd /opt/ia-time-travel
```

---

## 4. Configurer les variables d'environnement

Copiez le gabarit fourni et éditez-le :

```bash
cp .env.prod.example .env.prod
```

Générez une clé secrète Django robuste :

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Ouvrez `.env.prod` et remplissez **toutes** les variables :

```dotenv
# Domaine
DOMAIN=votredomaine.com
LETSENCRYPT_EMAIL=admin@votredomaine.com

# Django
SECRET_KEY=<collez ici la sortie de la commande précédente>
DEBUG=False
ALLOWED_HOSTS=votredomaine.com
CORS_ALLOWED_ORIGINS=https://votredomaine.com

# Base de données
POSTGRES_DB=ia_timetravel
POSTGRES_USER=ia_timetravel
POSTGRES_PASSWORD=<mot de passe fort, aléatoire>
```

> Conseil : `.env.prod` contient des secrets — il est ignoré par Git.
> Ne le copiez **jamais** dans un canal public.

Restreignez les droits :

```bash
chmod 600 .env.prod
```

---

## 5. Obtenir le premier certificat Let's Encrypt

Le script `deploy/init-letsencrypt.sh` orchestre le premier échange avec
Let's Encrypt (certificat factice, démarrage de nginx, remplacement par le vrai
certificat) :

```bash
./deploy/init-letsencrypt.sh
```

À l'issue de l'exécution, vous devez voir :

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/votredomaine.com/fullchain.pem
```

> Si vous voyez `Timeout during connect` : vérifiez que les ports 80/443
> sont bien ouverts et que le DNS est propagé. Relancez ensuite.

---

## 6. Lancer la pile de production

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Les services démarrent :

- **db** : PostgreSQL 15 (volume persistant `postgres_data`)
- **backend** : Django + Gunicorn
- **frontend** : build statique servi par nginx
- **nginx** : reverse-proxy HTTPS
- **certbot** : renouvelle les certificats en tâche de fond

Les migrations Django et le `loaddata events` s'exécutent automatiquement au
démarrage du conteneur backend.

---

## 7. Vérifications

Statut des conteneurs :

```bash
docker compose -f docker-compose.prod.yml ps
# Tous les services doivent être "Up" et (pour la db) "healthy"
```

Test de l'API publique :

```bash
curl -I https://votredomaine.com/api/v1/chapters/
# HTTP/2 200
```

Ouvrez ensuite `https://votredomaine.com` dans un navigateur : vous devez
accéder à la page d'accueil de l'Aventure Temporelle.

---

## 8. Maintenance au quotidien

Toutes les commandes ci-dessous se lancent depuis `/opt/ia-time-travel`, avec
`docker compose -f docker-compose.prod.yml --env-file .env.prod`. On l'abrège
ici en `docker compose` pour la lisibilité.

### Lire les logs

```bash
# Tous les services en temps réel
docker compose logs -f

# Un seul service
docker compose logs -f backend
docker compose logs -f nginx
```

### Sauvegarder la base

```bash
# Sourcez .env.prod pour exposer $POSTGRES_USER / $POSTGRES_DB
set -a; source .env.prod; set +a

docker compose exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > backup-$(date +%F).sql
```

> À planifier dans un cron quotidien ; copiez ensuite le fichier hors du VPS
> (S3, rsync, etc.).

### Restaurer une sauvegarde

```bash
set -a; source .env.prod; set +a
cat backup-2026-04-20.sql \
  | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

### Renouvellement TLS

Le service `certbot` du compose renouvelle automatiquement les certificats
quelques semaines avant expiration, et nginx recharge sa configuration.
**Aucune action manuelle requise.** Pour forcer un test :

```bash
docker compose exec certbot certbot renew --dry-run
```

### Rotation de `SECRET_KEY`

1. Générez une nouvelle clé avec la commande Python du chapitre 4.
2. Remplacez `SECRET_KEY=` dans `.env.prod`.
3. Redémarrez uniquement le backend :

```bash
docker compose restart backend
```

Les sessions Django actives seront invalidées — c'est le comportement attendu.

### Mise à jour du code

```bash
cd /opt/ia-time-travel
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Le flag `--build` reconstruit les images pour prendre en compte les nouvelles
dépendances backend/frontend. Les migrations s'appliquent au démarrage.

---

## 9. Dépannage (troubleshooting)

### « 502 Bad Gateway » dans le navigateur

Le backend ne répond pas à nginx.

```bash
docker compose ps                         # backend en Up ?
docker compose logs --tail=100 backend    # exception Python ? migrations KO ?
```

Vérifiez `DATABASE_URL` dans `.env.prod` et que le service `db` est *healthy*.

### « 504 Gateway Timeout »

Le backend met trop de temps à répondre, souvent une requête SQL qui bloque
ou un worker Gunicorn saturé.

```bash
docker compose logs --tail=200 backend
docker stats                  # CPU/RAM du conteneur
```

Pensez à augmenter le nombre de workers Gunicorn (`--workers`) ou à ajouter de
la RAM au VPS si la charge est réelle.

### `init-letsencrypt.sh` échoue

- `Timeout during connect` : le port 80 n'est pas ouvert ou le DNS ne pointe
  pas encore sur le VPS. Corrigez, attendez la propagation, relancez.
- `too many failed authorizations` : vous avez consommé le quota Let's Encrypt
  (5 échecs/h). Attendez 1 h ou utilisez le staging en éditant le script pour
  ajouter `--staging`.
- `Error creating new order :: Cannot issue for "..."` : le domaine ne vous
  appartient pas, ou le champ `DOMAIN` dans `.env.prod` est erroné.

### Les migrations Django échouent au démarrage

```bash
docker compose logs backend | grep -A 20 "django.db"
```

Cas fréquents :
- **Conflit de migration** après un `git pull` : `docker compose exec backend
  python manage.py migrate --fake-initial` puis relancer.
- **Base vide après restauration partielle** : rechargez les fixtures :
  `docker compose exec backend python manage.py loaddata events`.

### CORS bloqué (requêtes API refusées par le navigateur)

Symptôme : la page se charge mais l'API renvoie une erreur CORS dans la
console du navigateur.

1. Vérifiez `CORS_ALLOWED_ORIGINS` dans `.env.prod` :
   il doit contenir `https://votredomaine.com` (**avec** le schéma, **sans**
   slash final).
2. Vérifiez `ALLOWED_HOSTS` : il doit contenir le domaine servi.
3. Redémarrez le backend :
   `docker compose restart backend`.

---

## Annexe — arborescence de référence

```
/opt/ia-time-travel/
├── .env.prod                  # Secrets (non versionné)
├── .env.prod.example          # Gabarit versionné
├── docker-compose.prod.yml    # Pile de production
├── deploy/
│   ├── init-letsencrypt.sh    # Bootstrap du premier certificat
│   └── nginx/                 # Config du reverse-proxy
├── backend/
└── frontend/
```

En cas de problème persistant, exportez les logs (`docker compose logs
--no-color > debug.log`) et ouvrez une issue sur le dépôt GitHub.
