"""
Serializers pour l'API des événements, quiz et musée virtuel.
"""

from rest_framework import serializers

from .models import Event, MuseumSheet


class EventSerializer(serializers.ModelSerializer):
    """Serializer complet pour un événement."""
    chapter_display = serializers.CharField(
        source='get_chapter_display',
        read_only=True
    )

    class Meta:
        model = Event
        fields = [
            'id', 'year', 'title', 'description_short', 'explanation',
            'chapter', 'chapter_display', 'difficulty',
            'tags', 'people', 'image_url'
        ]


class EventListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes d'événements."""
    class Meta:
        model = Event
        fields = ['id', 'year', 'title', 'chapter', 'difficulty']


class ChapterSerializer(serializers.Serializer):
    """Serializer pour la liste des chapitres."""
    id = serializers.CharField()
    name = serializers.CharField()
    event_count = serializers.IntegerField()


class QuizItemSerializer(serializers.Serializer):
    """
    Serializer pour un élément de quiz.
    `year_correct` est exposé pour alimenter les mini-jeux pédagogiques
    (duel des dates, décennie rush, etc.) qui raisonnent sur l'année.
    L'endpoint POST /api/v1/quiz/check/ reste disponible pour valider
    une réponse sans s'appuyer sur le JSON client.
    """
    event_id = serializers.IntegerField()
    prompt = serializers.CharField()
    year_correct = serializers.IntegerField()
    options_years = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    description_short = serializers.CharField()
    explanation = serializers.CharField(required=False, allow_null=True)
    difficulty = serializers.IntegerField()
    people = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    image_url = serializers.URLField(required=False, allow_null=True)


class QuizResponseSerializer(serializers.Serializer):
    """Serializer pour la réponse du quiz."""
    chapter = serializers.CharField()
    chapter_display = serializers.CharField()
    mode = serializers.CharField()
    count = serializers.IntegerField()
    items = QuizItemSerializer(many=True)


class MuseumSheetSerializer(serializers.ModelSerializer):
    """Serializer complet pour une fiche du musée virtuel."""
    event_year = serializers.IntegerField(source='event.year', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = MuseumSheet
        fields = [
            'id',
            'event',
            'event_year',
            'event_title',
            'context_long',
            'key_figures',
            'anecdote',
            'educator_tips',
            'resources',
            'print_layout_hint',
            'created_at',
            'updated_at',
        ]
