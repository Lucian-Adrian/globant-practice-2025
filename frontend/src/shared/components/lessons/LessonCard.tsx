import React from 'react';
import { LessonStatusBadge, LessonStatus } from './LessonStatusBadge';

export interface LessonData {
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

interface LessonCardProps {
  lesson: LessonData;
  onClick?: (lesson: LessonData) => void;
  className?: string;
  showActions?: boolean;
  onReschedule?: (lesson: LessonData) => void;
  onCancel?: (lesson: LessonData) => void;
  compact?: boolean;
}

// Icons
const CalendarIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LocationIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CarIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
    <path d="M5 16h14" />
    <circle cx="7" cy="16" r="2" />
    <circle cx="17" cy="16" r="2" />
  </svg>
);

const BookIcon = () => (
  <svg className="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'outline' | 'destructive' | 'secondary'; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ 
  className = '', 
  children, 
  variant = 'default', 
  size = 'md', 
  ...props 
}) => {
  const sizes = { sm: 'tw-h-8 tw-px-3 tw-text-xs', md: 'tw-h-10 tw-px-4', lg: 'tw-h-11 tw-px-6' };
  const variants = {
    default: 'tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90',
    outline: 'tw-border tw-border-input hover:tw-bg-secondary',
    destructive: 'tw-bg-destructive tw-text-destructive-foreground hover:tw-bg-destructive/90',
    secondary: 'tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90',
  };
  
  return (
    <button 
      className={`tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors tw-touch-manipulation ${sizes[size]} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  className = '',
  showActions = true,
  onReschedule,
  onCancel,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getTypeIcon = () => {
    return lesson.type === 'Driving' ? <CarIcon /> : <BookIcon />;
  };

  const getStatusRing = () => {
    switch (lesson.status) {
      case 'confirmed':
        return 'tw-ring-2 tw-ring-success/20';
      case 'missed':
      case 'cancelled':
        return 'tw-ring-2 tw-ring-destructive/20';
      case 'pending':
        return 'tw-ring-2 tw-ring-warning/20';
      default:
        return '';
    }
  };

  if (compact) {
    return (
      <div 
        className={`
          tw-bg-background tw-border tw-border-border/50 tw-rounded-lg tw-p-4 tw-transition-all tw-duration-300 
          tw-cursor-pointer hover:tw-shadow-md hover:-tw-translate-y-0.5 tw-animate-fade-in
          ${getStatusRing()} ${className}
        `}
        onClick={() => onClick?.(lesson)}
      >
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className="tw-w-8 tw-h-8 tw-bg-primary/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
              {getTypeIcon()}
            </div>
            <div>
              <h4 className="tw-font-semibold tw-text-sm">{lesson.type}</h4>
              <p className="tw-text-xs tw-text-muted-foreground">{formatDate(lesson.date)} at {lesson.time}</p>
            </div>
          </div>
          <LessonStatusBadge status={lesson.status} size="sm" />
        </div>
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted-foreground">
          <UserIcon />
          <span className="tw-truncate">{lesson.instructor}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        tw-bg-background tw-border tw-border-border/50 tw-rounded-2xl tw-shadow-sm tw-transition-all tw-duration-300 
        tw-cursor-pointer hover:tw-shadow-xl hover:-tw-translate-y-1 tw-animate-fade-in card-hover
        ${getStatusRing()} ${className}
      `}
      onClick={() => onClick?.(lesson)}
    >
      <div className="tw-p-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-12 tw-h-12 tw-bg-primary/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="tw-font-semibold tw-text-lg">{lesson.type} Lesson</h3>
              <p className="tw-text-sm tw-text-muted-foreground">#{lesson.id}</p>
            </div>
          </div>
          <LessonStatusBadge status={lesson.status} />
        </div>

        {/* Details */}
        <div className="tw-space-y-3 tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-3">
            <CalendarIcon />
            <div>
              <span className="tw-font-medium">{formatDate(lesson.date)}</span>
              <span className="tw-mx-2 tw-text-muted-foreground">•</span>
              <span className="tw-text-muted-foreground">{lesson.time} ({lesson.duration})</span>
            </div>
          </div>

          <div className="tw-flex tw-items-center tw-gap-3">
            <UserIcon />
            <span className="tw-text-muted-foreground">{lesson.instructor}</span>
          </div>

          {lesson.vehicle && (
            <div className="tw-flex tw-items-center tw-gap-3">
              <CarIcon />
              <span className="tw-text-muted-foreground">{lesson.vehicle}</span>
            </div>
          )}

          <div className="tw-flex tw-items-center tw-gap-3">
            <LocationIcon />
            <span className="tw-text-muted-foreground tw-truncate">{lesson.location}</span>
          </div>
        </div>

        {/* Description */}
        {lesson.description && (
          <div className="tw-mb-4 tw-p-3 tw-bg-muted/50 tw-rounded-lg">
            <p className="tw-text-sm tw-text-muted-foreground">{lesson.description}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && lesson.status === 'confirmed' && (
          <div className="tw-flex tw-gap-2 tw-pt-4 tw-border-t tw-border-border">
            <Button 
              size="sm" 
              variant="outline" 
              className="tw-flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onReschedule?.(lesson);
              }}
            >
              Reschedule
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="tw-flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(lesson);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;
