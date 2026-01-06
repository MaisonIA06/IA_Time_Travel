"""
URLs pour l'API des événements et quiz.
"""

from django.urls import path

from . import views

urlpatterns = [
    path('chapters/', views.chapters_list, name='chapters-list'),
    path('events/', views.events_list, name='events-list'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    path('quiz/', views.quiz_generate, name='quiz-generate'),
]

