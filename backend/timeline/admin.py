"""
Configuration de l'admin Django pour les événements.
"""

from django.contrib import admin

from .models import Event, MuseumSheet


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['year', 'title', 'chapter', 'difficulty', 'created_at']
    list_filter = ['chapter', 'difficulty']
    search_fields = ['title', 'description_short']
    ordering = ['year']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('year', 'title', 'description_short')
        }),
        ('Classification', {
            'fields': ('chapter', 'difficulty', 'tags', 'people')
        }),
        ('Médias', {
            'fields': ('image_url',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MuseumSheet)
class MuseumSheetAdmin(admin.ModelAdmin):
    """Administration des fiches du musée virtuel."""
    list_display = ['event', 'print_layout_hint', 'updated_at']

