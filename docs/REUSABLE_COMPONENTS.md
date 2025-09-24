# Lesson Management - Reusable Components

This document describes the reusable components created for the lesson management system, following modern React patterns and TypeScript best practices.

## 📁 Component Structure

All lesson-related components are located in:
```
frontend/src/shared/components/lessons/
├── LessonStatusBadge.tsx
├── LessonCard.tsx  
├── CalendarView.tsx
├── TimeSlotSelector.tsx
├── InstructorAvatar.tsx
└── index.ts
```

## 🏷️ 1. LessonStatusBadge Component

**Purpose**: Displays lesson status with consistent styling and animations.

### Usage
```tsx
import { LessonStatusBadge } from '../../shared/components/lessons';

<LessonStatusBadge 
  status="confirmed" 
  size="md" 
  showIcon={true} 
/>
```

### Props
- `status`: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'missed' | 'rescheduled'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showIcon`: boolean (default: true)
- `className`: string (optional)

### Features
- ✅ Status-specific colors and icons
- ✅ Smooth animations (bounce, pulse, shake)
- ✅ Accessible with title tooltips
- ✅ Consistent sizing system

## 🃏 2. LessonCard Component

**Purpose**: Uniform display of lesson information with optional actions.

### Usage
```tsx
import { LessonCard, type LessonData } from '../../shared/components/lessons';

const lesson: LessonData = {
  id: 1,
  type: 'Driving',
  instructor: 'Maria Popescu',
  date: '2024-10-22',
  time: '14:00',
  duration: '2 hours',
  vehicle: 'Dacia Logan - B123XYZ',
  status: 'confirmed',
  location: 'School Parking'
};

<LessonCard
  lesson={lesson}
  onClick={(lesson) => console.log('Clicked:', lesson)}
  showActions={true}
  onReschedule={(lesson) => handleReschedule(lesson)}
  onCancel={(lesson) => handleCancel(lesson)}
  compact={false}
/>
```

### Props
- `lesson`: LessonData object
- `onClick`: (lesson: LessonData) => void (optional)
- `showActions`: boolean (default: true)
- `onReschedule`: (lesson: LessonData) => void (optional)
- `onCancel`: (lesson: LessonData) => void (optional)
- `compact`: boolean (default: false) - smaller card variant
- `className`: string (optional)

### Features
- ✅ Two variants: full and compact
- ✅ Responsive design
- ✅ Hover animations
- ✅ Status-based ring colors
- ✅ Action buttons for confirmed lessons

## 📅 3. CalendarView Component

**Purpose**: Interactive calendar display with lesson integration.

### Usage
```tsx
import { CalendarView } from '../../shared/components/lessons';

<CalendarView
  lessons={lessons}
  selectedDate={selectedDate}
  onDateSelect={(date) => setSelectedDate(date)}
  onLessonClick={(lesson) => openLessonDetails(lesson)}
  showWeekends={true}
/>
```

### Props
- `lessons`: LessonData[] (optional)
- `selectedDate`: Date (optional)
- `onDateSelect`: (date: Date) => void (optional)
- `onLessonClick`: (lesson: LessonData) => void (optional)
- `showWeekends`: boolean (default: true)
- `className`: string (optional)

### Features
- ✅ Full month view with navigation
- ✅ Lesson indicators on dates
- ✅ Status-based color coding
- ✅ Responsive grid layout
- ✅ Weekend toggle support
- ✅ Today highlighting
- ✅ Interactive lesson previews

## ⏰ 4. TimeSlotSelector Component

**Purpose**: Time slot selection with availability and instructor information.

### Usage
```tsx
import { TimeSlotSelector, type TimeSlot } from '../../shared/components/lessons';

const timeSlots: TimeSlot[] = [
  {
    id: 'slot1',
    time: '09:00',
    available: true,
    duration: 120,
    instructor: 'Maria Popescu',
    type: 'driving'
  }
];

<TimeSlotSelector
  date={new Date()}
  timeSlots={timeSlots}
  selectedSlot={selectedSlot}
  onSlotSelect={(slot) => setSelectedSlot(slot)}
  showInstructor={true}
  filterByType="all"
