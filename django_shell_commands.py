# Copy and paste this into Django shell (python manage.py shell)

from django.contrib.auth.models import User
from customers.models import Customer
from orders.models import Order, OrderItem
from transactions.models import Transaction
from decimal import Decimal
import random

# Get user
user = User.objects.get(username='young')

# Create customers
customers_data = [
    {"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "company": "Tech Solutions Inc", "source": "website"},
    {"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com", "company": "Marketing Pro", "source": "social_media"},
    {"first_name": "Bob", "last_name": "Johnson", "email": "bob.johnson@example.com", "company": "Design Studio", "source": "referral"},
    {"first_name": "Alice", "last_name": "Brown", "email": "alice.brown@example.com", "company": "Consulting Group", "source": "advertisement"},
]

customers = []
for data in customers_data:
    customer = Customer.objects.create(created_by=user, **data)
    customers.append(customer)
    print(f"Created customer: {customer.full_name}")

# Create orders
for customer in customers:
    for i in range(2):  # 2 orders per customer
        order = Order.objects.create(
            customer=customer,
            status='delivered',
            subtotal=Decimal('1000'),
            tax_amount=Decimal('80'),
            shipping_amount=Decimal('25'),
            created_by=user
        )
        
        # Add order items
        OrderItem.objects.create(
            order=order,
            product_name='Website Design',
            product_sku=f'SKU-{random.randint(1000, 9999)}',
            quantity=1,
            unit_price=Decimal('1000')
        )
        
        # Create transaction
        Transaction.objects.create(
            customer=customer,
            order=order,
            transaction_type='sale',
            payment_method='credit_card',
            status='completed',
            amount=order.total,
            fee_amount=order.total * Decimal('0.03'),
            created_by=user
        )
        
        print(f"Created order: {order.order_number}")

print("✅ Dummy data created successfully!")