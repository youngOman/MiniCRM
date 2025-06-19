#!/usr/bin/env python3

"""
Simple script to create dummy data for CRM system.
Run this with: python simple_dummy_data.py

Make sure to activate your virtual environment first:
source venv/bin/activate
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')

try:
    import django
    django.setup()
    
    from django.contrib.auth.models import User
    from customers.models import Customer
    from orders.models import Order, OrderItem
    from transactions.models import Transaction
    from decimal import Decimal
    import random
    from datetime import datetime, timedelta

    def create_data():
        print("🚀 Creating dummy data for CRM system...")
        
        # Get the user 'young'
        try:
            user = User.objects.get(username='young')
            print(f"✅ Found user: {user.username}")
        except User.DoesNotExist:
            print("❌ User 'young' not found. Please create the user first.")
            return
        
        # Clear existing data
        print("🧹 Clearing existing data...")
        Transaction.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Customer.objects.all().delete()
        
        # Sample customers
        customers_data = [
            {"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "phone": "+1-555-0123", "company": "Tech Solutions Inc", "city": "New York", "state": "NY", "source": "website"},
            {"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com", "phone": "+1-555-0124", "company": "Marketing Pro", "city": "Los Angeles", "state": "CA", "source": "social_media"},
            {"first_name": "Bob", "last_name": "Johnson", "email": "bob.johnson@example.com", "phone": "+1-555-0125", "company": "Design Studio", "city": "Chicago", "state": "IL", "source": "referral"},
            {"first_name": "Alice", "last_name": "Brown", "email": "alice.brown@example.com", "phone": "+1-555-0126", "company": "Consulting Group", "city": "Seattle", "state": "WA", "source": "advertisement"},
            {"first_name": "Mike", "last_name": "Wilson", "email": "mike.wilson@example.com", "phone": "+1-555-0127", "company": "E-commerce Plus", "city": "Austin", "state": "TX", "source": "website"},
        ]
        
        customers = []
        for data in customers_data:
            customer = Customer.objects.create(created_by=user, **data)
            customers.append(customer)
            print(f"👤 Created customer: {customer.full_name}")
        
        # Sample orders
        statuses = ['pending', 'processing', 'shipped', 'delivered']
        products = ['Website Design', 'Mobile App', 'SEO Package', 'Marketing Campaign', 'Branding']
        
        orders = []
        for customer in customers:
            for i in range(random.randint(1, 3)):  # 1-3 orders per customer
                subtotal = Decimal(str(random.randint(500, 3000)))
                order = Order.objects.create(
                    customer=customer,
                    status=random.choice(statuses),
                    subtotal=subtotal,
                    tax_amount=subtotal * Decimal('0.08'),
                    shipping_amount=Decimal('25'),
                    created_by=user
                )
                orders.append(order)
                
                # Add items to order
                for j in range(random.randint(1, 3)):  # 1-3 items per order
                    OrderItem.objects.create(
                        order=order,
                        product_name=random.choice(products),
                        product_sku=f'SKU-{random.randint(1000, 9999)}',
                        quantity=random.randint(1, 5),
                        unit_price=Decimal(str(random.randint(100, 800)))
                    )
                
                print(f"📦 Created order: {order.order_number}")
        
        # Sample transactions
        payment_methods = ['credit_card', 'paypal', 'stripe']
        for order in orders:
            if random.choice([True, False]):  # 50% chance
                Transaction.objects.create(
                    customer=order.customer,
                    order=order,
                    transaction_type='sale',
                    payment_method=random.choice(payment_methods),
                    status='completed',
                    amount=order.total,
                    fee_amount=order.total * Decimal('0.03'),
                    created_by=user
                )
                print(f"💳 Created transaction for order: {order.order_number}")
        
        # Print summary
        print("\n🎉 Dummy data creation completed!")
        print(f"📊 Summary:")
        print(f"   👥 Customers: {Customer.objects.count()}")
        print(f"   📦 Orders: {Order.objects.count()}")
        print(f"   📋 Order Items: {OrderItem.objects.count()}")
        print(f"   💳 Transactions: {Transaction.objects.count()}")

    if __name__ == '__main__':
        create_data()

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're in the virtual environment and Django is installed.")
except Exception as e:
    print(f"❌ Error: {e}")