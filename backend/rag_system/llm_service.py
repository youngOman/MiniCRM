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
        
        # 從環境變數讀取 Ollama 主機設定
        import os
        ollama_host = os.getenv('OLLAMA_HOST', 'localhost')
        ollama_port = os.getenv('OLLAMA_PORT', '11434')
        
        if ollama_host != 'localhost':
            # Docker 環境中使用容器名稱
            base_url = f"http://{ollama_host}:{ollama_port}"
            self.client = ollama.Client(host=base_url)
            logger.info(f"使用 Docker Ollama 服務: {base_url}")
        else:
            # 本地環境使用預設設定
            self.client = ollama.Client()
            logger.info("使用本地 Ollama 服務")
        
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
        
        prompt = f"""你是 SQL 專家。根據用戶查詢生成簡單的 SELECT 語句。

用戶查詢: "{user_query}"
意圖: {intent_info['intent']}
關鍵字: {intent_info.get('entities', [])}

{schema_context}

{example_context}

**重要規則：**
1. 只生成單表 SELECT 查詢，避免複雜的 JOIN
2. 使用正確的表名和欄位名
3. 表別名要簡單：如 faq, kb, ticket
4. WHERE 條件要具體，不使用參數佔位符 ?
5. 優先查詢 is_active = true 的記錄
6. LIMIT 結果數量（通常 5-10 筆）

**範例格式：**
```sql
SELECT question, answer 
FROM customer_service_faq 
WHERE question LIKE '%密碼%' AND is_active = true 
LIMIT 5;
```

只回覆一個完整的 SQL 語句，不要其他解釋："""

        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response['message']['content'].strip()
            
            # 提取 SQL 語句
            sql = self._extract_sql(content)
            
            logger.info(f"生成 SQL: {sql}")
            return sql
            
        except Exception as e:
            logger.error(f"SQL 生成失敗: {e}")
            return ""
    
    def _extract_sql(self, content: str) -> str:
        """
        從 LLM 回應中提取純 SQL 語句
        """
        import re
        
        # 方法 1: 尋找 ```sql 代碼塊
        sql_pattern = r'```sql\s*(.*?)\s*```'
        match = re.search(sql_pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # 方法 2: 尋找一般 ``` 代碼塊
        code_pattern = r'```\s*(.*?)\s*```'
        match = re.search(code_pattern, content, re.DOTALL)
        if match:
            sql_candidate = match.group(1).strip()
            # 檢查是否像 SQL
            if sql_candidate.upper().startswith('SELECT'):
                return sql_candidate
        
        # 方法 3: 尋找以 SELECT 開頭的行
        lines = content.split('\n')
        sql_lines = []
        collecting = False
        
        for line in lines:
            line = line.strip()
            if line.upper().startswith('SELECT'):
                collecting = True
                sql_lines.append(line)
            elif collecting:
                if line.endswith(';') or line == '':
                    sql_lines.append(line)
                    if line.endswith(';'):
                        break
                else:
                    sql_lines.append(line)
        
        if sql_lines:
            sql = '\n'.join(sql_lines).strip()
            if sql.endswith(';'):
                return sql
            else:
                return sql + ';'
        
        # 方法 4: 最後嘗試找純 SQL（以 SELECT 開頭）
        if content.upper().strip().startswith('SELECT'):
            return content.strip()
        
        logger.warning(f"無法從回應中提取 SQL: {content}")
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