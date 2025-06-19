#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal
import random

# Add the project directory to the Python path
sys.path.insert(0, '/Users/young/Developer/react-ts-crm')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
django.setup()

from django.contrib.auth.models import User
from customers.models import Customer
from orders.models import Order, OrderItem
from transactions.models import Transaction

def create_sample_data():
    print('Creating sample data...')

    # Get the young user
    try:
        admin_user = User.objects.get(username='young')
    except User.DoesNotExist:
        print('User "young" not found. Creating it...')
        admin_user = User.objects.create_superuser('young', 'young@example.com', 'young0921')

    # Create sample customers
    customers_data = [
        {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '+1-555-0123',
            'company': 'Tech Solutions Inc',
            'address': '123 Main St',
            'city': 'New York',
            'state': 'NY',
            'zip_code': '10001',
            'country': 'USA',
            'source': 'website',
            'tags': 'enterprise, priority',
            'notes': 'Important enterprise client with multiple projects',
        },
        {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '+1-555-0124',
            'company': 'Marketing Pro',
            'address': '456 Oak Ave',
            'city': 'Los Angeles',
            'state': 'CA',
            'zip_code': '90210',
            'country': 'USA',
            'source': 'social_media',
            'tags': 'marketing, agency',
            'notes': 'Marketing agency specializing in digital campaigns',
        },
        {
            'first_name': 'Bob',
            'last_name': 'Johnson',
            'email': 'bob.johnson@example.com',
            'phone': '+1-555-0125',
            'company': 'Design Studio',
            'address': '789 Pine St',
            'city': 'Chicago',
            'state': 'IL',
            'zip_code': '60601',
            'country': 'USA',
            'source': 'referral',
            'tags': 'design, creative',
            'notes': 'Creative design studio, works on branding projects',
        },
        {
            'first_name': 'Alice',
            'last_name': 'Brown',
            'email': 'alice.brown@example.com',
            'phone': '+1-555-0126',
            'company': 'Consulting Group',
            'address': '321 Cedar Rd',
            'city': 'Seattle',
            'state': 'WA',
            'zip_code': '98101',
            'country': 'USA',
            'source': 'advertisement',
            'tags': 'consulting, business',
            'notes': 'Business consulting firm focusing on startups',
        },
        {
            'first_name': 'Mike',
            'last_name': 'Wilson',
            'email': 'mike.wilson@example.com',
            'phone': '+1-555-0127',
            'company': 'E-commerce Plus',
            'address': '654 Elm St',
            'city': 'Austin',
            'state': 'TX',
            'zip_code': '73301',
            'country': 'USA',
            'source': 'website',
            'tags': 'ecommerce, retail',
            'notes': 'Online retail platform with high transaction volume',
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Davis',
            'email': 'sarah.davis@example.com',
            'phone': '+1-555-0128',
            'company': 'FinTech Innovations',
            'address': '987 Broadway',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94102',
            'country': 'USA',
            'source': 'referral',
            'tags': 'fintech, startup',
            'notes': 'Innovative fintech startup with Series A funding',
        },
    ]

    customers = []
    for customer_data in customers_data:
        customer, created = Customer.objects.get_or_create(
            email=customer_data['email'],
            defaults={**customer_data, 'created_by': admin_user}
        )
        customers.append(customer)
        if created:
            print(f'Created customer: {customer.full_name}')

    # Create sample orders
    order_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    product_names = [
        'Professional Website Design',
        'Mobile App Development',
        'SEO Optimization Package',
        'Social Media Management',
        'Brand Identity Design',
        'E-commerce Platform',
        'Digital Marketing Campaign',
        'Content Management System',
        'Database Optimization',
        'Cloud Migration Service',
    ]

    for i, customer in enumerate(customers):
        # Create 2-4 orders per customer
        num_orders = random.randint(2, 4)
        for j in range(num_orders):
            subtotal = Decimal(random.uniform(500, 5000)).quantize(Decimal('0.01'))
            tax_amount = (subtotal * Decimal('0.08')).quantize(Decimal('0.01'))
            shipping_amount = Decimal('25.00') if subtotal < 1000 else Decimal('0.00')
            discount_amount = Decimal('0.00')
            if random.choice([True, False]):  # 50% chance of discount
                discount_amount = (subtotal * Decimal(random.uniform(0.05, 0.15))).quantize(Decimal('0.01'))
            
            order = Order.objects.create(
                customer=customer,
                status=random.choice(order_statuses),
                subtotal=subtotal,
                tax_amount=tax_amount,
                shipping_amount=shipping_amount,
                discount_amount=discount_amount,
                shipping_address=f"{customer.address}\n{customer.city}, {customer.state} {customer.zip_code}",
                billing_address=f"{customer.address}\n{customer.city}, {customer.state} {customer.zip_code}",
                notes=f'Order for {customer.company}',
                created_by=admin_user
            )

            # Add order items
            num_items = random.randint(1, 5)
            for k in range(num_items):
                quantity = random.randint(1, 3)
                unit_price = Decimal(random.uniform(50, 1000)).quantize(Decimal('0.01'))
                
                OrderItem.objects.create(
                    order=order,
                    product_name=random.choice(product_names),
                    product_sku=f'SKU-{random.randint(1000, 9999)}',
                    quantity=quantity,
                    unit_price=unit_price
                )

            print(f'Created order: {order.order_number} for {customer.full_name}')

    # Create sample transactions
    orders = Order.objects.all()
    transaction_types = ['sale', 'refund', 'payment']
    payment_methods = ['credit_card', 'paypal', 'stripe', 'bank_transfer']
    transaction_statuses = ['pending', 'completed', 'failed']

    for order in orders:
        # 80% chance to create a transaction for each order
        if random.random() < 0.8:
            transaction = Transaction.objects.create(
                customer=order.customer,
                order=order,
                transaction_type=random.choice(transaction_types),
                payment_method=random.choice(payment_methods),
                status=random.choice(transaction_statuses),
                amount=order.total,
                fee_amount=(order.total * Decimal('0.029')).quantize(Decimal('0.01')),  # 2.9% fee
                currency='USD',
                gateway_transaction_id=f'gw_{random.randint(100000, 999999)}',
                description=f'Payment for order {order.order_number}',
                notes=f'Processed via {random.choice(payment_methods).replace("_", " ").title()}',
                created_by=admin_user
            )
            print(f'Created transaction: {transaction.transaction_id}')

        # 20% chance to create a refund transaction
        if random.random() < 0.2 and order.status == 'delivered':
            refund_amount = Decimal(random.uniform(50, float(order.total))).quantize(Decimal('0.01'))
            refund_transaction = Transaction.objects.create(
                customer=order.customer,
                order=order,
                transaction_type='refund',
                payment_method=random.choice(payment_methods),
                status='completed',
                amount=refund_amount,
                fee_amount=Decimal('0.00'),
                currency='USD',
                gateway_transaction_id=f'rf_{random.randint(100000, 999999)}',
                description=f'Refund for order {order.order_number}',
                notes='Customer requested partial refund',
                created_by=admin_user
            )
            print(f'Created refund transaction: {refund_transaction.transaction_id}')

    print('\n✅ Sample data creation completed!')
    print(f'Created {Customer.objects.count()} customers')
    print(f'Created {Order.objects.count()} orders')
    print(f'Created {OrderItem.objects.count()} order items')
    print(f'Created {Transaction.objects.count()} transactions')

if __name__ == '__main__':
    create_sample_data()