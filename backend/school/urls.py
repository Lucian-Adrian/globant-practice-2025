from django.urls import path, include
from rest_framework import routers
from .views import (
    StudentViewSet, InstructorViewSet, VehicleViewSet, CourseViewSet,
    EnrollmentViewSet, LessonViewSet, PaymentViewSet, UtilityViewSet,
    enums_meta,
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
]
