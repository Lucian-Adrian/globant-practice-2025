import * as React from "react";

// Mock lessons data for badge calculation
const mockLessons = [
  { id: 1, date: "2025-09-25", status: "confirmed" },
  { id: 2, date: "2025-09-26", status: "confirmed" },
  { id: 3, date: "2025-09-28", status: "pending" },
  { id: 4, date: "2025-09-23", status: "confirmed" },
  { id: 5, date: "2025-09-24", status: "confirmed" },
  { id: 6, date: "2025-09-30", status: "pending" },
];

// Bell icon for notifications
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-4 tw-h-4" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const PortalNavBar: React.FC = () => {
  // Calculate upcoming lessons count
  const getUpcomingLessonsCount = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return mockLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return (lesson.status === "confirmed" || lesson.status === "pending") && lessonDate >= today;
    }).length;
  };

  const upcomingLessons = getUpcomingLessonsCount();

  return (
    <>
      <nav className="tw-hidden md:tw-flex tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-background/80 tw-backdrop-blur-md tw-border-b tw-border-border">
        <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-w-full">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-3">
              <div className="tw-w-10 tw-h-10 tw-bg-gradient-primary tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-glow">
                <span className="tw-text-base tw-font-bold tw-text-primary-foreground">DA</span>
              </div>
              <div>
                <h1 className="tw-text-xl tw-font-bold">DriveAcademy</h1>
                <p className="tw-text-sm tw-text-muted-foreground">Student Portal</p>
              </div>
            </div>

            <div className="tw-flex tw-items-center tw-gap-2">
              {[ 
                { path: "/dashboard", label: "Dashboard" },
                { path: "/lessons", label: "Lessons", hasBadge: true },
                { path: "/progress", label: "Progress" },
                { path: "/practice", label: "Practice" },
                { path: "/payments", label: "Payments" },
              ].map((item) => (
                <a key={item.path} href={item.path} className="tw-relative tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 hover:tw-bg-secondary hover:tw-scale-105 tw-text-muted-foreground hover:tw-text-foreground">
                  <span className="tw-w-4 tw-h-4 tw-rounded-sm tw-bg-foreground/40"></span>
                  {item.label}
                  {item.hasBadge && upcomingLessons > 0 && (
                    <span className="tw-absolute tw--top-1 tw--right-1 tw-bg-red-500 tw-text-white tw-text-xs tw-font-bold tw-rounded-full tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-animate-pulse">
                      {upcomingLessons}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div className="tw-flex tw-items-center tw-gap-3">
              {/* Notification Bell */}
              <div className="tw-relative">
                <button className="tw-p-2 tw-rounded-lg tw-text-muted-foreground hover:tw-text-foreground hover:tw-bg-secondary tw-transition-all tw-duration-200">
                  <BellIcon />
                </button>
                {upcomingLessons > 0 && (
                  <span className="tw-absolute tw--top-1 tw--right-1 tw-bg-red-500 tw-text-white tw-text-xs tw-font-bold tw-rounded-full tw-w-4 tw-h-4 tw-flex tw-items-center tw-justify-center">
                    {upcomingLessons > 9 ? '9+' : upcomingLessons}
                  </span>
                )}
              </div>

              {/* User Avatar */}
              <div className="tw-w-10 tw-h-10 tw-bg-gradient-card tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-primary/20">
                <div className="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <span className="tw-text-xs tw-font-bold tw-text-primary-foreground">JS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="tw-h-20 md:tw-h-24" />
    </>
  );
};

export default PortalNavBar;
