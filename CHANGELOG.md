# CHANGELOG

## 待辦

1. 獲客成本 CAC 計算
   1. 總行銷費用 ÷ 新獲得客戶數量
   2. CAC = (廣告費 + 行銷人員薪資 + 行銷工具費用 + 其他獲客相關費用) ÷ 新客戶數量

- 不同客戶來源的 CAC（網站、廣告、推薦等）
- 按時間區間計算 CAC 趨勢
- 與客戶生命週期價值 (CLV) 比較，確保 CLV > CAC

1. 即時更新：WebSocket 即時推送
2. 匯出資料、匯出 PDF 報表
3. 行銷管理 (Marketing Management)
4. 在訂單管理介面，在訂單編輯頁面 新增 產品判斷若該產品沒有在 產品管理內，產品管理就會自動新增該產品
   1. 用戶開始輸入 SKU → 即時搜索提示
   2. 找到產品 → 顯示產品資訊，確認添加
   3. 未找到產品 → 顯示「創建新產品」按鈕
   4. 創建成功 → 自動添加到訂單

- 前端列表顯示英文而非中文問題
- 離線模式
- 多平台整合：與 Notion、Google Workspace 等業務工具整合
- 行銷自動化：建立 EDM 模板或與 LINE 串接，自動化內容推播
- AI 智慧商業分析助手
  - 對話式數據查詢: "幫我找出上個月購買最多的 25-35 歲女性客戶"
  - 自動報告生成: LLM 解讀您的圖表數據並生成商業洞察報告
  - 整合客戶資料，透過 AI 提示銷售人員採取下一個建議動作的方式，將銷售流程自動化-提高 ROAS（廣告投資報酬率）。

## 待處理 BUG

## [v1.12] - 2025-07-15

修正 CLV 計算機制

1. 先算 **平均客單價** ( Average purchase value ): 在特定時間範圍內(以一年為單位 )，所有消費者的產生的購買金額/該期間的訂單數量 = 每筆訂單平均花多少錢
2. 再算 **平均消費頻率** ( Average purchase frequency )，以年為單位: 將同一時間段內的訂單數量/同一時間段內進行交易的消費者數量 = 平均每個客戶會下幾筆訂單
3. 算**顧客價值** ( Customer value ): 平均消費頻率 x 平均客單價 = 每個客戶平均花多少
   - 例如：平均客單價 $1000，平均消費頻率 2 次/年，則顧客價值 = $1000 x 2 = $2000
   - 這個值代表每位客戶在一年內的預期貢獻
4. **平均顧客壽命** ( Average Customer Lifespan, ACL ): 每位顧客的消費時間長度/顧客數 = 客戶平均會跟公司維持關係多久
5. 最後 CLV(每個客戶在整個生命週期內預期能為公司帶來的總價值)= 顧客價值 x 平均顧客壽命

## [v1.12] - 2025-07-14

### 🎯 客戶生命週期價值 (CLV) 分析系統 - 每個客戶在整個生命週期內預期能為公司帶來的總價值

- **新增「客戶價值分析」頁面** (`/customer-value-analytics`)
  - CLV 概覽統計：平均 CLV、總客戶價值、平均每月購買次數、有消費客戶數
  - 客戶價值分布：低價值、中價值、高價值、頂級客戶四級分群分析
    - 低價值: $0 - $999
    - 中價值: $1,000 - $4,999
    - 高價值: $5,000 - $19,999
    - 頂級: $20,000 以上
  - 來源 CLV 分析：各獲客渠道 (官網、社群、推薦、廣告) 的客戶價值表現對比
  - 頂級客戶排行：CLV 前 20 名客戶詳細列表，包含金、銀、銅牌標示
  - 月度 CLV 趨勢：時間序列分析新客戶價值變化 (平均每月購買次數 = 客戶平均訂單數 ÷ 客戶平均生命週期(月))
  - 每筆新訂單成立時，立即更新 CLV 值

### 後端 API

