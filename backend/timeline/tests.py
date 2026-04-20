"""
Tests pour l'API des événements, quiz et musée virtuel.
"""

import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from timeline.models import Event


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    """
    Vide le cache entre chaque test pour éviter la pollution du throttling DRF
    (qui stocke les compteurs dans le cache Django par défaut).
    """
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def sample_event():
    return Event.objects.create(
        year=1950,
        title="Test de Turing",
        description_short="Description test",
        chapter="chapter_1",
        difficulty=1,
        tags=["test"],
        people=["Alan Turing"]
    )


@pytest.mark.django_db
class TestChaptersAPI:
    def test_list_chapters(self, api_client):
        """Test que l'endpoint chapters retourne le chapitre unique."""
        url = reverse('chapters-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == 'chapter_1'


@pytest.mark.django_db
class TestEventsAPI:
    def test_list_events(self, api_client, sample_event):
        """Test que l'endpoint events retourne les événements."""
        url = reverse('events-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_filter_events_by_chapter(self, api_client, sample_event):
        """Test le filtre par chapitre."""
        url = reverse('events-list')
        response = api_client.get(url, {'chapter': 'chapter_1'})

        assert response.status_code == status.HTTP_200_OK
        for event in response.data:
            assert event['chapter'] == 'chapter_1'

    def test_event_detail(self, api_client, sample_event):
        """Test les détails d'un événement."""
        url = reverse('event-detail', args=[sample_event.pk])
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Test de Turing"
        assert response.data['year'] == 1950


@pytest.mark.django_db
class TestQuizAPI:
    def test_quiz_requires_chapter(self, api_client):
        """Test que le quiz requiert un chapitre."""
        url = reverse('quiz-generate')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_quiz_returns_items(self, api_client, sample_event):
        """Test que le quiz retourne des items."""
        url = reverse('quiz-generate')
        response = api_client.get(url, {'chapter': 'chapter_1', 'count': 5})

        assert response.status_code == status.HTTP_200_OK
        assert 'items' in response.data
        assert response.data['chapter'] == 'chapter_1'

    def test_quiz_mcq_has_options(self, api_client, sample_event):
        """Le mode MCQ inclut 4 options d'années."""
        url = reverse('quiz-generate')
        response = api_client.get(url, {'chapter': 'chapter_1', 'mode': 'mcq'})

        assert response.status_code == status.HTTP_200_OK
        if response.data['items']:
            item = response.data['items'][0]
            assert 'options_years' in item
            assert len(item['options_years']) == 4
            assert 'year_correct' in item
            assert item['year_correct'] == sample_event.year


@pytest.mark.django_db
class TestQuizCheckAPI:
    def test_check_correct_answer(self, api_client, sample_event):
        """Test qu'une bonne réponse est validée."""
        url = reverse('quiz-check')
        response = api_client.post(
            url,
            {'event_id': sample_event.pk, 'year': 1950},
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_correct'] is True
        assert response.data['correct_year'] == 1950

    def test_check_incorrect_answer(self, api_client, sample_event):
        """Test qu'une mauvaise réponse est invalidée et que la bonne année est renvoyée."""
        url = reverse('quiz-check')
        response = api_client.post(
            url,
            {'event_id': sample_event.pk, 'year': 1942},
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_correct'] is False
        assert response.data['correct_year'] == 1950

    def test_check_missing_fields(self, api_client):
        """Test qu'il faut fournir event_id et year."""
        url = reverse('quiz-check')
        response = api_client.post(url, {}, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_check_unknown_event(self, api_client):
        """Test qu'un event_id inconnu renvoie 404."""
        url = reverse('quiz-check')
        response = api_client.post(
            url,
            {'event_id': 999999, 'year': 1950},
            format='json'
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestMuseumAPI:
    """Tests pour l'API du musée virtuel."""

    def test_list_museum_sheets(self, api_client):
        """GET /api/v1/museum/sheets/ retourne une liste paginée."""
        url = reverse('museum-sheets-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'count' in response.data
        assert isinstance(response.data['results'], list)

    def test_museum_sheet_detail_ada(self, api_client):
        """GET /api/v1/museum/sheets/1/ retourne la fiche d'Ada Lovelace."""
        url = reverse('museum-sheet-detail', args=[1])
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['event'] == 1
        assert response.data['event_year'] == 1843
        assert 'Ada Lovelace' in response.data['event_title']
        assert 'context_long' in response.data
        assert 'key_figures' in response.data
        assert 'anecdote' in response.data

    def test_museum_sheet_detail_not_found(self, api_client):
        """GET /api/v1/museum/sheets/99999/ retourne 404."""
        url = reverse('museum-sheet-detail', args=[99999])
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestThrottling:
    def test_anon_rate_limit_60_per_min(self, api_client):
        """
        Test que la 61e requête anonyme reçoit un 429 Too Many Requests.
        La limite est fixée à 60/min pour les utilisateurs anonymes.
        """
        url = reverse('chapters-list')

        for i in range(60):
            response = api_client.get(url)
            assert response.status_code == status.HTTP_200_OK, (
                f"Requête {i + 1}/60 rejetée avec {response.status_code}"
            )

        response = api_client.get(url)
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
