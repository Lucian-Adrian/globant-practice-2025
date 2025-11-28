"""ViewSet package for the school application.

This package contains ViewSets organized by domain:
- base: Base classes and utilities (FullCrudViewSet, permissions, etc.)
- student_views: StudentViewSet
- instructor_views: InstructorViewSet, InstructorAvailabilityViewSet
- lesson_views: LessonViewSet
- payment_views: PaymentViewSet
- course_views: CourseViewSet, EnrollmentViewSet
- resource_views: ResourceViewSet, VehicleViewSet
- scheduled_views: ScheduledClassPatternViewSet, ScheduledClassViewSet

Import from here for backwards compatibility with existing code.
"""

from .base import (
    FullCrudViewSet,
    IsAdminUser,
    IsAuthenticatedStudent,
    QSearchFilter,
    StudentJWTAuthentication,
)
from .instructor_views import (
    InstructorAvailabilityViewSet,
    InstructorViewSet,
)
from .student_views import StudentViewSet
from .lesson_views import LessonViewSet
from .payment_views import PaymentViewSet
from .course_views import (
    CourseViewSet,
    EnrollmentViewSet,
)
from .resource_views import (
    ResourceViewSet,
    VehicleViewSet,
)
from .scheduled_views import (
    ScheduledClassPatternViewSet,
    ScheduledClassViewSet,
)

__all__ = [
    # Base classes
    "FullCrudViewSet",
    "IsAdminUser",
    "IsAuthenticatedStudent",
    "QSearchFilter",
    "StudentJWTAuthentication",
    # Student
    "StudentViewSet",
    # Instructor
    "InstructorViewSet",
    "InstructorAvailabilityViewSet",
    # Lesson
    "LessonViewSet",
    # Payment
    "PaymentViewSet",
    # Course
    "CourseViewSet",
    "EnrollmentViewSet",
    # Resource
    "ResourceViewSet",
    "VehicleViewSet",
    # Scheduled
    "ScheduledClassPatternViewSet",
    "ScheduledClassViewSet",
]
