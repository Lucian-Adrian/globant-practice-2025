from rest_framework import viewsets, mixins, decorators, response, status
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.http import HttpResponse
import csv
from io import StringIO, TextIOWrapper
from django.db import models
from django.utils.timezone import now
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment
from .serializers import (
    StudentSerializer, InstructorSerializer, VehicleSerializer, CourseSerializer,
    EnrollmentSerializer, LessonSerializer, PaymentSerializer
)
from .enums import all_enums_for_meta, StudentStatus, LessonStatus
import hashlib, json
from .validators import normalize_phone


class IsAuthenticatedStudent(BasePermission):
    def has_permission(self, request, view):
        # Check if token has student_id
        if hasattr(request, 'auth') and request.auth:
            return 'student_id' in request.auth
        return False


class StudentJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        student_id = validated_token.get('student_id')
        if not student_id:
            raise InvalidToken('Token contained no recognizable user identification')
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise InvalidToken('Student not found')
        return student


class StudentJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        student_id = validated_token.get('student_id')
        if not student_id:
            raise InvalidToken('Token contained no recognizable user identification')
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise InvalidToken('Student not found')
        return student
from .serializers import (
    StudentSerializer, InstructorSerializer, VehicleSerializer, CourseSerializer,
    EnrollmentSerializer, LessonSerializer, PaymentSerializer
)
from .enums import all_enums_for_meta, StudentStatus
import hashlib, json
from .validators import normalize_phone


class FullCrudViewSet(mixins.ListModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.CreateModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    """Full CRUD for internal use (no auth layer yet—secure before prod)."""
    pass


class StudentViewSet(FullCrudViewSet):
    queryset = Student.objects.all().order_by('-enrollment_date')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    filterset_fields = {
        'status': ['exact'],
        'enrollment_date': ['gte', 'lte', 'gt', 'lt'],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'enrollment_date', 'status'
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
                obj.date_of_birth.isoformat() if obj.date_of_birth else '',
                obj.enrollment_date.isoformat() if obj.enrollment_date else '',
                obj.status,
            ]
            writer.writerow(row)

        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=students.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)

        required_cols = {'first_name', 'last_name', 'email', 'phone_number', 'date_of_birth'}
        missing = required_cols - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids = []
        errors = []
        for idx, row in enumerate(reader, start=2):
            phone = (row.get('phone_number') or '').strip()
            try:
                phone = normalize_phone(phone)
            except Exception as e:  # noqa: BLE001
                errors.append({"row": idx, "errors": {"phone_number": [str(e)]}})
                continue
            data = {
                'first_name': row.get('first_name', '').strip(),
                'last_name': row.get('last_name', '').strip(),
                'email': row.get('email', '').strip(),
                'phone_number': phone,
                'date_of_birth': (row.get('date_of_birth') or '').strip(),
                'status': (row.get('status') or 'ACTIVE').strip() or 'ACTIVE',
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save()
                created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})

        return response.Response({
            "created": len(created_ids),
            "created_ids": created_ids,
            "errors": errors,
        })


class InstructorViewSet(FullCrudViewSet):
    queryset = Instructor.objects.all().order_by('-hire_date')
    serializer_class = InstructorSerializer


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by('-year')
    serializer_class = VehicleSerializer


class CourseViewSet(FullCrudViewSet):
    queryset = Course.objects.all().order_by('category')
    serializer_class = CourseSerializer


class EnrollmentViewSet(FullCrudViewSet):
    queryset = Enrollment.objects.select_related('student', 'course').all().order_by('-enrollment_date')
    serializer_class = EnrollmentSerializer


class LessonViewSet(FullCrudViewSet):
    queryset = Lesson.objects.select_related('enrollment__student', 'instructor', 'vehicle').all()
    serializer_class = LessonSerializer


class PaymentViewSet(FullCrudViewSet):
    queryset = Payment.objects.select_related('enrollment__student').all()
    serializer_class = PaymentSerializer


class UtilityViewSet(viewsets.ViewSet):
    """Misc read-only helpers for dashboards."""

    @decorators.action(detail=False, methods=["get"])
    def summary(self, request):
        data = {
            "students": Student.objects.count(),
            "instructors": Instructor.objects.count(),
            "vehicles": Vehicle.objects.count(),
            "courses": Course.objects.count(),
            "enrollments_active": Enrollment.objects.exclude(status='COMPLETED').count(),
            "lessons_scheduled": Lesson.objects.filter(status='SCHEDULED').count(),
            "payments_total": float(Payment.objects.all().aggregate(sum=models.Sum('amount'))['sum'] or 0),
        }
        return response.Response(data)

    @decorators.action(detail=False, methods=["get"], url_path="schedule")
    def schedule(self, request):
        start = now()
        end = start + timedelta(days=7)
        lessons = Lesson.objects.select_related('instructor', 'enrollment__student', 'vehicle') \
            .filter(scheduled_time__gte=start, scheduled_time__lte=end) \
            .order_by('scheduled_time')
        serializer = LessonSerializer(lessons, many=True)
        return response.Response(serializer.data)


