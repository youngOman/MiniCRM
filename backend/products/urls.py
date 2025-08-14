from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    BrandViewSet,
    SupplierViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    InventoryViewSet,
    StockMovementViewSet,
    PriceHistoryViewSet,
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
