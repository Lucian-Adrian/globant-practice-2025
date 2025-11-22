import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Enrollment = any; // TODO: Replace with real types if available
type Lesson = any;
type ScheduledClass = any;
type ScheduledClassPattern = any;

interface EnrollmentDetailsModalProps {
  open: boolean;
  enrollment: Enrollment | null;
  lessons: Lesson[];
  scheduledClasses: ScheduledClass[];
  patterns: ScheduledClassPattern[]; // 👈 NEW
  onClose: () => void;
}

const isForEnrollment = (item: any, e: any) => {
  if (!item || !e) return false;
  const eid = e?.id;
  if (item?.enrollment?.id === eid || item?.enrollment_id === eid) return true;
  if (Array.isArray(item?.enrollments) && item.enrollments.some((en: any) => en?.id === eid)) return true;
  if (item?.course?.id && item.course.id === e?.course?.id) return true;
  return false;
};

const parseDate = (dt: any): Date | null => {
  try {
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatDateNoSeconds = (dt: any): string => {
  const d = parseDate(dt);
  if (!d) return "";
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} ${time}`;
};

const humanInstructor = (obj: any): string => {
  const ins = obj?.instructor || obj?.pattern?.instructor || null;
  if (!ins) return "";
  const name = [ins.first_name, ins.last_name].filter(Boolean).join(" ").trim();
  return name || ins.name || ins.email || "";
};

const humanResource = (obj: any): string => {
  const r = obj?.resource || obj?.pattern?.resource || null;
  if (!r) return "";
  return r.name || [r.make, r.model].filter(Boolean).join(" ") || r.license_plate || "";
};

// Helpers to format schedule from pattern.recurrence_days + pattern.times
const buildDayName = (code: string, t: any): string => {
  const map: Record<string, string> = {
    MONDAY: t('portal.progress.details.days.monday', 'Monday'),
    TUESDAY: t('portal.progress.details.days.tuesday', 'Tuesday'),
    WEDNESDAY: t('portal.progress.details.days.wednesday', 'Wednesday'),
    THURSDAY: t('portal.progress.details.days.thursday', 'Thursday'),
    FRIDAY: t('portal.progress.details.days.friday', 'Friday'),
    SATURDAY: t('portal.progress.details.days.saturday', 'Saturday'),
    SUNDAY: t('portal.progress.details.days.sunday', 'Sunday'),
  };
  return map[code] || code;
};


const toLocaleTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [h, m] = String(timeStr).split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

const humanScheduleRows = (pattern: any, t: any): string[] => {
  if (!pattern) return [];
  const days: string[] = Array.isArray(pattern?.recurrence_days) ? pattern.recurrence_days : [];
  const times: string[] = Array.isArray(pattern?.times) ? pattern.times : [];
  const rows: string[] = [];
  days.forEach((d) => {
    const dayName = buildDayName(d, t);
    if (times.length === 0) rows.push(dayName);
    times.forEach((tm) => {
      const time = toLocaleTime(tm);
      // Localization-friendly: allow translators to change the separator/template
      rows.push(t('portal.progress.details.dayTime', {
        day: dayName,
        time,
        defaultValue: `${dayName} - ${time}`
      }));
    });
  });
  return rows;
};

const pickBestContextItem = (e: any, lessons: any[], scheduledClasses: any[]) => {
  const now = Date.now();
  const items: any[] = [];
  (lessons || []).forEach((l: any) => {
    if (isForEnrollment(l, e)) items.push({ kind: "lesson", item: l, when: l?.scheduled_time });
  });
  (scheduledClasses || []).forEach((sc: any) => {
    if (isForEnrollment(sc, e)) items.push({ kind: "class", item: sc, when: sc?.scheduled_time });
  });
  const withTs = items.map((x) => ({ ...x, ts: parseDate(x.when)?.getTime?.() || 0 }));
  const future = withTs.filter((x) => x.ts > now).sort((a, b) => a.ts - b.ts);
  if (future.length) return future[0].item;
  const past = withTs.filter((x) => x.ts <= now).sort((a, b) => b.ts - a.ts);
  return past[0]?.item || null;
};

const statusClasses = (status: string) => {
  const s = status.toUpperCase();
  if (s === "COMPLETED") return "tw-bg-success tw-text-success-foreground";
  if (s === "CANCELED") return "tw-bg-destructive tw-text-destructive-foreground";
  return "tw-bg-warning tw-text-warning-foreground"; // scheduled / in-progress default
};

export default function EnrollmentDetailsModal({
  open,
  enrollment,
  lessons,
  scheduledClasses,
  patterns,
  onClose,
}: EnrollmentDetailsModalProps) {
  const { t } = useTranslation("portal");
  const navigate = useNavigate();

  const type = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();


  // 👉 Pick pattern for this enrollment (THEORY only)
  const selectedPattern = useMemo(() => {
  if (!enrollment) {
    return null;
  }

  const typeUpper = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();

  if (typeUpper !== "THEORY") {
    return null;
  }

  const studentId = enrollment?.student?.id ?? enrollment?.student_id;
  const courseId = enrollment?.course?.id ?? enrollment?.course_id;

  if (!studentId || !courseId) {
    return null;
  }

  // 1) Try from patterns[] (primary)
  const fromPatterns = (patterns || []).find((p: any) => {
    if (p?.course?.id !== courseId) {
      return false;
    }

    const students = p?.students || [];

    if (!Array.isArray(students)) {
      return false;
    }

    const match = students.some((s: any) =>
      typeof s === "number" ? s === studentId : s?.id === studentId
    );

    return match;
  });

  if (fromPatterns) {
    return fromPatterns;
  }

  // 2) Fallback: check scheduledClasses[].pattern
  for (const sc of scheduledClasses || []) {
    const p = sc?.pattern;

    if (!p) continue;
    if (p?.course?.id !== courseId) {
      continue;
    }

    const students = p?.students || [];

    if (!Array.isArray(students)) continue;

    const hasStudent = students.some((s: any) =>
      typeof s === "number" ? s === studentId : s?.id === studentId
    );

    if (hasStudent) {
      return p;
    }
  }

  return null;
}, [enrollment, patterns, scheduledClasses]);


  // Header context: instructor / resource
  const context = useMemo(() => {
    if (!enrollment) return { instructor: "", resource: "" };

    const typeUpper = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();

    if (typeUpper === "THEORY") {
      return {
        instructor: selectedPattern ? humanInstructor({ pattern: selectedPattern }) : "",
        resource: selectedPattern ? humanResource({ pattern: selectedPattern }) : "",
      };
    }

    // PRACTICE – use original logic
    const best = pickBestContextItem(enrollment, lessons, scheduledClasses);
    return {
      instructor: best ? humanInstructor(best) : "",
      resource: best ? humanResource(best) : "",
    };
  }, [enrollment, lessons, scheduledClasses, selectedPattern]);

  // Activity history: latest three items; source depends on type
  const history = useMemo(() => {
    if (!enrollment) return [] as any[];

    const typeUpper = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();
    const source = typeUpper === "PRACTICE" ? (lessons || []) : (scheduledClasses || []);


    return source
      .filter((it: any) => {
        if (!isForEnrollment(it, enrollment)) return false;

        const status = (it?.status || "").toUpperCase();
        return status === "COMPLETED" || status === "CANCELED";
      })
      .map((it: any) => ({ it, ts: parseDate(it?.scheduled_time)?.getTime?.() || 0 }))
      .sort((a, b) => b.ts - a.ts)
      .map(({ it }) => it)
      .slice(0, 3);
  }, [enrollment, lessons, scheduledClasses]);

  if (!open || !enrollment) return null;

  const na = String(t("portal.progress.details.na", "N/A"));

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center" onClick={onClose}>
      <div className="tw-absolute tw-inset-0 tw-bg-black/40" />
      <div className="tw-relative tw-w-full tw-max-w-md tw-mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="tw-rounded-2xl tw-border tw-border-border tw-bg-background tw-shadow-xl">
          {/* Header */}
          <div className="tw-px-5 tw-pt-5 tw-pb-3 tw-border-b tw-border-border">
            <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
              <div className="tw-space-y-2">
                <div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    {String(t("portal.progress.details.course"))}
                  </div>
                  <div className="tw-text-lg tw-font-semibold">
                    {enrollment?.course?.name || String(t("portal:booking.form.course"))}
                  </div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    {String(t("portal.progress.details.instructor"))}
                  </div>
                  <div className="tw-text-sm">{context.instructor || na}</div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    {String(t("portal.progress.details.resource"))}
                  </div>
                  <div className="tw-text-sm">{context.resource || na}</div>
                </div>
              </div>
              <button
                className="tw-text-sm tw-font-medium tw-text-muted-foreground hover:tw-text-foreground"
                onClick={onClose}
              >
                {String(t("portal.progress.details.close", "Close"))}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="tw-p-5 tw-space-y-6">
            {type === "THEORY" ? (
              <div>
                <h4 className="tw-text-sm tw-font-semibold tw-mb-2">
                  {String(t("portal.progress.details.scheduledLessons"))}
                </h4>
                {selectedPattern ? (
                  <div className="tw-space-y-1">
                    {/* Detailed rows */}
                    <div className="tw-space-y-1">
                      {humanScheduleRows(selectedPattern, t).map((row, idx) => (
                        <div key={idx} className="tw-text-sm tw-text-muted-foreground">{row}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="tw-text-sm tw-text-muted-foreground">{na}</p>
                )}
              </div>
            ) : (
              <div className="tw-flex tw-justify-center">
                <button
                  onClick={() => navigate("/book-lesson")}
                  className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-h-10 tw-px-5 tw-text-sm tw-font-medium tw-transition-colors tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-w-11/12"
                >
                  {String(t("portal.progress.details.bookLesson"))}
                </button>
              </div>
            )}

            <div>
              <h4 className="tw-text-sm tw-font-semibold tw-mb-2">
                {String(t("portal.progress.details.activityHistory"))}
              </h4>
              {history.length ? (
                <div className="tw-space-y-2">
                  {history.map((it: any, idx: number) => {
                    const status = (it?.status || "").toUpperCase();
                    const statusLabel =
                      status === "COMPLETED"
                        ? t("portal.progress.details.status.completed")
                        : status === "CANCELED"
                        ? t("portal.progress.details.status.canceled")
                        : t("portal.progress.details.status.scheduled");

                    // Base label: date • resource
                    let label = `${formatDateNoSeconds(it?.scheduled_time)} • ${humanResource(it) || na}`;

                    // THEORY: show instructor only if differs from default
                    if (type === "THEORY") {
                      const defaultInstructor = (context.instructor || "").trim();
                      const rowInstructor = humanInstructor(it).trim();
                      if (rowInstructor && defaultInstructor && rowInstructor !== defaultInstructor) {
                        label += ` • ${rowInstructor}`;
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-border tw-border-border tw-rounded-lg tw-px-3 tw-py-2"
                      >
                        <div className="tw-text-muted-foreground">{label}</div>
                        <span
                          className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${statusClasses(
                            status
                          )}`}
                        >
                          {String(statusLabel)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="tw-text-sm tw-text-muted-foreground">
                  {String(t("portal.progress.details.activityNone"))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
