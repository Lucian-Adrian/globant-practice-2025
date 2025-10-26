from rest_framework import viewsets, mixins, decorators, response, status
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
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
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment, InstructorAvailability
from .serializers import (
    StudentSerializer, InstructorSerializer, VehicleSerializer, CourseSerializer,
    EnrollmentSerializer, LessonSerializer, PaymentSerializer, InstructorAvailabilitySerializer
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


class FullCrudViewSet(mixins.ListModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.CreateModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    """Full CRUD for internal use (no auth layer yet—secure before prod)."""
    pass


class QSearchFilter(SearchFilter):
    """Use 'q' as the search query parameter to align with frontend SearchInput."""
    search_param = 'q'


class StudentViewSet(FullCrudViewSet):
    queryset = Student.objects.all().order_by('-enrollment_date')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, QSearchFilter, OrderingFilter]

    filterset_fields = {
        'status': ['exact'],
        'enrollment_date': ['gte', 'lte', 'gt', 'lt'],
    }
    search_fields = ['first_name', 'last_name']

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'enrollment_date', 'status', 'password'
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
                obj.password,
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

            # Password handling
            pwd = (row.get("password") or "").strip()
            if pwd:
                data["password"] = pwd

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
    # Enable filtering/sorting/searching; RA uses 'q' for free-text search
    filter_backends = [DjangoFilterBackend, QSearchFilter, OrderingFilter]
    search_fields = ['first_name', 'last_name']

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, 'request', None):
            category = (self.request.query_params.get('category') or '').strip()
            if category:
                qs = qs.filter(license_categories__icontains=category)
        return qs

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'hire_date', 'license_categories']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id, obj.first_name, obj.last_name, obj.email, obj.phone_number,
                obj.hire_date.isoformat() if obj.hire_date else '', obj.license_categories
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=instructors.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'first_name', 'last_name', 'email', 'phone_number', 'hire_date', 'license_categories'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {k: (row.get(k) or '').strip() for k in required}
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


class InstructorAvailabilityViewSet(FullCrudViewSet):
    queryset = InstructorAvailability.objects.select_related('instructor').all()
    serializer_class = InstructorAvailabilitySerializer
    filter_backends = [DjangoFilterBackend]
    # Allow filtering by instructor_id and day from the frontend (e.g. ?instructor_id=3)
    # This mirrors the pattern used on other viewsets (students, instructors) and
    # allows the dataProvider getList calls to request per-instructor availabilities.
    filterset_fields = {
        'instructor_id': ['exact'],
        'day': ['exact'],
    }


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by('-year')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'is_available': ['exact'],
        'category': ['exact'],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'make', 'model', 'license_plate', 'year', 'category', 'is_available']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([obj.id, obj.make, obj.model, obj.license_plate, obj.year, obj.category, obj.is_available])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=vehicles.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'make', 'model', 'license_plate', 'year', 'category'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {
                'make': (row.get('make') or '').strip(),
                'model': (row.get('model') or '').strip(),
                'license_plate': (row.get('license_plate') or '').strip(),
                'year': (row.get('year') or '').strip(),
                'category': (row.get('category') or '').strip(),
                'is_available': ((row.get('is_available') or 'true').strip().lower() in ['1','true','yes'])
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


class CourseViewSet(FullCrudViewSet):
    queryset = Course.objects.all().order_by('category')
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'type': ['exact'],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'name', 'category', 'type', 'description', 'price', 'required_lessons']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([obj.id, obj.name, obj.category, obj.type, obj.description, obj.price, obj.required_lessons])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=courses.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'name', 'category', 'type', 'description', 'price', 'required_lessons'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {k: (row.get(k) or '').strip() for k in required}
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


