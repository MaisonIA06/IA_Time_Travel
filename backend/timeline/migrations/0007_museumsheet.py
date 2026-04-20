# Generated for the MuseumSheet model (musée virtuel)

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("timeline", "0006_extend_chapter_choices"),
    ]

    operations = [
        migrations.CreateModel(
            name="MuseumSheet",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "context_long",
                    models.TextField(
                        help_text="Contexte historique étendu, ton ludique-médiateur"
                    ),
                ),
                (
                    "key_figures",
                    models.JSONField(
                        default=list,
                        help_text="Liste d'objets {name, role, mini_bio}",
                    ),
                ),
                (
                    "anecdote",
                    models.TextField(
                        help_text="Anecdote punchy pour capter l'attention"
                    ),
                ),
                (
                    "educator_tips",
                    models.JSONField(
                        default=list,
                        help_text="3-4 pistes d'animation",
                    ),
                ),
                (
                    "resources",
                    models.JSONField(
                        default=list,
                        help_text="Liens {label, url}",
                    ),
                ),
                (
                    "print_layout_hint",
                    models.CharField(
                        blank=True,
                        default="portrait",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "event",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="museum_sheet",
                        to="timeline.event",
                    ),
                ),
            ],
            options={
                "verbose_name": "Fiche musée",
                "verbose_name_plural": "Fiches musée",
            },
        ),
    ]
