from rest_framework import serializers
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


class PaymentSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer(read_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), source="enrollment", write_only=True)

    class Meta:
        model = Payment
        fields = ["id", "enrollment", "enrollment_id", "amount", "payment_date", "payment_method", "description"]
