import * as React from "react";
import PortalNavBar from "./PortalNavBar";
import { useNavigate } from "react-router-dom";
import { studentRawFetch, studentHttpJson } from "../../api/httpClient";

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

const BookLesson: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);

  const [selectedInstructor, setSelectedInstructor] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [selectedTime, setSelectedTime] = React.useState<string>("");

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
        if (!resp.ok) throw new Error(body?.detail || body?.message || 'Failed to load');
        if (!mounted) return;
        const ins: Instructor[] = Array.isArray(body?.instructors) ? body.instructors : [];
        const ens: Enrollment[] = Array.isArray(body?.enrollments) ? body.enrollments : [];
        setInstructors(ins);
        setEnrollments(ens);
        if (ins.length) setSelectedInstructor(String(ins[0].id));
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [navigate]);

  // Realistic hours helper: 09:00-16:00, hourly slots; if today, only future hours
  const getTimeOptions = React.useCallback(() => {
    const opts: string[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const baseHours = [9, 10, 11, 13, 14, 15, 16]; // skip 12:00 for lunch
    const now = new Date();
    for (const h of baseHours) {
      const t = `${String(h).padStart(2,'0')}:00`;
      if (!selectedDate) { opts.push(t); continue; }
      if (selectedDate !== todayStr) { opts.push(t); continue; }
      // same day: only future times
      const dt = new Date(`${selectedDate}T${t}:00`);
      if (dt > now) opts.push(t);
    }
    return opts;
  }, [selectedDate]);

  const canSubmit = Boolean(selectedInstructor && selectedDate && selectedTime && enrollments.length);

  const findPracticeEnrollmentId = () => {
    // Prefer PRACTICE enrollment; fall back to any
    const practice = enrollments.find(e => (e.type || e.course?.type || '').toUpperCase() === 'PRACTICE');
    return practice?.id || enrollments[0]?.id;
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    const enrollmentId = findPracticeEnrollmentId();
    if (!enrollmentId) { setError('No active enrollment found'); return; }
    const instructorId = Number(selectedInstructor);
    const iso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    try {
      // IMPORTANT: Do not send Authorization header for this endpoint to avoid JWT auth failure (401)
      const resp = await fetch('/api/lessons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          instructor_id: instructorId,
          scheduled_time: iso,
          duration_minutes: 60,
          status: 'SCHEDULED',
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({} as any));
        throw new Error(body?.detail || body?.message || 'Failed to book lesson');
      }
      navigate('/lessons?filter=upcoming');
    } catch (e: any) {
      setError(e?.message || 'Failed to book lesson');
    }
  };

  return (
    <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
      <PortalNavBar />
      <Container className="tw-py-8 tw-space-y-8">
        <div className="tw-text-center tw-space-y-2">
          <h1 className="tw-text-3xl tw-font-bold">Book a New Lesson</h1>
          <p className="tw-text-muted-foreground">Choose type, instructor, date and time, then submit your request.</p>
        </div>

        {loading && (
          <div className="tw-text-center tw-text-sm tw-text-muted-foreground">Loading…</div>
        )}
        {error && (
          <div className="tw-text-center tw-text-sm tw-text-destructive">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lesson details</CardTitle>
          </CardHeader>
          <CardContent className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Select id="instructor" value={selectedInstructor} onChange={(e) => setSelectedInstructor(e.target.value)}>
                  <option value="" disabled>Select instructor</option>
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <Input id="date" type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div className="tw-space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select id="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                  <option value="" disabled>Select time</option>
                  {getTimeOptions().map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="tw-flex tw-justify-end tw-gap-3">
              <Button variant="outline" onClick={() => { window.history.back(); }}>Cancel</Button>
              <Button onClick={onSubmit} disabled={!canSubmit}>Book Lesson</Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default BookLesson;
