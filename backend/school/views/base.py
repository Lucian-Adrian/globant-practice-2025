"""Base classes and utilities for ViewSets."""

from rest_framework import mixins, viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from ..models import Student


class IsAuthenticatedStudent(BasePermission):
    """Permission class for authenticated students via JWT token."""
    
    def has_permission(self, request, view):
        # Check if token has student_id
        if hasattr(request, "auth") and request.auth:
            return "student_id" in request.auth
        return False


class IsAdminUser(BasePermission):
    """Permission class for admin users (staff or superuser)."""
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class StudentJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that validates student tokens."""
    
    def get_user(self, validated_token):
        student_id = validated_token.get("student_id")
        if not student_id:
            raise InvalidToken("Token contained no recognizable user identification")
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise InvalidToken("Student not found")
        return student


class FullCrudViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Full CRUD for internal use (no auth layer yet—secure before prod)."""

    pass


class QSearchFilter(SearchFilter):
    """Use 'q' as the search query parameter to align with frontend SearchInput."""

    search_param = "q"
