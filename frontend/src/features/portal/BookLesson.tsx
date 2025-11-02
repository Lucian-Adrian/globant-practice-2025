import * as React from "react";
import PortalNavBar from "./PortalNavBar";
import { useTranslation } from 'react-i18next';
import { useI18nForceUpdate } from '../../i18n/index.js';
import { useNavigate } from "react-router-dom";
import { studentRawFetch } from "../../api/httpClient";
import InstructorCalendarAvailability from "./InstructorCalendarAvailability";

// Minimal UI primitives matching portal styling
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`tw-max-w-2xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 ${className}`}>{children}</div>
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

const Label: React.FC<React.PropsWithChildren<{ htmlFor?: string; className?: string }>> = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`tw-text-sm tw-font-medium ${className}`}>{children}</label>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 focus:tw-outline-none ${props.className || ''}`} />
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 focus:tw-outline-none ${props.className || ''}`} />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "secondary" }>
= ({ children, className = "", variant = "default", ...props }) => {
  const variants = {
    default: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90",
    outline: "tw-border tw-border-input hover:tw-bg-secondary",
    secondary: "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/90",
  } as const;
  return (
    <button {...props} className={`tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-4 tw-text-sm tw-font-medium ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

type Instructor = { id: number; first_name: string; last_name: string };
type Enrollment = { id: number; type?: string; course?: { type?: string } };
type Resource = { id: number; category: string; is_available?: boolean };
type Lesson = {
  id: number;
  scheduled_time: string;
  duration_minutes?: number;
  status?: string;
  resource?: Resource | number | null;
  instructor?: { id: number } | number;
};

const BookLesson: React.FC = () => {
  const { t } = useTranslation('portal');
  useI18nForceUpdate();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [studentLessons, setStudentLessons] = React.useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = React.useState<Lesson[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);

  const [selectedInstructor, setSelectedInstructor] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [selectedTime, setSelectedTime] = React.useState<string>("");

  // Availability and lessons for the selected instructor
  const [availability, setAvailability] = React.useState<Record<string,string[]>>({});
  const [instructorLessons, setInstructorLessons] = React.useState<any[]>([]);
  const [availLoading, setAvailLoading] = React.useState(false);
  const [weekStart, setWeekStart] = React.useState<Date | undefined>(undefined);

  // Combined lessons for calendar (instructor + student's), de-duplicated by id
  const calendarLessons = React.useMemo(() => {
    const byId = new Map<number, any>();
    for (const l of instructorLessons as any[]) { if (l && typeof l.id === 'number') byId.set(l.id, l); }
    for (const l of studentLessons as any[]) { if (l && typeof l.id === 'number') byId.set(l.id, l); }
    return Array.from(byId.values());
  }, [instructorLessons, studentLessons]);

  // Load student dashboard data to get instructors and enrollments
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const resp = await studentRawFetch('/api/student/dashboard/', { headers: { 'Content-Type': 'application/json' } });
        if (resp.status === 401) {
          navigate('/login');
          return;
        }
        const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body?.detail || body?.message || t('booking.errors.loadFailed'));
        if (!mounted) return;
  const ins: Instructor[] = Array.isArray(body?.instructors) ? body.instructors : [];
  const ens: Enrollment[] = Array.isArray(body?.enrollments) ? body.enrollments : [];
  const stuLessons: Lesson[] = Array.isArray(body?.lessons) ? body.lessons : [];
        setInstructors(ins);
        setEnrollments(ens);
  setStudentLessons(stuLessons);
        if (ins.length) setSelectedInstructor(String(ins[0].id));
      } catch (e: any) {
  if (mounted) setError(e?.message || t('commonUI.networkError'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [navigate]);

  // Fetch resources once for auto-selection logic
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const r = await fetch('/api/resources/?page_size=500');
        const b = await r.json().catch(() => ({} as any));
        const arr = Array.isArray(b) ? b : (Array.isArray(b?.results) ? b.results : []);
        if (!cancelled) setResources(arr as Resource[]);
      } catch { /* ignore */ }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  // Fetch availability+lessons when instructor changes
  React.useEffect(() => {
    const fetchData = async () => {
      if (!selectedInstructor) { setAvailability({}); setInstructorLessons([]); return; }
      setAvailLoading(true);
      try {
        const insId = Number(selectedInstructor);
        // NOTE: backend currently does not implement filter param ?instructor=; response may be paginated: {count, next, previous, results: []}
        const availResp = await fetch(`/api/instructor-availabilities/?page_size=200`);
        const availBody = await availResp.json().catch(()=>({ results: [] }));
        const rawList = Array.isArray(availBody) ? availBody : (Array.isArray(availBody?.results) ? availBody.results : []);
        const filtered = rawList.filter((r: any) => r?.instructor?.id === insId || r?.instructor === insId || r?.instructor_id === insId);
        const map: Record<string,string[]> = {};
        for (const rec of filtered) {
          if (rec && rec.day && Array.isArray(rec.hours)) map[rec.day] = rec.hours;
        }
        setAvailability(map);
        // Lessons (also paginated) – fetch large page size to minimize misses
        const lessonsResp = await fetch(`/api/lessons/?ordering=scheduled_time&page_size=1000`);
        const lessonsBody = await lessonsResp.json().catch(()=>({}));
        const lessonsArr: Lesson[] = Array.isArray(lessonsBody) ? lessonsBody : (Array.isArray(lessonsBody?.results) ? lessonsBody.results : []);
        setAllLessons(lessonsArr);
        setInstructorLessons(lessonsArr.filter((l:any) => (l.instructor?.id === insId || l.instructor === insId) && l.status === 'SCHEDULED'));
      } catch (e) { /* ignore silently */ }
      finally { setAvailLoading(false); }
    };
    fetchData();
  }, [selectedInstructor]);

  // Compute valid time slots for the selected date based on availability + conflicts
  const getTimeOptions = React.useCallback(() => {
    if (!selectedInstructor || !selectedDate) return [] as string[];
    const d = new Date(`${selectedDate}T00:00:00`);
    const dayEnum = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][(d.getDay()+6)%7];
    const allowed = availability[dayEnum] || [];
    const now = new Date();
    const cleaned: string[] = [];
    for (const hhmm of allowed) {
      const start = new Date(`${selectedDate}T${hhmm}:00`);
      if (start < now) continue; // no past
      const end = new Date(start.getTime() + 60*60000);
      const conflict = instructorLessons.some((l:any) => {
        const lStart = new Date(l.scheduled_time);
        const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 60)*60000);
        return lStart < end && start < lEnd; // allow adjacency
      });
      const studentConflict = studentLessons.some((l:any) => {
        if (l?.status !== 'SCHEDULED') return false;
        const lStart = new Date(l.scheduled_time);
        const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 60)*60000);
        return lStart < end && start < lEnd; // allow adjacency
      });
      if (!conflict && !studentConflict) cleaned.push(hhmm);
    }
    return cleaned.sort();
  }, [selectedInstructor, selectedDate, availability, instructorLessons, studentLessons]);

  const canSubmit = Boolean(selectedInstructor && selectedDate && selectedTime && enrollments.length);

  const findPracticeEnrollmentId = () => {
    // Prefer PRACTICE enrollment; fall back to any
    const practice = enrollments.find(e => (e.type || e.course?.type || '').toUpperCase() === 'PRACTICE');
    return practice?.id || enrollments[0]?.id;
  };

  const findEnrollmentById = (id: number | undefined) => enrollments.find(e => e.id === id);

  // Auto-pick resource: most recently used by this student and available; otherwise random available
  const pickResourceId = (start: Date, end: Date, enrollmentId: number | undefined): number | null => {
    if (!enrollmentId) return null;
    const enr = findEnrollmentById(enrollmentId);
    const courseCategory = (enr as any)?.course?.category || (enr as any)?.category;
    if (!courseCategory) return null;

    // Candidates: resources matching course category and marked available (or missing flag treated as available)
  const matching = resources.filter(r => r.category === courseCategory && r.is_available !== false && (r as any).max_capacity === 2);
    if (matching.length === 0) return null;

    // Exclude resources with overlapping SCHEDULED lessons at this time
    const overlaps = (l: Lesson) => {
      if (!l || l.status !== 'SCHEDULED') return false;
      const lStart = new Date(l.scheduled_time);
      const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 60) * 60000);
      return lStart < end && start < lEnd;
    };
    const busy = new Set<number>();
    for (const l of allLessons) {
      const res = l?.resource as any;
      const rId = typeof res === 'number' ? res : res?.id;
      if (!rId) continue;
      if (overlaps(l)) busy.add(rId);
    }
    const free = matching.filter(r => !busy.has(r.id));
    if (free.length === 0) return null;

    // Try most-recently-used resource by this student that is free
    const sortedByRecent = [...studentLessons]
      .filter(l => l.resource)
      .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
    for (const l of sortedByRecent) {
      const res = l.resource as any;
      const rId = typeof res === 'number' ? res : res?.id;
      const rCat = typeof res === 'number' ? undefined : res?.category;
      if (!rId) continue;
      if (rCat && rCat !== courseCategory) continue;
      if (free.some(r => r.id === rId)) return rId;
    }

    // Fallback: pick a random free resource
    const pick = free[Math.floor(Math.random() * free.length)];
    return pick?.id ?? null;
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    const enrollmentId = findPracticeEnrollmentId();
  if (!enrollmentId) { setError(t('portal.booking.errors.loadFailed')); return; }
    const instructorId = Number(selectedInstructor);
    const iso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const start = new Date(`${selectedDate}T${selectedTime}:00`);
    const end = new Date(start.getTime() + 60*60000);
    // Block if the student already has a lesson overlapping this time
    const hasStudentConflict = studentLessons.some(l => {
      if (l?.status !== 'SCHEDULED') return false;
      const lStart = new Date(l.scheduled_time);
      const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 60) * 60000);
      return lStart < end && start < lEnd; // adjacency allowed
    });
    if (hasStudentConflict) {
  setError(t('portal.booking.errors.slotConflict'));
      return;
    }

    const resourceId = pickResourceId(start, end, enrollmentId);
    if (resourceId == null) {
  setError(t('portal.booking.errors.vehicleUnavailable'));
      return;
    }
    try {
      // IMPORTANT: Do not send Authorization header for this endpoint to avoid JWT auth failure (401)
      const resp = await fetch('/api/lessons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          instructor_id: instructorId,
          resource_id: resourceId,
          scheduled_time: iso,
          duration_minutes: 60,
          status: 'SCHEDULED',
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({} as any));
  throw new Error(body?.detail || body?.message || t('portal.booking.errors.submitFailed'));
      }
      navigate('/lessons?filter=upcoming');
    } catch (e: any) {
  setError(e?.message || t('portal.booking.errors.submitFailed'));
    }
  };

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        <div className="tw-text-center tw-space-y-2">
          <h1 className="tw-text-3xl tw-font-bold">{t('portal.booking.header.title')}</h1>
          <p className="tw-text-muted-foreground">{t('portal.booking.header.subtitle')}</p>
        </div>

        {loading && (
          <div className="tw-text-center tw-text-sm tw-text-muted-foreground">{t('commonUI.loading')}</div>
        )}
        {error && (
          <div className="tw-text-center tw-text-sm tw-text-destructive">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('portal.booking.details.title')}</CardTitle>
          </CardHeader>
          <CardContent className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="instructor">{t('portal.booking.form.instructor')}</Label>
                <Select id="instructor" value={selectedInstructor} onChange={(e) => setSelectedInstructor(e.target.value)}>
                  <option value="" disabled>{t('portal.booking.form.instructor')}</option>
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="date">{t('portal.booking.form.datetime')}</Label>
                <Input id="date" type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} />
              </div>
              <div className="tw-space-y-2">
                <Label htmlFor="time">{t('portal.booking.form.datetime')}</Label>
                <Select id="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} disabled={!selectedInstructor || !selectedDate}>
                  <option value="" disabled>{t('portal.booking.form.datetime')}</option>
                  {getTimeOptions().map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
                {selectedInstructor && selectedDate && getTimeOptions().length === 0 && (
                  <div className="tw-text-[11px] tw-text-muted-foreground">{t('portal.booking.errors.noSlots')}</div>
                )}
              </div>
            </div>

            <div className="tw-pt-2">
              <InstructorCalendarAvailability
                instructorId={selectedInstructor ? Number(selectedInstructor) : null}
                lessons={calendarLessons as any}
                availability={availability}
                loading={availLoading}
                weekStart={weekStart}
                onWeekChange={(d) => setWeekStart(d)}
                onSelect={(dateStr, time) => { setSelectedDate(dateStr); setSelectedTime(time); }}
              />
            </div>

            <div className="tw-flex tw-justify-end tw-gap-3">
              <Button variant="outline" onClick={() => { window.history.back(); }}>{t('portal.booking.form.cancel')}</Button>
              <Button onClick={onSubmit} disabled={!canSubmit}>{t('portal.booking.form.submit')}</Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default BookLesson;
