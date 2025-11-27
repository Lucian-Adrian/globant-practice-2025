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
            default_max_students=25,
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
            default_max_students=10
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
            # Removed: 'max_students': 10 - this belongs to individual classes
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
            default_max_students=25,
        )
        self.pattern.students.set([self.student1, self.student2])

    def test_generate_classes_action(self):
        """Test the generate-classes action."""
        self.client.force_authenticate(user=self.admin_user)
        url = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertIn('id', response.data)
        self.assertIn('generated_count', response.data)
        self.assertIn('enrollment_results', response.data)
        self.assertEqual(response.data['generated_count'], 4)
        # Auto-enrollment removed, so enrolled count should be 0
        self.assertEqual(response.data['enrollment_results']['enrolled'], 0)
        
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
        self.assertIn('id', response.data)
        self.assertIn('deleted_count', response.data)
        self.assertIn('generated_count', response.data)
        self.assertIn('enrollment_results', response.data)
        
        # Should have deleted and recreated the same number
        self.assertEqual(response.data['deleted_count'], 4)
        self.assertEqual(response.data['generated_count'], 4)
        # Auto-enrollment removed
        self.assertEqual(response.data['enrollment_results']['enrolled'], 0)
        
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
            # Removed: 'max_students': 20 - this belongs to individual classes
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
        # Create with valid date first, then update to past to bypass clean() validation
        past_pattern = ScheduledClassPattern.objects.create(
            name="Past Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['TUESDAY'],
            times=["10:00"],
            start_date=date.today(),
            num_lessons=2,
            default_max_students=20,
        )
        ScheduledClassPattern.objects.filter(pk=past_pattern.pk).update(start_date=date.today() - timedelta(days=30))
        past_pattern.refresh_from_db()
        
        future_pattern = ScheduledClassPattern.objects.create(
            name="Future Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['THURSDAY'],
            times=["11:00"],
            start_date=date.today() + timedelta(days=30),
            num_lessons=2,
            default_max_students=20,
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

    def test_timezone_handling(self):
        """Test that timezone handling works correctly for class generation."""
        from django.utils import timezone

        # Create pattern with current date
        pattern = ScheduledClassPattern.objects.create(
            name="Timezone Test Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['MONDAY'],
            times=["09:00"],
            start_date=timezone.now().date(),
            num_lessons=1,
            default_max_students=20,
        )

        # Generate classes
        classes = pattern.generate_scheduled_classes()
        self.assertEqual(len(classes), 1)

        # Check that the generated class has correct time
        generated_class = classes[0]
        self.assertEqual(generated_class.scheduled_time.strftime('%H:%M'), '09:00')

    def test_edge_cases_empty_recurrence_days(self):
        """Test edge case: pattern with empty recurrence_days."""
        pattern = ScheduledClassPattern(
            name="Empty Recurrence Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=[],  # Empty list
            times=["10:00"],
            start_date=date.today(),
            num_lessons=1,
            default_max_students=10,
        )

        # Should raise validation error
        with self.assertRaises(ValidationError) as cm:
            pattern.full_clean()

        # Check that the error mentions recurrence_days
        self.assertIn('recurrence_days', str(cm.exception))

    def test_edge_cases_invalid_dates(self):
        """Test edge cases with invalid dates."""
        # Test future date too far in advance (more than 1 year)
        far_future_date = date.today() + timedelta(days=400)

        pattern = ScheduledClassPattern.objects.create(
            name="Far Future Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['MONDAY'],
            times=["10:00"],
            start_date=far_future_date,
            num_lessons=1,
            default_max_students=10,
        )

        # Should still work - no validation for "too far future"
        self.assertIsNotNone(pattern.id)

        # Test invalid date format in serializer
        data = {
            'name': 'Test Pattern',
            'course_id': self.course.id,
            'instructor_id': self.instructor.id,
            'resource_id': self.resource.id,
            'recurrence_days': ['MONDAY'],
            'times': ['10:00'],
            'start_date': 'invalid-date-format',
            'num_lessons': 1,
            # Removed: 'max_students': 10 - this belongs to individual classes
        }
        serializer = ScheduledClassPatternSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('start_date', serializer.errors)

    def test_api_actions_bulk_generate_multiple_patterns(self):
        """Test bulk generation of classes for multiple patterns."""
        self.client.force_authenticate(user=self.admin_user)

        # Create another pattern
        pattern2 = ScheduledClassPattern.objects.create(
            name="Second Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['TUESDAY'],
            times=["11:00"],
            start_date=date.today(),
            num_lessons=2,
            default_max_students=20,
        )

        # Generate classes for first pattern
        url1 = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        response1 = self.client.post(url1)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Generate classes for second pattern
        url2 = f'/api/scheduled-class-patterns/{pattern2.id}/generate-classes/'
        response2 = self.client.post(url2)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Check total classes created
        total_classes = ScheduledClass.objects.filter(
            pattern__in=[self.pattern, pattern2]
        ).count()
        self.assertEqual(total_classes, 6)  # 4 + 2 classes

    def test_serializer_validation_comprehensive(self):
        """Comprehensive test for serializer validation."""
        # Test invalid recurrence_days values
        data = {
            'name': 'Test Pattern',
            'course_id': self.course.id,
            'instructor_id': self.instructor.id,
            'resource_id': self.resource.id,
            'recurrence_days': ['INVALID_DAY', 'MONDAY'],
            'times': ['10:00'],
            'start_date': str(date.today()),
            'num_lessons': 1,
            # Removed: 'max_students': 10 - this belongs to individual classes
        }
        serializer = ScheduledClassPatternSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('recurrence_days', serializer.errors)

        # Test invalid time formats
        data['recurrence_days'] = ['MONDAY']
        data['times'] = ['25:00', '10:00']  # Invalid hour
        serializer = ScheduledClassPatternSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('times', serializer.errors)

        # Test negative num_lessons
        data['times'] = ['10:00']
        data['num_lessons'] = -1
        serializer = ScheduledClassPatternSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('num_lessons', serializer.errors)

    def test_integration_full_pattern_to_classes_flow(self):
        """Integration test for complete pattern -> classes flow."""
        self.client.force_authenticate(user=self.admin_user)

        # 1. Create a pattern via API
        pattern_data = {
            'name': 'Integration Test Pattern',
            'course_id': self.course.id,
            'instructor_id': self.instructor.id,
            'resource_id': self.resource.id,
            'recurrence_days': ['MONDAY', 'WEDNESDAY'],
            'times': ['09:00', '14:00'],
            'start_date': str(date.today()),
            'num_lessons': 3,
            # Removed: 'max_students': 25 - this belongs to individual classes
            'student_ids': [self.student1.id, self.student2.id]
        }

        create_url = '/api/scheduled-class-patterns/'
        response = self.client.post(create_url, pattern_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pattern_id = response.data['id']

        # 2. Generate classes for the pattern
        generate_url = f'/api/scheduled-class-patterns/{pattern_id}/generate-classes/'
        response = self.client.post(generate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should have created 6 classes (2 days × 2 times × 3 weeks, but limited by num_lessons)
        # Actually, with num_lessons=3 and 2 times per day, we get 3 classes
        classes_count = ScheduledClass.objects.filter(pattern_id=pattern_id).count()
        self.assertEqual(classes_count, 3)

        # 3. Check that classes have correct data
        classes = ScheduledClass.objects.filter(pattern_id=pattern_id)
        for cls in classes:
            self.assertEqual(cls.pattern.course, self.course)
            self.assertEqual(cls.pattern.instructor, self.instructor)
            self.assertEqual(cls.pattern.resource, self.resource)
            self.assertIn(cls.scheduled_time.strftime('%H:%M'), ['09:00', '14:00'])
            # Check students are enrolled in the pattern
            self.assertIn(self.student1, cls.pattern.students.all())
            self.assertIn(self.student2, cls.pattern.students.all())

        # 4. Get statistics
        stats_url = f'/api/scheduled-class-patterns/{pattern_id}/statistics/'
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_classes'], 3)
        self.assertEqual(response.data['total_enrolled_students'], 2)

        # 5. Regenerate classes
        regenerate_url = f'/api/scheduled-class-patterns/{pattern_id}/regenerate-classes/'
        response = self.client.post(regenerate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 3)
        self.assertEqual(response.data['generated_count'], 3)

        # Count should still be 3
        final_count = ScheduledClass.objects.filter(pattern_id=pattern_id).count()
        self.assertEqual(final_count, 3)

    def test_overlap_prevention(self):
        """Test that overlapping classes are prevented."""
        # Create first pattern
        pattern1 = ScheduledClassPattern.objects.create(
            name="Pattern 1",
            course=self.course,
            instructor=self.instructor,  # Same instructor
            resource=self.resource,
            recurrence_days=['MONDAY'],
            times=["10:00"],
            start_date=date.today(),
            num_lessons=1,
            default_max_students=20,
        )

        # Generate classes for first pattern
        pattern1.generate_scheduled_classes()
        ScheduledClass.objects.bulk_create(pattern1.generate_scheduled_classes())

        # Try to create second pattern with same instructor/time
        pattern2 = ScheduledClassPattern(
            name="Pattern 2",
            course=self.course,
            instructor=self.instructor,  # Same instructor
            resource=self.resource,
            recurrence_days=['MONDAY'],
            times=["10:00"],  # Same time
            start_date=date.today(),
            num_lessons=1,
            default_max_students=20,
        )

        # Should raise validation error during generation
        with self.assertRaises(ValidationError):
            pattern2.validate_generation()

    def test_large_pattern_generation_performance(self):
        """Test performance with large pattern (many lessons)."""
        import time

        # Create pattern with many lessons
        large_pattern = ScheduledClassPattern.objects.create(
            name="Large Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
            times=["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            start_date=date.today(),
            num_lessons=50,  # Large number
            default_max_students=30,
        )

        # Time the generation
        start_time = time.time()
        classes = large_pattern.generate_scheduled_classes()
        end_time = time.time()

        # Should generate reasonable number of classes (not all possible combinations)
        # With 5 days × 6 times × ~10 weeks (50 lessons / 30 possible per week) ≈ 50 classes
        self.assertGreater(len(classes), 40)
        self.assertLess(len(classes), 60)

        # Should complete in reasonable time (< 1 second)
        generation_time = end_time - start_time
        self.assertLess(generation_time, 1.0, f"Generation took too long: {generation_time}s")

    def test_pattern_deletion_cascades(self):
        """Test that deleting a pattern cascades to delete generated classes."""
        self.client.force_authenticate(user=self.admin_user)

        # Generate classes for pattern
        generate_url = f'/api/scheduled-class-patterns/{self.pattern.id}/generate-classes/'
        self.client.post(generate_url)

        initial_count = ScheduledClass.objects.filter(pattern=self.pattern).count()
        self.assertEqual(initial_count, 4)

        # Delete the pattern
        delete_url = f'/api/scheduled-class-patterns/{self.pattern.id}/'
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check that classes were deleted
        final_count = ScheduledClass.objects.filter(pattern=self.pattern).count()
        self.assertEqual(final_count, 0)

        # Pattern should be deleted
        with self.assertRaises(ScheduledClassPattern.DoesNotExist):
            ScheduledClassPattern.objects.get(id=self.pattern.id)