from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    CategoryViewSet,
    InventoryViewSet,
    PriceHistoryViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    StockMovementViewSet,
    SupplierViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"brands", BrandViewSet)
router.register(r"suppliers", SupplierViewSet)
router.register(r"products", ProductViewSet, basename="product")
router.register(r"variants", ProductVariantViewSet)
router.register(r"inventory", InventoryViewSet)
router.register(r"stock-movements", StockMovementViewSet)
router.register(r"price-history", PriceHistoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
