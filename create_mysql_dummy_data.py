import pymysql
import os
from decimal import Decimal
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MySQL connection configuration from environment variables
config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'charset': 'utf8mb4'
}

def create_dummy_data():
    # Validate required environment variables
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file and ensure all database variables are set.")
        return
    
    try:
        print(f"🔌 Connecting to MySQL database at {config['host']}...")
        # Connect to MySQL
        connection = pymysql.connect(**config)
        cursor = connection.cursor()
        
        print('✅ Connected to MySQL database successfully!')
        
        # Clear existing data (optional)
        print('Clearing existing data...')
        cursor.execute('DELETE FROM transactions_transaction')
        cursor.execute('DELETE FROM orders_orderitem')
        cursor.execute('DELETE FROM orders_order')
        cursor.execute('DELETE FROM customers_customer')
        
        # Get the user ID for 'young'
        cursor.execute("SELECT id FROM auth_user WHERE username = 'young'")
        user_result = cursor.fetchone()
        if not user_result:
            print("User 'young' not found. Please ensure the user exists.")
            return
        user_id = user_result[0]
        
        print(f'Using user ID: {user_id}')
        
        # Insert sample customers
        customers_data = [
            ('John', 'Doe', 'john.doe@example.com', '+1-555-0123', 'Tech Solutions Inc', '123 Main St', 'New York', 'NY', '10001', 'USA', 'website', 'enterprise, priority', 'Important enterprise client with multiple projects'),
            ('Jane', 'Smith', 'jane.smith@example.com', '+1-555-0124', 'Marketing Pro', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'USA', 'social_media', 'marketing, agency', 'Marketing agency specializing in digital campaigns'),
            ('Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0125', 'Design Studio', '789 Pine St', 'Chicago', 'IL', '60601', 'USA', 'referral', 'design, creative', 'Creative design studio, works on branding projects'),
            ('Alice', 'Brown', 'alice.brown@example.com', '+1-555-0126', 'Consulting Group', '321 Cedar Rd', 'Seattle', 'WA', '98101', 'USA', 'advertisement', 'consulting, business', 'Business consulting firm focusing on startups'),
            ('Mike', 'Wilson', 'mike.wilson@example.com', '+1-555-0127', 'E-commerce Plus', '654 Elm St', 'Austin', 'TX', '73301', 'USA', 'website', 'ecommerce, retail', 'Online retail platform with high transaction volume'),
            ('Sarah', 'Davis', 'sarah.davis@example.com', '+1-555-0128', 'FinTech Innovations', '987 Broadway', 'San Francisco', 'CA', '94102', 'USA', 'referral', 'fintech, startup', 'Innovative fintech startup with Series A funding'),
        ]
        
        customer_insert_query = """
        INSERT INTO customers_customer 
        (first_name, last_name, email, phone, company, address, city, state, zip_code, country, source, tags, notes, is_active, created_at, updated_at, created_by_id, updated_by_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        now = datetime.now()
        customer_ids = []
        
        for customer_data in customers_data:
            cursor.execute(customer_insert_query, customer_data + (1, now, now, user_id, user_id))
            customer_ids.append(cursor.lastrowid)
            print(f'Created customer: {customer_data[0]} {customer_data[1]}')
        
        # Insert sample orders
        order_insert_query = """
        INSERT INTO orders_order 
        (order_number, customer_id, status, order_date, subtotal, tax_amount, shipping_amount, discount_amount, total, shipping_address, billing_address, notes, created_at, updated_at, created_by_id, updated_by_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        order_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        order_ids = []
        
        for i, customer_id in enumerate(customer_ids):
            # Create 2-3 orders per customer
            num_orders = random.randint(2, 3)
            for j in range(num_orders):
                order_number = f'ORD-{random.randint(10000000, 99999999):08X}'
                subtotal = Decimal(random.uniform(500, 3000)).quantize(Decimal('0.01'))
                tax_amount = (subtotal * Decimal('0.08')).quantize(Decimal('0.01'))
                shipping_amount = Decimal('25.00') if subtotal < 1000 else Decimal('0.00')
                discount_amount = Decimal('0.00')
                if random.choice([True, False]):  # 50% chance of discount
                    discount_amount = (subtotal * Decimal(random.uniform(0.05, 0.15))).quantize(Decimal('0.01'))
                
                total = subtotal + tax_amount + shipping_amount - discount_amount
                order_date = now - timedelta(days=random.randint(1, 30))
                
                cursor.execute(order_insert_query, (
                    order_number, customer_id, random.choice(order_statuses), order_date,
                    float(subtotal), float(tax_amount), float(shipping_amount), float(discount_amount), float(total),
                    f'Address for customer {customer_id}', f'Billing address for customer {customer_id}',
                    f'Order for customer {customer_id}', now, now, user_id, user_id
                ))
                order_ids.append(cursor.lastrowid)
                print(f'Created order: {order_number}')
        
        # Insert sample order items
        product_names = [
            'Professional Website Design', 'Mobile App Development', 'SEO Optimization Package',
            'Social Media Management', 'Brand Identity Design', 'E-commerce Platform',
            'Digital Marketing Campaign', 'Content Management System', 'Database Optimization', 'Cloud Migration Service'
        ]
        
        orderitem_insert_query = """
        INSERT INTO orders_orderitem 
        (order_id, product_name, product_sku, quantity, unit_price, total_price, created_at, updated_at) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for order_id in order_ids:
            # Create 1-4 items per order
            num_items = random.randint(1, 4)
            for k in range(num_items):
                quantity = random.randint(1, 3)
                unit_price = Decimal(random.uniform(100, 800)).quantize(Decimal('0.01'))
                total_price = quantity * unit_price
                
                cursor.execute(orderitem_insert_query, (
                    order_id, random.choice(product_names), f'SKU-{random.randint(1000, 9999)}',
                    quantity, float(unit_price), float(total_price), now, now
                ))
        
        print(f'Created order items for {len(order_ids)} orders')
        
        # Insert sample transactions
        transaction_insert_query = """
        INSERT INTO transactions_transaction 
        (transaction_id, customer_id, order_id, transaction_type, payment_method, status, amount, fee_amount, net_amount, currency, gateway_transaction_id, description, notes, processed_at, created_at, updated_at, created_by_id, updated_by_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        payment_methods = ['credit_card', 'paypal', 'stripe', 'bank_transfer']
        transaction_statuses = ['pending', 'completed', 'failed']
        
        # Get orders with their customer info
        cursor.execute("SELECT id, customer_id, total FROM orders_order")
        orders = cursor.fetchall()
        
        for order_id, customer_id, order_total in orders:
            # 80% chance to create a transaction
            if random.random() < 0.8:
                transaction_id = f'TXN-{random.randint(10000000, 99999999):08X}'
                amount = Decimal(str(order_total))
                fee_amount = (amount * Decimal('0.029')).quantize(Decimal('0.01'))  # 2.9% fee
                net_amount = amount - fee_amount
                
                cursor.execute(transaction_insert_query, (
                    transaction_id, customer_id, order_id, 'sale', random.choice(payment_methods),
                    random.choice(transaction_statuses), float(amount), float(fee_amount), float(net_amount),
                    'USD', f'gw_{random.randint(100000, 999999)}',
                    f'Payment for order {order_id}', 'Automated payment processing',
                    now - timedelta(days=random.randint(1, 20)), now, now, user_id, user_id
                ))
                print(f'Created transaction: {transaction_id}')
        
        # Commit all changes
        connection.commit()
        
        # Get final counts
        cursor.execute("SELECT COUNT(*) FROM customers_customer")
        customer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM orders_order")
        order_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM orders_orderitem")
        orderitem_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM transactions_transaction")
        transaction_count = cursor.fetchone()[0]
        
        print('\n✅ Dummy data creation completed!')
        print(f'Created {customer_count} customers')
        print(f'Created {order_count} orders')
        print(f'Created {orderitem_count} order items')
        print(f'Created {transaction_count} transactions')
        
    except Exception as e:
        print(f'Error: {e}')
        connection.rollback()
    finally:
        cursor.close()
        connection.close()
        print('Database connection closed.')

if __name__ == '__main__':
    create_dummy_data()