@decorators.api_view(["GET"])  # type: ignore[misc]
def enums_meta(request):
    """Return a mapping of enum identifiers to lists of values with ETag support."""
    payload = all_enums_for_meta()
    body = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    etag = 'W/"' + hashlib.md5(body).hexdigest() + '"'  # weak ETag sufficient
    if request.META.get('HTTP_IF_NONE_MATCH') == etag:
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
    username = (request.GET.get('username') or '').strip()
    if not username:
        return response.Response({"detail": "username required"}, status=status.HTTP_400_BAD_REQUEST)
    User = get_user_model()
    exists = User.objects.filter(username=username).exists()
    return response.Response({"username": username, "exists": exists})


@decorators.api_view(["POST"])  # type: ignore[misc]
@decorators.permission_classes([AllowAny])
def student_login(request):
    """Student login endpoint. Authenticates student and returns JWT tokens if status allows."""
    data = request.data or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    
    if not email or not password:
        return response.Response({"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return response.Response({"detail": "This account has not been found"}, status=status.HTTP_404_NOT_FOUND)
    
    if not student.check_password(password):
        return response.Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if student.status == StudentStatus.PENDING.value:
        return response.Response({"detail": "Your account is pending approval. Please wait to be approved."}, status=status.HTTP_403_FORBIDDEN)
    elif student.status == StudentStatus.INACTIVE.value:
        return response.Response({"detail": "This account has been deactivated"}, status=status.HTTP_403_FORBIDDEN)
    elif student.status == StudentStatus.GRADUATED.value:
        # Allow login but mark as read-only
        pass
    elif student.status == StudentStatus.ACTIVE.value:
        pass
    else:
        return response.Response({"detail": "Invalid account status"}, status=status.HTTP_403_FORBIDDEN)
    
    # Generate JWT tokens
    refresh = RefreshToken()
    refresh['student_id'] = student.id
    refresh['status'] = student.status
    access = refresh.access_token
    access['student_id'] = student.id
    access['status'] = student.status
    
    return response.Response({
        "access": str(access),
        "refresh": str(refresh),
        "student": {
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "status": student.status,
        }
    })


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.authentication_classes([])  # No authentication
@decorators.permission_classes([AllowAny])
def student_me(request):
    """Return info about the authenticated student."""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        return response.Response({"detail": "Authorization header missing or invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
        student_id = access_token.get('student_id')
        if not student_id:
            return response.Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception:
        return response.Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return response.Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
    
    return response.Response({
        "id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "status": student.status,
    })


@decorators.api_view(["GET"])  # type: ignore[misc]
@decorators.authentication_classes([])  # No authentication
@decorators.permission_classes([AllowAny])
def student_dashboard(request):
    """Student dashboard: view instructors and courses."""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        return response.Response({"detail": "Authorization header missing or invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
        student_id = access_token.get('student_id')
        if not student_id:
            return response.Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
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
    enrollments = Enrollment.objects.filter(student=student)
    lessons = Lesson.objects.filter(enrollment__in=enrollments).select_related('enrollment__course', 'instructor', 'vehicle').order_by('scheduled_time')
    lesson_data = LessonSerializer(lessons, many=True).data
    
    # Get payments for the student's enrollments
    payments = Payment.objects.filter(enrollment__in=enrollments).select_related('enrollment__course').order_by('-payment_date')
    payment_data = PaymentSerializer(payments, many=True).data
    
    # Calculate lesson summaries
    lesson_summary = {
        "remaining": {"theory": {}, "practice": {}},
        "completed": {"theory": {}, "practice": {}}
    }
    
    # Get all lessons with course info
    all_lessons = Lesson.objects.filter(enrollment__in=enrollments).select_related('enrollment__course')
    
    for lesson in all_lessons:
        course_type = lesson.enrollment.course.type.lower()  # theory or practice
        course_category = lesson.enrollment.course.category
        
        if lesson.status == LessonStatus.SCHEDULED.value:
            target = lesson_summary["remaining"][course_type]
        elif lesson.status == LessonStatus.COMPLETED.value:
            target = lesson_summary["completed"][course_type]
        else:
            continue
            
        if course_category not in target:
            target[course_category] = 0
        target[course_category] += 1
    
    # Check if read-only (graduated)
    read_only = student.status == StudentStatus.GRADUATED.value
    
    return response.Response({
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
        "lesson_summary": lesson_summary,
    })
