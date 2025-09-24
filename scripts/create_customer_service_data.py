"""客服系統測試資料生成腳本

生成客服工單、知識庫文章和常見問題的測試資料
使用直接 PostgreSQL 連接，參考 create_enhanced_dummy_data 的做法
"""

import json
import os
import pathlib
import random
from datetime import datetime, timedelta

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(pathlib.Path(__file__).parent, ".env")
print(f"🔍 載入環境變數檔案: {env_path}")
load_dotenv(env_path, override=True)

# 調試環境變數
print(f"🔍 DB_HOST 原始值: '{os.getenv('DB_HOST')}'")
print(f"🔍 DB_HOST 長度: {len(os.getenv('DB_HOST', ''))}")
print(f"🔍 DB_HOST repr: {os.getenv('DB_HOST')!r}")

# 清理 DB_HOST (移除可能的空格和註解)
db_host_raw = os.getenv("DB_HOST", "localhost")
print(f"🔍 清理後的 DB_HOST: '{db_host_raw}'")

# PostgreSQL connection configuration from environment variables
config = {
    "host": db_host_raw,
    "port": int(os.getenv("DB_PORT", 5432)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}


class CustomerServiceDataGenerator:
    def __init__(self) -> None:
        self.connection = None
        self.cursor = None
        self.admin_user_id = 1  # 假設管理員用戶ID為1
        self.customers = []
        self.categories = []

    def connect_database(self) -> bool | None:
        """連接到資料庫"""
        try:
            print(f"🔗 連接資料庫: {config['host']}:{config['port']}")
            self.connection = psycopg2.connect(**config)
            self.cursor = self.connection.cursor(
                cursor_factory=psycopg2.extras.DictCursor
            )
            print("✅ 資料庫連接成功")
            return True
        except Exception as e:
            print(f"❌ 資料庫連接失敗: {e}")
            return False

    def close_database(self) -> None:
        """關閉資料庫連接"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("📪 資料庫連接已關閉")

    def get_or_create_admin_user(self) -> None:
        """確保有管理員用戶"""
        try:
            # 檢查是否有超級用戶
            self.cursor.execute(
                "SELECT id FROM auth_user WHERE is_superuser = true LIMIT 1"
            )
            result = self.cursor.fetchone()

            if result:
                self.admin_user_id = result[0]
                print(f"✅ 找到管理員用戶 ID: {self.admin_user_id}")
            else:
                # 創建管理員用戶
                from django.contrib.auth.hashers import make_password

                password_hash = make_password("admin123")

                insert_sql = """
                INSERT INTO auth_user (username, first_name, last_name, email, is_staff, is_active, is_superuser, date_joined, password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """

                self.cursor.execute(
                    insert_sql,
                    (
                        "admin",
                        "",
                        "",
                        "admin@test.com",
                        True,
                        True,
                        True,
                        datetime.now(),
                        password_hash,
                    ),
                )
                self.admin_user_id = self.cursor.fetchone()[0]
                print(f"✅ 創建管理員用戶 ID: {self.admin_user_id}")

        except Exception as e:
            print(f"⚠️ 管理員用戶處理失敗，使用預設ID=1: {e}")
            self.admin_user_id = 1

    def create_test_customers(self) -> None:
        """創建測試客戶資料"""
        print("👥 創建測試客戶資料...")

        customers_data = [
            {
                "name": "王小明",
                "email": "wang.xiaoming@test.com",
                "phone": "0912-345-678",
            },
            {"name": "李小華", "email": "li.xiaohua@test.com", "phone": "0923-456-789"},
            {"name": "陳大文", "email": "chen.dawen@test.com", "phone": "0934-567-890"},
            {
                "name": "林小美",
                "email": "lin.xiaomei@test.com",
                "phone": "0945-678-901",
            },
            {
                "name": "張志明",
                "email": "zhang.zhiming@test.com",
                "phone": "0956-789-012",
            },
            {
                "name": "劉小芳",
                "email": "liu.xiaofang@test.com",
                "phone": "0967-890-123",
            },
            {
                "name": "黃大明",
                "email": "huang.daming@test.com",
                "phone": "0978-901-234",
            },
            {
                "name": "吳小玲",
                "email": "wu.xiaoling@test.com",
                "phone": "0989-012-345",
            },
            {
                "name": "周文華",
                "email": "zhou.wenhua@test.com",
                "phone": "0990-123-456",
            },
            {
                "name": "蔡小雯",
                "email": "cai.xiaowen@test.com",
                "phone": "0901-234-567",
            },
            {
                "name": "楊志強",
                "email": "yang.zhiqiang@test.com",
                "phone": "0912-345-670",
            },
            {"name": "許美玲", "email": "xu.meiling@test.com", "phone": "0923-456-781"},
            {"name": "郭大偉", "email": "guo.dawei@test.com", "phone": "0934-567-892"},
            {
                "name": "謝小君",
                "email": "xie.xiaojun@test.com",
                "phone": "0945-678-903",
            },
            {"name": "高志文", "email": "gao.zhiwen@test.com", "phone": "0956-789-014"},
            {"name": "蘇小慧", "email": "su.xiaohui@test.com", "phone": "0967-890-125"},
            {
                "name": "江大成",
                "email": "jiang.dacheng@test.com",
                "phone": "0978-901-236",
            },
            {
                "name": "賴小英",
                "email": "lai.xiaoying@test.com",
                "phone": "0989-012-347",
            },
            {
                "name": "簡志豪",
                "email": "jian.zhihao@test.com",
                "phone": "0990-123-458",
            },
            {
                "name": "范小珍",
                "email": "fan.xiaozhen@test.com",
                "phone": "0901-234-569",
            },
        ]

        insert_sql = """
        INSERT INTO customers_customer
        (first_name, last_name, email, phone, city, country, source, age, gender, is_active, product_categories_interest, created_by_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (email) DO NOTHING RETURNING id
        """

        created_count = 0
        for data in customers_data:
            first_name = data["name"][0]
            last_name = data["name"][1:] if len(data["name"]) > 1 else ""
            now = datetime.now()

            try:
                # 隨機生成產品興趣
                product_interests = random.sample(
                    [
                        "電子產品",
                        "服飾配件",
                        "居家用品",
                        "美妝保養",
                        "運動健身",
                        "書籍文具",
                        "食品飲料",
                    ],
                    k=random.randint(1, 3),
                )

                self.cursor.execute(
                    insert_sql,
                    (
                        first_name,
                        last_name,
                        data["email"],
                        data["phone"],
                        random.choice(["台北", "新北", "桃園", "台中", "台南", "高雄"]),
                        "台灣",
                        random.choice(
                            ["website", "social_media", "referral", "advertisement"]
                        ),
                        random.randint(20, 65),
                        random.choice(["male", "female"]),
                        True,  # is_active
                        json.dumps(
                            product_interests, ensure_ascii=False
                        ),  # product_categories_interest
                        self.admin_user_id,
                        now,
                        now,
                    ),
                )
                result = self.cursor.fetchone()
                if result:
                    customer_id = result[0]
                    self.customers.append(
                        {
                            "id": customer_id,
                            "name": data["name"],
                            "email": data["email"],
                        }
                    )
                    created_count += 1
                    if created_count % 5 == 0:
                        print(f"已創建 {created_count} 個客戶...")
            except Exception as e:
                print(f"創建客戶失敗 {data['name']}: {e}")

        # 如果沒有新創建的客戶，載入現有客戶
        if not self.customers:
            self.cursor.execute(
                "SELECT id, first_name, last_name, email FROM customers_customer LIMIT 20"
            )
            for row in self.cursor.fetchall():
                self.customers.append(
                    {"id": row[0], "name": f"{row[1]}{row[2]}", "email": row[3]}
                )

        print(f"✅ 客戶資料準備完成，共 {len(self.customers)} 個客戶")

    def create_knowledge_categories(self) -> None:
        """創建知識庫分類"""
        print("📚 創建知識庫分類...")

        categories_data = [
            {"name": "產品使用", "description": "產品操作和使用相關問題"},
            {"name": "帳戶設定", "description": "用戶帳戶和設定相關問題"},
            {"name": "付款計費", "description": "付款方式和計費相關問題"},
            {"name": "技術支援", "description": "技術問題和故障排除"},
            {"name": "政策條款", "description": "服務條款和政策說明"},
            {"name": "訂單物流", "description": "訂單處理和物流配送"},
            {"name": "會員權益", "description": "會員等級和權益說明"},
            {"name": "系統操作", "description": "系統功能和操作指南"},
        ]

        for i, cat_data in enumerate(categories_data):
            try:
                # 先檢查是否已存在
                self.cursor.execute(
                    "SELECT id FROM customer_service_knowledgebasecategory WHERE name = %s",
                    (cat_data["name"],),
                )
                existing = self.cursor.fetchone()

                if existing:
                    category_id = existing[0]
                    self.categories.append(
                        {"id": category_id, "name": cat_data["name"]}
                    )
                    print(f"知識庫分類已存在: {cat_data['name']}")
                else:
                    # 插入新分類
                    self.cursor.execute(
                        """INSERT INTO customer_service_knowledgebasecategory
                        (name, description, sort_order, is_active, created_at)
                        VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                        (
                            cat_data["name"],
                            cat_data["description"],
                            i * 10,
                            True,
                            datetime.now(),
                        ),
                    )
                    category_id = self.cursor.fetchone()[0]
                    self.categories.append(
                        {"id": category_id, "name": cat_data["name"]}
                    )
                    print(f"創建知識庫分類: {cat_data['name']}")
            except Exception as e:
                print(f"創建分類失敗 {cat_data['name']}: {e}")

        # 載入現有分類
        if not self.categories:
            self.cursor.execute(
                "SELECT id, name FROM customer_service_knowledgebasecategory"
            )
            for row in self.cursor.fetchall():
                self.categories.append({"id": row[0], "name": row[1]})

        print(f"✅ 知識庫分類準備完成，共 {len(self.categories)} 個分類")

    def create_service_tickets(self, count=50) -> None:
        """創建客服工單"""
        print(f"🎫 創建 {count} 筆客服工單...")

        if not self.customers:
            print("❌ 沒有客戶資料，無法創建工單")
            return

        title_templates = [
            "無法登入帳戶",
            "付款失敗問題",
            "產品功能異常",
            "訂單狀態查詢",
            "退款申請",
            "密碼重設問題",
            "商品配送延遲",
            "帳單金額疑問",
            "會員等級問題",
            "系統操作困難",
            "產品品質問題",
            "服務態度投訴",
            "功能建議",
            "優惠券使用問題",
            "個人資料修改",
            "訂閱取消申請",
            "技術支援需求",
            "商品退換貨",
            "發票開立問題",
            "系統錯誤回報",
        ]

        description_templates = [
            "客戶反映在登入時遇到問題，輸入正確的帳號密碼後系統顯示錯誤訊息，無法正常進入會員頁面。",
            "付款過程中信用卡扣款成功但訂單狀態顯示付款失敗，客戶希望能夠確認付款狀態並處理訂單。",
            "使用產品過程中發現某項功能無法正常運作，影響正常使用體驗，希望能夠盡快修復。",
            "客戶詢問已下訂單的處理進度，希望了解預計出貨時間和配送資訊。",
            "由於商品不符合需求，客戶申請退款，並詢問退款流程和預計退款時間。",
        ]

        # 生成工單號碼的輔助函數
        def generate_ticket_number() -> str:
            today = datetime.now().strftime("%Y%m%d")
            prefix = f"CS{today}"

            # 查詢今日最後一個工單號
            self.cursor.execute(
                "SELECT ticket_number FROM customer_service_serviceticket WHERE ticket_number LIKE %s ORDER BY ticket_number DESC LIMIT 1",
                (f"{prefix}%",),
            )
            result = self.cursor.fetchone()

            if result:
                last_number = int(result[0][-4:])
                new_number = last_number + 1
            else:
                new_number = 1

            return f"{prefix}{new_number:04d}"

        insert_sql = """
        INSERT INTO customer_service_serviceticket
        (ticket_number, customer_id, title, description, category, priority, status,
         tags, assigned_to_id, created_by_id, first_response_at, resolved_at, closed_at,
         satisfaction_rating, satisfaction_comment, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        created_count = 0
        categories = [
            "general",
            "technical",
            "billing",
            "product",
            "shipping",
            "return",
            "complaint",
            "feature_request",
        ]
        priorities = ["low", "medium", "high", "urgent"]
        statuses = ["open", "in_progress", "pending", "resolved", "closed"]

        for _i in range(count):
            customer = random.choice(self.customers)
            title = random.choice(title_templates)
            description = random.choice(description_templates)

            # 隨機生成創建時間（過去30天內）
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            created_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)

            status = random.choice(statuses)
            first_response_at = None
            resolved_at = None
            closed_at = None

            if status in {"in_progress", "pending", "resolved", "closed"}:
                first_response_at = created_time + timedelta(
                    hours=random.randint(1, 24)
                )

            if status in {"resolved", "closed"}:
                resolved_at = created_time + timedelta(hours=random.randint(25, 72))

            if status == "closed":
                closed_at = created_time + timedelta(hours=random.randint(73, 96))

            tags = json.dumps(
                random.sample(
                    ["緊急", "重要", "新客戶", "老客戶", "VIP", "技術", "計費"],
                    k=random.randint(0, 3),
                )
            )
            ticket_number = generate_ticket_number()

            try:
                self.cursor.execute(
                    insert_sql + " RETURNING id",
                    (
                        ticket_number,
                        customer["id"],
                        title,
                        description,
                        random.choice(categories),
                        random.choice(priorities),
                        status,
                        tags,
                        self.admin_user_id if random.choice([True, False]) else None,
                        self.admin_user_id,
                        first_response_at,
                        resolved_at,
                        closed_at,
                        random.randint(1, 5)
                        if status in {"resolved", "closed"}
                        and random.choice([True, False])
                        else None,
                        "客戶滿意服務品質"
                        if status in {"resolved", "closed"}
                        and random.choice([True, False])
                        else "",
                        created_time,
                        created_time,
                    ),
                )

                ticket_id = self.cursor.fetchone()[0]
                created_count += 1

                # 為非開啟狀態的工單創建服務記錄
                if status != "open":
                    self.create_service_notes_for_ticket(
                        ticket_id, status, created_time
                    )

                if created_count % 10 == 0:
                    print(f"已創建 {created_count} 筆工單...")

            except Exception as e:
                print(f"創建工單失敗: {e}")

        print(f"✅ 成功創建 {created_count} 筆客服工單")

    def create_service_notes_for_ticket(self, ticket_id, status, created_time) -> None:
        """為工單創建服務記錄"""
        note_contents = [
            "已收到客戶反映，正在調查問題原因。",
            "問題已確認，正在聯繫相關部門處理。",
            "已提供解決方案給客戶，等待客戶確認。",
            "客戶確認問題已解決，案件結案。",
            "已電話聯繫客戶確認問題詳情。",
        ]

        # 根據狀態決定記錄數量
        if status in {"in_progress", "pending"}:
            num_notes = random.randint(1, 3)
        else:  # resolved, closed
            num_notes = random.randint(2, 5)

        insert_sql = """
        INSERT INTO customer_service_servicenote
        (ticket_id, content, note_type, is_visible_to_customer, attachments, created_by_id, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        note_types = ["internal", "customer", "system", "resolution"]

        for _i in range(num_notes):
            hours_after = random.randint(1, 72)
            note_time = created_time + timedelta(hours=hours_after)

            try:
                self.cursor.execute(
                    insert_sql,
                    (
                        ticket_id,
                        random.choice(note_contents),
                        random.choice(note_types),
                        random.choice([True, False]),
                        json.dumps([]),  # attachments - 空的附件列表
                        self.admin_user_id,
                        note_time,
                    ),
                )
            except Exception as e:
                print(f"創建服務記錄失敗: {e}")

    def create_knowledge_base_articles(self, count=50) -> None:
        """創建知識庫文章"""
        print(f"📖 創建 {count} 篇知識庫文章...")

        articles_data = [
            {
                "title": "如何重設密碼",
                "summary": "詳細說明密碼重設的步驟和注意事項",
                "content_type": "guide",
            },
            {
                "title": "會員等級說明",
                "summary": "介紹不同會員等級的權益和升級條件",
                "content_type": "policy",
            },
            {
                "title": "付款方式設定",
                "summary": "支援的付款方式和設定流程",
                "content_type": "guide",
            },
            {
                "title": "訂單狀態查詢",
                "summary": "如何查詢和追蹤訂單處理進度",
                "content_type": "guide",
            },
            {
                "title": "退換貨政策",
                "summary": "退換貨的條件、流程和相關規定",
                "content_type": "policy",
            },
        ]

        additional_titles = [
            "購物車使用技巧",
            "商品搜尋功能",
            "個人資料管理",
            "通知設定調整",
            "手機版操作指南",
            "桌面版功能介紹",
            "新手入門教學",
            "進階功能使用",
            "常見錯誤處理",
            "網路連線問題",
            "瀏覽器相容性",
            "APP安裝指南",
        ]

        insert_sql = """
        INSERT INTO customer_service_knowledgebase
        (title, content, summary, category_id, content_type, tags, is_public, is_featured,
         is_active, view_count, helpful_count, not_helpful_count, created_by_id, updated_by_id,
         created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        content_types = ["faq", "guide", "policy", "troubleshooting", "sop"]
        created_count = 0

        for i in range(count):
            if i < len(articles_data):
                data = articles_data[i]
                title = data["title"]
                summary = data["summary"]
                content_type = data["content_type"]
            else:
                title = random.choice(
                    [*additional_titles, f"技術文檔 #{i - len(articles_data) + 1}"]
                )
                summary = f"關於 {title} 的詳細說明和操作指南"
                content_type = random.choice(content_types)

            content = f"""# {title}

## 概述
{summary}

## 詳細說明
本文將詳細介紹 {title} 的相關內容，包括操作步驟、注意事項和常見問題解答。

### 主要功能
- 功能特點一：提供便捷的操作介面
- 功能特點二：支援多種使用場景
- 功能特點三：具有完善的安全機制

### 操作步驟
1. 首先進入相關頁面
2. 填寫必要的資訊
3. 確認設定無誤
4. 提交並完成操作

### 注意事項
- 請確保網路連線穩定
- 建議使用最新版本的瀏覽器
- 如遇問題請及時聯繫客服

---
*最後更新時間：{datetime.now().strftime("%Y-%m-%d")}*
"""

            tags = json.dumps(
                random.sample(
                    ["教學", "指南", "政策", "技術", "新手", "進階"],
                    k=random.randint(1, 4),
                )
            )
            category_id = (
                random.choice(self.categories)["id"] if self.categories else None
            )
            now = datetime.now()

            try:
                self.cursor.execute(
                    insert_sql,
                    (
                        title,
                        content,
                        summary,
                        category_id,
                        content_type,
                        tags,
                        True,
                        random.choice([True, False, False, False]),  # 25% 精選
                        True,
                        random.randint(0, 1000),
                        random.randint(0, 100),
                        random.randint(0, 20),
                        self.admin_user_id,
                        self.admin_user_id,
                        now,
                        now,
                    ),
                )
                created_count += 1
                if created_count % 10 == 0:
                    print(f"已創建 {created_count} 篇文章...")
            except Exception as e:
                print(f"創建知識庫文章失敗: {e}")

        print(f"✅ 成功創建 {created_count} 篇知識庫文章")

    def create_faq_entries(self, count=50) -> None:
        """創建常見問題"""
        print(f"❓ 創建 {count} 個常見問題...")

        faq_data = [
            {
                "question": "如何註冊新帳戶？",
                "answer": "點擊頁面右上角的「註冊」按鈕，填寫電子郵件、設定密碼，然後點擊確認即可完成註冊。",
            },
            {
                "question": "忘記密碼怎麼辦？",
                "answer": "在登入頁面點擊「忘記密碼」，輸入註冊時的電子郵件，系統會發送重設密碼的連結到您的信箱。",
            },
            {
                "question": "如何修改個人資料？",
                "answer": "登入後進入「會員中心」→「個人資料」，即可修改姓名、電話、地址等資訊。",
            },
            {
                "question": "支援哪些付款方式？",
                "answer": "我們支援信用卡、LINE Pay、Apple Pay、Google Pay、ATM轉帳和貨到付款等多種付款方式。",
            },
            {
                "question": "如何查詢訂單狀態？",
                "answer": "登入會員後進入「訂單管理」，即可查看所有訂單的詳細狀態和物流資訊。",
            },
        ]

        additional_questions = [
            (
                "客服服務時間？",
                "客服服務時間為週一至週五 09:00-18:00，週六 09:00-12:00，週日及國定假日休息。",
            ),
            (
                "如何聯繫客服？",
                "可透過線上客服、客服電話 02-1234-5678 或電子郵件 service@example.com 聯繫我們。",
            ),
            (
                "商品有保固嗎？",
                "大部分商品都有製造商提供的保固服務，詳細保固條款請參考商品頁面說明。",
            ),
            (
                "可以取消訂單嗎？",
                "訂單在「待出貨」狀態下可以取消。已出貨的訂單請改走退貨流程。",
            ),
        ]

        all_questions = faq_data + [
            {"question": q, "answer": a} for q, a in additional_questions
        ]

        insert_sql = """
        INSERT INTO customer_service_faq
        (question, answer, category_id, is_active, is_featured, sort_order, view_count,
         created_by_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        created_count = 0

        for i in range(count):
            if i < len(all_questions):
                question_data = all_questions[i]
                question = question_data["question"]
                answer = question_data["answer"]
            else:
                question = f"關於{random.choice(['商品', '服務', '帳戶', '付款', '配送'])}的常見問題 #{i - len(all_questions) + 1}"
                answer = f"這是關於「{question}」的詳細回答。如需更多協助，請聯繫我們的客服團隊。"

            category_id = (
                random.choice(self.categories)["id"] if self.categories else None
            )
            now = datetime.now()

            try:
                self.cursor.execute(
                    insert_sql,
                    (
                        question,
                        answer,
                        category_id,
                        True,
                        random.choice([True, False, False, False]),  # 25% 置頂
                        i * 10,
                        random.randint(0, 500),
                        self.admin_user_id,
                        now,
                        now,
                    ),
                )
                created_count += 1
                if created_count % 10 == 0:
                    print(f"已創建 {created_count} 個FAQ...")
            except Exception as e:
                print(f"創建FAQ失敗: {e}")

        print(f"✅ 成功創建 {created_count} 個常見問題")

    def run(self) -> None:
        """執行資料生成"""
        print("🚀 開始生成客服系統測試資料...")
        print("🎯 用於測試 Ollama 和 LINE Messaging API")
        print("=" * 50)

        if not self.connect_database():
            return

        try:
            # 確保有管理員用戶
            self.get_or_create_admin_user()

            # 創建測試客戶
            self.create_test_customers()

            # 創建知識庫分類
            self.create_knowledge_categories()

            # 創建客服工單 (50筆)
            self.create_service_tickets(50)

            # 創建知識庫文章 (50篇)
            self.create_knowledge_base_articles(50)

            # 創建常見問題 (50個)
            self.create_faq_entries(50)

            # 提交所有變更
            self.connection.commit()

            print("=" * 50)
            print("✅ 所有測試資料創建完成！")
            print("📊 統計資料：")

            # 統計實際數據
            self.cursor.execute("SELECT COUNT(*) FROM customers_customer")
            customer_count = self.cursor.fetchone()[0]

            self.cursor.execute("SELECT COUNT(*) FROM customer_service_serviceticket")
            ticket_count = self.cursor.fetchone()[0]

            self.cursor.execute("SELECT COUNT(*) FROM customer_service_servicenote")
            note_count = self.cursor.fetchone()[0]

            self.cursor.execute("SELECT COUNT(*) FROM customer_service_knowledgebase")
            kb_count = self.cursor.fetchone()[0]

            self.cursor.execute(
                "SELECT COUNT(*) FROM customer_service_knowledgebasecategory"
            )
            cat_count = self.cursor.fetchone()[0]

            self.cursor.execute("SELECT COUNT(*) FROM customer_service_faq")
            faq_count = self.cursor.fetchone()[0]

            print(f"   - 客戶：{customer_count} 個")
            print(f"   - 客服工單：{ticket_count} 筆")
            print(f"   - 服務記錄：{note_count} 筆")
            print(f"   - 知識庫文章：{kb_count} 篇")
            print(f"   - 知識庫分類：{cat_count} 個")
            print(f"   - 常見問題：{faq_count} 個")
            print("🤖 資料已就緒，可開始測試 Ollama 和 LINE Bot！")
            print("=" * 50)

        except Exception as e:
            print(f"❌ 資料生成過程發生錯誤: {e}")
            self.connection.rollback()
        finally:
            self.close_database()


if __name__ == "__main__":
    generator = CustomerServiceDataGenerator()
    generator.run()
