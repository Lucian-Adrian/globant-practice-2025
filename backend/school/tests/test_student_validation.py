from django.test import TestCase
from rest_framework.test import APIClient

from school.models import Student


class StudentValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/students/"
        self.payload = {
            "first_name": "Ion",
            "last_name": "Popescu",
            "email": "ion@example.com",
            "phone_number": "+37360111222",
            "date_of_birth": "2000-01-01",
            "status": "ACTIVE",
            "password": "testpass123",
        }

    def test_create_student_ok(self):
        r = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Student.objects.count(), 1)

    def test_duplicate_email(self):
        self.client.post(self.url, self.payload, format="json")
        r2 = self.client.post(
            self.url, {**self.payload, "phone_number": "+37360111223"}, format="json"
        )
        self.assertEqual(r2.status_code, 400)
        self.assertIn("email", r2.json()['errors'])

    def test_duplicate_phone(self):
        self.client.post(self.url, self.payload, format="json")
        r2 = self.client.post(
            self.url, {**self.payload, "email": "other@example.com"}, format="json"
        )
        self.assertEqual(r2.status_code, 400)
        self.assertIn("phone_number", r2.json()['errors'])

    def test_invalid_name(self):
        bad = {**self.payload, "first_name": "Ion123"}
        r = self.client.post(self.url, bad, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("first_name", r.json()['errors'])

    def test_invalid_phone(self):
        bad = {**self.payload, "phone_number": "+37312"}
        r = self.client.post(self.url, bad, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("phone_number", r.json()['errors'])
