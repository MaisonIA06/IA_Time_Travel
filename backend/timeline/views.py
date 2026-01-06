"""
Vues API pour les événements et les quiz.
"""

import random

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Event, ChapterChoices
from .serializers import (
    EventSerializer,
    EventListSerializer,
    ChapterSerializer,
    QuizResponseSerializer,
)


@api_view(['GET'])
def chapters_list(request):
    """
    GET /api/v1/chapters/
    Retourne la liste des chapitres disponibles avec le nombre d'événements.
    """
    chapters = []
    for choice in ChapterChoices.choices:
        chapter_id, chapter_name = choice
        event_count = Event.objects.filter(chapter=chapter_id).count()
        chapters.append({
            'id': chapter_id,
            'name': chapter_name,
            'event_count': event_count
        })

    serializer = ChapterSerializer(chapters, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def events_list(request):
    """
    GET /api/v1/events/?chapter=chapter_1
    Retourne les événements, optionnellement filtrés par chapitre.
    """
    chapter = request.query_params.get('chapter', None)

    queryset = Event.objects.all()
    if chapter:
        queryset = queryset.filter(chapter=chapter)

    serializer = EventListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def event_detail(request, pk):
    """
    GET /api/v1/events/{id}/
    Retourne les détails d'un événement.
    """
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Événement non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = EventSerializer(event)
    return Response(serializer.data)


def generate_year_options(correct_year, all_years, count=4):
    """
    Génère des options d'années pour un QCM.
    Inclut la bonne réponse et des distracteurs proches.
    """
    # Filtrer les années différentes de la bonne réponse
    other_years = [y for y in all_years if y != correct_year]

    # Trier par proximité avec la bonne année
    other_years.sort(key=lambda y: abs(y - correct_year))

    # Prendre les années les plus proches comme distracteurs
    distractors = other_years[:count - 1]

    # Si pas assez de distracteurs, générer des années proches
    while len(distractors) < count - 1:
        offset = random.choice([-5, -3, 3, 5, -10, 10])
        new_year = correct_year + offset
        if new_year not in distractors and new_year != correct_year and 1800 <= new_year <= 2025:
            distractors.append(new_year)

    # Combiner et mélanger
    options = [correct_year] + distractors[:count - 1]
    random.shuffle(options)

    return options


@api_view(['GET'])
def quiz_generate(request):
    """
    GET /api/v1/quiz/?chapter=chapter_1&count=10&mode=mcq
    Génère un set de questions quiz pour le chapitre donné.

    Params:
    - chapter: ID du chapitre (obligatoire)
    - count: Nombre de questions (défaut: 10)
    - mode: 'mcq' (QCM) ou 'dnd' (drag & drop)
    """
    chapter = request.query_params.get('chapter')
    if not chapter:
        return Response(
            {'error': 'Le paramètre chapter est obligatoire'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        count = int(request.query_params.get('count', 10))
        count = min(max(count, 1), 30)  # Entre 1 et 30
    except ValueError:
        count = 10

    mode = request.query_params.get('mode', 'mcq')
    if mode not in ['mcq', 'dnd']:
        mode = 'mcq'

    # Récupérer les événements du chapitre
    events = list(Event.objects.filter(chapter=chapter))

    if not events:
        return Response(
            {'error': f'Aucun événement trouvé pour le chapitre {chapter}'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Mélanger et limiter
    random.shuffle(events)
    selected_events = events[:count]

    # Récupérer toutes les années pour générer les options
    all_years = list(Event.objects.values_list('year', flat=True).distinct())

    # Construire les items du quiz
    items = []
    for event in selected_events:
        item = {
            'event_id': event.id,
            'prompt': event.title,
            'year_correct': event.year,
            'description_short': event.description_short,
            'explanation': event.explanation,
            'difficulty': event.difficulty,
            'people': event.people,
            'image_url': event.image_url,
        }

        # Toujours générer les options pour le mode unique
        item['options_years'] = generate_year_options(event.year, all_years)

        items.append(item)

    # Récupérer le nom du chapitre
    chapter_display = dict(ChapterChoices.choices).get(chapter, chapter)

    response_data = {
        'chapter': chapter,
        'chapter_display': chapter_display,
        'mode': mode,
        'count': len(items),
        'items': items
    }

    serializer = QuizResponseSerializer(response_data)
    return Response(serializer.data)

