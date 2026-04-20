"""
Reglages Django pour la production.

La `SECRET_KEY` est lue depuis l'environnement sans valeur par defaut :
un `KeyError` au demarrage est prefere a un secret faible en production.
"""

import os

from .base import *  # noqa: F401,F403

DEBUG = False

# KeyError volontaire si la variable n'est pas definie : on refuse de
# demarrer en prod sans secret explicite.
SECRET_KEY = os.environ['SECRET_KEY']

ALLOWED_HOSTS = os.environ['DJANGO_ALLOWED_HOSTS'].split(',')

# CORS strict en production : liste blanche explicite, pas de wildcard.
CORS_ALLOWED_ORIGINS = os.environ['CORS_ALLOWED_ORIGINS'].split(',')

# Durcissement HTTPS / cookies / headers
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'same-origin'

# Fichiers statiques compresses et versionnes par WhiteNoise.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
