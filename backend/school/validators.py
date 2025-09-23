"""Validation helpers & reusable input normalisation utilities.

Focused on lightweight, dependency-free logic. More complex domain validation
should live in ``services.py``.
"""

from __future__ import annotations

import re

NAME_RE = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]{1,50}$")
PHONE_CLEAN_RE = re.compile(r"[^0-9+]")

MD_COUNTRY_CODE = "+373"


def validate_name(value: str, field: str) -> str:
    if not value:
        raise ValueError(f"{field} is required")
    if not NAME_RE.match(value):
        raise ValueError(
            f"{field} may contain only letters, spaces or '-' (max 50 chars)."
        )
    return value


def normalize_phone(raw: str) -> str:
    """Return a normalised E.164-like phone number with +373 default.

    Rules:
    * Strip spaces, parentheses, dashes and dots.
    * If starts with '00', replace with '+'.
    * If starts with '+', keep country code as is.
    * If starts with a digit and length >= 8, prefix +373 (Moldova) by default.
    * Remove any leading 0 after adding country code.
    * Does minimal validation (ensures at least 8 national digits).
    """
    if not raw:
        return raw
    cleaned = PHONE_CLEAN_RE.sub("", raw).strip()
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    if cleaned.startswith("+"):
        base = cleaned
    else:
        # Assume Moldova if no country code provided.
        # Drop leading zeros before concatenation.
        local = cleaned.lstrip("0")
        base = MD_COUNTRY_CODE + local
    # Basic length check (country code + 8 digits minimum)
    digits = re.sub(r"[^0-9]", "", base)
    if len(digits) < 8:  # very lenient; can tighten later
        raise ValueError("Phone number appears too short")
    return base

def normalize_phone(phone: str) -> str:
    if not phone:
        raise ValueError("Empty phone")
    cleaned = re.sub(r"[^\d+]", "", phone)
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    if cleaned.startswith("0") and not cleaned.startswith("+"):
        
        cleaned = "+373" + cleaned.lstrip("0")
    if not re.match(r"^\+?\d{7,15}$", cleaned):
        raise ValueError("Invalid phone format")
    return cleaned
