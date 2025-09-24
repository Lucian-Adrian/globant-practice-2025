from django.db import models

VEHICLE_CATEGORY_CHOICES = [
    ('AM', 'AM'), ('A1', 'A1'), ('A2', 'A2'), ('A', 'A'),
    ('B1', 'B1'), ('B', 'B'), ('C1', 'C1'), ('C', 'C'), ('D1', 'D1'), ('D', 'D'),
    ('BE', 'BE'), ('C1E', 'C1E'), ('CE', 'CE'), ('D1E', 'D1E'), ('DE', 'DE'),
]


class Student(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Activ'), ('INACTIVE', 'Inactiv'), ('GRADUATED', 'Absolvit'),
    ]
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Instructor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    hire_date = models.DateField()
    license_categories = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Vehicle(models.Model):
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    license_plate = models.CharField(max_length=15, unique=True)
    year = models.IntegerField()
    category = models.CharField(max_length=5, choices=VEHICLE_CATEGORY_CHOICES)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"


class Course(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=5, choices=VEHICLE_CATEGORY_CHOICES, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    required_lessons = models.IntegerField()

    def __str__(self):
        return self.name


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'În Desfășurare'), ('COMPLETED', 'Finalizat'), ('DROPPED', 'Abandonat'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} înscris la {self.course}"


class Lesson(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Programată'), ('COMPLETED', 'Finalizată'), ('CANCELED', 'Anulată'),
    ]
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lessons')
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='lessons')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='lessons')
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"Lecție pentru {self.enrollment.student} ({self.enrollment.course})"


class Payment(models.Model):
    METHOD_CHOICES = [
        ('CASH', 'Numerar'), ('CARD', 'Card'), ('TRANSFER', 'Transfer Bancar'),
    ]
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    description = models.CharField(max_length=255)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Plată de {self.amount} RON pentru {self.enrollment}"
