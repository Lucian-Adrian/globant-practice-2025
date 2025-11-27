from django.contrib.auth.hashers import make_password
from django.core.validators import EmailValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from solo.models import SingletonModel

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
    category = models.CharField(max_length=5, choices=VehicleCategory.choices(), null=True, blank=True)
    is_available = models.BooleanField(default=True)
    # Vehicle-specific fields (nullable for classrooms)
    license_plate = models.CharField(max_length=15, null=True, blank=True)
    make = models.CharField(max_length=50, null=True, blank=True)
    model = models.CharField(max_length=50, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    
    RESOURCE_TYPES = [
        ("VEHICLE", "Vehicle"),
        ("CLASSROOM", "Classroom"),
    ]
    type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default="VEHICLE")

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
        return self.get_type_display()

    def save(self, *args, **kwargs):
        # Auto-set type based on capacity if not set
        if self.max_capacity == 2:
            self.type = "VEHICLE"
        elif self.max_capacity > 2:
            self.type = "CLASSROOM"
            
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
    # Default values for generated classes
    default_duration_minutes = models.IntegerField(default=60, help_text="Default duration for generated classes")
    default_max_students = models.IntegerField(default=10, help_text="Default max students for generated classes")
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        from datetime import date
        if not self.recurrence_days:
            raise ValidationError("Recurrence days cannot be empty.")
        if not self.times:
            raise ValidationError("Times cannot be empty.")
        if self.start_date < date.today():
            raise ValidationError("Start date cannot be in the past.")
        # Check for valid day names
        valid_days = {'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'}
        if not all(day in valid_days for day in self.recurrence_days):
            raise ValidationError("Invalid recurrence days.")
        
        # Validate max students vs resource capacity
        if self.resource and self.default_max_students > self.resource.max_capacity:
            raise ValidationError(f"Default max students ({self.default_max_students}) cannot exceed resource capacity ({self.resource.max_capacity}).")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def validate_generation(self):
        """Validate before generating classes to prevent overlaps."""
        from django.core.exceptions import ValidationError
        from django.db.models import Q, F, ExpressionWrapper, DateTimeField
        from datetime import timedelta
        classes = self.generate_scheduled_classes()
        for cls in classes:
            cls_end = cls.scheduled_time + timedelta(minutes=cls.duration_minutes)
            
            # Check overlap with existing classes
            # Overlap condition: (StartA < EndB) and (EndA > StartB)
            # A = cls (new), B = existing
            
            # Simplified overlap check to avoid DB-specific issues with duration calculation
            # Fetch potential conflicts in a wide window
            # Assume max class duration is 4 hours for safety
            window_start = cls.scheduled_time - timedelta(hours=4)
            window_end = cls_end
            
            potential_conflicts = ScheduledClass.objects.filter(
                scheduled_time__gte=window_start,
                scheduled_time__lt=window_end
            )
            
            if self.pk:
                potential_conflicts = potential_conflicts.filter(Q(pattern__isnull=True) | ~Q(pattern=self))
            
            # Check in Python
            for conflict in potential_conflicts:
                conflict_end = conflict.scheduled_time + timedelta(minutes=conflict.duration_minutes)
                
                # Overlap: StartA < EndB and EndA > StartB
                if cls.scheduled_time < conflict_end and cls_end > conflict.scheduled_time:
                    if conflict.instructor == self.instructor:
                        raise ValidationError("Overlap detected for instructor at %(time)s." % {'time': cls.scheduled_time})
                    if conflict.resource == self.resource:
                        raise ValidationError("Overlap detected for resource at %(time)s." % {'time': cls.scheduled_time})
            


    def delete(self, *args, **kwargs):
        # Delete all generated classes before deleting the pattern
        self.scheduled_classes.all().delete()
        super().delete(*args, **kwargs)

    def generate_scheduled_classes(self):
        """Generate ScheduledClass instances based on recurrence."""
        import time as time_module
        import logging
        from datetime import datetime, timedelta, date, time
        from django.utils import timezone
        from django.conf import settings

        logger = logging.getLogger(__name__)
        start_time = time_module.time()
        
        # Validate that pattern has required data
        if not self.recurrence_days or not self.times:
            error_msg = f"Pattern '{self.name}' cannot generate classes: missing recurrence_days or times"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        if settings.DEBUG:
            logger.info(f"Starting class generation for pattern '{self.name}' (ID: {self.id})")
            logger.info(f"Pattern config: days={self.recurrence_days}, times={self.times}, num_lessons={self.num_lessons}")

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
        recurrence_day_indices = set(day_map[day] for day in self.recurrence_days if day in day_map)
        
        # Pre-calculate time objects
        time_objs = []
        for time_str in self.times:
            if isinstance(time_str, str):
                # Handle H:MM format by padding with zero
                if len(time_str) == 4 and time_str[1] == ':':
                    time_str = f"0{time_str}"
                try:
                    time_objs.append(time.fromisoformat(time_str))
                except ValueError:
                    # Fallback for other formats if needed
                    try:
                        t = datetime.strptime(time_str, "%H:%M").time()
                        time_objs.append(t)
                    except ValueError:
                        raise ValueError(f"Invalid time format: {time_str}")
            else:
                time_objs.append(time_str)

        iteration_count = 0
        max_iterations = self.num_lessons * 10  # Safety limit to prevent infinite loops
        
        while count < self.num_lessons and iteration_count < max_iterations:
            iteration_count += 1
            if current_date.weekday() in recurrence_day_indices:
                for time_obj in time_objs:
                    if count >= self.num_lessons:
                        break
                    naive_dt = datetime.combine(current_date, time_obj)
                    scheduled_time = timezone.make_aware(naive_dt)
                    # Create ScheduledClass with default values from pattern
                    scheduled_class = ScheduledClass(
                        pattern=self,
                        course=self.course,
                        instructor=self.instructor,
                        resource=self.resource,
                        name=f"{self.name} - {current_date.strftime('%Y-%m-%d')} {time_obj.strftime('%H:%M')}",
                        scheduled_time=scheduled_time,
                        duration_minutes=self.default_duration_minutes,
                        max_students=self.default_max_students,
                        status=LessonStatus.SCHEDULED.value,  # Default status for generated classes
                    )
                    classes.append(scheduled_class)
                    count += 1
            current_date += timedelta(days=1)
        
        generation_time = time_module.time() - start_time
        
        if settings.DEBUG:
            logger.info(f"Class generation completed for pattern '{self.name}' in {generation_time:.3f}s")
            logger.info(f"Generated {len(classes)} classes, iterated through {iteration_count} days")
            if iteration_count >= max_iterations:
                logger.warning(f"Pattern '{self.name}' hit iteration limit ({max_iterations}) - possible infinite loop")
        
        return classes

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['start_date']),
            models.Index(fields=['course']),
            models.Index(fields=['instructor']),
            models.Index(fields=['resource']),
            models.Index(fields=['start_date', 'course']),  # Composite index for common queries
        ]


