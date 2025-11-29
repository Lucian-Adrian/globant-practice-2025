from rest_framework import decorators, mixins, response, status, viewsets
from rest_framework.permissions import AllowAny

from ..models import SchoolConfig
from ..serializers import SchoolConfigSerializer


class SchoolConfigViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet pentru modelul singleton SchoolConfig.

    - GET  /api/school/config/                  -> list()  (returnează instanța unică)
    - PUT  /api/school/config/                  -> update() pe instanța unică
    - POST /api/school/config/upload_logo/      -> upload_logo()
    - POST /api/school/config/upload_landing_image/ -> upload_landing_image()
    """

    queryset = SchoolConfig.objects.all()
    serializer_class = SchoolConfigSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        """
        Always returns the singleton instance (pk=1). Creates it if it doesn't exist.
        """
        obj, created = SchoolConfig.objects.get_or_create(pk=1)
        return obj

    def list(self, request, *args, **kwargs):
        """
        Override list() to return a single object instead of a list.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        return response.Response(serializer.data)

    @decorators.action(
        detail=False,          # <--- IMPORTANT: fără pk în URL
        methods=["post"],
        url_path="upload_logo",
    )
    def upload_logo(self, request):
        """
        Upload school logo image.

        Acceptă un fișier imagine în multipart/form-data sub una din cheile:
        - 'logo'
        - 'file'
        - 'school_logo'
        """
        file_obj = (
            request.FILES.get("logo")
            or request.FILES.get("file")
            or request.FILES.get("school_logo")
        )

        if not file_obj:
            return response.Response(
                {"error": "No logo file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.school_logo = file_obj
        config.save()

        serializer = self.get_serializer(config, context={"request": request})
        return response.Response(
            {
                "message": "Logo uploaded successfully",
                "school_logo": serializer.data.get("school_logo"),
            },
            status=status.HTTP_200_OK,
        )

    @decorators.action(
        detail=False,          # <--- la fel, fără pk
        methods=["post"],
        url_path="upload_landing_image",
    )
    def upload_landing_image(self, request):
        """
        Upload landing page image.

        Accepts an image file in multipart/form-data under one of the keys:
        - 'image'
        - 'file'
        """
        file_obj = request.FILES.get("image") or request.FILES.get("file")

        if not file_obj:
            return response.Response(
                {"error": "No image file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        config = self.get_object()
        config.landing_image = file_obj
        config.save()

        serializer = self.get_serializer(config, context={"request": request})
        return response.Response(
            {
                "message": "Landing image uploaded successfully",
                "landing_image": serializer.data.get("landing_image"),
            },
            status=status.HTTP_200_OK,
        )
