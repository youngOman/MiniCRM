from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from customers.models import Customer
from orders.models import Order, OrderItem
from transactions.models import Transaction
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Create sample data for CRM system'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Get admin user
        admin_user = User.objects.get(username='admin')

        # Create sample customers
        customers_data = [
            {
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john.doe@example.com',
                'phone': '+1-555-0123',
                'company': 'Tech Solutions Inc',
                'city': 'New York',
                'state': 'NY',
                'country': 'USA',
                'source': 'website',
            },
            {
                'first_name': 'Jane',
                'last_name': 'Smith',
                'email': 'jane.smith@example.com',
                'phone': '+1-555-0124',
                'company': 'Marketing Pro',
                'city': 'Los Angeles',
                'state': 'CA',
                'country': 'USA',
                'source': 'social_media',
            },
            {
                'first_name': 'Bob',
                'last_name': 'Johnson',
                'email': 'bob.johnson@example.com',
                'phone': '+1-555-0125',
                'company': 'Design Studio',
                'city': 'Chicago',
                'state': 'IL',
                'country': 'USA',
                'source': 'referral',
            },
            {
                'first_name': 'Alice',
                'last_name': 'Brown',
                'email': 'alice.brown@example.com',
                'phone': '+1-555-0126',
                'company': 'Consulting Group',
                'city': 'Seattle',
                'state': 'WA',
                'country': 'USA',
                'source': 'advertisement',
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
                self.stdout.write(f'Created customer: {customer.full_name}')

        # Create sample orders
        for i, customer in enumerate(customers):
            # Create 1-3 orders per customer
            num_orders = random.randint(1, 3)
            for j in range(num_orders):
                subtotal = Decimal(random.uniform(50, 500))
                tax_amount = subtotal * Decimal('0.08')
                shipping_amount = Decimal('10.00')
                
                order = Order.objects.create(
                    customer=customer,
                    status=random.choice(['pending', 'processing', 'shipped', 'delivered']),
                    subtotal=subtotal,
                    tax_amount=tax_amount,
                    shipping_amount=shipping_amount,
                    created_by=admin_user
                )

                # Add order items
                num_items = random.randint(1, 4)
                for k in range(num_items):
                    quantity = random.randint(1, 5)
                    unit_price = Decimal(random.uniform(10, 100))
                    
                    OrderItem.objects.create(
                        order=order,
                        product_name=f'Product {k+1}',
                        product_sku=f'SKU-{random.randint(1000, 9999)}',
                        quantity=quantity,
                        unit_price=unit_price
                    )

                self.stdout.write(f'Created order: {order.order_number}')

        # Create sample transactions
        orders = Order.objects.all()
        for order in orders:
            if random.choice([True, False]):  # 50% chance to create transaction
                transaction = Transaction.objects.create(
                    customer=order.customer,
                    order=order,
                    transaction_type='sale',
                    payment_method=random.choice(['credit_card', 'paypal', 'stripe']),
                    status=random.choice(['pending', 'completed', 'failed']),
                    amount=order.total,
                    fee_amount=order.total * Decimal('0.03'),  # 3% fee
                    currency='USD',
                    description=f'Payment for order {order.order_number}',
                    created_by=admin_user
                )
                self.stdout.write(f'Created transaction: {transaction.transaction_id}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )