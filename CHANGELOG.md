# CHANGELOG

## 待辦

1. 客戶生命週期價值 (CLV) 計算
2. PDF 報表匯出
3. 即時數據更新：WebSocket 即時推送
4. 匯出資料、匯出報表
5. 季節性行銷：根據購買模式安排促銷活動
6. 產品推薦：根據產品類別的精準推薦
7. 產品管理系統
8. 銷售管理 (Sales Management)
9. 行銷管理 (Marketing Management)

- 客戶管理新增依 總消費額 ASC、DESC 排序 下拉選單
- 訂單管理新增依 日期 ASC、DESC 排序 下拉選單

- 前端列表顯示英文而非中文問題

## 待處理 BUG

## [v1.8] - 2025-07-08

優化 `create_enhanced_dummy_data.py` 生成測試資料腳本， 在客戶資料生成同時新增產品相關資料的生成，並預防重複資料的問題

**重複資料預防機制**

1. Email 唯一性：
   - 使用 set() 追蹤已使用的 email
   - 如果重複，自動加上數字後綴
   - 最後備案使用時間戳確保唯一性
2. SKU 唯一性：
   - 追蹤已使用的 SKU 編號
   - 重複時使用索引序號確保唯一性
3. 訂單號碼唯一性：
   - 追蹤已使用的訂單號碼
   - 重複時使用時間戳和客戶 ID 組合
4. 交易 ID 唯一性：
   - 追蹤已使用的交易 ID
   - 重複時使用訂單 ID 和時間戳組合


**產品資料生成邏輯：**

1. 產品分類：35+ 個分類（電子產品、服飾、居家等）
2. 品牌：49+ 個知名品牌
3. 供應商：36+ 個供應商資料（含聯絡資訊）
4. 產品：69+ 個產品（真實商品名稱）
5. 庫存管理：每個產品的庫存記錄
6. 庫存異動：每個產品 2-5 筆異動記錄

### 修復生成重複資料問題 Double entry

1. Category 模型的 slug 欄位：
   - 新增了 generate_slug() 函數來生成 URL 友好的 slug
   - 確保 slug 的唯一性
   - 在 category 插入查詢中包含 slug 欄位
2. 加入了 tags 欄位：
   - 在 INSERT 查詢中包含了 tags 欄位
   - 對應地在 VALUES 中也加入了 tags 值
3. 生成有效的 JSON 標籤：
   - 隨機選擇 0-3 個標籤（70% 的產品會有標籤）
   - 使用 json.dumps() 生成有效的 JSON 格式
   - 使用 ensure_ascii=False 保持中文字符正確顯示
  

## [v1.8] - 2025-07-07

營銷儀表板新增，聚焦獲客、轉換、ROI

- **開發產品管理**：
- 與現有系統整合， OrderItem 新增 product_id 和 variant_id 欄位

1. 產品管理 ORM 模型

- Category - 產品分類(單層，還不用多層)
- Brand - 品牌管理 - 品牌名稱、官網
- Supplier - 供應商管理 - 供應商信息和關係管理
- Product - 產品本身 - 產品名稱、描述、編號、分類、品牌、供應商
- ProductVariant - 產品規格 - 每個產品會有顏色、尺寸等不同規格
- Inventory - 庫存管理 - 產品庫存追蹤和警戒設定
- StockMovement - 庫存異動記錄 - 進出庫記錄
- PriceHistory - 價格歷史 - 歷史價格變動記錄

2. 建立產品管理的 Admin 管理介面
   1. 開發產品管理的 API Serializers
   2. 建立產品管理的 API Views - RESTful API 端點並於 `urls.py` 中配置路由
   3. 整合產品管理到主要 URL 配置
   4. 建立產品管理的前端頁面組件
      1. 定義產品的 types
      2. 開發 ProductList.tsx 組件顯示產品列表
      3. 在前端添加產品管理的路由和導航。在 Sidebar 中添加產品管理的導航項目
      4. 在 App.tsx 中添加產品管理的路由
      5. 在 App.tsx 中導入 ProductList 組件

## [v1.7] - 2025-07-06

- **營運總覽 -> 營銷儀表板**：

  - 客戶等級分布圓餅圖 → 移到客戶分析
  - 客戶來源分布 → 移到客戶分析
  - 新增功能：
    1. OrderGrowthChart 組件：
       - 使用綠色線圖顯示訂單數量趨勢
       - 包含三個關鍵指標：總訂單數、平均每期訂單數、成長率
       - 使用與其他圖表一致的設計風格
    2. 整合到營銷儀表板：
       - 使用現有的 order_trend 數據
       - 與營收趨勢圖、客戶成長圖表並列顯示
       - RWD 2x2 grid 佈局