- **新增 CLV 計算引擎** (`reports/views.py`)
  - `calculate_avg_clv()`: 計算平均客戶生命週期價值
  - `calculate_avg_purchase_frequency()`: 計算平均每月購買次數
  - `customer_clv_analytics()`: 完整的 CLV 分析 API
- **新增 API 端點**: `GET /api/reports/customer-clv/`
  - 支援日期範圍、來源篩選

### 前端

- 主儀表板新增平均 CLV 和高價值客戶數 KPI 卡片
- **側邊欄導航**新增「客戶價值分析」選項 (💰 圖示)
- **客戶總覽頁面**新增「客戶價值分析」快速導航卡片

### 修復問題

- 修復 Django 聚合錯誤、重構 CLV 計算邏輯，避免在 annotated 字段上使用聚合函數
- 使用批次計算減少數據庫查詢次數

---

## [v1.11] - 2025-07-14

### 新增功能

- 修正 CustomerList 組件的 API 請求邏輯，確保使用正確的 endpoint 並避免 TypeScript 錯誤
- 顧客 models.py 新增計算 訂單數、總消費額 property，後端寫自定義 queryset 讓前端能使用 `?ordering=total_spent` 或 `?ordering=-total_spent` 來排序
- 新增根據總消費額 ASC/DESC 排序的下拉選單功能 in CustomerList component
- 新增 debouncing for filters in 客戶分群分析、客戶人口分析、客戶行為分析
- debouncing for customer and product search functionality

## [v1.11] - 2025-07-13

- 客戶管理排序功能 - 後端
  1. 總消費額：由低到高 (annotated_total_spent)
  2. 總消費額：由高到低 (-annotated_total_spent)
  3. 訂單數：由少到多 (annotated_total_orders)
  4. 訂單數：由多到少 (-annotated_total_orders)
  5. 加入時間：由舊到新 (created_at)
  6. 加入時間：由新到舊 (-created_at)
  7. 測試排序功能

## [v1.10] - 2025-07-11

- 客戶管理新增 排序下拉選單 - 前端
  - debounce 及 useEffect 監聽排序狀態變化

## [v1.9] - 2025-07-10

**產品管理系統開發**

1.  產品管理 CRUD
    1. 產品 Form 表單頁面，編輯、新增
2.  產品 detail 詳情頁面
    - 基本資訊 Tab：產品名稱、SKU、價格、成本、分類、品牌、供應商
    - 產品款式變體 Tab：顯示所有產品款式變體，支援新增/編輯/刪除
    - 庫存狀況 Tab：實時庫存、預留庫存、可用庫存、庫存警示
    - 庫存異動 Tab：完整的入庫/出庫/調整記錄
3.  新增 ProductForm 組件，用於新增/編輯產品
    1. 在 ProductDetail 中新增編輯功能 URL 和按鈕
    2. 產品資訊編輯表單，實作 PUT API 呼叫更新產品
    3. 處理分類、品牌、供應商的下拉選單
    4. 新增表單驗證和錯誤處理
       1. 資料格式規範化：
          - 確保所有字串欄位都進行 trim 處理
          - 數值欄位進行格式檢查和轉換
          - 只在有值時才傳送可選欄位
          - weight 轉換為正確的 decimal 格式
       2. 增強驗證：
          - 添加數值欄位的有效性檢查
          - 添加重量、稅率、最小訂購量的錯誤顯示
          - 確保所有數值都是有效的
       3. 更好的錯誤處理：
          - 處理 API 回應中的陣列錯誤訊息
          - 正確顯示欄位特定的錯誤
    5. 新增路由配置支援編輯模式

**部署上線**

1. CLOUDFLARE 申請 DNS
2. nslookup `minicrm.akebee.com`，看是否有解析到 IP
3. VPS 主機把專案 clone 下來
   1. python3 -m venv venv，建立並啟用虛擬環境並執行 `pip install -r requirements.txt`
   2. 新增對應的 nginx.conf 配置檔
   3. sudo certbot certonly --expand -d xxx.com -d minicrm.akebee.com，申請 SSL 憑證
   4. uwsgi uwsgi.ini 試跑，前端 `run build` 完，訪問網頁確定可以就來建 service
   5. 建立 systemd 服務檔案 `/etc/systemd/system/minicrm-uwsgi.service`，設定自動啟用服務
