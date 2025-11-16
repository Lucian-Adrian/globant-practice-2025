from django.test import TestCase
from school.models import ScheduledClassPattern, ScheduledClass, Student, Course, Instructor, Resource
from datetime import date

class ScheduledClassPatternTestCase(TestCase):
    def setUp(self):
        # Create test students
        self.student1 = Student.objects.create(
            first_name="Alice", 
            last_name="Smith",
            email="alice@example.com",
            phone_number="+37360111222",
            date_of_birth="2000-01-01"
        )
        self.student2 = Student.objects.create(
            first_name="Bob", 
            last_name="Jones",
            email="bob@example.com",
            phone_number="+37360111233",
            date_of_birth="2000-01-01"
        )
        
        # Create required related objects
        self.course = Course.objects.create(
            name="Test Course",
            category="B",
            type="THEORY",
            description="Test course",
            price=100.00,
            required_lessons=10
        )
        self.instructor = Instructor.objects.create(
            first_name="Test",
            last_name="Instructor", 
            email="instructor@test.com",
            phone_number="+37360111244",
            hire_date="2020-01-01",
            license_categories="B"
        )
        self.resource = Resource.objects.create(
            name="Test Classroom",
            max_capacity=30,
            category="B",
            is_available=True
        )
        
        # Create a ScheduledClassPattern
        self.pattern = ScheduledClassPattern.objects.create(
            name="Test Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['MONDAY', 'WEDNESDAY', 'FRIDAY'],  # Use string values
            times=["09:00", "14:00"],  # Use strings, not time objects
            start_date=date.today(),
            num_lessons=6,
            max_students=25,
        )
        # Associate students with the pattern
        self.pattern.students.set([self.student1, self.student2])

    def test_generate_and_bulk_create_classes(self):
        # Generate scheduled classes
        classes = self.pattern.generate_scheduled_classes()
        self.assertTrue(classes, "No classes generated from pattern")
        # Bulk create classes
        ScheduledClass.objects.bulk_create(classes)
        # Check that classes were created
        created_classes = ScheduledClass.objects.filter(pattern=self.pattern)
        self.assertEqual(created_classes.count(), len(classes))
        # Check that students are associated with the pattern
        students_names = list(self.pattern.students.values_list('first_name', flat=True))
        self.assertListEqual(sorted(students_names), sorted(["Alice", "Bob"]))
        # Optionally, check class details
        for cls in created_classes:
            self.assertEqual(cls.pattern, self.pattern)
            self.assertIn(cls.scheduled_time.strftime('%H:%M'), self.pattern.times)

    def test_pattern_fields(self):
        self.assertEqual(self.pattern.name, "Test Pattern")
        self.assertEqual(self.pattern.recurrence_days, ['MONDAY', 'WEDNESDAY', 'FRIDAY'])
        self.assertEqual(self.pattern.times, ["09:00", "14:00"])
        self.assertIsInstance(self.pattern.start_date, date)