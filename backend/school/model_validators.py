"""Django model field validators for file uploads."""

from django.core.exceptions import ValidationError
from .validators import validate_file_size, validate_image_file


def validate_school_logo(file):
    """Validator for school_logo ImageField.

    Ensures uploaded logo:
    - Does not exceed 5MB
    - Is a valid image format
    - Is not corrupted

    Raises:
        ValidationError: If validation fails
    """
    try:
        validate_file_size(file, max_mb=5)
        validate_image_file(file)
    except ValueError as e:
        raise ValidationError(str(e))


def validate_landing_image(file):
    """Validator for landing_image ImageField.

    Ensures uploaded landing image:
    - Does not exceed 5MB
    - Is a valid image format
    - Is not corrupted

    Raises:
        ValidationError: If validation fails
    """
    try:
        validate_file_size(file, max_mb=5)
        validate_image_file(file)
    except ValueError as e:
        raise ValidationError(str(e))
