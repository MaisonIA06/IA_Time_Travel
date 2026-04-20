"""
Vues API pour les événements, les quiz et le musée virtuel.
"""

import random

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Event, ChapterChoices, MuseumSheet
from .serializers import (
    EventSerializer,
    EventListSerializer,
    ChapterSerializer,
    QuizResponseSerializer,
    MuseumSheetSerializer,
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
    other_years = [y for y in all_years if y != correct_year]
    other_years.sort(key=lambda y: abs(y - correct_year))
    distractors = other_years[:count - 1]

    while len(distractors) < count - 1:
        offset = random.choice([-5, -3, 3, 5, -10, 10])
        new_year = correct_year + offset
        if new_year not in distractors and new_year != correct_year and 1800 <= new_year <= 2025:
            distractors.append(new_year)

    options = [correct_year] + distractors[:count - 1]
    random.shuffle(options)
    return options


@api_view(['GET'])
def quiz_generate(request):
    """
    GET /api/v1/quiz/?chapter=chapter_1&count=10&mode=mcq
    Génère un set de questions quiz pour le chapitre donné.

    La bonne année n'est PAS renvoyée dans le JSON : elle est vérifiée
    par l'endpoint POST /api/v1/quiz/check/ après soumission.
    """
    chapter = request.query_params.get('chapter')
    if not chapter:
        return Response(
            {'error': 'Le paramètre chapter est obligatoire'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        count = int(request.query_params.get('count', 10))
        count = min(max(count, 1), 30)
    except ValueError:
        count = 10

    mode = request.query_params.get('mode', 'mcq')
    if mode not in ['mcq', 'dnd']:
        mode = 'mcq'

    events = list(Event.objects.filter(chapter=chapter))

    if not events:
        return Response(
            {'error': f'Aucun événement trouvé pour le chapitre {chapter}'},
            status=status.HTTP_404_NOT_FOUND
        )

    random.shuffle(events)
    selected_events = events[:count]

    all_years = list(Event.objects.values_list('year', flat=True).distinct())

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
            'options_years': generate_year_options(event.year, all_years),
        }
        items.append(item)

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


@api_view(['POST'])
def quiz_check(request):
    """
    POST /api/v1/quiz/check/
    Vérifie la réponse donnée pour un événement.

    Body JSON: {"event_id": int, "year": int}
    Réponse: {"is_correct": bool, "correct_year": int}

    La bonne année n'est révélée qu'après la soumission, ce qui empêche
    l'inspection naïve du JSON /quiz/ pour tricher.
    """
    event_id = request.data.get('event_id')
    year = request.data.get('year')

    if event_id is None or year is None:
        return Response(
            {'error': 'Les champs event_id et year sont obligatoires'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        event_id = int(event_id)
        year = int(year)
    except (TypeError, ValueError):
        return Response(
            {'error': 'event_id et year doivent être des entiers'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Événement non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'is_correct': year == event.year,
        'correct_year': event.year,
    })


@api_view(['GET'])
def museum_sheets_list(request):
    """
    GET /api/v1/museum/sheets/?limit=20&offset=0
    Retourne la liste paginée des fiches du musée virtuel,
    triées par ordre chronologique.
    """
    try:
        limit = int(request.query_params.get('limit', 20))
        limit = min(max(limit, 1), 100)
    except ValueError:
        limit = 20

    try:
        offset = int(request.query_params.get('offset', 0))
        offset = max(offset, 0)
    except ValueError:
        offset = 0

    queryset = MuseumSheet.objects.select_related('event').order_by('event__year')
    total = queryset.count()
    page = queryset[offset:offset + limit]

    serializer = MuseumSheetSerializer(page, many=True)
    return Response({
        'count': total,
        'limit': limit,
        'offset': offset,
        'results': serializer.data,
    })


@api_view(['GET'])
def museum_sheet_detail(request, event_id):
    """
    GET /api/v1/museum/sheets/<event_id>/
    Retourne la fiche musée associée à l'événement identifié par event_id.
    404 si aucune fiche n'existe pour cet événement.
    """
    try:
        sheet = MuseumSheet.objects.select_related('event').get(event_id=event_id)
    except MuseumSheet.DoesNotExist:
        return Response(
            {'error': 'Fiche musée non trouvée pour cet événement'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = MuseumSheetSerializer(sheet)
    return Response(serializer.data)
