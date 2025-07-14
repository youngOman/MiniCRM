from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('trends/', views.trend_analysis, name='trend_analysis'),
    path('customers/', views.customer_analytics, name='customer_analytics'),
    path('customer-demographics/', views.customer_demographics_analytics, name='customer_demographics_analytics'),
    path('customer-clv/', views.customer_clv_analytics, name='customer_clv_analytics'),
    path('revenue/', views.revenue_analytics, name='revenue_analytics'),
]