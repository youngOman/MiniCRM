from django.contrib import admin
from .models import (
    Category,
    Brand,
    Supplier,
    Product,
    ProductVariant,
    Inventory,
    StockMovement,
    PriceHistory,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "contact_person",
        "email",
        "phone",
        "credit_limit",
        "is_active",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "contact_person", "email", "phone")
    ordering = ("name",)
    fieldsets = (
        ("基本資訊", {"fields": ("name", "contact_person", "is_active")}),
        ("聯絡資訊", {"fields": ("email", "phone", "address")}),
        ("商務條件", {"fields": ("payment_terms", "credit_limit")}),
    )


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("name", "sku", "price", "cost_price", "attributes", "is_active")


class InventoryInline(admin.StackedInline):
    model = Inventory
    extra = 0
    fields = (
        "quantity_on_hand",
        "quantity_reserved",
        "reorder_level",
        "max_stock_level",
        "location",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "brand",
        "base_price",
        "cost_price",
        "profit_margin",
        "is_active",
    )
    list_filter = (
        "is_active",
        "is_digital",
        "category",
        "brand",
        "supplier",
        "created_at",
    )
    search_fields = ("name", "sku", "description")
    ordering = ("-created_at",)
    inlines = [ProductVariantInline, InventoryInline]

    fieldsets = (
        (
            "基本資訊",
            {"fields": ("name", "description", "sku", "is_active", "is_digital")},
        ),
        ("分類與關聯", {"fields": ("category", "brand", "supplier")}),
        ("價格與成本", {"fields": ("base_price", "cost_price", "tax_rate")}),
        ("規格資訊", {"fields": ("weight", "dimensions", "image_url")}),
        ("訂購設定", {"fields": ("min_order_quantity", "tags")}),
    )

    def profit_margin(self, obj):
        return f"{obj.profit_margin}%"

    profit_margin.short_description = "利潤率"


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "name", "sku", "price", "cost_price", "is_active")
    list_filter = ("is_active", "created_at", "product__category", "product__brand")
    search_fields = ("name", "sku", "product__name", "product__sku")
    ordering = ("product", "name")

    fieldsets = (
        ("基本資訊", {"fields": ("product", "name", "sku", "is_active")}),
        ("價格設定", {"fields": ("price", "cost_price")}),
        ("屬性與條碼", {"fields": ("attributes", "barcode")}),
    )


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "get_item_name",
        "quantity_on_hand",
        "quantity_reserved",
        "quantity_available",
        "reorder_level",
        "is_low_stock",
        "last_updated",
    )
    list_filter = ("last_updated", "product__category", "product__brand")
    search_fields = (
        "product__name",
        "product__sku",
        "variant__name",
        "variant__sku",
        "location",
    )
    ordering = ("-last_updated",)

    def get_item_name(self, obj):
        return str(obj.variant) if obj.variant else str(obj.product)

    get_item_name.short_description = "項目"

    def quantity_available(self, obj):
        return obj.quantity_available

    quantity_available.short_description = "可用庫存"

    def is_low_stock(self, obj):
        return obj.is_low_stock

    is_low_stock.short_description = "低庫存"
    is_low_stock.boolean = True


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "get_item_name",
        "movement_type",
        "quantity",
        "reference_type",
        "reference_id",
        "created_at",
    )
    list_filter = ("movement_type", "reference_type", "created_at", "product__category")
    search_fields = (
        "product__name",
        "product__sku",
        "variant__name",
        "variant__sku",
        "notes",
    )
    ordering = ("-created_at",)

    fieldsets = (
        ("異動項目", {"fields": ("product", "variant")}),
        ("異動詳情", {"fields": ("movement_type", "quantity", "notes")}),
        ("關聯資訊", {"fields": ("reference_type", "reference_id")}),
    )

    def get_item_name(self, obj):
        return str(obj.variant) if obj.variant else str(obj.product)

    get_item_name.short_description = "項目"


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "get_item_name",
        "old_price",
        "new_price",
        "price_change_percentage",
        "change_reason",
        "effective_date",
        "created_by",
    )
    list_filter = (
        "effective_date",
        "created_at",
        "product__category",
        "product__brand",
    )
    search_fields = (
        "product__name",
        "product__sku",
        "variant__name",
        "variant__sku",
        "change_reason",
        "created_by",
    )
    ordering = ("-created_at",)

    fieldsets = (
        ("價格變動項目", {"fields": ("product", "variant")}),
        (
            "價格變動",
            {"fields": ("old_price", "new_price", "change_reason", "effective_date")},
        ),
        ("變更記錄", {"fields": ("created_by",)}),
    )

    def get_item_name(self, obj):
        return str(obj.variant) if obj.variant else str(obj.product)

    get_item_name.short_description = "項目"

    def price_change_percentage(self, obj):
        return f"{obj.price_change_percentage}%"

    price_change_percentage.short_description = "變動百分比"
