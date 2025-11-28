from django.http import HttpResponse
from rest_framework import response, status
from rest_framework.permissions import AllowAny

from .base import FullCrudViewSet
from ..models import Address
from ..serializers import AddressSerializer


class AddressViewSet(FullCrudViewSet):
    """ViewSet for Address model."""

    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [AllowAny]