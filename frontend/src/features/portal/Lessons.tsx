import * as React from "react";
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PortalNavBar from "./PortalNavBar";
import { studentRawFetch } from "../../api/httpClient";

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
  const navigate = useNavigate();
  const { t } = useTranslation('portal');
  const [searchParams] = useSearchParams();
  const initialFilterParam = (searchParams.get('filter') || 'all').toLowerCase();
  // Map URL param to internal state values
  const mapParamToFilter = (p: string) => {
    if (p === 'upcoming') return 'scheduled';
    if (["all","scheduled","completed","canceled"].includes(p)) return p;
    return 'all';
  };
  const [selectedFilter, setSelectedFilter] = useState(mapParamToFilter(initialFilterParam));
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Keep filter in sync if URL query changes while on page
  React.useEffect(() => {
    const p = (searchParams.get('filter') || 'all').toLowerCase();
    setSelectedFilter(mapParamToFilter(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
        if (resp.status === 401) {
          navigate('/login');
          return;
        }
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to load lessons');
        if (mounted) {
          setLessons(Array.isArray(body?.lessons) ? body.lessons : []);
          setClasses(Array.isArray(body?.scheduled_classes) ? body.scheduled_classes : []);
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

  const getStatusBadge = (statusRaw: string) => {
    const status = (statusRaw || '').toUpperCase();
    switch (status) {
      case "SCHEDULED":
        return <Badge className="tw-bg-success tw-text-success-foreground">{t('lessons.statusBadge.upcoming')}</Badge>;
      case "COMPLETED":
        return <Badge className="tw-bg-primary tw-text-primary-foreground">{t('lessons.statusBadge.completed')}</Badge>;
      default: {
        // Treat any cancel(led) as missed
        if (status.includes('CANCEL')) return <Badge variant="destructive">{t('lessons.statusBadge.missed')}</Badge>;
        return <Badge variant="outline">{statusRaw}</Badge>;
      }
    }
  };

  const getStatusIcon = (statusRaw: string) => {
    const status = (statusRaw || '').toUpperCase();
    if (status === 'SCHEDULED') return <CheckCircleIcon className="tw-text-success" />;
    if (status === 'COMPLETED') return <CheckCircleIcon className="tw-text-primary" />;
    if (status.includes('CANCEL')) return <XIcon className="tw-text-destructive" />;
    return null;
  };

  const normalizedStatus = (s: string) => (s || '').toUpperCase();
  const isScheduled = (s: string) => normalizedStatus(s) === 'SCHEDULED';
  const isCompleted = (s: string) => normalizedStatus(s) === 'COMPLETED';
  const isCanceled = (s: string) => normalizedStatus(s).includes('CANCEL');

  const combinedItems = useMemo(() => {
    const L = lessons.map((l:any) => ({ ...l, __isClass: false }));
    const C = classes.map((c:any) => ({ ...c, __isClass: true }));
    return [...L, ...C];
  }, [lessons, classes]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((it:any) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'scheduled') return isScheduled(it.status);
      if (selectedFilter === 'completed') return isCompleted(it.status);
      if (selectedFilter === 'canceled') return isCanceled(it.status);
      return true;
    });
  }, [combinedItems, selectedFilter]);

  const upcomingTotal = useMemo(() => combinedItems.filter((x:any) => isScheduled(x.status)).length, [combinedItems]);
  const completedTotal = useMemo(() => combinedItems.filter((x:any) => isCompleted(x.status)).length, [combinedItems]);
  const missedTotal = useMemo(() => combinedItems.filter((x:any) => isCanceled(x.status)).length, [combinedItems]);

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
      <Container className="tw-py-8 tw-space-y-8">
        {/* Header */}
        <div className="tw-text-center tw-space-y-4 tw-animate-fade-in">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-primary tw-to-primary">
            {t('lessons.header.title')}
          </h1>
          <p className="tw-text-xl tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
            {t('lessons.header.subtitle')}
          </p>
        </div>

        {/* Quick Stats: Unified (Lessons + Classes) */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-animate-fade-in-up">
          {[
            { label: t('lessons.stats.upcoming'), value: upcomingTotal, color: "tw-text-primary" },
            { label: t('lessons.stats.completed'), value: completedTotal, color: "tw-text-success" },
            { label: t('lessons.stats.missed'), value: missedTotal, color: "tw-text-destructive" },
          ].map((s:any) => (
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
                {t('lessons.tabs.list')}
              </button>
              <button onClick={() => setTab("calendar")} className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 ${tab === "calendar" ? "tw-bg-secondary" : "tw-bg-transparent"}`}>
                <CalendarIcon />
                {t('lessons.tabs.calendar')}
              </button>
            </div>

            <div className="tw-flex tw-items-center tw-gap-2">
              <FilterIcon className="tw-text-muted-foreground" />
              <div className="tw-flex tw-gap-1">
                {["all", "scheduled", "completed", "canceled"].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="tw-capitalize"
                  >
                    {filter === 'all' && t('lessons.filters.all')}
                    {filter === 'scheduled' && t('lessons.filters.scheduled')}
                    {filter === 'completed' && t('lessons.filters.completed')}
                    {filter === 'canceled' && t('lessons.filters.canceled')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {tab === "list" && (
            <div className="tw-space-y-4">
              {filteredItems
                .slice()
                .sort((a:any,b:any) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
                .map((item:any) => {
                  const isClass = !!item.__isClass;
                  const statusUp = (item.status || '').toUpperCase();
                  const isTheory = isClass ? true : (((item?.enrollment?.course?.type || '').toUpperCase() === 'THEORY'));
                  const titleLabel = isTheory
                    ? t('lessons.label.theoryLesson')
                    : t('lessons.label.practiceLesson');
                  const instructorName = item?.instructor ? `${item.instructor.first_name} ${item.instructor.last_name}` : '—';
                  const dt = item?.scheduled_time ? new Date(item.scheduled_time) : null;
                  const dateStr = dt ? dt.toLocaleDateString() : '—';
                  const timeStr = dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const resourceStr = isClass
                    ? (item?.resource?.name || item?.course?.name || '—')
                    : (item?.resource?.license_plate || item?.enrollment?.course?.name || '—');
                  return (
                    <Card
                      key={`${isClass ? 'class' : 'lesson'}-${item.id}`}
                      className={`tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card tw-transition-all tw-duration-300 hover:tw-scale-[1.02] ${
                        statusUp === "SCHEDULED" ? "tw-ring-2 tw-ring-success/20" : (statusUp.includes('CANCEL') ? "tw-ring-2 tw-ring-destructive/20" : "")
                      }`}
                    >
                      <CardContent className="tw-p-6">
                        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                          <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-w-12 tw-h-12 tw-bg-primary/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                              {isClass || isTheory ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-6 tw-h-6 tw-text-primary">
                                  <rect x="3" y="4" width="18" height="18" rx="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                              ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-6 tw-h-6 tw-text-primary">
                                    <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
                                    <path d="M5 16h14" />
                                    <circle cx="7" cy="16" r="2" />
                                    <circle cx="17" cy="16" r="2" />
                                  </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="tw-text-lg tw-font-semibold tw-text-foreground">{titleLabel}</h3>
                              <p className="tw-text-sm tw-text-muted-foreground">{t('commonUI.with')} {instructorName}</p>
                            </div>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            {getStatusIcon(statusUp)}
                            {getStatusBadge(statusUp)}
                          </div>
                        </div>

                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-text-sm">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                            <CalendarIcon />
                            <span>{dateStr}</span>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                            <ClockIcon />
                            <span>{timeStr}</span>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted-foreground">
                            <UserIcon />
                            <span>{resourceStr}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {filteredItems.length === 0 && (
                <div className="tw-text-sm tw-text-muted-foreground tw-text-center tw-py-8">
                  {t('commonUI.noItems')}
                </div>
              )}
            </div>
          )}

          {tab === "calendar" && (
            <div className="tw-space-y-4">
              <Card className="tw-bg-gradient-card tw-border tw-border-border/50 tw-shadow-card">
                <CardHeader>
                  <CardTitle>{t('lessons.calendar.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarGrid items={filteredItems} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Book New Lesson */}
        <Card className="tw-bg-gradient-primary tw-text-primary-foreground tw-shadow-glow">
          <CardContent className="tw-p-6 tw-text-center">
            <h3 className="tw-text-xl tw-font-bold tw-mb-2">{t('lessons.cta.title')}</h3>
            <p className="tw-mb-4 tw-opacity-90">{t('lessons.cta.subtitle')}</p>
            <Button variant="secondary" size="lg" className="tw-animate-bounce-gentle" onClick={() => navigate('/book-lesson')}>
              {t('lessons.cta.button')}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Lessons;

// --- Simple month calendar grid component ---
const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

const CalendarGrid: React.FC<{ items: any[] }>= ({ items }) => {
  const { t } = useTranslation('portal');
  const [refDate, setRefDate] = React.useState(new Date());
  const first = startOfMonth(refDate);
  const last = endOfMonth(refDate);
  const prefix = first.getDay();
  const daysInMonth = last.getDate();
  const cells: Array<{ date: Date | null }> = [];
  for (let i=0;i<prefix;i++) cells.push({ date: null });
  for (let d=1; d<=daysInMonth; d++) cells.push({ date: new Date(refDate.getFullYear(), refDate.getMonth(), d) });
  while (cells.length % 7 !== 0) cells.push({ date: null });

  function itemsFor(date: Date) {
    return items.filter((l:any) => l?.scheduled_time && sameDay(new Date(l.scheduled_time), date));
  }

  function shiftMonth(delta:number){
    const d = new Date(refDate);
    d.setMonth(d.getMonth()+delta);
    setRefDate(d);
  }

  const monthYear = refDate.toLocaleString(undefined,{ month:'long', year:'numeric'});

  return (
    <div className="tw-space-y-3">
      <div className="tw-flex tw-items-center tw-justify-between">
        <button className="tw-text-sm tw-text-muted-foreground hover:tw-text-foreground" onClick={() => shiftMonth(-1)}>&larr; {t('lessons.calendar.prev')}</button>
        <div className="tw-font-semibold">{monthYear}</div>
        <button className="tw-text-sm tw-text-muted-foreground hover:tw-text-foreground" onClick={() => shiftMonth(1)}>{t('lessons.calendar.next')} &rarr;</button>
      </div>
      <div className="tw-grid tw-grid-cols-7 tw-gap-2">
        {dayNames.map((dn, idx) => (
          <div key={dn} className="tw-text-xs tw-text-muted-foreground tw-text-center">{t('lessons.calendar.dayNamesShort.' + idx, { defaultValue: dayNames[idx] })}</div>
        ))}
        {cells.map((cell, idx) => {
          const isToday = cell.date ? sameDay(cell.date, new Date()) : false;
          const dayLessons = cell.date ? itemsFor(cell.date) : [];
          return (
            <div key={idx} className={`tw-min-h-24 tw-border tw-border-border/50 tw-rounded-md tw-p-2 ${cell.date ? 'tw-bg-background' : 'tw-bg-muted/30'} ${isToday ? 'tw-ring-2 tw-ring-primary/40' : ''}`}>
              <div className="tw-text-xs tw-text-muted-foreground">{cell.date?.getDate() ?? ''}</div>
              <div className="tw-mt-1 tw-space-y-1">
                {dayLessons.slice(0,3).map((l:any) => {
                  const isClass = !!l.__isClass;
                  const isTheory = isClass ? true : (((l?.enrollment?.course?.type||'').toUpperCase()==='THEORY'));
                  const typeLabel = isTheory ? t('lessons.word.theory') : t('lessons.word.practice');
                  const timeStr = new Date(l.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const statusUp = (l.status||'').toUpperCase();
                  const tone = statusUp==='COMPLETED' ? 'tw-bg-primary/15 tw-text-primary' : statusUp.includes('CANCEL') ? 'tw-bg-destructive/15 tw-text-destructive' : 'tw-bg-success/15 tw-text-success';
                  return (
                    <div key={`${l.__isClass ? 'class' : 'lesson'}-${l.id}`} className={`tw-text-[11px] tw-rounded tw-px-2 tw-py-1 tw-truncate ${tone}`}>{timeStr} · {typeLabel}</div>
                  );
                })}
                {dayLessons.length>3 && (
                  <div className="tw-text-[11px] tw-text-muted-foreground">{t('lessons.calendar.more', { count: dayLessons.length-3 })}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
