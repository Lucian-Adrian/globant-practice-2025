"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from school.api import (
    StudentViewSet, InstructorViewSet, VehicleViewSet, CourseViewSet,
    EnrollmentViewSet, LessonViewSet, PaymentViewSet, UtilityViewSet
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
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
