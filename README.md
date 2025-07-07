# MiniCRM Pro - 輕量型、全方位 AI CRM 系統

<div align="center">
  <img src="./images/MiniCRM.png" style="margin-bottom: 12px;" />
  <br/>
  <img src="https://img.shields.io/badge/Django-4.2.7-green?style=for-the-badge&logo=django"/>
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss"/>
</div>

---

## 專案概述

MiniCRM Pro 是個輕量型、免費開源、專為中小型企業、剛起步的創業家、小型電商所設計的高效率 CRM 系統，不需要複雜的設定或昂貴的授權費用或是繁雜的導入流程，沒有多餘無用的功能，只保留了 CRM 最核心的功能，就是來協助您用最一目了然的方式打造最智慧的客戶經營流程，管理客戶關係追蹤銷售業績以及分析業務表現，並讓您的品牌可以進行後續的精準再行銷及提升顧客忠誠度及回流率。讓您瞭解公司是否朝正確方向邁進，或是否有不足之處。 清楚知道自己的客戶獲取成本 (CAC)

具備簡潔的資料管理，營運儀表版、視覺化報表如營收趨勢、客戶增長趨勢、客戶來源分佈、付款方式分佈、客戶等級分佈、今日(新增客戶量、新增訂單、完成交易數)、本月、客戶指標(平均客戶價值、待處理訂單、轉換率) 等..

並且也支援一次多個自有品牌管理，以及供應商管理，並且可以針對不同品牌或供應商進行獨立的客戶資料、訂單、交易記錄..等

- 開發中：成交率、追加銷售率、新淨收入、銷售週期長短與客戶生命週期價值 (CLV) 計算、 AI 智慧摘要(開發中)

## 核心功能模組

### 1. 營銷分析儀表板

- **營收趨勢圖表**：顯示營收增長曲線與趨勢分析
- **客戶成長趨勢**：客戶數量增長軌跡追蹤
- **訂單成長分析**：訂單數量與金額成長統計
- **關鍵指標卡片**：
  - 今日數據：新增客戶數、新增訂單數、完成交易數
  - 月度統計：客戶指標、平均客戶價值
  - 營運指標：待處理訂單、轉換率計算

### 2.客戶管理及分析頁面

- **客戶總覽**：快速掌握客戶基本統計與導航中心
- **客戶人口分析**：年齡、性別分布與消費行為深度分析
- **客戶行為分析**：產品偏好、季節性購買模式分析
- **客戶分群分析**：來源渠道、等級分布與細分策略
- **批次資料匯入**：
  - 支援 CSV / Excel 檔案格式
  - 彈性欄位對應，可選擇忽略不必要欄位
  - 不完整資料亦可導入，具備容錯機制

_所有分析頁面皆支援篩選功能：日期範圍、客戶來源、年齡、性別_

### 3. 訂單管理系統

- **快速搜尋**：依訂單編號、客戶名稱、聯絡方式進行搜尋
- **狀態篩選**：待處理、處理中、已出貨、已送達、已取消、已退款
- **訂單詳情**：完整訂單資訊與項目管理
- **批次操作**：支援多筆訂單狀態更新

### 4. 產品管理系統

- **完整產品生態**：
  - 產品分類、品牌管理、供應商資料
  - SKU 編碼、價格設定、成本控制
- **庫存追蹤**：
  - 實時庫存監控、異動記錄追蹤
  - 低庫存警示、缺貨提醒系統
  - 多倉庫位置管理
- **價格管理**：歷史價格追蹤、變動記錄
- **變體支援**：產品規格管理（顏色、尺寸等）

### 5. 交易記錄系統

- **快速搜尋**：依交易編號、客戶名稱進行查找
- **多重篩選**：
  - 交易狀態：待處理、已完成、失敗、已取消、已退款
  - 交易類型：銷售、退款、付款、退單
- **付款方式分析**：支援多種付款方式統計
- **交易報表**：完整的財務流水與分析

## 核心功能

### 進階搜尋與即時篩選

- 多條件篩選與即時模糊搜尋功能
- 可跨欄位比對，快速定位目標客戶或交易紀錄

