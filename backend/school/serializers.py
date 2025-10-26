from rest_framework import serializers
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment, InstructorAvailability
from .enums import CourseType
from .validators import validate_name, normalize_phone


class StudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    
    class Meta:
        model = Student
        fields = [
            "id", "first_name", "last_name", "email", "phone_number",
            "date_of_birth", "enrollment_date", "status", "password"
        ]
        extra_kwargs = {
            "first_name": {"error_messages": {"required": "First name is required", "blank": "First name is required"}},
            "last_name": {"error_messages": {"required": "Last name is required", "blank": "Last name is required"}},
            "email": {"error_messages": {"required": "Email is required", "blank": "Email is required", "invalid": "Invalid email format"}},
            "phone_number": {"error_messages": {"required": "Phone number is required", "blank": "Phone number is required"}},
            "date_of_birth": {"error_messages": {"required": "Date of birth is required", "invalid": "Invalid date format"}},
            "password": {"error_messages": {"required": "Password is required", "blank": "Password is required", "min_length": "Password must be at least 6 characters"}},
            # Status defaults to PENDING for new signups; not required on public portal.
            "status": {"required": False},
        }

    def validate_first_name(self, value: str) -> str:  # noqa: D401
        try:
            return validate_name(value, "First name")
        except ValueError as e:  # noqa: BLE001
            raise serializers.ValidationError(str(e))

    def validate_last_name(self, value: str) -> str:
        try:
            return validate_name(value, "Last name")
        except ValueError as e:  # noqa: BLE001
            raise serializers.ValidationError(str(e))

    def validate_phone_number(self, value: str) -> str:
        try:
            value = normalize_phone(value)
        except ValueError as e:  # noqa: BLE001
            raise serializers.ValidationError(str(e))
        # Stronger post-normalisation validation: + followed by 8-16 digits total
        import re  # local import keeps module top clean
        if not re.match(r"^\+\d{8,16}$", value.replace(" ", "")):
            raise serializers.ValidationError("Invalid phone number format. Expect +<country><digits> (8-16 total).")
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

    def validate(self, attrs):  # noqa: D401
        # Cross-field / business validations
        dob = attrs.get("date_of_birth") or (self.instance.date_of_birth if self.instance else None)
        if dob:
            from datetime import date
            today = date.today()
            if dob > today:
                raise serializers.ValidationError({"date_of_birth": ["Date of birth cannot be in the future"]})
            # Minimum age 15 years
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 15:
                raise serializers.ValidationError({"date_of_birth": ["Student must be at least 15 years old"]})
        return super().validate(attrs)

    def create(self, validated_data):  # noqa: D401
        from django.db import IntegrityError, transaction
        # Hash the password before creating
        password = validated_data.pop('password')
        try:
            with transaction.atomic():
                student = super().create(validated_data)
                if password.startswith(("pbkdf2_", "argon2$", "bcrypt$", "bcrypt_sha256$")):
                    student.password = password       # keep provided Django-style hash
                else:
                    student.set_password(password)    # hash plain text

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

    def update(self, instance, validated_data):  # noqa: D401
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
        fields = ["id", "first_name", "last_name", "email", "phone_number", "hire_date", "license_categories"]


class InstructorAvailabilitySerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(queryset=Instructor.objects.all(), source="instructor", write_only=True)

    class Meta:
        model = InstructorAvailability
        fields = ["id", "instructor", "instructor_id", "day", "hours"]


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["id", "make", "model", "license_plate", "year", "category", "is_available"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "category", "type", "description", "price", "required_lessons"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), source="student", write_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source="course", write_only=True)
    label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "student_id", "course_id", "enrollment_date", "type", "status", "label"]

    def get_label(self, obj):  # Name - Type - Category
        return f"{obj.student.first_name} {obj.student.last_name} - {obj.type or obj.course.type} - {obj.course.category}"

    def create(self, validated_data):
        # If type not provided, copy from course
        if 'type' not in validated_data:
            course = validated_data['course']
            validated_data['type'] = course.type
        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    enrollment = EnrollmentSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(queryset=Instructor.objects.all(), source="instructor", write_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source="enrollment", write_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), source="vehicle", write_only=True, required=False, allow_null=True)

    class Meta:
        model = Lesson
        fields = [
            "id", "enrollment", "instructor", "vehicle", "enrollment_id", "instructor_id", "vehicle_id", "scheduled_time",
            "duration_minutes", "status", "notes"
        ]


class PaymentSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer(read_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source="enrollment", write_only=True)

    class Meta:
        model = Payment
        fields = ["id", "enrollment", "enrollment_id", "amount", "payment_date", "payment_method", "status", "description"]
