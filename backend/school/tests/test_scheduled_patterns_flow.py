from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from school.models import (
    ScheduledClassPattern, ScheduledClass, Course, Instructor, Resource, 
    Student, Enrollment, InstructorAvailability
)
from school.enums import CourseType, VehicleCategory, DayOfWeek, LessonStatus
from datetime import date, time, timedelta
from unittest.mock import patch

class ScheduledClassPatternFlowTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # 1. Create Course (Theory)
        self.course = Course.objects.create(
            name="Theory Course B",
            category=VehicleCategory.B.value,
            type=CourseType.THEORY.value,
            description="Theory course",
            price=1000,
            required_lessons=10
        )
        
        # 2. Create Instructor
        self.instructor = Instructor.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="+37312345678",
            hire_date=date.today(),
            license_categories="B"
        )
        
        # 3. Create Resource (Classroom)
        self.resource = Resource.objects.create(
            name="Room 101",
            max_capacity=20,
            category=VehicleCategory.B.value,
            is_available=True
        )
        
        # 4. Create Students
        self.student1 = Student.objects.create(
            first_name="Student", last_name="One", email="s1@example.com", phone_number="+37300000001", date_of_birth=date(2000, 1, 1)
        )
        self.student2 = Student.objects.create(
            first_name="Student", last_name="Two", email="s2@example.com", phone_number="+37300000002", date_of_birth=date(2000, 1, 1)
        )
        
        # 5. Enroll Students
        Enrollment.objects.create(student=self.student1, course=self.course)
        Enrollment.objects.create(student=self.student2, course=self.course)
        
        # 6. Create Admin User (if needed for permissions, though we might mock auth or use force_authenticate)
        from django.contrib.auth.models import User
        self.admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.client.force_authenticate(user=self.admin_user)

    def test_full_flow(self):
        # --- Step 1: Create Pattern ---
        pattern_data = {
            "name": "Mon/Wed Theory",
            "course_id": self.course.id,
            "instructor_id": self.instructor.id,
            "resource_id": self.resource.id,
            "recurrence_days": ["MONDAY", "WEDNESDAY"],
            "times": ["10:00", "14:00"],
            "start_date": date.today().isoformat(),
            "num_lessons": 4,
            "default_duration_minutes": 60,
            "default_max_students": 15,
            "student_ids": [self.student1.id, self.student2.id]
        }
        
        response = self.client.post('/api/scheduled-class-patterns/', pattern_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pattern_id = response.data['id']
        pattern = ScheduledClassPattern.objects.get(id=pattern_id)
        
        # Verify pattern data
        self.assertEqual(pattern.students.count(), 2)
        self.assertEqual(len(pattern.recurrence_days), 2)
        
        # --- Step 2: Generate Classes ---
        with patch('school.views.ScheduledClassPatternViewSet._send_generation_notifications') as mock_notify:
            url = f'/api/scheduled-class-patterns/{pattern_id}/generate-classes/'
            response = self.client.post(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Verify classes created
            classes = ScheduledClass.objects.filter(pattern=pattern)
            self.assertEqual(classes.count(), 4)  # num_lessons=4
            
            # Verify auto-enrollment
            for cls in classes:
                self.assertEqual(cls.students.count(), 2)
                self.assertTrue(self.student1 in cls.students.all())
                self.assertTrue(self.student2 in cls.students.all())
            
            # Verify notification called
            mock_notify.assert_called_once()

    def test_regeneration_flow(self):
        # Create pattern
        pattern = ScheduledClassPattern.objects.create(
            name="Regen Test",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=["FRIDAY"],
            times=["09:00"],
            start_date=date.today(),
            num_lessons=2,
            default_duration_minutes=60,
            default_max_students=10
        )
        pattern.students.add(self.student1)
        
        # Generate initial classes
        pattern.generate_scheduled_classes()
        # Manually create classes to simulate state (since generate_scheduled_classes returns list but doesn't save)
        classes = pattern.generate_scheduled_classes()
        ScheduledClass.objects.bulk_create(classes)
        
        self.assertEqual(ScheduledClass.objects.filter(pattern=pattern).count(), 2)
        
        # Modify pattern
        pattern.num_lessons = 3
        pattern.times = ["10:00"]
        pattern.save()
        
        # --- Step 3: Regenerate Classes ---
        with patch('school.views.ScheduledClassPatternViewSet._send_generation_notifications') as mock_notify:
            url = f'/api/scheduled-class-patterns/{pattern.id}/regenerate-classes/'
            response = self.client.post(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Verify old classes gone, new ones created
            current_classes = ScheduledClass.objects.filter(pattern=pattern)
            self.assertEqual(current_classes.count(), 3)
            
            # Verify time updated
            first_class = current_classes.first()
            self.assertEqual(first_class.scheduled_time.hour, 10) # UTC/Local handling might vary, but let's check basic
            
            # Verify notification called
            mock_notify.assert_called_once()

    def test_validation_overlaps(self):
        # Create a class manually that conflicts
        conflict_time = date.today()
        # Find next Monday
        while conflict_time.weekday() != 0: # 0 = Monday
            conflict_time += timedelta(days=1)
        
        # Create a conflicting class for the instructor
        ScheduledClass.objects.create(
            name="Conflict Class",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            scheduled_time=datetime.combine(conflict_time, time(10, 0)).replace(tzinfo=timezone.utc),
            duration_minutes=60,
            max_students=10,
            status=LessonStatus.SCHEDULED.value
        )
        
        # Create pattern that overlaps (Monday 10:00)
        pattern = ScheduledClassPattern.objects.create(
            name="Overlap Pattern",
            course=self.course,
            instructor=self.instructor,
            resource=self.resource,
            recurrence_days=["MONDAY"],
            times=["10:00"],
            start_date=conflict_time,
            num_lessons=1
        )
        
        # Try to generate
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            pattern.validate_generation()

from datetime import datetime, timezone
