from rest_framework import serializers

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


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "slug",
            "is_active",
            "created_at",
            "updated_at",
            "product_count",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            "id",
            "name",
            "description",
            "logo_url",
            "website",
            "is_active",
            "created_at",
            "updated_at",
            "product_count",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "contact_person",
            "email",
            "phone",
            "address",
            "payment_terms",
            "credit_limit",
            "is_active",
            "created_at",
            "updated_at",
            "product_count",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class InventorySerializer(serializers.ModelSerializer):
    quantity_available = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = [
            "id",
            "quantity_on_hand",
            "quantity_reserved",
            "quantity_available",
            "reorder_level",
            "max_stock_level",
            "location",
            "is_low_stock",
            "is_out_of_stock",
            "last_updated",
        ]
        read_only_fields = ["last_updated"]


class ProductVariantSerializer(serializers.ModelSerializer):
    inventory = InventorySerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "name",
            "sku",
            "price",
            "cost_price",
            "attributes",
            "barcode",
            "is_active",
            "created_at",
            "updated_at",
            "inventory",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProductListSerializer(serializers.ModelSerializer):
    """簡化的產品序列化器，用於列表顯示"""

    category_name = serializers.ReadOnlyField()
    brand_name = serializers.ReadOnlyField()
    supplier_name = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    variant_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "category",
            "category_name",
            "brand",
            "brand_name",
            "supplier",
            "supplier_name",
            "base_price",
            "cost_price",
            "profit_margin",
            "is_active",
            "is_digital",
            "created_at",
            "variant_count",
        ]

    def get_variant_count(self, obj):
        return obj.variants.filter(is_active=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """詳細的產品序列化器，包含所有關聯資料"""

    category_name = serializers.ReadOnlyField()
    brand_name = serializers.ReadOnlyField()
    supplier_name = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "sku",
            "category",
            "category_name",
            "brand",
            "brand_name",
            "supplier",
            "supplier_name",
            "base_price",
            "cost_price",
            "profit_margin",
            "weight",
            "dimensions",
            "image_url",
            "is_active",
            "is_digital",
            "tax_rate",
            "min_order_quantity",
            "tags",
            "created_at",
            "updated_at",
            "variants",
            "inventory",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """產品建立/更新序列化器"""

    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "sku",
            "category",
            "brand",
            "supplier",
            "base_price",
            "cost_price",
            "weight",
            "dimensions",
            "image_url",
            "is_active",
            "is_digital",
            "tax_rate",
            "min_order_quantity",
            "tags",
        ]

    def validate_sku(self, value):
        """驗證 SKU 的唯一性"""
        if self.instance:
            # 更新時，排除當前實例
            if Product.objects.exclude(pk=self.instance.pk).filter(sku=value).exists():
                raise serializers.ValidationError("此 SKU 已存在")
        # 建立時
        elif Product.objects.filter(sku=value).exists():
            raise serializers.ValidationError("此 SKU 已存在")
        return value

    def validate(self, data):
        """整體驗證"""
        if data.get("base_price", 0) < data.get("cost_price", 0):
            raise serializers.ValidationError("售價不能低於成本價")
        return data


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True)
    movement_type_display = serializers.CharField(
        source="get_movement_type_display", read_only=True
    )
    reference_type_display = serializers.CharField(
        source="get_reference_type_display", read_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_name",
            "variant",
            "variant_name",
            "movement_type",
            "movement_type_display",
            "quantity",
            "reference_type",
            "reference_type_display",
            "reference_id",
            "notes",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class PriceHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True)
    price_change_percentage = serializers.ReadOnlyField()

    class Meta:
        model = PriceHistory
        fields = [
            "id",
            "product",
            "product_name",
            "variant",
            "variant_name",
            "old_price",
            "new_price",
            "price_change_percentage",
            "change_reason",
            "effective_date",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["created_at"]


# 用於統計和報表的序列化器
class ProductStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    active_products = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    total_brands = serializers.IntegerField()
    total_suppliers = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    out_of_stock_items = serializers.IntegerField()
    total_inventory_value = serializers.DecimalField(max_digits=15, decimal_places=2)


class CategoryStatsSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    product_count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)


class InventoryAlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name")
    variant_name = serializers.CharField(source="variant.name")
    category_name = serializers.CharField(source="product.category.name")

    class Meta:
        model = Inventory
        fields = [
            "id",
            "product_name",
            "variant_name",
            "category_name",
            "quantity_on_hand",
            "quantity_available",
            "reorder_level",
            "is_low_stock",
            "is_out_of_stock",
        ]
