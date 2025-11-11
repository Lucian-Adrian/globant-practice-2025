import { API_PREFIX } from '../../api/httpClient';

const addMinutes = (date, mins) => new Date(new Date(date).getTime() + (mins*60000));
const overlap = (startA, endA, startB, endB) => startA < endB && startB < endA; // adjacency allowed
const DAY_ENUM = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
// Business-local timezone for availability checks (must match backend settings BUSINESS_TZ)
const BUSINESS_TZ = 'Europe/Chisinau';

function formatInBusinessTZParts(date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: BUSINESS_TZ,
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const byType = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const weekdayShort = (byType.weekday || '').slice(0,3).toLowerCase();
    const map = { mon:0, tue:1, wed:2, thu:3, fri:4, sat:5, sun:6 };
    const dayIndex = map[weekdayShort] ?? 0;
    const hh = String(byType.hour || '00').padStart(2,'0');
    const mm = String(byType.minute || '00').padStart(2,'0');
    return { dayIndex, hhmm: `${hh}:${mm}` };
  } catch {
    // Fallback to local if Intl fails
    const d = new Date(date);
    const dayIndex = (d.getDay()+6)%7;
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return { dayIndex, hhmm: `${hh}:${mm}` };
  }
}

function minutesOf(hhmm) {
  const [h,m] = String(hhmm).split(':').map(x => parseInt(x,10));
  return (isNaN(h)?0:h)*60 + (isNaN(m)?0:m);
}

async function getJson(url) {
  const resp = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  let body = {};
  try { body = await resp.json(); } catch(_) {}
  const data = Array.isArray(body) ? body : (Array.isArray(body?.results) ? body.results : body);
  return { ok: resp.ok, data, raw: body };
}

export async function validateLesson(values, t, currentId) {
  const errors = {};

  const enrollmentId = values.enrollment_id ?? values.enrollment?.id;
  const instructorId = values.instructor_id ?? values.instructor?.id;
  const resourceId = values.resource_id ?? values.resource?.id ?? null;
  const scheduled = values.scheduled_time;
  const duration = Number(values.duration_minutes ?? 90);

  if (!enrollmentId) errors.enrollment_id = t('validation.requiredField');
  if (!instructorId) errors.instructor_id = t('validation.requiredField');
  if (!scheduled) errors.scheduled_time = t('validation.requiredField');
  if (Object.keys(errors).length) return errors;

  const start = new Date(scheduled);
  const end = addMinutes(start, duration);
  const windowStart = addMinutes(start, -480); // 8 hours back

  // Fetch enrollment for course.category and student id
  const enr = await getJson(`${API_PREFIX}/enrollments/${enrollmentId}/`);
  const enrollment = enr.data || {};
  const course = enrollment.course || {};
  const courseCategory = course.category;
  const studentId = enrollment?.student?.id ?? enrollment?.student_id;

  // Fetch instructor for license categories
  const ins = await getJson(`${API_PREFIX}/instructors/${instructorId}/`);
  const instructor = ins.data || {};

  // Fetch resource if provided
  let resource = null;
  if (resourceId) {
    const res = await getJson(`${API_PREFIX}/resources/${resourceId}/`);
    resource = res.data || null;
  }

  // Availability: GET by instructor and business-local day, accept any-minute within intervals
  const { dayIndex, hhmm } = formatInBusinessTZParts(start);
  const day = DAY_ENUM[dayIndex];
  const avail = await getJson(`${API_PREFIX}/instructor-availabilities/?instructor_id=${encodeURIComponent(instructorId)}&day=${encodeURIComponent(day)}&page_size=50`);
  const slots = new Set();
  if (Array.isArray(avail.data)) {
    for (const a of avail.data) {
      const hours = Array.isArray(a?.hours) ? a.hours : [];
      hours.forEach((h) => {
        if (typeof h === 'string') {
          const [H,M] = h.split(':');
          const hh = String(H||'00').padStart(2,'0');
          const mm = String(M||'00').padStart(2,'0');
          slots.add(`${hh}:${mm}`);
        }
      });
    }
  }
  if (slots.size > 0) {
    const startMin = minutesOf(hhmm);
    const sorted = Array.from(slots).sort();
    const mins = sorted.map(minutesOf);
    let ok = false;
    if (startMin === mins[mins.length-1]) ok = true; // accept exact last slot
    else {
      for (let i=0;i<mins.length-1;i++) {
        if (mins[i] <= startMin && startMin < mins[i+1]) { ok = true; break; }
      }
    }
    if (!ok) errors.scheduled_time = t('validation.outsideAvailability');
  }

  // Category & license checks
  if (resource && courseCategory && resource.category !== courseCategory) {
    errors.resource_id = t('validation.categoryMismatch');
  }
  if (courseCategory) {
    const cats = String(instructor.license_categories || '')
      .split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
    if (!cats.includes(String(courseCategory).toUpperCase())) {
      errors.instructor_id = t('validation.instructorLicenseMismatch');
    }
  }

  // Overlaps: lessons in window, filter client-side by status and by entity
  async function findAnyOverlap(url, predicate) {
    const r = await getJson(url);
    const list = Array.isArray(r.data) ? r.data : [];
    return list.some((item) => {
      if (currentId && (item.id === currentId)) return false;
      const st = new Date(item.scheduled_time);
      const en = addMinutes(st, Number(item.duration_minutes ?? 60));
      const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
      return active && predicate(item) && overlap(start, end, st, en);
    });
  }

  // Narrow time window for payload; we only need to know if any exists
  const baseWin = `scheduled_time__lt=${encodeURIComponent(end.toISOString())}&scheduled_time__gte=${encodeURIComponent(windowStart.toISOString())}&page_size=1`;

  // Instructor conflict
  const instrUrl = `${API_PREFIX}/lessons/?instructor=${encodeURIComponent(instructorId)}&${baseWin}`;
  const instrHit = await findAnyOverlap(instrUrl, () => true);
  if (instrHit) errors.instructor_id = t('validation.instructorConflict');

  // Student conflict
  if (studentId) {
    const stuUrl = `${API_PREFIX}/lessons/?enrollment__student=${encodeURIComponent(studentId)}&${baseWin}`;
    const stuHit = await findAnyOverlap(stuUrl, () => true);
    if (stuHit) errors.enrollment_id = t('validation.studentConflict');
  }

  // Resource conflict
  if (resourceId) {
    // Use efficient server-side filter by resource id
    const resUrl = `${API_PREFIX}/lessons/?resource_id=${encodeURIComponent(resourceId)}&${baseWin}`;
    const resHit = await findAnyOverlap(resUrl, () => true);
    if (resHit) errors.resource_id = t('validation.resourceConflict');
  }

  return errors;
}