class EnrollmentViewSet(FullCrudViewSet):
    queryset = Enrollment.objects.select_related('student', 'course').all().order_by('-enrollment_date')
    serializer_class = EnrollmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'enrollment_date': ['gte', 'lte', 'gt', 'lt'],
        'student': ['exact'],
        'course': ['exact'],
        'course__category': ['exact'],
        'type': ['exact'],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'student_id', 'course_id', 'enrollment_date', 'type', 'status']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id, obj.student_id, obj.course_id,
                obj.enrollment_date.isoformat() if obj.enrollment_date else '',
                obj.type, obj.status
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=enrollments.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'student_id', 'course_id', 'type', 'status'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {
                'student_id': (row.get('student_id') or '').strip(),
                'course_id': (row.get('course_id') or '').strip(),
                'type': (row.get('type') or '').strip(),
                'status': (row.get('status') or '').strip() or 'IN_PROGRESS',
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


class LessonViewSet(FullCrudViewSet):
    queryset = Lesson.objects.select_related('enrollment__student', 'instructor', 'vehicle').all()
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'scheduled_time': ['gte', 'lte', 'gt', 'lt'],
        'instructor': ['exact'],
        'vehicle__license_plate': ['exact'],
        'enrollment__student': ['exact'],
        'enrollment__course': ['exact'],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        # Accept both instructor and instructor_id as aliases
        if getattr(self, 'request', None):
            instr = self.request.query_params.get('instructor') or self.request.query_params.get('instructor_id')
            if instr:
                qs = qs.filter(instructor_id=instr)
            # Accept 'vehicle' as a license plate string alias for vehicle__license_plate
            vehicle_lp = self.request.query_params.get('vehicle')
            if vehicle_lp:
                qs = qs.filter(vehicle__license_plate=vehicle_lp)
        return qs

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'enrollment_id', 'instructor_id', 'vehicle_id', 'scheduled_time', 'duration_minutes', 'status', 'notes']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id, obj.enrollment_id, obj.instructor_id, obj.vehicle_id,
                obj.scheduled_time.isoformat() if obj.scheduled_time else '',
                obj.duration_minutes, obj.status, (obj.notes or '').replace('\n', ' ')
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=lessons.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'enrollment_id', 'instructor_id', 'vehicle_id', 'scheduled_time', 'duration_minutes', 'status'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {
                'enrollment_id': (row.get('enrollment_id') or '').strip(),
                'instructor_id': (row.get('instructor_id') or '').strip(),
                'vehicle_id': (row.get('vehicle_id') or '').strip() or None,
                'scheduled_time': (row.get('scheduled_time') or '').strip(),
                'duration_minutes': (row.get('duration_minutes') or '').strip() or '60',
                'status': (row.get('status') or '').strip(),
                'notes': (row.get('notes') or '').strip(),
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


class PaymentViewSet(FullCrudViewSet):
    queryset = Payment.objects.select_related('enrollment__student').all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'payment_date': ['gte', 'lte', 'gt', 'lt'],
        'payment_method': ['exact'],
        'enrollment': ['exact'],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ['id', 'enrollment_id', 'amount', 'payment_date', 'payment_method', 'description']
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO(); writer = csv.writer(buffer); writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id, obj.enrollment_id, obj.amount,
                obj.payment_date.isoformat() if obj.payment_date else '',
                obj.payment_method, obj.description
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=payments.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response({"detail": "No file uploaded. Use form field 'file'."}, status=status.HTTP_400_BAD_REQUEST)
        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)
        required = {'enrollment_id', 'amount', 'payment_method', 'description'}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response({"detail": f"Missing required columns: {', '.join(sorted(missing))}"}, status=status.HTTP_400_BAD_REQUEST)
        created_ids, errors = [], []
        for idx, row in enumerate(reader, start=2):
            data = {
                'enrollment_id': (row.get('enrollment_id') or '').strip(),
                'amount': (row.get('amount') or '').strip(),
                'payment_method': (row.get('payment_method') or '').strip(),
                'description': (row.get('description') or '').strip(),
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save(); created_ids.append(obj.id)
            else:
                errors.append({"row": idx, "errors": serializer.errors})
        return response.Response({"created": len(created_ids), "created_ids": created_ids, "errors": errors})


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
    enrollments = Enrollment.objects.filter(student=student).select_related('course')
    lessons = Lesson.objects.filter(enrollment__in=enrollments).select_related('enrollment__course', 'instructor', 'vehicle').order_by('scheduled_time')
    lesson_data = LessonSerializer(lessons, many=True).data
    
    # Get payments for the student's enrollments
    payments = Payment.objects.filter(enrollment__in=enrollments).select_related('enrollment__course').order_by('-payment_date')
    payment_data = PaymentSerializer(payments, many=True).data
    # Serialize enrollments for frontend aggregation
    from .serializers import EnrollmentSerializer
    enrollment_data = EnrollmentSerializer(enrollments.select_related('course', 'student'), many=True).data
    
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
        "completed": {"theory": {}, "practice": {}}
    }
    
    for enrollment in enrollments:
        course = enrollment.course
        course_type = course.type.lower()  # theory or practice
        course_category = course.category
        
        # Count completed lessons for this enrollment
        completed_count = Lesson.objects.filter(
            enrollment=enrollment,
            status=LessonStatus.COMPLETED.value
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
        "enrollments": enrollment_data,
        "lesson_summary": lesson_summary,
    })
