from django.core.files.base import ContentFile
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import AvatarPhoto, Garment, Outfit, OutfitRender
from .processing import remove_background
from .serializers import (
    AvatarPhotoSerializer,
    GarmentSerializer,
    OutfitRenderSerializer,
    OutfitSerializer,
)
from .tryon import TryOnError, render_outfit


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


class AvatarPhotoView(APIView):
    """Foto de cuerpo completo de la usuaria (base real del probador)."""

    def get(self, request):
        photo = AvatarPhoto.objects.filter(owner=request.user).first()
        if photo is None:
            return Response(None)
        return Response(AvatarPhotoSerializer(photo, context={"request": request}).data)

    def post(self, request):
        photo = AvatarPhoto.objects.filter(owner=request.user).first()
        serializer = AvatarPhotoSerializer(photo, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        photo = serializer.save(owner=request.user)
        cutout = remove_background(photo.image)
        if cutout is not None:
            photo.cutout.save("cutout.png", cutout, save=True)
        return Response(
            AvatarPhotoSerializer(photo, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class OutfitViewSet(OwnedModelViewSet):
    queryset = Outfit.objects.all()
    serializer_class = OutfitSerializer

    @action(detail=True, methods=["post"], throttle_classes=[], url_path="render")
    def render_realistic(self, request, pk=None):
        outfit = self.get_object()

        avatar = AvatarPhoto.objects.filter(owner=request.user).first()
        if avatar is None:
            return Response(
                {"detail": "Primero sube tu foto de cuerpo completo en 'Mi foto'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = sorted(outfit.items, key=lambda item: item.get("z", 0))
        garments = []
        garment_map = {g.id: g for g in Garment.objects.filter(owner=request.user)}
        for item in items:
            garment = garment_map.get(item.get("garment"))
            if garment is not None:
                garments.append(garment)
        if not garments:
            return Response(
                {"detail": "El outfit no tiene prendas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            image_bytes = render_outfit(avatar.image, garments)
        except TryOnError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        render = OutfitRender(outfit=outfit)
        render.image.save("render.png", ContentFile(image_bytes), save=True)
        return Response(
            OutfitRenderSerializer(render, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], url_path=r"renders/(?P<render_id>\d+)")
    def delete_render(self, request, pk=None, render_id=None):
        outfit = self.get_object()
        deleted, _ = OutfitRender.objects.filter(outfit=outfit, id=render_id).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
