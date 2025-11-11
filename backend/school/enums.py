"""Domain enumerations for the Driving School app.

Central single source of truth for all choice lists shared between models,
serializers and (via the meta endpoint) the frontend.  Use the StrEnum base
class so values are JSON friendly and stable for persistence.

Each enum exposes a ``choices()`` classmethod returning the Django choices
structure ``[(value, human_label), ...]``.
"""

from __future__ import annotations

from enum import Enum

try:  # Python 3.11+
    from enum import StrEnum  # type: ignore
except ImportError:  # Python 3.9 Docker image fallback

    class StrEnum(str, Enum):  # type: ignore
        """Lightweight backport so code works on Python <3.11."""

        pass


class _ChoiceStrEnum(StrEnum):
    @classmethod
    def choices(cls) -> list[tuple[str, str]]:
        return [(member.value, cls._humanize(member.value)) for member in cls]

    @staticmethod
    def _humanize(value: str) -> str:
        # Simple title-case humanization. (Labels can be localized later.)
        return value.replace("_", " ").title()


class StudentStatus(_ChoiceStrEnum):
    # New onboarding lifecycle: newly created students start as PENDING
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    GRADUATED = "GRADUATED"


class EnrollmentStatus(_ChoiceStrEnum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"  # renamed from DROPPED for clearer semantics


class LessonStatus(_ChoiceStrEnum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class CourseType(_ChoiceStrEnum):
    THEORY = "THEORY"
    PRACTICE = "PRACTICE"


class PaymentMethod(_ChoiceStrEnum):
    CASH = "CASH"
    CARD = "CARD"
    TRANSFER = "TRANSFER"


class PaymentStatus(_ChoiceStrEnum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"


class VehicleCategory(_ChoiceStrEnum):
    AM = "AM"
    A1 = "A1"
    A2 = "A2"
    A = "A"
    B1 = "B1"
    B = "B"
    C1 = "C1"
    C = "C"
    D1 = "D1"
    D = "D"
    BE = "BE"
    C1E = "C1E"
    CE = "CE"
    D1E = "D1E"
    DE = "DE"


class DayOfWeek(_ChoiceStrEnum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


def all_enums_for_meta() -> dict[str, list[str]]:
    """Return a JSON-serialisable mapping of enum names to value lists.

    The frontend can call the meta endpoint and populate select components
    dynamically instead of hardcoding strings.
    """

    def values(enum_cls: type[_ChoiceStrEnum]) -> list[str]:
        return [m.value for m in enum_cls]

    return {
        "student_status": values(StudentStatus),
        "enrollment_status": values(EnrollmentStatus),
        "lesson_status": values(LessonStatus),
        "payment_method": values(PaymentMethod),
        "payment_status": values(PaymentStatus),
        "vehicle_category": values(VehicleCategory),
        "course_type": values(CourseType),
        "day_of_week": values(DayOfWeek),
    }
