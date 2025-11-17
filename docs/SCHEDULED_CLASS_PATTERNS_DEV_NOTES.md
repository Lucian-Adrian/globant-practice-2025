# Scheduled Class Patterns - Developer Notes

## Architecture Overview

The Scheduled Class Patterns feature implements a complex scheduling system with the following components:

- **Models**: `ScheduledClassPattern` and `ScheduledClass`
- **Views**: `ScheduledClassPatternViewSet` and `ScheduledClassViewSet`
- **Serializers**: Pattern and class serialization with validation
- **Frontend**: React Admin forms with recurrence input components

## Model Relationships

### ScheduledClassPattern Model

```python
class ScheduledClassPattern(models.Model):
    # Core fields
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, blank=True)

    # Recurrence fields
    recurrence_days = models.JSONField(default=list)  # ['MONDAY', 'WEDNESDAY']
    times = models.JSONField(default=list)           # ['10:00', '14:00']
    start_date = models.DateField()
    num_lessons = models.IntegerField()
    duration_minutes = models.IntegerField(default=60)
    max_students = models.IntegerField()
    status = models.CharField(choices=LessonStatus.choices())
    created_at = models.DateTimeField(auto_now_add=True)
```

### ScheduledClass Model

```python
class ScheduledClass(models.Model):
    pattern = models.ForeignKey(
        ScheduledClassPattern,
        on_delete=models.CASCADE,
        related_name="scheduled_classes",
        null=True, blank=True
    )
    name = models.CharField(max_length=100)
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_students = models.IntegerField()
    status = models.CharField(choices=LessonStatus.choices())
    students = models.ManyToManyField(Student, related_name="scheduled_classes")
```

## Key Business Logic Methods

### Pattern Validation

```python
def clean(self):
    """Validate pattern data before saving."""
    if not self.recurrence_days:
        raise ValidationError("Recurrence days cannot be empty.")
    if not self.times:
        raise ValidationError("Times cannot be empty.")
    if self.start_date < date.today():
        raise ValidationError("Start date cannot be in the past.")

    valid_days = {'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'}
    if not all(day in valid_days for day in self.recurrence_days):
        raise ValidationError("Invalid recurrence days.")
```

### Conflict Validation

```python
def validate_generation(self):
    """Check for scheduling conflicts before generation."""
    classes = self.generate_scheduled_classes()
    for cls in classes:
        # Check instructor overlap
        overlaps = ScheduledClass.objects.filter(
            ~Q(pattern=self) if self.pk else Q(),
            pattern__instructor=self.instructor,
            scheduled_time__lt=cls.scheduled_time + timedelta(minutes=cls.duration_minutes),
            scheduled_time__gte=cls.scheduled_time
        ).exists()
        if overlaps:
            raise ValidationError(f"Overlap detected for instructor at {cls.scheduled_time}.")
```

### Class Generation Algorithm

```python
def generate_scheduled_classes(self):
    """Generate ScheduledClass instances based on recurrence rules."""
    classes = []
    current_date = self.start_date
    count = 0

    # Day mapping for weekday calculation
    day_map = {'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
               'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6}
    recurrence_day_indices = set(day_map[day] for day in self.recurrence_days)

    # Parse times
    time_objs = [time.fromisoformat(t) for t in self.times]

    while count < self.num_lessons:
        if current_date.weekday() in recurrence_day_indices:
            for time_obj in time_objs:
                if count >= self.num_lessons:
                    break
                # Create timezone-aware datetime
                naive_dt = datetime.combine(current_date, time_obj)
                scheduled_time = timezone.make_aware(naive_dt)

                # Generate class
                scheduled_class = ScheduledClass(
                    pattern=self,
                    name=f"{self.name} - {current_date.strftime('%Y-%m-%d')} {time_obj.strftime('%H:%M')}",
                    scheduled_time=scheduled_time,
                    duration_minutes=self.duration_minutes,
                    max_students=self.max_students,
                    status=self.status,
                )
                classes.append(scheduled_class)
                count += 1
        current_date += timedelta(days=1)

    return classes
```

## Serializer Validation

### Recurrence Days Validation