- **新增針對客戶的分析儀表板 (CustomerAnalytics.tsx)**
  - 6 個概覽指標卡片(總客戶數、有年齡資料、有性別資料、有產品偏好、平均年齡、資料完整度)
  - AgeAnalysisChart
    - 年齡分布
    - 年齡群組平均消費金額
  - GenderAnalysisChart
    - 性別分布
    - 性別平均消費金額
    - 性別購買行為對比
  - ProductPreferenceChart
    - 產品類別受歡迎程度
    - 產品類別營收貢獻
  - SeasonalAnalysisChart
    - 季節性購買偏好分佈
    - 季節性購買表現分析
  - CustomerSegmentMatrix
    - 客戶細分矩陣（年齡 vs 消費金額）

### 修復問題

- 客戶分析儀表板，下拉選單選擇篩選條件會導致 Cannot assign to read only property '0' of object '[object Array]'
  > 錯誤發生是因為直接對只讀陣列使用 .sort() 方法。當陣列來自 React props 或 state 時，
  > 從 data.sort(...) → [...data].sort(...)， 使用展開運算符 [...data]，創建陣列的淺拷貝，然後對拷貝進行排序，就不會修改原始的只讀陣列。

## [v1.7] - 2025-07-05

- 拆分 Dashboard.tsx 中的圖表成獨立 components

## [v1.6] - 2025-07-04

### 將原本的上方選單結構調整為後台系統常見的左側導覽列（Sidebar）形式，更符合使用習慣

- Sidebar.tsx - 桌面版左側導覽列
  - 簡單 slide transition 動畫
  - selected 狀態以 gradient 藍色背景顯示
- MobileHeader.tsx - 手機版版頂部導覽
  - 折疊式選單，點擊後展開

### 新增 年齡、性別、產品偏好、購買季節偏好(春、夏、秋、冬、全年均勻)，等欄位到 Customer 模型

- 後端新增欄位到 `customers/models.py`、跑 migrate

  1. 個人基本資訊
     - 年齡 (age): 數字欄位，18-75 歲範圍
     - 性別 (gender): 選擇欄位，包含男性、女性、其他、不願透露
  2. 產品偏好分析
     - 產品類別興趣 (product_categories_interest): JSON 陣列，包含：
     - 電子產品、服飾配件、居家用品、美妝保養、運動健身
     - 書籍文具、食品飲料、旅遊票券、汽車用品、寵物用品
  3. 購買行為模式
     - 季節性購買偏好 (seasonal_purchase_pattern): 選擇欄位
     - 春季購買、夏季購買、秋季購買、冬季購買、全年均勻

- 後端更新 customers/serializers.py API
- 後端更新 types/customer.ts TypeScript 類型定義
- 前端 CustomerForm.tsx 表單組件（新增選項定義）
- 前端 CustomerList.tsx 列表顯示（新增欄位）
  - 在來源欄位新增「季節性偏好」的小提示
  - 在總消費額欄位添加 「產品興趣」的小提示
- 更新 `create_enhanced_dummy_data.py` 生成測試資料腳本，讓他可以多 年齡、性別、產品偏好、購買季節偏好(春、夏、秋、冬、全年均勻) 欄位，資料生成邏輯：
  - 90% 客戶有年齡資料
  - 80% 客戶有性別資料
  - 70% 客戶有產品興趣（隨機 1-3 個類別）
  - 60% 客戶有季節性購買偏好

## [v1.6] - 2025-07-03

### 新增儀表版顯示數據

- 修改 生成測試資料的 `create_enhanced_dummy_data.py` 讓其能多生成到 2020 前的資料

### 新增客戶等級分佈圓餅圖

- 等級分類邏輯：
- 白金客戶 (Platinum): total_spent >= 50000 且 total_orders >= 10
- 黃金客戶 (Gold): total_spent >= 20000 且 total_orders >= 5
- 白銀客戶 (Silver): total_spent >= 5000 且 total_orders >= 2
- 一般客戶 (Regular): total_spent > 0 且 total_orders >= 1
- 潛在客戶 (Potential): total_spent = 0 且 total_orders = 0

### 修復問題

- 修復圓餅圖客戶數不會隨日期起迄範圍變更 BUG (Ex. 2025-04 ~ 2025-07 顯示 20 總客戶數，但拉到 2022-01 ~ 2025-07，還是顯示 20 總客戶數)，永遠只顯示 20 個客戶數
- 修復圓餅圖沒有顯示 黃金客戶、白金客戶 BUG(與上面那 BUG 有關)
  > 問題原因
  > 修復前：前端發送：/customers/?limit=10000&date_from=2022-01-01&date_to=2025-07-01\
  > 後端處理：
  >
  > 1. limit=10000 → 被忽略，固定返回 20 筆
  > 2. date_from/date_to → 被忽略，返回所有客戶的前 20 筆。結果：永遠 20 個客戶，日期範圍無效
  >    修復後：前端發送：/customers/?limit=10000&date_from=2022-01-01&date_to=2025-07-01
  >    後端處理：
  > 3. limit=10000 → 返回最多 10000 筆
  > 4. date_from/date_to → 只返回 2022-2025 期間創建的客戶，結果：正確返回該時間段的所有客戶

