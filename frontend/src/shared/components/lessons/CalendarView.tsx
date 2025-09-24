import React, { useState } from 'react';
import { LessonData } from './LessonCard';
import { LessonStatusBadge } from './LessonStatusBadge';

interface CalendarViewProps {
  lessons?: LessonData[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onLessonClick?: (lesson: LessonData) => void;
  className?: string;
  showWeekends?: boolean;
}

// Icons
const ChevronLeftIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const CalendarView: React.FC<CalendarViewProps> = ({
  lessons = [],
  selectedDate,
  onDateSelect,
  onLessonClick,
  className = '',
  showWeekends = true
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getLessonsForDate = (date: Date) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return lessons.filter(lesson => lesson.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isWeekend = (date: Date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ro-RO', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const dayNames = showWeekends 
    ? ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
    : ['Lun', 'Mar', 'Mie', 'Joi', 'Vin'];

  const days = getDaysInMonth(currentDate);
  const filteredDays = showWeekends ? days : days.filter((day, index) => {
    if (!day) return (index % 7) >= 1 && (index % 7) <= 5;
    return !isWeekend(day);
  });

  return (
    <div className={`tw-bg-background tw-border tw-border-border tw-rounded-2xl tw-overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="tw-bg-muted/30 tw-px-6 tw-py-4 tw-border-b tw-border-border">
        <div className="tw-flex tw-items-center tw-justify-between">
          <h3 className="tw-text-lg tw-font-semibold tw-capitalize">
            {formatMonth(currentDate)}
          </h3>
          <div className="tw-flex tw-gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="tw-p-2 tw-rounded-lg tw-border tw-border-border tw-bg-background hover:tw-bg-muted tw-transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="tw-p-2 tw-rounded-lg tw-border tw-border-border tw-bg-background hover:tw-bg-muted tw-transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="tw-p-4">
        {/* Day Names Header */}
        <div className={`tw-grid tw-gap-1 tw-mb-2 ${showWeekends ? 'tw-grid-cols-7' : 'tw-grid-cols-5'}`}>
          {dayNames.map((dayName) => (
            <div 
              key={dayName}
              className="tw-text-center tw-text-sm tw-font-medium tw-text-muted-foreground tw-py-2"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={`tw-grid tw-gap-1 ${showWeekends ? 'tw-grid-cols-7' : 'tw-grid-cols-5'}`}>
          {(showWeekends ? days : filteredDays).map((day, index) => {
            const dayLessons = day ? getLessonsForDate(day) : [];
            const isEmpty = !day;
            
            return (
              <div
                key={index}
                className={`
                  tw-min-h-[100px] tw-p-2 tw-border tw-border-border/50 tw-rounded-lg tw-transition-all tw-duration-200
                  ${isEmpty ? 'tw-bg-muted/20' : 'tw-bg-background hover:tw-bg-muted/30 tw-cursor-pointer'}
                  ${!showWeekends && day && isWeekend(day) ? 'tw-hidden' : ''}
                  ${day && isToday(day) ? 'tw-ring-2 tw-ring-primary tw-bg-primary/5' : ''}
                  ${day && isSelected(day) ? 'tw-ring-2 tw-ring-secondary tw-bg-secondary/10' : ''}
                `}
                onClick={() => day && onDateSelect?.(day)}
              >
                {day && (
                  <>
                    {/* Date Number */}
                    <div className={`
                      tw-text-sm tw-font-medium tw-mb-1
                      ${day && isToday(day) ? 'tw-text-primary tw-font-bold' : 'tw-text-foreground'}
                    `}>
                      {day.getDate()}
                    </div>

                    {/* Lessons */}
                    <div className="tw-space-y-1">
                      {dayLessons.slice(0, 3).map((lesson, lessonIndex) => (
                        <div
                          key={`${lesson.id}-${lessonIndex}`}
                          className="tw-text-xs tw-p-1 tw-rounded tw-cursor-pointer hover:tw-opacity-80"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLessonClick?.(lesson);
                          }}
                        >
                          <div className="tw-flex tw-items-center tw-gap-1">
                            <LessonStatusBadge status={lesson.status} size="sm" showIcon={false} />
                          </div>
                          <div className="tw-text-xs tw-text-muted-foreground tw-truncate tw-mt-0.5">
                            {lesson.time} - {lesson.type}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show count if more lessons */}
                      {dayLessons.length > 3 && (
                        <div className="tw-text-xs tw-text-muted-foreground tw-text-center tw-font-medium">
                          +{dayLessons.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="tw-px-6 tw-py-4 tw-border-t tw-border-border tw-bg-muted/20">
        <div className="tw-flex tw-flex-wrap tw-gap-4 tw-text-xs">
          <div className="tw-flex tw-items-center tw-gap-1">
            <div className="tw-w-3 tw-h-3 tw-rounded tw-bg-primary"></div>
            <span>Today</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-1">
            <div className="tw-w-3 tw-h-3 tw-rounded tw-bg-success"></div>
            <span>Confirmed</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-1">
            <div className="tw-w-3 tw-h-3 tw-rounded tw-bg-warning"></div>
            <span>Pending</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-1">
            <div className="tw-w-3 tw-h-3 tw-rounded tw-bg-destructive"></div>
            <span>Issues</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
