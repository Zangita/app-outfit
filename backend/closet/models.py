import uuid

from django.conf import settings
from django.db import models


def garment_upload_path(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    return f"garments/{instance.owner_id}/{uuid.uuid4().hex}.{ext}"


def cutout_upload_path(instance, filename):
    return f"cutouts/{instance.owner_id}/{uuid.uuid4().hex}.png"


def avatar_upload_path(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    return f"avatars/{instance.owner_id}/{uuid.uuid4().hex}.{ext}"


def avatar_cutout_upload_path(instance, filename):
    return f"avatars/{instance.owner_id}/{uuid.uuid4().hex}_cutout.png"


def render_upload_path(instance, filename):
    return f"renders/{instance.outfit.owner_id}/{uuid.uuid4().hex}.png"


class AvatarPhoto(models.Model):
    """Foto de cuerpo completo de la usuaria: la base real del probador."""

    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avatar_photo")
    image = models.ImageField(upload_to=avatar_upload_path)
    cutout = models.ImageField(upload_to=avatar_cutout_upload_path, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Foto base de {self.owner.username}"


class Garment(models.Model):
    class Category(models.TextChoices):
        TOP = "top", "Blusa / Top"
        BOTTOM = "bottom", "Falda / Pantalón"
        DRESS = "dress", "Vestido"
        OUTERWEAR = "outerwear", "Abrigo / Chaqueta"
        SHOES = "shoes", "Zapatos"
        BAG = "bag", "Bolso"
        ACCESSORY = "accessory", "Accesorio"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="garments")
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices)
    color = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    image = models.ImageField(upload_to=garment_upload_path)
    # Versión con fondo recortado (rembg), lista para vestir al avatar
    cutout = models.ImageField(upload_to=cutout_upload_path, blank=True, null=True)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Outfit(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="outfits")
    name = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100, blank=True)
    # Capas sobre el avatar: [{"garment": id, "x": %, "y": %, "scale": n, "rotation": grados, "z": orden}]
    items = models.JSONField(default=list)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


class OutfitRender(models.Model):
    """Imagen fotorrealista del outfit generada con IA (Gemini)."""

    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE, related_name="renders")
    image = models.ImageField(upload_to=render_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Render de {self.outfit.name}"
