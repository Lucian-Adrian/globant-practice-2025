import React from 'react';

export type LessonStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

interface LessonStatusBadgeProps {
  status: LessonStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Status configuration with icons, colors, and animations
const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className: 'tw-bg-success tw-text-success-foreground',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    animation: 'tw-animate-bounce-in'
  },
  pending: {
    label: 'Pending',
    className: 'tw-bg-warning tw-text-warning-foreground',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    animation: 'tw-animate-pulse'
  },
  completed: {
    label: 'Completed',
    className: 'tw-bg-primary tw-text-primary-foreground',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    animation: 'tw-animate-bounce-in'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'tw-bg-destructive tw-text-destructive-foreground',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    animation: 'tw-animate-shake'
  },
  missed: {
    label: 'Missed',
    className: 'tw-bg-red-500 tw-text-white',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
    animation: 'tw-animate-shake'
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'tw-bg-blue-500 tw-text-white',
    icon: (
      <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    ),
    animation: 'tw-animate-bounce-in'
  }
} as const;

const sizeConfig = {
  sm: {
    badge: 'tw-px-2 tw-py-0.5 tw-text-xs',
    icon: 'tw-w-3 tw-h-3'
  },
  md: {
    badge: 'tw-px-2.5 tw-py-1 tw-text-sm',
    icon: 'tw-w-3.5 tw-h-3.5'
  },
  lg: {
    badge: 'tw-px-3 tw-py-1.5 tw-text-base',
    icon: 'tw-w-4 tw-h-4'
  }
} as const;

export const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  if (!config) {
    return (
      <span className={`tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-font-medium tw-bg-gray-100 tw-text-gray-800 ${sizeStyles.badge} ${className}`}>
        {showIcon && (
          <svg className={sizeStyles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6m0 4h.01" />
          </svg>
        )}
        Unknown
      </span>
    );
  }

  return (
    <span 
      className={`
        tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-font-medium tw-transition-all tw-duration-200
        ${config.className} 
        ${sizeStyles.badge}
        ${config.animation}
        ${className}
      `}
      title={`Lesson status: ${config.label}`}
    >
      {showIcon && (
        <span className={sizeStyles.icon}>
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
};

export default LessonStatusBadge;
