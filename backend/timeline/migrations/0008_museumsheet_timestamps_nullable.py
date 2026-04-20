from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("timeline", "0007_museumsheet"),
    ]

    operations = [
        migrations.AlterField(
            model_name="museumsheet",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name="museumsheet",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, null=True, blank=True),
        ),
    ]
