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
        raise serializers.ValidationError({"scheduled_time": [_("validation.outsideAvailability")]})

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
        raise serializers.ValidationError({"scheduled_time": [_("validation.outsideAvailability")]})

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