- 新增快速搜尋篩選功能
  - 客戶管理，可依 客戶名稱、聯絡方式(Email、電話)、公司、來源 進行搜尋
  - 訂單管理，可依 訂單編號、客戶名稱、聯絡方式、訂、狀態 進行搜尋
    - 下拉選單可依
      - 訂單狀態(待處理、處理中、已出貨、已送達、已取消、已退款)篩選
  - 交易記錄，可依 交易編號、客戶名稱搜尋
    - 下拉選單可依
      - 交易狀態(待處理、已完成、失敗、已取消、已退款)篩選，
      - 類型（銷售、退款、付款、退單）篩選

### 即時報表生成

- 一鍵生成關鍵指標圖表（客戶數、成交金額、轉換率等）
- 可依區間、來源、標籤等條件切換統計維度
- 清晰呈現營運概況與銷售表現

### AI 應用擴充性 - 開發中

- 系統預留 AI 模組接口，支援導入：
  - 客戶價值分析與自動分群
  - 聯絡紀錄摘要與後續建議
  - 流失預警、銷售機會預測
  - 自動標籤推薦與話術輔助生成

---

## 系統頁面截圖

### 登入頁面

![Login Page](./images/login_page.png)

### 客戶資料管理

- 可手動新增、編輯客戶資料，可編輯 姓名、Email、電話、地址、公司、年齡、性別、購買季節偏好、購買產品類別偏好、備註...等欄位
- 也可直接在該客戶詳情頁面直接查詢：該客戶的歷史訂單與交易記錄、總消費金額、活躍度..等

![Customers Page](./images/customer.png)

### 匯入多筆客戶資料流程

- 支援手動新增或批次匯入（CSV / Excel）
- 多欄位對應設計，可選擇忽略不必要欄位
- 匯入具容錯能力，即使缺少總消費額、年齡、地址..等欄位也可成功導入，可後續補齊資料，預設顯示「未提供」

![Customers Import](./images/customer_import.png)

### 訂單管理

可手動新增訂單，也可直接在該訂單內連結到擁有此訂單的客戶，也可新增多項產品，並即時計算稅額、運費、折扣、總金額

![Orders Page](./images/order_all.png)

### 交易記錄

- 可依照 交易狀態、交易類型 下拉選單快速篩選交易記錄，並可直接在該交易記錄內連結到該筆訂單
- 可手動新增交易記錄，編輯 交易類型、付款方式、付款狀態、金流串接資訊、金流回應、處理時間

![Transactions Page](./images/transaction_all.png)

### 搜尋與篩選資料

- 客戶管理系統

<!-- ![Search Results](./images/customer_search.png) -->

- 訂單管理系統：搜尋 Joseph 開頭，訂單狀態為處理中的搜尋結果

![Search Results](./images/order_search.png)

### 營銷分析儀表板

![dashboard](./images/dashboard.png)

### 客戶分析儀表板

#### 客戶總覽頁面

<!-- ![Customer Overview](./images/customer_overview.png) -->

#### 客戶人口分析

<!-- ![Customer Demographics](./images/customer_demographics.png) -->

#### 客戶行為分析

<!-- ![Customer Behavior](./images/customer_behavior.png) -->

#### 客戶分群分析

<!-- ![Customer Segmentation](./images/customer_segmentation.png) -->

### 產品管理系統

<!-- ![Product Management](./images/product_management.png) -->

---

## 🛠️ Tech Stack

### 後端

- **框架**: Django 4.2.7 + Django REST Framework
- **身份驗證**: JWT (Simple JWT)
- **資料庫**: MySQL (可配置)
- **API 文件**: DRF 自動產生
- **安全性**: CORS 標頭、環境變數配置

### 前端

- **框架**: React 19 with TS
- **樣式設計**: TailwindCSS 4
- **路由管理**: React Router 6
- **HTTP 客戶端**: Axios with interceptors
- **建置工具**: Vite
- **狀態管理**: React Hooks

### 開發工具

- **環境管理**: Python venv
- **套件管理**: pip (Python), npm (Node.js)
- **程式碼品質**: ESLint, TypeScript
- **版本控制**: Git 與 .gitignore

---

## 🚀 快速開始

### 系統需求

- **Python** 3.8+
- **Node.js** 16+
- **MySQL** 5.7+ (或 SQLite 作為替代)
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
- **示範登入**: `test_young` / `young0921`

---

## 📋 詳細功能介紹

### 客戶分析儀表板 (Customer Analytics)

**🏠 客戶總覽 (`/customer-overview`)**

