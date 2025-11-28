"""ViewSet package for the school application.

This package contains ViewSets organized by domain:
- base: Base classes and utilities (FullCrudViewSet, permissions, etc.)
- student_views: StudentViewSet
- instructor_views: InstructorViewSet, InstructorAvailabilityViewSet

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
]
