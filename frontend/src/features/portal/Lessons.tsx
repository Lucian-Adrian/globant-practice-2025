import * as React from "react";
import { useState } from "react";
import PortalNavBar from "./PortalNavBar";

// Minimal inline icons to avoid external deps
const iconProps = "tw-w-4 tw-h-4";
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
    <path d="M5 16h14" />
    <circle cx="7" cy="16" r="2" />
    <circle cx="17" cy="16" r="2" />
  </svg>
);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
  </svg>
);
const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-px-5 tw-py-4 tw-border-b tw-border-border ${className}`}>{children}</div>
);
const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <h3 className={`tw-text-base tw-font-semibold ${className}`}>{children}</h3>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-6 ${className}`}>{children}</div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" | "secondary"; size?: "sm" | "md" | "lg" }> = ({ className = "", children, variant = "default", size = "md", ...props }) => {
  const sizes = { sm: "tw-h-8 tw-px-3 tw-text-xs", md: "tw-h-10 tw-px-4", lg: "tw-h-11 tw-px-6" } as const;
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90",
    outline: "tw-border tw-border-input hover:tw-bg-secondary",
    destructive: "tw-bg-destructive tw-text-destructive-foreground hover:tw-bg-destructive/90",
    secondary: "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90",
  } as const;
  return (
    <button className={`tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge: React.FC<React.PropsWithChildren<{ variant?: "default" | "secondary" | "destructive" | "outline"; className?: string }>> = ({ children, variant = "secondary", className = "" }) => {
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
    destructive: "tw-bg-destructive tw-text-destructive-foreground",
    outline: "tw-border tw-border-input",
  } as const;
  return <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${variants[variant]} ${className}`}>{children}</span>;
};

