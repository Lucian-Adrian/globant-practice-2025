import csv
from datetime import timedelta
from io import StringIO, TextIOWrapper

from django.db import models
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils.timezone import now
from rest_framework import decorators, mixins, response, status, viewsets
from rest_framework.permissions import AllowAny

from .models import Course, Enrollment, Instructor, Lesson, Payment, Student, Vehicle
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    InstructorSerializer,
    LessonSerializer,
    PaymentSerializer,
    StudentSerializer,
    VehicleSerializer,
)


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


class StudentViewSet(FullCrudViewSet):
    queryset = Student.objects.all().order_by("-enrollment_date")
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    # Enable filtering by status and enrollment_date range via django-filter
    # e.g., ?status=ACTIVE&enrollment_date__gte=2024-01-01T00:00:00Z
    filterset_fields = {
        "status": ["exact"],
        "enrollment_date": ["gte", "lte", "gt", "lt"],
        "enrollments__course": ["exact"],
    }

    def get_queryset(self):
        return super().get_queryset().distinct()

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export filtered/sorted students to CSV.

        Honors same query params as list (status, enrollment_date__gte/lte, ordering).
        Ignores pagination to export the full filtered set.
        """
        qs = self.filter_queryset(self.get_queryset())
        # Drop pagination
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "date_of_birth",
            "enrollment_date",
            "status",
        ]

        # Stream CSV
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
            ]
            writer.writerow(row)

        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=students.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        """Import students from uploaded CSV.

        Expected columns (header required): first_name,last_name,email,phone_number,date_of_birth,status
        date_of_birth accepts YYYY-MM-DD.
        Returns counts and IDs created.
        """
        upload = request.FILES.get("file") or request.FILES.get("csv")
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure text mode
        text_stream = (
            TextIOWrapper(upload.file, encoding="utf-8") if hasattr(upload, "file") else upload
        )
        reader = csv.DictReader(text_stream)

        required_cols = {"first_name", "last_name", "email", "phone_number", "date_of_birth"}
        missing = required_cols - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids = []
        errors = []
        for idx, row in enumerate(reader, start=2):  # start=2 to account for header row
            data = {
                "first_name": row.get("first_name", "").strip(),
                "last_name": row.get("last_name", "").strip(),
                "email": row.get("email", "").strip(),
                "phone_number": row.get("phone_number", "").strip(),
                "date_of_birth": (row.get("date_of_birth") or "").strip(),
                "status": (row.get("status") or "ACTIVE").strip() or "ACTIVE",
            }
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
    # Allow filtering by hire_date ranges from RA side filters
    filterset_fields = {
        "hire_date": ["gte", "lte", "gt", "lt"],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get("experience_level")
        if level:
            # Map virtual experience_level to hire_date ranges
            today = now().date()

            # Helper to compute date X years ago (approx 365 days per year is ok for filtering)
            def years_ago(years: int):
                return today.replace(year=today.year - years)

            if level.upper() == "NEW":
                # Hired within last year
                threshold = years_ago(1)
                qs = qs.filter(hire_date__gte=threshold)
            elif level.upper() == "EXPERIENCED":
                # Between 1 and 5 years
                lower = years_ago(5)
                upper = years_ago(1)
                qs = qs.filter(hire_date__gte=lower, hire_date__lt=upper)
            elif level.upper() == "SENIOR":
                # More than 5 years
                threshold = years_ago(5)
                qs = qs.filter(hire_date__lt=threshold)
        return qs


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by("-year")
    serializer_class = VehicleSerializer


class CourseViewSet(FullCrudViewSet):
    queryset = Course.objects.all().order_by("category")
    serializer_class = CourseSerializer


class EnrollmentViewSet(FullCrudViewSet):
    queryset = (
        Enrollment.objects.select_related("student", "course").all().order_by("-enrollment_date")
    )
    serializer_class = EnrollmentSerializer


class LessonViewSet(FullCrudViewSet):
    queryset = Lesson.objects.select_related("enrollment__student", "instructor", "vehicle").all()
    serializer_class = LessonSerializer


class PaymentViewSet(FullCrudViewSet):
    queryset = Payment.objects.select_related("enrollment__student").all()
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
            Lesson.objects.select_related("instructor", "enrollment__student", "vehicle")
            .filter(scheduled_time__gte=start, scheduled_time__lte=end)
            .order_by("scheduled_time")
        )
        serializer = LessonSerializer(lessons, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["get"], url_path="lesson-stats")
    def lesson_stats(self, request):
        """Return lesson-related KPIs for the admin dashboard.

        Metrics returned (camelCase to match frontend expectations):
        - todayScheduled: SCHEDULED lessons scheduled for today
        - thisWeekCompleted: COMPLETED lessons in current ISO week
        - attendanceRate: for current week, completed / (completed + canceled) * 100
        - topInstructors: top 3 instructors over last 4 weeks with completion rate
        - weeklyTrend: total lessons per week for last 4 weeks (oldest -> newest)
        """
        now_ts = now()
        # Normalize to start of today
        today_start = now_ts.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        # ISO week: Monday is 0
        week_start = today_start - timedelta(days=today_start.weekday())
        week_end = week_start + timedelta(days=7)

        # Lessons created (registered) today
        today_scheduled = Lesson.objects.filter(
            scheduled_time__gte=today_start,
            scheduled_time__lt=today_end,
            status="SCHEDULED",
        ).count()

        # This week completed and canceled
        week_qs = Lesson.objects.filter(
            scheduled_time__gte=week_start,
            scheduled_time__lt=week_end,
        )
        this_week_completed = week_qs.filter(status="COMPLETED").count()
        this_week_canceled = week_qs.filter(status="CANCELED").count()
        denom = this_week_completed + this_week_canceled
        attendance_rate = int(round((this_week_completed / denom) * 100)) if denom else 0

        # Top instructors over last 4 weeks
        last4_start = week_start - timedelta(days=21)
        instr_stats = (
            Lesson.objects.filter(
                scheduled_time__gte=last4_start,
                scheduled_time__lt=week_end,
            )
            .values("instructor_id", "instructor__first_name", "instructor__last_name")
            .annotate(
                total=Count("id"),
                completed=Count("id", filter=Q(status="COMPLETED")),
            )
            .order_by("-total")[:3]
        )
        top_instructors = [
            {
                "name": f"{row['instructor__first_name']} {row['instructor__last_name']}",
                "total": row["total"] or 0,
                "completed": row["completed"] or 0,
                "completionRate": (
                    int(round(((row["completed"] or 0) / row["total"]) * 100))
                    if row["total"]
                    else 0
                ),
            }
            for row in instr_stats
        ]

        # Weekly trend for last 4 weeks (oldest to newest)
        weekly_trend = []
        for i in range(4):
            # oldest is i=0 -> 3 weeks ago
            start = week_start - timedelta(days=7 * (3 - i))
            end = start + timedelta(days=7)
            cnt = Lesson.objects.filter(scheduled_time__gte=start, scheduled_time__lt=end).count()
            weekly_trend.append({"week": f"W{i+1}", "lessons": cnt})

        return response.Response(
            {
                "todayScheduled": today_scheduled,
                "thisWeekCompleted": this_week_completed,
                "attendanceRate": attendance_rate,
                "topInstructors": top_instructors,
                "weeklyTrend": weekly_trend,
            }
        )
