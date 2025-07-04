# CHANGELOG

## 待辦

- 客戶生命週期價值 (CLV) 計算
- PDF 報表匯出
- 即時數據更新：WebSocket 即時推送

- 新增客戶價值排行榜
  - 客戶價值計算方式：
  - 主要指標: total_spent (總消費金額)
  - 次要指標: total_orders × 平均訂單價值
  - 時間權重: 考慮客戶年齡 (今天 - created_at)
- 匯出資料
- 匯出報表
- 季節性行銷：根據購買模式安排促銷活動
- 產品推薦：根據產品類別的精準推薦

## 待處理 BUG

-

## [v1.7] - 2025-07-05

- 拆分 Dashboard.tsx 中的圖表成獨立組件
- 客戶管理新增依 總消費額 ASC、DESC 排序 下拉選單
- 訂單管理新增依 日期 ASC、DESC 排序 下拉選單

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

- `frontend/src/components/Dashboard.tsx` - 營運儀表板主頁面
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
