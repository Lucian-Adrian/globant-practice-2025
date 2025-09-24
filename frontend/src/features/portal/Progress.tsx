import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalNavBar from "./PortalNavBar";
import { studentRawFetch } from "../../api/httpClient";
import { iconXs, iconSm, iconMd } from "../../shared/constants/iconSizes";

// Minimal inline icons (unchanged)
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M2 4h7a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H2z" />
        <path d="M22 4h-7a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h7z" />
    </svg>
);
const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
        <path d="M5 16h14" />
        <circle cx="7" cy="16" r="2" />
        <circle cx="17" cy="16" r="2" />
    </svg>
);
const AwardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

// Reusable UI Components (unchanged)
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
  const navigate = useNavigate();
  // State and data fetching from 'dev' version
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
        if (resp.status === 401) { window.location.href = '/login'; return; }
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to load progress');
        if (mounted) setData(body);
      } catch (e:any) {
        if (mounted) setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  // Memoized data processing from 'dev' version
  const lessons = useMemo(() => (data?.lessons ?? []), [data]);
  const courses = useMemo(() => (data?.courses ?? []), [data]);
  const enrollments = useMemo(() => (data?.enrollments ?? []), [data]);
  const payments = useMemo(() => (data?.payments ?? []), [data]);

  const studentCourseMap = useMemo(() => {
    const map = new Map<number, any>();
    enrollments.forEach((e:any) => { const c = e?.course; if (c?.id != null) map.set(c.id, c); });
    lessons.forEach((l:any) => { const c = l?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    payments.forEach((p:any) => { const c = p?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    if (map.size === 0) {
      (courses || []).forEach((c:any) => { if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    }
    return map;
  }, [enrollments, lessons, payments, courses]);

  const { requiredAll, completedAll, percentAll } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values());
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredAll: required, completedAll: completed, percentAll: pct };
  }, [studentCourseMap, lessons]);

  const { requiredTheory, completedTheory, percentTheory } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values()).filter((c:any) => (c?.type || '').toUpperCase() === 'THEORY');
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.course?.type || '').toUpperCase() === 'THEORY').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredTheory: required, completedTheory: completed, percentTheory: pct };
  }, [studentCourseMap, lessons]);

  const { requiredPractice, completedPractice, percentPractice } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values()).filter((c:any) => (c?.type || '').toUpperCase() === 'PRACTICE');
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.course?.type || '').toUpperCase() === 'PRACTICE').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredPractice: required, completedPractice: completed, percentPractice: pct };
  }, [studentCourseMap, lessons]);

  // Merged: 'getNextLesson' from 'gabi', adapted for real data
  const nextLesson = useMemo(() => {
    const now = new Date();
    const upcoming = lessons
      .filter((l: any) => (l.status || '').toUpperCase() === "SCHEDULED" && new Date(l.scheduled_time) > now)
      .sort((a: any, b: any) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
    return upcoming[0] || null;
  }, [lessons]);

  // Merged: 'generateRecentAchievements' from 'gabi', adapted for real data
  const recentAchievements = useMemo(() => {
    return lessons
      .filter((l: any) => (l.status || '').toUpperCase() === "COMPLETED")
      .sort((a: any, b: any) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
      .slice(0, 3)
      .map((lesson: any) => {
        const lessonDate = new Date(lesson.scheduled_time);
        const daysDiff = Math.floor((new Date().getTime() - lessonDate.getTime()) / (1000 * 60 * 60 * 24));
        const timeAgo = daysDiff === 0 ? "Today" : daysDiff === 1 ? "1 day ago" : `${daysDiff} days ago`;
        const type = (lesson?.enrollment?.course?.type || '').toUpperCase() === 'THEORY' ? 'Theory' : 'Driving';

        return {
          id: lesson.id,
          title: `${type} Lesson Completed`,
          date: timeAgo,
          description: `With ${lesson.instructor?.first_name || 'instructor'}`,
          icon: type === "Driving" ? "🚗" : "📚"
        };
      });
  }, [lessons]);

  // Milestones from 'dev' version (already uses real data)
  const milestones = [
    { id: 1, title: "Theory Classes", description: "Complete all theory lessons", progress: completedTheory, total: requiredTheory || 0, completed: (requiredTheory || 0) > 0 && completedTheory >= (requiredTheory || 0), icon: BookOpenIcon, color: "success" },
    { id: 2, title: "Driving Hours", description: "Complete required driving practice", progress: completedPractice, total: requiredPractice || 0, completed: (requiredPractice || 0) > 0 && completedPractice >= (requiredPractice || 0), icon: CarIcon, color: "primary" },
    { id: 3, title: "Theory Exam", description: "Pass the theoretical examination", progress: 0, total: 1, completed: false, icon: AwardIcon, color: "warning" },
    { id: 4, title: "Practical Exam", description: "Pass the practical driving test", progress: 0, total: 1, completed: false, icon: TargetIcon, color: "warning" },
  ];
  
  // Helper functions for styling from 'gabi'
  const getProgressTone = (value: number) => (value >= 80 ? "tw-text-success" : value >= 50 ? "tw-text-primary" : "tw-text-warning");
  const getMilestoneColor = (tone: string) => {
      switch (tone) {
          case "success": return "tw-bg-success tw-text-success-foreground";
          case "primary": return "tw-bg-primary tw-text-primary-foreground";
          case "warning": return "tw-bg-warning tw-text-warning-foreground";
          default: return "tw-bg-secondary tw-text-secondary-foreground";
      }
  };

  if (loading) {
    return <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center"><span>Loading…</span></div>;
  }
  if (error) {
    return (
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center">
            <div className="tw-text-center"><p className="tw-text-red-600 tw-font-medium">{error}</p></div>
        </div>
    );
  }

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

        {/* Overall Progress Card (Merged) */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow tw-animate-fade-in-up">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-w-24 tw-h-24 tw-mx-auto tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <span className="tw-text-3xl tw-font-bold">{percentAll}%</span>
              </div>
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-mb-2">Course Completion</h2>
                <p className="tw-opacity-90">You're doing great! Keep up the excellent work.</p>
              </div>
              <ProgressBar value={percentAll} className="tw-h-3" />
              <p className="tw-text-sm tw-opacity-75">{completedAll} of {requiredAll || 0} total lessons completed</p>
              
              {/* Merged: Next Lesson info from 'gabi' */}
              {nextLesson && (
                <div className="tw-mt-4 tw-p-3 tw-bg-white/10 tw-rounded-lg">
                  <p className="tw-text-sm tw-opacity-90">
                    <strong>Next Lesson:</strong> {((nextLesson.enrollment?.course?.type || '').toUpperCase() === 'THEORY' ? 'Theory' : 'Driving')} with {nextLesson.instructor.first_name}
                  </p>
                  <p className="tw-text-xs tw-opacity-75">
                    {new Date(nextLesson.scheduled_time).toLocaleDateString('ro-RO', { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(nextLesson.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Theory vs Practical */}
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-6">
          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card hover:tw-scale-105 tw-transition-transform">
            <CardHeader><CardTitle className="tw-flex tw-items-center tw-gap-2"><BookOpenIcon className={`${iconSm} tw-text-primary`} />Theory Progress</CardTitle></CardHeader>
            <CardContent className="tw-space-y-4">
              <div className="tw-text-center">
                <div className={`tw-text-4xl tw-font-bold ${getProgressTone(percentTheory)}`}>{percentTheory}%</div>
                <p className="tw-text-sm tw-text-muted-foreground">Theory knowledge</p>
              </div>
              <ProgressBar value={percentTheory} className="tw-h-2" />
              <div className="tw-grid tw-grid-cols-1 tw-gap-2 tw-text-sm">
                <div>
                  <p className="tw-text-muted-foreground">Lessons</p>
                  <p className="tw-font-semibold">{completedTheory}/{requiredTheory || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card hover:tw-scale-105 tw-transition-transform">
            <CardHeader><CardTitle className="tw-flex tw-items-center tw-gap-2"><CarIcon className={`${iconSm} tw-text-primary`} />Practical Progress</CardTitle></CardHeader>
            <CardContent className="tw-space-y-4">
              <div className="tw-text-center">
                <div className={`tw-text-4xl tw-font-bold ${getProgressTone(percentPractice)}`}>{percentPractice}%</div>
                <p className="tw-text-sm tw-text-muted-foreground">Driving skills</p>
              </div>
              <ProgressBar value={percentPractice} className="tw-h-2" />
              <div className="tw-grid tw-grid-cols-1 tw-gap-2 tw-text-sm">
                <div>
                  <p className="tw-text-muted-foreground">Lessons</p>
                  <p className="tw-font-semibold">{completedPractice}/{requiredPractice || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Milestones */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader><CardTitle className="tw-flex tw-items-center tw-gap-2"><TargetIcon className={`${iconSm} tw-text-primary`} />Course Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="tw-grid tw-gap-4">
              {milestones.map((m) => {
                const Icon = m.icon as any;
                const progressPct = m.total > 0 ? (m.progress / m.total) * 100 : 0;
                return (
                  <div key={m.id} className="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20 hover:tw-bg-secondary/50 tw-transition-colors">
                    <div className={`tw-w-12 tw-h-12 tw-rounded-lg tw-flex tw-items-center tw-justify-center ${getMilestoneColor(m.completed ? 'success' : m.color)}`}>
                      <Icon className={iconMd} />
                    </div>
                    <div className="tw-flex-1 tw-space-y-2">
                      <div className="tw-flex tw-items-center tw-justify-between">
                        <h3 className="tw-font-semibold tw-text-foreground">{m.title}</h3>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          {m.completed && <CheckCircleIcon className={`${iconXs} tw-text-success`} />}
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

        {/* Recent Achievements (Merged from 'gabi') */}
        <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
          <CardHeader><CardTitle className="tw-flex tw-items-center tw-gap-2"><AwardIcon className={`${iconSm} tw-text-primary`} />Recent Achievements</CardTitle></CardHeader>
          <CardContent>
            <div className="tw-space-y-4">
              {recentAchievements.length > 0 ? recentAchievements.map((a) => (
                <div key={a.id} className="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-secondary/30 tw-rounded-lg tw-border tw-border-border/20 hover:tw-bg-secondary/50 tw-transition-colors">
                  <div className="tw-text-2xl">{a.icon}</div>
                  <div className="tw-flex-1">
                    <h3 className="tw-font-semibold tw-text-foreground">{a.title}</h3>
                    <p className="tw-text-sm tw-text-muted-foreground">{a.description}</p>
                    <p className="tw-text-xs tw-text-muted-foreground/75 tw-mt-1">{a.date}</p>
                  </div>
                </div>
              )) : (
                <p className="tw-text-sm tw-text-muted-foreground tw-text-center">No completed lessons yet. Finish a lesson to see your achievements here!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Card (Merged) */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-text-4xl">🎯</div>
              <h3 className="tw-text-2xl tw-font-bold">
                {percentAll >= 80 ? "You're Almost There!" : percentAll >= 50 ? "Great Progress!" : "Keep Going!"}
              </h3>
              <p className="tw-opacity-90 tw-max-w-md tw-mx-auto">
                {percentAll >= 80 
                  ? `With only ${100 - percentAll}% remaining, you're well on your way to getting your license!`
                  : percentAll >= 50
                  ? `You've completed ${percentAll}% of your course. Keep up the excellent work!`
                  : `You're ${percentAll}% through your course. Every lesson brings you closer to success!`
                }
              </p>
              <button onClick={() => navigate('/lessons')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-animate-bounce-gentle">
                {nextLesson ? `Next: ${((nextLesson.enrollment?.course?.type || '').toUpperCase() === 'THEORY' ? 'Theory' : 'Driving')} on ${new Date(nextLesson.scheduled_time).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })}` : "Book Next Lesson"}
              </button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Progress;