- 6 大關鍵指標卡片：總客戶數、資料完整度、平均年齡等
- 快速導航卡片，一鍵跳轉到專門分析頁面
- 統一的篩選器：日期範圍、客戶來源、年齡、性別

**👥 客戶人口分析 (`/customer-demographics`)**

- 年齡分析：年齡分布圖表、年齡群組消費行為分析
- 性別分析：性別分布、消費金額對比、購買行為差異
- 互動式圖表，支援數據深度探索

**🛒 客戶行為分析 (`/customer-behavior`)**

- 產品偏好分析：熱門產品類別、營收貢獻度分析
- 季節性分析：季節購買模式、表現趨勢對比
- 策略建議卡片：針對分析結果提供行銷建議

**🎯 客戶分群分析 (`/customer-segmentation`)**

- 客戶來源分析：各渠道獲客效果對比
- 客戶等級分析：白金/黃金/白銀/一般客戶分布
- 客戶細分矩陣：年齡 vs 消費金額散點圖分析
- 精準行銷策略建議

### 產品管理系統 (Product Management)

**📦 完整產品生態管理**

- **產品分類**: 多層級分類管理，支援 URL 友好的 slug
- **品牌管理**: 品牌資訊、Logo、官網連結管理
- **供應商管理**: 供應商資料、聯絡人、信用額度管理
- **產品主檔**: SKU、描述、價格、分類、品牌、供應商關聯

**📊 庫存與異動追蹤**

- **實時庫存**: 現有庫存、預留庫存、可用庫存計算
- **庫存警示**: 低庫存、缺貨警示系統
- **異動記錄**: 入庫、出庫、調整、盤點等所有異動追蹤
- **多倉管理**: 支援多個倉庫位置管理

**💰 價格與變體管理**

- **價格歷史**: 完整的價格變動記錄與追蹤
- **產品變體**: 顏色、尺寸等不同規格管理
- **成本管控**: 成本價格與售價管理，利潤率計算

### 營銷分析儀表板 (Marketing Dashboard)

**📈 關鍵營運指標**

- 營收趨勢圖表、客戶成長曲線、訂單增長分析
- 轉換率計算、客戶獲取成本 (CAC) 追蹤
- 多維度 KPI 卡片：今日、本月、總計數據

**💳 交易與付款分析**

- 付款方式分布圓餅圖
- 交易狀態統計
- 營收來源分析

## 🎯 功能特色

### 👥 會員資料管理

- **完整客戶檔案** - 姓名、聯絡資訊、公司詳情、地址資料
- **來源追蹤** - 監控客戶獲取管道
- **標籤系統** - 靈活的自訂標籤分類
- **活動歷史** - 完整客戶互動稽核軌跡
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

### 📦 產品管理系統

- **產品分類** - 單層分類系統，支持彈性產品歸類
- **品牌管理** - 完整的品牌資訊、Logo、官網管理
- **供應商管理** - 供應商聯絡資訊、付款條件、信用額度
- **產品資訊** - SKU、價格、成本、重量、尺寸、圖片
- **產品變體** - 支援顏色、尺寸等不同規格變化
- **庫存管理** - 實時庫存追蹤、低庫存警示、再訂購點設定
- **價格歷史** - 完整的價格變動記錄與分析
- **庫存異動** - 詳細的入庫、出庫、調整、盤點記錄

### 📊 智慧分析儀表板

- **營銷分析** - 營收趨勢、客戶成長、訂單成長、付款方式分析
- **客戶分析** - 年齡分布、性別分析、產品偏好、季節性行為
- **客戶分層** - 白金/黃金/白銀/一般/潛在客戶自動分級
- **數據完整度** - 客戶資料完整性監控與提升建議
- **實時篩選** - 多維度日期、來源、屬性篩選功能

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

### 產品管理端點

```
GET    /api/products/categories/        # 列出產品分類
POST   /api/products/categories/        # 建立新分類
GET    /api/products/brands/            # 列出品牌
POST   /api/products/brands/            # 建立新品牌
GET    /api/products/suppliers/         # 列出供應商
POST   /api/products/suppliers/         # 建立新供應商
GET    /api/products/                   # 列出產品 (含分頁)
POST   /api/products/                   # 建立新產品
GET    /api/products/{id}/              # 取得產品詳情
PUT    /api/products/{id}/              # 更新產品
DELETE /api/products/{id}/              # 刪除產品
GET    /api/products/{id}/variants/     # 取得產品變體
POST   /api/products/{id}/variants/     # 建立產品變體
GET    /api/products/{id}/inventory/    # 取得庫存資訊
PUT    /api/products/{id}/inventory/    # 更新庫存
GET    /api/products/{id}/stock-movements/ # 取得庫存異動記錄
```

