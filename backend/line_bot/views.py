import asyncio
import logging
import os
import threading
import time
from pathlib import Path

from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from dotenv import load_dotenv
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import (
    MessageAction,
    MessageEvent,
    QuickReply,
    QuickReplyButton,
    StickerMessage,
    StickerSendMessage,
    TextMessage,
    TextSendMessage,
)

# LINE Bot SDK v3 for loading animation
from linebot.v3.messaging import (
    AsyncApiClient,
    AsyncMessagingApi,
    Configuration,
    ShowLoadingAnimationRequest,
)

# 引入 RAG 系統
from rag_system.query_engine import CRMQueryEngine

# 載入專案根目錄的 .env 檔案
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # 回到專案根目錄
ENV_FILE = PROJECT_ROOT / ".env"
load_dotenv(ENV_FILE)


# 設置日誌
logger = logging.getLogger(__name__)

# LINE Bot 設定 - 從環境變數讀取
LINE_CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET")
LINE_CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")

# 驗證環境變數是否存在
if not LINE_CHANNEL_SECRET or not LINE_CHANNEL_ACCESS_TOKEN:
    logger.error("LINE Bot 環境變數未設置！請檢查 .env 檔案")
    raise ValueError("LINE Bot 環境變數未設置")

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# LINE Bot SDK v3 配置 (延遲初始化避免事件循環問題)
v3_configuration = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)
line_bot_async_api = None

# 初始化 RAG 系統
try:
    query_engine = CRMQueryEngine()
    logger.info("RAG 系統初始化成功")
except Exception as e:
    logger.error(f"RAG 系統初始化失敗: {e!s}")
    query_engine = None

# 用戶處理狀態追蹤
user_processing_status = {}


def show_loading_animation_sync(user_id, loading_seconds=10):
    """
    顯示 LINE 官方載入動畫 (同步版本)
    """

    def run_async_loading():
        try:
            # 在新的事件循環中運行異步函數
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            async def show_animation():
                async_api_client = None
                try:
                    # 在此處初始化 async API
                    async_api_client = AsyncApiClient(v3_configuration)
                    async_messaging_api = AsyncMessagingApi(async_api_client)

                    await async_messaging_api.show_loading_animation(
                        ShowLoadingAnimationRequest(
                            chatId=user_id, loadingSeconds=loading_seconds
                        )
                    )
                finally:
                    # 確保連接被關閉
                    if async_api_client:
                        await async_api_client.close()

            loop.run_until_complete(show_animation())
            loop.close()
            logger.info(f"已顯示載入動畫給用戶 {user_id}，持續 {loading_seconds} 秒")
        except Exception as e:
            logger.error(f"顯示載入動畫失敗: {e}")

    # 在背景執行緒中運行
    threading.Thread(
        target=run_async_loading, daemon=True
    ).start()  # 使用 daemon=True 確保主執行緒結束時，此執行緒也會被強制結束


def send_processing_message(reply_token, user_id) -> None:
    """
    發送正在處理的文字訊息並顯示載入動畫
    """
    try:
        processing_messages = [
            "🤔 讓我想想...",
            "📊 正在查詢資料中...",
            "🔍 搜尋相關資訊...",
            "⚡ 處理中，請稍候...",
        ]
        import random

        message = random.choice(processing_messages)

        # 先發送文字訊息
        line_bot_api.reply_message(reply_token, TextSendMessage(text=message))

        # 然後顯示載入動畫 (必須是5的倍數)
        show_loading_animation_sync(user_id, 10)

        logger.info(f"已發送處理訊息並啟動載入動畫給用戶 {user_id}: {message}")
    except Exception as e:
        logger.error(f"發送處理訊息失敗: {e}")


def is_user_processing(user_id):
    """
    檢查用戶是否正在處理請求
    """
    return user_processing_status.get(user_id, {}).get("processing", False)


