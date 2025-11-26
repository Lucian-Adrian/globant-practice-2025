"""Validation helpers & reusable input normalisation utilities.

Focused on lightweight, dependency-free logic. More complex domain validation
should live in ``services.py``.
"""

from __future__ import annotations

import re
from typing import List, NamedTuple, Optional
from datetime import datetime, timedelta

# --- Lesson validation helpers (Phase 2 refactor) ---
from django.conf import settings
from django.utils.translation import gettext as _
from rest_framework import serializers

try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except Exception:  # pragma: no cover
    ZoneInfo = None  # type: ignore

class LessonContext(NamedTuple):
    enrollment: object
    instructor: object
    resource: Optional[object]
    start: Optional[datetime]
    duration: int
    status: str

def resolve_lesson_context(instance, attrs) -> LessonContext:
    """Extract lesson context values from attrs/instance mirroring current logic.

    - resource respects explicit None in attrs when key is present
    - duration_minutes falls back to instance or 90
    - status falls back to instance or 'SCHEDULED'
    """
    enrollment = attrs.get("enrollment") or (instance.enrollment if instance else None)
    instructor = attrs.get("instructor") or (instance.instructor if instance else None)
    resource = (
        attrs.get("resource") if ("resource" in attrs) else (instance.resource if instance else None)
    )
    start = attrs.get("scheduled_time") or (instance.scheduled_time if instance else None)
    duration = attrs.get("duration_minutes") or (instance.duration_minutes if instance else 90)
    status = attrs.get("status") or (instance.status if instance else "SCHEDULED")
    return LessonContext(enrollment, instructor, resource, start, int(duration or 90), str(status))

def validate_lesson_required_fields(enrollment, instructor, start) -> None:
    errors: dict[str, list[str]] = {}
    if not enrollment:
        errors["enrollment_id"] = [_("validation.requiredField")]
    if not instructor:
        errors["instructor_id"] = [_("validation.requiredField")]
    if not start:
        errors["scheduled_time"] = [_("validation.requiredField")]
    if errors:
        raise serializers.ValidationError(errors)

def validate_lesson_practice_and_vehicle(enrollment, resource) -> None:
    # PRACTICE-only enrollment rule
    course = getattr(enrollment, "course", None)
    course_type = (
        (getattr(enrollment, "type", None) or getattr(course, "type", None) or "")
    ).upper()
    if course_type and course_type != "PRACTICE":
        raise serializers.ValidationError(
            {"enrollment_id": [_("validation.practiceEnrollmentRequired")]}
        )

    # Vehicle-only (capacity must equal 2 when resource is set)
    if resource is not None:
        cap = getattr(resource, "max_capacity", None)
        if cap is not None and cap != 2:
            raise serializers.ValidationError(
                {"resource_id": [_("validation.vehicleResourceRequired")]}
            )

def validate_lesson_conflicts(enrollment, instructor, resource, start, end, instance) -> None:
    from .models import Lesson as LessonModel

    ACTIVE_STATUSES = ["SCHEDULED", "COMPLETED"]

    exclude_ids = []
    if instance and getattr(instance, "pk", None):
        exclude_ids = [instance.pk]

    def has_overlap(qs):
        for other in qs:
            if other.pk in exclude_ids:
                continue
            other_end = other.scheduled_time + timedelta(minutes=int(other.duration_minutes or 60))
            if (start < other_end) and (other.scheduled_time < end):  # adjacency allowed
                return True
        return False

    # Instructor conflicts
    instr_id = getattr(instructor, "id", None)
    instr_qs = LessonModel.objects.filter(
        instructor_id=instr_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    )
    if has_overlap(instr_qs):
        raise serializers.ValidationError({"instructor_id": [_("validation.instructorConflict")]})

    # Student conflicts
    student_id = getattr(enrollment, "student_id", None)
    if student_id:
        student_qs = LessonModel.objects.filter(
            enrollment__student_id=student_id,
            status__in=ACTIVE_STATUSES,
            scheduled_time__lt=end,
            scheduled_time__gte=start - timedelta(hours=8),
        )
        if has_overlap(student_qs):
            raise serializers.ValidationError({"enrollment_id": [_("validation.studentConflict")]})

    # Resource conflicts
    res_id = getattr(resource, "id", None) if resource else None
    if res_id:
        res_qs = LessonModel.objects.filter(
            resource_id=res_id,
            status__in=ACTIVE_STATUSES,
            scheduled_time__lt=end,
            scheduled_time__gte=start - timedelta(hours=8),
        )
        if has_overlap(res_qs):
            raise serializers.ValidationError({"resource_id": [_("validation.resourceConflict")]})


