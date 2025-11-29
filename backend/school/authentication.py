from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings

from .models import Instructor, Student

class SchoolJWTAuthentication(JWTAuthentication):
    """
    Universal JWT Authentication for School project.
    Handles tokens for:
    1. Instructors (claim: instructor_id)
    2. Students (claim: student_id)
    3. Admin/Staff Users (claim: user_id)
    """
    
    def get_user(self, validated_token):
        # 1. Try Instructor
        if "instructor_id" in validated_token:
            try:
                return Instructor.objects.get(id=validated_token["instructor_id"])
            except Instructor.DoesNotExist:
                raise InvalidToken("Instructor not found")
        
        # 2. Try Student
        if "student_id" in validated_token:
            try:
                return Student.objects.get(id=validated_token["student_id"])
            except Student.DoesNotExist:
                raise InvalidToken("Student not found")

        # 3. Try Standard User (Admin)
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken("Token contained no recognizable user identification")

        User = get_user_model()
        try:
            user = User.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except User.DoesNotExist:
            raise InvalidToken("User not found")

        if not user.is_active:
            raise AuthenticationFailed("User is inactive")

        return user
