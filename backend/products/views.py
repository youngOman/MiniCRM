from decimal import Decimal

from django.db.models import Count, F, Q, Sum
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Brand,
    Category,
    Inventory,
    PriceHistory,
    Product,
    ProductVariant,
    StockMovement,
    Supplier,
)
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    CategoryStatsSerializer,
    InventoryAlertSerializer,
    InventorySerializer,
    PriceHistorySerializer,
    ProductCreateUpdateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductStatsSerializer,
    ProductVariantSerializer,
    StockMovementSerializer,
    SupplierSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=True, methods=["get"])
    def products(self, request, pk=None):
        """取得分類下的所有產品"""
        category = self.get_object()
        products = category.products.filter(is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """分類統計資訊"""
        stats = Category.objects.annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        ).values("id", "name", "product_count")

        serializer = CategoryStatsSerializer(stats, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=True, methods=["get"])
    def products(self, request, pk=None):
        """取得品牌下的所有產品"""
        brand = self.get_object()
        products = brand.products.filter(is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active"]
    search_fields = ["name", "contact_person", "email", "phone"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=True, methods=["get"])
    def products(self, request, pk=None):
        """取得供應商的所有產品"""
        supplier = self.get_object()
        products = supplier.products.filter(is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active", "is_digital", "category", "brand", "supplier"]
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "sku", "base_price", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Product.objects.select_related(
            "category", "brand", "supplier"
        ).prefetch_related("variants")

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    @action(detail=True, methods=["get"])
    def variants(self, request, pk=None):
        """取得產品的所有變體"""
        product = self.get_object()
        variants = product.variants.filter(is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def create_variant(self, request, pk=None):
        """為產品建立新變體"""
        product = self.get_object()
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def inventory(self, request, pk=None):
        """取得產品庫存資訊"""
        product = self.get_object()
        try:
            inventory = product.inventory
            serializer = InventorySerializer(inventory)
            return Response(serializer.data)
        except Inventory.DoesNotExist:
            return Response(
                {"detail": "庫存資訊不存在"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["put", "patch"])
    def update_inventory(self, request, pk=None):
        """更新產品庫存"""
        product = self.get_object()
        try:
            inventory = product.inventory
        except Inventory.DoesNotExist:
            # 如果庫存不存在，建立新的
            inventory = Inventory(product=product)

        serializer = InventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def stock_movements(self, request, pk=None):
        """取得產品的庫存異動記錄"""
        product = self.get_object()
        movements = product.stock_movements.all()
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_stock_movement(self, request, pk=None):
        """新增庫存異動記錄"""
        product = self.get_object()
        serializer = StockMovementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)

            # 更新庫存數量
            movement_type = serializer.validated_data["movement_type"]
            quantity = serializer.validated_data["quantity"]

            try:
                inventory = product.inventory
                if movement_type == "inbound":
                    inventory.quantity_on_hand += quantity
                elif movement_type == "outbound":
                    inventory.quantity_on_hand = max(
                        0, inventory.quantity_on_hand - quantity
                    )
                elif movement_type == "adjustment":
                    inventory.quantity_on_hand = max(
                        0, inventory.quantity_on_hand + quantity
                    )
                inventory.save()
            except Inventory.DoesNotExist:
                # 如果庫存不存在，建立新的
                if movement_type == "inbound" or (
                    movement_type == "adjustment" and quantity > 0
                ):
                    Inventory.objects.create(
                        product=product, quantity_on_hand=max(0, quantity)
                    )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def price_history(self, request, pk=None):
        """取得產品的價格歷史"""
        product = self.get_object()
        history = product.price_history.all()
        serializer = PriceHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """產品統計資訊"""
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        total_categories = Category.objects.filter(is_active=True).count()
        total_brands = Brand.objects.filter(is_active=True).count()
        total_suppliers = Supplier.objects.filter(is_active=True).count()

        # 庫存警示統計
        low_stock_items = Inventory.objects.filter(
            quantity_on_hand__lte=F("reorder_level")
        ).count()
        out_of_stock_items = Inventory.objects.filter(quantity_on_hand=0).count()

        # 庫存總價值
        inventory_value = Inventory.objects.annotate(
            value=F("quantity_on_hand") * F("product__cost_price")
        ).aggregate(total_value=Coalesce(Sum("value"), Decimal("0.00")))["total_value"]

        stats_data = {
            "total_products": total_products,
            "active_products": active_products,
            "total_categories": total_categories,
            "total_brands": total_brands,
            "total_suppliers": total_suppliers,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "total_inventory_value": inventory_value,
        }

        serializer = ProductStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def low_stock_alerts(self, request):
        """低庫存警示"""
        low_stock_inventory = Inventory.objects.filter(
            Q(quantity_on_hand__lte=F("reorder_level")) | Q(quantity_on_hand=0)
        ).select_related("product", "variant", "product__category")

        serializer = InventoryAlertSerializer(low_stock_inventory, many=True)
        return Response(serializer.data)


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related("product").all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active", "product"]
    search_fields = ["name", "sku", "product__name"]
    ordering_fields = ["name", "sku", "price", "created_at"]
    ordering = ["product", "name"]


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related("product", "variant").all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["product__name", "product__sku", "variant__name", "location"]
    ordering_fields = ["quantity_on_hand", "quantity_available", "last_updated"]
    ordering = ["-last_updated"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # 篩選低庫存
        if self.request.query_params.get("low_stock"):
            queryset = queryset.filter(quantity_on_hand__lte=F("reorder_level"))

        # 篩選缺貨
        if self.request.query_params.get("out_of_stock"):
            queryset = queryset.filter(quantity_on_hand=0)

        return queryset


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related("product", "variant").all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["movement_type", "reference_type", "product"]
    search_fields = ["product__name", "product__sku", "variant__name", "notes"]
    ordering_fields = ["created_at", "quantity"]
    ordering = ["-created_at"]


class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.select_related("product", "variant").all()
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["product", "variant", "effective_date"]
    search_fields = ["product__name", "product__sku", "variant__name", "change_reason"]
    ordering_fields = ["effective_date", "created_at"]
    ordering = ["-created_at"]
