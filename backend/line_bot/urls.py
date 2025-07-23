from django.urls import path
from . import views

app_name = 'line_bot'

urlpatterns = [
    path('webhook/', views.webhook, name='webhook'),
    path('test/', views.test_connection, name='test'),
]