from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.views import View
import json
import logging

from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import MessageEvent, TextMessage, TextSendMessage

# 設置日誌
logger = logging.getLogger(__name__)

# LINE Bot 設定 (暫時用假的值，稍後會從環境變數讀取)
LINE_CHANNEL_SECRET = '78379badfa77ed3c62d79cfe9015496c'
LINE_CHANNEL_ACCESS_TOKEN = ''

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)


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
    
    # 簡單的回應邏輯
    reply_message = f"您好！我收到了您的訊息：「{user_message}」"
    
    try:
        # 回覆訊息
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=reply_message)
        )
        logger.info(f"成功回覆訊息給使用者 {user_id}")
        
    except LineBotApiError as e:
        logger.error(f"回覆訊息時發生錯誤: {e.message}")


def test_connection(request):
    """測試連接的簡單端點"""
    return HttpResponse("LINE Bot 服務運行中！")