## [v1.5] - 2025-07-02

### 把 `orders`、` transactions`、`customer`、`reports` 等後端 apps 整理至 `backend` 資料夾中

### 新增快速搜尋篩選功能

- 客戶管理，可依 客戶名稱、聯絡方式(Email、電話)、公司、來源 進行搜尋
- 訂單管理，可依 訂單編號、客戶名稱、聯絡方式、訂、狀態 進行搜尋
  - 下拉選單可依
    - 訂單狀態(待處理、處理中、已出貨、已送達、已取消、已退款)篩選
- 交易記錄，可依 交易編號、客戶名稱搜尋
  - 下拉選單可依
    - 交易狀態(待處理、已完成、失敗、已取消、已退款)篩選，
    - 類型（銷售、退款、付款、退單）篩選

## [v1.4] - 2025-07-01

### 後端新增 reports app : 專門處理統計分析的後端 app

- 導入 Recharts 圖表套件
- 用 Django ORM 聚合查詢實現高效能查詢，優化查詢性能
- RESTful 統計 API、標準化的數據介面設計

- 關鍵營運指標一覽（客戶數、營收、訂單數、交易數）
  - 客戶轉換率 = (訂單總數 / 客戶總數) × 100%
  - 多維度篩選器（日期區間、客戶來源、標籤、時間粒度），
  - recharts 繪製趨勢圖、圓餅圖、柱狀圖、面積圖
  - 付款方式與交易類型分析

### 重新設計登入頁面介面

- 採玻璃擬態效果和漸層背景設計
- 新增品牌圖示和現代化視覺元素
- 流暢的動畫過渡效果
- 改進輸入框設計，加入圖示和懸停效果

### 新增客戶資料匯入功能

- 支援 CSV 和 Excel 檔案格式
- 欄位對應功能
- 匯入前資料預覽
- 錯誤處理和進度追蹤
- 測試用範例檔案

### 修復問題

- 修復時間格式 2024-12-01T00:00:00Z 顯示 BUG
- 修復 營收趨勢＆客戶增長趨勢 日期起迄範圍 只顯示 1 年區間問題

### 修改的檔案

後端:

- `reports/` - 新增完整的報表應用模組
- `reports/views.py` - 統計 API 視圖（儀表板、趨勢、客戶、營收分析）
- `reports/urls.py` - 報表路由配置
- `crm_backend/settings.py` - 新增 reports 應用
- `crm_backend/urls.py` - 整合報表 API 路由
- `customers/management/commands/create_sample_data.py` - 測試數據生成

前端:

- `frontend/src/components/Dashboard.tsx` - 營銷分析儀表板頁面
- `frontend/src/components/Layout.tsx` - 新增儀表板導航
- `frontend/src/App.tsx` - 路由整合與預設頁面調整
- `frontend/src/components/Login.tsx` - 登入後導向儀表板
- `frontend/package.json` - 導入 Recharts、date-fns 套件
- `frontend/src/components/CustomerList.tsx` - 匯入功能整合
- `frontend/src/components/CustomerImport.tsx` - 客戶資料匯入組件
- `frontend/test_customers.csv` - 匯入功能測試檔案

---

## [v1.3] - 2025-06-21

### UI/UX 優化

- 重新設計導航列介面
  - 採用玻璃擬態效果 (Glassmorphism) 和漸層背景
  - SVG 圖標取代 emoji
  - 漸層按鈕和陰影效果、背景模糊和半透明設計
  - 平滑動畫過渡、互動式懸停效果
  - 直觀的使用者資訊顯示
  - 優化登出按鈕 UI

### 修復問題

- 修復客戶資料更新顯示異常、修正編輯客戶後返回列表時出現空白資料項目的問題
- 統一客戶列表的資料刷新邏輯，與訂單和交易列表保持一致
- 確保編輯後的資料正確顯示，避免暫時性空資料出現

---

## [v1.2] - 2025-06-20

### 繁中化頁面

- **完整繁體中文化介面**: 將所有主要組件介面文字改為繁體中文
  - 客戶管理介面 (`CustomerList.tsx`)
  - 訂單管理介面 (`OrderList.tsx`)
  - 交易記錄介面 (`TransactionList.tsx`)