const Lessons: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [tab, setTab] = useState<"list" | "calendar">("list");

  const lessons = [
    { id: 1, type: "Driving", instructor: "Maria Popescu", date: "2024-10-22", time: "14:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "confirmed", location: "Starting Point: School Parking" },
    { id: 2, type: "Theory", instructor: "Ion Vasilescu", date: "2024-10-23", time: "10:00", duration: "1 hour", vehicle: "Classroom A", status: "confirmed", location: "Main Building, Floor 2" },
    { id: 3, type: "Driving", instructor: "Ana Ionescu", date: "2024-10-20", time: "16:00", duration: "2 hours", vehicle: "Ford Focus - B456ABC", status: "completed", location: "City Center Route" },
    { id: 4, type: "Theory", instructor: "Ion Vasilescu", date: "2024-10-18", time: "09:00", duration: "1 hour", vehicle: "Classroom B", status: "missed", location: "Main Building, Floor 1" },
    { id: 5, type: "Driving", instructor: "Maria Popescu", date: "2024-10-25", time: "11:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "pending", location: "Highway Practice Route" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="tw-bg-success tw-text-success-foreground">Confirmed</Badge>;
      case "completed":
        return <Badge className="tw-bg-primary tw-text-primary-foreground">Completed</Badge>;
      case "missed":
        return <Badge variant="destructive">Missed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircleIcon className="tw-text-success" />;
      case "completed":
        return <CheckCircleIcon className="tw-text-primary" />;
      case "missed":
        return <XIcon className="tw-text-destructive" />;
      case "pending":
        return <AlertCircleIcon className="tw-text-warning" />;
      default:
        return null;
    }
  };

  const filteredLessons = lessons.filter((lesson) => (selectedFilter === "all" ? true : lesson.status === selectedFilter));
  const upcomingLessons = lessons.filter((l) => l.status === "confirmed" || l.status === "pending");

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">
            Your Lessons
          </h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
            Manage your driving and theory lessons, track your progress, and never miss a session.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4 tw-animate-fade-in-up">
          {[
            { label: "Upcoming", value: upcomingLessons.length, color: "tw-text-primary" },
            { label: "Completed", value: lessons.filter((l) => l.status === "completed").length, color: "tw-text-success" },
            { label: "Pending", value: lessons.filter((l) => l.status === "pending").length, color: "tw-text-warning" },
            { label: "Missed", value: lessons.filter((l) => l.status === "missed").length, color: "tw-text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardContent className="tw-p-4 tw-text-center">
                <div className={`tw-text-2xl tw-font-bold ${s.color}`}>{s.value}</div>
                <div className="tw-text-sm tw-text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="tw-space-y-6">
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
            <div className="tw-grid tw-grid-cols-2 tw-w-full md:tw-w-auto tw-border tw-border-input tw-rounded-lg tw-overflow-hidden">
              <button onClick={() => setTab("list")} className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 ${tab === "list" ? "tw-bg-secondary" : "tw-bg-transparent"}`}>
                <ListIcon />
                List View
              </button>
              <button onClick={() => setTab("calendar")} className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 ${tab === "calendar" ? "tw-bg-secondary" : "tw-bg-transparent"}`}>
                <CalendarIcon />
                Calendar View
              </button>
            </div>

            <div className="tw-flex tw-items-center tw-gap-2">
              <FilterIcon className="tw-text-muted-foreground" />
              <div className="tw-flex tw-gap-1">
                {["all", "confirmed", "completed", "pending", "missed"].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="tw-capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {tab === "list" && (
            <div className="tw-space-y-4">
              {filteredLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={`tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card tw-transition-all tw-duration-300 hover:tw-scale-[1.02] ${
                    lesson.status === "confirmed" ? "tw-ring-2 tw-ring-success/20" : lesson.status === "missed" ? "tw-ring-2 tw-ring-destructive/20" : ""
                  }`}
                >
                  <CardContent className="tw-p-6">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-w-12 tw-h-12 tw-bg-primary/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                          {lesson.type === "Driving" ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-6 tw-h-6 tw-text-primary">
                              <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
                              <path d="M5 16h14" />
                              <circle cx="7" cy="16" r="2" />
                              <circle cx="17" cy="16" r="2" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-6 tw-h-6 tw-text-primary">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="tw-text-lg tw-font-semibold tw-text-foreground">{lesson.type} Lesson</h3>
                          <p className="tw-text-sm tw-text-muted-foreground">with {lesson.instructor}</p>
                        </div>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        {lesson.status === "confirmed" && <CheckCircleIcon className="tw-text-success" />}
                        {lesson.status === "completed" && <CheckCircleIcon className="tw-text-primary" />}
                        {lesson.status === "missed" && <XIcon className="tw-text-destructive" />}
                        {lesson.status === "pending" && <AlertCircleIcon className="tw-text-warning" />}
                        {getStatusBadge(lesson.status)}
                      </div>
                    </div>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-text-sm">
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                        <CalendarIcon />
                        <span>{new Date(lesson.date).toLocaleDateString()}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                        <ClockIcon />
                        <span>
                          {lesson.time} ({lesson.duration})
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                        <UserIcon />
                        <span>{lesson.vehicle}</span>
                      </div>
                    </div>

                    <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border/30">
                      <p className="tw-text-sm tw-text-muted-foreground">📍 {lesson.location}</p>
                    </div>

                    {lesson.status === "confirmed" && (
                      <div className="tw-mt-4 tw-flex tw-gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="destructive">Cancel</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tab === "calendar" && (
            <div className="tw-space-y-4">
              <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
                <CardHeader>
                  <CardTitle>October 2024</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="tw-text-center tw-text-muted-foreground tw-py-12">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-16 tw-h-16 tw-mx-auto tw-mb-4 tw-opacity-50">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p>Calendar view coming soon!</p>
                    <p className="tw-text-sm tw-mt-2">For now, use the list view to see all your lessons.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Book New Lesson */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-6 tw-text-center">
            <h3 className="tw-text-xl tw-font-bold tw-mb-2">Ready for your next lesson?</h3>
            <p className="tw-mb-4 tw-opacity-90">Book a new driving or theory session with your instructor.</p>
            <Button variant="secondary" size="lg" className="tw-animate-bounce-gentle">
              Book New Lesson
            </Button>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Lessons;
