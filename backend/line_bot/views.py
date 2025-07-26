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

# 設置日誌
logger = logging.getLogger(__name__)

# LINE Bot 設定 - 從環境變數讀取
# LINE_CHANNEL_SECRET = os.getenv('LINE_CHANNEL_SECRET')
# LINE_CHANNEL_ACCESS_TOKEN = os.getenv('LINE_CHANNEL_ACCESS_TOKEN')

LINE_CHANNEL_SECRET = '78379badfa77ed3c62d79cfe9015496c'
LINE_CHANNEL_ACCESS_TOKEN ='5Eb3R+rxm7mtbyJKwvk3pdRHDx/3nOwVCpNNHIHdntsDZVVWTyGn+24VjTnl9lkbvKD3zcYtVb2sycdwoQrp4p/kTdRLo7NpUweaL8tKkx6vH09Zzhn9TR3Tm2wphhaFKvVAkobIlAZ3OyN0pIwYjAdB04t89/1O/w1cDnyilFU='

# 驗證環境變數是否存在
if not LINE_CHANNEL_SECRET or not LINE_CHANNEL_ACCESS_TOKEN:
    logger.error("LINE Bot 環境變數未設置！請檢查 .env 檔案")
    raise ValueError("LINE Bot 環境變數未設置")

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


@csrf_exempt
def test_webhook(request):
    """測試 Webhook 的簡單端點（跳過簽名驗證）"""
    if request.method == 'POST':
        body = request.body.decode('utf-8')
        logger.info(f"測試 Webhook 收到請求: {body}")
        return HttpResponse("Webhook 測試成功！")
    else:
        return HttpResponse("請使用 POST 方法測試 Webhook")
