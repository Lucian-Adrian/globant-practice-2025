from django.test import TestCase
from django.utils import timezone

from school.models import Course, Instructor, Resource, ScheduledClass, Student


class ResourceModelTest(TestCase):
    def setUp(self):
        self.vehicle_resource = Resource.objects.create(
            name="Toyota Corolla",
            max_capacity=2,
            category="B",
            is_available=True,
            license_plate="AA123BB",
            make="Toyota",
            model="Corolla",
            year=2020,
        )
        self.classroom_resource = Resource.objects.create(
            name="Classroom A", max_capacity=30, category="B", is_available=True
        )

    def test_vehicle_resource(self):
        self.assertTrue(self.vehicle_resource.is_vehicle())
        self.assertFalse(self.vehicle_resource.is_classroom())
        self.assertEqual(self.vehicle_resource.resource_type, "Vehicle")
        self.assertEqual(str(self.vehicle_resource), "Toyota Corolla (AA123BB)")

    def test_classroom_resource(self):
        self.assertFalse(self.classroom_resource.is_vehicle())
        self.assertTrue(self.classroom_resource.is_classroom())
        self.assertEqual(self.classroom_resource.resource_type, "Classroom")
        self.assertEqual(str(self.classroom_resource), "Classroom A (Classroom)")


class ScheduledClassModelTest(TestCase):
    def setUp(self):
        self.instructor = Instructor.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="+37360111222",
            hire_date="2020-01-01",
            license_categories="B",
        )
        self.course = Course.objects.create(
            name="Category B Course",
            category="B",
            type="THEORY",
            description="Basic driving course",
            price=1000.00,
            required_lessons=20,
        )
        self.resource = Resource.objects.create(
            name="Classroom A", max_capacity=30, category="B", is_available=True
        )
        self.scheduled_class = ScheduledClass.objects.create(
            course=self.course,
            name="Monday Theory Class",
            scheduled_time=timezone.now(),
            duration_minutes=60,
            instructor=self.instructor,
            resource=self.resource,
            max_students=25,
            status="SCHEDULED",
        )

    def test_scheduled_class_creation(self):
        self.assertEqual(self.scheduled_class.name, "Monday Theory Class")
        self.assertEqual(self.scheduled_class.max_students, 25)
        self.assertEqual(self.scheduled_class.current_enrollment(), 0)
        self.assertEqual(self.scheduled_class.available_spots(), 25)
        self.assertFalse(self.scheduled_class.is_full())

    def test_student_enrollment(self):
        student = Student.objects.create(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone_number="+37360111223",
            date_of_birth="1990-01-01",
        )

        # Enroll student
        self.scheduled_class.students.add(student)

        self.assertEqual(self.scheduled_class.current_enrollment(), 1)
        self.assertEqual(self.scheduled_class.available_spots(), 24)
        self.assertFalse(self.scheduled_class.is_full())

        # Check reverse relationship
        self.assertIn(self.scheduled_class, student.scheduled_classes.all())

    def test_capacity_limits(self):
        # Create max_students students
        students = []
        for i in range(25):
            student = Student.objects.create(
                first_name=f"Student{i}",
                last_name="Test",
                email=f"student{i}@example.com",
                phone_number=f"+37360111{i:03d}",
                date_of_birth="1990-01-01",
            )
            students.append(student)

        # Enroll all students
        self.scheduled_class.students.add(*students)

        self.assertEqual(self.scheduled_class.current_enrollment(), 25)
        self.assertEqual(self.scheduled_class.available_spots(), 0)
        self.assertTrue(self.scheduled_class.is_full())
