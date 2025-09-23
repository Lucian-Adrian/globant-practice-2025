import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const base =
    "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 tw-focus-visible:tw-outline-none tw-focus-visible:tw-ring-2 tw-focus-visible:tw-ring-ring tw-disabled:tw-opacity-50 tw-disabled:tw-pointer-events-none";
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "tw-h-9 tw-px-3",
    md: "tw-h-10 tw-px-4",
    lg: "tw-h-11 tw-px-6",
  };
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90",
    secondary: "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/80",
    outline:
      "tw-bg-transparent tw-text-foreground tw-border tw-border-input hover:tw-bg-secondary",
    ghost: "tw-bg-transparent tw-text-foreground hover:tw-bg-secondary",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge: React.FC<React.PropsWithChildren<{ variant?: "outline" | "secondary" | "destructive"; className?: string }>> = ({ variant = "secondary", className = "", children }) => {
  const base = "tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5";
  const variants = {
    outline: "tw-border tw-border-input tw-text-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
    destructive: "tw-bg-red-500/15 tw-text-red-600",
  } as const;
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
);

const CardRoot: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-rounded-2xl tw-border tw-border-border tw-bg-background ${className}`}>{children}</div>
);
const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-px-5 tw-py-4 tw-border-b tw-border-border ${className}`}>{children}</div>
);
const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <h3 className={`tw-text-base tw-font-semibold ${className}`}>{children}</h3>
);
const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`tw-p-5 ${className}`}>{children}</div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  variant?: "primary" | "warning";
  trend?: { value: string; isPositive: boolean };
}> = ({ title, value, description, variant, trend }) => (
  <CardRoot className="tw-animate-fade-in-up">
    <CardContent>
      <div className="tw-flex tw-items-start tw-justify-between">
        <div>
          <div className="tw-text-sm tw-text-muted-foreground">{title}</div>
          <div className="tw-mt-1 tw-text-2xl tw-font-semibold">{value}</div>
          <div className="tw-text-xs tw-text-muted-foreground tw-mt-1">{description}</div>
        </div>
        <div className={`tw-w-10 tw-h-10 tw-rounded-lg ${variant === "primary" ? "tw-bg-primary/10" : variant === "warning" ? "tw-bg-amber-500/15" : "tw-bg-muted"} tw-flex tw-items-center tw-justify-center`}>
          <div className={`${variant === "primary" ? "tw-bg-primary" : variant === "warning" ? "tw-bg-amber-500" : "tw-bg-foreground/40"} tw-w-4 tw-h-4 tw-rounded-sm`}></div>
        </div>
      </div>
      {trend && (
        <div className={`tw-mt-3 tw-text-xs ${trend.isPositive ? "tw-text-emerald-600" : "tw-text-red-600"}`}>{trend.value}</div>
      )}
    </CardContent>
  </CardRoot>
);

const NavBar: React.FC = () => (
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
              { path: "/lessons", label: "Lessons" },
              { path: "/progress", label: "Progress" },
              { path: "/practice", label: "Practice" },
              { path: "/payments", label: "Payments" },
            ].map((item) => (
              <a key={item.path} href={item.path} className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-duration-200 hover:tw-bg-secondary hover:tw-scale-105 tw-text-muted-foreground hover:tw-text-foreground">
                <span className="tw-w-4 tw-h-4 tw-rounded-sm tw-bg-foreground/40"></span>
                {item.label}
              </a>
            ))}
          </div>

          <div className="tw-w-10 tw-h-10 tw-bg-gradient-card tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-primary/20">
            <div className="tw-w-8 tw-h-8 tw-bg-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-xs tw-font-bold tw-text-primary-foreground">JS</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div className="tw-h-20 md:tw-h-24" />
  </>
);

