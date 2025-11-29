from rest_framework import decorators, mixins, response, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser

from ..models import SchoolConfig
from ..serializers import SchoolConfigSerializer


class SchoolConfigViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for SchoolConfig singleton model.
    - GET  /api/school/config/                  -> list()  (returns singleton instance)
    - PUT/PATCH /api/school/config/             -> update singleton instance
    - POST /api/school/config/upload_logo/      -> upload_logo()
    - POST /api/school/config/upload_landing_image/ -> upload_landing_image()
    """

    queryset = SchoolConfig.objects.all()
    serializer_class = SchoolConfigSerializer

    def get_permissions(self):
        """
        Permissions:
        - list / retrieve (GET) -> public (AllowAny)
        - update / upload_* (write) -> only authenticated admin
        """
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        return [IsAuthenticated(), IsAdminUser()]

    def get_object(self):
        """Always return the singleton instance, create if doesn't exist."""
        obj, created = SchoolConfig.objects.get_or_create(pk=1)
        return obj

    def list(self, request, *args, **kwargs):
        """Override list to return singleton object instead of list."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)

    @decorators.action(detail=False, methods=["post"], url_path="upload_logo")
    def upload_logo(self, request):
        """
        Upload school logo image.
        Expects multipart/form-data with 'logo' file field.
        """
        if "logo" not in request.FILES:
            return response.Response(
                {"error": "No logo file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.school_logo = request.FILES["logo"]
        config.save()

        serializer = self.get_serializer(config)
        return response.Response(
            {
                "message": "Logo uploaded successfully",
                "school_logo": serializer.data.get("school_logo"),
            },
            status=status.HTTP_200_OK,
        )

    @decorators.action(detail=False, methods=["post"], url_path="upload_landing_image")
    def upload_landing_image(self, request):
        """
        Upload landing page image.
        Expects multipart/form-data with 'image' file field.
        """
        if "image" not in request.FILES:
            return response.Response(
                {"error": "No image file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.landing_image = request.FILES["image"]
        config.save()

        serializer = self.get_serializer(config)
        return response.Response(
            {
                "message": "Landing image uploaded successfully",
                "landing_image": serializer.data.get("landing_image"),
            },
            status=status.HTTP_200_OK,
        )
