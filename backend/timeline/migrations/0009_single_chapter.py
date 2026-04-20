from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("timeline", "0008_museumsheet_timestamps_nullable"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="chapter",
            field=models.CharField(
                choices=[("chapter_1", "L'Aventure de l'IA (1843-2024)")],
                help_text="Chapitre de l'histoire de l'IA",
                max_length=20,
                verbose_name="Chapitre",
            ),
        ),
    ]
