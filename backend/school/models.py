from django.contrib.auth.hashers import make_password
from django.core.validators import EmailValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower

from .enums import (
    CourseType,
    DayOfWeek,
    EnrollmentStatus,
    LessonStatus,
    PaymentMethod,
    PaymentStatus,
    StudentStatus,
    VehicleCategory,
)
from .validators import (
    django_validate_name,
    django_validate_phone,
    django_validate_license_categories,
    normalize_phone,
)


class Student(models.Model):
    first_name = models.CharField(max_length=50, validators=[django_validate_name])
    last_name = models.CharField(max_length=50, validators=[django_validate_name])
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, unique=True, validators=[django_validate_phone])
    date_of_birth = models.DateField()
    enrollment_date = models.DateTimeField(auto_now_add=True)
    password = models.CharField(max_length=128, null=True, blank=True)  # hashed password
    status = models.CharField(
        max_length=20,
        choices=StudentStatus.choices(),
        default=StudentStatus.PENDING.value,
        help_text="Lifecycle status. New students start as PENDING then can be set ACTIVE/INACTIVE/GRADUATED on edit.",
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password

        return check_password(raw_password, self.password)

    def save(self, *args, **kwargs):  # centralize phone normalization + email lowercase
        if self.phone_number:
            try:
                self.phone_number = normalize_phone(self.phone_number)
            except Exception:
                pass  # serializer/clean surface explicit validation errors
        if self.email:
            self.email = (self.email or "").strip().lower()
        super().save(*args, **kwargs)


class Instructor(models.Model):
    first_name = models.CharField(max_length=50, validators=[django_validate_name])
    last_name = models.CharField(max_length=50, validators=[django_validate_name])
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, unique=True, validators=[django_validate_phone])
    hire_date = models.DateField()
    # Store multiple categories as a comma separated list (e.g. "B,BE,C").
    # Simpler than a separate M2M for current scope and easy to expose as multi-checkbox in the UI.
    license_categories = models.CharField(
        max_length=200,
        validators=[django_validate_license_categories],
        help_text="Comma separated categories: e.g. 'B,BE,C' ",
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if self.phone_number:
            try:
                self.phone_number = normalize_phone(self.phone_number)
            except Exception:
                pass  # serializer/clean surface explicit validation errors
        if self.email:
            self.email = (self.email or "").strip().lower()
        if self.license_categories:
            # Normalise: uppercase, split, strip, dedupe, validate against enum, keep order stable
            from .enums import VehicleCategory

            raw = self.license_categories
            parts = [p.strip().upper() for p in str(raw).split(",") if p.strip()]
            seen = []
            valid_set = {m.value for m in VehicleCategory}
            for p in parts:
                if p not in valid_set:
                    # Skip invalid tokens entirely (could alternatively raise ValidationError)
                    continue
                if p not in seen:
                    seen.append(p)
            self.license_categories = ",".join(seen)
        super().save(*args, **kwargs)


class InstructorAvailability(models.Model):
    instructor = models.ForeignKey(
        Instructor, on_delete=models.CASCADE, related_name="availabilities"
    )
    day = models.CharField(max_length=10, choices=DayOfWeek.choices())
    hours = models.JSONField(
        default=list,
        help_text="List of available start times in HH:MM format, e.g. ['08:00', '09:30']",
    )

    class Meta:
        unique_together = ("instructor", "day")

    def __str__(self):
        return f"{self.instructor} - {self.day}: {self.hours}"


class Resource(models.Model):
    name = models.CharField(max_length=100)
    max_capacity = models.IntegerField(help_text="2=vehicle, 30+=classroom")
    category = models.CharField(max_length=5, choices=VehicleCategory.choices())
    is_available = models.BooleanField(default=True)
    # Vehicle-specific fields (nullable for classrooms)
    license_plate = models.CharField(max_length=15, null=True, blank=True)
    make = models.CharField(max_length=50, null=True, blank=True)
    model = models.CharField(max_length=50, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)

    def __str__(self):
        if self.is_vehicle():
            return f"{self.make} {self.model} ({self.license_plate})"
        return f"{self.name} (Classroom)"

    def is_vehicle(self):
        """Check if this resource is a vehicle (capacity = 2)"""
        return self.max_capacity == 2

    def is_classroom(self):
        """Check if this resource is a classroom (capacity > 2)"""
        return self.max_capacity > 2

    @property
    def resource_type(self):
        """Return human-readable resource type"""
        if self.is_vehicle():
            return "Vehicle"
        if self.is_classroom():
            return "Classroom"
        return "Unknown"

    def save(self, *args, **kwargs):
        # Normalize license plate for consistency and to improve uniqueness checks
        if self.license_plate:
            # Uppercase and strip spaces around - keep existing hyphens/dots as-is
            cleaned = (self.license_plate or "").strip().upper()
            # Collapse inner multiple spaces to single, then remove spaces
            cleaned = " ".join(cleaned.split())
            cleaned = cleaned.replace(" ", "")
            self.license_plate = cleaned
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            # Enforce case-insensitive uniqueness for vehicles (capacity <= 2; covers 1 or 2 seats)
            models.UniqueConstraint(
                Lower("license_plate"),
                condition=Q(max_capacity__lte=2, license_plate__isnull=False),
                name="unique_vehicle_license_plate_ci",
            )
        ]


