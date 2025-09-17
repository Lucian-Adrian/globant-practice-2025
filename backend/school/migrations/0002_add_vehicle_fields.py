from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('school', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='maintenance_status',
            field=models.CharField(
                max_length=20,
                choices=[('OK', 'OK'), ('NEEDS_SERVICE', 'NEEDS_SERVICE'), ('IN_SERVICE', 'IN_SERVICE')],
                default='OK',
            ),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='vehicle',
            name='is_available',
            field=models.BooleanField(default=True),
        ),
    ]