def set_user_processing(user_id, status):
    """
    設定用戶處理狀態
    """
    if user_id not in user_processing_status:
        user_processing_status[user_id] = {}
    user_processing_status[user_id]["processing"] = status
    user_processing_status[user_id]["timestamp"] = time.time()


def create_quick_reply_menu():
    """
    建立快速回覆選單
    """
    return QuickReply(
        items=[
            QuickReplyButton(
                action=MessageAction(label="❓ 常見問題", text="顯示常見問題")
            ),
            QuickReplyButton(
                action=MessageAction(label="📚 知識庫", text="系統操作指南")
            ),
            QuickReplyButton(
                action=MessageAction(label="🎫 工單查詢", text="顯示我的工單")
            ),
            QuickReplyButton(
                action=MessageAction(label="🆘 真人客服", text="聯繫真人客服")
            ),
        ]
    )


@csrf_exempt
@require_POST
def webhook(request):
    """LINE Bot Webhook 處理器"""

    # 獲取請求內容
    body = request.body.decode("utf-8")
    signature = request.META.get("HTTP_X_LINE_SIGNATURE", "")

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
        logger.error(f"處理 Webhook 時發生錯誤: {e!s}")
        return HttpResponseBadRequest(f"Error: {e!s}")

    return HttpResponse("OK")


def process_user_query_async(user_id, user_message, reply_token):
    """
    非同步處理用戶查詢
    """
    try:
        # 設定用戶處理狀態為忙碌
        set_user_processing(user_id, True)

        # 使用 RAG 系統處理用戶查詢
        if query_engine:
            rag_response = query_engine.process_query(user_message)

            # 格式化回應訊息
            if rag_response.get("success", False):
                reply_message = format_response_message(rag_response, user_message)

                # 如果有 SQL 查詢結果，記錄日誌
                if rag_response.get("sql_executed"):
                    logger.info(f"執行了 SQL 查詢: {rag_response.get('sql_query', '')}")

            else:
                reply_message = handle_error_response(rag_response)
                logger.warning(
                    f"RAG 系統處理失敗: {rag_response.get('error', 'Unknown error')}"
                )

        else:
            reply_message = "抱歉，AI客服系統暫時無法使用。\n\n請稍後再試，或點選下方選單聯繫人工客服。"
            logger.warning("RAG 系統未初始化，使用預設回應")

        # 發送最終回應（使用 push message 因為 reply token 已使用）
        line_bot_api.push_message(
            user_id,
            TextSendMessage(text=reply_message, quick_reply=create_quick_reply_menu()),
        )
        logger.info(f"成功回覆訊息給使用者 {user_id}: {reply_message[:50]}...")

    except Exception as e:
        logger.error(f"處理用戶查詢時發生錯誤: {e!s}")
        error_message = (
            "🚫 系統發生錯誤，請稍後再試。\n\n如果問題持續存在，請聯繫客服人員。"
        )

        try:
            line_bot_api.push_message(
                user_id,
                TextSendMessage(
                    text=error_message, quick_reply=create_quick_reply_menu()
                ),
            )
        except Exception as push_error:
            logger.error(f"發送錯誤訊息失敗: {push_error!s}")

    finally:
        # 清除用戶處理狀態
        set_user_processing(user_id, False)


def format_response_message(rag_response, user_query):
    """
    格式化回應訊息
    """
    response = rag_response.get("response", "抱歉，無法處理您的查詢。")
    intent = rag_response.get("intent", "")

    # 根據意圖添加適當的 emoji 和格式
    if "faq" in intent:
        formatted_response = f"❓ **常見問題解答**\n\n{response}"
    elif "knowledge" in intent:
        formatted_response = f"📚 **知識庫資訊**\n\n{response}"
    elif "ticket" in intent:
        formatted_response = f"🎫 **工單查詢結果**\n\n{response}"
    else:
        formatted_response = f"🤖 {response}"

    # 添加提示訊息
    formatted_response += (
        "\n\n───────────────\n 您還可以詢問其他問題，或使用下方快速選單"
    )

    return formatted_response