/>
```

### Props
- `date`: Date - the selected date
- `timeSlots`: TimeSlot[] - available slots
- `selectedSlot`: TimeSlot (optional)
- `onSlotSelect`: (slot: TimeSlot) => void (optional)
- `showInstructor`: boolean (default: true)
- `filterByType`: 'driving' | 'theory' | 'all' (default: 'all')
- `className`: string (optional)

### Features
- ✅ Time-based grouping (morning, afternoon, evening)
- ✅ Availability indicators
- ✅ Duration formatting
- ✅ Instructor information
- ✅ Interactive selection
- ✅ Responsive grid layout

## 👤 5. InstructorAvatar Component

**Purpose**: Instructor display with avatar, availability, and details.

### Usage
```tsx
import { InstructorAvatar, InstructorCard, type InstructorData } from '../../shared/components/lessons';

const instructor: InstructorData = {
  id: '1',
  name: 'Maria Popescu',
  avatar: 'path/to/image.jpg', // optional
  specialties: ['driving'],
  rating: 4.8,
  available: true,
  experience: 8,
  languages: ['Romanian', 'English']
};

// Avatar variant
<InstructorAvatar
  instructor={instructor}
  size="lg"
  showStatus={true}
  showRating={true}
  showSpecialties={true}
  onClick={(instructor) => selectInstructor(instructor)}
/>

// Card variant
<InstructorCard
  instructor={instructor}
  onClick={(instructor) => selectInstructor(instructor)}
/>
```

### Props
- `instructor`: InstructorData object
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `showStatus`: boolean (default: true)
- `showRating`: boolean (default: false)
- `showSpecialties`: boolean (default: false)
- `onClick`: (instructor: InstructorData) => void (optional)
- `variant`: 'circle' | 'square' (default: 'circle')
- `className`: string (optional)

### Features
- ✅ Multiple size variants
- ✅ Avatar with fallback to initials
- ✅ Availability status indicator
- ✅ Rating display with stars
- ✅ Specialty badges
- ✅ Experience and language info
- ✅ Hover animations

## 🚀 Integration Example

Here's how all components work together in the main Lessons.tsx:

```tsx
import { 
  LessonCard, 
  LessonStatusBadge, 
  CalendarView, 
  TimeSlotSelector,
  InstructorAvatar,
  type LessonData,
  type LessonStatus,
  type TimeSlot,
  type InstructorData
} from '../../shared/components/lessons';

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  return (
    <div>
      {/* List View with Lesson Cards */}
      {lessons.map(lesson => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onClick={handleLessonClick}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      ))}
      
      {/* Calendar View */}
      <CalendarView
        lessons={lessons}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onLessonClick={handleLessonClick}
      />
      
      {/* Booking Flow */}
      <TimeSlotSelector
        date={selectedDate}
        timeSlots={availableSlots}
        onSlotSelect={handleSlotSelect}
      />
    </div>
  );
};
```

## 📝 TypeScript Types

All components include comprehensive TypeScript definitions:

```tsx
// Core lesson data structure
interface LessonData {
  id: number | string;
  type: 'Driving' | 'Theory';
  instructor: string;
  date: string;
  time: string;
  duration: string;
  vehicle?: string;
  location: string;
  status: LessonStatus;
  description?: string;
}

// Status options
type LessonStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

// Time slot structure
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  duration: number;
  instructor?: string;
  type?: 'driving' | 'theory';
}

// Instructor data structure
interface InstructorData {
  id: string;
  name: string;
  avatar?: string;
  specialties: ('driving' | 'theory')[];
  rating?: number;
  available: boolean;
  nextAvailable?: string;
  experience?: number;
  languages?: string[];
}
```

## 🎨 Styling & Animations

All components use:
- **Tailwind CSS** for styling with consistent design tokens
- **Custom animations** (fade-in, slide-in, bounce-in, shake)
- **Responsive design** with mobile-first approach
- **Accessibility features** (proper focus states, ARIA labels)
- **Dark mode support** through CSS custom properties

## 🔧 Customization

Components are highly customizable through:
- **CSS class injection** via className props
- **Size variants** for different use cases
- **Conditional rendering** based on props
- **Event handlers** for interaction
- **Type safety** with TypeScript

## 📚 Best Practices

- ✅ **Single Responsibility**: Each component has a clear purpose
- ✅ **Composition over Inheritance**: Components can be combined
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Accessibility**: WCAG compliant
- ✅ **Performance**: Optimized rendering
- ✅ **Reusability**: No tight coupling to specific business logic

This component library provides a solid foundation for building consistent, maintainable lesson management interfaces across the application.
