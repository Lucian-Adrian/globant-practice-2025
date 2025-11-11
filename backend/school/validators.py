"""Validation helpers & reusable input normalisation utilities.

Focused on lightweight, dependency-free logic. More complex domain validation
should live in ``services.py``.
"""

from __future__ import annotations

import re
from typing import List

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
            validate_license_categories(value)
        except ValueError as e:
            raise ValidationError(str(e))

    def django_canonicalize_license_categories(value: str) -> None:
        try:
            canonicalize_license_categories(value)
        except ValueError as e:
            raise ValidationError(str(e))

except Exception:  # pragma: no cover - Django might not be installed in certain contexts
    pass