def handle_error_response(rag_response):
    """
    處理錯誤回應
    """
    error_msg = rag_response.get("response", "系統處理異常")
    return f"❌ {error_msg}\n\n請嘗試：\n• 重新描述您的問題\n• 使用下方快速選單\n• 聯繫客服人員"


@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    """處理文字訊息"""
    user_id = event.source.user_id
    user_message = event.message.text.strip()

    # 記錄收到的訊息
    logger.info(f"收到使用者 {user_id} 的訊息: {user_message}")

    # 防呆機制：檢查用戶是否正在處理中
    if is_user_processing(user_id):
        try:
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(
                    text="⏳ 請稍等，我還在處理您上一個問題...\n\n處理完畢後會立即回覆您！",
                    quick_reply=create_quick_reply_menu(),
                ),
            )
            logger.info(f"用戶 {user_id} 處理中，已發送等待訊息")
            return
        except LineBotApiError as e:
            logger.error(f"發送等待訊息失敗: {e.message}")
            return

    # 簡單訊息過濾
    if len(user_message) < 2:
        try:
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(
                    text="🤔 您的訊息太短了，我無法理解。\n\n請詳細描述您的問題，或使用下方選單選擇服務類型。",
                    quick_reply=create_quick_reply_menu(),
                ),
            )
            logger.info(f"用戶 {user_id} 訊息太短，已提示")
            return
        except LineBotApiError as e:
            logger.error(f"回覆訊息失敗: {e.message}")
            return

    # 特殊指令處理
    if user_message.lower() in ["help", "menu", "選單", "幫助"]:
        try:
            help_message = """🤖 **智慧客服小幫手**
            我可以幫您：
            ❓ 解答常見問題
            📚 查詢知識庫資訊  
            🎫 查看工單狀態
            🆘 聯繫人工客服

            請直接輸入您的問題，或使用下方快速選單！"""

            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(
                    text=help_message, quick_reply=create_quick_reply_menu()
                ),
            )
            logger.info(f"已發送幫助訊息給用戶 {user_id}")
            return
        except LineBotApiError as e:
            logger.error(f"發送幫助訊息失敗: {e.message}")
            return

    # 直接顯示載入動畫 (無需額外文字)
    try:
        # 簡單回覆確認收到
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text="成功收到您的訊息嘍！")
        )

        # 顯示載入動畫
        show_loading_animation_sync(user_id, 10)
    except LineBotApiError as e:
        logger.error(f"啟動載入動畫失敗: {e.message}")
        return

    # 使用非同步處理避免阻塞
    processing_thread = threading.Thread(
        target=process_user_query_async, args=(user_id, user_message, event.reply_token)
    )
    processing_thread.start()

    logger.info(f"已開始處理用戶 {user_id} 的查詢: {user_message}")


# 處理貼圖訊息
@handler.add(MessageEvent, message=StickerMessage)
def handle_sticker_message(event):
    """處理貼圖訊息"""
    user_id = event.source.user_id
    logger.info(f"收到使用者 {user_id} 的貼圖")

    try:
        # 回應一個友善的貼圖
        line_bot_api.reply_message(
            event.reply_token,
            [
                StickerSendMessage(
                    package_id="6136",
                    sticker_id="10551379",  # 笑臉貼圖
                ),
                TextSendMessage(
                    text="😊 收到您的貼圖了！\n\n請告訴我您需要什麼幫助？",
                    quick_reply=create_quick_reply_menu(),
                ),
            ],
        )
        logger.info(f"已回應貼圖給用戶 {user_id}")
    except LineBotApiError as e:
        logger.error(f"回應貼圖失敗: {e.message}")


def test_connection(request):
    """測試連接的簡單端點"""
    return HttpResponse("LINE Bot 服務運行中！")
