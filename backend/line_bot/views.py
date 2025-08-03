from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.views import View
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# 載入專案根目錄的 .env 檔案
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # 回到專案根目錄
ENV_FILE = PROJECT_ROOT / '.env'
load_dotenv(ENV_FILE)

from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import MessageEvent, TextMessage, TextSendMessage

# 引入 RAG 系統
from rag_system.query_engine import CRMQueryEngine

# 設置日誌
logger = logging.getLogger(__name__)

# LINE Bot 設定 - 從環境變數讀取
LINE_CHANNEL_SECRET = os.getenv('LINE_CHANNEL_SECRET')
LINE_CHANNEL_ACCESS_TOKEN = os.getenv('LINE_CHANNEL_ACCESS_TOKEN')

# 驗證環境變數是否存在
if not LINE_CHANNEL_SECRET or not LINE_CHANNEL_ACCESS_TOKEN:
    logger.error("LINE Bot 環境變數未設置！請檢查 .env 檔案")
    raise ValueError("LINE Bot 環境變數未設置")

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# 初始化 RAG 系統
try:
    query_engine = CRMQueryEngine()
    logger.info("RAG 系統初始化成功")
except Exception as e:
    logger.error(f"RAG 系統初始化失敗: {str(e)}")
    query_engine = None


@csrf_exempt
@require_POST
def webhook(request):
    """LINE Bot Webhook 處理器"""
    
    # 獲取請求內容
    body = request.body.decode('utf-8')
    signature = request.META.get('HTTP_X_LINE_SIGNATURE', '')
    
    # 記錄接收到的請求
    logger.info(f"收到 LINE Webhook 請求: {body}")
    logger.info(f"Signature: {signature}")
    
    try:
        # 驗證簽名並處理事件
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("無效的簽名")
        return HttpResponseBadRequest("Invalid signature")
    except Exception as e:
        logger.error(f"處理 Webhook 時發生錯誤: {str(e)}")
        return HttpResponseBadRequest(f"Error: {str(e)}")
    
    return HttpResponse("OK")


@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    """處理文字訊息"""
    user_id = event.source.user_id
    user_message = event.message.text
    
    # 記錄收到的訊息
    logger.info(f"收到使用者 {user_id} 的訊息: {user_message}")
    
    # 使用 RAG 系統處理用戶查詢
    if query_engine:
        try:
            # 呼叫 RAG 系統處理查詢
            rag_response = query_engine.process_query(user_message)
            
            # 格式化回應訊息
            if rag_response.get('success', False):
                reply_message = rag_response.get('response', '抱歉，無法處理您的查詢。')
                
                # 如果有 SQL 查詢結果，可以加入更多資訊
                if rag_response.get('sql_executed'):
                    logger.info(f"執行了 SQL 查詢: {rag_response.get('sql_query', '')}")
                    
            else:
                reply_message = rag_response.get('response', '抱歉，系統暫時無法處理您的查詢，請稍後再試。')
                logger.warning(f"RAG 系統處理失敗: {rag_response.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"RAG 系統處理查詢時發生錯誤: {str(e)}")
            reply_message = "抱歉，系統暫時無法處理您的查詢，請稍後再試。"
    else:
        # 如果 RAG 系統未初始化，使用預設回應
        reply_message = "抱歉，智能客服系統暫時無法使用，請聯繫人工客服。"
        logger.warning("RAG 系統未初始化，使用預設回應")
    
    try:
        # 回覆訊息
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=reply_message)
        )
        logger.info(f"成功回覆訊息給使用者 {user_id}: {reply_message[:50]}...")
        
    except LineBotApiError as e:
        logger.error(f"回覆訊息時發生錯誤: {e.message}")


def test_connection(request):
    """測試連接的簡單端點"""
    return HttpResponse("LINE Bot 服務運行中！")

