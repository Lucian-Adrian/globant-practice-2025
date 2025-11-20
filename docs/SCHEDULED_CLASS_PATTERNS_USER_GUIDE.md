# Scheduled Class Patterns - User Guide

## Overview

The Scheduled Class Patterns feature allows administrators to create recurring class schedules that automatically generate individual class instances. This is particularly useful for driving schools that need to schedule regular theory or practical lessons over extended periods.

## Key Concepts

### Pattern vs. Classes
- **Pattern**: A template defining when and how classes should recur (e.g., "Every Monday and Wednesday at 10:00 AM")
- **Classes**: Individual instances generated from the pattern (e.g., "Monday Theory Class - 2024-10-01 10:00")

### Recurrence System
Patterns use a flexible recurrence system based on:
- **Days**: Which days of the week classes occur
- **Times**: What time each day classes start
- **Duration**: How long each class lasts
- **Count**: Total number of classes to generate

## Creating a Scheduled Class Pattern

### Step 1: Access the Patterns Section
1. Log in to the admin panel
2. Navigate to "Scheduled Class Patterns" in the main menu
3. Click "Create" to start a new pattern

### Step 2: Basic Information
Fill in the fundamental details:

- **Name**: Descriptive name (e.g., "Monday/Wednesday Theory Classes")
- **Course**: Select the course this pattern is for
- **Instructor**: Choose the instructor who will teach these classes
- **Resource**: Select the classroom or vehicle for the classes
- **Max Students**: Maximum number of students allowed per class

### Step 3: Configure Recurrence

#### Recurrence Days
Select which days of the week classes should occur:
- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- You can select multiple days (e.g., Monday + Wednesday for bi-weekly classes)

#### Class Times
Specify what time each class starts:
- Use 24-hour format (HH:MM)
- Examples: "09:00", "14:30", "16:00"
- You can specify multiple times per day

#### Example Configurations:
```
Days: [Monday, Wednesday]
Times: [10:00, 14:00]
Result: Classes at 10:00 AM and 2:00 PM every Monday and Wednesday
```

### Step 4: Schedule Details

- **Start Date**: When the pattern should begin generating classes
- **Number of Lessons**: Total classes to create
- **Duration**: How long each class lasts (in minutes)
- **Status**: Initial status for generated classes

### Step 5: Student Enrollment (Optional)

You can pre-enroll students in the pattern:
- Students will be automatically enrolled in all generated classes
- This is useful for dedicated course groups
- Individual enrollment management can still be done per class

### Step 6: Generate Classes

After saving the pattern:
1. Click "Generate Classes" to create individual class instances
2. The system will validate for scheduling conflicts
3. Review the generated classes before confirming

## Managing Generated Classes

### Viewing Classes
- Use the "Scheduled Classes" section to view all generated classes
- Filter by pattern, date, instructor, or status
- Classes are linked back to their parent pattern

### Enrollment Management
- Enroll additional students in specific classes
- Unenroll students from individual classes
- Track enrollment counts and capacity utilization

### Status Updates
- Update class status (Scheduled → Completed → etc.)
- Cancel individual classes if needed
- Bulk status updates available

## Best Practices

### Pattern Design
1. **Clear Naming**: Use descriptive names that indicate the schedule
2. **Logical Grouping**: Group related classes (e.g., all theory classes for a course)
3. **Capacity Planning**: Set realistic max_students based on resource capacity

### Scheduling
1. **Conflict Prevention**: Always generate classes to check for overlaps
2. **Buffer Time**: Allow buffer time between classes for transitions
3. **Resource Availability**: Ensure instructors and resources are available

### Student Management
1. **Pre-enrollment**: Use pattern-level enrollment for dedicated groups
2. **Flexibility**: Allow individual class enrollment for makeup sessions
3. **Communication**: Keep students informed of schedule changes

## Common Workflows

### Weekly Theory Classes
```
Pattern: "Weekly Theory B"
Days: [Monday, Wednesday, Friday]
Times: [18:00]
Duration: 90 minutes
Classes: 12
Start: Next Monday
```

### Intensive Weekend Course
```
Pattern: "Weekend Intensive"
Days: [Saturday, Sunday]
Times: [09:00, 13:00]
Duration: 120 minutes
Classes: 16
Start: Next Saturday
```

### Makeup Session
```
Pattern: "Makeup Classes"
Days: [Tuesday, Thursday]
Times: [19:00]
Duration: 60 minutes
Classes: 4
Start: Next available date
```

## Troubleshooting

### Generation Fails
- **Overlaps**: Check for instructor or resource conflicts
- **Past Dates**: Start date cannot be in the past
- **Invalid Times**: Ensure times are in HH:MM format

### Enrollment Issues
- **Capacity**: Class may be full
- **Duplicates**: Student already enrolled
- **Status**: Check if student status allows enrollment

### Pattern Modifications
- **Existing Classes**: Modifying a pattern doesn't affect already generated classes
- **Regeneration**: Use "Regenerate Classes" to update existing schedules
- **Deletion**: Deleting a pattern removes all associated classes

## Reports and Analytics

### Pattern Statistics
View detailed statistics for each pattern:
- Total classes generated
- Completion rates
- Student enrollment numbers
- Capacity utilization

### Export Options
- Export patterns to CSV for backup
- Export individual classes for external systems
- Import classes from CSV for bulk operations

## Advanced Features

### Statistics Dashboard
Access pattern statistics to monitor:
- Class completion rates
- Student attendance patterns
- Resource utilization
- Instructor workload distribution

### Bulk Operations
- Generate multiple patterns at once
- Bulk enroll students across patterns
- Mass status updates for classes

### Integration Points
- Patterns integrate with course enrollment
- Student dashboards show upcoming classes
- Instructor schedules reflect pattern assignments</content>
<parameter name="filePath">d:\Programming\drive-admin\globant-practice-2025\docs\SCHEDULED_CLASS_PATTERNS_USER_GUIDE.md