// 客服工單
export interface ServiceTicket {
  id: number;
  ticket_number: string;
  customer: number;
  customer_name?: string;
  customer_email?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tags?: string[];
  assigned_to?: number;
  assigned_to_name?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
}

// 客服記錄
export interface ServiceNote {
  id: number;
  ticket: number;
  ticket_number?: string;
  note_type: string;
  content: string;
  is_visible_to_customer: boolean;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// 知識庫分類
export interface KnowledgeBaseCategory {
  id: number;
  name: string;
  description?: string;
  parent?: number;
  parent_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// 知識庫文章
export interface KnowledgeBase {
  id: number;
  title: string;
  summary?: string;
  content: string;
  category: number;
  category_name?: string;
  content_type: string;
  tags?: string[];
  is_public: boolean;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_by?: number;
  created_by_name?: string;
  updated_by?: number;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

// FAQ 常見問題
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// API 回應類型
export interface ServiceTicketResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ServiceTicket[];
}

export interface ServiceNoteResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ServiceNote[];
}

export interface KnowledgeBaseResponse {
  count: number;
  next?: string;
  previous?: string;
  results: KnowledgeBase[];
}

export interface KnowledgeBaseCategoryResponse {
  count: number;
  next?: string;
  previous?: string;
  results: KnowledgeBaseCategory[];
}

export interface FAQResponse {
  count: number;
  next?: string;
  previous?: string;
  results: FAQ[];
}

// 表單數據類型
export interface ServiceTicketFormData {
  customer: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface ServiceNoteFormData {
  ticket: string;
  note_type: string;
  content: string;
  is_visible_to_customer: boolean;
}

export interface KnowledgeBaseFormData {
  title: string;
  summary?: string;
  content: string;
  category: string;
  content_type: string;
  tags?: string[];
  is_public: boolean;
  is_featured: boolean;
  is_active: boolean;
}

export interface KnowledgeBaseCategoryFormData {
  name: string;
  description?: string;
  parent?: string;
  sort_order: number;
  is_active: boolean;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

// 常數定義
export const TICKET_CATEGORIES = [
  { value: 'general_inquiry', label: '一般諮詢' },
  { value: 'technical_issue', label: '技術問題' },
  { value: 'billing_issue', label: '計費問題' },
  { value: 'product_issue', label: '產品問題' },
  { value: 'shipping_issue', label: '物流問題' },
  { value: 'return_exchange', label: '退換貨' },
  { value: 'complaint', label: '客訴' },
  { value: 'feature_request', label: '功能建議' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '緊急' },
];

export const TICKET_STATUSES = [
  { value: 'open', label: '開啟中' },
  { value: 'in_progress', label: '處理中' },
  { value: 'waiting_response', label: '等待回應' },
  { value: 'resolved', label: '已解決' },
  { value: 'closed', label: '已關閉' },
];

export const NOTE_TYPES = [
  { value: 'internal_note', label: '內部備註' },
  { value: 'customer_response', label: '客戶回應' },
  { value: 'system_note', label: '系統記錄' },
  { value: 'solution', label: '解決方案' },
];

export const KNOWLEDGE_CONTENT_TYPES = [
  { value: 'faq', label: 'FAQ' },
  { value: 'guide', label: '操作指南' },
  { value: 'policy', label: '政策說明' },
  { value: 'troubleshooting', label: '故障排除' },
  { value: 'best_practice', label: '最佳實踐' },
  { value: 'sop', label: 'SOP' },
];

export const FAQ_CATEGORIES = [
  { value: 'general', label: '一般問題' },
  { value: 'account', label: '帳戶相關' },
  { value: 'billing', label: '計費相關' },
  { value: 'product', label: '產品相關' },
  { value: 'shipping', label: '物流相關' },
  { value: 'technical', label: '技術相關' },
];