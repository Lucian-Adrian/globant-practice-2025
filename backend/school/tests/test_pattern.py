from django.test import TestCase
from school.models import ScheduledClassPattern, ScheduledClass, Student, Course, Instructor, Resource
from datetime import date, timedelta
from django.core.exceptions import ValidationError
from school.serializers import ScheduledClassPatternSerializer
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

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

    def test_validation(self):
        # Test empty recurrence_days
        pattern = ScheduledClassPattern(
            name="Invalid",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=[],
            times=["09:00"],
            start_date=date.today(),
            num_lessons=1,
            max_students=10
        )
        with self.assertRaises(ValidationError):
            pattern.full_clean()
        
        # Test empty times
        pattern.times = []
        pattern.recurrence_days = ['MONDAY']
        with self.assertRaises(ValidationError):
            pattern.full_clean()
        
        # Test past start_date
        pattern.times = ["09:00"]
        pattern.start_date = date.today() - timedelta(days=1)
        with self.assertRaises(ValidationError):
            pattern.full_clean()

    def test_serializer_validation(self):
        data = {
            'name': 'Test Pattern',
            'course_id': self.course.id,
            'instructor_id': self.instructor.id,
            'resource_id': self.resource.id,
            'recurrence_days': ['INVALID_DAY'],
            'times': ['25:00'],  # Invalid time
            'start_date': date.today() - timedelta(days=1),  # Past date
            'num_lessons': 5,
            'max_students': 10,
        }
        serializer = ScheduledClassPatternSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('recurrence_days', serializer.errors)
        self.assertIn('times', serializer.errors)
        self.assertIn('start_date', serializer.errors)


class ScheduledClassPatternViewSetTestCase(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass'
        )
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='userpass'
        )
        
        # Create test data (same as above)
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
        
        self.pattern = ScheduledClassPattern.objects.create(
            name="Test Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['MONDAY', 'WEDNESDAY'],
            times=["09:00", "14:00"],
            start_date=date.today(),
            num_lessons=4,
            max_students=25,
        )
        self.pattern.students.set([self.student1, self.student2])

    def test_generate_classes_action(self):
        """Test the generate-classes action with pagination."""
        self.client.force_authenticate(user=self.admin_user)
        url = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check pagination structure
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        
        # Check that classes were created
        classes_count = ScheduledClass.objects.filter(pattern=self.pattern).count()
        self.assertEqual(classes_count, 4)  # 2 days × 2 times = 4 classes

    def test_regenerate_classes_action(self):
        """Test the regenerate-classes action."""
        self.client.force_authenticate(user=self.admin_user)
        
        # First generate some classes
        generate_url = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        self.client.post(generate_url)
        
        initial_count = ScheduledClass.objects.filter(pattern=self.pattern).count()
        self.assertEqual(initial_count, 4)
        
        # Now regenerate
        regenerate_url = f'/api/scheduled-class-patterns/{self.pattern.id}/regenerate-classes/'
        response = self.client.post(regenerate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertIn('results', response.data)
        results = response.data['results']
        self.assertIn('deleted_count', results)
        self.assertIn('generated_count', results)
        
        # Should have deleted and recreated the same number
        self.assertEqual(results['deleted_count'], 4)
        self.assertEqual(results['generated_count'], 4)
        
        # Total count should still be 4
        final_count = ScheduledClass.objects.filter(pattern=self.pattern).count()
        self.assertEqual(final_count, 4)

    def test_statistics_action(self):
        """Test the statistics action."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Generate classes first
        generate_url = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        self.client.post(generate_url)
        
        # Get statistics
        stats_url = f'/api/scheduled-class-patterns/{self.pattern.id}/statistics/'
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check statistics structure
        expected_fields = [
            'pattern_id', 'pattern_name', 'total_classes', 'scheduled_classes',
            'completed_classes', 'cancelled_classes', 'total_enrolled_students',
            'average_students_per_class', 'capacity_utilization_percent'
        ]
        
        for field in expected_fields:
            self.assertIn(field, response.data)
        
        # Check values
        self.assertEqual(response.data['pattern_id'], self.pattern.id)
        self.assertEqual(response.data['pattern_name'], self.pattern.name)
        self.assertEqual(response.data['total_classes'], 4)
        self.assertEqual(response.data['scheduled_classes'], 4)
        self.assertEqual(response.data['total_enrolled_students'], 2)  # 2 students in pattern

    def test_permissions_create_requires_admin(self):
        """Test that creating patterns requires admin permissions."""
        # Try as regular user
        self.client.force_authenticate(user=self.regular_user)
        url = '/api/scheduled-class-patterns/'
        data = {
            'name': 'New Pattern',
            'course_id': self.course.id,
            'instructor_id': self.instructor.id,
            'resource_id': self.resource.id,
            'recurrence_days': ['MONDAY'],
            'times': ['10:00'],
            'start_date': str(date.today()),
            'num_lessons': 2,
            'max_students': 20,
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Try as admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_date_range_filtering(self):
        """Test that date range filtering works correctly."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create patterns with different dates
        past_pattern = ScheduledClassPattern.objects.create(
            name="Past Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['TUESDAY'],
            times=["10:00"],
            start_date=date.today() - timedelta(days=30),
            num_lessons=2,
            max_students=20,
        )
        
        future_pattern = ScheduledClassPattern.objects.create(
            name="Future Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['THURSDAY'],
            times=["11:00"],
            start_date=date.today() + timedelta(days=30),
            num_lessons=2,
            max_students=20,
        )
        
        # Filter for patterns starting after today
        url = '/api/scheduled-class-patterns/?start_date__gte=' + str(date.today())
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should include current pattern and future pattern, but not past
        pattern_ids = [p['id'] for p in response.data['results']]
        self.assertIn(self.pattern.id, pattern_ids)
        self.assertIn(future_pattern.id, pattern_ids)
        self.assertNotIn(past_pattern.id, pattern_ids)