4. 注意！！！前端的 api 端點也要改 `frontend/src/services/api.ts`

### 修復問題

1. 修復產品管理頁面，產品搜尋每打一個字，畫面就會 rerender 一次
2. ProductDetail 中庫存資料結構錯誤（應該是單一物件而非陣列）
3. `http://localhost:8000/api/products/products/159/stock-movements/ 404 (Not Found)`，將 stock-movements 的 API 路徑從 `/products/products/{id}/stock-movements/` 改為 `/products/stock-movements/?product=${id}`
4. 修復 `TypeError:categories.map is not a function`，有些產品可能一開始沒有設置供應商、產品分類、品牌分類..等，多設定空陣列作為預設值 + 確保資料是陣列格式
5. 更新產品會出現 400 Error (請求資料格式有問題)，`用戶沒填重量 Weight，送出空字串`、`價格欄位 NaN` 問題
6. 送出表單後，分類資訊像是 產品分類、品牌、供應商 都沒有更新成功？
   - 直接使用 parseInt() 轉換 category、brand、supplier，但如果這些欄位是空字串，parseInt("") 會回傳 NaN，這會導致後端收到無效的資料。
7. 前端產品在 ProductDetailSerializer 中，category, brand, supplier 欄位只包含 ID，而不是完整的物件。完整的名稱資訊在 category_name, brand_name,supplier_name 欄位中，所以前端要改讀 category_name...來顯示
   - 後端 ProductDetailSerializer 回傳的是：
     ```json
     {
     	"category": 186, // 只有 ID
     	"category_name": "3C 配件", // 完整名稱
     	"brand": 205,
     	"brand_name": "Adidas",
     	"supplier": 146,
     	"supplier_name": "亞洲科技供應商"
     }
     ```

## [v1.8.1] - 2025-07-09

1. **客戶分析儀表板拆分與重構**

減少頁面載入時間 60-75%（原本 7 個圖表 → 每頁最多 3 個圖表）

- **客戶總覽頁面** (`/customer-overview`) - 基本統計卡片與快速導航
- **客戶人口分析** (`/customer-demographics`) - 年齡、性別分布與消費行為分析
- **客戶行為分析** (`/customer-behavior`) - 產品偏好、季節性購買模式分析
- **客戶分群分析** (`/customer-segmentation`) - 客戶來源、等級分布與細分矩陣

2. **導航 UI/UX 優化**：
   - 客戶總覽頁面新增快速導航卡片，可點擊跳轉到專門分析頁面
   - 側邊欄新增客戶分析模組的四個子頁面

### 🗂️ 檔案結構重整

**新的模組化結構**：

```
frontend/src/components/
├── customer_analytics/           # 客戶分析模組
│   ├── pages/                   # 分析頁面
│   │   ├── CustomerOverview.tsx
│   │   ├── CustomerDemographics.tsx
│   │   ├── CustomerBehavior.tsx
│   │   ├── CustomerSegmentation.tsx
│   │   └── index.ts
│   ├── [各種圖表組件].tsx       # 重用的圖表組件
│   └── index.ts                 # 模組總導出
├── CustomerList.tsx             # 客戶管理（保留原位）
├── CustomerForm.tsx             # 客戶表單（保留原位）
└── ...其他組件
```

### 🧹 程式碼清理

- **移除無用檔案**：刪除已重構的 `CustomerAnalytics.tsx`
- **路由簡化**：移除重複的完整客戶分析路由
- **導入路徑優化**：統一使用模組化導入方式

### 📋 使用者體驗改善

- 更快的頁面載入速度
- 更聚焦的分析內容
- 清晰的功能分工與導航
- 保持所有原有功能和篩選器完整性

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
      - 對女性客戶：推送促銷活動，提高復購率
      - 對男性客戶：推薦高價值商品，提升客單價
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
