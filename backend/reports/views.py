from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from django.utils import timezone
from datetime import datetime, timedelta
from customers.models import Customer
from orders.models import Order
from transactions.models import Transaction


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    一鍵產出關鍵指標統計
    """
    # 取得篩選參數
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    source = request.GET.get('source')
    tags = request.GET.get('tags')
    
    # 基礎查詢集
    customers_qs = Customer.objects.filter(is_active=True)
    orders_qs = Order.objects.all()
    transactions_qs = Transaction.objects.filter(status='completed')
    
    # 應用篩選條件
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
            orders_qs = orders_qs.filter(order_date__date__gte=date_from)
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__lte=date_to)
            orders_qs = orders_qs.filter(order_date__date__lte=date_to)
            transactions_qs = transactions_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass
    
    if source:
        customers_qs = customers_qs.filter(source=source)
        orders_qs = orders_qs.filter(customer__source=source)
        transactions_qs = transactions_qs.filter(customer__source=source)
    
    if tags:
        customers_qs = customers_qs.filter(tags__icontains=tags)
        orders_qs = orders_qs.filter(customer__tags__icontains=tags)
        transactions_qs = transactions_qs.filter(customer__tags__icontains=tags)
    
    # 計算關鍵指標
    stats = {
        'overview': {
            'total_customers': customers_qs.count(),
            'total_orders': orders_qs.count(),
            'total_transactions': transactions_qs.count(),
            'total_revenue': float(transactions_qs.aggregate(Sum('amount'))['amount__sum'] or 0),
            'net_revenue': float(transactions_qs.aggregate(Sum('net_amount'))['net_amount__sum'] or 0),
            'average_order_value': float(orders_qs.aggregate(Avg('total'))['total__avg'] or 0),
            'conversion_rate': round((orders_qs.count() / max(customers_qs.count(), 1)) * 100, 2),
        },
        'customer_stats': {
            'new_customers_today': customers_qs.filter(created_at__date=timezone.now().date()).count(),
            'new_customers_this_month': customers_qs.filter(created_at__month=timezone.now().month).count(),
            'avg_customer_value': float(transactions_qs.values('customer').annotate(
                customer_total=Sum('amount')).aggregate(Avg('customer_total'))['customer_total__avg'] or 0),
            'customer_sources': list(customers_qs.values('source').annotate(count=Count('id')).order_by('-count')),
        },
        'order_stats': {
            'orders_today': orders_qs.filter(order_date__date=timezone.now().date()).count(),
            'orders_this_month': orders_qs.filter(order_date__month=timezone.now().month).count(),
            'pending_orders': orders_qs.filter(status='pending').count(),
            'order_status_distribution': list(orders_qs.values('status').annotate(count=Count('id')).order_by('-count')),
        },
        'transaction_stats': {
            'transactions_today': transactions_qs.filter(created_at__date=timezone.now().date()).count(),
            'transactions_this_month': transactions_qs.filter(created_at__month=timezone.now().month).count(),
            'total_fees': float(transactions_qs.aggregate(Sum('fee_amount'))['fee_amount__sum'] or 0),
            'payment_methods': list(transactions_qs.values('payment_method').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-total_amount')),
        }
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trend_analysis(request):
    """
    趨勢分析 - 按日期分組的統計
    """
    period = request.GET.get('period', 'month')  # day, month, year
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # 決定時間截取函數
    if period == 'day':
        trunc_func = TruncDate
    elif period == 'month':
        trunc_func = TruncMonth
    else:
        trunc_func = TruncYear
    
    # 基礎查詢
    customers_qs = Customer.objects.all()
    orders_qs = Order.objects.all()
    transactions_qs = Transaction.objects.filter(status='completed')
    
    # 應用日期篩選
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
            orders_qs = orders_qs.filter(order_date__date__gte=date_from)
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__lte=date_to)
            orders_qs = orders_qs.filter(order_date__date__lte=date_to)
            transactions_qs = transactions_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass
    
    # 計算趨勢數據
    customer_trend = list(customers_qs.annotate(
        date=trunc_func('created_at')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date'))
    
    order_trend = list(orders_qs.annotate(
        date=trunc_func('order_date')
    ).values('date').annotate(
        count=Count('id'),
        total_amount=Sum('total')
    ).order_by('date'))
    
    transaction_trend = list(transactions_qs.annotate(
        date=trunc_func('created_at')
    ).values('date').annotate(
        count=Count('id'),
        total_amount=Sum('amount'),
        total_fees=Sum('fee_amount')
    ).order_by('date'))
    
    trends = {
        'customer_trend': customer_trend,
        'order_trend': order_trend,
        'transaction_trend': transaction_trend,
        'period': period
    }
    
    return Response(trends)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_analytics(request):
    """
    客戶分析報表
    """
    # 客戶價值分析
    customer_value_segments = Customer.objects.filter(is_active=True).extra(
        select={
            'total_spent': 'SELECT COALESCE(SUM(total), 0) FROM orders_order WHERE customer_id = customers_customer.id'
        }
    ).extra(
        where=["total_spent > 0"]
    ).values('id', 'first_name', 'last_name', 'email', 'total_spent').order_by('-total_spent')[:10]
    
    # 客戶來源分析
    source_analysis = list(Customer.objects.values('source').annotate(
        count=Count('id'),
        total_orders=Count('orders', filter=Q(orders__isnull=False)),
        avg_order_value=Avg('orders__total')
    ).order_by('-count'))
    
    # 客戶活躍度分析
    now = timezone.now()
    activity_analysis = {
        'active_30_days': Customer.objects.filter(
            orders__order_date__gte=now - timedelta(days=30)
        ).distinct().count(),
        'active_90_days': Customer.objects.filter(
            orders__order_date__gte=now - timedelta(days=90)
        ).distinct().count(),
        'inactive_customers': Customer.objects.filter(
            Q(orders__isnull=True) | Q(orders__order_date__lt=now - timedelta(days=90))
        ).distinct().count(),
    }
    
    analytics = {
        'top_customers': list(customer_value_segments),
        'source_analysis': source_analysis,
        'activity_analysis': activity_analysis,
    }
    
    return Response(analytics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_analytics(request):
    """
    營收分析報表
    """
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    transactions_qs = Transaction.objects.filter(status='completed')
    
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            transactions_qs = transactions_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass
    
    # 營收統計
    revenue_stats = transactions_qs.aggregate(
        total_revenue=Sum('amount'),
        net_revenue=Sum('net_amount'),
        total_fees=Sum('fee_amount'),
        transaction_count=Count('id')
    )
    
    # 按付款方式分析
    payment_method_analysis = list(transactions_qs.values('payment_method').annotate(
        count=Count('id'),
        total_amount=Sum('amount'),
        avg_amount=Avg('amount'),
        total_fees=Sum('fee_amount')
    ).order_by('-total_amount'))
    
    # 按交易類型分析
    transaction_type_analysis = list(transactions_qs.values('transaction_type').annotate(
        count=Count('id'),
        total_amount=Sum('amount'),
        avg_amount=Avg('amount')
    ).order_by('-total_amount'))
    
    analytics = {
        'revenue_overview': {
            'total_revenue': float(revenue_stats['total_revenue'] or 0),
            'net_revenue': float(revenue_stats['net_revenue'] or 0),
            'total_fees': float(revenue_stats['total_fees'] or 0),
            'transaction_count': revenue_stats['transaction_count'],
            'avg_transaction_value': float(revenue_stats['total_revenue'] or 0) / max(revenue_stats['transaction_count'], 1)
        },
        'payment_method_breakdown': payment_method_analysis,
        'transaction_type_breakdown': transaction_type_analysis,
    }
    
    return Response(analytics)
