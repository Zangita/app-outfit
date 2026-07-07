from django.contrib import admin

from .models import Garment, Outfit


@admin.register(Garment)
class GarmentAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "color", "owner", "favorite", "created_at")
    list_filter = ("category", "owner", "favorite")
    search_fields = ("name", "color", "notes")


@admin.register(Outfit)
class OutfitAdmin(admin.ModelAdmin):
    list_display = ("name", "occasion", "owner", "favorite", "updated_at")
    list_filter = ("owner", "favorite")
    search_fields = ("name", "occasion")
