from django.urls import path, include
from rest_framework import routers
from .views import (
    StudentViewSet, InstructorViewSet, VehicleViewSet, CourseViewSet,
    EnrollmentViewSet, LessonViewSet, PaymentViewSet, UtilityViewSet,
    enums_meta, me, check_username, signup,
)

router = routers.DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'instructors', InstructorViewSet)
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
    path('auth/test/signup/', signup, name='auth-signup'),
]
