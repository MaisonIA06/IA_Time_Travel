"""
Configuration pytest pour les tests Django.
"""

import pytest
from django.core.management import call_command


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    """Charge les fixtures avant les tests."""
    with django_db_blocker.unblock():
        call_command('loaddata', 'events')
        call_command('loaddata', 'museum_sheets')

