from django.conf import settings
from rest_framework import serializers

from .models import Garment, Outfit


class GarmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Garment
        fields = [
            "id", "name", "category", "color", "notes",
            "image", "cutout", "favorite", "created_at",
        ]
        read_only_fields = ["id", "cutout", "created_at"]

    def validate_image(self, value):
        if value.size > settings.MAX_GARMENT_IMAGE_BYTES:
            raise serializers.ValidationError("La foto no puede pesar más de 10 MB.")
        return value


class OutfitItemSerializer(serializers.Serializer):
    garment = serializers.IntegerField(min_value=1)
    x = serializers.FloatField()
    y = serializers.FloatField()
    scale = serializers.FloatField(min_value=0.01, max_value=10)
    rotation = serializers.FloatField(min_value=-360, max_value=360)
    z = serializers.IntegerField(min_value=0)


class OutfitSerializer(serializers.ModelSerializer):
    items = OutfitItemSerializer(many=True)

    class Meta:
        model = Outfit
        fields = ["id", "name", "occasion", "items", "favorite", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_items(self, value):
        owner = self.context["request"].user
        garment_ids = {item["garment"] for item in value}
        owned = set(
            Garment.objects.filter(owner=owner, id__in=garment_ids).values_list("id", flat=True)
        )
        missing = garment_ids - owned
        if missing:
            raise serializers.ValidationError("El outfit incluye prendas que no existen en tu clóset.")
        return value