# --- Phase 3: Shared booking helpers (cross-entity) ---
def _overlaps(start: datetime, end: datetime, other_start: datetime, other_duration: Optional[int]) -> bool:
    try:
        odur = int(other_duration or 60)
    except Exception:
        odur = 60
    other_end = other_start + timedelta(minutes=odur)
    return (start < other_end) and (other_start < end)


def check_instructor_booking_conflicts(instructor_id, start: datetime, end: datetime, instance=None) -> None:
    """Cross-entity instructor overlap across Lessons and ScheduledClass.

    - ACTIVE_STATUSES: SCHEDULED, COMPLETED
    - Time window: scheduled_time__lt=end and scheduled_time__gte=start-8h
    - Excludes the current instance by pk if provided
    - Raises: {"instructor_id": ["validation.instructorConflict"]}
    """
    if not instructor_id or not start or not end:
        return

    from .models import Lesson as LessonModel, ScheduledClass as ScheduledClassModel

    ACTIVE_STATUSES = ["SCHEDULED", "COMPLETED"]
    exclude_pk = getattr(instance, "pk", None)

    # Lessons for instructor
    lesson_qs = LessonModel.objects.filter(
        instructor_id=instructor_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    )
    for other in lesson_qs:
        if exclude_pk and other.pk == exclude_pk:
            continue
        if _overlaps(start, end, other.scheduled_time, getattr(other, "duration_minutes", 60)):
            raise serializers.ValidationError({"instructor_id": [_("validation.instructorConflict")]})

    # Scheduled classes for instructor
    class_qs = ScheduledClassModel.objects.filter(
        instructor_id=instructor_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    )
    for other in class_qs:
        if exclude_pk and other.pk == exclude_pk:
            continue
        if _overlaps(start, end, other.scheduled_time, getattr(other, "duration_minutes", 60)):
            raise serializers.ValidationError({"instructor_id": [_("validation.instructorConflict")]})


def check_lesson_student_conflicts(enrollment, start: datetime, end: datetime, instance=None) -> None:
    """Cross-entity student conflict on LESSON side:
    - Check Lessons by enrollment.student_id
    - Check ScheduledClass where student is enrolled (M2M)
    - Same ACTIVE_STATUSES and window; exclude instance.pk if provided
    - Raises: {"enrollment_id": ["validation.studentConflict"]}
    """
    if not enrollment or not start or not end:
        return
    student_id = getattr(enrollment, "student_id", None)
    if not student_id:
        return

    from .models import Lesson as LessonModel, ScheduledClass as ScheduledClassModel

    ACTIVE_STATUSES = ["SCHEDULED", "COMPLETED"]
    exclude_pk = getattr(instance, "pk", None)

    # Lessons for student
    stu_lesson_qs = LessonModel.objects.filter(
        enrollment__student_id=student_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    )
    for other in stu_lesson_qs:
        if exclude_pk and other.pk == exclude_pk:
            continue
        if _overlaps(start, end, other.scheduled_time, getattr(other, "duration_minutes", 60)):
            raise serializers.ValidationError({"enrollment_id": [_("validation.studentConflict")]})

    # Scheduled classes containing the student
    stu_class_qs = ScheduledClassModel.objects.filter(
        students__id=student_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    ).distinct()
    for other in stu_class_qs:
        if exclude_pk and other.pk == exclude_pk:
            continue
        if _overlaps(start, end, other.scheduled_time, getattr(other, "duration_minutes", 60)):
            raise serializers.ValidationError({"enrollment_id": [_("validation.studentConflict")]})


def check_scheduled_class_resource_conflicts(resource, start: datetime, end: datetime, instance=None) -> None:
    """Resource conflicts for ScheduledClass (classrooms vs classrooms only).
    Lessons remain separate on vehicle side.
    """
    if not resource or not start or not end:
        return
    res_id = getattr(resource, "id", None)
    if not res_id:
        return

    from .models import ScheduledClass as ScheduledClassModel

    ACTIVE_STATUSES = ["SCHEDULED", "COMPLETED"]
    exclude_pk = getattr(instance, "pk", None)

    qs = ScheduledClassModel.objects.filter(
        resource_id=res_id,
        status__in=ACTIVE_STATUSES,
        scheduled_time__lt=end,
        scheduled_time__gte=start - timedelta(hours=8),
    )
    for other in qs:
        if exclude_pk and other.pk == exclude_pk:
            continue
        if _overlaps(start, end, other.scheduled_time, getattr(other, "duration_minutes", 60)):
            raise serializers.ValidationError({"resource_id": [_("validation.resourceConflict")]})


