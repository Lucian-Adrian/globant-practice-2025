"""
ScheduledClassPattern and ScheduledClass ViewSets.

Handles CRUD operations for theory class patterns and scheduled classes with:
- Pattern generation (generate-classes, regenerate-classes)
- Student enrollment/unenrollment
- Statistics and CSV export/import
"""
import csv
import logging
import time
from io import StringIO, TextIOWrapper

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from ..enums import LessonStatus
from ..models import ScheduledClass, ScheduledClassPattern, Student
from ..notifications import (
    ClassGenerationNotificationTemplate,
    StudentEnrollmentNotificationTemplate,
    notification_service,
)
from ..serializers import ScheduledClassPatternSerializer, ScheduledClassSerializer
from .base import FullCrudViewSet, IsAdminUser


logger = logging.getLogger(__name__)


class ScheduledClassPatternViewSet(FullCrudViewSet):
    queryset = ScheduledClassPattern.objects.all().order_by("-created_at")
    serializer_class = ScheduledClassPatternSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "course": ["exact"],
        "instructor": ["exact"],
        "resource": ["exact"],
        "start_date": ["gte", "lte", "gt", "lt"],
    }

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating ScheduledClassPattern with data: {request.data}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        logger.info(f"Updating ScheduledClassPattern {kwargs.get('pk')} with data: {request.data}")
        return super().update(request, *args, **kwargs)

    @decorators.action(detail=True, methods=["post"], url_path="generate-classes")
    def generate_classes(self, request, pk=None):
        """Generate ScheduledClass instances for this pattern."""
        start_time = time.time()
        
        pattern = self.get_object()
        
        if settings.DEBUG:
            logger.info(f"Starting generate-classes action for pattern '{pattern.name}' (ID: {pattern.id}) by user {request.user}")
        
        try:
            pattern.validate_generation()  # Validate for overlaps
            classes = pattern.generate_scheduled_classes()
        except (ValueError, ValidationError) as e:
            logger.error(f"Class generation validation failed for pattern '{pattern.name}': {str(e)}")
            return response.Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created_classes = ScheduledClass.objects.bulk_create(classes)
        
        # Auto-enroll pattern students in generated classes
        enrollment_results = self._auto_enroll_students(pattern, created_classes)
        
        action_time = time.time() - start_time
        
        if settings.DEBUG:
            logger.info(f"Completed generate-classes action for pattern '{pattern.name}' in {action_time:.3f}s - created {len(classes)} classes")
            logger.info(f"Auto-enrollment results: {enrollment_results}")
        
        # Send notifications
        self._send_generation_notifications(pattern, created_classes, enrollment_results)
        
        # Return format compatible with react-admin dataProvider.create
        return response.Response({
            "id": pattern.id,
            "generated_count": len(created_classes),
            "enrollment_results": enrollment_results
        }, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=["post"], url_path="regenerate-classes")
    def regenerate_classes(self, request, pk=None):
        """Delete existing generated classes and create new ones."""
        start_time = time.time()
        
        pattern = self.get_object()
        
        if settings.DEBUG:
            logger.info(f"Starting regenerate-classes action for pattern '{pattern.name}' (ID: {pattern.id}) by user {request.user}")
        
        # Delete existing classes for this pattern
        delete_result = ScheduledClass.objects.filter(pattern=pattern).delete()
        deleted_count = delete_result[1].get('school.ScheduledClass', 0)
        
        if settings.DEBUG:
            logger.info(f"Deleted {deleted_count} existing classes for pattern '{pattern.name}'")
        
        # Generate new classes
        try:
            pattern.validate_generation()  # Validate for overlaps
            classes = pattern.generate_scheduled_classes()
        except (ValueError, ValidationError) as e:
            logger.error(f"Class generation validation failed for pattern '{pattern.name}': {str(e)}")
            return response.Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created_classes = ScheduledClass.objects.bulk_create(classes)
        
        # Auto-enroll pattern students in generated classes
        enrollment_results = self._auto_enroll_students(pattern, created_classes)
        
        action_time = time.time() - start_time
        
        if settings.DEBUG:
            logger.info(f"Completed regenerate-classes action for pattern '{pattern.name}' in {action_time:.3f}s - deleted {deleted_count}, created {len(classes)} classes")
            logger.info(f"Auto-enrollment results: {enrollment_results}")
        
        # Send notifications
        self._send_generation_notifications(pattern, created_classes, enrollment_results)
        
        return response.Response({
            "id": pattern.id,
            "deleted_count": deleted_count,
            "generated_count": len(classes),
            "enrollment_results": enrollment_results
        }, status=status.HTTP_200_OK)

    def _auto_enroll_students(self, pattern, created_classes):
        """
        Auto-enroll students from pattern to generated classes.
        
        Args:
            pattern: ScheduledClassPattern instance
            created_classes: List of created ScheduledClass instances
            
        Returns:
            Dict with enrollment statistics
        """
        students = list(pattern.students.all())
        
        results = {
            'total_students': len(students),
            'enrolled': 0,
            'failed': 0,
            'errors': []
        }
        
        if not students:
            return results
        
        try:
            with transaction.atomic():
                for scheduled_class in created_classes:
                    max_students = scheduled_class.max_students
                    
                    students_to_enroll = students[:max_students]
                    students_not_enrolled = students[max_students:]
                    
                    if students_to_enroll:
                        scheduled_class.students.add(*students_to_enroll)
                        results['enrolled'] += len(students_to_enroll)
                    
                    if students_not_enrolled:
                        results['failed'] += len(students_not_enrolled)
                        
        except Exception as e:
            results['errors'].append(f"Auto-enrollment failed: {str(e)}")
            
        return results

    def _send_generation_notifications(self, pattern, created_classes, enrollment_results):
        """
        Send notifications about class generation.
        
        Args:
            pattern: ScheduledClassPattern instance
            created_classes: List of created ScheduledClass instances
            enrollment_results: Results from auto-enrollment
        """
        # Send notification to pattern instructor
        instructor_template = ClassGenerationNotificationTemplate()
        notification_service.send_notification(
            template=instructor_template,
            recipients=[pattern.instructor],
            pattern_name=pattern.name,
            class_count=len(created_classes),
            start_date=pattern.start_date.strftime('%Y-%m-%d'),
            enrolled_students=enrollment_results['enrolled']
        )
        
        # Send enrollment notifications to auto-enrolled students
        if enrollment_results['enrolled'] > 0:
            student_template = StudentEnrollmentNotificationTemplate()
            
            ScheduledClassStudent = ScheduledClass.students.through
            relations = ScheduledClassStudent.objects.filter(
                scheduledclass__in=created_classes
            ).select_related('student')
            
            class_students = {}
            for rel in relations:
                if rel.scheduledclass_id not in class_students:
                    class_students[rel.scheduledclass_id] = []
                class_students[rel.scheduledclass_id].append(rel.student)
            
            for scheduled_class in created_classes:
                students = class_students.get(scheduled_class.id, [])
                
                for student in students:
                    notification_service.send_notification(
                        template=student_template,
                        recipients=[student],
                        class_name=scheduled_class.name,
                        instructor_name=f"{pattern.instructor.first_name} {pattern.instructor.last_name}",
                        scheduled_time=scheduled_class.scheduled_time.strftime('%Y-%m-%d %H:%M'),
                        location=pattern.resource.name if pattern.resource else "TBD"
                    )

    @decorators.action(detail=True, methods=["get"], url_path="statistics")
    def get_statistics(self, request, pk=None):
        """Get statistics for this pattern."""
        pattern = self.get_object()
        
        classes = ScheduledClass.objects.filter(pattern=pattern)
        
        total_classes = classes.count()
        scheduled_classes = classes.filter(status=LessonStatus.SCHEDULED.value).count()
        completed_classes = classes.filter(status=LessonStatus.COMPLETED.value).count()
        cancelled_classes = classes.filter(status=LessonStatus.CANCELED.value).count()
        
        total_enrollments = pattern.students.count()
        
        avg_students_per_class = 0
        if total_classes > 0:
            avg_students_per_class = total_enrollments
        
        total_capacity = sum(cls.max_students or 0 for cls in classes)
        capacity_utilization = 0
        if total_capacity > 0:
            capacity_utilization = (total_enrollments / total_capacity) * 100
        
        return response.Response({
            "pattern_id": pattern.id,
            "pattern_name": pattern.name,
            "total_classes": total_classes,
            "scheduled_classes": scheduled_classes,
            "completed_classes": completed_classes,
            "cancelled_classes": cancelled_classes,
            "total_enrolled_students": total_enrollments,
            "average_students_per_class": round(avg_students_per_class, 2),
            "capacity_utilization_percent": round(capacity_utilization, 2),
        })

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export scheduled class patterns to CSV."""
        fields = [
            "id",
            "name",
            "course_id",
            "instructor_id",
            "resource_id",
            "recurrence_days",
            "times",
            "start_date",
            "num_lessons",
            "default_duration_minutes",
            "default_max_students",
            "created_at",
        ]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id,
                obj.name,
                obj.course_id,
                obj.instructor_id,
                obj.resource_id,
                ",".join(obj.recurrence_days) if obj.recurrence_days else "",
                ",".join(obj.times) if obj.times else "",
                obj.start_date.isoformat() if obj.start_date else "",
                obj.num_lessons,
                obj.default_duration_minutes,
                obj.default_max_students,
                obj.created_at.isoformat() if obj.created_at else "",
            ])
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=scheduled-class-patterns.csv"
        return resp


class ScheduledClassViewSet(FullCrudViewSet):
    queryset = ScheduledClass.objects.all().order_by("scheduled_time")
    serializer_class = ScheduledClassSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "pattern__course": ["exact"],
        "pattern__instructor": ["exact"],
        "pattern__resource": ["exact"],
        "status": ["exact"],
        "scheduled_time": ["gte", "lte", "date"],
    }

    @decorators.action(detail=True, methods=["post"], url_path="enroll")
    def enroll_student(self, request, pk=None):
        """Enroll a student in a scheduled class."""
        scheduled_class = self.get_object()
        student_id = request.data.get("student_id")

        if not student_id:
            return response.Response(
                {"detail": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return response.Response(
                {"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if scheduled_class.students.filter(id=student_id).exists():
            return response.Response(
                {"detail": "Student already enrolled"}, status=status.HTTP_400_BAD_REQUEST
            )

        if scheduled_class.is_full():
            return response.Response(
                {"detail": "Class is full"}, status=status.HTTP_400_BAD_REQUEST
            )

        scheduled_class.students.add(student)
        serializer = self.get_serializer(scheduled_class)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="unenroll")
    def unenroll_student(self, request, pk=None):
        """Unenroll a student from a scheduled class."""
        scheduled_class = self.get_object()
        student_id = request.data.get("student_id")

        if not student_id:
            return response.Response(
                {"detail": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return response.Response(
                {"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if not scheduled_class.students.filter(id=student_id).exists():
            return response.Response(
                {"detail": "Student not enrolled"}, status=status.HTTP_400_BAD_REQUEST
            )

        scheduled_class.students.remove(student)
        serializer = self.get_serializer(scheduled_class)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export all scheduled classes to CSV (no pagination)."""
        fields = [
            "id",
            "name",
            "course_id",
            "instructor_id",
            "resource_id",
            "scheduled_time",
            "duration_minutes",
            "max_students",
            "status",
            "student_ids",
        ]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            students_csv = ",".join(str(sid) for sid in obj.students.values_list("id", flat=True))
            writer.writerow(
                [
                    obj.id,
                    obj.name,
                    obj.course_id,
                    obj.instructor_id,
                    obj.resource_id,
                    obj.scheduled_time.isoformat() if obj.scheduled_time else "",
                    obj.duration_minutes,
                    obj.max_students if obj.max_students is not None else "",
                    obj.status,
                    students_csv,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=scheduled_classes.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import scheduled classes from CSV; upsert by (course_id, instructor_id, scheduled_time)."""
        upload = request.FILES.get("file") or request.FILES.get("csv")
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        text_stream = (
            TextIOWrapper(upload.file, encoding="utf-8") if hasattr(upload, "file") else upload
        )
        reader = csv.DictReader(text_stream)

        required = {
            "name",
            "course_id",
            "instructor_id",
            "resource_id",
            "scheduled_time",
            "status",
            "max_students",
        }
        optional = {"duration_minutes", "student_ids"}

        header = set([c.strip() for c in (reader.fieldnames or [])])
        missing = required - header
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids, updated_ids, errors = [], [], []
        for idx, row in enumerate(reader, start=2):
            try:
                data = {
                    "name": (row.get("name") or "").strip(),
                    "course_id": (row.get("course_id") or "").strip(),
                    "instructor_id": (row.get("instructor_id") or "").strip(),
                    "resource_id": (row.get("resource_id") or "").strip(),
                    "scheduled_time": (row.get("scheduled_time") or "").strip(),
                    "status": (row.get("status") or "").strip(),
                }
                max_students_val = (row.get("max_students") or "").strip()
                if max_students_val:
                    data["max_students"] = max_students_val

                duration_val = (row.get("duration_minutes") or "").strip()
                if duration_val:
                    data["duration_minutes"] = duration_val
                else:
                    data["duration_minutes"] = 60

                student_ids_raw = (row.get("student_ids") or "").strip()

                lookup = {
                    "course_id": data.get("course_id"),
                    "instructor_id": data.get("instructor_id"),
                    "scheduled_time": data.get("scheduled_time"),
                }

                existing = ScheduledClass.objects.filter(**lookup).first()
                ser = (
                    self.get_serializer(existing, data=data)
                    if existing
                    else self.get_serializer(data=data)
                )
                if ser.is_valid():
                    obj = ser.save()
                    if student_ids_raw:
                        try:
                            ids = [int(s) for s in student_ids_raw.split(";") if s.strip()]
                        except ValueError:
                            ids = [int(s) for s in student_ids_raw.split(",") if s.strip()]
                        obj.students.set(ids)
                    (updated_ids if existing else created_ids).append(obj.id)
                else:
                    errors.append({"row": idx, "errors": ser.errors})
            except Exception as e:
                errors.append({"row": idx, "errors": {"general": [str(e)]}})

        return response.Response(
            {
                "created": len(created_ids),
                "updated": len(updated_ids),
                "created_ids": created_ids,
                "updated_ids": updated_ids,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )
