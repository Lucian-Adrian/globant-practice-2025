from django.urls import include, path
from rest_framework import routers

from .views import (
    AddressViewSet,
    CourseViewSet,
    EnrollmentViewSet,
    InstructorAvailabilityViewSet,
    InstructorViewSet,
    LessonViewSet,
    PaymentViewSet,
    ResourceViewSet,
    ScheduledClassViewSet,
    ScheduledClassPatternViewSet,
    SchoolConfigViewSet,
    StudentViewSet,
    UtilityViewSet,
    VehicleViewSet,
    check_username,
    ensure_superuser,
    enums_meta,
    me,
    student_dashboard,
    student_login,
    student_me,
)

router = routers.DefaultRouter()
router.register(r"students", StudentViewSet)
router.register(r"instructors", InstructorViewSet)
router.register(r"instructor-availabilities", InstructorAvailabilityViewSet)
router.register(r"vehicles", VehicleViewSet)
router.register(r"resources", ResourceViewSet)
router.register(r"courses", CourseViewSet)
router.register(r"scheduled-class-patterns", ScheduledClassPatternViewSet)
router.register(r"scheduled-classes", ScheduledClassViewSet)
router.register(r"enrollments", EnrollmentViewSet)
router.register(r"lessons", LessonViewSet)
router.register(r"payments", PaymentViewSet)
router.register(r"utils", UtilityViewSet, basename="utils")
router.register(r"addresses", AddressViewSet)
router.register(r"school/config", SchoolConfigViewSet, basename="school-config")

urlpatterns = [
    path("", include(router.urls)),
    path("meta/enums/", enums_meta, name="meta-enums"),
    path("auth/me/", me, name="auth-me"),
    path("auth/test/check-username/", check_username, name="auth-check-username"),
    path("auth/ensure-superuser/", ensure_superuser, name="ensure-superuser"),
    path("auth/student/login/", student_login, name="student-login"),
    path("auth/student/me/", student_me, name="student-me"),
    path("student/dashboard/", student_dashboard, name="student-dashboard"),
]