def validate_theory_only_course_for_class(course) -> None:
    """ScheduledClass may only be created for THEORY courses."""
    if not course:
        return
    try:
        from .enums import CourseType as CourseTypeEnum  # type: ignore
        theory_val = getattr(CourseTypeEnum, "THEORY").value
    except Exception:  # pragma: no cover
        theory_val = "THEORY"
    ctype = str(getattr(course, "type", "") or "").upper()
    if ctype and ctype != str(theory_val).upper():
        raise serializers.ValidationError({"course_id": [_("validation.theoryOnly")]})


def validate_classroom_resource_for_class(resource) -> None:
    """ScheduledClass requires classroom-type resources (not vehicles)."""
    if not resource:
        return
    if hasattr(resource, "is_vehicle") and callable(resource.is_vehicle):
        try:
            is_vehicle = resource.is_vehicle()
        except (AttributeError, TypeError, ValueError):
            # On unexpected shape, be conservative and skip
            return
        if is_vehicle:
            raise serializers.ValidationError({"resource_id": [_("validation.classroomResourceRequired")]})
    else:
        cap = getattr(resource, "max_capacity", None)
        try:
            if cap is not None and int(cap) <= 2:
                raise serializers.ValidationError({"resource_id": [_("validation.classroomResourceRequired")]})
        except (TypeError, ValueError):
            # On unexpected shape, be conservative and skip
            return


def validate_scheduled_class_capacity(resource, max_students, instance=None) -> None:
    """Enforce positive capacity, resource capacity limit, and not below current enrollment."""
    if max_students is None or resource is None:
        return
    try:
        m = int(max_students)
    except Exception:
        m = None
    if not m or m <= 0:
        raise serializers.ValidationError({"max_students": [_("validation.capacityExceeded")]})

    rcap = getattr(resource, "max_capacity", None)
    try:
        rcap_int = int(rcap) if rcap is not None else None
    except Exception:
        rcap_int = None
    if rcap_int is not None and m > rcap_int:
        raise serializers.ValidationError({"max_students": [_("validation.capacityExceeded")]})

    if instance is not None and getattr(instance, "pk", None):
        try:
            current = int(instance.current_enrollment())
        except Exception:
            current = 0
        if m < current:
            raise serializers.ValidationError({"max_students": [_("validation.capacityBelowEnrolled")]})


def validate_category_and_license(course, instructor, resource) -> None:
    """Generic category and instructor license checks reused by Lessons/ScheduledClass.

    - If resource.category != course.category -> resource_id: validation.categoryMismatch
    - If instructor.license_categories doesn't include course.category -> instructor_id: validation.instructorLicenseMismatch
    """
    course_category = getattr(course, "category", None)
    if resource and course_category:
        if getattr(resource, "category", None) != course_category:
            raise serializers.ValidationError({"resource_id": [_("validation.categoryMismatch")]})
    if course_category:
        lic_raw = getattr(instructor, "license_categories", "") or ""
        cats = [c.strip().upper() for c in str(lic_raw).split(",") if c.strip()]
        if str(course_category).upper() not in cats:
            raise serializers.ValidationError({"instructor_id": [_("validation.instructorLicenseMismatch")]})


# --- New helpers: ScheduledClass student enrollment and capacity ---
def validate_scheduled_class_students_enrolled(course, students) -> None:
    """
    Ensure every student attached to a scheduled class is enrolled in this course.

    - Expects `course` to be a Course instance and `students` an iterable of Student instances
    - Raises: {"student_ids": ["validation.studentNotEnrolledToCourse"]}
    """
    if not course or not students:
        return
    from .models import Enrollment

    not_enrolled_names = []
    for student in students:
        sid = getattr(student, "id", None)
        if not sid:
            # Skip silently if student object is malformed
            continue
        exists = Enrollment.objects.filter(student_id=sid, course_id=getattr(course, "id", None)).exists()
        if not exists:
            name = f"{getattr(student, 'first_name', '')} {getattr(student, 'last_name', '')}".strip() or str(sid)
            not_enrolled_names.append(name)
    
    if not_enrolled_names:
        names_str = ", ".join(not_enrolled_names)
        raise serializers.ValidationError({
            "student_ids": [
                _("validation.studentNotEnrolledToCourse") + f" ({names_str})"
            ]
        })


