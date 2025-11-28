"""Test phone number validation for SchoolConfig model."""

from django.test import TestCase
from django.core.exceptions import ValidationError
from phonenumbers import NumberParseException

from school.models import SchoolConfig


class SchoolConfigPhoneValidationTest(TestCase):
    """Test phone number validation in SchoolConfig."""

    def setUp(self):
        """Set up test instance."""
        self.config = SchoolConfig.objects.create(
            school_name="Test School",
            email="test@example.com"
        )

    def test_valid_international_format(self):
        """Test that international format phone numbers are accepted."""
        self.config.contact_phone1 = "+37360123456"
        self.config.full_clean()  # Should not raise

    def test_valid_moldova_local_format(self):
        """Test that local Moldova numbers are properly handled."""
        self.config.contact_phone1 = "060123456"
        self.config.full_clean()  # Should be converted to +373

    def test_invalid_phone_too_short(self):
        """Test that too-short numbers are rejected."""
        self.config.contact_phone1 = "+37360"
        with self.assertRaises(ValidationError):
            self.config.full_clean()

    def test_invalid_phone_letters(self):
        """Test that alphanumeric numbers are rejected."""
        self.config.contact_phone1 = "+373ABCD1234"
        with self.assertRaises((ValidationError, NumberParseException)):
            self.config.full_clean()

    def test_optional_phone2_null(self):
        """Test that contact_phone2 can be null."""
        self.config.contact_phone2 = None
        self.config.full_clean()  # Should not raise

    def test_optional_phone2_blank(self):
        """Test that contact_phone2 can be blank."""
        self.config.contact_phone2 = ""
        self.config.full_clean()  # Should not raise
