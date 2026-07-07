from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Garment, Outfit
from .processing import remove_background
from .serializers import GarmentSerializer, OutfitSerializer


class ThrottledLoginView(TokenObtainPairView):
    throttle_scope = "login"


class ThrottledRefreshView(TokenRefreshView):
    throttle_scope = "refresh"


@api_view(["GET"])
def me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
    })


class OwnedModelViewSet(viewsets.ModelViewSet):
    """Cada usuaria solo ve y toca lo suyo."""

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GarmentViewSet(OwnedModelViewSet):
    queryset = Garment.objects.all()
    serializer_class = GarmentSerializer

    def perform_create(self, serializer):
        garment = serializer.save(owner=self.request.user)
        self._generate_cutout(garment)

    def perform_update(self, serializer):
        image_changed = "image" in serializer.validated_data
        garment = serializer.save()
        if image_changed:
            self._generate_cutout(garment)

    @staticmethod
    def _generate_cutout(garment):
        cutout = remove_background(garment.image)
        if cutout is not None:
            garment.cutout.save("cutout.png", cutout, save=True)


class OutfitViewSet(OwnedModelViewSet):
    queryset = Outfit.objects.all()
    serializer_class = OutfitSerializer
