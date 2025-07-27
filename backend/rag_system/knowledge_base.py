import os
import json
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class CRMKnowledgeBase:
    """CRM 系統知識庫管理器"""

    def __init__(self, persist_directory: str = "chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(path=persist_directory)  # ChromaDB 進行向量儲存和相似度搜尋
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # 將文本轉換為向量

        # 初始化集合
        self.schema_collection = self._get_or_create_collection("crm_schema")  # 儲存資料庫 schema 資訊
        self.examples_collection = self._get_or_create_collection("query_examples")  # 儲存查詢範例

        logger.info("CRM 知識庫初始化完成")

    def _get_or_create_collection(self, name: str):
        """獲取或創建集合"""
        try:
            return self.client.get_collection(name)
        except:
            return self.client.create_collection(name)

    def add_schema_info(self, table_name: str, schema_info: Dict[str, Any]):
        """
        添加資料表 schema 資訊
        將資料表結構轉換為可搜尋的向量

        """
        schema_text = self._format_schema_text(table_name, schema_info)
        embedding = self.model.encode([schema_text])[0].tolist()

        self.schema_collection.add(
            embeddings=[embedding],
            documents=[schema_text],
            metadatas=[{
                "table_name": table_name,
                "type": "schema",
                "fields": json.dumps(schema_info)
            }],
            ids=[f"schema_{table_name}"]
        )
        logger.info(f"已添加 {table_name} 的 schema 資訊")

    def add_query_example(self, intent: str, natural_query: str, sql_query: str, description: str = ""):
        """
        添加查詢範例
        儲存自然語言查詢與對應的 SQL 範例(包含意圖、描述等元資料)
        """
        example_text = f"意圖: {intent}\n自然語言查詢: {natural_query}\n描述: {description}"
        embedding = self.model.encode([example_text])[0].tolist()

        example_id = f"example_{len(self.examples_collection.get()['ids'])}"

        self.examples_collection.add(
            embeddings=[embedding],
            documents=[example_text],
            metadatas=[{
                "intent": intent,
                "natural_query": natural_query,
                "sql_query": sql_query,
                "description": description,
                "type": "example"
            }],
            ids=[example_id]
        )
        logger.info(f"已添加查詢範例: {intent}")

    def search_similar_examples(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """搜尋相似的查詢範例"""
        query_embedding = self.model.encode([query])[0].tolist()

        results = self.examples_collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        examples = []
        for i in range(len(results['ids'][0])):
            examples.append({
                "intent": results['metadatas'][0][i]['intent'],
                "natural_query": results['metadatas'][0][i]['natural_query'],
                "sql_query": results['metadatas'][0][i]['sql_query'],
                "description": results['metadatas'][0][i]['description'],
                "similarity_score": results['distances'][0][i] if 'distances' in results else 0
            })

        return examples

    def search_relevant_schemas(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        搜尋相關的資料表 schema
        根據用戶查詢找出相似的範例
        """
        query_embedding = self.model.encode([query])[0].tolist()

        results = self.schema_collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        schemas = []
        for i in range(len(results['ids'][0])):
            schemas.append({
                "table_name": results['metadatas'][0][i]['table_name'],
                "schema_text": results['documents'][0][i],
                "fields": json.loads(results['metadatas'][0][i]['fields']),
                "similarity_score": results['distances'][0][i] if 'distances' in results else 0
            })

        return schemas

    def _format_schema_text(self, table_name: str, schema_info: Dict[str, Any]) -> str:
        """
        格式化 schema 資訊為文本
        找出相關的資料表結構
        """
        text = f"資料表: {table_name}\n"

        if 'description' in schema_info:
            text += f"描述: {schema_info['description']}\n"

        text += "欄位:\n"
        for field_name, field_info in schema_info.get('fields', {}).items():
            field_type = field_info.get('type', 'unknown')
            field_desc = field_info.get('description', '')
            text += f"- {field_name} ({field_type}): {field_desc}\n"

        if 'relationships' in schema_info:
            text += "關聯:\n"
            for rel in schema_info['relationships']:
                text += f"- {rel}\n"

        return text