def validate_scheduled_class_students_capacity(resource, max_students, students) -> None:
    """
    Ensure the number of attached students does not exceed max_students or room capacity.

    - Cannot exceed `max_students` if provided
    - Cannot exceed `resource.max_capacity` if available
    - Raises field errors on `student_ids` with i18n keys matching frontend
    """
    if not students:
        return

    try:
        count = len(list(students))
    except Exception:
        # If students is not sized, try to iterate and count
        count = sum(1 for _ in students)

    # Business limit: max_students
    if max_students is not None:
        try:
            m = int(max_students)
        except Exception:
            m = None
        if m is not None and count > m:
            raise serializers.ValidationError({
                "student_ids": [
                    _("validation.capacityBelowSelected") + f" (Selected: {count}, Max: {m})"
                ]
            })

    # Physical capacity: resource.max_capacity
    cap = getattr(resource, "max_capacity", None) if resource is not None else None
    try:
        cap_int = int(cap) if cap is not None else None
    except Exception:
        cap_int = None
    if cap_int is not None and count > cap_int:
        raise serializers.ValidationError({
            "student_ids": [
                _("validation.selectedStudentsExceedCapacity") + f" (Selected: {count}, Capacity: {cap_int})"
            ]
        })
def validate_lesson_resource_availability(resource, status) -> None:
    if (status == "SCHEDULED") and resource is not None:
        try:
            if getattr(resource, "is_available", True) is False:
                raise serializers.ValidationError({"resource_id": [_("validation.resourceUnavailable")]})
        except AttributeError:
            # If resource object doesn't expose is_available, skip gracefully
            pass

def validate_instructor_availability(instructor_id, start) -> None:
    # Lazy import to avoid circular import with models -> validators
    from .models import InstructorAvailability
    # Convert start to business-local timezone before computing day/hour
    biz_tz_name = getattr(settings, "BUSINESS_TZ", "Europe/Chisinau")
    try:
        biz_tz = ZoneInfo(biz_tz_name) if ZoneInfo else None
    except Exception:
        biz_tz = None
    local_start = start.astimezone(biz_tz) if (biz_tz and getattr(start, "tzinfo", None)) else start

    WEEKDAYS = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ]
    day_enum = WEEKDAYS[(local_start.weekday())]  # Monday=0

    # Fetch availability slots and build intervals [t[i], t[i+1]) in minutes since midnight
    avail = InstructorAvailability.objects.filter(instructor_id=instructor_id, day=day_enum)
    slots: set[str] = set()
    for a in avail:
        try:
            for h in list(a.hours or []):
                if isinstance(h, str):
                    parts = h.split(":")
                    hh = parts[0].zfill(2) if parts else "00"
                    mm = parts[1].zfill(2) if len(parts) > 1 else "00"
                    slots.add(f"{hh}:{mm}")
        except Exception:
            # Skip malformed/corrupted availability records
            pass
    if not slots:
        # Strict validation: if no availability is defined, the instructor is not working.
        raise serializers.ValidationError({"instructor_id": [_("validation.instructorNotWorking")]})

    def to_minutes(hhmm: str) -> int:
        # Validate format: must contain colon and both parts numeric
        if not isinstance(hhmm, str) or ":" not in hhmm:
            raise serializers.ValidationError({"scheduled_time": [_("validation.invalidTimeFormat")]})
        parts = hhmm.split(":")
        if len(parts) != 2:
            raise serializers.ValidationError({"scheduled_time": [_("validation.invalidTimeFormat")]})
        hh, mm = parts
        try:
            hh_int = int(hh)
            mm_int = int(mm)
        except ValueError:
            raise serializers.ValidationError({"scheduled_time": [_("validation.invalidTimeFormat")]})
        if not (0 <= hh_int <= 23 and 0 <= mm_int <= 59):
            raise serializers.ValidationError({"scheduled_time": [_("validation.invalidTimeFormat")]})
        return hh_int * 60 + mm_int

    slot_list = sorted(slots)
    slot_mins = [to_minutes(s) for s in slot_list]
    start_mins = local_start.hour * 60 + local_start.minute

    ok = False
    # Accept exact last listed time
    if start_mins == slot_mins[-1]:
        ok = True
    else:
        # Accept any start within [slot[i], slot[i+1])
        for i in range(len(slot_mins) - 1):
            if slot_mins[i] <= start_mins < slot_mins[i + 1]:
                ok = True
                break
    if not ok:
        # Format slots for friendly error message
        slots_str = ", ".join(sorted(slots))
        raise serializers.ValidationError({
            "scheduled_time": [
                _("validation.outsideAvailability") + f" (Working hours: {slots_str})"
            ]
        })

