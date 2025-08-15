from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OrderItemViewSet, OrderViewSet

router = DefaultRouter()
router.register(r"", OrderViewSet)
router.register(r"items", OrderItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
