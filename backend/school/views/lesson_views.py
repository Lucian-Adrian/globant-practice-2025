"""
Lesson and Payment ViewSets.

Handles CRUD operations for Lessons (driving practice) and Payments with CSV import/export.
"""
import csv
from io import StringIO, TextIOWrapper

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter

from ..models import Lesson, Payment
from ..serializers import LessonSerializer, PaymentSerializer
from .base import FullCrudViewSet


class LessonViewSet(FullCrudViewSet):
    queryset = Lesson.objects.select_related("enrollment__student", "instructor", "resource").all()
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "status": ["exact"],
        "scheduled_time": ["gte", "lte", "gt", "lt"],
        "instructor": ["exact"],
        "resource__name": ["exact"],
        # New: allow filtering by resource id directly for efficient conflict checks
        "resource_id": ["exact"],
        "enrollment__student": ["exact"],
        "enrollment__course": ["exact"],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        # Accept both instructor and instructor_id as aliases
        if getattr(self, "request", None):
            instr = self.request.query_params.get("instructor") or self.request.query_params.get(
                "instructor_id"
            )
            if instr:
                qs = qs.filter(instructor_id=instr)
            # Accept 'resource' as a name string alias for resource__name
            resource_name = self.request.query_params.get("resource")
            if resource_name:
                qs = qs.filter(resource__name__icontains=resource_name)
        return qs

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = [
            "id",
            "enrollment_id",
            "instructor_id",
            "resource_id",
            "scheduled_time",
            "duration_minutes",
            "status",
            "notes",
        ]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.enrollment_id,
                    obj.instructor_id,
                    obj.resource_id,
                    obj.scheduled_time.isoformat() if obj.scheduled_time else "",
                    obj.duration_minutes,
                    obj.status,
                    (obj.notes or "").replace("\n", " "),
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=lessons.csv"
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
        required = {"enrollment_id", "instructor_id", "scheduled_time", "status"}
        # Optional columns that can be blank (will use defaults or null)
        optional = {"resource_id", "duration_minutes", "notes"}

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
                "enrollment_id": (row.get("enrollment_id") or "").strip(),
                "instructor_id": (row.get("instructor_id") or "").strip(),
                "scheduled_time": (row.get("scheduled_time") or "").strip(),
                "status": (row.get("status") or "").strip(),
            }

            # Add optional fields only if present and non-blank
            resource_val = (row.get("resource_id") or "").strip()
            if resource_val:
                data["resource_id"] = resource_val

            duration_val = (row.get("duration_minutes") or "").strip()
            if duration_val:
                data["duration_minutes"] = duration_val

            notes_val = (row.get("notes") or "").strip()
            if notes_val:
                data["notes"] = notes_val
            enrollment_id = data.get("enrollment_id")
            instructor_id = data.get("instructor_id")
            scheduled_time = data.get("scheduled_time")

            # Use update_or_create to prevent duplicates based on enrollment_id + instructor_id + scheduled_time
            try:
                existing = Lesson.objects.filter(
                    enrollment_id=enrollment_id,
                    instructor_id=instructor_id,
                    scheduled_time=scheduled_time,
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


class PaymentViewSet(FullCrudViewSet):
    queryset = Payment.objects.select_related("enrollment__student").all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "payment_date": ["gte", "lte", "gt", "lt"],
        "payment_method": ["exact"],
        "status": ["exact"],
        "enrollment": ["exact"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = [
            "id",
            "enrollment_id",
            "amount",
            "payment_date",
            "payment_method",
            "status",
            "description",
        ]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.enrollment_id,
                    obj.amount,
                    obj.payment_date.isoformat() if obj.payment_date else "",
                    obj.payment_method,
                    obj.status,
                    obj.description,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=payments.csv"
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
        required = {"enrollment_id", "amount", "payment_method"}
        # Optional columns that can be blank (will use defaults)
        optional = {"status", "description"}

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
                "enrollment_id": (row.get("enrollment_id") or "").strip(),
                "amount": (row.get("amount") or "").strip(),
                "payment_method": (row.get("payment_method") or "").strip(),
            }

            # Add optional fields only if present and non-blank
            status_val = (row.get("status") or "").strip()
            if status_val:
                data["status"] = status_val

            description_val = (row.get("description") or "").strip()
            if description_val:
                data["description"] = description_val
            enrollment_id = data.get("enrollment_id")
            amount = data.get("amount")
            description = data.get("description", "")

            # Use update_or_create to prevent duplicates based on enrollment_id + amount
            # If description is provided, use it as additional uniqueness criteria
            try:
                filter_criteria = {"enrollment_id": enrollment_id, "amount": amount}
                if description:
                    filter_criteria["description"] = description
                existing = Payment.objects.filter(**filter_criteria).first()
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
