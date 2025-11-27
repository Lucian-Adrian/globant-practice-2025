from django.test import TestCase
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from school.models import ScheduledClass, ScheduledClassPattern, Course, Instructor, Resource
from school.enums import CourseType, DayOfWeek

class ValidationTestCase(TestCase):
    def setUp(self):
        self.instructor = Instructor.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="+37369123456",
            hire_date=date.today()
        )
        self.resource = Resource.objects.create(
            name="Classroom A",
            max_capacity=10
        )
        self.theory_course = Course.objects.create(
            name="Theory Course",
            type=CourseType.THEORY,
            required_lessons=10,
            price=1000,
            category="B"
        )
        self.practical_course = Course.objects.create(
            name="Practical Course",
            type=CourseType.PRACTICE,
            required_lessons=10,
            price=1000,
            category="B"
        )

    def test_scheduled_class_capacity_validation(self):
        """Test that ScheduledClass validates max_students against resource capacity."""
        # Valid case
        scheduled_class = ScheduledClass(
            course=self.theory_course,
            instructor=self.instructor,
            resource=self.resource,
            scheduled_time=date.today() + timedelta(days=1),
            duration_minutes=60,
            max_students=10  # Equal to capacity
        )
        scheduled_class.clean()  # Should not raise

        # Invalid case
        scheduled_class.max_students = 11
        with self.assertRaises(ValidationError) as cm:
            scheduled_class.clean()
        self.assertIn("Max students (11) cannot exceed resource capacity (10)", str(cm.exception))

    def test_scheduled_class_pattern_capacity_validation(self):
        """Test that ScheduledClassPattern validates default_max_students against resource capacity."""
        # Valid case
        pattern = ScheduledClassPattern(
            name="Test Pattern",
            course=self.theory_course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=[DayOfWeek.MONDAY],
            times=["10:00"],
            start_date=date.today() + timedelta(days=1),
            num_lessons=5,
            default_max_students=10
        )
        pattern.clean()  # Should not raise

        # Invalid case
        pattern.default_max_students = 11
        with self.assertRaises(ValidationError) as cm:
            pattern.clean()
        self.assertIn("Default max students (11) cannot exceed resource capacity (10)", str(cm.exception))

    def test_scheduled_class_theory_only_validation(self):
        """Test that ScheduledClass only allows THEORY courses."""
        # Valid case (Theory)
        scheduled_class = ScheduledClass(
            course=self.theory_course,
            instructor=self.instructor,
            resource=self.resource,
            scheduled_time=date.today() + timedelta(days=1),
            duration_minutes=60,
            max_students=10
        )
        scheduled_class.clean()

        # Invalid case (Practical)
        scheduled_class.course = self.practical_course
        with self.assertRaises(ValidationError) as cm:
            scheduled_class.clean()
        self.assertIn("Only theory courses are allowed for scheduled classes.", str(cm.exception))