def validate_instructor_availability_for_pattern(instructor_id, recurrence_days, times) -> None:
    """
    Validates that the instructor is available for all specified days and times.
    recurrence_days: list of day names (e.g. ['MONDAY', 'WEDNESDAY'])
    times: list of time strings (e.g. ['09:00', '14:00'])
    """
    if not instructor_id or not recurrence_days or not times:
        return

    from .models import InstructorAvailability
    
    # We need to check every combination
    for day in recurrence_days:
        # Fetch availability for this day
        avail = InstructorAvailability.objects.filter(instructor_id=instructor_id, day=day)
        
        # Parse slots for this day
        slots: set[str] = set()
        for a in avail:
            try:
                for h in list(a.hours or []):
                    if isinstance(h, str):
                        parts = h.split(":")
                        hh = parts[0].zfill(2) if parts else "00"
                        mm = parts[1].zfill(2) if len(parts) > 1 else "00"
                        slots.add(f"{hh}:{mm}")
            except Exception:
                pass
        
        if not slots:
             # If no availability is defined for this day, we allow scheduling.
             continue

        slot_list = sorted(slots)
        
        def to_minutes(hhmm: str) -> int:
            parts = hhmm.split(":")
            return int(parts[0]) * 60 + int(parts[1])

        slot_mins = [to_minutes(s) for s in slot_list]

        for time_str in times:
            try:
                t_mins = to_minutes(time_str)
            except (ValueError, IndexError):
                continue # Should be caught by field validation

            ok = False
            # Logic from validate_instructor_availability
            if slot_mins and t_mins == slot_mins[-1]:
                ok = True
            elif slot_mins:
                for i in range(len(slot_mins) - 1):
                    if slot_mins[i] <= t_mins < slot_mins[i + 1]:
                        ok = True
                        break
            
            if not ok:
                 raise serializers.ValidationError({
                     "instructor_id": [_("validation.outsideAvailability")]
                 })

def validate_lesson_category_and_license(enrollment, instructor, resource) -> None:
    # Category & license checks
    course = getattr(enrollment, "course", None)
    course_category = getattr(course, "category", None)
    if resource and course_category:
        if getattr(resource, "category", None) != course_category:
            raise serializers.ValidationError({"resource_id": [_("validation.categoryMismatch")]})
    if course_category:
        lic_raw = getattr(instructor, "license_categories", "") or ""
        cats = [c.strip().upper() for c in str(lic_raw).split(",") if c.strip()]
        if str(course_category).upper() not in cats:
            raise serializers.ValidationError({"instructor_id": [_("validation.instructorLicenseMismatch")]})

try:
    # enums used for license category validation
    from .enums import VehicleCategory  # type: ignore
except Exception:  # pragma: no cover
    VehicleCategory = None  # type: ignore

NAME_RE = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]{1,50}$")
PHONE_CLEAN_RE = re.compile(r"[^0-9+]")
# Allow + followed by 8–16 digits total (international style, conservative upper bound)
PHONE_STRICT_RE = re.compile(r"^\+\d{8,16}$")

MD_COUNTRY_CODE = "+373"


def validate_name(value: str, field: str) -> str:
    """Basic human name validation (letters, spaces, hyphen, diacritics)."""
    if not value:
        raise ValueError(f"{field} is required")
    if not NAME_RE.match(value):
        raise ValueError(f"{field} may contain only letters, spaces or '-' (max 50 chars).")
    return value


def normalize_phone(raw: str) -> str:
    """Return a normalised E.164-like phone number with +373 default.

    Steps:
    - Strip spaces, parentheses, dashes and dots.
    - Convert leading "00" to "+".
    - If no leading '+', assume Moldova +373 and strip local leading zeros.
    - Perform a minimal digit length check (>= 8 national digits total).
    NOTE: Further strict format enforcement happens in ``validate_phone``.
    """
    if not raw:
        return raw
    cleaned = PHONE_CLEAN_RE.sub("", raw).strip()
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    if cleaned.startswith("+"):
        base = cleaned
    else:
        local = cleaned.lstrip("0")
        base = MD_COUNTRY_CODE + local
    digits = re.sub(r"[^0-9]", "", base)
    if len(digits) < 8:
        raise ValueError("Phone number appears too short")
    return base


