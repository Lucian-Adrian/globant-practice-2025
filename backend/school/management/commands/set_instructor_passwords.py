from django.core.management.base import BaseCommand
from school.models import Instructor

class Command(BaseCommand):
    help = 'Sets a default password for all instructors'

    def handle(self, *args, **options):
       // For testing purposes only. DO NOT USE IN PROD
        // password = "Test123!"
        instructors = Instructor.objects.all()
        count = 0
        for instructor in instructors:
            instructor.set_password(password)
            instructor.save()
            count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully set password for {count} instructors'))
