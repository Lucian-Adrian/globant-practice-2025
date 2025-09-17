"""Add missing student fields (language, balance, progress, consent).

This migration is created to apply the new Student fields to the DB
without attempting to remove vehicle fields that may be out of sync.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('school', '0006_remove_vehicle_last_service_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='language',
            field=models.CharField(max_length=8, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='student',
            name='balance',
            field=models.DecimalField(max_digits=10, decimal_places=2, default=0),
        ),
        migrations.AddField(
            model_name='student',
            name='progress_theory',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='student',
            name='progress_practical',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='student',
            name='consent',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='student',
            name='consent_timestamp',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
