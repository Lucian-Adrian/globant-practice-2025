from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("school", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="student",
            name="phone_number",
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
