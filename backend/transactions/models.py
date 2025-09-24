import uuid

from customers.models import Customer
from django.contrib.auth.models import User
from django.db import models
from orders.models import Order


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("sale", "Sale"),
        ("refund", "Refund"),
        ("payment", "Payment"),
        ("chargeback", "Chargeback"),
    ]

    PAYMENT_METHODS = [
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("paypal", "PayPal"),
        ("stripe", "Stripe"),
        ("cash", "Cash"),
        ("check", "Check"),
        ("bank_transfer", "Bank Transfer"),
        ("other", "Other"),
    ]

    TRANSACTION_STATUS = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    transaction_id = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="transactions"
    )  # 當關聯的 Customer被刪除時，此筆交易紀錄資料也會被刪除
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True,
    )

    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPES, default="sale"
    )
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHODS, default="credit_card"
    )
    status = models.CharField(
        max_length=20, choices=TRANSACTION_STATUS, default="pending"
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)

    currency = models.CharField(max_length=3, default="USD")

    # Payment gateway information
    gateway_transaction_id = models.CharField(max_length=200, blank=True, null=True)
    gateway_response = models.TextField(blank=True, null=True)

    description = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_transactions",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_transactions",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["transaction_id"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["order"]),
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["gateway_transaction_id"]),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

        # Calculate net amount
        self.net_amount = self.amount - self.fee_amount

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Transaction {self.transaction_id} - {self.customer.full_name} - ${self.amount}"
