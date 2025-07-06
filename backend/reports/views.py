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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_demographics_analytics(request):
    """
    客戶人口統計分析 - 基於新增的個人化欄位
    """
    # 取得篩選參數
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    source = request.GET.get('source')
    age_min = request.GET.get('age_min')
    age_max = request.GET.get('age_max')
    gender = request.GET.get('gender')
    
    # 基礎查詢集
    customers_qs = Customer.objects.filter(is_active=True)
    
    # 應用篩選條件
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            customers_qs = customers_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass
    
    if source:
        customers_qs = customers_qs.filter(source=source)
    
    if age_min:
        try:
            customers_qs = customers_qs.filter(age__gte=int(age_min))
        except (ValueError, TypeError):
            pass
    
    if age_max:
        try:
            customers_qs = customers_qs.filter(age__lte=int(age_max))
        except (ValueError, TypeError):
            pass
    
    if gender:
        customers_qs = customers_qs.filter(gender=gender)
    
    # 1. 年齡分析
    age_analysis = []
    age_groups = [
        ('18-25', 18, 25),
        ('26-35', 26, 35),
        ('36-45', 36, 45),
        ('46-55', 46, 55),
        ('56+', 56, 100)
    ]
    
    for group_name, min_age, max_age in age_groups:
        group_customers = customers_qs.filter(age__gte=min_age, age__lte=max_age)
        total_spent = 0
        total_orders = 0
        
        for customer in group_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum('total'))['total__sum'] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()
        
        count = group_customers.count()
        age_analysis.append({
            'age_group': group_name,
            'count': count,
            'total_spent': float(total_spent),
            'avg_spent': float(total_spent / count) if count > 0 else 0.0
        })
    
    # 2. 性別分析
    gender_choices = [
        ('male', '男性'),
        ('female', '女性'),
        ('other', '其他'),
        ('prefer_not_to_say', '不願透露')
    ]
    
    gender_analysis = []
    for gender_code, gender_display in gender_choices:
        gender_customers = customers_qs.filter(gender=gender_code)
        total_spent = 0
        total_orders = 0
        
        for customer in gender_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum('total'))['total__sum'] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()
        
        count = gender_customers.count()
        gender_analysis.append({
            'gender': gender_code,
            'gender_display': gender_display,
            'count': count,
            'total_spent': float(total_spent),
            'avg_spent': float(total_spent / count) if count > 0 else 0.0,
            'avg_orders': float(total_orders / count) if count > 0 else 0.0
        })
    
    # 3. 產品偏好分析
    product_categories = [
        '電子產品', '服飾配件', '居家用品', '美妝保養', '運動健身',
        '書籍文具', '食品飲料', '旅遊票券', '汽車用品', '寵物用品'
    ]
    
    product_preferences = []
    total_customers_with_preferences = customers_qs.exclude(product_categories_interest__exact='[]').exclude(product_categories_interest__isnull=True).count()
    
    for category in product_categories:
        # 使用 JSON 查詢來找到包含此類別的客戶
        interested_customers = customers_qs.extra(
            where=["JSON_SEARCH(product_categories_interest, 'one', %s) IS NOT NULL"],
            params=[category]
        )
        
        total_spent = 0
        for customer in interested_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum('total'))['total__sum'] or 0
            total_spent += customer_total
        
        count = interested_customers.count()
        product_preferences.append({
            'category': category,
            'count': count,
            'percentage': float(count / total_customers_with_preferences * 100) if total_customers_with_preferences > 0 else 0.0,
            'avg_spent': float(total_spent / count) if count > 0 else 0.0,
            'total_spent': float(total_spent)
        })
    
    # 4. 季節性偏好分析
    seasonal_choices = [
        ('spring', '春季購買'),
        ('summer', '夏季購買'),
        ('autumn', '秋季購買'),
        ('winter', '冬季購買'),
        ('year_round', '全年均勻')
    ]
    
    seasonal_analysis = []
    total_customers_with_seasonal = customers_qs.exclude(seasonal_purchase_pattern__isnull=True).exclude(seasonal_purchase_pattern__exact='').count()
    
    for season_code, season_display in seasonal_choices:
        season_customers = customers_qs.filter(seasonal_purchase_pattern=season_code)
        total_spent = 0
        total_orders = 0
        
        for customer in season_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum('total'))['total__sum'] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()
        
        count = season_customers.count()
        seasonal_analysis.append({
            'season': season_code,
            'season_display': season_display,
            'count': count,
            'percentage': float(count / total_customers_with_seasonal * 100) if total_customers_with_seasonal > 0 else 0.0,
            'avg_spent': float(total_spent / count) if count > 0 else 0.0,
            'total_spent': float(total_spent),
            'avg_orders': float(total_orders / count) if count > 0 else 0.0
        })
    
    # 5. 客戶細分矩陣數據
    customer_segments = []
    
    # 計算客戶等級
    def get_customer_tier(total_spent, total_orders):
        if total_spent >= 60000:
            return '白金客戶'
        elif total_spent >= 20000 and total_orders >= 1:
            return '黃金客戶'
        elif total_spent >= 5000 and total_orders >= 2:
            return '白銀客戶'
        elif total_spent > 0 and total_orders >= 1:
            return '一般客戶'
        else:
            return '潛在客戶'
    
    for customer in customers_qs.filter(age__isnull=False)[:100]:  # 限制返回數量以提高性能
        customer_orders = Order.objects.filter(customer=customer)
        total_spent = customer_orders.aggregate(Sum('total'))['total__sum'] or 0
        total_orders = customer_orders.count()
        
        customer_segments.append({
            'age': customer.age,
            'total_spent': float(total_spent),
            'total_orders': total_orders,
            'full_name': customer.full_name,
            'gender': customer.gender or 'unknown',
            'tier': get_customer_tier(total_spent, total_orders)
        })
    
    # 6. 數據概覽
    overview = {
        'total_customers': customers_qs.count(),
        'customers_with_age': customers_qs.exclude(age__isnull=True).count(),
        'customers_with_gender': customers_qs.exclude(gender__isnull=True).exclude(gender__exact='').count(),
        'customers_with_preferences': total_customers_with_preferences,
        'customers_with_seasonal': total_customers_with_seasonal,
        'avg_age': float(customers_qs.exclude(age__isnull=True).aggregate(Avg('age'))['age__avg'] or 0),
    }
    
    # 計算資料完整度
    total_fields = 4  # age, gender, product_categories_interest, seasonal_purchase_pattern
    completed_fields = 0
    if overview['customers_with_age'] > 0:
        completed_fields += 1
    if overview['customers_with_gender'] > 0:
        completed_fields += 1
    if overview['customers_with_preferences'] > 0:
        completed_fields += 1
    if overview['customers_with_seasonal'] > 0:
        completed_fields += 1
    
    overview['data_completeness'] = float(completed_fields / total_fields * 100)
    
    analytics = {
        'age_analysis': age_analysis,
        'gender_analysis': gender_analysis,
        'product_preferences': product_preferences,
        'seasonal_analysis': seasonal_analysis,
        'customer_segments': customer_segments,
        'overview': overview
    }
    
    return Response(analytics)