- **表單組件中文化**: 全面翻譯表單內容
  - 客戶表單 (`CustomerForm.tsx`)
  - 訂單表單 (`OrderForm.tsx`)
  - 交易表單 (`TransactionForm.tsx`)
- **詳細頁面中文化**: 完整翻譯所有詳細查看頁面
  - 客戶詳細頁面 (`CustomerDetail.tsx`)
  - 訂單詳細頁面 (`OrderDetail.tsx`)
  - 交易詳細頁面 (`TransactionDetail.tsx`)
- **改進用戶體驗**:
  - 表格欄位標題翻譯 (Customer→ 客戶, Contact→ 聯絡方式, Status→ 狀態等)
  - 按鈕和操作文字翻譯 (Edit→ 編輯, View→ 查看, Save→ 儲存等)
  - 導航元素翻譯 (Back to...→ 返回...)
  - 區塊標題翻譯 (Customer Information→ 客戶資訊)
  - 狀態選項和下拉選單翻譯
  - 搜尋和分頁導航翻譯
  - 錯誤和確認訊息翻譯

### 修改檔案

- `frontend/src/components/CustomerList.tsx` - 客戶列表介面中文化
- `frontend/src/components/OrderList.tsx` - 訂單列表介面中文化
- `frontend/src/components/TransactionList.tsx` - 交易列表介面中文化
- `frontend/src/components/CustomerForm.tsx` - 客戶表單中文化
- `frontend/src/components/OrderForm.tsx` - 訂單表單中文化
- `frontend/src/components/TransactionForm.tsx` - 交易表單中文化
- `frontend/src/components/CustomerDetail.tsx` - 客戶詳細頁面中文化
- `frontend/src/components/OrderDetail.tsx` - 訂單詳細頁面中文化
- `frontend/src/components/TransactionDetail.tsx` - 交易詳細頁面中文化

---

## [v1.1] - (2025-06-20)

### 資料刷新優化

- 將複雜的選擇性更新邏輯改為統一的完整列表刷新機制
- 確保編輯後的資料與後端資料庫完全同步，包含所有關聯欄位 (customer_info、order_info 等)
- 當資料刷新失敗時提供清楚的錯誤訊息，提示使用者重新整理頁面

### 修復問題

- 修正編輯訂單後返回列表時，客戶資訊、訂單項目數量等欄位顯示空白的問題
- 修正編輯交易記錄後返回列表時，客戶資訊、訂單資訊、日期等欄位顯示不正確的問題

> 問題原因：原先的資料更新機制試圖選擇性更新單一記錄，但當個別記錄取得失敗時，會降級使用表單資料作為備案。然而表單資料缺乏後端計算的關聯欄位 (如 customer_info、order_info)，導致列表顯示不完整。新機制確保每次編輯後都從後端重新載入完整的列表資料，包含所有計算欄位和關聯資料。

### 修改檔案

- `frontend/src/components/TransactionList.tsx:117-131` - 簡化 handleSaveTransaction 函數
- `frontend/src/components/OrderList.tsx:98-112` - 簡化 handleSaveOrder 函數

---

## [v1.0] - 初始版本 (2025-06-19)

### 核心功能開發

- 初始化 django + react 全端 CRM 專案
- JWT 身份驗證
- 設計 & 建立 Customer、Order、Transaction 三個主要 ORM Model

### 後端功能模組

1. User (使用者)

- Django 內建認證系統
- 管理系統登入和權限

2. Customer (客戶)

- 客戶基本資料：姓名、email、電話
- 地址資訊：公司、地址、城市、州、郵遞區號、國家
- 客戶來源：網站、社群媒體、推薦、廣告等
- 個人資訊：年齡、性別、產品興趣、季節性購買模式
- 狀態和標籤管理

3. Order (訂單)

- 訂單編號（自動生成）
- 訂單狀態：待處理、處理中、已出貨、已送達、已取消、已退款
- 財務資訊：小計、稅金、運費、折扣、總計
- 送貨和帳單地址

4. OrderItem (訂單項目)

- 訂單中的個別商品
- 商品名稱、SKU、數量、單價、總價

5. Transaction (交易)

- 交易編號（自動生成）
- 交易類型：銷售、退款、付款、拒付
- 付款方式：信用卡、金融卡、PayPal、Stripe 等
- 交易狀態和金額資訊

### 🛠️ 技術架構

- **後端**: Django 4.2.7 + Django REST Framework
- **前端**: React 19 + TypeScript + TailwindCSS
- **資料庫**: MySQL
- **API 設計**: RESTful API 架構
- **開發工具**: Vite 建置工具

---

### 開發準則

- Python 程式碼遵循 PEP 8 規範
- 前端使用 TypeScript 嚴格模式
- 為新功能撰寫測試
- 適時更新文件
- 保持提交的原子性與良好文件化
