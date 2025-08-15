#!/usr/bin/env python3
"""
測試 RAG 知識庫功能
目的：確保 ChromaDB 向量資料庫和 Sentence Transformers 模型正常運作
"""

import os
import sys
from pathlib import Path

import django

# 設定 Django 環境
sys.path.append(str(Path(__file__).parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
django.setup()

import logging

from rag_system.knowledge_base import CRMKnowledgeBase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_knowledge_base():
    """測試知識庫的核心功能"""

    print("=== RAG 知識庫測試 ===\n")

    # 1. 測試初始化（檢查 ChromaDB 和模型是否正常）
    print("1. 測試知識庫初始化...")
    try:
        kb = CRMKnowledgeBase(persist_directory="test_chroma_db")
        print("✅ ChromaDB 和 Sentence Transformer 初始化成功")
    except Exception as e:
        print(f"❌ 初始化失敗: {e}")
        return False

    # 2. 測試資料表 schema 儲存
    print("\n2. 測試 schema 資訊儲存...")
    try:
        customer_schema = {
            "description": "客戶資料表",
            "fields": {
                "first_name": {"type": "varchar", "description": "客戶名字"},
                "email": {"type": "email", "description": "電子郵件"},
                "age": {"type": "int", "description": "年齡"},
            },
        }

        kb.add_schema_info("customers", customer_schema)
        print("✅ Schema 向量化並儲存成功")

    except Exception as e:
        print(f"❌ Schema 儲存失敗: {e}")
        return False

    # 3. 測試查詢範例儲存
    print("\n3. 測試查詢範例儲存...")
    try:
        kb.add_query_example(
            intent="customer_query",
            natural_query="找出年齡超過30歲的客戶",
            sql_query="SELECT * FROM customers WHERE age > 30",
            description="年齡篩選查詢",
        )
        print("✅ 查詢範例向量化並儲存成功")

    except Exception as e:
        print(f"❌ 查詢範例儲存失敗: {e}")
        return False

    # 4. 測試語義搜尋功能
    print("\n4. 測試語義相似度搜尋...")
    try:
        # 測試相似查詢搜尋
        results = kb.search_similar_examples("查詢35歲以上的使用者", n_results=1)
        if results:
            print(f"✅ 找到相似查詢: {results[0]['natural_query']}")
            print(f"   對應SQL: {results[0]['sql_query']}")
        else:
            print("⚠️  沒有找到相似查詢")

        # 測試相關 schema 搜尋
        schema_results = kb.search_relevant_schemas("客戶年齡", n_results=1)
        if schema_results:
            print(f"✅ 找到相關表格: {schema_results[0]['table_name']}")
        else:
            print("⚠️  沒有找到相關 schema")

    except Exception as e:
        print(f"❌ 語義搜尋失敗: {e}")
        return False

    print("\n=== 知識庫測試完成！所有功能正常 ===")
    return True


if __name__ == "__main__":
    success = test_knowledge_base()
    sys.exit(0 if success else 1)
