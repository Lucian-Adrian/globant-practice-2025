from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('school', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='maintenance_status',
            field=models.CharField(choices=[('OK', 'OK'), ('DUE', 'DUE'), ('OVERDUE', 'OVERDUE')], default='OK', max_length=20),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='last_service',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='next_service',
            field=models.DateField(null=True, blank=True),
        ),
    ]
