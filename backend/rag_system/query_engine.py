import logging
from typing import Dict, List, Any, Optional
from django.db import connection, transaction
from django.conf import settings
from .knowledge_base import CRMKnowledgeBase
from .llm_service import OllamaLLMService

logger = logging.getLogger(__name__)


class CRMQueryEngine:
    """
    CRM 查詢引擎 - 整合 RAG 系統的完整查詢流程
    
    這是 RAG 系統的核心協調器，負責：
    1. 整合 knowledge_base (檢索) 和 llm_service (生成)
    2. 執行 SQL 查詢並確保安全性
    3. 處理不同類型的用戶查詢 (SQL 查詢 vs 非 SQL 查詢)
    4. 為 LINE Bot 提供統一的查詢接口
    """
    
    def __init__(self):
        """初始化查詢引擎，建立知識庫和 LLM 服務連接"""
        self.knowledge_base = CRMKnowledgeBase()
        self.llm_service = OllamaLLMService(knowledge_base=self.knowledge_base)
        logger.info("CRM 查詢引擎初始化完成")
    
    def process_query(self, user_query: str) -> Dict[str, Any]:
        """
        處理用戶查詢的完整流程 - 這是對外的主要接口
        
        完整的 RAG 工作流程：
        1. 意圖分類 (使用 LLM + 向量搜尋)
        2. 根據意圖選擇處理方式
        3. 執行查詢 (SQL 或非 SQL)
        4. 生成自然語言回應
        
        Args:
            user_query: 用戶的自然語言查詢
            
        Returns:
            包含回應和元資料的字典:
            {
                "success": bool,
                "response": str,  # 給用戶的回應
                "intent": str,    # 識別的意圖
                "sql_query": str, # 執行的 SQL (如果有)
                "result_count": int, # 結果筆數
                "confidence": float  # 意圖識別信心度
            }
        """
        try:
            logger.info(f"處理查詢: {user_query}")
            
            # 步驟 1: 意圖分類 (調用 LLM 服務，內部會使用向量搜尋)
            intent_info = self.llm_service.classify_intent(user_query)
            logger.info(f"意圖分類結果: {intent_info['intent']}")
            
            # 步驟 2: 根據意圖選擇處理方式 (目前只支援非 SQL 查詢)
            if intent_info['intent'] in ['faq_query', 'knowledge_base_query', 'ticket_management_query']:
                # 非 SQL 查詢：FAQ、知識庫、工單管理等不需要查詢資料庫的請求
                return self._handle_non_sql_query(user_query, intent_info)
            else:
                # 暫時不支援 SQL 查詢，引導用戶使用支援的功能
                return {
                    "success": True,
                    "response": "目前我只能協助您：\n1. FAQ 常見問題解答\n2. 知識庫文章搜尋\n3. 客服工單相關問題\n\n請問您需要哪種協助？",
                    "intent": intent_info['intent'],
                    "confidence": intent_info.get('confidence', 0)
                }
                
        except Exception as e:
            logger.error(f"查詢處理失敗: {e}")
            # 錯誤處理：確保即使發生錯誤也能給用戶友善的回應
            return {
                "success": False,
                "response": "抱歉，查詢處理時發生錯誤，請稍後再試。",
                "error": str(e),
                "intent": "error"
            }
    
    def _handle_sql_query(self, user_query: str, intent_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        處理需要執行 SQL 的查詢 (customer_query, order_query 等)
        
        流程：
        1. 生成 SQL (LLM + 向量搜尋 schema 和範例)
        2. 安全執行 SQL 
        3. 將結果轉為自然語言回應
        
        Args:
            user_query: 用戶查詢
            intent_info: 意圖分類結果
            
        Returns:
            查詢處理結果
        """
        
        # 步驟 2: 生成 SQL (LLM 會調用知識庫搜尋相關 schema 和範例)
        sql_query = self.llm_service.generate_sql(user_query, intent_info)
        if not sql_query:
            return {
                "success": False,
                "response": "抱歉，無法理解您的查詢需求。",
                "intent": intent_info['intent']
            }
        
        logger.info(f"生成的 SQL: {sql_query}")
        
        # 步驟 3: 安全執行 SQL 查詢
        sql_result = self._execute_sql(sql_query)
        if sql_result is None:
            return {
                "success": False,
                "response": "抱歉，查詢執行時發生錯誤。",
                "intent": intent_info['intent']
            }
        
        # 步驟 4: 生成自然語言回應 (LLM 將 SQL 結果轉為用戶友善的回答)
        response = self.llm_service.generate_response(user_query, sql_result, sql_query)
        
        return {
            "success": True,
            "response": response,
            "intent": intent_info['intent'],
            "sql_query": sql_query,
            "result_count": len(sql_result),
            "confidence": intent_info.get('confidence', 0)
        }
    
    def _handle_non_sql_query(self, user_query: str, intent_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        處理不需要執行 SQL 的查詢（FAQ、知識庫、客服工單管理等）
        
        這些查詢通常是：
        - FAQ 常見問題解答
        - 知識庫文章搜尋  
        - 客服工單操作指引
        
        Args:
            user_query: 用戶查詢
            intent_info: 意圖分類結果
            
        Returns:
            查詢處理結果
        """
        
        intent = intent_info['intent']
        
        # 根據不同意圖調用對應的處理方法
        if intent == 'faq_query':
            response = self._search_faq(user_query)
        elif intent == 'knowledge_base_query':
            response = self._search_knowledge_base(user_query)
        elif intent == 'ticket_management_query':
            response = self._handle_ticket_management(user_query)
        else:
            response = "抱歉，我還不支援這種類型的查詢。"
        
        return {
            "success": True,
            "response": response,
            "intent": intent,
            "confidence": intent_info.get('confidence', 0)
        }
    
    def _execute_sql(self, sql_query: str) -> Optional[List[Dict[str, Any]]]:
        """
        安全執行 SQL 查詢 - 這是系統安全的關鍵部分
        
        安全措施：
        1. 只允許 SELECT 語句
        2. 禁止 DDL/DML 語句 (DROP, DELETE, UPDATE 等)
        3. 使用 Django 的資料庫連接 (自動防 SQL 注入)
        4. 錯誤處理和日誌記錄
        
        Args:
            sql_query: 要執行的 SQL 語句
            
        Returns:
            查詢結果列表 (字典格式)，失敗時返回 None
        """
        try:
            # 安全檢查 1：只允許 SELECT 語句
            sql_clean = sql_query.strip().upper()
            if not sql_clean.startswith('SELECT'):
                logger.warning(f"拒絕執行非 SELECT 語句: {sql_query}")
                return None
            
            # 安全檢查 2：禁止危險關鍵字
            forbidden_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE']
            if any(keyword in sql_clean for keyword in forbidden_keywords):
                logger.warning(f"拒絕執行包含危險關鍵字的 SQL: {sql_query}")
                return None
            
            # 使用 Django 的資料庫連接執行查詢
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                # 獲取欄位名稱
                columns = [col[0] for col in cursor.description]
                # 獲取所有結果
                rows = cursor.fetchall()
                
                # 轉換為字典列表格式 (更容易處理)
                result = []
                for row in rows:
                    result.append(dict(zip(columns, row)))
                
                logger.info(f"SQL 執行成功，返回 {len(result)} 筆結果")
                return result
                
        except Exception as e:
            logger.error(f"SQL 執行失敗: {e}")
            logger.error(f"問題 SQL: {sql_query}")
            return None
    
    def _search_faq(self, query: str) -> str:
        """
        搜尋 FAQ 常見問題
        
        使用向量搜尋在知識庫中尋找相關的 FAQ 條目
        
        Args:
            query: 用戶查詢
            
        Returns:
            格式化的 FAQ 回應
        """
        try:
            # 使用知識庫的向量搜尋功能尋找相關 FAQ
            examples = self.knowledge_base.search_similar_examples(query, n_results=3)
            
            if not examples:
                return "抱歉，沒有找到相關的常見問題。您可以聯繫客服獲得幫助。"
            
            # 格式化 FAQ 回應
            response = "以下是相關的常見問題：\n\n"
            for i, example in enumerate(examples, 1):
                # 只顯示 FAQ 相關的結果
                if 'faq' in example.get('intent', '').lower():
                    response += f"{i}. {example['natural_query']}\n"
                    if 'description' in example and example['description']:
                        response += f"   答案：{example['description']}\n\n"
            
            # 如果沒有找到 FAQ 相關內容
            if response == "以下是相關的常見問題：\n\n":
                return "抱歉，沒有找到相關的常見問題。您可以聯繫客服獲得幫助。"
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"FAQ 搜尋失敗: {e}")
            return "抱歉，FAQ 搜尋時發生錯誤。"
    
    def _search_knowledge_base(self, query: str) -> str:
        """
        搜尋知識庫文章
        
        在知識庫中搜尋相關的文章和說明
        
        Args:
            query: 用戶查詢
            
        Returns:
            格式化的知識庫搜尋結果
        """
        try:
            # 使用向量搜尋尋找相關知識庫內容
            examples = self.knowledge_base.search_similar_examples(query, n_results=5)
            
            if not examples:
                return "抱歉，沒有找到相關的知識庫文章。"
            
            # 格式化知識庫搜尋結果
            response = "以下是相關的知識庫內容：\n\n"
            for i, example in enumerate(examples, 1):
                response += f"{i}. {example['natural_query']}\n"
                if 'description' in example and example['description']:
                    response += f"   說明：{example['description']}\n\n"
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"知識庫搜尋失敗: {e}")
            return "抱歉，知識庫搜尋時發生錯誤。"
    
    def _handle_ticket_management(self, query: str) -> str:
        """
        處理客服工單管理查詢
        
        提供工單相關的操作指引和資訊
        
        Args:
            query: 用戶查詢
            
        Returns:
            工單管理相關回應
        """
        try:
            # 簡單的關鍵字匹配來提供工單相關資訊
            query_lower = query.lower()
            
            if any(word in query_lower for word in ['建立', '新增', '創建']):
                return "您可以透過以下方式建立客服工單：\n1. 在系統中點選「新增工單」\n2. 填寫問題描述和聯絡資訊\n3. 選擇適當的問題分類\n4. 提交後會自動分配工單號碼"
            
            elif any(word in query_lower for word in ['狀態', '進度', '查詢']):
                return "您可以通過工單號碼查詢工單狀態：\n- 開啟中：已收到您的工單\n- 處理中：客服正在處理\n- 等待回應：需要您提供更多資訊\n- 已解決：問題已處理完成"
            
            elif any(word in query_lower for word in ['聯絡', '客服', '電話']):
                return "客服聯絡方式：\n- 系統內工單：隨時可建立\n- 緊急問題：請致電客服專線\n- 一般諮詢：透過 LINE 聯繫"
            
            else:
                return "關於客服工單，我可以幫您：\n1. 了解如何建立工單\n2. 查詢工單狀態\n3. 提供客服聯絡方式\n\n請告訴我您需要哪種協助？"
                
        except Exception as e:
            logger.error(f"工單管理處理失敗: {e}")
            return "抱歉，工單查詢時發生錯誤。"
    
    def add_sample_data(self):
        """
        添加範例資料到知識庫
        
        這個方法用於初始化系統時添加基本的非 SQL 查詢範例
        包括：
        1. FAQ 常見問題
        2. 知識庫文章內容  
        3. 客服工單相關資訊
        """
        logger.info("開始添加範例資料到知識庫...")
        
        # 添加 FAQ 和知識庫範例
        examples = [
            # FAQ 範例
            {
                "intent": "faq_query",
                "natural_query": "如何修改密碼",
                "sql_query": "",
                "description": "請到個人設定頁面，點選「修改密碼」，輸入舊密碼和新密碼即可完成修改。"
            },
            {
                "intent": "faq_query",
                "natural_query": "忘記密碼怎麼辦",
                "sql_query": "",
                "description": "請點選登入頁面的「忘記密碼」連結，輸入您的電子郵件，系統會發送重設密碼的連結給您。"
            },
            {
                "intent": "faq_query",
                "natural_query": "如何聯絡客服",
                "sql_query": "",
                "description": "您可以透過以下方式聯絡客服：1. LINE 官方帳號 2. 客服電話：02-1234-5678 3. 電子郵件：support@minicrm.com"
            },
            
            # 知識庫範例
            {
                "intent": "knowledge_base_query",
                "natural_query": "系統操作指南",
                "sql_query": "",
                "description": "CRM 系統操作指南：1. 登入後可在儀表板查看總覽 2. 左側選單可管理客戶、訂單等 3. 詳細操作請參考各功能頁面的說明"
            },
            {
                "intent": "knowledge_base_query", 
                "natural_query": "資料匯入說明",
                "sql_query": "",
                "description": "資料匯入功能：支援 CSV 和 Excel 格式，可匯入客戶資料。匯入前請確認欄位格式正確，系統會提供預覽功能。"
            },
            
            # 客服工單範例
            {
                "intent": "ticket_management_query",
                "natural_query": "如何建立客服工單",
                "sql_query": "",
                "description": "建立客服工單：1. 點選「新增工單」2. 填寫問題描述 3. 選擇問題分類 4. 提交後會自動分配工單號碼"
            },
            {
                "intent": "ticket_management_query",
                "natural_query": "工單狀態說明",
                "sql_query": "",
                "description": "工單狀態：開啟中(已收到)、處理中(客服處理)、等待回應(需要更多資訊)、已解決(問題完成)"
            }
        ]
        
        # 將範例存入知識庫
        for example in examples:
            self.knowledge_base.add_query_example(
                example["intent"],
                example["natural_query"], 
                example["sql_query"],
                example["description"]
            )
        
        logger.info("範例資料添加完成")