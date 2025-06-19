# BestCRM - 現代化客戶關係管理系統

<div align="center">

![BestCRM Logo](https://img.shields.io/badge/BestCRM-v1.0-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-4.2.7-green?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)

**使用 Django REST Framework 和 React TypeScript 建構的現代化全端客戶關係管理系統**

[🚀 示範](#示範) • [📖 文件](#文件) • [⚡ 快速開始](#快速開始) • [🛠️ 功能特色](#功能特色) • [🤝 貢獻](#貢獻)

</div>

---

## 🌟 專案概述

BestCRM 是一個為現代企業設計的綜合性客戶關係管理系統。採用強大的 Django REST API 後端與直觀的 React TypeScript 前端建構，提供您管理客戶關係、追蹤銷售業績以及分析業務表現所需的一切工具。

### ✨ 核心亮點

- **🔐 安全驗證** - 基於 JWT 的身份驗證，具備自動令牌刷新功能
- **📱 響應式設計** - 使用 TailwindCSS 建構的美觀行動優先介面
- **⚡ 即時資料** - 即時更新與無縫資料同步
- **🔍 進階搜尋** - 跨模組的強大篩選與搜尋功能
- **📊 分析就緒** - 為商業智慧準備的綜合資料結構
- **🌐 API 優先** - RESTful API 設計，便於整合與擴展

---

## 🖼️ 系統截圖

### 登入頁面
![Login Page](./images/login_page.png)
*安全的身份驗證系統，提供示範帳號便於測試*

### 會員資料管理
![Customers Page](./images/customers_page.png)
*全面的客戶資料庫，具備進階篩選與搜尋功能*

### 訂單管理
![Orders Page](./images/orders_page.png)
*完整的訂單生命週期管理與狀態追蹤*

### 交易記錄
![Transactions Page](./images/transactions_page.png)
*財務交易追蹤，包含付款方式詳細資訊*

### 搜尋與篩選
![Search Results](./images/search_result.png)
*跨所有資料類型的強大搜尋功能*

---

## 🛠️ 技術架構

### 後端
- **框架**: Django 4.2.7 + Django REST Framework
- **身份驗證**: JWT (Simple JWT)
- **資料庫**: MySQL / SQLite (可配置)
- **API 文件**: DRF 自動產生
- **安全性**: CORS 標頭、環境變數配置

### 前端
- **框架**: React 18 with TypeScript
- **樣式設計**: TailwindCSS 3
- **路由管理**: React Router 6
- **HTTP 客戶端**: Axios with interceptors
- **建置工具**: Vite
- **狀態管理**: React Hooks

### 開發工具
- **環境管理**: Python 虛擬環境
- **套件管理**: pip (Python), npm (Node.js)
- **程式碼品質**: ESLint, TypeScript 嚴格模式
- **版本控制**: Git 與完整的 .gitignore

---

## 🚀 快速開始

### 系統需求
- **Python** 3.8+ 
- **Node.js** 16+
- **MySQL** (選用，內建 SQLite)
- **Git**

### 1. 複製專案與設定
```bash
# 複製儲存庫
git clone https://github.com/yourusername/react-ts-crm.git
cd react-ts-crm

# 設定環境變數
cp .env.example .env
# 編輯 .env 檔案，填入您的資料庫設定
```

### 2. 後端設定
```bash
# 建立並啟動虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝相依套件
pip install -r requirements.txt

# 執行資料庫遷移
python manage.py migrate

# 建立超級使用者
python manage.py createsuperuser

# 建立範例資料 (選用)
python simple_dummy_data.py

# 啟動 Django 伺服器
python manage.py runserver
```

### 3. 前端設定
```bash
# 進入前端目錄
cd frontend

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev
```

### 4. 存取應用程式
- **前端介面**: http://localhost:5173
- **後端 API**: http://localhost:8000
- **管理後台**: http://localhost:8000/admin
- **示範登入**: `young` / `young0921`

---

## 🎯 功能特色

### 👥 會員資料管理
- **完整客戶檔案** - 姓名、聯絡資訊、公司詳情、地址資料
- **來源追蹤** - 監控客戶獲取管道
- **標籤系統** - 靈活的自訂標籤分類
- **活動歷史** - 完整的客戶互動稽核軌跡
- **智慧搜尋** - 即時搜尋任何欄位資料

### 📦 訂單管理
- **訂單生命週期** - 從建立到交付的完整追蹤
- **多項目訂單** - 支援複雜的多商品訂單
- **狀態管理** - 待處理、處理中、已出貨、已送達、已取消
- **財務計算** - 自動計算稅額、運費和折扣
- **地址管理** - 分離的帳單與送貨地址

### 💳 交易記錄追蹤
- **付款方式** - 支援信用卡、PayPal、Stripe、銀行轉帳
- **交易類型** - 銷售、退款、付款、退單
- **手續費計算** - 自動計算付款處理手續費
- **閘道整合** - 為付款閘道整合做好準備
- **財務報表** - 完整的交易歷史與分析

### 🔍 進階功能
- **全域搜尋** - 跨客戶、訂單、交易的搜尋功能
- **進階篩選** - 多重篩選條件與即時更新
- **分頁處理** - 高效處理大型資料集
- **響應式設計** - 在桌機、平板、手機上的完美體驗
- **資料匯出** - 為報表與分析整合做好準備

---

## 📖 API 文件

### 身份驗證端點
```
POST /api/auth/login/          # 使用帳號密碼登入
POST /api/auth/refresh/        # 刷新 JWT 令牌
```

### 客戶管理端點
```
GET    /api/customers/         # 列出客戶 (含分頁)
POST   /api/customers/         # 建立新客戶
GET    /api/customers/{id}/    # 取得客戶詳情
PUT    /api/customers/{id}/    # 更新客戶資料
DELETE /api/customers/{id}/    # 刪除客戶
GET    /api/customers/{id}/orders/       # 取得客戶訂單
GET    /api/customers/{id}/transactions/ # 取得客戶交易記錄
```

### 訂單管理端點
```
GET    /api/orders/            # 列出訂單 (含分頁)
POST   /api/orders/            # 建立新訂單
GET    /api/orders/{id}/       # 取得訂單詳情
PUT    /api/orders/{id}/       # 更新訂單
DELETE /api/orders/{id}/       # 刪除訂單
```

### 交易記錄端點
```
GET    /api/transactions/      # 列出交易記錄 (含分頁)
POST   /api/transactions/      # 建立新交易記錄
GET    /api/transactions/{id}/ # 取得交易詳情
PUT    /api/transactions/{id}/ # 更新交易記錄
DELETE /api/transactions/{id}/ # 刪除交易記錄
```

### 查詢參數
所有列表端點都支援：
- **search**: `?search=關鍵字` - 跨相關欄位搜尋
- **filtering**: `?status=active&source=website` - 依欄位值篩選
- **ordering**: `?ordering=-created_at` - 排序結果
- **pagination**: `?page=2&page_size=20` - 分頁處理

---

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database Configuration (MySQL)
DB_ENGINE=django.db.backends.mysql
DB_NAME=crm_dashboard
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=3306

# For SQLite (alternative)
# DB_ENGINE=django.db.backends.sqlite3
# DB_NAME=db.sqlite3
```

### Frontend Configuration
The frontend automatically connects to the Django API. Update `src/services/api.ts` if you need to change the API base URL.

---

## 🚀 Deployment

### Production Setup
1. **Environment**: Set `DEBUG=False` in production
2. **Database**: Use PostgreSQL or MySQL for production
3. **Static Files**: Configure proper static file serving
4. **Security**: Update `ALLOWED_HOSTS` and other security settings
5. **HTTPS**: Enable SSL/TLS for secure communication

### Docker Support (Coming Soon)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🧪 Testing

### Backend Tests
```bash
# Run Django tests
python manage.py test

# Run with coverage
coverage run manage.py test
coverage report
```

### Frontend Tests
```bash
# Run React tests
cd frontend
npm test

# Run with coverage
npm run test:coverage
```

---

## 📊 Database Schema

### Core Models
- **Customer**: Personal info, contact details, source tracking
- **Order**: Order management with items and financial calculations
- **OrderItem**: Individual products within orders
- **Transaction**: Payment tracking and financial records

### Relationships
- Customer → Orders (One-to-Many)
- Customer → Transactions (One-to-Many)
- Order → OrderItems (One-to-Many)
- Order → Transactions (One-to-Many)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-documented

---

## 📋 Roadmap

### Upcoming Features
- [ ] **Dashboard Analytics** - Charts and KPI widgets
- [ ] **Email Integration** - Automated email campaigns
- [ ] **Advanced Reporting** - Custom report builder
- [ ] **Mobile App** - React Native companion app
- [ ] **API Rate Limiting** - Enhanced security and performance
- [ ] **Bulk Operations** - Mass data import/export
- [ ] **Role-based Access** - Advanced permission system
- [ ] **Webhook Support** - Third-party integrations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Django REST Framework** - Powerful API framework
- **React Team** - Amazing frontend library
- **TailwindCSS** - Beautiful utility-first CSS framework
- **Vite** - Lightning-fast build tool
- **Claude Code** - AI-assisted development

---

## 📞 Support

- **Documentation**: [Full Documentation](./INSTALLATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/react-ts-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/react-ts-crm/discussions)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Young](https://github.com/youngOman)

</div>