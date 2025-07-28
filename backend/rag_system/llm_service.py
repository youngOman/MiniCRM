import ollama
import json
import logging
from typing import Dict, List, Any, Optional
from .knowledge_base import CRMKnowledgeBase

logger = logging.getLogger(__name__)

class OllamaLLMService:
    """Ollama LLM 服務 - RAG 的生成部分"""
    
    def __init__(self, model_name: str = "llama3", knowledge_base: Optional[CRMKnowledgeBase] = None):
        self.model_name = model_name
        self.knowledge_base = knowledge_base
        self.client = ollama.Client()
        
        # 測試 Ollama 連接
        try:
            models = self.client.list()
            logger.info(f"成功連接 Ollama，可用模型: {[m['name'] for m in models['models']]}")
        except Exception as e:
            logger.error(f"連接 Ollama 失敗: {e}")
            raise
    
    def classify_intent(self, user_query: str) -> Dict[str, Any]:
        """步驟1: 分類用戶意圖"""
        
        # RAG: 從知識庫檢索相似範例
        context = ""
        if self.knowledge_base:
            similar_examples = self.knowledge_base.search_similar_examples(user_query, n_results=3)
            if similar_examples:
                context = "參考範例:\n"
                for i, ex in enumerate(similar_examples, 1):
                    context += f"{i}. {ex['intent']}: {ex['natural_query']}\n"
        
        prompt = f"""你是 CRM 系統助手。分析用戶查詢的意圖。

意圖類別:
- customer_query: 客戶資料查詢
- order_query: 訂單資料查詢  
- product_query: 產品資料查詢
- transaction_query: 交易資料查詢
- service_query: 客服工單查詢
- analytics_query: 統計分析查詢
- faq_query: FAQ 常見問題查詢
- knowledge_base_query: 知識庫文章查詢
- ticket_management_query: 客服工單管理查詢

{context}

用戶查詢: "{user_query}"

請回覆 JSON 格式:
{{
    "intent": "意圖類別",
    "confidence": 0.9,
    "entities": ["提取的關鍵字"],
    "reasoning": "分析原因"
}}"""

        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response['message']['content']
            
            # 提取 JSON
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                result = json.loads(content[json_start:json_end])
                logger.info(f"意圖分類: {result['intent']}")
                return result
            else:
                return self._fallback_intent(user_query)
                
        except Exception as e:
            logger.error(f"意圖分類失敗: {e}")
            return self._fallback_intent(user_query)
    
    def generate_sql(self, user_query: str, intent_info: Dict[str, Any]) -> str:
        """步驟2: 生成 SQL 查詢"""
        
        # RAG: 檢索相關的 schema 和範例
        schema_context = ""
        example_context = ""
        
        if self.knowledge_base:
            # 獲取相關資料表結構
            schemas = self.knowledge_base.search_relevant_schemas(user_query, n_results=3)
            if schemas:
                schema_context = "相關資料表:\n"
                for schema in schemas:
                    schema_context += f"{schema['schema_text']}\n"
            
            # 獲取類似查詢範例
            examples = self.knowledge_base.search_similar_examples(user_query, n_results=2)
            if examples:
                example_context = "參考 SQL 範例:\n"
                for ex in examples:
                    example_context += f"查詢: {ex['natural_query']}\n"
                    example_context += f"SQL: {ex['sql_query']}\n\n"
        
        prompt = f"""你是 SQL 專家。根據用戶查詢生成 SELECT 語句。

用戶查詢: "{user_query}"
意圖: {intent_info['intent']}
關鍵字: {intent_info.get('entities', [])}

{schema_context}

{example_context}

規則:
1. 只生成 SELECT 查詢
2. 使用正確的表名和欄位名
3. 考慮適當的 JOIN
4. 添加合理的 WHERE 條件
5. 確保語法正確

只回覆 SQL 語句:"""

        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            
            sql = response['message']['content'].strip()
            
            # 清理 SQL（移除 markdown）
            if sql.startswith('```'):
                sql = sql.split('\n', 1)[1] if '\n' in sql else sql[3:]
            if sql.endswith('```'):
                sql = sql.rsplit('\n', 1)[0] if '\n' in sql else sql[:-3]
            
            logger.info(f"生成 SQL: {sql}")
            return sql.strip()
            
        except Exception as e:
            logger.error(f"SQL 生成失敗: {e}")
            return ""
    
    def generate_response(self, user_query: str, sql_result: List[Dict], sql_query: str = "") -> str:
        """步驟3: 將查詢結果轉為自然語言回應"""
        
        # 限制結果避免過長
        limited_result = sql_result[:5] if len(sql_result) > 5 else sql_result
        
        prompt = f"""你是友善的 CRM 助手。將查詢結果轉為中文回應。

用戶查詢: "{user_query}"
結果筆數: {len(sql_result)}
結果資料: {json.dumps(limited_result, ensure_ascii=False, indent=2)}

要求:
1. 用友善專業的語調
2. 簡潔總結結果
3. 突出重要資訊
4. 如果超過5筆，提及總數

回應:"""

        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response['message']['content'].strip()
            
        except Exception as e:
            logger.error(f"回應生成失敗: {e}")
            return self._fallback_response(sql_result)
    
    def _fallback_intent(self, query: str) -> Dict[str, Any]:
        """備用意圖分類"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['客戶', '顧客', 'customer']):
            intent = 'customer_query'
        elif any(word in query_lower for word in ['訂單', 'order']):
            intent = 'order_query'
        elif any(word in query_lower for word in ['產品', '商品', 'product']):
            intent = 'product_query'
        elif any(word in query_lower for word in ['faq', '常見問題', '問答']):
            intent = 'faq_query'
        elif any(word in query_lower for word in ['知識庫', '知識', '文章', 'knowledge']):
            intent = 'knowledge_base_query'
        elif any(word in query_lower for word in ['工單', '客服', '服務', 'ticket', 'service']):
            intent = 'ticket_management_query'
        else:
            intent = 'general_info'
        
        return {
            "intent": intent,
            "confidence": 0.6,
            "entities": [],
            "reasoning": "關鍵字匹配"
        }
    
    def _fallback_response(self, sql_result: List[Dict]) -> str:
        """備用回應"""
        if not sql_result:
            return "抱歉，沒有找到符合的資料。"
        
        return f"查詢完成，共找到 {len(sql_result)} 筆資料。"