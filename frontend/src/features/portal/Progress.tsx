import * as React from "react";
import PortalNavBar from "./PortalNavBar";

// Minimal inline icons to avoid external deps
const iconProps = "tw-w-5 tw-h-5";
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M2 4h7a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H2z" />
    <path d="M22 4h-7a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h7z" />
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
const AwardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
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
  <div className={`tw-p-8 ${className}`}>{children}</div>
);

const Badge: React.FC<React.PropsWithChildren<{ variant?: "default" | "secondary"; className?: string }>> = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground",
    secondary: "tw-bg-secondary tw-text-secondary-foreground",
  } as const;
  return <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${variants[variant]} ${className}`}>{children}</span>;
};

const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => (
  <div className={`tw-w-full tw-rounded-full tw-bg-muted ${className}`}>
    <div className="tw-h-full tw-bg-primary tw-rounded-full" style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: "100%" }} />
  </div>
);

const Progress: React.FC = () => {
  const overallProgress = 68;
  const theoryProgress = 85;
  const practicalProgress = 52;

  const milestones = [
    { id: 1, title: "Theory Classes", description: "Complete all theory lessons", progress: 17, total: 20, completed: true, icon: BookOpenIcon, color: "success" },
    { id: 2, title: "Driving Hours", description: "Complete required driving practice", progress: 24, total: 40, completed: false, icon: CarIcon, color: "primary" },
    { id: 3, title: "Theory Exam", description: "Pass the theoretical examination", progress: 0, total: 1, completed: false, icon: AwardIcon, color: "warning" },
    { id: 4, title: "Practical Exam", description: "Pass the practical driving test", progress: 0, total: 1, completed: false, icon: TargetIcon, color: "warning" },
  ];

  const recentAchievements = [
    { id: 1, title: "First Highway Drive", date: "2 days ago", description: "Successfully completed your first highway driving lesson", icon: "🛣️" },
    { id: 2, title: "Parallel Parking Master", date: "1 week ago", description: "Mastered parallel parking technique", icon: "🅿️" },
    { id: 3, title: "Night Driving", date: "2 weeks ago", description: "Completed your first night driving session", icon: "🌙" },
  ];

  const skillsProgress = [
    { skill: "Traffic Rules", progress: 95 },
    { skill: "Vehicle Control", progress: 70 },
    { skill: "Parking", progress: 85 },
    { skill: "Highway Driving", progress: 45 },
    { skill: "City Navigation", progress: 60 },
    { skill: "Emergency Procedures", progress: 30 },
  ];

  const getProgressTone = (value: number) => (value >= 80 ? "tw-text-success" : value >= 50 ? "tw-text-primary" : "tw-text-warning");
  const getMilestoneColor = (tone: string) => {
    switch (tone) {
      case "success":
        return "tw-bg-success tw-text-success-foreground";
      case "primary":
        return "tw-bg-primary tw-text-primary-foreground";
      case "warning":
        return "tw-bg-warning tw-text-warning-foreground";
      default:
        return "tw-bg-secondary tw-text-secondary-foreground";
    }
  };

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">
            Your Progress
          </h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
            Track your journey to becoming a licensed driver. Every lesson brings you closer to success! 🚗
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow tw-animate-fade-in-up">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-w-24 tw-h-24 tw-mx-auto tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-3xl tw-font-bold">{overallProgress}%</span>
              </div>
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-mb-2">Course Completion</h2>
                <p className="tw-opacity-90">You're doing great! Keep up the excellent work.</p>
              </div>
              <ProgressBar value={overallProgress} className="tw-h-3" />
              <p className="tw-text-sm tw-opacity-75">{Math.round((40 * overallProgress) / 100)} of 40 total lessons completed</p>
            </div>
          </CardContent>
        </Card>

        {/* Theory vs Practical */}
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-6">
          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card hover:tw-scale-105 tw-transition-transform">
            <CardHeader>
              <CardTitle className="tw-flex tw-items-center tw-gap-2">
                <BookOpenIcon className="tw-text-primary" />
                Theory Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="tw-space-y-4">
              <div className="tw-text-center">
                <div className={`tw-text-4xl tw-font-bold ${getProgressTone(theoryProgress)}`}>{theoryProgress}%</div>
                <p className="tw-text-sm tw-text-muted-foreground">Theory knowledge</p>
              </div>
              <ProgressBar value={theoryProgress} className="tw-h-2" />
              <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
                <div>
                  <p className="tw-text-muted-foreground">Lessons</p>
                  <p className="tw-font-semibold">17/20</p>
                </div>
                <div>
                  <p className="tw-text-muted-foreground">Tests Passed</p>
                  <p className="tw-font-semibold">15/17</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card hover:tw-scale-105 tw-transition-transform">
            <CardHeader>
              <CardTitle className="tw-flex tw-items-center tw-gap-2">
                <CarIcon className="tw-text-primary" />
                Practical Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="tw-space-y-4">
              <div className="tw-text-center">
                <div className={`tw-text-4xl tw-font-bold ${getProgressTone(practicalProgress)}`}>{practicalProgress}%</div>
                <p className="tw-text-sm tw-text-muted-foreground">Driving skills</p>
              </div>
              <ProgressBar value={practicalProgress} className="tw-h-2" />
              <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
                <div>
                  <p className="tw-text-muted-foreground">Hours</p>
                  <p className="tw-font-semibold">24/40</p>
                </div>
                <div>
                  <p className="tw-text-muted-foreground">Routes</p>
                  <p className="tw-font-semibold">8/12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle className="tw-flex tw-items-center tw-gap-2">
              <TargetIcon className="tw-text-primary" />
              Course Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-grid tw-gap-4">
              {milestones.map((m) => {
                const Icon = m.icon as any;
                const progressPct = (m.progress / m.total) * 100;
                return (
                  <div key={m.id} className="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20 hover:tw-bg-secondary/50 tw-transition-colors">
                    <div className={`tw-w-12 tw-h-12 tw-rounded-lg tw-flex tw-items-center tw-justify-center ${getMilestoneColor(m.color)}`}>
                      <Icon className="tw-w-6 tw-h-6" />
                    </div>
                    <div className="tw-flex-1 tw-space-y-2">
                      <div className="tw-flex tw-items-center tw-justify-between">
                        <h3 className="tw-font-semibold tw-text-foreground">{m.title}</h3>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          {m.completed && <CheckCircleIcon className="tw-w-4 tw-h-4 tw-text-success" />}
                          <Badge variant={m.completed ? "default" : "secondary"}>{m.progress}/{m.total}</Badge>
                        </div>
                      </div>
                      <p className="tw-text-sm tw-text-muted-foreground">{m.description}</p>
                      <ProgressBar value={progressPct} className="tw-h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle className="tw-flex tw-items-center tw-gap-2">
              <TrendingUpIcon className="tw-text-primary" />
              Skills Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-grid tw-gap-4">
              {skillsProgress.map((s, idx) => (
                <div key={idx} className="tw-space-y-2">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-font-medium tw-text-foreground">{s.skill}</span>
                    <span className={`tw-font-semibold ${getProgressTone(s.progress)}`}>{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} className="tw-h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader>
            <CardTitle className="tw-flex tw-items-center tw-gap-2">
              <AwardIcon className="tw-text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tw-space-y-4">
              {recentAchievements.map((a) => (
                <div key={a.id} className="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20 hover:tw-bg-secondary/50 tw-transition-colors">
                  <div className="tw-text-2xl">{a.icon}</div>
                  <div className="tw-flex-1">
                    <h3 className="tw-font-semibold tw-text-foreground">{a.title}</h3>
                    <p className="tw-text-sm tw-text-muted-foreground">{a.description}</p>
                    <p className="tw-text-xs tw-text-muted-foreground/75 tw-mt-1">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational */}
        <Card className="tw-bg-success tw-text-success-foreground tw-shadow-glow">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-text-4xl">🎯</div>
              <h3 className="tw-text-2xl tw-font-bold">You're Almost There!</h3>
              <p className="tw-opacity-90 tw-max-w-md tw-mx-auto">
                With {100 - overallProgress}% remaining, you're well on your way to getting your license. Keep practicing and stay focused!
              </p>
              <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-animate-bounce-gentle">
                Book Next Lesson
              </button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Progress;
