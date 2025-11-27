"""Student-related ViewSets."""

import csv
from io import StringIO, TextIOWrapper

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import AllowAny

from ..models import Student
from ..serializers import StudentSerializer
from ..validators import normalize_phone
from .base import FullCrudViewSet, QSearchFilter


class StudentViewSet(FullCrudViewSet):
    """ViewSet for managing Student resources with CSV import/export."""
    
    queryset = Student.objects.all().order_by("-enrollment_date")
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, QSearchFilter, OrderingFilter]

    filterset_fields = {
        "status": ["exact"],
        "enrollment_date": ["gte", "lte", "gt", "lt"],
    }
    search_fields = ["first_name", "last_name"]

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export students to CSV file."""
        qs = self.filter_queryset(self.get_queryset())
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "date_of_birth",
            "enrollment_date",
            "status",
            "password",
        ]
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            row = [
                obj.id,
                obj.first_name,
                obj.last_name,
                obj.email,
                obj.phone_number,
                obj.date_of_birth.isoformat() if obj.date_of_birth else "",
                obj.enrollment_date.isoformat() if obj.enrollment_date else "",
                obj.status,
                obj.password,
            ]
            writer.writerow(row)

        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=students.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import students from CSV file."""
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

        # Critical columns that must be present in CSV headers and have values
        required_cols = {
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "date_of_birth",
            "password",
        }
        # Optional columns that can be blank (will use defaults)
        optional_cols = {"status"}

        missing = required_cols - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids = []
        errors = []
        for idx, row in enumerate(reader, start=2):
            phone = (row.get("phone_number") or "").strip()
            try:
                phone = normalize_phone(phone)
            except Exception as e:
                errors.append({"row": idx, "errors": {"phone_number": [str(e)]}})
                continue

            # Build data dict with required fields
            data = {
                "first_name": row.get("first_name", "").strip(),
                "last_name": row.get("last_name", "").strip(),
                "email": row.get("email", "").strip(),
                "phone_number": phone,
                "date_of_birth": (row.get("date_of_birth") or "").strip(),
                "password": (row.get("password") or "").strip(),
            }

            # Add optional fields only if they have non-blank values
            status_val = (row.get("status") or "").strip()
            if status_val:
                data["status"] = status_val

            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save()
                created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})

        return response.Response(
            {
                "created": len(created_ids),
                "created_ids": created_ids,
                "errors": errors,
            }
        )
