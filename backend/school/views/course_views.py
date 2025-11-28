"""
Course and Enrollment ViewSets.

Handles CRUD operations for Courses and Enrollments with CSV import/export support.
"""
import csv
from io import StringIO, TextIOWrapper

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter

from ..models import Course, Enrollment
from ..serializers import CourseSerializer, EnrollmentSerializer
from .base import FullCrudViewSet


class CourseViewSet(FullCrudViewSet):
    queryset = Course.objects.all().order_by("category")
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "category": ["exact"],
        "type": ["exact"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ["id", "name", "category", "type", "description", "price", "required_lessons"]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.name,
                    obj.category,
                    obj.type,
                    obj.description,
                    obj.price,
                    obj.required_lessons,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=courses.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
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
        # Critical columns that must be present
        required = {"name", "category", "description", "price", "required_lessons"}
        # Optional columns that can be blank (will use defaults)
        optional = {"type"}

        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_ids, updated_ids, errors = [], [], []
        for idx, row in enumerate(reader, start=2):
            # Build data dict with required fields
            data = {k: (row.get(k) or "").strip() for k in required}

            # Add optional fields only if present and non-blank
            type_val = (row.get("type") or "").strip()
            if type_val:
                data["type"] = type_val
            name = data.get("name")
            category = data.get("category")

            # Use update_or_create to prevent duplicates based on name + category
            try:
                existing = Course.objects.filter(name=name, category=category).first()
                if existing:
                    serializer = self.get_serializer(existing, data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        updated_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
                else:
                    serializer = self.get_serializer(data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        created_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
            except Exception as e:
                errors.append({"row": idx, "errors": {"general": [str(e)]}})

        return response.Response(
            {
                "created": len(created_ids),
                "updated": len(updated_ids),
                "created_ids": created_ids,
                "updated_ids": updated_ids,
                "errors": errors,
            }
        )


class EnrollmentViewSet(FullCrudViewSet):
    queryset = (
        Enrollment.objects.select_related("student", "course").all().order_by("-enrollment_date")
    )
    serializer_class = EnrollmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "status": ["exact"],
        "enrollment_date": ["gte", "lte", "gt", "lt"],
        "student": ["exact"],
        "course": ["exact"],
        "course__category": ["exact"],
        "type": ["exact"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ["id", "student_id", "course_id", "enrollment_date", "type", "status"]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.student_id,
                    obj.course_id,
                    obj.enrollment_date.isoformat() if obj.enrollment_date else "",
                    obj.type,
                    obj.status,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=enrollments.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
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
        # Critical columns that must be present
        required = {"student_id", "course_id"}
        # Optional columns that can be blank (will use defaults)
        optional = {"type", "status"}

        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_ids, updated_ids, errors = [], [], []
        for idx, row in enumerate(reader, start=2):
            # Build data dict with required fields
            data = {
                "student_id": (row.get("student_id") or "").strip(),
                "course_id": (row.get("course_id") or "").strip(),
            }

            # Add optional fields only if present and non-blank
            type_val = (row.get("type") or "").strip()
            if type_val:
                data["type"] = type_val

            status_val = (row.get("status") or "").strip()
            if status_val:
                data["status"] = status_val
            student_id = data.get("student_id")
            course_id = data.get("course_id")

            # Use update_or_create to prevent duplicates based on student_id + course_id
            try:
                existing = Enrollment.objects.filter(
                    student_id=student_id, course_id=course_id
                ).first()
                if existing:
                    serializer = self.get_serializer(existing, data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        updated_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
                else:
                    serializer = self.get_serializer(data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        created_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
            except Exception as e:
                errors.append({"row": idx, "errors": {"general": [str(e)]}})

        return response.Response(
            {
                "created": len(created_ids),
                "updated": len(updated_ids),
                "created_ids": created_ids,
                "updated_ids": updated_ids,
                "errors": errors,
            }
        )