### 分析報表端點

```
GET    /api/reports/dashboard/              # 營銷分析儀表板數據
GET    /api/reports/trends/                 # 趨勢分析數據
GET    /api/reports/customer-analytics/     # 客戶分析數據
GET    /api/reports/customer-demographics/  # 客戶人口統計分析
GET    /api/reports/revenue-analytics/      # 營收分析數據
```

### 查詢參數

所有列表端點都支援：

- **search**: `?search=關鍵字` - 跨相關欄位搜尋
- **filtering**: `?status=active&source=website` - 依欄位值篩選
- **ordering**: `?ordering=-created_at` - 排序結果
- **pagination**: `?page=2&page_size=20` - 分頁處理

---

## ⚙️ 環境設定

### 環境變數

在根目錄建立 `.env` 檔案：

```bash
# Django 設定
DEBUG=True
SECRET_KEY=your-secret-key-here

# 資料庫設定 (MySQL)
DB_ENGINE=django.db.backends.mysql
DB_NAME=crm_dashboard
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=3306

# SQLite 替代方案
# DB_ENGINE=django.db.backends.sqlite3
# DB_NAME=db.sqlite3
```

### 前端設定

前端會自動連接到 Django API。如需更改 API 基礎網址，請更新 `src/services/api.ts`。

---

## 🚀 部署

### 正式環境設定

1. **環境變數**: 在正式環境中設定 `DEBUG=False`
2. **資料庫**: 正式環境建議使用 PostgreSQL 或 MySQL
3. **靜態檔案**: 設定適當的靜態檔案服務
4. **安全性**: 更新 `ALLOWED_HOSTS` 及其他安全設定
5. **HTTPS**: 啟用 SSL/TLS 安全通訊

### Docker 支援 (即將推出)

```bash
# 使用 Docker Compose 建置並執行
docker-compose up --build
```

---

## 🧪 測試

### 後端測試

```bash
# 執行 Django 測試
python manage.py test

# 執行覆蓋率測試
coverage run manage.py test
coverage report
```

### 前端測試

```bash
# 執行 React 測試
cd frontend
npm test

# 執行覆蓋率測試
npm run test:coverage
```

---

## 📊 資料庫架構

### 核心模型

- **Customer**: 個人資訊、聯絡詳情、來源追蹤、個人化偏好
- **Order**: 訂單管理，包含項目與財務計算
- **OrderItem**: 訂單內的個別商品，關聯產品與變體
- **Transaction**: 付款追蹤與財務記錄
- **Product**: 產品主體資訊、價格、成本、庫存
- **ProductVariant**: 產品變體（顏色、尺寸等規格）
- **Category**: 產品分類管理
- **Brand**: 品牌資訊管理
- **Supplier**: 供應商資訊與關係管理
- **Inventory**: 庫存管理與警示
- **StockMovement**: 庫存異動記錄
- **PriceHistory**: 價格變動歷史

### 關聯關係

#### 客戶與訂單

1. Customer → Order (1:M) - 客戶可以有多個訂單
2. Order → OrderItem (1:M) - 訂單可以包含多個商品項目
3. Customer → Transaction (1:M) - 客戶可以有多筆交易記錄
4. Order → Transaction (1:M, Optional) - 訂單可以關聯多筆交易

#### 產品管理

5. Category → Product (1:M) - 分類包含多個產品
6. Brand → Product (1:M) - 品牌擁有多個產品
7. Supplier → Product (1:M) - 供應商供應多個產品
8. Product → ProductVariant (1:M) - 產品可有多個變體
9. Product → Inventory (1:1) - 產品對應庫存記錄
10. ProductVariant → Inventory (1:1) - 變體對應庫存記錄
11. Product → StockMovement (1:M) - 產品的庫存異動記錄
12. Product → PriceHistory (1:M) - 產品的價格變動歷史

#### 訂單與產品整合

13. OrderItem → Product (M:1) - 訂單項目關聯產品
14. OrderItem → ProductVariant (M:1, Optional) - 訂單項目可關聯產品變體

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Young](https://github.com/youngOman)

</div>
