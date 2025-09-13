from rest_framework import serializers
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "email", "phone_number", "date_of_birth", "enrollment_date", "status"]


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ["id", "first_name", "last_name", "email", "phone_number", "hire_date", "license_categories", "status"]


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
