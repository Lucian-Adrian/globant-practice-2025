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
    StudentSerializer, StudentDetailSerializer, InstructorSerializer, VehicleSerializer, CourseSerializer,
    EnrollmentSerializer, LessonSerializer, PaymentSerializer
)


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
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentDetailSerializer
        return StudentSerializer



class InstructorViewSet(FullCrudViewSet):
    queryset = Instructor.objects.all().order_by('-hire_date')
    serializer_class = InstructorSerializer

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export filtered/sorted instructors to CSV; no pagination."""
        qs = self.filter_queryset(self.get_queryset())
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'hire_date', 'license_categories']
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id,
                obj.first_name,
                obj.last_name,
                obj.email,
                obj.phone_number,
                obj.hire_date.isoformat() if obj.hire_date else '',
                obj.license_categories,
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=instructors.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import instructors from uploaded CSV.

        Expected header columns: first_name,last_name,email,phone_number,hire_date,license_categories
        hire_date accepts YYYY-MM-DD.
        """
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)

        required_cols = {
            'first_name', 'last_name', 'email', 'phone_number', 'hire_date', 'license_categories'
        }
        missing = required_cols - set([c.strip() for c in (reader.fieldnames or [])])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids = []
        errors = []
        for idx, row in enumerate(reader, start=2):
            data = {
                'first_name': (row.get('first_name') or '').strip(),
                'last_name': (row.get('last_name') or '').strip(),
                'email': (row.get('email') or '').strip(),
                'phone_number': (row.get('phone_number') or '').strip(),
                'hire_date': (row.get('hire_date') or '').strip(),
                'license_categories': (row.get('license_categories') or '').strip(),
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


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by('-year')
    serializer_class = VehicleSerializer

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export filtered/sorted vehicles to CSV; no pagination."""
        qs = self.filter_queryset(self.get_queryset())
        fields = ['id', 'make', 'model', 'license_plate', 'year', 'category', 'is_available']
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow([
                obj.id,
                obj.make,
                obj.model,
                obj.license_plate,
                obj.year,
                obj.category,
                'true' if obj.is_available else 'false',
            ])
        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename=vehicles.csv'
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import vehicles from uploaded CSV.

        Expected header columns: make,model,license_plate,year,category[,is_available]
        - year: integer
        - category: one of defined categories
        - is_available: optional, truthy values: 'true','1','yes' (case-insensitive)
        """
        upload = request.FILES.get('file') or request.FILES.get('csv')
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        text_stream = TextIOWrapper(upload.file, encoding='utf-8') if hasattr(upload, 'file') else upload
        reader = csv.DictReader(text_stream)

        required_cols = {'make', 'model', 'license_plate', 'year', 'category'}
        missing = required_cols - set([c.strip() for c in (reader.fieldnames or [])])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        truthy = {"true", "1", "yes", "y", "t"}
        created_ids = []
        errors = []
        for idx, row in enumerate(reader, start=2):
            raw_available = (row.get('is_available') or '').strip().lower()
            data = {
                'make': (row.get('make') or '').strip(),
                'model': (row.get('model') or '').strip(),
                'license_plate': (row.get('license_plate') or '').strip(),
                'year': (row.get('year') or '').strip(),
                'category': (row.get('category') or '').strip(),
                'is_available': raw_available in truthy if raw_available else True,
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
