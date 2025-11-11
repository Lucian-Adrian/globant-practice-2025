from datetime import timedelta

from django.conf import settings
from django.utils.translation import gettext as _
from rest_framework import serializers

from .models import (
    Course,
    Enrollment,
    Instructor,
    InstructorAvailability,
    Lesson,
    Payment,
    Resource,
    ScheduledClass,
    Student,
    Vehicle,
)
from .validators import validate_name, validate_phone, validate_license_categories
from .validators import canonicalize_license_categories

try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except Exception:  # pragma: no cover
    ZoneInfo = None  # type: ignore


class StudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "date_of_birth",
            "enrollment_date",
            "status",
            "password",
        ]
        extra_kwargs = {
            "first_name": {
                "error_messages": {
                    "required": "First name is required",
                    "blank": "First name is required",
                }
            },
            "last_name": {
                "error_messages": {
                    "required": "Last name is required",
                    "blank": "Last name is required",
                }
            },
            "email": {
                "error_messages": {
                    "required": "Email is required",
                    "blank": "Email is required",
                    "invalid": "Invalid email format",
                }
            },
            "phone_number": {
                "error_messages": {
                    "required": "Phone number is required",
                    "blank": "Phone number is required",
                }
            },
            "date_of_birth": {
                "error_messages": {
                    "required": "Date of birth is required",
                    "invalid": "Invalid date format",
                }
            },
            "password": {
                "error_messages": {
                    "required": "Password is required",
                    "blank": "Password is required",
                    "min_length": "Password must be at least 6 characters",
                }
            },
            # Status defaults to PENDING for new signups; not required on public portal.
            "status": {"required": False},
        }

    def validate_first_name(self, value: str) -> str:
        try:
            return validate_name(value, "First name")
        except ValueError as e:
            raise serializers.ValidationError(str(e))

    def validate_last_name(self, value: str) -> str:
        try:
            return validate_name(value, "Last name")
        except ValueError as e:
            raise serializers.ValidationError(str(e))

    def validate_phone_number(self, value: str) -> str:
        try:
            value = validate_phone(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        # Soft uniqueness check (also enforced by DB unique constraint)
        qs = Student.objects.filter(phone_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Phone number already registered")
        return value

    def validate_email(self, value: str) -> str:
        qs = Student.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate(self, attrs):
        # Cross-field / business validations
        dob = attrs.get("date_of_birth") or (self.instance.date_of_birth if self.instance else None)
        if dob:
            from datetime import date

            today = date.today()
            if dob > today:
                raise serializers.ValidationError(
                    {"date_of_birth": ["Date of birth cannot be in the future"]}
                )
            # Minimum age 15 years
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 15:
                raise serializers.ValidationError(
                    {"date_of_birth": ["Student must be at least 15 years old"]}
                )
        return super().validate(attrs)

    def create(self, validated_data):
        from django.db import IntegrityError, transaction

        # Hash the password before creating
        password = validated_data.pop("password")
        try:
            with transaction.atomic():
                student = super().create(validated_data)
                if password.startswith(("pbkdf2_", "argon2$", "bcrypt$", "bcrypt_sha256$")):
                    student.password = password  # keep provided Django-style hash
                else:
                    student.set_password(password)  # hash plain text

                student.save()
                return student
        except IntegrityError as e:  # race condition uniqueness fallback
            msg = str(e).lower()
            errors: dict[str, list[str]] = {}
            if "email" in msg:
                errors.setdefault("email", ["Email already registered"])
            if "phone" in msg or "phone_number" in msg:
                errors.setdefault("phone_number", ["Phone number already registered"])
            if not errors:
                errors["non_field_errors"] = ["Unexpected integrity error"]
            raise serializers.ValidationError(errors)

    def update(self, instance, validated_data):
        from django.db import IntegrityError, transaction

        try:
            with transaction.atomic():
                return super().update(instance, validated_data)
        except IntegrityError as e:
            msg = str(e).lower()
            errors: dict[str, list[str]] = {}
            if "email" in msg:
                errors.setdefault("email", ["Email already registered"])
            if "phone" in msg or "phone_number" in msg:
                errors.setdefault("phone_number", ["Phone number already registered"])
            if not errors:
                errors["non_field_errors"] = ["Unexpected integrity error"]
            raise serializers.ValidationError(errors)


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "hire_date",
            "license_categories",
        ]
        extra_kwargs = {
            "first_name": {
                "error_messages": {
                    "required": "First name is required",
                    "blank": "First name is required",
                }
            },
            "last_name": {
                "error_messages": {
                    "required": "Last name is required",
                    "blank": "Last name is required",
                }
            },
            "email": {
                "error_messages": {
                    "required": "Email is required",
                    "blank": "Email is required",
                    "invalid": "Invalid email format",
                }
            },
            "phone_number": {
                "error_messages": {
                    "required": "Phone number is required",
                    "blank": "Phone number is required",
                }
            },
        }

    def validate_first_name(self, value: str) -> str:
        try:
            return validate_name(value, "First name")
        except ValueError as e:
            raise serializers.ValidationError(str(e))

    def validate_last_name(self, value: str) -> str:
        try:
            return validate_name(value, "Last name")
        except ValueError as e:
            raise serializers.ValidationError(str(e))

    def validate_phone_number(self, value: str) -> str:
        try:
            value = validate_phone(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        qs = Instructor.objects.filter(phone_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Phone number already registered")
        return value

    def validate_email(self, value: str) -> str:
        qs = Instructor.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate_license_categories(self, value: str) -> str:
        try:
            return validate_license_categories(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e))

    def validate_license_categories(self, value: str) -> str:
        try:
            return canonicalize_license_categories(value)
        except ValueError as e:
            raise serializers.ValidationError(str(e))


class InstructorAvailabilitySerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.all(), source="instructor", write_only=True
    )

    class Meta:
        model = InstructorAvailability
        fields = ["id", "instructor", "instructor_id", "day", "hours"]


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["id", "make", "model", "license_plate", "year", "category", "is_available"]


class ResourceSerializer(serializers.ModelSerializer):
    resource_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id",
            "name",
            "max_capacity",
            "category",
            "is_available",
            "license_plate",
            "make",
            "model",
            "year",
            "resource_type",
        ]

    def get_resource_type(self, obj):
        return obj.resource_type

    def validate_license_plate(self, value: str) -> str:
        # Normalize value similar to model save()
        if value is None:
            return value
        cleaned = (value or "").strip().upper()
        cleaned = " ".join(cleaned.split())
        cleaned = cleaned.replace(" ", "")
        # Only enforce for vehicle-type resources (capacity == 2)
        # We need the max_capacity either from incoming attrs on create/update or existing instance
        max_cap = None
        try:
            max_cap = int(self.initial_data.get("max_capacity")) if self.initial_data else None
        except Exception:
            max_cap = None
        if max_cap is None and getattr(self, "instance", None) is not None:
            max_cap = getattr(self.instance, "max_capacity", None)
        # Treat capacity <= 2 as vehicle (covers 1-seat edge case)
        if (max_cap is not None and max_cap <= 2) and cleaned:
            qs = Resource.objects.filter(max_capacity__lte=2)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            # Case-insensitive compare
            if qs.filter(license_plate__iexact=cleaned).exists():
                raise serializers.ValidationError("License plate already exists")
        return cleaned


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "category", "type", "description", "price", "required_lessons"]
        extra_kwargs = {
            "type": {
                "required": False,
                "allow_blank": True,
            },  # Allow type to be omitted or blank, will use model default
        }


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source="student"
    )
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source="course")
    label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "course",
            "student_id",
            "course_id",
            "enrollment_date",
            "type",
            "status",
            "label",
        ]
        extra_kwargs = {
            "type": {
                "required": False,
                "allow_blank": True,
            },  # Allow type to be omitted or blank, will copy from course
            "status": {
                "required": False,
                "allow_blank": True,
            },  # Allow status to be omitted or blank, will use model default
        }

    def get_label(self, obj):  # Name - Type - Category
        return f"{obj.student.first_name} {obj.student.last_name} - {obj.type or obj.course.type} - {obj.course.category}"

    def create(self, validated_data):
        # If type not provided, copy from course
        if "type" not in validated_data:
            course = validated_data["course"]
            validated_data["type"] = course.type
        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    enrollment = EnrollmentSerializer(read_only=True)
    resource = ResourceSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.all(), source="instructor"
    )
    enrollment_id = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment.objects.all(), source="enrollment"
    )
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source="resource", required=False, allow_null=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "enrollment",
            "instructor",
            "resource",
            "enrollment_id",
            "instructor_id",
            "resource_id",
            "scheduled_time",
            "duration_minutes",
            "status",
            "notes",
        ]

    def validate(self, attrs):
        """Apply server-side booking rules: conflicts, availability, and category/license.
        Rules mirror admin pre-submit checks and student portal expectations.
        """
        instance = getattr(self, "instance", None)
        enrollment = attrs.get("enrollment") or (instance.enrollment if instance else None)
        instructor = attrs.get("instructor") or (instance.instructor if instance else None)
        resource = (
            attrs.get("resource")
            if "resource" in attrs
            else (instance.resource if instance else None)
        )
        start = attrs.get("scheduled_time") or (instance.scheduled_time if instance else None)
        duration = attrs.get("duration_minutes") or (instance.duration_minutes if instance else 90)
        status = attrs.get("status") or (instance.status if instance else "SCHEDULED")

        # Required minimal fields
        errors: dict[str, list[str]] = {}
        if not enrollment:
            errors["enrollment_id"] = [_("validation.requiredField")]
        if not instructor:
            errors["instructor_id"] = [_("validation.requiredField")]
        if not start:
            errors["scheduled_time"] = [_("validation.requiredField")]
        if errors:
            raise serializers.ValidationError(errors)

        # If any critical is missing, skip deeper validation (already raised required field errors above)
        if not (enrollment and instructor and start):
            return attrs

        # Enforce: Lessons must use a vehicle-type resource (capacity == 2)
        if resource is not None:
            cap = getattr(resource, "max_capacity", None)
            if cap is not None and cap != 2:
                raise serializers.ValidationError(
                    {"resource_id": [_("validation.vehicleResourceRequired")]}
                )

        # Compute end time
        end = start + timedelta(minutes=int(duration or 90))

        # Consider only statuses in SCHEDULED/COMPLETED when checking overlaps
        ACTIVE_STATUSES = ["SCHEDULED", "COMPLETED"]

        # Ignore self on update
        exclude_ids = []
        if instance and instance.pk:
            exclude_ids = [instance.pk]

        # Helper: fetch potential overlaps in a time window, then verify accurately in Python
        def has_overlap(qs):
            for other in qs:
                if other.pk in exclude_ids:
                    continue
                other_end = other.scheduled_time + timedelta(
                    minutes=int(other.duration_minutes or 60)
                )
                if (start < other_end) and (other.scheduled_time < end):  # adjacency allowed
                    return True
            return False

        # Instructor conflicts
        from .models import Lesson as LessonModel

        instr_id = getattr(instructor, "id", None)
        instr_qs = LessonModel.objects.filter(
            instructor_id=instr_id,
            status__in=ACTIVE_STATUSES,
            scheduled_time__lt=end,
            scheduled_time__gte=start - timedelta(hours=8),
        )
        if has_overlap(instr_qs):
            raise serializers.ValidationError(
                {"instructor_id": [_("validation.instructorConflict")]}
            )

        # Student conflicts (via enrollment.student)
        student_id = getattr(enrollment, "student_id", None)
        if student_id:
            student_qs = LessonModel.objects.filter(
                enrollment__student_id=student_id,
                status__in=ACTIVE_STATUSES,
                scheduled_time__lt=end,
                scheduled_time__gte=start - timedelta(hours=8),
            )
            if has_overlap(student_qs):
                raise serializers.ValidationError(
                    {"enrollment_id": [_("validation.studentConflict")]}
                )

        # Resource conflicts (if a resource is set)
        res_id = getattr(resource, "id", None) if resource else None
        if res_id:
            res_qs = LessonModel.objects.filter(
                resource_id=res_id,
                status__in=ACTIVE_STATUSES,
                scheduled_time__lt=end,
                scheduled_time__gte=start - timedelta(hours=8),
            )
            if has_overlap(res_qs):
                raise serializers.ValidationError(
                    {"resource_id": [_("validation.resourceConflict")]}
                )

        # Enforce resource availability for scheduled lessons
        if (status == "SCHEDULED") and resource is not None:
            try:
                if getattr(resource, "is_available", True) is False:
                    raise serializers.ValidationError(
                        {"resource_id": [_("validation.resourceUnavailable")]}
                    )
            except AttributeError:
                # If resource object doesn't expose is_available for any reason, skip this check gracefully
                pass

        # Availability check for the instructor in business-local time with interval acceptance
        # Convert start to business-local timezone before computing day/hour
        biz_tz_name = getattr(settings, "BUSINESS_TZ", "Europe/Chisinau")
        try:
            biz_tz = ZoneInfo(biz_tz_name) if ZoneInfo else None
        except Exception:
            biz_tz = None
        local_start = start.astimezone(biz_tz) if (biz_tz and start.tzinfo) else start

        WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
        day_enum = WEEKDAYS[(local_start.weekday())]  # Monday=0

        # Fetch availability slots and build intervals [t[i], t[i+1]) in minutes since midnight
        avail = InstructorAvailability.objects.filter(instructor_id=instr_id, day=day_enum)
        slots: set[str] = set()
        for a in avail:
            try:
                for h in list(a.hours or []):
                    if isinstance(h, str):
                        # normalize HH:MM padding
                        parts = h.split(":")
                        hh = parts[0].zfill(2) if parts else "00"
                        mm = parts[1].zfill(2) if len(parts) > 1 else "00"
                        slots.add(f"{hh}:{mm}")
            except Exception:
                # Skip malformed/corrupted availability records; validation below ensures at least one valid slot exists
                pass
        if not slots:
            raise serializers.ValidationError(
                {"scheduled_time": [_("validation.outsideAvailability")]}
            )

        def to_minutes(hhmm: str) -> int:
            # Validate format: must contain colon and both parts must be numeric
            if not isinstance(hhmm, str) or ":" not in hhmm:
                raise serializers.ValidationError(
                    {"scheduled_time": [_("validation.invalidTimeFormat")]}
                )
            parts = hhmm.split(":")
            if len(parts) != 2:
                raise serializers.ValidationError(
                    {"scheduled_time": [_("validation.invalidTimeFormat")]}
                )
            hh, mm = parts
            try:
                hh_int = int(hh)
                mm_int = int(mm)
            except ValueError:
                raise serializers.ValidationError(
                    {"scheduled_time": [_("validation.invalidTimeFormat")]}
                )
            if not (0 <= hh_int <= 23 and 0 <= mm_int <= 59):
                raise serializers.ValidationError(
                    {"scheduled_time": [_("validation.invalidTimeFormat")]}
                )
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
            raise serializers.ValidationError(
                {"scheduled_time": [_("validation.outsideAvailability")]}
            )

        # Category & license checks
        course = getattr(enrollment, "course", None)
        course_category = getattr(course, "category", None)
        if resource and course_category:
            if resource.category != course_category:
                raise serializers.ValidationError(
                    {"resource_id": [_("validation.categoryMismatch")]}
                )
        if course_category:
            lic_raw = getattr(instructor, "license_categories", "") or ""
            cats = [c.strip().upper() for c in str(lic_raw).split(",") if c.strip()]
            if str(course_category).upper() not in cats:
                raise serializers.ValidationError(
                    {"instructor_id": [_("validation.instructorLicenseMismatch")]}
                )

        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer(read_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment.objects.all(), source="enrollment"
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "enrollment",
            "enrollment_id",
            "amount",
            "payment_date",
            "payment_method",
            "description",
            "status",
        ]
        extra_kwargs = {
            "description": {
                "required": False,
                "allow_blank": True,
            },  # Allow description to be omitted or blank
            "status": {"required": False},  # Allow status to be omitted, will use model default
        }


class ScheduledClassSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    instructor = InstructorSerializer(read_only=True)
    resource = ResourceSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.all(), source="instructor", write_only=True
    )
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source="resource", write_only=True
    )
    current_enrollment = serializers.SerializerMethodField(read_only=True)
    available_spots = serializers.SerializerMethodField(read_only=True)
    students = StudentSerializer(many=True, read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source="students",
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = ScheduledClass
        fields = [
            "id",
            "course",
            "course_id",
            "name",
            "scheduled_time",
            "duration_minutes",
            "instructor",
            "instructor_id",
            "resource",
            "resource_id",
            "students",
            "student_ids",
            "max_students",
            "status",
            "current_enrollment",
            "available_spots",
        ]

    def get_current_enrollment(self, obj):
        return obj.current_enrollment()

    def get_available_spots(self, obj):
        return obj.available_spots()
