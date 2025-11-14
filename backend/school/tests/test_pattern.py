from django.test import TestCase
from school.models import ScheduledClassPattern, ScheduledClass, Student
from datetime import date, time

class ScheduledClassPatternTestCase(TestCase):
    def setUp(self):
        # Create test students
        self.student1 = Student.objects.create(first_name="Alice", last_name="Smith")
        self.student2 = Student.objects.create(first_name="Bob", last_name="Jones")
        # Create a ScheduledClassPattern
        self.pattern = ScheduledClassPattern.objects.create(
            name="Test Pattern",
            recurrence_days=[0, 2, 4],  # e.g., Monday, Wednesday, Friday
            times=[time(9, 0), time(14, 0)],
            start_date=date.today(),
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
            self.assertIn(cls.scheduled_time.time(), self.pattern.times)

    def test_pattern_fields(self):
        self.assertEqual(self.pattern.name, "Test Pattern")
        self.assertEqual(self.pattern.recurrence_days, [0, 2, 4])
        self.assertEqual(self.pattern.times, [time(9, 0), time(14, 0)])
        self.assertIsInstance(self.pattern.start_date, date)