class ScheduledClass(models.Model):
    pattern = models.ForeignKey(
        ScheduledClassPattern, on_delete=models.CASCADE, related_name="scheduled_classes", null=True, blank=True
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="scheduled_classes", null=True, blank=True
    )
    instructor = models.ForeignKey(
        Instructor, on_delete=models.CASCADE, related_name="scheduled_classes", null=True, blank=True
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="scheduled_classes", null=True, blank=True
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
    students = models.ManyToManyField(Student, related_name="scheduled_classes", blank=True)

    def __str__(self):
        pattern_name = self.pattern.name if self.pattern else "No Pattern"
        return f"{self.name} - {pattern_name}"

    def current_enrollment(self):
        """Return current number of enrolled students"""
        return self.students.count()

    def available_spots(self):
        """Return number of available spots"""
        return max(0, self.max_students - self.current_enrollment())

    def is_full(self):
        """Check if class is at capacity"""
        return self.current_enrollment() >= self.max_students

    def clean(self):
        from django.core.exceptions import ValidationError
        # Validate max students vs resource capacity
        if self.resource and self.max_students > self.resource.max_capacity:
            raise ValidationError(f"Max students ({self.max_students}) cannot exceed resource capacity ({self.resource.max_capacity}).")
        
        # Validate theory only
        if self.course and self.course.type != CourseType.THEORY.value:
             raise ValidationError("Only theory courses are allowed for scheduled classes.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["scheduled_time"]
        indexes = [
            models.Index(fields=['pattern']),
            models.Index(fields=['scheduled_time']),
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_time', 'status']),  # Composite index for time range + status queries
        ]


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


class Address(models.Model):
    """Simple address model for school locations."""
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.street}, {self.city}"


class SchoolConfig(SingletonModel):
    """Singleton model for school-wide configuration settings."""
    school_name = models.CharField(max_length=200, default="Driving School")
    school_logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    business_hours = models.CharField(max_length=200, default="Mon-Fri: 9AM-6PM")
    email = models.EmailField(default="contact@school.com")
    contact_phone1 = models.CharField(max_length=20, default="+37360000000")
    contact_phone2 = models.CharField(max_length=20, null=True, blank=True)
    landing_image = models.ImageField(upload_to="landing/", null=True, blank=True)
    landing_text = models.JSONField(
        default=dict,
        help_text="Translation dictionary for landing page text, e.g., {'en': 'Welcome', 'ro': 'Bun venit'}"
    )
    social_links = models.JSONField(
        default=dict,
        help_text="Social media links, e.g., {'facebook': 'https://...', 'instagram': 'https://...'}"
    )
    rules = models.JSONField(
        default=dict,
        help_text="Business rules, e.g., {'min_theory_hours_before_practice': 20}"
    )
    available_categories = models.JSONField(
        default=list,
        help_text="Available license categories, e.g., ['A', 'B', 'C']"
    )
    addresses = models.ManyToManyField(Address, related_name="school_configs", blank=True)

    class Meta:
        verbose_name = "School Configuration"

    def __str__(self):
        return self.school_name
