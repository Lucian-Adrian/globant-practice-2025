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
  // Mock lessons data - similar to Lessons.tsx but extended for progress calculation
  const lessons = [
    { id: 1, type: "Driving", instructor: "Maria Popescu", date: "2025-09-25", time: "14:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "confirmed", location: "Starting Point: School Parking" },
    { id: 2, type: "Theory", instructor: "Ion Vasilescu", date: "2025-09-26", time: "10:00", duration: "1 hour", vehicle: "Classroom A", status: "confirmed", location: "Main Building, Floor 2" },
    { id: 3, type: "Driving", instructor: "Ana Ionescu", date: "2025-09-20", time: "16:00", duration: "2 hours", vehicle: "Ford Focus - B456ABC", status: "completed", location: "City Center Route" },
    { id: 4, type: "Theory", instructor: "Ion Vasilescu", date: "2025-09-18", time: "09:00", duration: "1 hour", vehicle: "Classroom B", status: "missed", location: "Main Building, Floor 1" },
    { id: 5, type: "Driving", instructor: "Maria Popescu", date: "2025-09-28", time: "11:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "pending", location: "Highway Practice Route" },
    { id: 6, type: "Theory", instructor: "George Marinescu", date: "2025-09-23", time: "15:30", duration: "1 hour", vehicle: "Classroom C", status: "confirmed", location: "Main Building, Floor 3" },
    { id: 7, type: "Driving", instructor: "Elena Georgescu", date: "2025-09-24", time: "09:00", duration: "2 hours", vehicle: "VW Golf - B789DEF", status: "confirmed", location: "Parking Practice Area" },
    { id: 8, type: "Theory", instructor: "Ion Vasilescu", date: "2025-09-30", time: "14:00", duration: "1 hour", vehicle: "Classroom A", status: "pending", location: "Main Building, Floor 2" },
    // Additional completed lessons for better progress calculation
    { id: 9, type: "Theory", instructor: "Ion Vasilescu", date: "2025-09-10", time: "10:00", duration: "1 hour", vehicle: "Classroom A", status: "completed", location: "Main Building, Floor 2" },
    { id: 10, type: "Theory", instructor: "George Marinescu", date: "2025-09-12", time: "14:00", duration: "1 hour", vehicle: "Classroom B", status: "completed", location: "Main Building, Floor 1" },
    { id: 11, type: "Driving", instructor: "Maria Popescu", date: "2025-09-15", time: "11:00", duration: "2 hours", vehicle: "Dacia Logan - B123XYZ", status: "completed", location: "City Practice Route" },
    { id: 12, type: "Theory", instructor: "Ion Vasilescu", date: "2025-09-08", time: "09:00", duration: "1 hour", vehicle: "Classroom C", status: "completed", location: "Main Building, Floor 3" },
    { id: 13, type: "Driving", instructor: "Ana Ionescu", date: "2025-09-14", time: "16:00", duration: "2 hours", vehicle: "Ford Focus - B456ABC", status: "completed", location: "Highway Practice" },
    { id: 14, type: "Theory", instructor: "George Marinescu", date: "2025-09-05", time: "15:00", duration: "1 hour", vehicle: "Classroom A", status: "completed", location: "Main Building, Floor 2" },
    { id: 15, type: "Driving", instructor: "Elena Georgescu", date: "2025-09-16", time: "10:00", duration: "2 hours", vehicle: "VW Golf - B789DEF", status: "completed", location: "Parking Practice" },
  ];

  // Course requirements (Romanian driving school standards)
  const courseRequirements = {
    theory: {
      required: 30, // Required theory lessons
      examRequired: true
    },
    driving: {
      required: 30, // Required driving hours (15 lessons x 2 hours each)
      examRequired: true
    }
  };

  // Dynamic calculations
  const calculateLessonStats = () => {
    const theoryLessons = lessons.filter(l => l.type === "Theory");
    const drivingLessons = lessons.filter(l => l.type === "Driving");
    
    const completedTheory = theoryLessons.filter(l => l.status === "completed").length;
    const completedDriving = drivingLessons.filter(l => l.status === "completed").length;
    
    const totalTheory = theoryLessons.length;
    const totalDriving = drivingLessons.length;
    
    // Calculate driving hours (assuming each driving lesson is 2 hours)
    const completedDrivingHours = completedDriving * 2;
    const totalDrivingHours = totalDriving * 2;
    
    return {
      theory: {
        completed: completedTheory,
        total: totalTheory,
        required: courseRequirements.theory.required,
        percentage: Math.round((completedTheory / courseRequirements.theory.required) * 100)
      },
      driving: {
        completed: completedDriving,
        total: totalDriving,
        hours: {
          completed: completedDrivingHours,
          total: totalDrivingHours,
          required: courseRequirements.driving.required
        },
        percentage: Math.round((completedDrivingHours / courseRequirements.driving.required) * 100)
      }
    };
  };

  const getNextLesson = () => {
    const now = new Date();
    const upcomingLessons = lessons
      .filter(l => l.status === "confirmed" || l.status === "pending")
      .filter(l => new Date(l.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingLessons[0] || null;
  };

  const generateRecentAchievements = () => {
    const recentCompleted = lessons
      .filter(l => l.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    return recentCompleted.map((lesson, index) => {
      const daysDiff = Math.floor((new Date().getTime() - new Date(lesson.date).getTime()) / (1000 * 60 * 60 * 24));
      const timeAgo = daysDiff === 0 ? "Today" : daysDiff === 1 ? "1 day ago" : `${daysDiff} days ago`;
      
      return {
        id: lesson.id,
        title: `${lesson.type} Lesson Completed`,
        date: timeAgo,
        description: `Successfully completed ${lesson.type.toLowerCase()} lesson with ${lesson.instructor}`,
        icon: lesson.type === "Driving" ? "🚗" : "📚"
      };
    });
  };

  // Calculate all stats
  const stats = calculateLessonStats();
  const nextLesson = getNextLesson();
  
  // Dynamic progress values
  const theoryProgress = Math.min(stats.theory.percentage, 100);
  const practicalProgress = Math.min(stats.driving.percentage, 100);
  const overallProgress = Math.round(((stats.theory.completed + stats.driving.hours.completed) / (courseRequirements.theory.required + courseRequirements.driving.required)) * 100);

  // Dynamic milestones
  const milestones = [
    { 
      id: 1, 
      title: "Theory Classes", 
      description: "Complete all required theory lessons", 
      progress: stats.theory.completed, 
      total: courseRequirements.theory.required, 
      completed: stats.theory.completed >= courseRequirements.theory.required, 
      icon: BookOpenIcon, 
      color: stats.theory.completed >= courseRequirements.theory.required ? "success" : "primary" 
    },
    { 
      id: 2, 
      title: "Driving Hours", 
      description: "Complete required driving practice hours", 
      progress: stats.driving.hours.completed, 
      total: courseRequirements.driving.required, 
      completed: stats.driving.hours.completed >= courseRequirements.driving.required, 
      icon: CarIcon, 
      color: stats.driving.hours.completed >= courseRequirements.driving.required ? "success" : "primary" 
    },
    { 
      id: 3, 
      title: "Theory Exam", 
      description: "Pass the theoretical examination", 
      progress: stats.theory.completed >= courseRequirements.theory.required ? 1 : 0, 
      total: 1, 
      completed: false, // Would need exam data to determine
      icon: AwardIcon, 
      color: stats.theory.completed >= courseRequirements.theory.required ? "primary" : "warning" 
    },
    { 
      id: 4, 
      title: "Practical Exam", 
      description: "Pass the practical driving test", 
      progress: stats.driving.hours.completed >= courseRequirements.driving.required ? 1 : 0, 
      total: 1, 
      completed: false, // Would need exam data to determine
      icon: TargetIcon, 
      color: stats.driving.hours.completed >= courseRequirements.driving.required ? "primary" : "warning" 
    },
  ];

  const recentAchievements = generateRecentAchievements();

  // Dynamic skills progress based on lesson types and completion
  const skillsProgress = [
    { skill: "Traffic Rules (Theory)", progress: Math.min(Math.round((stats.theory.completed / courseRequirements.theory.required) * 100), 100) },
    { skill: "Vehicle Control", progress: Math.min(Math.round((stats.driving.hours.completed / courseRequirements.driving.required) * 100), 100) },
    { skill: "Parking & Maneuvering", progress: Math.min(Math.round((stats.driving.completed / (courseRequirements.driving.required / 2)) * 100), 100) },
    { skill: "Highway Driving", progress: Math.min(Math.round((stats.driving.completed / (courseRequirements.driving.required / 2)) * 80), 100) }, // Slightly lower as it's advanced
    { skill: "City Navigation", progress: Math.min(Math.round((stats.driving.completed / (courseRequirements.driving.required / 2)) * 90), 100) },
    { skill: "Emergency Procedures", progress: Math.min(Math.round(((stats.theory.completed + stats.driving.completed) / ((courseRequirements.theory.required + courseRequirements.driving.required) / 2)) * 60), 100) },
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
              <p className="tw-text-sm tw-opacity-75">
                {stats.theory.completed + stats.driving.hours.completed} of {courseRequirements.theory.required + courseRequirements.driving.required} total lessons/hours completed
              </p>
              {nextLesson && (
                <div className="tw-mt-4 tw-p-3 tw-bg-white/10 tw-rounded-lg">
                  <p className="tw-text-sm tw-opacity-90">
                    <strong>Next Lesson:</strong> {nextLesson.type} with {nextLesson.instructor}
                  </p>
                  <p className="tw-text-xs tw-opacity-75">
                    {new Date(nextLesson.date).toLocaleDateString('ro-RO', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {nextLesson.time}
                  </p>
                </div>
              )}
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
                  <p className="tw-text-muted-foreground">Completed</p>
                  <p className="tw-font-semibold">{stats.theory.completed}/{courseRequirements.theory.required}</p>
                </div>
                <div>
                  <p className="tw-text-muted-foreground">Scheduled</p>
                  <p className="tw-font-semibold">{stats.theory.total - stats.theory.completed} more</p>
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
                  <p className="tw-font-semibold">{stats.driving.hours.completed}/{courseRequirements.driving.required}</p>
                </div>
                <div>
                  <p className="tw-text-muted-foreground">Lessons</p>
                  <p className="tw-font-semibold">{stats.driving.completed}/{Math.ceil(courseRequirements.driving.required / 2)}</p>
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
              <h3 className="tw-text-2xl tw-font-bold">
                {overallProgress >= 80 ? "You're Almost There!" : overallProgress >= 50 ? "Great Progress!" : "Keep Going!"}
              </h3>
              <p className="tw-opacity-90 tw-max-w-md tw-mx-auto">
                {overallProgress >= 80 
                  ? `With only ${100 - overallProgress}% remaining, you're well on your way to getting your license!`
                  : overallProgress >= 50
                  ? `You've completed ${overallProgress}% of your course. Keep up the excellent work!`
                  : `You're ${overallProgress}% through your course. Every lesson brings you closer to success!`
                }
              </p>
              {nextLesson ? (
                <div className="tw-space-y-2">
                  <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-animate-bounce-gentle">
                    Next: {nextLesson.type} on {new Date(nextLesson.date).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })}
                  </button>
                  <p className="tw-text-xs tw-opacity-75">
                    {nextLesson.time} with {nextLesson.instructor}
                  </p>
                </div>
              ) : (
                <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-animate-bounce-gentle">
                  Book Next Lesson
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Progress;
