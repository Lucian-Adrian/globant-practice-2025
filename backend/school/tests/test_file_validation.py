"""Test file upload validation."""
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from school.validators import validate_file_size, validate_image_file


class FileValidationTest(TestCase):
    """Test file validation functions."""

    def test_valid_image_size(self):
        """Test that images under 5MB are accepted."""
        small_image = SimpleUploadedFile("test.jpg", b"x" * (1024 * 1024), content_type="image/jpeg")
        validate_file_size(small_image, max_mb=5)  # Should not raise

    def test_image_too_large(self):
        """Test that images over 5MB are rejected."""
        large_image = SimpleUploadedFile("test.jpg", b"x" * (6 * 1024 * 1024), content_type="image/jpeg")
        with self.assertRaises(ValueError):
            validate_file_size(large_image, max_mb=5)

    def test_invalid_extension(self):
        """Test that non-image extensions are rejected."""
        text_file = SimpleUploadedFile("test.txt", b"content", content_type="text/plain")
        with self.assertRaises(ValueError):
            validate_image_file(text_file)
