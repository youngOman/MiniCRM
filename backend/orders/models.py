import uuid

from customers.models import Customer
from django.contrib.auth.models import User
from django.db import models


class Order(models.Model):
    ORDER_STATUS = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    order_number = models.CharField(
        max_length=50, unique=True, editable=False
    )  # 訂單編號，唯一且不可編輯
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="orders"
    )

    status = models.CharField(max_length=20, choices=ORDER_STATUS, default="pending")
    order_date = models.DateTimeField(auto_now_add=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    shipping_address = models.TextField(blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_orders",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_orders",
    )

    class Meta:
        ordering = ["-order_date"]
        indexes = [
            models.Index(fields=["order_number"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["status"]),
            models.Index(fields=["order_date"]),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        # Calculate total
        self.total = (
            self.subtotal
            + self.tax_amount
            + self.shipping_amount
            - self.discount_amount
        )

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Order {self.order_number} - {self.customer.full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=100, blank=True, null=True)  # 存貨單位
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["product_sku"]),
        ]

    def save(self, *args, **kwargs) -> None:
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.product_name} x {self.quantity} - {self.order.order_number}"
