import * as React from "react";
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalNavBar from "./PortalNavBar";
import { studentRawFetch } from "../../api/httpClient";

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

// Nav bar moved to shared PortalNavBar

const DashboardStudent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('portal');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const token = localStorage.getItem('student_access_token');
      if (!token) { navigate('/login'); return; }
      try {
        const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
        if (resp.status === 401) {
          localStorage.removeItem('student_access_token');
          localStorage.removeItem('student_refresh_token');
          navigate('/login');
          return;
        }
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to fetch dashboard');
        if (mounted) {
          setData(body);
          // Persist minimal student profile for navbar initials
          if (body?.student) {
            localStorage.setItem('student_profile', JSON.stringify(body.student));
          }
        }
      } catch (e:any) {
        if (mounted) setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [navigate]);

  const lessons = useMemo(() => (data?.lessons ?? []), [data]);
  const courses = useMemo(() => (data?.courses ?? []), [data]);
  const payments = useMemo(() => (data?.payments ?? []), [data]);
  const enrollments = useMemo(() => (data?.enrollments ?? []), [data]);

  // Determine the active course the student is enrolled in
  const activeCourse = useMemo(() => {
    if (!courses?.length) return null;
    if (courses.length === 1) return courses[0];
    const lessonCourseIds = new Set(
      lessons.map((l:any) => l?.enrollment?.course?.id).filter((id:any) => id != null)
    );
    const paymentCourseIds = new Set(
      payments.map((p:any) => p?.enrollment?.course?.id).filter((id:any) => id != null)
    );
    const match = courses.find((c:any) => lessonCourseIds.has(c.id) || paymentCourseIds.has(c.id));
    return match || courses[0];
  }, [courses, lessons, payments]);

  const lessonsForCourse = useMemo(() => {
    if (!activeCourse) return [] as any[];
    return lessons.filter((l:any) => l?.enrollment?.course?.id === activeCourse.id);
  }, [lessons, activeCourse]);

  const allUpcomingLessons = useMemo(() => {
    // Show ALL upcoming lessons across all enrollments/courses
    const scheduled = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'SCHEDULED');
    return scheduled
      .slice()
      .sort((a:any,b:any) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
      .map((l:any) => ({
        id: l.id,
        type: (l.enrollment?.course?.type || '').toUpperCase() === 'THEORY' ? 'Theory' : 'Driving',
        instructor: l.instructor ? `${l.instructor.first_name} ${l.instructor.last_name}` : '—',
        date: new Date(l.scheduled_time).toLocaleDateString(),
        time: new Date(l.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicle: l.resource?.license_plate || (l.enrollment?.course?.name || '—')
      }));
  }, [lessons]);

  // Next upcoming lesson (first item after sorting)
  const nextUpcomingLesson = allUpcomingLessons[0] || null;

  // Build a map of unique courses the student is actually tied to via lessons/payments
  const studentCourseMap = useMemo(() => {
    const map = new Map<number, any>();
    // Prefer true enrollments for accuracy
    enrollments.forEach((e:any) => { const c = e?.course; if (c?.id != null) map.set(c.id, c); });
    // Fallback: include courses referenced by lessons/payments if not captured via enrollments
    lessons.forEach((l:any) => { const c = l?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    payments.forEach((p:any) => { const c = p?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    return map;
  }, [enrollments, lessons, payments]);

  // Aggregate totals across all student's courses
  const { requiredAll, completedAll, percentAll } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values());
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredAll: required, completedAll: completed, percentAll: pct } as any;
  }, [studentCourseMap, lessons]) as { requiredAll: number, completedAll: number, percentAll: number };

  // Practice-only aggregation
  const { requiredPractice, completedPractice, percentPractice } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values()).filter((c:any) => (c?.type || '').toUpperCase() === 'PRACTICE');
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.course?.type || '').toUpperCase() === 'PRACTICE').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredPractice: required, completedPractice: completed, percentPractice: pct } as any;
  }, [studentCourseMap, lessons]) as { requiredPractice: number, completedPractice: number, percentPractice: number };

  // Theory-only aggregation (for Theory | Practice overview card)
  const { requiredTheory, completedTheory, percentTheory } = useMemo(() => {
    const courseList = Array.from(studentCourseMap.values()).filter((c:any) => (c?.type || '').toUpperCase() === 'THEORY');
    const required = courseList.reduce((sum:number, c:any) => sum + (Number(c?.required_lessons) || 0), 0);
    const completed = lessons.filter((l:any) => (l.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.course?.type || '').toUpperCase() === 'THEORY').length;
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { requiredTheory: required, completedTheory: completed, percentTheory: pct } as any;
  }, [studentCourseMap, lessons]) as { requiredTheory: number, completedTheory: number, percentTheory: number };

  // Upcoming list now shows all by default across all courses

  const studentFirstName = data?.student?.first_name || 'Student';
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  if (loading) {
    return <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center"><span>{t('commonUI.loading')}</span></div>;
  }
  if (error) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <p className="tw-text-red-600 tw-font-medium">{error}</p>
          <a className="tw-text-primary tw-underline" href="/login">{t('commonUI.goToLogin')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
  <Container className="tw-space-y-8 tw-pb-10">
        <div className="tw-relative tw-overflow-hidden tw-rounded-2xl tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow tw-animate-fade-in">
          <div className="tw-absolute tw-inset-0 tw-bg-black/20" />
          <div className="tw-relative tw-z-10 tw-p-8 md:tw-p-12 tw-text-center">
            <div className="tw-space-y-6">
              <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-white/20 tw-rounded-full tw-text-sm tw-font-medium">
                <div className="tw-w-2 tw-h-2 tw-bg-white tw-rounded-full tw-animate-pulse" />
                {t('dashboard.badge')}
              </div>
              <h1 className="tw-text-4xl md:tw-text-6xl tw-font-bold">{t('dashboard.welcome', { name: studentFirstName })}</h1>
              <p className="tw-text-xl md:tw-text-2xl tw-opacity-90 tw-max-w-3xl tw-mx-auto">
                {t('dashboard.subline')}
              </p>
              {/* Next upcoming lesson details replace the buttons */}
              <div className="tw-max-w-xl tw-mx-auto tw-w-full">
                <div className="tw-bg-white/15 tw-rounded-xl tw-backdrop-blur-sm tw-border tw-border-white/20 tw-p-4 tw-text-left">
                  <div className="tw-text-sm tw-opacity-80 tw-mb-1">{t('dashboard.nextLesson')}</div>
                  {nextUpcomingLesson ? (
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
                      <div>
                        <div className="tw-text-lg tw-font-semibold">{nextUpcomingLesson.type} {t('commonUI.with')} {nextUpcomingLesson.instructor}</div>
                        <div className="tw-text-sm tw-opacity-90">{nextUpcomingLesson.date} at {nextUpcomingLesson.time}</div>
                      </div>
                      <a href="/lessons" className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">{t('dashboard.viewAll')}</a>
                    </div>
                  ) : (
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
                      <div className="tw-text-sm">{t('dashboard.noUpcoming')}</div>
                      <a href="/book-lesson" className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90">{t('dashboard.bookLesson')}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="tw-absolute tw-top-4 tw-right-4 tw-w-32 tw-h-32 tw-bg-white/10 tw-rounded-full tw-blur-xl" />
          <div className="tw-absolute tw-bottom-4 tw-left-4 tw-w-24 tw-h-24 tw-bg-white/5 tw-rounded-full tw-blur-lg" />
        </div>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-animate-fade-in-up">
          {/* 1. Book a Lesson action */}
          <CardRoot>
            <CardContent className="tw-flex tw-flex-col tw-items-start tw-justify-center tw-h-full">
              <div className="tw-text-sm tw-text-muted-foreground">{t('dashboard.actions')}</div>
              <div className="tw-mt-1 tw-text-2xl tw-font-semibold">{t('dashboard.bookLessonCard')}</div>
              <div className="tw-text-xs tw-text-muted-foreground tw-mt-1">{t('dashboard.bookLessonHint')}</div>
              <Button className="tw-mt-3" variant="primary" onClick={() => navigate('/book-lesson')}>{t('dashboard.bookLessonCard')}</Button>
            </CardContent>
          </CardRoot>
          {/* 2. Course Progress */}
          <StatCard
            title={t('dashboard.courseProgress')}
            value={`${percentAll}%`}
            description={t('progress.courseCompletion.completedOf', { completed: completedAll, required: requiredAll || 0 })}
            trend={{ value: "", isPositive: true }}
          />
          {/* 3. Lessons Completed (practice) */}
          <StatCard
            title={t('dashboard.lessonsCompleted')}
            value={`${completedPractice}/${requiredPractice || 0}`}
            description={t('dashboard.left', { count: Math.max((requiredPractice - completedPractice), 0) })}
            trend={{ value: "", isPositive: true }}
          />
          {/* 4. Theory Practice card */}
          <CardRoot>
            <CardContent className="tw-flex tw-flex-col tw-items-start tw-justify-center tw-h-full">
              <div className="tw-text-sm tw-text-muted-foreground">{t('dashboard.actions')}</div>
              <div className="tw-mt-1 tw-text-2xl tw-font-semibold">{t('dashboard.theoryPractice')}</div>
              <div className="tw-text-xs tw-text-muted-foreground tw-mt-1">{t('dashboard.openPracticeHint')}</div>
              <Button className="tw-mt-3" variant="primary" onClick={() => navigate('/practice')}>{t('dashboard.goToPractice')}</Button>
            </CardContent>
          </CardRoot>
        </div>

        <div className="tw-grid lg:tw-grid-cols-3 tw-gap-8">
          <div className="lg:tw-col-span-2 tw-space-y-6">
            <CardRoot className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-primary"></span>
                  {t('dashboard.upcomingLessons')}
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-4">
                {allUpcomingLessons.length === 0 && (
                  <div className="tw-text-sm tw-text-muted-foreground">{t('dashboard.noUpcoming')}</div>
                )}
                {(showAllUpcoming ? allUpcomingLessons : allUpcomingLessons.slice(0, 1)).map((lesson: any) => (
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
                        <p className="tw-text-sm tw-text-muted-foreground">{t('commonUI.with')} {lesson.instructor}</p>
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
                {allUpcomingLessons.length > 1 && (
                  <div className="tw-flex tw-justify-center">
                    <Button variant="outline" size="sm" onClick={() => setShowAllUpcoming((v) => !v)}>
                      {showAllUpcoming ? t('commonUI.showLess') : t('dashboard.viewAll')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </CardRoot>

            {/* Quick Actions removed per requirements */}
          </div>

          <div className="tw-space-y-6">
            <CardRoot className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
              <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-w-5 tw-h-5 tw-rounded-sm tw-bg-primary"></span>
                  {t('dashboard.notifications')}
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-space-y-4">
                <div className="tw-text-sm tw-text-muted-foreground">{t('dashboard.noNotifications')}</div>
                <Button variant="ghost" className="tw-w-full tw-text-sm">{t('dashboard.viewAllNotifications')}</Button>
              </CardContent>
            </CardRoot>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardStudent;
