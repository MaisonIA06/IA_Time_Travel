"""
URLs pour l'API des événements, quiz et musée virtuel.
"""

from django.urls import path

from . import views

urlpatterns = [
    path('chapters/', views.chapters_list, name='chapters-list'),
    path('events/', views.events_list, name='events-list'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    path('quiz/', views.quiz_generate, name='quiz-generate'),
    path('quiz/check/', views.quiz_check, name='quiz-check'),
    path('museum/sheets/', views.museum_sheets_list, name='museum-sheets-list'),
    path('museum/sheets/<int:event_id>/', views.museum_sheet_detail, name='museum-sheet-detail'),
]
