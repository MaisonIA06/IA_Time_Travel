"""
Modèles pour les événements de la frise chronologique de l'IA.
"""

from django.db import models


class ChapterChoices(models.TextChoices):
    """Chapitres de l'histoire de l'IA (4 chapitres chronologiques)."""
    CHAPTER_1 = 'chapter_1', "Les pionniers (1843-1955)"
    CHAPTER_2 = 'chapter_2', "L'âge d'or des symboles (1956-1980)"
    CHAPTER_3 = 'chapter_3', "L'hiver et le renouveau (1980-2010)"
    CHAPTER_4 = 'chapter_4', "L'IA moderne (2010-aujourd'hui)"


class Event(models.Model):
    """
    Représente un événement historique de l'IA.
    Chaque événement est associé à un chapitre et possède des métadonnées
    pour le jeu (difficulté, tags, personnes associées).
    """
    year = models.IntegerField(
        verbose_name="Année",
        help_text="Année de l'événement"
    )
    title = models.CharField(
        max_length=200,
        verbose_name="Titre",
        help_text="Titre court de l'événement"
    )
    description_short = models.TextField(
        verbose_name="Description courte",
        help_text="Description en 2-3 phrases, niveau collège"
    )
    explanation = models.TextField(
        verbose_name="Explication pédagogique",
        help_text="Encadré 'Le savais-tu ?' pour le mode découverte",
        blank=True,
        null=True
    )
    chapter = models.CharField(
        max_length=20,
        choices=ChapterChoices.choices,
        verbose_name="Chapitre",
        help_text="Chapitre de l'histoire de l'IA"
    )
    difficulty = models.IntegerField(
        default=1,
        choices=[(1, 'Facile'), (2, 'Moyen'), (3, 'Difficile')],
        verbose_name="Difficulté",
        help_text="Niveau de difficulté (1-3)"
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Tags",
        help_text="Liste de tags pour catégoriser l'événement"
    )
    people = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Personnalités",
        help_text="Personnes associées à l'événement"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="URL de l'image",
        help_text="URL optionnelle d'une image illustrative"
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['year']
        verbose_name = "Événement"
        verbose_name_plural = "Événements"

    def __str__(self):
        return f"{self.year} - {self.title}"


class MuseumSheet(models.Model):
    """
    Fiche pédagogique « Musée virtuel » associée à un événement.
    Contient un contexte historique étendu, les personnages clés,
    une anecdote, des pistes d'animation et des ressources externes.
    """
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name='museum_sheet'
    )
    context_long = models.TextField(
        help_text="Contexte historique étendu, ton ludique-médiateur"
    )
    key_figures = models.JSONField(
        default=list,
        help_text="Liste d'objets {name, role, mini_bio}"
    )
    anecdote = models.TextField(
        help_text="Anecdote punchy pour capter l'attention"
    )
    educator_tips = models.JSONField(
        default=list,
        help_text="3-4 pistes d'animation"
    )
    resources = models.JSONField(
        default=list,
        help_text="Liens {label, url}"
    )
    print_layout_hint = models.CharField(
        max_length=20,
        default='portrait',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Fiche musée"
        verbose_name_plural = "Fiches musée"

    def __str__(self):
        return f"Fiche — {self.event}"