const DashboardStudent: React.FC = () => {
  const upcomingLessons = [
    { id: 1, type: "Driving", instructor: "Maria Popescu", date: "Tomorrow", time: "14:00", vehicle: "Dacia Logan - B123XYZ" },
    { id: 2, type: "Theory", instructor: "Ion Vasilescu", date: "Mon, Oct 23", time: "10:00", vehicle: "Classroom A" },
  ];
  const notifications = [
    { id: 1, title: "Payment Due", message: "Your next payment of 1,200 MDL is due in 3 days", type: "warning", time: "2 hours ago" },
    { id: 2, title: "Lesson Confirmed", message: "Your driving lesson with Maria Popescu has been confirmed", type: "success", time: "1 day ago" },
    { id: 3, title: "Theory Test Available", message: "New practice test on traffic signs is now available", type: "info", time: "2 days ago" },
  ];

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <NavBar />
      <Container className="tw-space-y-8 tw-pb-10">
        <div className="tw-relative tw-overflow-hidden tw-rounded-2xl tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow tw-animate-fade-in">
          <div className="tw-absolute tw-inset-0 tw-bg-black/20" />
          <div className="tw-relative tw-z-10 tw-p-8 md:tw-p-12 tw-text-center">
            <div className="tw-space-y-6">
              <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-white/20 tw-rounded-full tw-text-sm tw-font-medium">
                <div className="tw-w-2 tw-h-2 tw-bg-white tw-rounded-full tw-animate-pulse" />
                Student Portal Active
              </div>
              <h1 className="tw-text-4xl md:tw-text-6xl tw-font-bold">Welcome back, Alex! 🚗</h1>
              <p className="tw-text-xl md:tw-text-2xl tw-opacity-90 tw-max-w-3xl tw-mx-auto">
                Ready to accelerate your driving journey? Check your progress and upcoming lessons below.
              </p>
              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
                <Button variant="secondary" size="lg" className="tw-animate-bounce-gentle">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-foreground/60"></span>
                  Practice Theory
                </Button>
                <Button variant="secondary" size="lg">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-foreground/60"></span>
                  Book Lesson
                </Button>
              </div>
            </div>
          </div>
          <div className="tw-absolute tw-top-4 tw-right-4 tw-w-32 tw-h-32 tw-bg-white/10 tw-rounded-full tw-blur-xl" />
          <div className="tw-absolute tw-bottom-4 tw-left-4 tw-w-24 tw-h-24 tw-bg-white/5 tw-rounded-full tw-blur-lg" />
        </div>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-animate-fade-in-up">
          <StatCard title="Next Lesson" value="Tomorrow" description="2:00 PM - Driving" variant="primary" />
          <StatCard title="Course Progress" value="68%" description="Theory & Driving Combined" trend={{ value: "12%", isPositive: true }} />
          <StatCard title="Outstanding Balance" value="1,200 MDL" description="Due in 3 days" variant="warning" />
          <StatCard title="Lessons Completed" value="24/40" description="16 lessons remaining" trend={{ value: "3", isPositive: true }} />
        </div>

        <div className="tw-grid lg:tw-grid-cols-3 tw-gap-8">
          <div className="lg:tw-col-span-2 tw-space-y-6">
            <CardRoot className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-primary"></span>
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-secondary/50 tw-rounded-lg tw-border tw-border-border/30 hover:tw-bg-secondary/70 tw-transition-colors tw-group">
                    <div className="tw-flex tw-items-center tw-gap-4">
                      <div className="tw-w-12 tw-h-12 tw-bg-primary/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center group-hover:tw-bg-primary/20 tw-transition-colors">
                        <span className="tw-w-6 tw-h-6 tw-rounded-sm tw-bg-primary"></span>
                      </div>
                      <div>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                          <h3 className="tw-font-semibold">{lesson.type} Lesson</h3>
                          <Badge variant="outline" className="tw-text-xs">{lesson.type}</Badge>
                        </div>
                        <p className="tw-text-sm tw-text-muted-foreground">with {lesson.instructor}</p>
                        <p className="tw-text-xs tw-text-muted-foreground tw-mt-1">{lesson.vehicle}</p>
                      </div>
                    </div>
                    <div className="tw-text-right">
                      <p className="tw-font-medium">{lesson.date}</p>
                      <p className="tw-text-sm tw-text-muted-foreground tw-flex tw-items-center tw-justify-end tw-gap-1">
                        <span className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-foreground/60"></span>
                        {lesson.time}
                      </p>
                    </div>
                  </div>
                ))}
                <Button className="tw-w-full tw-mt-4" variant="outline">View All Lessons</Button>
              </CardContent>
            </CardRoot>

            <CardRoot className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                  {[
                    { label: "Practice Test" },
                    { label: "Book Lesson" },
                    { label: "Make Payment" },
                    { label: "View Progress" },
                  ].map((a) => (
                    <Button key={a.label} variant="outline" className="tw-h-20 tw-flex tw-flex-col tw-gap-2 hover:tw-bg-primary hover:tw-text-primary-foreground tw-transition-colors">
                      <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-foreground/60"></span>
                      <span className="tw-text-xs">{a.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CardRoot>
          </div>

          <div className="tw-space-y-6">
            <CardRoot className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-primary"></span>
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-4">
                {notifications.map((n) => (
                  <div key={n.id} className="tw-p-3 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20 hover:tw-bg-secondary/50 tw-transition-colors">
                    <div className="tw-flex tw-items-start tw-justify-between tw-mb-2">
                      <h4 className="tw-font-medium tw-text-sm">{n.title}</h4>
                      <Badge variant={n.type === "warning" ? "destructive" : "secondary"} className="tw-text-xs">
                        {n.type}
                      </Badge>
                    </div>
                    <p className="tw-text-xs tw-text-muted-foreground tw-mb-2">{n.message}</p>
                    <p className="tw-text-xs tw-text-muted-foreground tw-opacity-75">{n.time}</p>
                  </div>
                ))}
                <Button variant="ghost" className="tw-w-full tw-text-sm">View All Notifications</Button>
              </CardContent>
            </CardRoot>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardStudent;
