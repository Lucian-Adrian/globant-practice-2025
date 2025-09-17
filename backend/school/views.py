from rest_framework import viewsets, mixins, decorators, response, status
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
import csv
from io import StringIO, TextIOWrapper
from django.db import models
from django.utils.timezone import now
from datetime import timedelta
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment
from .serializers import (
    StudentSerializer, InstructorSerializer, VehicleSerializer, CourseSerializer,
    EnrollmentSerializer, LessonSerializer, PaymentSerializer
)
from .enums import all_enums_for_meta
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
