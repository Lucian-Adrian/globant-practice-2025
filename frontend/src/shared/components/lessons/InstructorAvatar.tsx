import React from 'react';

export interface InstructorData {
  id: string;
  name: string;
  avatar?: string;
  specialties: ('driving' | 'theory')[];
  rating?: number;
  available: boolean;
  nextAvailable?: string; // ISO date string
  experience?: number; // years
  languages?: string[];
}

interface InstructorAvatarProps {
  instructor: InstructorData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showRating?: boolean;
  showSpecialties?: boolean;
  onClick?: (instructor: InstructorData) => void;
  className?: string;
  variant?: 'circle' | 'square';
}

// Icons
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

const ClockIcon = () => (
  <svg className="tw-w-3 tw-h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const sizeConfig = {
  sm: {
    avatar: 'tw-w-8 tw-h-8',
    text: 'tw-text-xs',
    badge: 'tw-w-2 tw-h-2',
    container: 'tw-gap-2'
  },
  md: {
    avatar: 'tw-w-12 tw-h-12',
    text: 'tw-text-sm',
    badge: 'tw-w-3 tw-h-3',
    container: 'tw-gap-3'
  },
  lg: {
    avatar: 'tw-w-16 tw-h-16',
    text: 'tw-text-base',
    badge: 'tw-w-4 tw-h-4',
    container: 'tw-gap-4'
  },
  xl: {
    avatar: 'tw-w-20 tw-h-20',
    text: 'tw-text-lg',
    badge: 'tw-w-5 tw-h-5',
    container: 'tw-gap-4'
  }
} as const;

export const InstructorAvatar: React.FC<InstructorAvatarProps> = ({
  instructor,
  size = 'md',
  showStatus = true,
  showRating = false,
  showSpecialties = false,
  onClick,
  className = '',
  variant = 'circle'
}) => {
  const sizes = sizeConfig[size];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    if (instructor.available) {
      return 'tw-bg-success';
    }
    return 'tw-bg-destructive';
  };

  const getStatusText = () => {
    if (instructor.available) {
      return 'Available';
    }
    if (instructor.nextAvailable) {
      const nextDate = new Date(instructor.nextAvailable);
      const now = new Date();
      const diffHours = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `Available in ${diffHours}h`;
      } else {
        const diffDays = Math.ceil(diffHours / 24);
        return `Available in ${diffDays}d`;
      }
    }
    return 'Unavailable';
  };

  const renderRating = () => {
    if (!showRating || !instructor.rating) return null;
    
    const rating = Math.round(instructor.rating * 10) / 10;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="tw-flex tw-items-center tw-gap-1">
        <div className="tw-flex tw-text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <StarIcon 
              key={i} 
              filled={i < fullStars || (i === fullStars && hasHalfStar)} 
            />
          ))}
        </div>
        <span className={`tw-font-medium ${sizes.text}`}>{rating}</span>
      </div>
    );
  };

  const renderSpecialties = () => {
    if (!showSpecialties || !instructor.specialties.length) return null;
    
    return (
      <div className="tw-flex tw-gap-1">
        {instructor.specialties.map((specialty) => (
          <div
            key={specialty}
            className={`tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded tw-bg-primary/10 tw-text-primary ${sizes.text}`}
            title={specialty === 'driving' ? 'Driving Instructor' : 'Theory Instructor'}
          >
            {specialty === 'driving' ? <CarIcon /> : <BookIcon />}
            <span className="tw-capitalize tw-font-medium">{specialty}</span>
          </div>
        ))}
      </div>
    );
  };

  const avatarClasses = `
    ${sizes.avatar} 
    ${variant === 'circle' ? 'tw-rounded-full' : 'tw-rounded-lg'}
    tw-bg-gradient-to-br tw-from-primary/20 tw-to-primary/40 
    tw-flex tw-items-center tw-justify-center tw-text-primary 
    tw-font-semibold tw-relative tw-overflow-hidden
    ${onClick ? 'tw-cursor-pointer hover:tw-scale-105 tw-transition-transform tw-duration-200' : ''}
  `;

  return (
    <div 
      className={`tw-flex tw-items-center ${sizes.container} ${className}`}
      onClick={() => onClick?.(instructor)}
    >
      {/* Avatar */}
      <div className={avatarClasses}>
        {instructor.avatar ? (
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className={`tw-w-full tw-h-full tw-object-cover ${variant === 'circle' ? 'tw-rounded-full' : 'tw-rounded-lg'}`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.textContent = getInitials(instructor.name);
              }
            }}
          />
        ) : (
          <span className={sizes.text}>{getInitials(instructor.name)}</span>
        )}
        
        {/* Status Badge */}
        {showStatus && (
          <div 
            className={`
              tw-absolute tw-bottom-0 tw-right-0 ${sizes.badge} 
              ${getStatusColor()} tw-border-2 tw-border-background tw-rounded-full
            `}
            title={getStatusText()}
          />
        )}
      </div>

      {/* Details */}
      {(size === 'lg' || size === 'xl') && (
        <div className="tw-flex-1 tw-min-w-0">
          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <h4 className={`tw-font-semibold tw-truncate ${sizes.text}`}>
              {instructor.name}
            </h4>
            {instructor.experience && (
              <span className={`tw-text-muted-foreground ${sizes.text}`}>
                • {instructor.experience}y exp
              </span>
            )}
          </div>
          
          {showRating && renderRating()}
          
          {showStatus && (
            <div className="tw-flex tw-items-center tw-gap-1 tw-text-muted-foreground">
              <ClockIcon />
              <span className={sizes.text}>{getStatusText()}</span>
            </div>
          )}
          
          {showSpecialties && (
            <div className="tw-mt-2">
              {renderSpecialties()}
            </div>
          )}
          
          {instructor.languages && instructor.languages.length > 0 && (
            <div className="tw-mt-1">
              <span className={`tw-text-muted-foreground ${sizes.text}`}>
                Speaks: {instructor.languages.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Instructor Card variant for larger displays
export const InstructorCard: React.FC<{
  instructor: InstructorData;
  onClick?: (instructor: InstructorData) => void;
  className?: string;
}> = ({ instructor, onClick, className = '' }) => {
  return (
    <div 
      className={`
        tw-bg-background tw-border tw-border-border tw-rounded-xl tw-p-6 tw-transition-all tw-duration-300
        tw-cursor-pointer hover:tw-shadow-lg hover:-tw-translate-y-1
        ${className}
      `}
      onClick={() => onClick?.(instructor)}
    >
      <InstructorAvatar
        instructor={instructor}
        size="xl"
        showStatus={true}
        showRating={true}
        showSpecialties={true}
        onClick={onClick}
      />
      
      {/* Additional Details */}
      <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
        <div className="tw-flex tw-justify-between tw-items-center tw-text-sm tw-text-muted-foreground">
          <span>Next Available</span>
          <span className="tw-font-medium">
            {instructor.available ? 'Now' : instructor.nextAvailable ? 
              new Date(instructor.nextAvailable).toLocaleDateString('ro-RO') : 
              'TBA'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default InstructorAvatar;
