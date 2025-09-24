import json
import os
import random
import re
from datetime import datetime, timedelta
from decimal import Decimal

import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def generate_slug(text):
    """生成 URL 友好的 slug"""
    # 移除特殊字符，保留中英文和數字
    text = re.sub(r"[^\w\s-]", "", text)
    # 將空格替換為破折號
    text = re.sub(r"[\s_-]+", "-", text)
    # 轉為小寫
    return text.lower().strip("-")


# PostgreSQL connection configuration from environment variables
config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 15432)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}


def create_enhanced_dummy_data() -> None:
    # Validate required environment variables
    required_vars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file and ensure all database variables are set.")
        return

    try:
        print(f"🔌 Connecting to PostgreSQL database at {config['host']}...")
        # Connect to PostgreSQL
        connection = psycopg2.connect(**config)
        cursor = connection.cursor()

        print("✅ Connected to PostgreSQL database successfully!")

        # Clear existing data (optional)
        print("Clearing existing data...")
        cursor.execute("DELETE FROM transactions_transaction")
        cursor.execute("DELETE FROM orders_orderitem")
        cursor.execute("DELETE FROM orders_order")
        cursor.execute("DELETE FROM customers_customer")
        # Clear product related data
        cursor.execute("DELETE FROM products_pricehistory")
        cursor.execute("DELETE FROM products_stockmovement")
        cursor.execute("DELETE FROM products_inventory")
        cursor.execute("DELETE FROM products_productvariant")
        cursor.execute("DELETE FROM products_product")
        cursor.execute("DELETE FROM products_supplier")
        cursor.execute("DELETE FROM products_brand")
        cursor.execute("DELETE FROM products_category")

        # Get the user ID for 'young'
        cursor.execute("SELECT id FROM auth_user WHERE username = 'test_young'")
        user_result = cursor.fetchone()
        if not user_result:
            print("User 'young' not found. Please ensure the user exists.")
            return
        user_id = user_result[0]

        print(f"Using user ID: {user_id}")

        # Extended customers data (100+ customers)
        companies = [
            "Tech Solutions Inc",
            "Marketing Pro",
            "Design Studio",
            "Consulting Group",
            "E-commerce Plus",
            "FinTech Innovations",
            "Digital Agency",
            "Software Corp",
            "Creative Labs",
            "Business Solutions",
            "Data Analytics Co",
            "Web Development",
            "Mobile First",
            "Cloud Systems",
            "AI Research Lab",
            "Startup Incubator",
            "Investment Group",
            "Real Estate Pro",
            "Healthcare Tech",
            "Education Platform",
            "Food & Beverage Co",
            "Retail Chain",
            "Manufacturing Inc",
            "Logistics Solutions",
            "Energy Systems",
            "Green Technology",
            "Sports & Fitness",
            "Entertainment Hub",
            "Travel Agency",
            "Fashion Brand",
            "Beauty & Wellness",
            "Home Improvement",
            "Auto Services",
            "Pet Care Plus",
            "Legal Services",
            "Financial Planning",
            "Insurance Group",
            "Construction Co",
            "Architecture Firm",
            "Interior Design",
            "Photography Studio",
            "Video Production",
            "Music Label",
            "Gaming Company",
            "Social Media Inc",
            "Content Creation",
            "Influencer Network",
            "Advertising Agency",
            "PR Company",
            "Event Planning",
        ]

        first_names = [
            "John",
            "Jane",
            "Bob",
            "Alice",
            "Mike",
            "Sarah",
            "David",
            "Emma",
            "Chris",
            "Lisa",
            "Tom",
            "Anna",
            "Steve",
            "Maria",
            "Kevin",
            "Jennifer",
            "Mark",
            "Jessica",
            "Paul",
            "Amy",
            "Daniel",
            "Michelle",
            "James",
            "Laura",
            "Robert",
            "Karen",
            "William",
            "Nancy",
            "Richard",
            "Helen",
            "Charles",
            "Betty",
            "Joseph",
            "Dorothy",
            "Thomas",
            "Lisa",
            "Christopher",
            "Sandra",
            "Matthew",
            "Donna",
            "Anthony",
            "Carol",
            "Donald",
            "Ruth",
            "Steven",
            "Sharon",
            "Kenneth",
            "Michelle",
            "Andrew",
            "Emily",
            "Brian",
            "Kimberly",
            "Joshua",
            "Deborah",
            "Justin",
            "Rachel",
            "Daniel",
            "Carolyn",
            "Nathan",
            "Janet",
            "Michael",
            "Catherine",
            "Ryan",
            "Frances",
            "Timothy",
            "Christine",
            "Sean",
            "Samantha",
            "Alexander",
            "Debra",
            "Patrick",
            "Mary",
            "Jack",
            "Patricia",
            "Dennis",
            "Linda",
            "Jerry",
            "Barbara",
            "Tyler",
            "Elizabeth",
            "Aaron",
            "Susan",
            "Jose",
            "Margaret",
            "Henry",
            "Dorothy",
            "Adam",
            "Lisa",
            "Douglas",
            "Nancy",
            "Peter",
            "Helen",
            "Noah",
            "Betty",
            "Arthur",
            "Sandra",
            "Walter",
            "Donna",
            "Carl",
            "Carol",
        ]

        last_names = [
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Garcia",
            "Miller",
            "Davis",
            "Rodriguez",
            "Martinez",
            "Hernandez",
            "Lopez",
            "Gonzalez",
            "Wilson",
            "Anderson",
            "Thomas",
            "Taylor",
            "Moore",
            "Jackson",
            "Martin",
            "Lee",
            "Perez",
            "Thompson",
            "White",
            "Harris",
            "Sanchez",
            "Clark",
            "Ramirez",
            "Lewis",
            "Robinson",
            "Walker",
            "Young",
            "Allen",
            "King",
            "Wright",
            "Scott",
            "Torres",
            "Nguyen",
            "Hill",
            "Flores",
            "Green",
            "Adams",
            "Nelson",
            "Baker",
            "Hall",
            "Rivera",
            "Campbell",
            "Mitchell",
            "Carter",
            "Roberts",
            "Gomez",
            "Phillips",
            "Evans",
            "Turner",
            "Diaz",
            "Parker",
            "Cruz",
            "Edwards",
            "Collins",
            "Reyes",
            "Stewart",
            "Morris",
            "Morales",
            "Murphy",
            "Cook",
            "Rogers",
            "Gutierrez",
            "Ortiz",
            "Morgan",
            "Cooper",
            "Peterson",
            "Bailey",
            "Reed",
            "Kelly",
            "Howard",
            "Ramos",
            "Kim",
            "Cox",
            "Ward",
            "Richardson",
            "Watson",
            "Brooks",
            "Chavez",
            "Wood",
            "James",
            "Bennett",
            "Gray",
            "Mendoza",
            "Ruiz",
            "Hughes",
            "Price",
            "Alvarez",
            "Castillo",
            "Sanders",
            "Patel",
            "Myers",
            "Long",
            "Ross",
            "Foster",
            "Jimenez",
        ]

        cities = [
            ("New York", "NY", "10001"),
            ("Los Angeles", "CA", "90210"),
            ("Chicago", "IL", "60601"),
            ("Houston", "TX", "77001"),
            ("Phoenix", "AZ", "85001"),
            ("Philadelphia", "PA", "19101"),
            ("San Antonio", "TX", "78201"),
            ("San Diego", "CA", "92101"),
            ("Dallas", "TX", "75201"),
            ("San Jose", "CA", "95101"),
            ("Austin", "TX", "73301"),
            ("Jacksonville", "FL", "32201"),
            ("Fort Worth", "TX", "76101"),
            ("Columbus", "OH", "43201"),
            ("Charlotte", "NC", "28201"),
            ("San Francisco", "CA", "94101"),
            ("Indianapolis", "IN", "46201"),
            ("Seattle", "WA", "98101"),
            ("Denver", "CO", "80201"),
            ("Washington", "DC", "20001"),
            ("Boston", "MA", "02101"),
            ("El Paso", "TX", "79901"),
            ("Nashville", "TN", "37201"),
            ("Detroit", "MI", "48201"),
            ("Oklahoma City", "OK", "73101"),
            ("Portland", "OR", "97201"),
            ("Las Vegas", "NV", "89101"),
            ("Memphis", "TN", "38101"),
            ("Louisville", "KY", "40201"),
            ("Baltimore", "MD", "21201"),
            ("Milwaukee", "WI", "53201"),
            ("Albuquerque", "NM", "87101"),
            ("Tucson", "AZ", "85701"),
            ("Fresno", "CA", "93701"),
            ("Mesa", "AZ", "85201"),
            ("Sacramento", "CA", "95814"),
            ("Atlanta", "GA", "30301"),
            ("Kansas City", "MO", "64101"),
            ("Colorado Springs", "CO", "80901"),
            ("Miami", "FL", "33101"),
            ("Raleigh", "NC", "27601"),
            ("Omaha", "NE", "68101"),
            ("Long Beach", "CA", "90801"),
            ("Virginia Beach", "VA", "23451"),
            ("Oakland", "CA", "94601"),
            ("Minneapolis", "MN", "55401"),
            ("Tulsa", "OK", "74101"),
            ("Arlington", "TX", "76010"),
            ("Tampa", "FL", "33601"),
            ("New Orleans", "LA", "70112"),
            ("Wichita", "KS", "67201"),
        ]

        sources = [
            "website",
            "social_media",
            "referral",
            "advertisement",
            "trade_show",
            "email_campaign",
            "phone_call",
            "walk_in",
        ]
        tags_list = [
            "enterprise",
            "priority",
            "marketing",
            "agency",
            "design",
            "creative",
            "consulting",
            "business",
            "ecommerce",
            "retail",
            "fintech",
            "startup",
            "vip",
            "premium",
            "budget",
            "corporate",
            "small_business",
            "non_profit",
        ]

        # 新增欄位的選項
        genders = ["male", "female", "other", "prefer_not_to_say"]
        seasonal_patterns = ["spring", "summer", "autumn", "winter", "year_round"]
        product_categories = [
            "電子產品",
            "服飾配件",
            "居家用品",
            "美妝保養",
            "運動健身",
            "書籍文具",
            "食品飲料",
            "旅遊票券",
            "汽車用品",
            "寵物用品",
        ]

        customer_insert_query = """
        INSERT INTO customers_customer
        (first_name, last_name, email, phone, company, address, city, state, zip_code, country, source, tags, notes, age, gender, product_categories_interest, seasonal_purchase_pattern, is_active, created_at, updated_at, created_by_id, updated_by_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        now = datetime.now()
        customer_ids = []
        used_emails = set()  # 追蹤已使用的 email
        domains = [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "company.com",
            "business.net",
        ]

        # 生成 500 筆客戶資料
        for i in range(500):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)

            # 確保 email 不重複
            attempts = 0
            while attempts < 10:  # 最多嘗試 10 次
                domain = random.choice(domains)
                if attempts == 0:
                    email = f"{first_name.lower()}.{last_name.lower()}@{domain}"
                else:
                    # 如果重複，加上隨機數字
                    email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@{domain}"

                if email not in used_emails:
                    used_emails.add(email)
                    break
                attempts += 1
            else:
                # 如果仍然重複，使用時間戳確保唯一性
                email = f"{first_name.lower()}.{last_name.lower()}.{int(datetime.now().timestamp())}@{random.choice(domains)}"
                used_emails.add(email)
            phone = f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            company = random.choice(companies)
            address = f"{random.randint(100, 9999)} {random.choice(['Main St', 'Oak Ave', 'Pine St', 'Cedar Rd', 'Elm St', 'Broadway', 'First Ave', 'Second St', 'Park Ave', 'Market St'])}"
            city, state, zip_code = random.choice(cities)
            source = random.choice(sources)
            tags = ", ".join(random.sample(tags_list, random.randint(1, 3)))
            notes = f"Customer from {company} - {random.choice(['High value client', 'Regular customer', 'New prospect', 'Returning customer', 'Referral client'])}"

            # 新增欄位的資料生成
            age = (
                random.randint(18, 75) if random.random() > 0.1 else None
            )  # 90% 有年齡資料
            gender = (
                random.choice(genders) if random.random() > 0.2 else None
            )  # 80% 有性別資料

            # 產品偏好：隨機選擇 1-3 個類別
            interests = (
                random.sample(product_categories, random.randint(1, 3))
                if random.random() > 0.3
                else []
            )
            product_interests_json = json.dumps(interests, ensure_ascii=False)

            # 季節性購買模式
            seasonal_pattern = (
                random.choice(seasonal_patterns) if random.random() > 0.4 else None
            )  # 60% 有季節偏好

            # Create customers over the last 5 years with more variation
            created_at = now - timedelta(days=random.randint(1, 1825))  # 5 years

            cursor.execute(
                customer_insert_query,
                (
                    first_name,
                    last_name,
                    email,
                    phone,
                    company,
                    address,
                    city,
                    state,
                    zip_code,
                    "USA",
                    source,
                    tags,
                    notes,
                    age,
                    gender,
                    product_interests_json,
                    seasonal_pattern,
                    True,
                    created_at,
                    created_at,
                    user_id,
                    user_id,
                ),
            )
            customer_id = cursor.fetchone()[0]
            customer_ids.append(customer_id)
            if (i + 1) % 20 == 0:
                print(f"Created {i + 1} customers...")

        print(f"Created {len(customer_ids)} customers")

        # Create product categories
        category_names = [
            "電子產品",
            "3C配件",
            "家電用品",
            "智慧型手機",
            "筆記型電腦",
            "服飾配件",
            "男裝",
            "女裝",
            "童裝",
            "包包配件",
            "居家用品",
            "傢俱",
            "寢具",
            "廚具",
            "清潔用品",
            "美妝保養",
            "彩妝",
            "保養品",
            "香水",
            "美髮用品",
            "運動健身",
            "運動服飾",
            "健身器材",
            "戶外用品",
            "運動鞋",
            "書籍文具",
            "文具用品",
            "辦公用品",
            "教育用品",
            "藝術用品",
            "食品飲料",
            "零食",
            "飲料",
            "保健食品",
            "有機食品",
            "汽車用品",
            "汽車配件",
            "機車用品",
            "汽車保養",
            "行車記錄器",
            "寵物用品",
            "寵物食品",
            "寵物玩具",
            "寵物保健",
            "寵物用品",
        ]

        category_insert_query = """
        INSERT INTO products_category (name, description, slug, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        category_ids = []
        used_slugs = set()  # 追蹤已使用的 slug

        for i, name in enumerate(category_names):
            description = f"{name}相關產品分類"
            created_at = now - timedelta(days=random.randint(365, 1825))

            # 生成唯一的 slug
            base_slug = generate_slug(name)
            slug = base_slug
            counter = 1
            while slug in used_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            used_slugs.add(slug)

            cursor.execute(
                category_insert_query,
                (name, description, slug, True, created_at, created_at),
            )
            category_id = cursor.fetchone()[0]
            category_ids.append(category_id)

        print(f"Created {len(category_ids)} product categories")

        # Create brands
        brand_names = [
            "Apple",
            "Samsung",
            "Sony",
            "LG",
            "Panasonic",
            "Philips",
            "Bosch",
            "Nike",
            "Adidas",
            "Uniqlo",
            "Zara",
            "H&M",
            "Gap",
            "Levi's",
            "IKEA",
            "Muji",
            "Nitori",
            "Francfranc",
            "Hola",
            "L'Oreal",
            "Maybelline",
            "Clinique",
            "Estee Lauder",
            "Shiseido",
            "Under Armour",
            "Puma",
            "New Balance",
            "Asics",
            "Mizuno",
            "Pilot",
            "Zebra",
            "Uni",
            "Staedtler",
            "Faber-Castell",
            "Coca-Cola",
            "Pepsi",
            "Nestle",
            "Kellogg's",
            "Quaker",
            "Toyota",
            "Honda",
            "Nissan",
            "Hyundai",
            "BMW",
            "Royal Canin",
            "Purina",
            "Hill's",
            "Whiskas",
            "Pedigree",
        ]

        brand_insert_query = """
        INSERT INTO products_brand (name, description, logo_url, website, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        brand_ids = []
        for name in brand_names:
            description = f"{name}品牌產品"
            created_at = now - timedelta(days=random.randint(365, 1825))

            cursor.execute(
                brand_insert_query,
                (name, description, "", "", True, created_at, created_at),
            )
            brand_id = cursor.fetchone()[0]
            brand_ids.append(brand_id)

        print(f"Created {len(brand_ids)} brands")

        # Create suppliers
        supplier_names = [
            "台灣電子股份有限公司",
            "亞洲科技供應商",
            "全球電子批發商",
            "智慧產品供應商",
            "時尚服飾供應商",
            "潮流服飾批發",
            "國際服裝供應商",
            "精品服飾批發",
            "居家生活供應商",
            "傢俱批發商",
            "生活用品供應商",
            "設計傢俱供應商",
            "美妝保養供應商",
            "化妝品批發商",
            "保養品供應商",
            "香水批發商",
            "運動用品供應商",
            "健身器材批發",
            "戶外用品供應商",
            "運動服飾批發",
            "文具用品供應商",
            "辦公用品批發",
            "教育用品供應商",
            "藝術用品批發",
            "食品飲料供應商",
            "有機食品批發",
            "健康食品供應商",
            "飲料批發商",
            "汽車用品供應商",
            "汽車配件批發",
            "機車用品供應商",
            "汽車保養批發",
            "寵物用品供應商",
            "寵物食品批發",
            "寵物玩具供應商",
            "寵物保健批發",
        ]

        supplier_insert_query = """
        INSERT INTO products_supplier (name, contact_person, email, phone, address, payment_terms, credit_limit, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        supplier_ids = []
        for name in supplier_names:
            contact_person = f"{random.choice(first_names)} {random.choice(last_names)}"
            email = f"{contact_person.replace(' ', '').lower()}@{name.replace(' ', '').lower()}.com"
            phone = f"+886-{random.randint(2, 9)}-{random.randint(10000000, 99999999)}"
            city_info = random.choice(cities)
            address = f"{random.randint(1, 999)}號, {city_info[0]}, {city_info[1]} {city_info[2]}"
            created_at = now - timedelta(days=random.randint(365, 1825))

            cursor.execute(
                supplier_insert_query,
                (
                    name,
                    contact_person,
                    email,
                    phone,
                    address,
                    "30天",
                    10000.00,
                    True,
                    created_at,
                    created_at,
                ),
            )
            supplier_id = cursor.fetchone()[0]
            supplier_ids.append(supplier_id)

        print(f"Created {len(supplier_ids)} suppliers")

        # Create products
        product_names = [
            # 電子產品
            "iPhone 15 Pro",
            "Samsung Galaxy S24",
            "MacBook Pro 14吋",
            "iPad Air",
            "AirPods Pro",
            "Sony WH-1000XM5",
            "LG 55吋 4K 電視",
            "Dyson V15 吸塵器",
            "Switch OLED 遊戲機",
            # 服飾配件
            "Nike Air Force 1",
            "Adidas Stan Smith",
            "Uniqlo 發熱衣",
            "Zara 羊毛大衣",
            "Levi's 牛仔褲",
            "Coach 手提包",
            "Casio 電子錶",
            "Ray-Ban 太陽眼鏡",
            "Converse 帆布鞋",
            # 居家用品
            "IKEA 沙發",
            "Muji 收納盒",
            "Nitori 床墊",
            "Panasonic 電子鍋",
            "Tiger 保溫瓶",
            "Philips 空氣清淨機",
            "Bosch 洗衣機",
            "KitchenAid 攪拌機",
            "Le Creuset 鑄鐵鍋",
            # 美妝保養
            "SK-II 精華液",
            "Estee Lauder 粉底",
            "Clinique 卸妝水",
            "MAC 口紅",
            "Shiseido 防曬乳",
            "Lancome 睫毛膏",
            "Kiehl's 精華油",
            "Origins 面膜",
            "Fresh 護唇膏",
            # 運動健身
            "Under Armour 運動鞋",
            "Puma 運動服",
            "New Balance 慢跑鞋",
            "Asics 網球鞋",
            "Mizuno 高爾夫球具",
            "Wilson 網球拍",
            "Spalding 籃球",
            "Adidas 足球",
            # 書籍文具
            "Pilot 鋼筆",
            "Zebra 原子筆",
            "Uni 自動鉛筆",
            "Staedtler 色鉛筆",
            "Moleskine 筆記本",
            "Post-it 便利貼",
            "Scotch 膠帶",
            "3M 修正液",
            "Pentel 螢光筆",
            # 食品飲料
            "Costa 咖啡豆",
            "Haribo 軟糖",
            "Ferrero Rocher 巧克力",
            "Pringles 洋芋片",
            "Coca-Cola 可樂",
            "Red Bull 能量飲料",
            "Evian 礦泉水",
            "Lipton 茶包",
            # 汽車用品
            "Michelin 輪胎",
            "Bosch 雨刷",
            "Garmin 導航機",
            "Thule 行李架",
            "Castrol 機油",
            "3M 隔熱紙",
            "Pioneer 音響",
            "Philips 車用燈泡",
            "Meguiar's 清潔劑",
            # 寵物用品
            "Royal Canin 狗糧",
            "Whiskas 貓糧",
            "Hill's 處方糧",
            "Purina 零食",
            "Kong 玩具",
            "Petmate 飼料碗",
            "Flexi 牽繩",
            "Catit 貓砂",
            "Aqueon 魚缸",
        ]

        product_insert_query = """
        INSERT INTO products_product (name, sku, description, category_id, brand_id, supplier_id,
                                    base_price, cost_price, is_active, is_digital, weight, dimensions,
                                    image_url, tax_rate, min_order_quantity, tags, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        product_ids = []
        used_skus = set()  # 追蹤已使用的 SKU

        for i, name in enumerate(product_names):
            # 確保 SKU 不重複
            attempts = 0
            while attempts < 10:
                sku = f"SKU-{random.randint(100000, 999999)}"
                if sku not in used_skus:
                    used_skus.add(sku)
                    break
                attempts += 1
            else:
                # 如果仍然重複，使用索引確保唯一性
                sku = f"SKU-{1000000 + i:06d}"
                used_skus.add(sku)
            description = f"{name}產品描述，高品質商品，值得信賴的選擇。"
            category_id = random.choice(category_ids)
            brand_id = random.choice(brand_ids)
            supplier_id = random.choice(supplier_ids)

            # 價格設定
            cost_price = Decimal(random.uniform(50, 5000)).quantize(Decimal("0.01"))
            base_price = (cost_price * Decimal(random.uniform(1.3, 2.5))).quantize(
                Decimal("0.01")
            )

            is_digital = (
                random.choice([True, False]) if random.random() < 0.1 else False
            )  # 10% 數位商品
            weight = random.uniform(0.1, 50.0) if not is_digital else None
            # dimensions 不能為 NULL，數位商品也給予虛擬尺寸
            if is_digital:
                dimensions = ""  # 數位商品給空字串
            else:
                dimensions = f"{random.randint(10, 100)}x{random.randint(10, 100)}x{random.randint(5, 50)}cm"

            # 生成產品標籤
            product_tags = [
                "熱門",
                "新品",
                "推薦",
                "限量",
                "特價",
                "精選",
                "暢銷",
                "優質",
                "進口",
                "台灣製造",
                "環保",
                "健康",
            ]
            tags = (
                random.sample(product_tags, random.randint(0, 3))
                if random.random() > 0.3
                else []
            )
            tags_json = json.dumps(tags, ensure_ascii=False)

            # 其他欄位
            image_url = ""  # 空字串
            tax_rate = Decimal("5.00")  # 預設稅率 5%
            min_order_quantity = random.randint(1, 5)  # 最小訂購量 1-5

            created_at = now - timedelta(days=random.randint(1, 1095))  # 3 years

            cursor.execute(
                product_insert_query,
                (
                    name,
                    sku,
                    description,
                    category_id,
                    brand_id,
                    supplier_id,
                    float(base_price),
                    float(cost_price),
                    True,
                    is_digital,
                    weight,
                    dimensions,
                    image_url,
                    float(tax_rate),
                    min_order_quantity,
                    tags_json,
                    created_at,
                    created_at,
                ),
            )
            product_id = cursor.fetchone()[0]
            product_ids.append(product_id)

        print(f"Created {len(product_ids)} products")

        # Create inventory for products
        inventory_insert_query = """
        INSERT INTO products_inventory (product_id, quantity_on_hand, quantity_reserved,
                                      reorder_level, max_stock_level, location, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        locations = [
            "倉庫A",
            "倉庫B",
            "倉庫C",
            "門市庫房",
            "配送中心",
            "主倉庫",
            "備品庫",
        ]

        for product_id in product_ids:
            quantity_on_hand = random.randint(0, 500)
            quantity_reserved = random.randint(0, min(quantity_on_hand, 50))
            reorder_level = random.randint(10, 50)
            max_stock_level = random.randint(100, 1000)
            location = random.choice(locations)

            cursor.execute(
                inventory_insert_query,
                (
                    product_id,
                    quantity_on_hand,
                    quantity_reserved,
                    reorder_level,
                    max_stock_level,
                    location,
                    now,
                ),
            )

        print(f"Created inventory for {len(product_ids)} products")

        # Create some stock movements
        stock_movement_insert_query = """
        INSERT INTO products_stockmovement (product_id, movement_type, quantity, reference_type,
                                          reference_id, notes, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        movement_types = ["inbound", "outbound", "adjustment"]
        reference_types = ["purchase", "sale", "adjustment", "return"]

        for product_id in product_ids:
            # 每個產品創建 2-5 個庫存異動記錄
            num_movements = random.randint(2, 5)
            for _ in range(num_movements):
                movement_type = random.choice(movement_types)
                quantity = random.randint(1, 100)
                if movement_type == "outbound":
                    quantity = -quantity
                elif movement_type == "adjustment":
                    quantity = random.randint(-50, 50)

                reference_type = random.choice(reference_types)
                reference_id = random.randint(1000, 9999)
                notes = f"{movement_type} - {reference_type} #{reference_id}"

                movement_date = now - timedelta(days=random.randint(1, 365))

                cursor.execute(
                    stock_movement_insert_query,
                    (
                        product_id,
                        movement_type,
                        quantity,
                        reference_type,
                        reference_id,
                        notes,
                        movement_date,
                    ),
                )

        print("Created stock movements for products")

        # Insert sample orders with better date distribution
        order_insert_query = """
        INSERT INTO orders_order
        (order_number, customer_id, status, order_date, subtotal, tax_amount, shipping_amount, discount_amount, total, shipping_address, billing_address, notes, created_at, updated_at, created_by_id, updated_by_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        order_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        order_ids = []
        used_order_numbers = set()  # 追蹤已使用的訂單號碼

        # Create orders distributed over time
        for customer_id in customer_ids:
            # Each customer gets 1-5 orders
            num_orders = random.randint(1, 5)
            for j in range(num_orders):
                # 確保訂單號碼不重複
                attempts = 0
                while attempts < 10:
                    order_number = f"ORD-{random.randint(10000000, 99999999):08X}"
                    if order_number not in used_order_numbers:
                        used_order_numbers.add(order_number)
                        break
                    attempts += 1
                else:
                    # 使用時間戳確保唯一性
                    order_number = (
                        f"ORD-{int(datetime.now().timestamp())}-{customer_id}-{j}"
                    )
                    used_order_numbers.add(order_number)
                # Create a weighted distribution for subtotal amounts
                # 70% normal orders (100-2000), 20% medium orders (2000-10000), 10% large orders (10000-80000)
                rand_val = random.random()
                if rand_val < 0.7:
                    subtotal = Decimal(random.uniform(100, 2000)).quantize(
                        Decimal("0.01")
                    )
                elif rand_val < 0.9:
                    subtotal = Decimal(random.uniform(2000, 10000)).quantize(
                        Decimal("0.01")
                    )
                else:
                    subtotal = Decimal(random.uniform(10000, 80000)).quantize(
                        Decimal("0.01")
                    )
                tax_amount = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
                shipping_amount = (
                    Decimal("25.00") if subtotal < 1000 else Decimal("0.00")
                )
                discount_amount = Decimal("0.00")
                if random.choice([True, False]):  # 50% chance of discount
                    discount_amount = (
                        subtotal * Decimal(random.uniform(0.05, 0.20))
                    ).quantize(Decimal("0.01"))

                total = subtotal + tax_amount + shipping_amount - discount_amount

                # Create orders spanning the last 5 years with seasonal patterns
                days_back = random.randint(1, 1825)  # 5 years

                # Add seasonal variation (more orders in Nov-Dec, Mar-Apr, Jul-Aug)
                month_factor = 1.0
                target_month = (now - timedelta(days=days_back)).month
                if target_month in {11, 12}:  # Holiday season
                    month_factor = 1.5
                elif target_month in {3, 4}:  # Spring
                    month_factor = 1.3
                elif target_month in {7, 8}:  # Summer
                    month_factor = 1.2

                if random.random() < month_factor / 2:
                    order_date = now - timedelta(days=days_back)

                    cursor.execute(
                        order_insert_query,
                        (
                            order_number,
                            customer_id,
                            random.choice(order_statuses),
                            order_date,
                            float(subtotal),
                            float(tax_amount),
                            float(shipping_amount),
                            float(discount_amount),
                            float(total),
                            f"Address for customer {customer_id}",
                            f"Billing address for customer {customer_id}",
                            f"Order for customer {customer_id}",
                            order_date,
                            order_date,
                            user_id,
                            user_id,
                        ),
                    )
                    order_id = cursor.fetchone()[0]
                    order_ids.append(order_id)

        print(f"Created {len(order_ids)} orders")

        # Insert sample order items
        product_names = [
            "Professional Website Design",
            "Mobile App Development",
            "SEO Optimization Package",
            "Social Media Management",
            "Brand Identity Design",
            "E-commerce Platform",
            "Digital Marketing Campaign",
            "Content Management System",
            "Database Optimization",
            "Cloud Migration Service",
            "API Development",
            "UI/UX Design",
            "Logo Design",
            "Business Card Design",
            "Brochure Design",
            "Video Production",
            "Photography Service",
            "Copywriting Service",
            "Email Marketing",
            "PPC Campaign",
            "Web Hosting",
            "Domain Registration",
            "SSL Certificate",
            "Website Maintenance",
            "Technical Support",
            "Data Analytics",
            "Report Generation",
            "Dashboard Creation",
            "Training Workshop",
            "Consulting Session",
            "Software License",
            "Premium Plugin",
            "Custom Integration",
            "Security Audit",
            "Performance Optimization",
        ]

        orderitem_insert_query = """
        INSERT INTO orders_orderitem
        (order_id, product_name, product_sku, quantity, unit_price, total_price, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        for order_id in order_ids:
            # Create 1-5 items per order
            num_items = random.randint(1, 5)
            for _k in range(num_items):
                quantity = random.randint(1, 4)
                unit_price = Decimal(random.uniform(50, 1200)).quantize(Decimal("0.01"))
                total_price = quantity * unit_price

                cursor.execute(
                    orderitem_insert_query,
                    (
                        order_id,
                        random.choice(product_names),
                        f"SKU-{random.randint(1000, 9999)}",
                        quantity,
                        float(unit_price),
                        float(total_price),
                        now,
                        now,
                    ),
                )

        print(f"Created order items for {len(order_ids)} orders")

        # Insert sample transactions
        transaction_insert_query = """
        INSERT INTO transactions_transaction
        (transaction_id, customer_id, order_id, transaction_type, payment_method, status, amount, fee_amount, net_amount, currency, gateway_transaction_id, description, notes, processed_at, created_at, updated_at, created_by_id, updated_by_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        payment_methods = [
            "credit_card",
            "paypal",
            "stripe",
            "bank_transfer",
            "apple_pay",
            "google_pay",
            "line_Pay",
        ]
        transaction_statuses = ["pending", "completed", "failed", "refunded"]
        used_transaction_ids = set()  # 追蹤已使用的交易 ID

        # Get orders with their customer info and dates
        cursor.execute("SELECT id, customer_id, total, order_date FROM orders_order")
        orders = cursor.fetchall()

        for order_id, customer_id, order_total, order_date in orders:
            # 85% chance to create a transaction
            if random.random() < 0.85:
                # 確保交易 ID 不重複
                attempts = 0
                while attempts < 10:
                    transaction_id = f"TXN-{random.randint(10000000, 99999999):08X}"
                    if transaction_id not in used_transaction_ids:
                        used_transaction_ids.add(transaction_id)
                        break
                    attempts += 1
                else:
                    # 使用訂單 ID 確保唯一性
                    transaction_id = f"TXN-{order_id}-{int(datetime.now().timestamp())}"
                    used_transaction_ids.add(transaction_id)
                amount = Decimal(str(order_total))
                fee_amount = (amount * Decimal("0.029")).quantize(
                    Decimal("0.01")
                )  # 2.9% fee
                net_amount = amount - fee_amount

                # Transaction processed within 0-7 days of order
                processed_at = order_date + timedelta(days=random.randint(0, 7))

                cursor.execute(
                    transaction_insert_query,
                    (
                        transaction_id,
                        customer_id,
                        order_id,
                        "sale",
                        random.choice(payment_methods),
                        random.choice(transaction_statuses),
                        float(amount),
                        float(fee_amount),
                        float(net_amount),
                        "USD",
                        f"gw_{random.randint(100000, 999999)}",
                        f"Payment for order {order_id}",
                        "Automated payment processing",
                        processed_at,
                        processed_at,
                        processed_at,
                        user_id,
                        user_id,
                    ),
                )

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
        cursor.execute("SELECT COUNT(*) FROM products_category")
        category_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM products_brand")
        brand_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM products_supplier")
        supplier_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM products_product")
        product_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM products_inventory")
        inventory_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM products_stockmovement")
        movement_count = cursor.fetchone()[0]

        print("\n✅ Enhanced dummy data creation completed!")
        print(f"Created {customer_count} customers")
        print(f"Created {order_count} orders")
        print(f"Created {orderitem_count} order items")
        print(f"Created {transaction_count} transactions")
        print(f"Created {category_count} product categories")
        print(f"Created {brand_count} brands")
        print(f"Created {supplier_count} suppliers")
        print(f"Created {product_count} products")
        print(f"Created {inventory_count} inventory records")
        print(f"Created {movement_count} stock movements")
        print(
            "\n📊 Data spans 5 years (2020-2025) with seasonal variations for better dashboard visualization"
        )

    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()
        print("Database connection closed.")


if __name__ == "__main__":
    create_enhanced_dummy_data()
