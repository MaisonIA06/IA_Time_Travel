"""
Tests pour l'API des événements et quiz.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from timeline.models import Event


@pytest.fixture
def api_client():
    return APIClient()


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
        """Test que l'endpoint chapters retourne tous les chapitres."""
        url = reverse('chapters-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 4

        chapter_ids = [c['id'] for c in response.data]
        assert 'chapter_1' in chapter_ids
        assert 'chapter_2' in chapter_ids
        assert 'chapter_3' in chapter_ids
        assert 'chapter_4' in chapter_ids


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
        """Test que le mode MCQ inclut des options."""
        url = reverse('quiz-generate')
        response = api_client.get(url, {'chapter': 'chapter_1', 'mode': 'mcq'})

        assert response.status_code == status.HTTP_200_OK
        if response.data['items']:
            item = response.data['items'][0]
            assert 'options_years' in item
            assert len(item['options_years']) == 4
            assert item['year_correct'] in item['options_years']

    def test_quiz_dnd_no_options(self, api_client, sample_event):
        """Test que le mode DnD n'inclut pas d'options."""
        url = reverse('quiz-generate')
        response = api_client.get(url, {'chapter': 'chapter_1', 'mode': 'dnd'})

        assert response.status_code == status.HTTP_200_OK
        if response.data['items']:
            item = response.data['items'][0]
            # En mode dnd, options_years peut être absent ou vide
            assert 'options_years' not in item or not item.get('options_years')