def validate_phone(raw: str, field: str = "Phone number") -> str:
    """Normalize then strictly validate phone number format.

    Returns the normalized value if valid, raises ValueError otherwise.
    Strict rule: final value must match ``+<8-16 digits>``.
    """
    value = normalize_phone(raw)
    compact = value.replace(" ", "")
    if not PHONE_STRICT_RE.match(compact):
        raise ValueError(
            f"{field} must be in international format +<country><digits> (8-16 digits total)"
        )
    return compact


def normalize_license_categories(raw: str) -> str:
    """Return comma-separated uppercase unique vehicle categories (no spaces).

    Example: "b, be ,B" -> "B,BE"
    """
    if raw is None:
        return ""
    parts = [p.strip().upper() for p in str(raw).split(",")]
    parts = [p for p in parts if p]
    # stable de-duplication
    seen: List[str] = []
    for p in parts:
        if p not in seen:
            seen.append(p)
    return ",".join(seen)


def validate_license_categories(raw: str) -> str:
    """Normalize then validate license category tokens against VehicleCategory.

    Returns normalized string or raises ValueError with a helpful message.
    """
    normalized = normalize_license_categories(raw)
    if not normalized:
        raise ValueError("At least one category is required")
    allowed = {m.value for m in (VehicleCategory or [])} if VehicleCategory else set()
    invalid = [p for p in normalized.split(",") if allowed and p not in allowed]
    if invalid:
        raise ValueError(f"Invalid categories: {', '.join(invalid)}")
    return normalized


def canonicalize_license_categories(raw: str) -> str:
    """Return a canonical comma-separated list of vehicle license categories.

    - Uppercase, trim items
    - Remove duplicates while preserving the first-seen order
    - Validate each token against VehicleCategory enum
    - Join with commas without spaces
    """
    if raw is None:
        return ""
    from .enums import VehicleCategory

    allowed = {m.value for m in VehicleCategory}
    parts = [p.strip().upper() for p in str(raw).split(",") if p.strip()]
    if not parts:
        return ""
    seen: list[str] = []
    for p in parts:
        if p not in allowed:
            raise ValueError(f"Invalid category '{p}'. Allowed: {', '.join(sorted(allowed))}")
        if p not in seen:
            seen.append(p)
    return ",".join(seen)


# Django validator adapters (so we can reuse same logic at model field level)
try:  # optional import; keeps this module reusable outside Django context
    from django.core.exceptions import ValidationError  # type: ignore

    def django_validate_name(value: str) -> None:
        try:
            validate_name(value, "Name")
        except ValueError as e:
            raise ValidationError(str(e))

    def django_validate_phone(value: str) -> None:
        try:
            validate_phone(value, "Phone number")
        except ValueError as e:
            raise ValidationError(str(e))

    def django_validate_license_categories(value: str) -> None:
        try:
            canonicalize_license_categories(value)
        except ValueError as e:
            raise ValidationError(str(e))

except Exception:  # pragma: no cover - Django might not be installed in certain contexts
    pass


def validate_file_size(file, max_mb=5):
    """Validate uploaded file size.

    Args:
        file: Django UploadedFile instance
        max_mb: Maximum file size in megabytes (default: 5MB)

    Raises:
        ValueError: If file exceeds maximum size
    """
    if file.size > max_mb * 1024 * 1024:
        raise ValueError(f"File size must not exceed {max_mb}MB (current: {file.size / (1024 * 1024):.2f}MB)")


def validate_image_file(file):
    """Validate uploaded file is a valid image.

    Args:
        file: Django UploadedFile instance

    Raises:
        ValueError: If file is not a valid image format
    """
    import os
    from PIL import Image

    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValueError(f"Invalid file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}")

    if file.content_type and not file.content_type.startswith('image/'):
        raise ValueError(f"Invalid content type '{file.content_type}'. Must be an image.")

    try:
        image = Image.open(file)
        image.verify()
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")

    file.seek(0)


def validate_upload_file(file, max_mb=5, file_type='image'):
    """Combined validation for uploaded files.

    Args:
        file: Django UploadedFile instance
        max_mb: Maximum file size in megabytes
        file_type: Type of file ('image')

    Raises:
        ValueError: If validation fails
    """
    validate_file_size(file, max_mb=max_mb)
    if file_type == 'image':
        validate_image_file(file)
