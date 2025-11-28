import csv
import hashlib
import json
from datetime import timedelta
from io import StringIO, TextIOWrapper

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models, transaction
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
    Address,
    Course,
    Enrollment,
    Instructor,
    InstructorAvailability,
    Lesson,
    Payment,
    Resource,
    ScheduledClass,
    ScheduledClassPattern,
    SchoolConfig,
    Student,
    Vehicle,
)
from .serializers import (
    AddressSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    InstructorAvailabilitySerializer,
    InstructorSerializer,
    LessonSerializer,
    PaymentSerializer,
    ResourceSerializer,
    ScheduledClassSerializer,
    ScheduledClassPatternSerializer,
    SchoolConfigSerializer,
    StudentSerializer,
    VehicleSerializer,
)
from .pagination import StandardResultsSetPagination
from .validators import normalize_phone, validate_upload_file

# Import refactored ViewSets from views package
from .views import (
    FullCrudViewSet,
    IsAdminUser,
    IsAuthenticatedStudent,
    QSearchFilter,
    StudentJWTAuthentication,
    StudentViewSet,
    InstructorViewSet,
    InstructorAvailabilityViewSet,
)



# VehicleViewSet moved to views/resource_views.py
from .views import VehicleViewSet



# CourseViewSet and EnrollmentViewSet moved to views/course_views.py
from .views import CourseViewSet, EnrollmentViewSet



# LessonViewSet and PaymentViewSet moved to views/lesson_views.py
from .views import LessonViewSet, PaymentViewSet


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
    import logging
    logger = logging.getLogger(__name__)
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
    enrolled_course_ids = list(enrollments.values_list("course_id", flat=True))
    logger.debug(
        "student_dashboard: student_id=%s, enrolled_course_ids=%s, enrollments_count=%s",
        student.id,
        enrolled_course_ids,
        enrollments.count(),
    )
    lessons = (
        Lesson.objects.filter(enrollment__in=enrollments)
        .select_related("enrollment__course", "instructor", "resource")
        .order_by("scheduled_time")
    )
    lesson_data = LessonSerializer(lessons, many=True).data

    # Patterns that explicitly include this student and belong to enrolled courses
    # - course must be one of the student's enrolled courses
    # - AND the student must be in pattern.students
    patterns = (
        ScheduledClassPattern.objects.filter(
            course_id__in=enrolled_course_ids,
            students=student,
        )
        .select_related("course", "instructor", "resource")
        .prefetch_related("students")
    )
    pattern_data = ScheduledClassPatternSerializer(patterns, many=True).data
    logger.debug(
        "student_dashboard: patterns_count=%s for student_id=%s",
        len(pattern_data),
        student.id,
    )

    # Scheduled classes for this student (theory side)
    # Include classes linked to the above patterns where the student participates
    scheduled_classes = (
        ScheduledClass.objects.filter(
            students=student,
            pattern__in=patterns,
        )
        .select_related(
            "pattern__course",
            "pattern__instructor",
            "pattern__resource",
            "course",
            "instructor",
            "resource",
        )
        .prefetch_related("pattern__students", "students")
        .order_by("scheduled_time")
    )
    scheduled_class_data = ScheduledClassSerializer(scheduled_classes, many=True).data
    logger.debug(
        "student_dashboard: scheduled_classes_count=%s for student_id=%s",
        len(scheduled_class_data),
        student.id,
    )

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
            "scheduled_classes": scheduled_class_data,
            "patterns": pattern_data,
            "payments": payment_data,
            "enrollments": enrollment_data,
            "lesson_summary": lesson_summary,
        }
    )


# ResourceViewSet, ScheduledClassPatternViewSet, ScheduledClassViewSet moved to views/
from .resource_views import ResourceViewSet
from .scheduled_views import ScheduledClassPatternViewSet, ScheduledClassViewSet


class AddressViewSet(FullCrudViewSet):
    """ViewSet for Address model."""

    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [AllowAny]


class SchoolConfigViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for SchoolConfig singleton model.
    Supports GET and PUT operations only.
    Always returns/updates the singleton instance (pk=1).
    """

    queryset = SchoolConfig.objects.all()
    serializer_class = SchoolConfigSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        """Always return the singleton instance, create if doesn't exist."""
        obj, created = SchoolConfig.objects.get_or_create(pk=1)
        return obj

    def list(self, request, *args, **kwargs):
        """Override list to return singleton object instead of list."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["post"], url_path="upload_logo")
    def upload_logo(self, request):
        """
        Upload school logo image.
        Expects multipart/form-data with 'logo' file field.

        Validates:
        - File size (max 5MB)
        - File format (jpg, png, gif, webp)
        - Image integrity
        """
        if "logo" not in request.FILES:
            return response.Response(
                {"error": "No logo file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        logo_file = request.FILES["logo"]

        # Validate file before saving
        try:
            validate_upload_file(logo_file, max_mb=5, file_type='image')
        except ValueError as e:
            return response.Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.school_logo = logo_file
        config.save()

        serializer = self.get_serializer(config)
        return response.Response(
            {
                "message": "Logo uploaded successfully",
                "school_logo": serializer.data.get("school_logo"),
            },
            status=status.HTTP_200_OK,
        )

    @decorators.action(detail=False, methods=["post"], url_path="upload_landing_image")
    def upload_landing_image(self, request):
        """
        Upload landing page image.
        Expects multipart/form-data with 'image' file field.

        Validates:
        - File size (max 5MB)
        - File format (jpg, png, gif, webp)
        - Image integrity
        """
        if "image" not in request.FILES:
            return response.Response(
                {"error": "No image file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_file = request.FILES["image"]

        # Validate file before saving
        try:
            validate_upload_file(image_file, max_mb=5, file_type='image')
        except ValueError as e:
            return response.Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.landing_image = image_file
        config.save()

        serializer = self.get_serializer(config)
        return response.Response(
            {
                "message": "Landing image uploaded successfully",
                "landing_image": serializer.data.get("landing_image"),
            },
            status=status.HTTP_200_OK,
        )
