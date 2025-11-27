import * as React from "react";
import PortalNavBar from "./PortalNavBar";
import { useTranslation } from 'react-i18next';
import { useI18nForceUpdate } from '../../i18n/index.jsx';
import { useNavigate } from "react-router-dom";
import { studentRawFetch } from "../../api/httpClient";
import InstructorCalendarAvailability from "./InstructorCalendarAvailability";
import { validateLesson } from '../../shared/validation/lessonValidation.js';

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
type Resource = { id: number; category: string; is_available?: boolean; max_capacity?: number; license_plate?: string; name?: string; make?: string; model?: string };
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
  const [selectedResource, setSelectedResource] = React.useState<string>("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

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
    // Do NOT auto-select instructor; student must choose manually
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

  // Helpers for 30-minute slot generation
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };
  const pad = (n: number) => String(n).padStart(2, '0');
  const fromMinutes = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

  // Compute valid 30-min start time slots for the selected date based on availability + conflicts
  const getTimeOptions = React.useCallback(() => {
    if (!selectedInstructor || !selectedDate) return [] as string[];
    const d = new Date(`${selectedDate}T00:00:00`);
    const dayEnum = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][(d.getDay()+6)%7];
    const raw = (availability[dayEnum] || []).slice().sort();
    const mins = raw.map(toMinutes).sort((a, b) => a - b);
    const now = new Date();
    const options: string[] = [];
    for (let i = 0; i < mins.length - 1; i++) {
      const startWin = mins[i];
      const endWin = mins[i + 1];
      for (let t = startWin; t < endWin; t += 30) {
        const hhmm = fromMinutes(t);
        const start = new Date(`${selectedDate}T${hhmm}:00`);
        if (start < now) continue; // no past
        const end = new Date(start.getTime() + 90 * 60000);
        const conflict = instructorLessons.some((l: any) => {
          const lStart = new Date(l.scheduled_time);
          const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 90) * 60000);
          return lStart < end && start < lEnd; // allow adjacency
        });
        const studentConflict = studentLessons.some((l: any) => {
          if (l?.status !== 'SCHEDULED') return false;
          const lStart = new Date(l.scheduled_time);
          const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 90) * 60000);
          return lStart < end && start < lEnd; // allow adjacency
        });
        if (!conflict && !studentConflict) options.push(hhmm);
      }
    }
    // Also allow the last defined time exactly (aligns with validation behavior)
    if (mins.length) {
      const last = mins[mins.length - 1];
      const hhmm = fromMinutes(last);
      const start = new Date(`${selectedDate}T${hhmm}:00`);
      if (start >= now) options.push(hhmm);
    }
    return Array.from(new Set(options)).sort();
  }, [selectedInstructor, selectedDate, availability, instructorLessons, studentLessons]);

  // Available vehicle resources at selected slot (max_capacity===2, available flag, not busy)
  const availableVehicles = React.useMemo(() => {
    if (!selectedDate || !selectedTime) return [] as Resource[];
    const start = new Date(`${selectedDate}T${selectedTime}:00`);
    const end = new Date(start.getTime() + 90 * 60000);
    const isVehicle = (r: Resource) => (r.max_capacity === 2);
    const overlaps = (l: Lesson) => {
      if (!l || l.status !== 'SCHEDULED') return false;
      const ls = new Date(l.scheduled_time);
      const le = new Date(ls.getTime() + (l.duration_minutes || 90) * 60000);
      return ls < end && start < le;
    };
    const busy = new Set<number>();
    for (const l of allLessons) {
      const res: any = l?.resource as any;
      const rid = typeof res === 'number' ? res : res?.id;
      if (!rid) continue;
      if (overlaps(l)) busy.add(rid);
    }
    return resources
      .filter((r) => isVehicle(r) && r.is_available !== false)
      .filter((r) => !busy.has(r.id));
  }, [resources, allLessons, selectedDate, selectedTime]);

  const canSubmit = Boolean(selectedInstructor && selectedDate && selectedTime && selectedResource && enrollments.length);

  const findPracticeEnrollmentId = () => {
    // Prefer PRACTICE enrollment; fall back to any
    const practice = enrollments.find(e => (e.type || e.course?.type || '').toUpperCase() === 'PRACTICE');
    return practice?.id || enrollments[0]?.id;
  };

  const findEnrollmentById = (id: number | undefined) => enrollments.find(e => e.id === id);

  // Helper: get selected resource entity
  const getSelectedResource = React.useCallback((): Resource | undefined => {
    const id = Number(selectedResource);
    if (!id) return undefined;
    return resources.find((r) => r.id === id);
  }, [selectedResource, resources]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    const enrollmentId = findPracticeEnrollmentId();
  if (!enrollmentId) { setError(t('portal.booking.errors.loadFailed')); return; }
    const instructorId = Number(selectedInstructor);
    const iso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const start = new Date(`${selectedDate}T${selectedTime}:00`);
    const end = new Date(start.getTime() + 90 * 60000);
    // Block if the student already has a lesson overlapping this time
    const hasStudentConflict = studentLessons.some(l => {
      if (l?.status !== 'SCHEDULED') return false;
      const lStart = new Date(l.scheduled_time);
      const lEnd = new Date(lStart.getTime() + (l.duration_minutes || 90) * 60000);
      return lStart < end && start < lEnd; // adjacency allowed
    });
    if (hasStudentConflict) {
  setError(t('portal.booking.errors.slotConflict'));
      return;
    }

    const resEnt = getSelectedResource();
    if (!resEnt) {
      setFieldErrors({ resource_id: t('validation.requiredField') });
      return;
    }
    if ((resEnt.max_capacity ?? 0) !== 2) {
      setFieldErrors({ resource_id: t('validation.vehicleResourceRequired') });
      return;
    }

    // Run shared frontend validation
    setFieldErrors({});
    const values = {
      enrollment_id: enrollmentId,
      instructor_id: instructorId,
      resource_id: resEnt.id,
      scheduled_time: iso,
      duration_minutes: 90,
      status: 'SCHEDULED',
    } as any;
    const vErrors = await validateLesson(values, t);
    if (vErrors && Object.keys(vErrors).length) {
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(vErrors)) mapped[k] = String(v);
      setFieldErrors(mapped);
      return;
    }

    try {
      // IMPORTANT: Do not send Authorization header for this endpoint to avoid JWT auth failure (401)
      const resp = await fetch('/api/lessons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
                {fieldErrors.instructor_id && (
                  <div className="tw-text-[11px] tw-text-destructive">{fieldErrors.instructor_id}</div>
                )}
              </div>
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="date">{t('portal.booking.form.datetime')}</Label>
                <Input id="date" type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); setSelectedResource(''); setFieldErrors({}); }} />
                {fieldErrors.scheduled_time && (
                  <div className="tw-text-[11px] tw-text-destructive">{fieldErrors.scheduled_time}</div>
                )}
              </div>
              <div className="tw-space-y-2">
                <Label htmlFor="time">{t('portal.booking.form.datetime')}</Label>
                <Select id="time" value={selectedTime} onChange={(e) => { setSelectedTime(e.target.value); setSelectedResource(''); setFieldErrors({}); }} disabled={!selectedInstructor || !selectedDate}>
                  <option value="" disabled>{t('portal.booking.form.datetime')}</option>
                  {getTimeOptions().map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
                {selectedInstructor && selectedDate && getTimeOptions().length === 0 && (
                  <div className="tw-text-[11px] tw-text-muted-foreground">{t('portal.booking.errors.noSlots')}</div>
                )}
                {fieldErrors.enrollment_id && (
                  <div className="tw-text-[11px] tw-text-destructive">{fieldErrors.enrollment_id}</div>
                )}
              </div>
            </div>

            {/* Vehicle (resource) selection */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="resource">{t('portal.booking.form.resource')}</Label>
                <Select id="resource" value={selectedResource} onChange={(e) => { setSelectedResource(e.target.value); setFieldErrors((prev) => ({ ...prev, resource_id: '' })); }} disabled={!selectedDate || !selectedTime}>
                  <option value="" disabled>{t('portal.booking.form.resource')}</option>
                  {availableVehicles.map((r) => {
                    const label = r.license_plate || r.name || `${r.make || ''} ${r.model || ''}`.trim() || `#${r.id}`;
                    return (
                      <option key={r.id} value={r.id}>{label}</option>
                    );
                  })}
                </Select>
                {(!selectedResource && selectedDate && selectedTime && availableVehicles.length === 0) && (
                  <div className="tw-text-[11px] tw-text-muted-foreground">{t('portal.booking.errors.vehicleUnavailable')}</div>
                )}
                {fieldErrors.resource_id && (
                  <div className="tw-text-[11px] tw-text-destructive">{fieldErrors.resource_id}</div>
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
