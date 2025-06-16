from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer


class MembershipTier(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    minimum_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    benefits = models.TextField(blank=True, help_text="List of membership benefits")
    color = models.CharField(max_length=7, default='#3B82F6')
    priority = models.PositiveIntegerField(default=0, help_text="Higher number = higher priority")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-priority', 'minimum_spent']


class Membership(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
    ]

    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='membership')
    tier = models.ForeignKey(MembershipTier, on_delete=models.PROTECT)
    
    membership_number = models.CharField(max_length=50, unique=True)
    join_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    points_earned = models.PositiveIntegerField(default=0)
    points_redeemed = models.PositiveIntegerField(default=0)
    points_balance = models.PositiveIntegerField(default=0)
    
    total_spent_lifetime = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_memberships')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_memberships')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.membership_number:
            import uuid
            self.membership_number = f"MEM-{uuid.uuid4().hex[:8].upper()}"
        
        self.points_balance = self.points_earned - self.points_redeemed
        
        customer_total = self.customer.total_spent
        if customer_total != self.total_spent_lifetime:
            self.total_spent_lifetime = customer_total
            
            eligible_tier = MembershipTier.objects.filter(
                minimum_spent__lte=customer_total,
                is_active=True
            ).order_by('-priority', '-minimum_spent').first()
            
            if eligible_tier and eligible_tier != self.tier:
                self.tier = eligible_tier
        
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.expiry_date

    @property
    def days_until_expiry(self):
        if not self.expiry_date:
            return None
        from django.utils import timezone
        delta = self.expiry_date - timezone.now().date()
        return delta.days if delta.days > 0 else 0

    def __str__(self):
        return f"{self.customer.full_name} - {self.tier.name}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['membership_number']),
            models.Index(fields=['status']),
            models.Index(fields=['join_date']),
        ]


class MembershipHistory(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='history')
    previous_tier = models.ForeignKey(MembershipTier, on_delete=models.PROTECT, related_name='previous_memberships')
    new_tier = models.ForeignKey(MembershipTier, on_delete=models.PROTECT, related_name='new_memberships')
    
    change_reason = models.TextField(blank=True)
    change_date = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.membership.customer.full_name}: {self.previous_tier.name} → {self.new_tier.name}"

    class Meta:
        ordering = ['-change_date']
        verbose_name_plural = 'Membership Histories'