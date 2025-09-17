from rest_framework import viewsets, mixins, decorators, response, status
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
