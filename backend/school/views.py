import csv
import hashlib
import json
from datetime import timedelta
from io import StringIO, TextIOWrapper

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.http import HttpResponse
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, mixins, response, status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from .enums import LessonStatus, StudentStatus, all_enums_for_meta
from .models import (
    Course,
    Enrollment,
    Instructor,
    InstructorAvailability,
    Lesson,
    Payment,
    Resource,
    ScheduledClass,
    ScheduledClassPattern,
    Student,
    Vehicle,
)
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    InstructorAvailabilitySerializer,
    InstructorSerializer,
    LessonSerializer,
    PaymentSerializer,
    ResourceSerializer,
    ScheduledClassSerializer,
    ScheduledClassPatternSerializer,
    StudentSerializer,
    VehicleSerializer,
)
from .pagination import StandardResultsSetPagination
from .validators import normalize_phone


class IsAuthenticatedStudent(BasePermission):
    def has_permission(self, request, view):
        # Check if token has student_id
        if hasattr(request, "auth") and request.auth:
            return "student_id" in request.auth
        return False


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class StudentJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        student_id = validated_token.get("student_id")
        if not student_id:
            raise InvalidToken("Token contained no recognizable user identification")
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise InvalidToken("Student not found")
        return student


class FullCrudViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Full CRUD for internal use (no auth layer yet—secure before prod)."""

    pass


class QSearchFilter(SearchFilter):
    """Use 'q' as the search query parameter to align with frontend SearchInput."""

    search_param = "q"


class StudentViewSet(FullCrudViewSet):
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


class InstructorViewSet(FullCrudViewSet):
    queryset = Instructor.objects.all().order_by("-hire_date")
    serializer_class = InstructorSerializer
    # Enable filtering/sorting/searching; RA uses 'q' for free-text search
    filter_backends = [DjangoFilterBackend, QSearchFilter, OrderingFilter]
    search_fields = ["first_name", "last_name"]

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, "request", None):
            category = (self.request.query_params.get("category") or "").strip()
            if category:
                qs = qs.filter(license_categories__icontains=category)
        return qs

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
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
    queryset = InstructorAvailability.objects.select_related("instructor").all()
    serializer_class = InstructorAvailabilitySerializer
    filter_backends = [DjangoFilterBackend]
    # Allow filtering by instructor_id and day from the frontend (e.g. ?instructor_id=3)
    # This mirrors the pattern used on other viewsets (students, instructors) and
    # allows the dataProvider getList calls to request per-instructor availabilities.
    filterset_fields = {
        "instructor_id": ["exact"],
        "day": ["exact"],
    }


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by("-year")
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "is_available": ["exact"],
        "category": ["exact"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ["id", "make", "model", "license_plate", "year", "category", "is_available"]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.make,
                    obj.model,
                    obj.license_plate,
                    obj.year,
                    obj.category,
                    obj.is_available,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=vehicles.csv"
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
        required = {"make", "model", "license_plate", "year", "category"}
        # Optional columns that can be blank (will use defaults)
        optional = {"is_available"}

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
                "make": (row.get("make") or "").strip(),
                "model": (row.get("model") or "").strip(),
                "license_plate": (row.get("license_plate") or "").strip(),
                "year": (row.get("year") or "").strip(),
                "category": (row.get("category") or "").strip(),
            }

            # Add optional fields only if present and non-blank
            is_avail_val = (row.get("is_available") or "").strip()
            if is_avail_val:
                data["is_available"] = is_avail_val.lower() in ["1", "true", "yes"]
            license_plate = data.get("license_plate")

            # Use update_or_create to prevent duplicates based on license_plate
            try:
                existing = Vehicle.objects.filter(license_plate=license_plate).first()
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


class UtilityViewSet(viewsets.ViewSet):
    """Misc read-only helpers for dashboards."""

    @decorators.action(detail=False, methods=["get"])
    def summary(self, request):
        data = {
            "students": Student.objects.count(),
            "instructors": Instructor.objects.count(),
            "resources": Resource.objects.count(),
            "courses": Course.objects.count(),
            "enrollments_active": Enrollment.objects.exclude(status="COMPLETED").count(),
            "lessons_scheduled": Lesson.objects.filter(status="SCHEDULED").count(),
            "payments_total": float(
                Payment.objects.all().aggregate(sum=models.Sum("amount"))["sum"] or 0
            ),
        }
        return response.Response(data)

    @decorators.action(detail=False, methods=["get"], url_path="schedule")
    def schedule(self, request):
        start = now()
        end = start + timedelta(days=7)
        lessons = (
            Lesson.objects.select_related("instructor", "enrollment__student", "resource")
            .filter(scheduled_time__gte=start, scheduled_time__lte=end)
            .order_by("scheduled_time")
        )
        serializer = LessonSerializer(lessons, many=True)
        return response.Response(serializer.data)


@decorators.api_view(["GET"])  # type: ignore[misc]
def enums_meta(request):
    """Return a mapping of enum identifiers to lists of values with ETag support."""
    payload = all_enums_for_meta()
    body = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    etag = 'W/"' + hashlib.md5(body).hexdigest() + '"'  # weak ETag sufficient
    if request.META.get("HTTP_IF_NONE_MATCH") == etag:
        return response.Response(status=status.HTTP_304_NOT_MODIFIED)
    resp = response.Response(payload)
    resp["ETag"] = etag
    resp["Cache-Control"] = "max-age=60"  # short client cache
    return resp


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.permission_classes([IsAuthenticated])
def me(request):
    """Return basic info about the authenticated user (JWT-protected)."""
    user = request.user
    data = {
        "id": getattr(user, "id", None),
        "username": getattr(user, "username", "anonymous"),
        "is_staff": getattr(user, "is_staff", False),
        "is_superuser": getattr(user, "is_superuser", False),
    }
    return response.Response(data)


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.permission_classes([AllowAny])
def check_username(request):
    """DEBUG-only: check if a username already exists."""
    if not settings.DEBUG:
        return response.Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
    username = (request.GET.get("username") or "").strip()
    if not username:
        return response.Response(
            {"detail": "username required"}, status=status.HTTP_400_BAD_REQUEST
        )
    User = get_user_model()
    exists = User.objects.filter(username=username).exists()
    return response.Response({"username": username, "exists": exists})


@decorators.api_view(["POST"])  # type: ignore[misc]
@decorators.permission_classes([AllowAny])
def student_login(request):
    """Student login endpoint. Authenticates student and returns JWT tokens if status allows."""
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return response.Response(
            {"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return response.Response(
            {"detail": "This account has not been found"}, status=status.HTTP_404_NOT_FOUND
        )

    if not student.check_password(password):
        return response.Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    if student.status == StudentStatus.PENDING.value:
        return response.Response(
            {"detail": "Your account is pending approval. Please wait to be approved."},
            status=status.HTTP_403_FORBIDDEN,
        )
    if student.status == StudentStatus.INACTIVE.value:
        return response.Response(
            {"detail": "This account has been deactivated"}, status=status.HTTP_403_FORBIDDEN
        )
    if student.status == StudentStatus.GRADUATED.value:
        # Allow login but mark as read-only
        pass
    elif student.status == StudentStatus.ACTIVE.value:
        pass
    else:
        return response.Response(
            {"detail": "Invalid account status"}, status=status.HTTP_403_FORBIDDEN
        )

    # Generate JWT tokens
    refresh = RefreshToken()
    refresh["student_id"] = student.id
    refresh["status"] = student.status
    access = refresh.access_token
    access["student_id"] = student.id
    access["status"] = student.status

    return response.Response(
        {
            "access": str(access),
            "refresh": str(refresh),
            "student": {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "status": student.status,
            },
        }
    )


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.authentication_classes([])  # No authentication
@decorators.permission_classes([AllowAny])
def student_me(request):
    """Return info about the authenticated student."""
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return response.Response(
            {"detail": "Authorization header missing or invalid"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = auth_header.split(" ")[1]
    try:
        access_token = AccessToken(token)
        student_id = access_token.get("student_id")
        if not student_id:
            return response.Response(
                {"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED
            )
    except Exception:
        return response.Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return response.Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    return response.Response(
        {
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "status": student.status,
        }
    )


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.authentication_classes([])  # No authentication
@decorators.permission_classes([AllowAny])
def student_dashboard(request):
    """Student dashboard: view instructors and courses."""
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return response.Response(
            {"detail": "Authorization header missing or invalid"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = auth_header.split(" ")[1]
    try:
        access_token = AccessToken(token)
        student_id = access_token.get("student_id")
        if not student_id:
            return response.Response(
                {"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED
            )
    except Exception:
        return response.Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return response.Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get all instructors
    instructors = Instructor.objects.all()
    instructor_data = InstructorSerializer(instructors, many=True).data

    # Get all courses
    courses = Course.objects.all()
    course_data = CourseSerializer(courses, many=True).data

    # Get student's enrollments and lessons
    enrollments = Enrollment.objects.filter(student=student).select_related("course")
    lessons = (
        Lesson.objects.filter(enrollment__in=enrollments)
        .select_related("enrollment__course", "instructor", "resource")
        .order_by("scheduled_time")
    )
    lesson_data = LessonSerializer(lessons, many=True).data

    # Get payments for the student's enrollments
    payments = (
        Payment.objects.filter(enrollment__in=enrollments)
        .select_related("enrollment__course")
        .order_by("-payment_date")
    )
    payment_data = PaymentSerializer(payments, many=True).data
    # Serialize enrollments for frontend aggregation
    from .serializers import EnrollmentSerializer

    enrollment_data = EnrollmentSerializer(
        enrollments.select_related("course", "student"), many=True
    ).data

    # If no enrollments, return mock data for testing
    # if not enrollments.exists():
    #     mock_course = {
    #         "id": 1,
    #         "name": "Mock Driving Course B",
    #         "category": "B",
    #         "type": "PRACTICE",
    #         "description": "Mock course for testing",
    #         "price": "1500.00",
    #         "required_lessons": 20
    #     }
    #     mock_enrollment = {
    #         "id": 1,
    #         "student": student.id,
    #         "course": mock_course,
    #         "enrollment_date": student.enrollment_date.isoformat(),
    #         "type": "PRACTICE",
    #         "status": "IN_PROGRESS"
    #     }
    #     lesson_data = [{
    #         "id": 1,
    #         "enrollment": mock_enrollment,
    #         "instructor": {"id": 1, "first_name": "Mock", "last_name": "Instructor", "email": "mock@example.com", "phone_number": "+37312345678", "hire_date": "2020-01-01", "license_categories": "B"},
    #         "vehicle": {"id": 1, "make": "Mock", "model": "Car", "license_plate": "MOCK001", "year": 2020, "category": "B", "is_available": True},
    #         "scheduled_time": "2024-10-25T10:00:00Z",
    #         "duration_minutes": 50,
    #         "status": "SCHEDULED",
    #         "notes": "Mock lesson"
    #     }]
    #     payment_data = [{
    #         "id": 1,
    #         "enrollment": mock_enrollment,
    #         "amount": "500.00",
    #         "payment_date": "2024-10-01T00:00:00Z",
    #         "payment_method": "CASH",
    #         "description": "Mock payment"
    #     }]
    #     course_data = [mock_course]
    #     instructor_data = [{
    #         "id": 1,
    #         "first_name": "Mock",
    #         "last_name": "Instructor",
    #         "email": "mock@example.com",
    #         "phone_number": "+37312345678",
    #         "hire_date": "2020-01-01",
    #         "license_categories": "B"
    #     }]

    # Calculate lesson summaries
    lesson_summary = {
        "remaining": {"theory": {}, "practice": {}},
        "completed": {"theory": {}, "practice": {}},
    }

    for enrollment in enrollments:
        course = enrollment.course
        course_type = course.type.lower()  # theory or practice
        course_category = course.category

        # Count completed lessons for this enrollment
        completed_count = Lesson.objects.filter(
            enrollment=enrollment, status=LessonStatus.COMPLETED.value
        ).count()

        # Remaining lessons = required lessons - completed lessons
        remaining_count = max(0, course.required_lessons - completed_count)

        # Initialize category if not exists
        if course_category not in lesson_summary["remaining"][course_type]:
            lesson_summary["remaining"][course_type][course_category] = 0
        if course_category not in lesson_summary["completed"][course_type]:
            lesson_summary["completed"][course_type][course_category] = 0

        lesson_summary["remaining"][course_type][course_category] += remaining_count
        lesson_summary["completed"][course_type][course_category] += completed_count

    # Check if read-only (graduated)
    read_only = student.status == StudentStatus.GRADUATED.value

    return response.Response(
        {
            "student": {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "phone_number": student.phone_number,
                "status": student.status,
                "read_only": read_only,
            },
            "instructors": instructor_data,
            "courses": course_data,
            "lessons": lesson_data,
            "payments": payment_data,
            "enrollments": enrollment_data,
            "lesson_summary": lesson_summary,
        }
    )


class ResourceViewSet(FullCrudViewSet):
    queryset = Resource.objects.all().order_by("name")
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "is_available": ["exact"],
        "category": ["exact"],
        "max_capacity": ["exact", "lte", "gte", "gt", "lt"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="available")
    def available_resources(self, request):
        """Get resources available for a specific time period"""
        resource_type = request.query_params.get("type")  # 'vehicle' or 'classroom'

        qs = self.get_queryset().filter(is_available=True)

        if resource_type == "vehicle":
            qs = qs.filter(max_capacity=2)
        elif resource_type == "classroom":
            qs = qs.filter(max_capacity__gt=2)

        # TODO: Add time-based availability filtering using start_time and end_time query params
        # For now, just return all available resources

        serializer = self.get_serializer(qs, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = [
            "id",
            "name",
            "max_capacity",
            "category",
            "is_available",
            "license_plate",
            "make",
            "model",
            "year",
        ]
        qs = self.filter_queryset(self.get_queryset())

        buf = StringIO()
        w = csv.writer(buf)
        w.writerow(fields)
        for r in qs:
            w.writerow(
                [
                    r.id,
                    r.name,
                    r.max_capacity,
                    r.category or "",
                    "1" if r.is_available else "0",
                    r.license_plate or "",
                    r.make or "",
                    r.model or "",
                    r.year or "",
                ]
            )

        resp = HttpResponse(buf.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=resources.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get("file") or request.FILES.get("csv")
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stream = TextIOWrapper(upload.file, encoding="utf-8") if hasattr(upload, "file") else upload
        reader = csv.DictReader(stream)

        # Required columns for every row
        required_cols = {"name", "max_capacity", "category"}
        header = set(reader.fieldnames or [])
        missing = required_cols - header
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids, updated_ids, errors = [], [], []

        for idx, row in enumerate(reader, start=2):
            # Trim known fields
            data = {k: (row.get(k) or "").strip() for k in reader.fieldnames}

            # Normalize primitives
            try:
                data["max_capacity"] = int(data.get("max_capacity") or 0)
            except ValueError:
                errors.append({"row": idx, "errors": {"max_capacity": ["Invalid number"]}})
                continue

            if data.get("year", "") != "":
                try:
                    data["year"] = int(data["year"])
                except ValueError:
                    errors.append({"row": idx, "errors": {"year": ["Invalid number"]}})
                    continue
            else:
                data["year"] = None

            data["is_available"] = str(data.get("is_available", "")).lower() in ("1", "true", "yes")

            # Empty optional vehicle fields -> None
            for f in ("license_plate", "make", "model"):
                if not data.get(f):
                    data[f] = None

            # Conditional requirements:
            # vehicle = capacity == 2 → plate/make/model/year required
            is_vehicle = data["max_capacity"] == 2
            if is_vehicle:
                missing_vehicle = [
                    f
                    for f in ("license_plate", "make", "model", "year")
                    if data.get(f) in (None, "")
                ]
                if missing_vehicle:
                    errors.append(
                        {
                            "row": idx,
                            "errors": {
                                f: [
                                    "This field is required for vehicle-type resources (max_capacity == 2)."
                                ]
                                for f in missing_vehicle
                            },
                        }
                    )
                    continue

            # Upsert key: plate for vehicles, name for classrooms
            lookup = (
                {"license_plate": data["license_plate"]}
                if (is_vehicle and data.get("license_plate"))
                else {"name": data["name"]}
            )

            try:
                existing = Resource.objects.filter(**lookup).first()
                ser = (
                    ResourceSerializer(existing, data=data, partial=bool(existing))
                    if existing
                    else ResourceSerializer(data=data)
                )
                if ser.is_valid():
                    obj = ser.save()
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
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Creating ScheduledClassPattern with data: {request.data}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Updating ScheduledClassPattern {kwargs.get('pk')} with data: {request.data}")
        return super().update(request, *args, **kwargs)

    @decorators.action(detail=True, methods=["post"], url_path="generate-classes")
    def generate_classes(self, request, pk=None):
        """Generate ScheduledClass instances for this pattern."""
        import time
        import logging
        from django.conf import settings
        from django.core.exceptions import ValidationError
        from .notifications import (
            notification_service,
            ClassGenerationNotificationTemplate,
            StudentEnrollmentNotificationTemplate
        )
        
        logger = logging.getLogger(__name__)
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
        # The dataProvider wraps the response in { data: ... }, so we just return the object with 'id'
        return response.Response({
            "id": pattern.id,
            "generated_count": len(created_classes),
            "enrollment_results": enrollment_results
        }, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=["post"], url_path="regenerate-classes")
    def regenerate_classes(self, request, pk=None):
        """Delete existing generated classes and create new ones."""
        import time
        import logging
        from django.conf import settings
        
        logger = logging.getLogger(__name__)
        start_time = time.time()
        
        pattern = self.get_object()
        
        if settings.DEBUG:
            logger.info(f"Starting regenerate-classes action for pattern '{pattern.name}' (ID: {pattern.id}) by user {request.user}")
        
        # Delete existing classes for this pattern
        delete_result = ScheduledClass.objects.filter(pattern=pattern).delete()
        deleted_count = delete_result[1].get('school.ScheduledClass', 0)  # Only count the main objects, not cascading deletes
        
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
        
        # Return format compatible with react-admin dataProvider.create
        return response.Response({
            "id": pattern.id,
            "deleted_count": deleted_count,
            "generated_count": len(classes),
            "enrollment_results": enrollment_results
        }, status=status.HTTP_200_OK)

    def _auto_enroll_students(self, pattern, created_classes):
        """
        Auto-enroll students from pattern to generated classes
        
        Args:
            pattern: ScheduledClassPattern instance
            created_classes: List of created ScheduledClass instances
            
        Returns:
            Dict with enrollment statistics
        """
        from django.db import transaction
        
        # Fetch all students once to avoid N queries
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
                # Iterate through created classes (instances)
                for scheduled_class in created_classes:
                    # Since these are new classes, they are empty.
                    # We can enroll students up to max_capacity.
                    
                    max_students = scheduled_class.max_students
                    
                    # Determine who can be enrolled
                    students_to_enroll = students[:max_students]
                    students_not_enrolled = students[max_students:]
                    
                    if students_to_enroll:
                        # Bulk add students to the class
                        scheduled_class.students.add(*students_to_enroll)
                        results['enrolled'] += len(students_to_enroll)
                    
                    if students_not_enrolled:
                        results['failed'] += len(students_not_enrolled)
                        
        except Exception as e:
            results['errors'].append(f"Auto-enrollment failed: {str(e)}")
            
        return results

    def _send_generation_notifications(self, pattern, created_classes, enrollment_results):
        """
        Send notifications about class generation
        
        Args:
            pattern: ScheduledClassPattern instance
            created_classes: List of created ScheduledClass instances
            enrollment_results: Results from auto-enrollment
        """
        from .notifications import (
            notification_service,
            ClassGenerationNotificationTemplate,
            StudentEnrollmentNotificationTemplate
        )
        
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
            
            # Optimize: Fetch all student enrollments for these classes in one query
            # instead of querying for each class
            ScheduledClassStudent = ScheduledClass.students.through
            relations = ScheduledClassStudent.objects.filter(
                scheduledclass__in=created_classes
            ).select_related('student')
            
            # Group students by class
            class_students = {}
            for rel in relations:
                if rel.scheduledclass_id not in class_students:
                    class_students[rel.scheduledclass_id] = []
                class_students[rel.scheduledclass_id].append(rel.student)
            
            # Send notification for each generated class
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
        
        # Get all classes for this pattern
        classes = ScheduledClass.objects.filter(pattern=pattern)
        
        # Calculate statistics
        total_classes = classes.count()
        scheduled_classes = classes.filter(status=LessonStatus.SCHEDULED.value).count()
        completed_classes = classes.filter(status=LessonStatus.COMPLETED.value).count()
        cancelled_classes = classes.filter(status=LessonStatus.CANCELED.value).count()
        
        # Student enrollment statistics
        total_enrollments = pattern.students.count()
        
        # Average students per class
        avg_students_per_class = 0
        if total_classes > 0:
            avg_students_per_class = total_enrollments
        
        # Capacity utilization
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
            "duration_minutes",
            "max_students",
            "status",
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
                obj.duration_minutes,
                obj.max_students,
                obj.status,
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
        """Enroll a student in a scheduled class"""
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
        """Unenroll a student from a scheduled class"""
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
        # Optional columns
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
            # Build data dict with required fields first
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

                # Apply defaults and optional fields
                duration_val = (row.get("duration_minutes") or "").strip()
                if duration_val:
                    data["duration_minutes"] = duration_val
                else:
                    data["duration_minutes"] = 60

                student_ids_raw = (row.get("student_ids") or "").strip()

                # Upsert by composite key (course_id, instructor_id, scheduled_time)
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
                    # If student_ids provided, set M2M after save
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
