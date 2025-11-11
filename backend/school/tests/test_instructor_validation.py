from django.test import TestCase
from rest_framework.test import APIClient
from school.models import Instructor


class InstructorValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/instructors/"
        self.payload = {
            "first_name": "Ion",
            "last_name": "Popescu",
            "email": "instructor@example.com",
            "phone_number": "+37360111222",
            "hire_date": "2020-01-01",
            "license_categories": "B,BE",
        }

    def test_create_instructor_ok(self):
        r = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Instructor.objects.count(), 1)

    def test_duplicate_email(self):
        self.client.post(self.url, self.payload, format="json")
        r2 = self.client.post(self.url, {**self.payload, "phone_number": "+37360111223"}, format="json")
        self.assertEqual(r2.status_code, 400)
        self.assertIn("email", r2.json())

    def test_duplicate_phone(self):
        self.client.post(self.url, self.payload, format="json")
        r2 = self.client.post(self.url, {**self.payload, "email": "other@example.com"}, format="json")
        self.assertEqual(r2.status_code, 400)
        self.assertIn("phone_number", r2.json())

    def test_invalid_name(self):
        bad = {**self.payload, "first_name": "Ion123"}
        r = self.client.post(self.url, bad, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("first_name", r.json())

    def test_invalid_phone(self):
        bad = {**self.payload, "phone_number": "+37312"}
        r = self.client.post(self.url, bad, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("phone_number", r.json())
