# Renamed class-specific fields to default values for generated classes

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('school', '0016_add_scheduled_class_students'),
    ]

    operations = [
        migrations.RenameField(
            model_name='scheduledclasspattern',
            old_name='duration_minutes',
            new_name='default_duration_minutes',
        ),
        migrations.RenameField(
            model_name='scheduledclasspattern',
            old_name='max_students',
            new_name='default_max_students',
        ),
        migrations.RemoveField(
            model_name='scheduledclasspattern',
            name='status',
        ),
    ]