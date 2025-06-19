-- Insert sample customers
INSERT INTO customers_customer (first_name, last_name, email, phone, company, address, city, state, zip_code, country, source, tags, notes, is_active, created_at, updated_at, created_by_id, updated_by_id) VALUES
('John', 'Doe', 'john.doe@example.com', '+1-555-0123', 'Tech Solutions Inc', '123 Main St', 'New York', 'NY', '10001', 'USA', 'website', 'enterprise, priority', 'Important enterprise client with multiple projects', 1, datetime('now'), datetime('now'), 2, 2),
('Jane', 'Smith', 'jane.smith@example.com', '+1-555-0124', 'Marketing Pro', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'USA', 'social_media', 'marketing, agency', 'Marketing agency specializing in digital campaigns', 1, datetime('now'), datetime('now'), 2, 2),
('Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0125', 'Design Studio', '789 Pine St', 'Chicago', 'IL', '60601', 'USA', 'referral', 'design, creative', 'Creative design studio, works on branding projects', 1, datetime('now'), datetime('now'), 2, 2),
('Alice', 'Brown', 'alice.brown@example.com', '+1-555-0126', 'Consulting Group', '321 Cedar Rd', 'Seattle', 'WA', '98101', 'USA', 'advertisement', 'consulting, business', 'Business consulting firm focusing on startups', 1, datetime('now'), datetime('now'), 2, 2),
('Mike', 'Wilson', 'mike.wilson@example.com', '+1-555-0127', 'E-commerce Plus', '654 Elm St', 'Austin', 'TX', '73301', 'USA', 'website', 'ecommerce, retail', 'Online retail platform with high transaction volume', 1, datetime('now'), datetime('now'), 2, 2),
('Sarah', 'Davis', 'sarah.davis@example.com', '+1-555-0128', 'FinTech Innovations', '987 Broadway', 'San Francisco', 'CA', '94102', 'USA', 'referral', 'fintech, startup', 'Innovative fintech startup with Series A funding', 1, datetime('now'), datetime('now'), 2, 2);

-- Insert sample orders
INSERT INTO orders_order (order_number, customer_id, status, order_date, subtotal, tax_amount, shipping_amount, discount_amount, total, shipping_address, billing_address, notes, created_at, updated_at, created_by_id, updated_by_id) VALUES
('ORD-A1B2C3D4', 1, 'delivered', datetime('now', '-10 days'), 1250.00, 100.00, 0.00, 125.00, 1225.00, '123 Main St\nNew York, NY 10001', '123 Main St\nNew York, NY 10001', 'Order for Tech Solutions Inc', datetime('now', '-10 days'), datetime('now', '-10 days'), 2, 2),
('ORD-E5F6G7H8', 1, 'processing', datetime('now', '-5 days'), 850.00, 68.00, 25.00, 0.00, 943.00, '123 Main St\nNew York, NY 10001', '123 Main St\nNew York, NY 10001', 'Order for Tech Solutions Inc', datetime('now', '-5 days'), datetime('now', '-5 days'), 2, 2),
('ORD-I9J0K1L2', 2, 'shipped', datetime('now', '-7 days'), 750.00, 60.00, 25.00, 75.00, 760.00, '456 Oak Ave\nLos Angeles, CA 90210', '456 Oak Ave\nLos Angeles, CA 90210', 'Order for Marketing Pro', datetime('now', '-7 days'), datetime('now', '-7 days'), 2, 2),
('ORD-M3N4O5P6', 3, 'delivered', datetime('now', '-15 days'), 2100.00, 168.00, 0.00, 210.00, 2058.00, '789 Pine St\nChicago, IL 60601', '789 Pine St\nChicago, IL 60601', 'Order for Design Studio', datetime('now', '-15 days'), datetime('now', '-15 days'), 2, 2),
('ORD-Q7R8S9T0', 4, 'pending', datetime('now', '-2 days'), 950.00, 76.00, 25.00, 0.00, 1051.00, '321 Cedar Rd\nSeattle, WA 98101', '321 Cedar Rd\nSeattle, WA 98101', 'Order for Consulting Group', datetime('now', '-2 days'), datetime('now', '-2 days'), 2, 2),
('ORD-U1V2W3X4', 5, 'delivered', datetime('now', '-12 days'), 3250.00, 260.00, 0.00, 325.00, 3185.00, '654 Elm St\nAustin, TX 73301', '654 Elm St\nAustin, TX 73301', 'Order for E-commerce Plus', datetime('now', '-12 days'), datetime('now', '-12 days'), 2, 2),
('ORD-Y5Z6A7B8', 6, 'processing', datetime('now', '-3 days'), 1750.00, 140.00, 0.00, 175.00, 1715.00, '987 Broadway\nSan Francisco, CA 94102', '987 Broadway\nSan Francisco, CA 94102', 'Order for FinTech Innovations', datetime('now', '-3 days'), datetime('now', '-3 days'), 2, 2);

