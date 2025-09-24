from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('school', '0002_student_phone_unique'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='status',
            field=models.CharField(
                choices=[('PENDING','Pending'),('ACTIVE','Active'),('INACTIVE','Inactive'),('GRADUATED','Graduated')],
                default='PENDING',
                help_text='Lifecycle status. New students start as PENDING then can be set ACTIVE/INACTIVE/GRADUATED on edit.',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='type',
            field=models.CharField(choices=[('THEORY','Theory'),('PRACTICE','Practice')], default='THEORY', max_length=10),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='type',
            field=models.CharField(choices=[('THEORY','Theory'),('PRACTICE','Practice')], default='THEORY', help_text='Copied from course for quick filtering; can be overridden if both.', max_length=10),
        ),
        migrations.AlterField(
            model_name='enrollment',
            name='status',
            field=models.CharField(choices=[('IN_PROGRESS','In Progress'),('COMPLETED','Completed'),('CANCELED','Canceled')], default='IN_PROGRESS', max_length=20),
        ),
        migrations.AlterField(
            model_name='instructor',
            name='license_categories',
            field=models.CharField(help_text="Comma separated categories: e.g. 'B,BE,C' ", max_length=200),
        ),
    ]
