#!/bin/bash
cd /app
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
print('Superusers:', list(User.objects.filter(is_superuser=True).values_list('username', flat=True)))
print('All users:', list(User.objects.all().values_list('username', flat=True)))
if not User.objects.filter(username='admin').exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@yourschool.com', 'Admin123!')
    print('Superuser created!')
else:
    print('Superuser already exists')
"