class Vehicle(models.Model):
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    license_plate = models.CharField(max_length=15, unique=True)
    year = models.IntegerField()
    category = models.CharField(max_length=5, choices=VehicleCategory.choices())
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"


class Course(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=5, choices=VehicleCategory.choices())
    type = models.CharField(
        max_length=10, choices=CourseType.choices(), default=CourseType.THEORY.value
    )
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    required_lessons = models.IntegerField()

    def __str__(self):
        return self.name


class ScheduledClassPattern(models.Model):
    name = models.CharField(max_length=100, help_text="e.g., 'Theory Mondays/Wednesdays'")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="scheduled_class_patterns")
    instructor = models.ForeignKey(
        Instructor, on_delete=models.CASCADE, related_name="scheduled_class_patterns"
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="scheduled_class_patterns"
    )
    students = models.ManyToManyField(Student, related_name="scheduled_class_patterns", blank=True)
    recurrence_days = models.JSONField(
        default=list,
        help_text="List of days: e.g. ['MONDAY', 'WEDNESDAY']",
    )
    times = models.JSONField(
        default=list,
        help_text="List of start times: e.g. ['10:00', '11:00']",
    )
    start_date = models.DateField(help_text="Start date for the recurrence")
    num_lessons = models.IntegerField(help_text="Total number of lessons to generate")
    duration_minutes = models.IntegerField(default=60)
    max_students = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices(),
        default=LessonStatus.SCHEDULED.value,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.course.name}"

    def generate_scheduled_classes(self):
        """Generate ScheduledClass instances based on recurrence."""
        from datetime import datetime, timedelta, date
        classes = []
        current_date = self.start_date
        if isinstance(current_date, str):
            current_date = date.fromisoformat(current_date)
        count = 0
        day_map = {
            'MONDAY': 0,
            'TUESDAY': 1,
            'WEDNESDAY': 2,
            'THURSDAY': 3,
            'FRIDAY': 4,
            'SATURDAY': 5,
            'SUNDAY': 6,
        }
        recurrence_day_indices = [day_map[day] for day in self.recurrence_days if day in day_map]

        while count < self.num_lessons:
            if current_date.weekday() in recurrence_day_indices:
                for time_obj in self.times:
                    if count >= self.num_lessons:
                        break
                    if isinstance(time_obj, str):
                        from datetime import time
                        time_obj = time.fromisoformat(time_obj)
                    scheduled_time = datetime.combine(current_date, time_obj)
                    # Create ScheduledClass
                    scheduled_class = ScheduledClass(
                        pattern=self,
                        name=f"{self.name} - {current_date.strftime('%Y-%m-%d')} {time_obj.strftime('%H:%M')}",
                        scheduled_time=scheduled_time,
                        duration_minutes=self.duration_minutes,
                        max_students=self.max_students,
                        status=self.status,
                    )
                    classes.append(scheduled_class)
                    count += 1
            current_date += timedelta(days=1)
        return classes

    class Meta:
        ordering = ["-created_at"]


class ScheduledClass(models.Model):
    pattern = models.ForeignKey(
        ScheduledClassPattern, on_delete=models.CASCADE, related_name="scheduled_classes", null=True, blank=True
    )
    name = models.CharField(max_length=100, help_text="e.g., 'Monday Theory Class'")
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_students = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices(),
        default=LessonStatus.SCHEDULED.value,
    )

    def __str__(self):
        pattern_name = self.pattern.name if self.pattern else "No Pattern"
        return f"{self.name} - {pattern_name}"

    def current_enrollment(self):
        """Return current number of enrolled students from pattern"""
        if self.pattern:
            return self.pattern.students.count()
        return 0

    def available_spots(self):
        """Return number of available spots"""
        return max(0, self.max_students - self.current_enrollment())

    def is_full(self):
        """Check if class is at capacity"""
        return self.current_enrollment() >= self.max_students

    class Meta:
        ordering = ["scheduled_time"]


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrollment_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(
        max_length=10,
        choices=CourseType.choices(),
        default=CourseType.THEORY.value,
        help_text="Copied from course for quick filtering; can be overridden if both.",
    )
    status = models.CharField(
        max_length=20,
        choices=EnrollmentStatus.choices(),
        default=EnrollmentStatus.IN_PROGRESS.value,
    )

    class Meta:
        unique_together = ()

    def __str__(self):
        return f"{self.student} înscris la {self.course}"


class Lesson(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="lessons")
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name="lessons")
    resource = models.ForeignKey(
        Resource, on_delete=models.SET_NULL, null=True, blank=True, related_name="lessons"
    )
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices(),
        default=LessonStatus.SCHEDULED.value,
    )
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-scheduled_time"]

    def __str__(self):
        return f"Lecție pentru {self.enrollment.student} ({self.enrollment.course})"


class Payment(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices())
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices(), default=PaymentStatus.PENDING.value
    )
    description = models.CharField(max_length=255)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Plată de {self.amount} MDL pentru {self.enrollment}"
