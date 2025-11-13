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
from .validators import (
    validate_name,
    validate_phone,
    canonicalize_license_categories,
    resolve_lesson_context,
    validate_lesson_required_fields,
    validate_lesson_practice_and_vehicle,
    validate_lesson_conflicts,
    validate_lesson_resource_availability,
    validate_instructor_availability,
    validate_lesson_category_and_license,
)

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
        """Apply server-side booking rules using helpers. Behavior unchanged."""
        instance = getattr(self, "instance", None)
        context = resolve_lesson_context(instance, attrs)

        # Required minimal fields
        validate_lesson_required_fields(context.enrollment, context.instructor, context.start)

        # If any critical missing, skip deeper validation (parity with previous code)
        if not (context.enrollment and context.instructor and context.start):
            return attrs

        # PRACTICE-only and vehicle-only rules
        validate_lesson_practice_and_vehicle(context.enrollment, context.resource)

        # Compute end time
        assert context.start is not None
        end = context.start + timedelta(minutes=int(context.duration or 90))

        # Conflicts (lessons only)
        validate_lesson_conflicts(
            context.enrollment, context.instructor, context.resource, context.start, end, instance
        )

        # Resource availability
        validate_lesson_resource_availability(context.resource, context.status)

        # Instructor availability
        validate_instructor_availability(getattr(context.instructor, "id", None), context.start)

        # Category & license checks
        validate_lesson_category_and_license(context.enrollment, context.instructor, context.resource)

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
        queryset=Course.objects.all(), source="course", 
    )
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.all(), source="instructor",
    )
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source="resource",
    )
    current_enrollment = serializers.SerializerMethodField(read_only=True)
    available_spots = serializers.SerializerMethodField(read_only=True)
    students = StudentSerializer(many=True, read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source="students",
        many=True,
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
