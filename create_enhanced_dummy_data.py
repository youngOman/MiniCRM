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

def create_enhanced_dummy_data():
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
        
        # Extended customers data (100+ customers)
        companies = [
            'Tech Solutions Inc', 'Marketing Pro', 'Design Studio', 'Consulting Group', 'E-commerce Plus',
            'FinTech Innovations', 'Digital Agency', 'Software Corp', 'Creative Labs', 'Business Solutions',
            'Data Analytics Co', 'Web Development', 'Mobile First', 'Cloud Systems', 'AI Research Lab',
            'Startup Incubator', 'Investment Group', 'Real Estate Pro', 'Healthcare Tech', 'Education Platform',
            'Food & Beverage Co', 'Retail Chain', 'Manufacturing Inc', 'Logistics Solutions', 'Energy Systems',
            'Green Technology', 'Sports & Fitness', 'Entertainment Hub', 'Travel Agency', 'Fashion Brand',
            'Beauty & Wellness', 'Home Improvement', 'Auto Services', 'Pet Care Plus', 'Legal Services',
            'Financial Planning', 'Insurance Group', 'Construction Co', 'Architecture Firm', 'Interior Design',
            'Photography Studio', 'Video Production', 'Music Label', 'Gaming Company', 'Social Media Inc',
            'Content Creation', 'Influencer Network', 'Advertising Agency', 'PR Company', 'Event Planning'
        ]
        
        first_names = [
            'John', 'Jane', 'Bob', 'Alice', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa',
            'Tom', 'Anna', 'Steve', 'Maria', 'Kevin', 'Jennifer', 'Mark', 'Jessica', 'Paul', 'Amy',
            'Daniel', 'Michelle', 'James', 'Laura', 'Robert', 'Karen', 'William', 'Nancy', 'Richard', 'Helen',
            'Charles', 'Betty', 'Joseph', 'Dorothy', 'Thomas', 'Lisa', 'Christopher', 'Sandra', 'Matthew', 'Donna',
            'Anthony', 'Carol', 'Donald', 'Ruth', 'Steven', 'Sharon', 'Kenneth', 'Michelle', 'Andrew', 'Emily',
            'Brian', 'Kimberly', 'Joshua', 'Deborah', 'Justin', 'Rachel', 'Daniel', 'Carolyn', 'Nathan', 'Janet',
            'Michael', 'Catherine', 'Ryan', 'Frances', 'Timothy', 'Christine', 'Sean', 'Samantha', 'Alexander', 'Debra',
            'Patrick', 'Mary', 'Jack', 'Patricia', 'Dennis', 'Linda', 'Jerry', 'Barbara', 'Tyler', 'Elizabeth',
            'Aaron', 'Susan', 'Jose', 'Margaret', 'Henry', 'Dorothy', 'Adam', 'Lisa', 'Douglas', 'Nancy',
            'Peter', 'Helen', 'Noah', 'Betty', 'Arthur', 'Sandra', 'Walter', 'Donna', 'Carl', 'Carol'
        ]
        
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
            'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
            'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
            'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
            'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
            'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
        ]
        
        cities = [
            ('New York', 'NY', '10001'), ('Los Angeles', 'CA', '90210'), ('Chicago', 'IL', '60601'),
            ('Houston', 'TX', '77001'), ('Phoenix', 'AZ', '85001'), ('Philadelphia', 'PA', '19101'),
            ('San Antonio', 'TX', '78201'), ('San Diego', 'CA', '92101'), ('Dallas', 'TX', '75201'),
            ('San Jose', 'CA', '95101'), ('Austin', 'TX', '73301'), ('Jacksonville', 'FL', '32201'),
            ('Fort Worth', 'TX', '76101'), ('Columbus', 'OH', '43201'), ('Charlotte', 'NC', '28201'),
            ('San Francisco', 'CA', '94101'), ('Indianapolis', 'IN', '46201'), ('Seattle', 'WA', '98101'),
            ('Denver', 'CO', '80201'), ('Washington', 'DC', '20001'), ('Boston', 'MA', '02101'),
            ('El Paso', 'TX', '79901'), ('Nashville', 'TN', '37201'), ('Detroit', 'MI', '48201'),
            ('Oklahoma City', 'OK', '73101'), ('Portland', 'OR', '97201'), ('Las Vegas', 'NV', '89101'),
            ('Memphis', 'TN', '38101'), ('Louisville', 'KY', '40201'), ('Baltimore', 'MD', '21201'),
            ('Milwaukee', 'WI', '53201'), ('Albuquerque', 'NM', '87101'), ('Tucson', 'AZ', '85701'),
            ('Fresno', 'CA', '93701'), ('Mesa', 'AZ', '85201'), ('Sacramento', 'CA', '95814'),
            ('Atlanta', 'GA', '30301'), ('Kansas City', 'MO', '64101'), ('Colorado Springs', 'CO', '80901'),
            ('Miami', 'FL', '33101'), ('Raleigh', 'NC', '27601'), ('Omaha', 'NE', '68101'),
            ('Long Beach', 'CA', '90801'), ('Virginia Beach', 'VA', '23451'), ('Oakland', 'CA', '94601'),
            ('Minneapolis', 'MN', '55401'), ('Tulsa', 'OK', '74101'), ('Arlington', 'TX', '76010'),
            ('Tampa', 'FL', '33601'), ('New Orleans', 'LA', '70112'), ('Wichita', 'KS', '67201')
        ]
        
        sources = ['website', 'social_media', 'referral', 'advertisement', 'trade_show', 'email_campaign', 'phone_call', 'walk_in']
        tags_list = ['enterprise', 'priority', 'marketing', 'agency', 'design', 'creative', 'consulting', 'business', 'ecommerce', 'retail', 'fintech', 'startup', 'vip', 'premium', 'budget', 'corporate', 'small_business', 'non_profit']
        
        customer_insert_query = """
        INSERT INTO customers_customer 
        (first_name, last_name, email, phone, company, address, city, state, zip_code, country, source, tags, notes, is_active, created_at, updated_at, created_by_id, updated_by_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        now = datetime.now()
        customer_ids = []
        
        # Create 120 customers
        for i in range(120):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            email = f"{first_name.lower()}.{last_name.lower()}@{random.choice(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.net'])}"
            phone = f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            company = random.choice(companies)
            address = f"{random.randint(100, 9999)} {random.choice(['Main St', 'Oak Ave', 'Pine St', 'Cedar Rd', 'Elm St', 'Broadway', 'First Ave', 'Second St', 'Park Ave', 'Market St'])}"
            city, state, zip_code = random.choice(cities)
            source = random.choice(sources)
            tags = ', '.join(random.sample(tags_list, random.randint(1, 3)))
            notes = f"Customer from {company} - {random.choice(['High value client', 'Regular customer', 'New prospect', 'Returning customer', 'Referral client'])}"
            
            # Create customers over the last 2 years with more variation
            created_at = now - timedelta(days=random.randint(1, 730))
            
            cursor.execute(customer_insert_query, (
                first_name, last_name, email, phone, company, address, city, state, zip_code, 'USA',
                source, tags, notes, 1, created_at, created_at, user_id, user_id
            ))
            customer_ids.append(cursor.lastrowid)
            if (i + 1) % 20 == 0:
                print(f'Created {i + 1} customers...')
        
        print(f'Created {len(customer_ids)} customers')
        
        # Insert sample orders with better date distribution
        order_insert_query = """
        INSERT INTO orders_order 
        (order_number, customer_id, status, order_date, subtotal, tax_amount, shipping_amount, discount_amount, total, shipping_address, billing_address, notes, created_at, updated_at, created_by_id, updated_by_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        order_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        order_ids = []
        
        # Create orders distributed over time
        for customer_id in customer_ids:
            # Each customer gets 1-5 orders
            num_orders = random.randint(1, 5)
            for j in range(num_orders):
                order_number = f'ORD-{random.randint(10000000, 99999999):08X}'
                subtotal = Decimal(random.uniform(100, 5000)).quantize(Decimal('0.01'))
                tax_amount = (subtotal * Decimal('0.08')).quantize(Decimal('0.01'))
                shipping_amount = Decimal('25.00') if subtotal < 1000 else Decimal('0.00')
                discount_amount = Decimal('0.00')
                if random.choice([True, False]):  # 50% chance of discount
                    discount_amount = (subtotal * Decimal(random.uniform(0.05, 0.20))).quantize(Decimal('0.01'))
                
                total = subtotal + tax_amount + shipping_amount - discount_amount
                
                # Create orders spanning the last 18 months with seasonal patterns
                days_back = random.randint(1, 540)  # 18 months
                
                # Add seasonal variation (more orders in Nov-Dec, Mar-Apr, Jul-Aug)
                month_factor = 1.0
                target_month = (now - timedelta(days=days_back)).month
                if target_month in [11, 12]:  # Holiday season
                    month_factor = 1.5
                elif target_month in [3, 4]:  # Spring
                    month_factor = 1.3
                elif target_month in [7, 8]:  # Summer
                    month_factor = 1.2
                
                if random.random() < month_factor / 2:
                    order_date = now - timedelta(days=days_back)
                    
                    cursor.execute(order_insert_query, (
                        order_number, customer_id, random.choice(order_statuses), order_date,
                        float(subtotal), float(tax_amount), float(shipping_amount), float(discount_amount), float(total),
                        f'Address for customer {customer_id}', f'Billing address for customer {customer_id}',
                        f'Order for customer {customer_id}', order_date, order_date, user_id, user_id
                    ))
                    order_ids.append(cursor.lastrowid)
        
        print(f'Created {len(order_ids)} orders')
        
        # Insert sample order items
        product_names = [
            'Professional Website Design', 'Mobile App Development', 'SEO Optimization Package',
            'Social Media Management', 'Brand Identity Design', 'E-commerce Platform',
            'Digital Marketing Campaign', 'Content Management System', 'Database Optimization', 'Cloud Migration Service',
            'API Development', 'UI/UX Design', 'Logo Design', 'Business Card Design', 'Brochure Design',
            'Video Production', 'Photography Service', 'Copywriting Service', 'Email Marketing', 'PPC Campaign',
            'Web Hosting', 'Domain Registration', 'SSL Certificate', 'Website Maintenance', 'Technical Support',
            'Data Analytics', 'Report Generation', 'Dashboard Creation', 'Training Workshop', 'Consulting Session',
            'Software License', 'Premium Plugin', 'Custom Integration', 'Security Audit', 'Performance Optimization'
        ]
        
        orderitem_insert_query = """
        INSERT INTO orders_orderitem 
        (order_id, product_name, product_sku, quantity, unit_price, total_price, created_at, updated_at) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for order_id in order_ids:
            # Create 1-5 items per order
            num_items = random.randint(1, 5)
            for k in range(num_items):
                quantity = random.randint(1, 4)
                unit_price = Decimal(random.uniform(50, 1200)).quantize(Decimal('0.01'))
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
        
        payment_methods = ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'apple_pay', 'google_pay','line_Pay']
        transaction_statuses = ['pending', 'completed', 'failed', 'refunded']
        
        # Get orders with their customer info and dates
        cursor.execute("SELECT id, customer_id, total, order_date FROM orders_order")
        orders = cursor.fetchall()
        
        for order_id, customer_id, order_total, order_date in orders:
            # 85% chance to create a transaction
            if random.random() < 0.85:
                transaction_id = f'TXN-{random.randint(10000000, 99999999):08X}'
                amount = Decimal(str(order_total))
                fee_amount = (amount * Decimal('0.029')).quantize(Decimal('0.01'))  # 2.9% fee
                net_amount = amount - fee_amount
                
                # Transaction processed within 0-7 days of order
                processed_at = order_date + timedelta(days=random.randint(0, 7))
                
                cursor.execute(transaction_insert_query, (
                    transaction_id, customer_id, order_id, 'sale', random.choice(payment_methods),
                    random.choice(transaction_statuses), float(amount), float(fee_amount), float(net_amount),
                    'USD', f'gw_{random.randint(100000, 999999)}',
                    f'Payment for order {order_id}', 'Automated payment processing',
                    processed_at, processed_at, processed_at, user_id, user_id
                ))
        
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
        
        print('\n✅ Enhanced dummy data creation completed!')
        print(f'Created {customer_count} customers')
        print(f'Created {order_count} orders')
        print(f'Created {orderitem_count} order items')
        print(f'Created {transaction_count} transactions')
        print('\n📊 Data spans 18 months with seasonal variations for better dashboard visualization')
        
    except Exception as e:
        print(f'Error: {e}')
        connection.rollback()
    finally:
        cursor.close()
        connection.close()
        print('Database connection closed.')

if __name__ == '__main__':
    create_enhanced_dummy_data()