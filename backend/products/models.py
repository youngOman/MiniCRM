from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Category(models.Model):
    """產品分類模型 - 單層分類"""
    name = models.CharField(max_length=100, verbose_name='分類名稱')
    description = models.TextField(blank=True, verbose_name='描述')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL友好名稱')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '產品分類'
        verbose_name_plural = '產品分類'
        ordering = ['name']

    def __str__(self):
        return self.name


class Brand(models.Model):
    """品牌模型"""
    name = models.CharField(max_length=100, verbose_name='品牌名稱')
    description = models.TextField(blank=True, verbose_name='品牌描述')
    logo_url = models.URLField(blank=True, verbose_name='品牌Logo')
    website = models.URLField(blank=True, verbose_name='官網')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '品牌'
        verbose_name_plural = '品牌'
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """供應商模型"""
    name = models.CharField(max_length=200, verbose_name='供應商名稱')
    contact_person = models.CharField(max_length=100, blank=True, verbose_name='聯絡人')
    email = models.EmailField(blank=True, verbose_name='電子郵件')
    phone = models.CharField(max_length=20, blank=True, verbose_name='電話')
    address = models.TextField(blank=True, verbose_name='地址')
    payment_terms = models.CharField(max_length=100, blank=True, verbose_name='付款條件')
    credit_limit = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='信用額度'
    )
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '供應商'
        verbose_name_plural = '供應商'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """產品模型"""
    name = models.CharField(max_length=200, verbose_name='產品名稱')
    description = models.TextField(blank=True, verbose_name='產品描述')
    sku = models.CharField(max_length=50, unique=True, verbose_name='商品編號')
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products',
        verbose_name='產品分類'
    )
    brand = models.ForeignKey(
        Brand, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products',
        verbose_name='品牌'
    )
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products',
        verbose_name='供應商'
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='基礎售價'
    )
    cost_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='成本價格'
    )
    weight = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='重量(克)'
    )
    dimensions = models.CharField(max_length=50, blank=True, verbose_name='尺寸(長x寬x高)')
    image_url = models.URLField(blank=True, verbose_name='產品圖片')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    is_digital = models.BooleanField(default=False, verbose_name='是否為數位商品')
    tax_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('5.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        verbose_name='稅率(%)'
    )
    min_order_quantity = models.PositiveIntegerField(default=1, verbose_name='最小訂購量')
    tags = models.JSONField(default=list, blank=True, verbose_name='標籤')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '產品'
        verbose_name_plural = '產品'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def profit_margin(self):
        """計算利潤率"""
        if self.cost_price > 0:
            return ((self.base_price - self.cost_price) / self.cost_price * 100).quantize(Decimal('0.01'))
        return Decimal('0.00')

    @property
    def category_name(self):
        """獲取分類名稱"""
        return self.category.name if self.category else '未分類'

    @property
    def brand_name(self):
        """獲取品牌名稱"""
        return self.brand.name if self.brand else '無品牌'

    @property
    def supplier_name(self):
        """獲取供應商名稱"""
        return self.supplier.name if self.supplier else '無供應商'


class ProductVariant(models.Model):
    """產品款式變體模型 - 處理顏色、尺寸等不同規格"""
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='variants',
        verbose_name='產品'
    )
    name = models.CharField(max_length=100, verbose_name='變體名稱')
    sku = models.CharField(max_length=50, unique=True, verbose_name='變體商品編號')
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='變體售價'
    )
    cost_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='變體成本'
    )
    attributes = models.JSONField(default=dict, verbose_name='屬性(顏色、尺寸等)')
    barcode = models.CharField(max_length=50, blank=True, verbose_name='條碼')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '產品款式變體'
        verbose_name_plural = '產品款式變體'
        ordering = ['product', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class Inventory(models.Model):
    """庫存管理模型"""
    product = models.OneToOneField(
        Product, 
        on_delete=models.CASCADE,
        related_name='inventory',
        verbose_name='產品'
    )
    variant = models.OneToOneField(
        ProductVariant, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='inventory',
        verbose_name='產品款式變體'
    )
    quantity_on_hand = models.PositiveIntegerField(default=0, verbose_name='現有庫存')
    quantity_reserved = models.PositiveIntegerField(default=0, verbose_name='已預留庫存')
    reorder_level = models.PositiveIntegerField(default=10, verbose_name='再訂購點')
    max_stock_level = models.PositiveIntegerField(default=1000, verbose_name='最大庫存')
    location = models.CharField(max_length=100, blank=True, verbose_name='庫存位置')
    last_updated = models.DateTimeField(auto_now=True, verbose_name='最後更新時間')

    class Meta:
        verbose_name = '庫存'
        verbose_name_plural = '庫存'

    def __str__(self):
        if self.variant:
            return f"{self.variant} - 庫存: {self.quantity_available}"
        return f"{self.product} - 庫存: {self.quantity_available}"

    @property
    def quantity_available(self):
        """可用庫存 = 現有庫存 - 已預留庫存"""
        return max(0, self.quantity_on_hand - self.quantity_reserved)

    @property
    def is_low_stock(self):
        """是否低庫存"""
        return self.quantity_available <= self.reorder_level

    @property
    def is_out_of_stock(self):
        """是否缺貨"""
        return self.quantity_available <= 0


class StockMovement(models.Model):
    """庫存異動記錄模型"""
    MOVEMENT_TYPES = [
        ('inbound', '入庫'),
        ('outbound', '出庫'),
        ('adjustment', '調整'),
        ('stocktake', '盤點'),
    ]

    REFERENCE_TYPES = [
        ('order', '訂單'),
        ('purchase', '採購'),
        ('adjustment', '調整'),
        ('stocktake', '盤點'),
        ('return', '退貨'),
    ]

    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='stock_movements',
        verbose_name='產品'
    )
    variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='stock_movements',
        verbose_name='產品款式變體'
    )
    movement_type = models.CharField(
        max_length=20, 
        choices=MOVEMENT_TYPES, 
        verbose_name='異動類型'
    )
    quantity = models.IntegerField(verbose_name='異動數量')  # 可以為負數
    reference_type = models.CharField(
        max_length=20, 
        choices=REFERENCE_TYPES, 
        verbose_name='關聯類型'
    )
    reference_id = models.PositiveIntegerField(null=True, blank=True, verbose_name='關聯ID')
    notes = models.TextField(blank=True, verbose_name='備註')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='異動時間')

    class Meta:
        verbose_name = '庫存異動記錄'
        verbose_name_plural = '庫存異動記錄'
        ordering = ['-created_at']

    def __str__(self):
        item_name = self.variant or self.product
        return f"{item_name} - {self.get_movement_type_display()}: {self.quantity}"


class PriceHistory(models.Model):
    """價格歷史模型"""
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='price_history',
        verbose_name='產品'
    )
    variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='price_history',
        verbose_name='產品款式變體'
    )
    old_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='舊價格'
    )
    new_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='新價格'
    )
    change_reason = models.CharField(max_length=200, verbose_name='變動原因')
    effective_date = models.DateField(verbose_name='生效日期')
    created_by = models.CharField(max_length=100, verbose_name='變更人員')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')

    class Meta:
        verbose_name = '價格歷史'
        verbose_name_plural = '價格歷史'
        ordering = ['-created_at']

    def __str__(self):
        item_name = self.variant or self.product
        return f"{item_name} - {self.old_price} → {self.new_price}"

    @property
    def price_change_percentage(self):
        """價格變動百分比"""
        if self.old_price > 0:
            return ((self.new_price - self.old_price) / self.old_price * 100).quantize(Decimal('0.01'))
        return Decimal('0.00')