```python
def validate_recurrence_days(self, value):
    if not isinstance(value, list):
        raise serializers.ValidationError("Recurrence days must be a list.")
    valid_days = {'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'}
    for day in value:
        if day not in valid_days:
            raise serializers.ValidationError(f"Invalid day: {day}. Must be one of {valid_days}.")
    return value
```

### Time Format Validation

```python
def validate_times(self, value):
    if not isinstance(value, list):
        raise serializers.ValidationError("Times must be a list.")
    import re
    time_pattern = re.compile(r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    for time_str in value:
        if not isinstance(time_str, str) or not time_pattern.match(time_str):
            raise serializers.ValidationError(f"Invalid time format: {time_str}. Must be HH:MM.")
    return value
```

## ViewSet Actions

### Custom Actions

```python
@decorators.action(detail=True, methods=["post"], url_path="generate-classes")
def generate_classes(self, request, pk=None):
    """Generate ScheduledClass instances for this pattern."""
    pattern = self.get_object()
    pattern.validate_generation()  # Check for conflicts
    classes = pattern.generate_scheduled_classes()
    ScheduledClass.objects.bulk_create(classes)

    # Return paginated results
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(classes, request)
    serializer = ScheduledClassSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@decorators.action(detail=True, methods=["post"], url_path="regenerate-classes")
def regenerate_classes(self, request, pk=None):
    """Delete existing classes and create new ones."""
    pattern = self.get_object()

    # Delete existing classes
    deleted_count = ScheduledClass.objects.filter(pattern=pattern).delete()[0]

    # Generate new classes
    pattern.validate_generation()
    classes = pattern.generate_scheduled_classes()
    ScheduledClass.objects.bulk_create(classes)

    # Return results with deletion count
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(classes, request)
    serializer = ScheduledClassSerializer(page, many=True)

    return paginator.get_paginated_response({
        "deleted_count": deleted_count,
        "generated_count": len(classes),
        "results": serializer.data
    })
```

## Database Indexes

```python
class Meta:
    ordering = ["-created_at"]
    indexes = [
        models.Index(fields=['start_date']),
        models.Index(fields=['status']),
        models.Index(fields=['course']),
        models.Index(fields=['instructor']),
        models.Index(fields=['resource']),
        models.Index(fields=['start_date', 'status']),  # Composite index
    ]
```

## Frontend Integration

### React Admin Configuration

```javascript
// In App.jsx
<Resource
  name="scheduled-class-patterns"
  list={ScheduledClassPatternList}
  edit={ScheduledClassPatternEdit}
  create={ScheduledClassPatternCreate}
/>

// Data provider integration
const dataProvider = {
  getList: (resource, params) => {
    // Handle filtering, sorting, pagination
  },
  create: (resource, params) => {
    // Create pattern and optionally generate classes
  }
}
```

### Recurrence Input Components

```javascript
// RecurrenceArrayInput component structure
<RecurrenceArrayInput source="recurrence_days">
  <CheckboxGroupInput
    choices={[
      { id: 'MONDAY', name: 'Monday' },
      { id: 'TUESDAY', name: 'Tuesday' },
      // ...
    ]}
  />
</RecurrenceArrayInput>

<RecurrenceArrayInput source="times">
  <ArrayInput>
    <SimpleFormIterator>
      <TimeInput source="" label="Class Time" />
    </SimpleFormIterator>
  </ArrayInput>
</RecurrenceArrayInput>
```

## Extension Points

### Adding New Recurrence Types

1. **Extend Model**: Add fields for new recurrence patterns
```python
recurrence_type = models.CharField(choices=['weekly', 'monthly'], default='weekly')
recurrence_interval = models.IntegerField(default=1)  # Every N weeks
```

2. **Update Validation**: Modify `clean()` and `validate_*` methods
3. **Enhance Generation**: Update `generate_scheduled_classes()` algorithm
4. **Frontend Updates**: Add new input components for recurrence configuration

### Custom Validation Rules

```python
def validate_business_hours(self):
    """Ensure classes are only scheduled during business hours."""
    for time_str in self.times:
        hour = int(time_str.split(':')[0])
        if hour < 8 or hour > 18:  # 8 AM - 6 PM only
            raise ValidationError("Classes must be scheduled between 8 AM and 6 PM.")

def validate_instructor_availability(self):
    """Check against instructor's availability schedule."""
    # Custom logic for instructor availability
    pass
```

