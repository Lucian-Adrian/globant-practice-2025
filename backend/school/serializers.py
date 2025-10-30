from rest_framework import serializers

from .enums import CourseType
from .validators import validate_name, normalize_phone
from django.utils.translation import gettext as _
from datetime import timedelta
from django.conf import settings
try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except Exception:  # pragma: no cover
    ZoneInfo = None  # type: ignore
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment
from datetime import date
from typing import Optional
import re


# Constants for age/date constraints
MIN_STUDENT_AGE_YEARS = 15
MAX_AGE_YEARS = 125

# Instructors: keep a flag for future dates (not used yet; future dates are allowed for now)
ALLOW_FUTURE_HIRE_DATE = False


def years_ago(years: int, from_date: Optional[date] = None) -> date:
    """Return a date representing (from_date - years). Handles leap years (Feb 29 -> Feb 28)."""
    base = from_date or date.today()
    try:
        return base.replace(year=base.year - years)
    except ValueError:
        # Handle Feb 29 -> Feb 28
        return base.replace(month=2, day=28, year=base.year - years)


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "email", "phone_number", "date_of_birth", "enrollment_date", "status"]

    def validate_phone_number(self, value: str) -> str:
        v = (value or '').strip()
        if not re.match(r"^\+373\d+$", v):
            raise serializers.ValidationError("Phone number must start with +373 and contain only digits.")
        return v

    def validate_date_of_birth(self, value: date) -> date:
        if not value:
            return value
        today = date.today()
        lower_bound = years_ago(MAX_AGE_YEARS, today)  # not older than 125 years
        upper_bound = years_ago(MIN_STUDENT_AGE_YEARS, today)  # at least 15 years old
        if value < lower_bound:
            raise serializers.ValidationError("Date of birth cannot be more than 125 years ago.")
        if value > upper_bound:
            raise serializers.ValidationError("Must be at least 15 years old.")
        return value


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ["id", "first_name", "last_name", "email", "phone_number", "hire_date", "license_categories"]

    def validate_phone_number(self, value: str) -> str:
        v = (value or '').strip()
        if not re.match(r"^\+373\d+$", v):
            raise serializers.ValidationError("Phone number must start with +373 and contain only digits.")
        return v

    def validate_hire_date(self, value: date) -> date:
        if not value:
            return value
        today = date.today()
        oldest_allowed = years_ago(MAX_AGE_YEARS, today)
        # Future dates are allowed for now (do not restrict > today)
        if value < oldest_allowed:
            raise serializers.ValidationError("Hire date cannot be more than 125 years ago.")
        return value


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["id", "make", "model", "license_plate", "year", "category", "is_available"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "category", "description", "price", "required_lessons"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), source="student", write_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source="course", write_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "student_id", "course_id", "enrollment_date", "status"]


class LessonSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    enrollment = EnrollmentSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(queryset=Instructor.objects.all(), source="instructor", write_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source="enrollment", write_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", "enrollment", "instructor", "enrollment_id", "instructor_id", "vehicle", "scheduled_time",
            "duration_minutes", "status", "notes"
        ]

    def validate(self, attrs):  # noqa: D401
        """Apply server-side booking rules: conflicts, availability, and category/license.
        Rules mirror admin pre-submit checks and student portal expectations.
        """
        instance = getattr(self, 'instance', None)
        enrollment = attrs.get('enrollment') or (instance.enrollment if instance else None)
        instructor = attrs.get('instructor') or (instance.instructor if instance else None)
        vehicle = attrs.get('vehicle') if 'vehicle' in attrs else (instance.vehicle if instance else None)
        start = attrs.get('scheduled_time') or (instance.scheduled_time if instance else None)
        duration = attrs.get('duration_minutes') or (instance.duration_minutes if instance else 90)
        status = attrs.get('status') or (instance.status if instance else 'SCHEDULED')

        # Required minimal fields
        errors: dict[str, list[str]] = {}
        if not enrollment:
            errors['enrollment_id'] = [_('validation.requiredField')]
        if not instructor:
            errors['instructor_id'] = [_('validation.requiredField')]
        if not start:
            errors['scheduled_time'] = [_('validation.requiredField')]
        if errors:
            raise serializers.ValidationError(errors)

        # If any critical is missing, skip deeper validation (already raised required field errors above)
        if not (enrollment and instructor and start):
            return attrs

        # Compute end time
        end = start + timedelta(minutes=int(duration or 90))

        # Consider only statuses in SCHEDULED/COMPLETED when checking overlaps
        ACTIVE_STATUSES = ['SCHEDULED', 'COMPLETED']

        # Ignore self on update
        exclude_ids = []
        if instance and instance.pk:
            exclude_ids = [instance.pk]

        # Helper: fetch potential overlaps in a time window, then verify accurately in Python
        def has_overlap(qs):
            for other in qs:
                if other.pk in exclude_ids:
                    continue
                other_end = other.scheduled_time + timedelta(minutes=int(other.duration_minutes or 60))
                if (start < other_end) and (other.scheduled_time < end):  # adjacency allowed
                    return True
            return False

        # Instructor conflicts
        from .models import Lesson as LessonModel
        instr_id = getattr(instructor, 'id', None)
        instr_qs = LessonModel.objects.filter(
            instructor_id=instr_id,
            status__in=ACTIVE_STATUSES,
            scheduled_time__lt=end,
            scheduled_time__gte=start - timedelta(hours=8),
        )
        if has_overlap(instr_qs):
            raise serializers.ValidationError({'instructor_id': [_('validation.instructorConflict')]})

        # Student conflicts (via enrollment.student)
        student_id = getattr(enrollment, 'student_id', None)
        if student_id:
            student_qs = LessonModel.objects.filter(
                enrollment__student_id=student_id,
                status__in=ACTIVE_STATUSES,
                scheduled_time__lt=end,
                scheduled_time__gte=start - timedelta(hours=8),
            )
            if has_overlap(student_qs):
                raise serializers.ValidationError({'enrollment_id': [_('validation.studentConflict')]})

        # Vehicle conflicts (if a vehicle is set)
        veh_id = getattr(vehicle, 'id', None) if vehicle else None
        if veh_id:
            veh_qs = LessonModel.objects.filter(
                vehicle_id=veh_id,
                status__in=ACTIVE_STATUSES,
                scheduled_time__lt=end,
                scheduled_time__gte=start - timedelta(hours=8),
            )
            if has_overlap(veh_qs):
                raise serializers.ValidationError({'vehicle_id': [_('validation.vehicleConflict')]})

        # Enforce vehicle availability for scheduled lessons
        if (status == 'SCHEDULED') and vehicle is not None:
            try:
                if getattr(vehicle, 'is_available', True) is False:
                    raise serializers.ValidationError({'vehicle_id': [_('validation.vehicleUnavailable')]})
            except AttributeError:
                # If vehicle object doesn't expose is_available for any reason, skip this check gracefully
                pass

        # Availability check for the instructor in business-local time with interval acceptance
        # Convert start to business-local timezone before computing day/hour
        biz_tz_name = getattr(settings, 'BUSINESS_TZ', 'Europe/Chisinau')
        try:
            biz_tz = ZoneInfo(biz_tz_name) if ZoneInfo else None
        except Exception:
            biz_tz = None
        local_start = start.astimezone(biz_tz) if (biz_tz and start.tzinfo) else start

        WEEKDAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
        day_enum = WEEKDAYS[(local_start.weekday())]  # Monday=0

        # Fetch availability slots and build intervals [t[i], t[i+1]) in minutes since midnight
        avail = InstructorAvailability.objects.filter(instructor_id=instr_id, day=day_enum)
        slots: set[str] = set()
        for a in avail:
            try:
                for h in list(a.hours or []):
                    if isinstance(h, str):
                        # normalize HH:MM padding
                        parts = h.split(':')
                        hh = parts[0].zfill(2) if parts else '00'
                        mm = parts[1].zfill(2) if len(parts) > 1 else '00'
                        slots.add(f"{hh}:{mm}")
            except Exception:
                pass
        if not slots:
            raise serializers.ValidationError({'scheduled_time': [_('validation.outsideAvailability')]})

        def to_minutes(hhmm: str) -> int:
            # Validate format: must contain colon and both parts must be numeric
            if not isinstance(hhmm, str) or ':' not in hhmm:
                raise serializers.ValidationError({'scheduled_time': [_('validation.invalidTimeFormat')]})
            parts = hhmm.split(':')
            if len(parts) != 2:
                raise serializers.ValidationError({'scheduled_time': [_('validation.invalidTimeFormat')]})
            hh, mm = parts
            try:
                hh_int = int(hh)
                mm_int = int(mm)
            except ValueError:
                raise serializers.ValidationError({'scheduled_time': [_('validation.invalidTimeFormat')]})
            if not (0 <= hh_int <= 23 and 0 <= mm_int <= 59):
                raise serializers.ValidationError({'scheduled_time': [_('validation.invalidTimeFormat')]})
            return hh_int * 60 + mm_int

        slot_list = sorted(slots)
        slot_mins = [to_minutes(s) for s in slot_list]
        start_mins = local_start.hour * 60 + local_start.minute

        ok = False
        # Accept exact last listed time
        if start_mins == slot_mins[-1]:
            ok = True
        else:
            # Accept any start within [slot[i], slot[i+1])
            for i in range(len(slot_mins) - 1):
                if slot_mins[i] <= start_mins < slot_mins[i + 1]:
                    ok = True
                    break
        if not ok:
            raise serializers.ValidationError({'scheduled_time': [_('validation.outsideAvailability')]})

        # Category & license checks
        course = getattr(enrollment, 'course', None)
        course_category = getattr(course, 'category', None)
        if vehicle and course_category:
            if vehicle.category != course_category:
                raise serializers.ValidationError({'vehicle_id': [_('validation.categoryMismatch')]})
        if course_category:
            lic_raw = getattr(instructor, 'license_categories', '') or ''
            cats = [c.strip().upper() for c in str(lic_raw).split(',') if c.strip()]
            if str(course_category).upper() not in cats:
                raise serializers.ValidationError({'instructor_id': [_('validation.instructorLicenseMismatch')]})

        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer(read_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source="enrollment", write_only=True)

    class Meta:
        model = Payment
        fields = ["id", "enrollment", "enrollment_id", "amount", "payment_date", "payment_method", "description", "status"]