-- Insert sample order items
INSERT INTO orders_orderitem (order_id, product_name, product_sku, quantity, unit_price, total_price, created_at, updated_at) VALUES
(1, 'Professional Website Design', 'SKU-1001', 1, 800.00, 800.00, datetime('now', '-10 days'), datetime('now', '-10 days')),
(1, 'SEO Optimization Package', 'SKU-1002', 1, 450.00, 450.00, datetime('now', '-10 days'), datetime('now', '-10 days')),
(2, 'Mobile App Development', 'SKU-1003', 1, 850.00, 850.00, datetime('now', '-5 days'), datetime('now', '-5 days')),
(3, 'Social Media Management', 'SKU-1004', 3, 250.00, 750.00, datetime('now', '-7 days'), datetime('now', '-7 days')),
(4, 'Brand Identity Design', 'SKU-1005', 1, 1200.00, 1200.00, datetime('now', '-15 days'), datetime('now', '-15 days')),
(4, 'Digital Marketing Campaign', 'SKU-1006', 1, 900.00, 900.00, datetime('now', '-15 days'), datetime('now', '-15 days')),
(5, 'E-commerce Platform', 'SKU-1007', 1, 950.00, 950.00, datetime('now', '-2 days'), datetime('now', '-2 days')),
(6, 'Content Management System', 'SKU-1008', 1, 2200.00, 2200.00, datetime('now', '-12 days'), datetime('now', '-12 days')),
(6, 'Cloud Migration Service', 'SKU-1009', 1, 1050.00, 1050.00, datetime('now', '-12 days'), datetime('now', '-12 days')),
(7, 'Database Optimization', 'SKU-1010', 2, 875.00, 1750.00, datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Insert sample transactions
INSERT INTO transactions_transaction (transaction_id, customer_id, order_id, transaction_type, payment_method, status, amount, fee_amount, net_amount, currency, gateway_transaction_id, gateway_response, description, notes, processed_at, created_at, updated_at, created_by_id, updated_by_id) VALUES
('TXN-A1B2C3D4', 1, 1, 'sale', 'credit_card', 'completed', 1225.00, 35.53, 1189.47, 'USD', 'gw_123456', NULL, 'Payment for order ORD-A1B2C3D4', 'Processed via Credit Card', datetime('now', '-10 days'), datetime('now', '-10 days'), datetime('now', '-10 days'), 2, 2),
('TXN-E5F6G7H8', 1, 2, 'sale', 'paypal', 'pending', 943.00, 27.35, 915.65, 'USD', 'gw_234567', NULL, 'Payment for order ORD-E5F6G7H8', 'Processed via PayPal', NULL, datetime('now', '-5 days'), datetime('now', '-5 days'), 2, 2),
('TXN-I9J0K1L2', 2, 3, 'sale', 'stripe', 'completed', 760.00, 22.04, 737.96, 'USD', 'gw_345678', NULL, 'Payment for order ORD-I9J0K1L2', 'Processed via Stripe', datetime('now', '-7 days'), datetime('now', '-7 days'), datetime('now', '-7 days'), 2, 2),
('TXN-M3N4O5P6', 3, 4, 'sale', 'credit_card', 'completed', 2058.00, 59.68, 1998.32, 'USD', 'gw_456789', NULL, 'Payment for order ORD-M3N4O5P6', 'Processed via Credit Card', datetime('now', '-15 days'), datetime('now', '-15 days'), datetime('now', '-15 days'), 2, 2),
('TXN-Q7R8S9T0', 5, 6, 'sale', 'bank_transfer', 'completed', 3185.00, 92.37, 3092.63, 'USD', 'gw_567890', NULL, 'Payment for order ORD-U1V2W3X4', 'Processed via Bank Transfer', datetime('now', '-12 days'), datetime('now', '-12 days'), datetime('now', '-12 days'), 2, 2),
('TXN-U1V2W3X4', 6, 7, 'sale', 'stripe', 'processing', 1715.00, 49.74, 1665.26, 'USD', 'gw_678901', NULL, 'Payment for order ORD-Y5Z6A7B8', 'Processed via Stripe', NULL, datetime('now', '-3 days'), datetime('now', '-3 days'), 2, 2),
('TXN-RF001122', 1, 1, 'refund', 'credit_card', 'completed', 150.00, 0.00, 150.00, 'USD', 'rf_789012', NULL, 'Refund for order ORD-A1B2C3D4', 'Customer requested partial refund', datetime('now', '-8 days'), datetime('now', '-8 days'), datetime('now', '-8 days'), 2, 2);