from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer


class TransactionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Transaction Categories'


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('sale', 'Sale'),
        ('refund', 'Refund'),
        ('discount', 'Discount'),
        ('credit', 'Credit'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=100, unique=True)
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='sale')
    category = models.ForeignKey(TransactionCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_reference = models.CharField(max_length=200, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    transaction_date = models.DateTimeField()
    due_date = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_transactions')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_transactions')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        
        if not self.total_amount:
            self.total_amount = self.amount + self.tax_amount - self.discount_amount
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} - {self.customer.full_name} - ${self.total_amount}"

    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['customer', 'status']),
        ]


class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    class Meta:
        ordering = ['id']