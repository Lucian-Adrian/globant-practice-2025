from django.contrib import admin

from . import models


@admin.register(models.Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "status", "enrollment_date")
    search_fields = ("first_name", "last_name", "email")
    list_filter = ("status",)


@admin.register(models.Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "hire_date")
    search_fields = ("first_name", "last_name", "email")


@admin.register(models.InstructorAvailability)
class InstructorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("instructor", "day", "hours")
    list_filter = ("day", "instructor")
    search_fields = ("instructor__first_name", "instructor__last_name")


@admin.register(models.Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("license_plate", "make", "model", "year", "category", "is_available")
    list_filter = ("category", "is_available")
    search_fields = ("license_plate", "make", "model")


@admin.register(models.Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("name", "resource_type", "max_capacity", "category", "is_available")
    list_filter = ("max_capacity", "category", "is_available")
    search_fields = ("name", "license_plate", "make", "model")


@admin.register(models.Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "required_lessons")
    search_fields = ("name",)


@admin.register(models.Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "status", "enrollment_date")
    list_filter = ("status", "course__category")
    search_fields = ("student__first_name", "student__last_name", "course__name")


@admin.register(models.Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "instructor", "resource", "scheduled_time", "status")
    list_filter = ("status", "instructor")
    date_hierarchy = "scheduled_time"


@admin.register(models.Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "amount", "payment_method", "payment_date")
    list_filter = ("payment_method", "payment_date")
    search_fields = ("enrollment__student__first_name", "enrollment__student__last_name")


@admin.register(models.ScheduledClassPattern)
class ScheduledClassPatternAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "instructor", "start_date", "num_lessons", "default_duration_minutes", "default_max_students")
    list_filter = ("course__category", "instructor")
    search_fields = ("name", "course__name", "instructor__first_name", "instructor__last_name")
    date_hierarchy = "start_date"


@admin.register(models.ScheduledClass)
class ScheduledClassAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "pattern",
        "scheduled_time",
        "current_enrollment",
        "max_students",
        "status",
    )
    list_filter = ("status", "pattern__course__category", "pattern__instructor")
    search_fields = ("name", "pattern__course__name", "pattern__instructor__first_name", "pattern__instructor__last_name")
    date_hierarchy = "scheduled_time"
