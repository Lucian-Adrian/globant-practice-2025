"""Custom DRF exception handling ensuring consistent error shape.

Standard response format:
{
  "errors": {field: [messages]},
  "detail": optional_general_message
}
"""

from __future__ import annotations

from typing import Any
from django.db import IntegrityError
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


def exception_handler(exc: Exception, context: dict[str, Any]):  # type: ignore[override]
    # First, let DRF generate a standard response (may be None)
    response = drf_exception_handler(exc, context)

    view = context.get("view")
    request = context.get("request")
    # Log ALL exceptions with context for debugging (safe fields only)
    logger.exception(
        "API exception: %s view=%s method=%s path=%s", 
        exc.__class__.__name__, 
        getattr(view, "__class__", type(view)).__name__,
        getattr(request, "method", None),
        getattr(request, "path", None),
        exc_info=exc,
    )

    if isinstance(exc, IntegrityError):
        detail = str(exc.__cause__ or exc)
        data = {
            "errors": {"non_field_errors": ["Data integrity constraint violated"]},
            "detail": detail,
            "error_code": "integrity_error",
            "message": "Database constraint error (likely duplicate unique field)",
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, ValidationError):
        # Ensure 'errors' wrapper.
        if response is not None:
            data = response.data
            if "errors" not in data:
                data = {"errors": data}
            # Provide a generic human summary when not present
            if "message" not in data:
                # Build a short summary of first N field errors
                parts = []
                for field, msgs in list(data["errors"].items())[:3]:
                    if isinstance(msgs, (list, tuple)) and msgs:
                        parts.append(f"{field}: {msgs[0]}")
                if parts:
                    data["message"] = ", ".join(parts)
            data.setdefault("error_code", "validation_error")
            response.data = data
            return response

    if response is not None:
        # Wrap any other generated response if it looks like a dict of fields.
        if isinstance(response.data, dict) and "errors" not in response.data:
            response.data = {"errors": response.data, "message": "Request validation failed"}
        return response

    # Fallback unhandled -> generic 500 style response (avoid leaking internals)
    return Response({
        "errors": {"non_field_errors": ["Server error"]},
        "message": "Unexpected server error",
        "error_code": "server_error",
    }, status=500)
