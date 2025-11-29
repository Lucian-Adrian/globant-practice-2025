"""Instructor-related ViewSets."""

import csv
from io import StringIO, TextIOWrapper

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Instructor, InstructorAvailability
from ..serializers import InstructorSerializer, InstructorAvailabilitySerializer
from .base import FullCrudViewSet, QSearchFilter
from ..authentication import SchoolJWTAuthentication


class InstructorViewSet(FullCrudViewSet):
    """ViewSet for managing Instructor resources with CSV import/export."""
    
    queryset = Instructor.objects.all().order_by("-hire_date")
    serializer_class = InstructorSerializer
    # Enable filtering/sorting/searching; RA uses 'q' for free-text search
    filter_backends = [DjangoFilterBackend, QSearchFilter, OrderingFilter]
    search_fields = ["first_name", "last_name"]

    def get_queryset(self):
        """Filter instructors by license category if provided."""
        qs = super().get_queryset()
        if getattr(self, "request", None):
            category = (self.request.query_params.get("category") or "").strip()
            if category:
                qs = qs.filter(license_categories__icontains=category)
        return qs

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export instructors to CSV file."""
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "hire_date",
            "license_categories",
        ]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.first_name,
                    obj.last_name,
                    obj.email,
                    obj.phone_number,
                    obj.hire_date.isoformat() if obj.hire_date else "",
                    obj.license_categories,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=instructors.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import instructors from CSV file (upsert by email)."""
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
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "hire_date",
            "license_categories",
        }
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_ids, updated_ids, errors = [], [], []
        for idx, row in enumerate(reader, start=2):
            data = {k: (row.get(k) or "").strip() for k in required}
            email = data.get("email")

            # Use update_or_create to prevent duplicates based on email
            try:
                existing = Instructor.objects.filter(email=email).first()
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


class InstructorAvailabilityViewSet(FullCrudViewSet):
    """ViewSet for managing InstructorAvailability resources."""
    
    queryset = InstructorAvailability.objects.select_related("instructor").all()
    serializer_class = InstructorAvailabilitySerializer
    authentication_classes = [SchoolJWTAuthentication]
    filter_backends = [DjangoFilterBackend]
    # Allow filtering by instructor_id and day from the frontend (e.g. ?instructor_id=3)
    # This mirrors the pattern used on other viewsets (students, instructors) and
    # allows the dataProvider getList calls to request per-instructor availabilities.
    filterset_fields = {
        "instructor_id": ["exact"],
        "day": ["exact"],
    }
