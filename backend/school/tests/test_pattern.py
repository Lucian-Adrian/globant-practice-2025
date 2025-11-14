from school.models import ScheduledClassPattern, ScheduledClass

# Get the pattern
pattern = ScheduledClassPattern.objects.first()
print('Pattern:', pattern)
print('Recurrence days:', pattern.recurrence_days)
print('Times:', pattern.times)
print('Start date:', pattern.start_date, type(pattern.start_date))

# Generate
classes = pattern.generate_scheduled_classes()
print(f'Generated {len(classes)} classes')
for cls in classes:
    print(f'  {cls.name} at {cls.scheduled_time}')

# Bulk create
ScheduledClass.objects.bulk_create(classes)
print('Bulk created')

# Set students
# Students are now set on the pattern, not on individual ScheduledClass instances.
# If you need to set students, do so on the pattern before generating classes.

# Check
for cls in ScheduledClass.objects.filter(pattern=pattern):
    # Students are now associated with the pattern, not with individual classes.
    students_names = list(pattern.students.values_list('first_name', flat=True))
    print(f'Created: {cls.name} at {cls.scheduled_time}, students: {students_names}')