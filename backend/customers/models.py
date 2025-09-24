from django.contrib.auth.models import User
from django.db import models


class Customer(models.Model):
    CUSTOMER_SOURCES = [
        ("website", "Website"),
        ("social_media", "Social Media"),
        ("referral", "Referral"),
        ("advertisement", "Advertisement"),
        ("other", "Other"),
    ]

    GENDER_CHOICES = [
        ("male", "男性"),
        ("female", "女性"),
        ("other", "其他"),
        ("prefer_not_to_say", "不願透露"),
    ]

    SEASONAL_PURCHASE_PATTERNS = [
        ("spring", "春季購買"),
        ("summer", "夏季購買"),
        ("autumn", "秋季購買"),
        ("winter", "冬季購買"),
        ("year_round", "全年均勻"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=100, default="USA")

    source = models.CharField(max_length=20, choices=CUSTOMER_SOURCES, default="other")
    tags = models.TextField(blank=True, null=True, help_text="Comma-separated tags")
    notes = models.TextField(blank=True, null=True)

    # 新增的個人資訊欄位
    age = models.PositiveIntegerField(null=True, blank=True, help_text="客戶年齡")
    gender = models.CharField(
        max_length=20, choices=GENDER_CHOICES, blank=True, null=True
    )

    # 產品偏好欄位
    product_categories_interest = models.JSONField(
        default=list, blank=True, help_text="感興趣的產品類別"
    )
    seasonal_purchase_pattern = models.CharField(
        max_length=20,
        choices=SEASONAL_PURCHASE_PATTERNS,
        blank=True,
        null=True,
        help_text="季節性購買模式",
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_customers",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_customers",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def total_orders_property(self):
        """
        重新命名原有的 property 方法避免與 annotate 欄位衝突
        在 ViewSet 中我們使用 annotate 的 total_orders，效能更好
        """
        return self.orders.count()

    @property
    def total_spent_property(self):
        """
        重新命名原有的 property 方法避免與 annotate 欄位衝突
        在 ViewSet 中我們使用 annotate 的 total_spent，效能更好
        """
        return sum(order.total for order in self.orders.all())
