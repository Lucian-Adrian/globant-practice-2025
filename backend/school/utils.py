"""Generic utility helpers not specific to business rules.

Avoid adding large grab-bags; prefer cohesive, documented helpers.
"""

from __future__ import annotations

def dict_without_none(data: dict) -> dict:
    """Return a shallow copy without keys whose value is ``None``."""
    return {k: v for k, v in data.items() if v is not None}
