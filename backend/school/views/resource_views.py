"""
Resource and Vehicle ViewSets.

Handles CRUD operations for Resources (classrooms, vehicles) and Vehicles with CSV import/export.
"""
import csv
from io import StringIO, TextIOWrapper

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import decorators, response, status
from rest_framework.filters import OrderingFilter

from ..models import Resource, Vehicle
from ..serializers import ResourceSerializer, VehicleSerializer
from .base import FullCrudViewSet


class VehicleViewSet(FullCrudViewSet):
    queryset = Vehicle.objects.all().order_by("-year")
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "is_available": ["exact"],
        "category": ["exact"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = ["id", "make", "model", "license_plate", "year", "category", "is_available"]
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(fields)
        for obj in qs:
            writer.writerow(
                [
                    obj.id,
                    obj.make,
                    obj.model,
                    obj.license_plate,
                    obj.year,
                    obj.category,
                    obj.is_available,
                ]
            )
        resp = HttpResponse(buffer.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=vehicles.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get("file") or request.FILES.get("csv")
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        text_stream = (
            TextIOWrapper(upload.file, encoding="utf-8") if hasattr(upload, "file") else upload
        )
        reader = csv.DictReader(text_stream)
        # Critical columns that must be present
        required = {"make", "model", "license_plate", "year", "category"}
        # Optional columns that can be blank (will use defaults)
        optional = {"is_available"}

        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_ids, updated_ids, errors = [], [], []
        for idx, row in enumerate(reader, start=2):
            # Build data dict with required fields
            data = {
                "make": (row.get("make") or "").strip(),
                "model": (row.get("model") or "").strip(),
                "license_plate": (row.get("license_plate") or "").strip(),
                "year": (row.get("year") or "").strip(),
                "category": (row.get("category") or "").strip(),
            }

            # Add optional fields only if present and non-blank
            is_avail_val = (row.get("is_available") or "").strip()
            if is_avail_val:
                data["is_available"] = is_avail_val.lower() in ["1", "true", "yes"]
            license_plate = data.get("license_plate")

            # Use update_or_create to prevent duplicates based on license_plate
            try:
                existing = Vehicle.objects.filter(license_plate=license_plate).first()
                if existing:
                    serializer = self.get_serializer(existing, data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        updated_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
                else:
                    serializer = self.get_serializer(data=data)
                    if serializer.is_valid():
                        obj = serializer.save()
                        created_ids.append(obj.id)
                    else:
                        errors.append({"row": idx, "errors": serializer.errors})
            except Exception as e:
                errors.append({"row": idx, "errors": {"general": [str(e)]}})

        return response.Response(
            {
                "created": len(created_ids),
                "updated": len(updated_ids),
                "created_ids": created_ids,
                "updated_ids": updated_ids,
                "errors": errors,
            }
        )


class ResourceViewSet(FullCrudViewSet):
    queryset = Resource.objects.all().order_by("name")
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "is_available": ["exact"],
        "category": ["exact"],
        "max_capacity": ["exact", "lte", "gte", "gt", "lt"],
    }

    @decorators.action(detail=False, methods=["get"], url_path="available")
    def available_resources(self, request):
        """Get resources available for a specific time period"""
        resource_type = request.query_params.get("type")  # 'vehicle' or 'classroom'

        qs = self.get_queryset().filter(is_available=True)

        if resource_type == "vehicle":
            qs = qs.filter(max_capacity=2)
        elif resource_type == "classroom":
            qs = qs.filter(max_capacity__gt=2)

        # TODO: Add time-based availability filtering using start_time and end_time query params
        # For now, just return all available resources

        serializer = self.get_serializer(qs, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        fields = [
            "id",
            "name",
            "max_capacity",
            "category",
            "is_available",
            "license_plate",
            "make",
            "model",
            "year",
        ]
        qs = self.filter_queryset(self.get_queryset())

        buf = StringIO()
        w = csv.writer(buf)
        w.writerow(fields)
        for r in qs:
            w.writerow(
                [
                    r.id,
                    r.name,
                    r.max_capacity,
                    r.category or "",
                    "1" if r.is_available else "0",
                    r.license_plate or "",
                    r.make or "",
                    r.model or "",
                    r.year or "",
                ]
            )

        resp = HttpResponse(buf.getvalue(), content_type="text/csv")
        resp["Content-Disposition"] = "attachment; filename=resources.csv"
        return resp

    @decorators.action(detail=False, methods=["post"], url_path="import")
    def import_csv(self, request):
        upload = request.FILES.get("file") or request.FILES.get("csv")
        if not upload:
            return response.Response(
                {"detail": "No file uploaded. Use form field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stream = TextIOWrapper(upload.file, encoding="utf-8") if hasattr(upload, "file") else upload
        reader = csv.DictReader(stream)

        # Required columns for every row
        required_cols = {"name", "max_capacity", "category"}
        header = set(reader.fieldnames or [])
        missing = required_cols - header
        if missing:
            return response.Response(
                {"detail": f"Missing required columns: {', '.join(sorted(missing))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_ids, updated_ids, errors = [], [], []

        for idx, row in enumerate(reader, start=2):
            # Trim known fields
            data = {k: (row.get(k) or "").strip() for k in reader.fieldnames}

            # Normalize primitives
            try:
                data["max_capacity"] = int(data.get("max_capacity") or 0)
            except ValueError:
                errors.append({"row": idx, "errors": {"max_capacity": ["Invalid number"]}})
                continue

            if data.get("year", "") != "":
                try:
                    data["year"] = int(data["year"])
                except ValueError:
                    errors.append({"row": idx, "errors": {"year": ["Invalid number"]}})
                    continue
            else:
                data["year"] = None

            data["is_available"] = str(data.get("is_available", "")).lower() in ("1", "true", "yes")

            # Empty optional vehicle fields -> None
            for f in ("license_plate", "make", "model"):
                if not data.get(f):
                    data[f] = None

            # Conditional requirements:
            # vehicle = capacity == 2 → plate/make/model/year required
            is_vehicle = data["max_capacity"] == 2
            if is_vehicle:
                missing_vehicle = [
                    f
                    for f in ("license_plate", "make", "model", "year")
                    if data.get(f) in (None, "")
                ]
                if missing_vehicle:
                    errors.append(
                        {
                            "row": idx,
                            "errors": {
                                f: [
                                    "This field is required for vehicle-type resources (max_capacity == 2)."
                                ]
                                for f in missing_vehicle
                            },
                        }
                    )
                    continue

            # Upsert key: plate for vehicles, name for classrooms
            lookup = (
                {"license_plate": data["license_plate"]}
                if (is_vehicle and data.get("license_plate"))
                else {"name": data["name"]}
            )

            try:
                existing = Resource.objects.filter(**lookup).first()
                ser = (
                    ResourceSerializer(existing, data=data, partial=bool(existing))
                    if existing
                    else ResourceSerializer(data=data)
                )
                if ser.is_valid():
                    obj = ser.save()
                    (updated_ids if existing else created_ids).append(obj.id)
                else:
                    errors.append({"row": idx, "errors": ser.errors})
            except Exception as e:
                errors.append({"row": idx, "errors": {"general": [str(e)]}})

        return response.Response(
            {
                "created": len(created_ids),
                "updated": len(updated_ids),
                "created_ids": created_ids,
                "updated_ids": updated_ids,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )
