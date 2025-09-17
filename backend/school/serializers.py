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


class StudentDetailSerializer(StudentSerializer):
    """A richer serializer for student detail views used by the frontend.

    This extends StudentSerializer and exposes nested enrollments and a few
    computed helper fields (balance, last_payment_date, next_lesson) so the
    frontend can render summary cards without additional endpoints.
    """
    enrollments = EnrollmentSerializer(many=True, read_only=True)
    balance = serializers.SerializerMethodField()
    last_payment_date = serializers.SerializerMethodField()
    next_lesson = serializers.SerializerMethodField()

    class Meta(StudentSerializer.Meta):
        model = Student
        fields = StudentSerializer.Meta.fields + ["enrollments", "balance", "last_payment_date", "next_lesson"]

    def get_balance(self, obj):
        # Simple balance: sum(course.price for enrollments) - sum(payments)
        total_price = 0.0
        total_paid = 0.0
        for enrollment in obj.enrollments.all():
            try:
                total_price += float(enrollment.course.price or 0)
            except Exception:
                total_price += 0.0
            for payment in enrollment.payments.all():
                try:
                    total_paid += float(payment.amount or 0)
                except Exception:
                    total_paid += 0.0
        return total_price - total_paid

    def get_last_payment_date(self, obj):
        payments = Payment.objects.filter(enrollment__student=obj).order_by('-payment_date')
        if payments.exists():
            return payments.first().payment_date
        return None

    def get_next_lesson(self, obj):
        from django.utils import timezone
        now = timezone.now()
        lessons = Lesson.objects.filter(enrollment__student=obj, scheduled_time__gte=now, status='SCHEDULED').order_by('scheduled_time')
        if lessons.exists():
            l = lessons.first()
            return {
                'id': l.id,
                'scheduled_time': l.scheduled_time,
                'instructor': InstructorSerializer(l.instructor).data if l.instructor else None,
                'vehicle': VehicleSerializer(l.vehicle).data if l.vehicle else None,
                'course': CourseSerializer(l.enrollment.course).data if l.enrollment else None,
            }
        return None
