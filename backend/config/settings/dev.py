"""
Reglages Django pour le developpement local.

Ne JAMAIS utiliser ces reglages en production.
"""

from .base import *  # noqa: F401,F403

DEBUG = True

# En developpement, on accepte toutes les connexions pour le reseau local.
ALLOWED_HOSTS = ['*']

# CORS permissif en dev : utile pour tester depuis des appareils distants
# (tablette, mobile) sur le reseau local.
CORS_ALLOW_ALL_ORIGINS = True
