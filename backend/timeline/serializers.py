"""
Serializers pour l'API des événements et quiz.
"""

from rest_framework import serializers

from .models import Event, ChapterChoices


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
    Contient l'événement et les options de réponse.
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

