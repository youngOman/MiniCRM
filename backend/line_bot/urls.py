from django.urls import path
from . import views

app_name = 'line_bot'

urlpatterns = [
    path('webhook/', views.webhook, name='webhook'), # LINE Bot Webhook 處理器
    path('test/', views.test_connection, name='test'), # 最基本的連接測試
    path('test-webhook/', views.test_webhook, name='test_webhook'),  # 模擬 Webhook 但跳過驗證
]
