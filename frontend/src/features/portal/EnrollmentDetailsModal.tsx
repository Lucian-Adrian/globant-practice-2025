import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Enrollment = any; // TODO: Replace with real types if available
type Lesson = any;
type ScheduledClass = any;

interface EnrollmentDetailsModalProps {
  open: boolean;
  enrollment: Enrollment | null;
  lessons: Lesson[];
  scheduledClasses: ScheduledClass[];
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
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

export default function EnrollmentDetailsModal({ open, enrollment, lessons, scheduledClasses, onClose }: EnrollmentDetailsModalProps) {
  const { t } = useTranslation("portal");
  const navigate = useNavigate();

  // Compute header context (instructor/resource) using next upcoming then last past
  const context = useMemo(() => {
    if (!enrollment) return { instructor: "", resource: "" };
    const best = pickBestContextItem(enrollment, lessons, scheduledClasses);
    return {
      instructor: best ? humanInstructor(best) : "",
      resource: best ? humanResource(best) : "",
    };
  }, [enrollment, lessons, scheduledClasses]);

  // Theory: upcoming scheduled classes only
  const theoryUpcoming = useMemo(() => {
    if (!enrollment) return [] as any[];
    const type = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();
    if (type !== "THEORY") return [] as any[];
    const now = Date.now();
    return (scheduledClasses || [])
      .filter((sc: any) => isForEnrollment(sc, enrollment))
      .map((sc: any) => ({ sc, ts: parseDate(sc?.scheduled_time)?.getTime?.() || 0 }))
      .filter(({ ts }) => ts && ts >= now)
      .sort((a, b) => a.ts - b.ts)
      .map(({ sc }) => sc)
      .slice(0, 3);
  }, [enrollment, scheduledClasses]);

  // Activity history: latest three items; source depends on type
  const history = useMemo(() => {
    if (!enrollment) return [] as any[];

    const type = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();
    const source = type === "PRACTICE" ? (lessons || []) : (scheduledClasses || []);

    return source
        .filter((it: any) => {
        if (!isForEnrollment(it, enrollment)) return false;

        const status = (it?.status || "").toUpperCase();
        return status === "COMPLETED" || status === "CANCELED";  // <-- ONLY these two
        })
        .map((it: any) => ({ it, ts: parseDate(it?.scheduled_time)?.getTime?.() || 0 }))
        .sort((a, b) => b.ts - a.ts)
        .map(({ it }) => it)
        .slice(0, 3);
    }, [enrollment, lessons, scheduledClasses]);

  const type = (enrollment?.course?.type || enrollment?.type || "").toUpperCase();

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
                  <div className="tw-text-xs tw-text-muted-foreground">{String(t("portal.progress.details.course"))}</div>
                  <div className="tw-text-lg tw-font-semibold">{enrollment?.course?.name || String(t("portal:booking.form.course"))}</div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-muted-foreground">{String(t("portal.progress.details.instructor"))}</div>
                  <div className="tw-text-sm">{context.instructor || na}</div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-muted-foreground">{String(t("portal.progress.details.resource"))}</div>
                  <div className="tw-text-sm">{context.resource || na}</div>
                </div>
              </div>
              <button className="tw-text-sm tw-font-medium tw-text-muted-foreground hover:tw-text-foreground" onClick={onClose}>
                {String(t("portal.progress.details.close", "Close"))}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="tw-p-5 tw-space-y-6">
            {type === "THEORY" ? (
              <div>
                <h4 className="tw-text-sm tw-font-semibold tw-mb-2">{String(t("portal.progress.details.scheduledLessons"))}</h4>
                {theoryUpcoming.length ? (
                  <div className="tw-space-y-2">
                    {theoryUpcoming.map((sc: any, idx: number) => {
                      const status = (sc?.status || "").toUpperCase();
                      const statusLabel =
                        status === "COMPLETED"
                          ? t("portal.progress.details.status.completed")
                          : status === "CANCELED"
                          ? t("portal.progress.details.status.canceled")
                          : t("portal.progress.details.status.scheduled");
                      return (
                        <div key={idx} className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-border tw-border-border tw-rounded-lg tw-px-3 tw-py-2">
                          <div className="tw-text-muted-foreground">
                            {formatDateNoSeconds(sc?.scheduled_time)} • {humanResource(sc) || na}
                          </div>
                          <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${statusClasses(status)}`}>
                            {String(statusLabel)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="tw-text-sm tw-text-muted-foreground">{String(t("portal.progress.details.noScheduled"))}</p>
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
              <h4 className="tw-text-sm tw-font-semibold tw-mb-2">{String(t("portal.progress.details.activityHistory"))}</h4>
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
                    return (
                      <div key={idx} className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-border tw-border-border tw-rounded-lg tw-px-3 tw-py-2">
                        <div className="tw-text-muted-foreground">
                          {formatDateNoSeconds(it?.scheduled_time)} • {humanResource(it) || na}
                        </div>
                        <span className={`tw-inline-flex tw-items-center tw-rounded-md tw-text-xs tw-font-medium tw-px-2.5 tw-py-0.5 ${statusClasses(status)}`}>
                          {String(statusLabel)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="tw-text-sm tw-text-muted-foreground">{String(t("portal.progress.details.activityNone"))}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
