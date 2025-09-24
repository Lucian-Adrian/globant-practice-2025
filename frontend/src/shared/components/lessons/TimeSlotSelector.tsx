import React, { useState } from 'react';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  duration: number; // in minutes
  instructor?: string;
  type?: 'driving' | 'theory';
}

interface TimeSlotSelectorProps {
  date: Date;
  timeSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect?: (slot: TimeSlot) => void;
  className?: string;
  showInstructor?: boolean;
  filterByType?: 'driving' | 'theory' | 'all';
}

// Icons
const ClockIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CarIcon = () => (
  <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
    <path d="M5 16h14" />
    <circle cx="7" cy="16" r="2" />
    <circle cx="17" cy="16" r="2" />
  </svg>
);

const BookIcon = () => (
  <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  timeSlots,
  selectedSlot,
  onSlotSelect,
  className = '',
  showInstructor = true,
  filterByType = 'all'
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getSlotIcon = (type?: string) => {
    switch (type) {
      case 'driving':
        return <CarIcon />;
      case 'theory':
        return <BookIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const getSlotColor = (slot: TimeSlot, isSelected: boolean, isHovered: boolean) => {
    if (!slot.available) {
      return 'tw-bg-muted tw-text-muted-foreground tw-cursor-not-allowed tw-opacity-50';
    }
    
    if (isSelected) {
      return 'tw-bg-primary tw-text-primary-foreground tw-ring-2 tw-ring-primary/50';
    }
    
    if (isHovered) {
      return 'tw-bg-primary/10 tw-text-primary tw-ring-1 tw-ring-primary/30';
    }
    
    return 'tw-bg-background tw-text-foreground hover:tw-bg-muted/50 tw-cursor-pointer';
  };

  // Filter time slots based on type
  const filteredSlots = timeSlots.filter(slot => {
    if (filterByType === 'all') return true;
    return slot.type === filterByType;
  });

  // Group slots by morning, afternoon, evening
  const groupSlotsByTime = (slots: TimeSlot[]) => {
    const groups = {
      morning: [] as TimeSlot[],
      afternoon: [] as TimeSlot[],
      evening: [] as TimeSlot[]
    };

    slots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 18) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  };

  const groupedSlots = groupSlotsByTime(filteredSlots);

  const TimeSlotGroup: React.FC<{ title: string; slots: TimeSlot[]; icon: React.ReactNode }> = ({ 
    title, 
    slots, 
    icon 
  }) => {
    if (slots.length === 0) return null;

    return (
      <div className="tw-space-y-3">
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-muted-foreground">
          {icon}
          <span>{title}</span>
          <div className="tw-flex-1 tw-h-px tw-bg-border"></div>
          <span className="tw-text-xs">{slots.filter(s => s.available).length} available</span>
        </div>

        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-2">
          {slots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            const isHovered = hoveredSlot === slot.id;

            return (
              <div
                key={slot.id}
                className={`
                  tw-p-3 tw-rounded-lg tw-border tw-transition-all tw-duration-200 tw-relative
                  ${getSlotColor(slot, isSelected, isHovered)}
                  ${slot.available ? 'tw-border-border hover:tw-border-primary/50' : 'tw-border-muted'}
                `}
                onClick={() => slot.available && onSlotSelect?.(slot)}
                onMouseEnter={() => setHoveredSlot(slot.id)}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    {getSlotIcon(slot.type)}
                    <span className="tw-font-medium">{slot.time}</span>
                  </div>
                  
                  {slot.available && isSelected && (
                    <div className="tw-w-2 tw-h-2 tw-bg-primary-foreground tw-rounded-full"></div>
                  )}
                </div>

                <div className="tw-text-xs tw-opacity-75 tw-mb-1">
                  {formatDuration(slot.duration)}
                </div>

                {showInstructor && slot.instructor && (
                  <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-opacity-75">
                    <UserIcon />
                    <span className="tw-truncate">{slot.instructor}</span>
                  </div>
                )}

                {!slot.available && (
                  <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-background/50 tw-rounded-lg">
                    <span className="tw-text-xs tw-font-medium tw-text-muted-foreground">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`tw-space-y-6 ${className}`}>
      {/* Header */}
      <div className="tw-text-center tw-space-y-2">
        <h3 className="tw-text-lg tw-font-semibold">Select Time Slot</h3>
        <p className="tw-text-sm tw-text-muted-foreground tw-capitalize">
          {formatDate(date)}
        </p>
      </div>

      {/* Filter Tabs */}
      {filterByType === 'all' && (
        <div className="tw-flex tw-justify-center tw-gap-1 tw-p-1 tw-bg-muted tw-rounded-lg">
          <button className="tw-px-3 tw-py-1 tw-text-sm tw-rounded tw-bg-background tw-shadow-sm">
            All Types
          </button>
        </div>
      )}

      {/* Time Slots */}
      <div className="tw-space-y-6">
        <TimeSlotGroup
          title="Morning"
          slots={groupedSlots.morning}
          icon={
            <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          }
        />

        <TimeSlotGroup
          title="Afternoon"
          slots={groupedSlots.afternoon}
          icon={
            <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          }
        />

        <TimeSlotGroup
          title="Evening"
          slots={groupedSlots.evening}
          icon={
            <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          }
        />
      </div>

      {/* Summary */}
      {selectedSlot && (
        <div className="tw-p-4 tw-bg-primary/10 tw-border tw-border-primary/20 tw-rounded-lg">
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-primary">
            <ClockIcon />
            <span>Selected: {selectedSlot.time} ({formatDuration(selectedSlot.duration)})</span>
          </div>
          {showInstructor && selectedSlot.instructor && (
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-primary/70 tw-mt-1">
              <UserIcon />
              <span>with {selectedSlot.instructor}</span>
            </div>
          )}
        </div>
      )}

      {/* No slots message */}
      {filteredSlots.length === 0 && (
        <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
          <ClockIcon />
          <p className="tw-mt-2">No time slots available for this date</p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
