import * as React from "react";
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalNavBar from "./PortalNavBar";
import { studentRawFetch } from "../../api/httpClient";
import { iconXs, iconSm, iconMd } from "../../shared/constants/iconSizes";

// Minimal inline icons to avoid external deps (sizes applied at call sites)
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
const GraduationCapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M22 10l-10-5-10 5 10 5 10-5z" />
    <path d="M6 12v5a6 6 0 0 0 12 0v-5" />
  </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
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
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
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

  const lessons = useMemo(() => (data?.lessons ?? []), [data]);
  const scheduledClasses = useMemo(() => (data?.scheduled_classes ?? data?.scheduledclasses ?? []), [data]);
  const courses = useMemo(() => (data?.courses ?? []), [data]);
  const enrollments = useMemo(() => (data?.enrollments ?? []), [data]);
  const payments = useMemo(() => (data?.payments ?? []), [data]);

  // Build a map of unique courses tied to the student (from enrollments, lessons, payments)
  const studentCourseMap = useMemo(() => {
    const map = new Map<number, any>();
    enrollments.forEach((e:any) => { const c = e?.course; if (c?.id != null) map.set(c.id, c); });
    lessons.forEach((l:any) => { const c = l?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    payments.forEach((p:any) => { const c = p?.enrollment?.course; if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    // Fallback to any courses list if empty
    if (map.size === 0) {
      (courses || []).forEach((c:any) => { if (c?.id != null && !map.has(c.id)) map.set(c.id, c); });
    }
    return map;
  }, [enrollments, lessons, payments, courses]);
  
  // Aggregates for new requirements
  const stats = useMemo(() => {
    const enrollmentsCount = Array.isArray(enrollments) ? enrollments.length : 0;
    const completedLessons = lessons.filter((l:any) => (l?.status || '').toUpperCase() === 'COMPLETED').length;
    const completedScheduled = scheduledClasses.filter((sc:any) => (sc?.status || '').toUpperCase() === 'COMPLETED').length;
    const totalCompleted = completedLessons + completedScheduled;
    // Sum required lessons across all enrollments
    const totalRequired = (enrollments || []).reduce((sum:number, e:any) => sum + (Number(e?.course?.required_lessons) || 0), 0);

    // Remaining per enrollment based on type (THEORY uses scheduled classes; PRACTICE uses lessons)
    const completedByEnrollment: Record<number, number> = {};
    (enrollments || []).forEach((e:any) => {
      const eid = e?.id;
      const etype = (e?.type || '').toUpperCase();
      let completedForE = 0;
      if (etype === 'PRACTICE') {
        completedForE = lessons.filter((l:any) => (l?.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.id === eid || l?.enrollment_id === eid)).length;
      } else if (etype === 'THEORY') {
        // Best-effort: if scheduled classes present, count COMPLETED ones (no per-enrollment link available here)
        completedForE = scheduledClasses.filter((sc:any) => (sc?.status || '').toUpperCase() === 'COMPLETED').length;
      }
      completedByEnrollment[eid] = completedForE;
    });
    const totalRemaining = (enrollments || []).reduce((sum:number, e:any) => {
      const req = Number(e?.course?.required_lessons) || 0;
      const done = completedByEnrollment[e?.id] || 0;
      return sum + Math.max(0, req - done);
    }, 0);

    const percentage = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
    return { enrollmentsCount, totalCompleted, totalRequired, totalRemaining, percentage };
  }, [enrollments, lessons, scheduledClasses]);

  // Milestones/Achievements/Skills were removed per new spec; cleaning leftover data/functions to avoid unused or undefined refs.
  const getProgressTone = (value: number) => (value >= 80 ? "tw-text-success" : value >= 50 ? "tw-text-primary" : "tw-text-warning");

  if (loading) {
    return <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center"><span>{t('commonUI.loading')}</span></div>;
  }
  if (error) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-text-foreground tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <p className="tw-text-red-600 tw-font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Helpers for enrollment card
  const enrollmentProgress = (e:any) => {
    const etype = (e?.type || '').toUpperCase();
    const required = Number(e?.course?.required_lessons) || 0;
    let completed = 0;
    if (etype === 'PRACTICE') {
      completed = lessons.filter((l:any) => (l?.status || '').toUpperCase() === 'COMPLETED' && (l?.enrollment?.id === e?.id || l?.enrollment_id === e?.id)).length;
    } else if (etype === 'THEORY') {
      // Best-effort without per-enrollment linkage
      completed = scheduledClasses.filter((sc:any) => (sc?.status || '').toUpperCase() === 'COMPLETED').length;
    }
    const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
    return { completed, required, pct };
  };

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />

      {/* Top Stats Section (exact navbar container width) */}
      <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-6">
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
          {/* Card 1: Enrollments count */}
          <div className="tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-shadow-card tw-p-5 tw-min-w-[220px] tw-h-24">
            <div className="tw-h-full tw-flex tw-items-center tw-justify-start tw-gap-4">
              <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-muted tw-flex tw-items-center tw-justify-center">
                <GraduationCapIcon className="tw-w-5 tw-h-5 tw-text-primary" />
              </div>
              <div>
                <span className="tw-text-2xl tw-font-bold">{stats.enrollmentsCount}</span>
                <p className="tw-text-sm tw-text-muted-foreground">{t('portal.progress.stats.enrollments')}</p>
              </div>
            </div>
          </div>
          {/* Card 2: Completed lessons + scheduled classes */}
          <div className="tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-shadow-card tw-p-5 tw-min-w-[220px] tw-h-24">
            <div className="tw-h-full tw-flex tw-items-center tw-justify-start tw-gap-4">
              <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-muted tw-flex tw-items-center tw-justify-center">
                <AwardIcon className="tw-w-5 tw-h-5 tw-text-success" />
              </div>
              <div>
                <span className="tw-text-2xl tw-font-bold">{stats.totalCompleted}</span>
                <p className="tw-text-sm tw-text-muted-foreground">{t('portal.progress.stats.completed')}</p>
              </div>
            </div>
          </div>
          {/* Card 3: Total Hours (sum required lessons) */}
          <div className="tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-shadow-card tw-p-5 tw-min-w-[220px] tw-h-24">
            <div className="tw-h-full tw-flex tw-items-center tw-justify-start tw-gap-4">
              <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-muted tw-flex tw-items-center tw-justify-center">
                <ClockIcon className="tw-w-5 tw-h-5 tw-text-warning" />
              </div>
              <div>
                <span className="tw-text-2xl tw-font-bold">{stats.totalRequired}</span>
                <p className="tw-text-sm tw-text-muted-foreground">{t('portal.progress.stats.totalHours')}</p>
              </div>
            </div>
          </div>
          {/* Card 4: Remaining lessons */}
          <div className="tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-shadow-card tw-p-5 tw-min-w-[220px] tw-h-24">
            <div className="tw-h-full tw-flex tw-items-center tw-justify-start tw-gap-4">
              <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-muted tw-flex tw-items-center tw-justify-center">
                <BookOpenIcon className="tw-w-5 tw-h-5 tw-text-primary" />
              </div>
              <div>
                <span className="tw-text-2xl tw-font-bold">{stats.totalRemaining}</span>
                <p className="tw-text-sm tw-text-muted-foreground">{t('portal.progress.stats.remaining')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <Container className="tw-space-y-8">
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-8">
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-6">
              <div>
                <h2 className="tw-text-2xl tw-font-bold tw-mb-1">{t('portal.progress.overall.title')}</h2>
                <p className="tw-opacity-90">{t('portal.progress.overall.subtitle')}</p>
              </div>
              <div className="tw-relative tw-w-24 tw-h-24">
                <svg className="tw-w-full tw-h-full" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    className="tw-opacity-30"
                  />
                  
                  {/* Progress ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="100"
                    strokeDashoffset={100 - stats.percentage}
                    strokeLinecap="round"
                    className="tw-transition-all tw-duration-500"
                  />
                </svg>

                <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
                  <span className="tw-text-2xl tw-font-bold">{stats.percentage}%</span>
                </div>
              </div>

            </div>
            <div className="tw-mt-4">
              <ProgressBar value={stats.percentage} className="tw-h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Cards */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
          {(enrollments || []).map((e:any) => {
            const { completed, required, pct } = enrollmentProgress(e);
            const title = e?.course?.name || t('portal.booking.form.course');
            const status = (e?.status || '').toUpperCase();
            const statusLabel = t(`portal.progress.enrollment.status.${status}`, status);
            const statusColor = status === 'COMPLETED'
              ? 'tw-bg-success tw-text-success-foreground'
              : status === 'CANCELED'
                ? 'tw-bg-destructive tw-text-destructive-foreground'
                : 'tw-bg-warning tw-text-warning-foreground';
            return (
              <Card key={e.id} className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
                <CardHeader>
                  <CardTitle className="tw-flex tw-items-center tw-justify-between">
                    <span>{title}</span>
                    <Badge variant="secondary" className={statusColor}>{statusLabel}</Badge>
                  </CardTitle>
                  <div className="tw-mt-1 tw-text-sm tw-text-muted-foreground">
                    {t('portal.progress.enrollment.completed', { completed, required })}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="tw-flex tw-justify-end tw-mb-2">
                    <span className="tw-text-sm tw-font-semibold">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} className="tw-h-2" />
                  <div className="tw-flex tw-justify-end tw-mt-4">
                    <button className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium tw-transition-colors tw-bg-secondary tw-text-foreground hover:tw-bg-secondary/80" onClick={() => { /* no-op */ }}>
                      {t('portal.progress.enrollment.details')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA (Book a lesson) */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-8 tw-text-center">
            <div className="tw-space-y-4">
              <div className="tw-text-4xl">🎯</div>
              <h3 className="tw-text-2xl tw-font-bold">{t('portal.progress.motivational.title')}</h3>
              <p className="tw-opacity-90 tw-max-w-md tw-mx-auto">
                {t('portal.progress.motivational.body', { remaining: Math.max(0, 100 - (stats.percentage || 0)) })}
              </p>
              <button onClick={() => navigate('/book-lesson')} className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-11 tw-px-6 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-animate-bounce-gentle">
                {t('portal:dashboard.bookLesson')}
              </button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Progress;
