from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from closet import views

router = DefaultRouter()
router.register(r"garments", views.GarmentViewSet)
router.register(r"outfits", views.OutfitViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", views.ThrottledLoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", views.ThrottledRefreshView.as_view(), name="token_refresh"),
    path("api/me/", views.me, name="me"),
    path("api/avatar/", views.AvatarPhotoView.as_view(), name="avatar_photo"),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
