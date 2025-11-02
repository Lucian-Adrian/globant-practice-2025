import * as React from 'react';
import { useTranslation } from 'react-i18next';

interface Lesson {
  id: number;
  scheduled_time: string; // ISO string
  duration_minutes: number;
  status: string;
}

interface Props {
  instructorId: number | null;
  lessons: Lesson[];
  availability: Record<string, string[]>; // DayOfWeek => ["HH:MM"]
  onSelect: (dateStr: string, time: string) => void;
  durationMinutes?: number;
  loading?: boolean;
  weekStart?: Date; // explicit week start (Monday) passed from parent
  onWeekChange?: (newStart: Date) => void; // notify parent if navigation used internally
}

const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const JS_TO_ENUM = (d: Date) => DAY_ORDER[(d.getDay()+6)%7]; // JS 0=Sun -> shift so 0=Mon
const fmtLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function dateAtTime(base: Date, hhmm: string): Date {
  const [hh, mm] = hhmm.split(':').map((x) => parseInt(x, 10));
  const t = new Date(base);
  t.setHours(hh || 0, mm || 0, 0, 0); // local time
  return t;
}
const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart < bEnd && bStart < aEnd;
const toMinutes = (hhmm: string) => {
  const [h, m] = (hhmm || '').split(':').map((x) => parseInt(x, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};
const pad = (n: number) => String(n).padStart(2, '0');
const fromMinutes = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

function buildWeek(start: Date): Date[] {
  const days: Date[] = [];
  for (let i=0;i<7;i++) { const d = new Date(start); d.setDate(start.getDate()+i); days.push(d); }
  return days;
}

const Legend: React.FC = () => {
  const { t } = useTranslation('portal');
  return (
    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-text-xs tw-mb-2">
      <div className="tw-flex tw-items-center tw-gap-1"><span className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-green-600"/>{t('portal.instructorAvailability.legend.available')}</div>
      <div className="tw-flex tw-items-center tw-gap-1"><span className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-red-500 tw-opacity-70"/>{t('portal.instructorAvailability.legend.unavailable')}</div>
      <div className="tw-flex tw-items-center tw-gap-1"><span className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-gray-300"/>{t('portal.instructorAvailability.legend.selected')}</div>
    </div>
  );
};

const InstructorCalendarAvailability: React.FC<Props> = ({ instructorId, lessons, availability, onSelect, durationMinutes=90, loading, weekStart, onWeekChange }) => {
  const { t } = useTranslation('portal');
  // IMPORTANT: Do not return early before declaring hooks; otherwise when instructorId becomes truthy
  // React will see a different hook order (causing the runtime error we observed). We compute hooks
  // unconditionally and branch only in render output.
  const noInstructor = !instructorId;

  const baseStart = React.useMemo(() => {
    if (weekStart) return new Date(weekStart);
    const today = new Date();
    const shift = (today.getDay()+6)%7; // Monday index 0
    today.setHours(0,0,0,0);
    today.setDate(today.getDate()-shift);
    return today;
  }, [weekStart]);

  const weekDays = React.useMemo(()=> buildWeek(baseStart), [baseStart]);
  const todayLocal = fmtLocalDate(new Date());

  // Union of all 30-minute starts across the week for table rows
  const unionHours = React.useMemo(() => {
    const set = new Set<string>();
    for (const d of weekDays) {
      const hours = (availability[JS_TO_ENUM(d)] || []).slice().sort();
      const mins = hours.map(toMinutes).sort((a, b) => a - b);
      for (let i = 0; i < mins.length - 1; i++) {
        const a = mins[i];
        const b = mins[i + 1];
        for (let t = a; t < b; t += 30) set.add(fromMinutes(t));
      }
      if (mins.length) set.add(fromMinutes(mins[mins.length - 1])); // include exact last bound
    }
    return Array.from(set).sort();
  }, [weekDays, availability]);

  const lessonsByDate = React.useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    lessons.filter(l => l.status === 'SCHEDULED').forEach(l => {
      const dt = new Date(l.scheduled_time); // parse as local from ISO (UTC aware)
      const ds = fmtLocalDate(dt); // group by local day to match grid columns
      (map[ds] ||= []).push(l);
    });
    return map;
  }, [lessons]);

  function slotState(dayDate: Date, hhmm: string): 'available' | 'booked' | 'unavailable' {
    const dayEnum = JS_TO_ENUM(dayDate);
    const raw = (availability[dayEnum] || []).slice().sort();
    const mins = raw.map(toMinutes).sort((a, b) => a - b);
    let isAllowed = false;
    const m = toMinutes(hhmm);
    if (mins.length) {
      if (m === mins[mins.length - 1]) isAllowed = true; // exact last boundary allowed
      else {
        for (let i = 0; i < mins.length - 1; i++) {
          if (mins[i] <= m && m < mins[i + 1] && ((m - mins[i]) % 30 === 0)) { isAllowed = true; break; }
        }
      }
    }
    if (!isAllowed) return 'unavailable';
    const start = dateAtTime(dayDate, hhmm);
    if (start < new Date()) return 'unavailable';
    const end = new Date(start.getTime() + durationMinutes*60000);
    const list = lessonsByDate[fmtLocalDate(dayDate)] || [];
    const conflict = list.some(l => {
      const s = new Date(l.scheduled_time);
      const e = new Date(s.getTime() + (l.duration_minutes || durationMinutes) * 60000);
      return overlaps(start, end, s, e);
    });
    return conflict ? 'booked' : 'available';
  }

  const endOfWeek = new Date(baseStart); endOfWeek.setDate(baseStart.getDate()+6);
  const rangeLabel = `${baseStart.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${endOfWeek.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;

  function shiftWeek(delta: number) {
    const d = new Date(baseStart); d.setDate(d.getDate() + delta*7); d.setHours(0,0,0,0);
    // align again to Monday just in case
    const shift = (d.getDay()+6)%7; d.setDate(d.getDate()-shift);
    onWeekChange?.(d);
  }

  if (noInstructor) {
    return (
      <div className="tw-text-xs tw-text-muted-foreground">{t('portal.booking.form.instructor')}</div>
    );
  }

  return (
    <div className="tw-space-y-2">
      <div className="tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-3">
          <h4 className="tw-text-sm tw-font-semibold">{t('portal.instructorAvailability.header.title')}</h4>
          <span className="tw-text-[11px] tw-text-muted-foreground tw-font-medium">{rangeLabel}</span>
        </div>
        <div className="tw-flex tw-gap-1">
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="tw-text-xs tw-border tw-border-border tw-rounded-sm tw-px-2 tw-py-1 hover:tw-bg-muted"
            title={t('portal.instructorAvailability.nav.prev')}
          >&lt;</button>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="tw-text-xs tw-border tw-border-border tw-rounded-sm tw-px-2 tw-py-1 hover:tw-bg-muted"
            title={t('portal.instructorAvailability.nav.next')}
          >&gt;</button>
        </div>
      </div>
      <Legend />
  {loading && <div className="tw-text-xs tw-text-muted-foreground">{t('portal.instructorAvailability.loading')}</div>}
  {!loading && unionHours.length === 0 && <div className="tw-text-xs tw-text-muted-foreground">{t('portal.instructorAvailability.empty')}</div>}
      <div className="tw-overflow-auto tw-border tw-rounded-md tw-border-border">
        <table className="tw-min-w-full tw-text-xs tw-border-collapse">
          <thead>
            <tr>
              <th className="tw-bg-muted tw-text-left tw-px-2 tw-py-1 tw-font-medium tw-w-20">{t('portal.instructorAvailability.table.time')}</th>
              {weekDays.map(d => {
                const dateStr = fmtLocalDate(d);
                const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'});
                return <th key={dateStr} className={`tw-bg-muted tw-px-2 tw-py-1 tw-font-medium tw-text-center ${dateStr===todayLocal?'tw-ring-1 tw-ring-primary':''}`}>{label}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {unionHours.map(h => (
              <tr key={h} className="odd:tw-bg-background even:tw-bg-muted/30">
                <td className="tw-px-2 tw-py-1 tw-font-mono tw-text-[11px] tw-text-muted-foreground">{h}</td>
                {weekDays.map(d => {
                  const dateStr = fmtLocalDate(d);
                  const state = slotState(d, h);
                  const base = 'tw-w-full tw-text-[11px] tw-leading-tight tw-rounded-sm tw-px-1 tw-py-1 tw-font-medium';
                  let cls = 'tw-bg-gray-300 tw-text-gray-600';
                  if (state==='available') cls = 'tw-bg-green-600 hover:tw-bg-green-700 tw-text-white cursor-pointer';
                  else if (state==='booked') cls = 'tw-bg-red-500 tw-text-white tw-opacity-70';
                  return (
                    <td key={dateStr+':'+h} className="tw-px-1 tw-py-1 tw-text-center">
                      <button
                        type="button"
                        disabled={state!=='available'}
                        className={base+' '+cls}
                        onClick={() => state==='available' && onSelect(dateStr, h)}
                        title={state==='available' ? t('portal.instructorAvailability.tooltip.slotAvailable') : undefined}
                      >
                        {state==='available' ? '✓' : state==='booked' ? '•' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorCalendarAvailability;