### Integration with External Systems

```python
def sync_with_calendar_system(self):
    """Sync generated classes with external calendar (Google Calendar, Outlook)."""
    for scheduled_class in self.scheduled_classes.all():
        # API calls to external calendar system
        pass

def send_notifications(self):
    """Send notifications to enrolled students."""
    for student in self.students.all():
        # Email/SMS notification logic
        pass
```

## Performance Considerations

### Query Optimization

- Use `select_related()` for foreign key relationships
- Implement proper database indexes
- Use `bulk_create()` for mass class generation
- Paginate large result sets

### Caching Strategies

```python
# Cache pattern statistics
@cached_property
def statistics(self):
    # Expensive calculations cached per instance
    pass

# Cache validation results
@lru_cache(maxsize=100)
def validate_recurrence_pattern(days, times):
    # Cache validation for common patterns
    pass
```

## Testing Strategies

### Unit Tests

```python
def test_pattern_generation(self):
    pattern = ScheduledClassPattern.objects.create(
        recurrence_days=['MONDAY', 'WEDNESDAY'],
        times=['10:00', '14:00'],
        start_date=date.today(),
        num_lessons=4
    )
    classes = pattern.generate_scheduled_classes()
    self.assertEqual(len(classes), 4)

def test_conflict_validation(self):
    # Test overlap detection
    pass
```

### Integration Tests

```python
def test_full_workflow(self):
    # Create pattern → Generate classes → Enroll students → Complete classes
    pass

def test_api_endpoints(self):
    # Test all CRUD operations and custom actions
    pass
```

## Migration Strategy

### Database Migrations

```python
# 0001_initial.py - Create tables
# 0002_add_indexes.py - Add performance indexes
# 0003_add_constraints.py - Add check constraints
# 0004_add_validation.py - Add custom validation
```

### Data Migration

```python
def migrate_legacy_schedules(apps, schema_editor):
    """Migrate existing manual schedules to patterns."""
    LegacySchedule = apps.get_model('school', 'LegacySchedule')
    ScheduledClassPattern = apps.get_model('school', 'ScheduledClassPattern')

    for legacy in LegacySchedule.objects.all():
        # Convert to pattern format
        pass
```

## Monitoring & Maintenance

### Health Checks

```python
def check_pattern_integrity(self):
    """Verify pattern data consistency."""
    # Check for orphaned classes
    # Validate recurrence data
    # Check for scheduling conflicts
    pass

def cleanup_old_patterns(self):
    """Archive or delete old patterns."""
    # Move completed patterns to archive
    # Clean up temporary data
    pass
```

### Logging

```python
import logging
logger = logging.getLogger(__name__)

def log_generation_activity(self, pattern, classes_created):
    """Log pattern generation for audit trail."""
    logger.info(f"Generated {classes_created} classes for pattern {pattern.name}")
```

## Security Considerations

### Permission Classes

```python
class IsInstructorOrAdmin(permissions.BasePermission):
    """Allow instructors to manage their own patterns."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.instructor.user == request.user

class CanGenerateClasses(permissions.BasePermission):
    """Restrict class generation to admins."""
    def has_permission(self, request, view):
        return request.user.is_staff
```

### Data Validation

- Sanitize all user inputs
- Validate JSON field contents
- Check for SQL injection in dynamic queries
- Rate limit API calls for generation endpoints

## Future Enhancements

### Advanced Scheduling

1. **Complex Recurrence**: Monthly patterns, custom intervals
2. **Conditional Scheduling**: Weather-dependent, student availability
3. **Dynamic Capacity**: Variable class sizes based on demand
4. **Resource Pools**: Multiple resource options per class

### AI/ML Integration

1. **Demand Prediction**: Forecast enrollment based on historical data
2. **Optimal Scheduling**: AI-optimized class times and instructor assignments
3. **Automated Adjustments**: Self-healing schedules for conflicts

### Mobile & API Extensions

1. **Mobile App**: Native apps for instructors and students
2. **Calendar Integration**: Sync with personal calendars
3. **Voice Commands**: Natural language scheduling
4. **Real-time Updates**: WebSocket notifications for changes