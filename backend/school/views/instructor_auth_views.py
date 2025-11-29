from django.contrib.auth import get_user_model
from rest_framework import decorators, response, status
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from ..models import Instructor
from ..serializers import InstructorSerializer

class IsAuthenticatedInstructor(BasePermission):
    """Permission class for authenticated instructors via JWT token."""
    
    def has_permission(self, request, view):
        # Check if token has instructor_id
        # request.auth is the validated token (dict-like)
        if request.auth and "instructor_id" in request.auth:
            return True
        return False

class InstructorJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that validates instructor tokens."""
    
    def get_user(self, validated_token):
        instructor_id = validated_token.get("instructor_id")
        if not instructor_id:
            raise InvalidToken("Token contained no recognizable user identification")
        try:
            instructor = Instructor.objects.get(id=instructor_id)
        except Instructor.DoesNotExist:
            raise InvalidToken("Instructor not found")
        return instructor

@decorators.api_view(["POST"])
@decorators.permission_classes([AllowAny])
def instructor_login(request):
    """Instructor login endpoint. Authenticates instructor and returns JWT tokens."""
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return response.Response(
            {"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        instructor = Instructor.objects.get(email=email)
    except Instructor.DoesNotExist:
        return response.Response(
            {"detail": "This account has not been found"}, status=status.HTTP_404_NOT_FOUND
        )

    if not instructor.check_password(password):
        return response.Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    # Generate tokens
    refresh = RefreshToken()
    refresh["instructor_id"] = instructor.id
    
    access = refresh.access_token
    access["instructor_id"] = instructor.id
    
    return response.Response({
        "refresh": str(refresh),
        "access": str(access),
        "instructor": {
            "id": instructor.id,
            "first_name": instructor.first_name,
            "last_name": instructor.last_name,
            "email": instructor.email,
        }
    })

@decorators.api_view(["GET"])
@decorators.authentication_classes([InstructorJWTAuthentication])
@decorators.permission_classes([IsAuthenticatedInstructor])
def instructor_me(request):
    """Get current authenticated instructor details."""
    # request.user is the Instructor instance returned by InstructorJWTAuthentication
    serializer = InstructorSerializer(request.user)
    return response.Response(serializer.data)
