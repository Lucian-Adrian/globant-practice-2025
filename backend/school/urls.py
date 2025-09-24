from django.urls import path, include
from rest_framework import routers
from .views import (
    StudentViewSet, InstructorViewSet, VehicleViewSet, CourseViewSet,
    EnrollmentViewSet, LessonViewSet, PaymentViewSet, UtilityViewSet, InstructorAvailabilityViewSet,
    enums_meta, me, check_username, student_login, student_me, student_dashboard,
)

router = routers.DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'instructors', InstructorViewSet)
router.register(r'instructor-availabilities', InstructorAvailabilityViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'utils', UtilityViewSet, basename='utils')

urlpatterns = [
    path('', include(router.urls)),
    path('meta/enums/', enums_meta, name='meta-enums'),
    path('auth/me/', me, name='auth-me'),
    path('auth/test/check-username/', check_username, name='auth-check-username'),
    path('auth/student/login/', student_login, name='student-login'),
    path('auth/student/me/', student_me, name='student-me'),
    path('student/dashboard/', student_dashboard, name='student-dashboard'),
]
