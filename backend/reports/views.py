from datetime import datetime, timedelta

from customers.models import Customer
from django.db.models import Avg, Count, DecimalField, F, Q, Sum, Value
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncYear
from django.utils import timezone
from orders.models import Order
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from transactions.models import Transaction


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    一鍵產出關鍵指標統計
    """
    # 取得篩選參數
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    source = request.GET.get("source")
    tags = request.GET.get("tags")

    # 基礎查詢集
    customers_qs = Customer.objects.filter(is_active=True)
    orders_qs = Order.objects.all()
    transactions_qs = Transaction.objects.filter(status="completed")

    # 應用篩選條件
    if date_from:
        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
            orders_qs = orders_qs.filter(order_date__date__gte=date_from)
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass

    if date_to:
        try:
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
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
        "overview": {
            "total_customers": customers_qs.count(),
            "total_orders": orders_qs.count(),
            "total_transactions": transactions_qs.count(),
            "total_revenue": float(
                transactions_qs.aggregate(Sum("amount"))["amount__sum"] or 0
            ),
            "net_revenue": float(
                transactions_qs.aggregate(Sum("net_amount"))["net_amount__sum"] or 0
            ),
            "average_order_value": float(
                orders_qs.aggregate(Avg("total"))["total__avg"] or 0
            ),  # 計算特定時間範圍，所有訂單的平均訂單價值
            "conversion_rate": round(
                (orders_qs.count() / max(customers_qs.count(), 1)) * 100, 2
            ),
        },
        "customer_stats": {
            "new_customers_today": customers_qs.filter(
                created_at__date=timezone.now().date()
            ).count(),
            "new_customers_this_month": customers_qs.filter(
                created_at__month=timezone.now().month
            ).count(),
            "avg_customer_value": float(
                transactions_qs.values("customer")
                .annotate(customer_total=Sum("amount"))
                .aggregate(Avg("customer_total"))["customer_total__avg"]
                or 0
            ),
            "customer_sources": list(
                customers_qs.values("source")
                .annotate(count=Count("id"))
                .order_by("-count")
            ),
            # CLV 相關指標
            "avg_clv": float(calculate_avg_clv(customers_qs)),  # 平均客戶生命週期價值
            "avg_order_value": float(
                orders_qs.aggregate(Avg("total"))["total__avg"] or 0
            ),  # 計算該客戶的平均訂單價值
            "avg_purchase_frequency": float(
                calculate_avg_purchase_frequency(customers_qs)
            ),  # 平均購買頻率
            "high_value_customers": customers_qs.annotate(
                total_spent=Coalesce(
                    Sum("orders__total"), Value(0), output_field=DecimalField()
                )
            )
            .filter(total_spent__gte=10000)
            .count(),
        },
        "order_stats": {
            "orders_today": orders_qs.filter(
                order_date__date=timezone.now().date()
            ).count(),
            "orders_this_month": orders_qs.filter(
                order_date__month=timezone.now().month
            ).count(),
            "pending_orders": orders_qs.filter(status="pending").count(),
            "order_status_distribution": list(
                orders_qs.values("status")
                .annotate(count=Count("id"))
                .order_by("-count")
            ),
        },
        "transaction_stats": {
            "transactions_today": transactions_qs.filter(
                created_at__date=timezone.now().date()
            ).count(),
            "transactions_this_month": transactions_qs.filter(
                created_at__month=timezone.now().month
            ).count(),
            "total_fees": float(
                transactions_qs.aggregate(Sum("fee_amount"))["fee_amount__sum"] or 0
            ),
            "payment_methods": list(
                transactions_qs.values("payment_method")
                .annotate(count=Count("id"), total_amount=Sum("amount"))
                .order_by("-total_amount")
            ),
        },
    }

    return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def trend_analysis(request):
    """
    趨勢分析 - 按日期分組的統計
    """
    period = request.GET.get("period", "month")  # day, month, year
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")

    # 決定時間截取函數
    if period == "day":
        trunc_func = TruncDate
    elif period == "month":
        trunc_func = TruncMonth
    else:
        trunc_func = TruncYear

    # 基礎查詢
    customers_qs = Customer.objects.all()
    orders_qs = Order.objects.all()
    transactions_qs = Transaction.objects.filter(status="completed")

    # 應用日期篩選
    if date_from:
        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
            orders_qs = orders_qs.filter(order_date__date__gte=date_from)
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass

    if date_to:
        try:
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__lte=date_to)
            orders_qs = orders_qs.filter(order_date__date__lte=date_to)
            transactions_qs = transactions_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass

    # 計算趨勢數據
    customer_trend = list(
        customers_qs.annotate(date=trunc_func("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    order_trend = list(
        orders_qs.annotate(date=trunc_func("order_date"))
        .values("date")
        .annotate(count=Count("id"), total_amount=Sum("total"))
        .order_by("date")
    )

    transaction_trend = list(
        transactions_qs.annotate(date=trunc_func("created_at"))
        .values("date")
        .annotate(
            count=Count("id"), total_amount=Sum("amount"), total_fees=Sum("fee_amount")
        )
        .order_by("date")
    )

    trends = {
        "customer_trend": customer_trend,
        "order_trend": order_trend,
        "transaction_trend": transaction_trend,
        "period": period,
    }

    return Response(trends)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_analytics(request):
    """
    客戶分析報表
    """
    # 客戶價值分析
    customer_value_segments = (
        Customer.objects.filter(is_active=True)
        .extra(
            select={
                "total_spent": "SELECT COALESCE(SUM(total), 0) FROM orders_order WHERE customer_id = customers_customer.id"
            }
        )
        .extra(where=["total_spent > 0"])
        .values("id", "first_name", "last_name", "email", "total_spent")
        .order_by("-total_spent")[:10]
    )

    # 客戶來源分析
    source_analysis = list(
        Customer.objects.values("source")
        .annotate(
            count=Count("id"),
            total_orders=Count("orders", filter=Q(orders__isnull=False)),
            avg_order_value=Avg("orders__total"),
        )
        .order_by("-count")
    )

    # 客戶活躍度分析
    now = timezone.now()
    activity_analysis = {
        "active_30_days": Customer.objects.filter(
            orders__order_date__gte=now - timedelta(days=30)
        )
        .distinct()
        .count(),
        "active_90_days": Customer.objects.filter(
            orders__order_date__gte=now - timedelta(days=90)
        )
        .distinct()
        .count(),
        "inactive_customers": Customer.objects.filter(
            Q(orders__isnull=True) | Q(orders__order_date__lt=now - timedelta(days=90))
        )
        .distinct()
        .count(),
    }

    analytics = {
        "top_customers": list(customer_value_segments),
        "source_analysis": source_analysis,
        "activity_analysis": activity_analysis,
    }

    return Response(analytics)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_analytics(request):
    """
    營收分析報表
    """
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")

    transactions_qs = Transaction.objects.filter(status="completed")

    if date_from:
        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            transactions_qs = transactions_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass

    if date_to:
        try:
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
            transactions_qs = transactions_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass

    # 營收統計
    revenue_stats = transactions_qs.aggregate(
        total_revenue=Sum("amount"),
        net_revenue=Sum("net_amount"),
        total_fees=Sum("fee_amount"),
        transaction_count=Count("id"),
    )

    # 按付款方式分析
    payment_method_analysis = list(
        transactions_qs.values("payment_method")
        .annotate(
            count=Count("id"),
            total_amount=Sum("amount"),
            avg_amount=Avg("amount"),
            total_fees=Sum("fee_amount"),
        )
        .order_by("-total_amount")
    )

    # 按交易類型分析
    transaction_type_analysis = list(
        transactions_qs.values("transaction_type")
        .annotate(
            count=Count("id"), total_amount=Sum("amount"), avg_amount=Avg("amount")
        )
        .order_by("-total_amount")
    )

    analytics = {
        "revenue_overview": {
            "total_revenue": float(revenue_stats["total_revenue"] or 0),
            "net_revenue": float(revenue_stats["net_revenue"] or 0),
            "total_fees": float(revenue_stats["total_fees"] or 0),
            "transaction_count": revenue_stats["transaction_count"],
            "avg_transaction_value": float(revenue_stats["total_revenue"] or 0)
            / max(revenue_stats["transaction_count"], 1),
        },
        "payment_method_breakdown": payment_method_analysis,
        "transaction_type_breakdown": transaction_type_analysis,
    }

    return Response(analytics)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_demographics_analytics(request):
    """
    客戶人口統計分析 - 基於新增的個人化欄位
    """
    # 取得篩選參數
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    source = request.GET.get("source")
    age_min = request.GET.get("age_min")
    age_max = request.GET.get("age_max")
    gender = request.GET.get("gender")

    # 基礎查詢集
    customers_qs = Customer.objects.filter(is_active=True)

    # 應用篩選條件
    if date_from:
        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass

    if date_to:
        try:
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
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
        ("18-25", 18, 25),
        ("26-35", 26, 35),
        ("36-45", 36, 45),
        ("46-55", 46, 55),
        ("56+", 56, 100),
    ]

    for group_name, min_age, max_age in age_groups:
        group_customers = customers_qs.filter(age__gte=min_age, age__lte=max_age)
        total_spent = 0
        total_orders = 0

        for customer in group_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()

        count = group_customers.count()
        age_analysis.append(
            {
                "age_group": group_name,
                "count": count,
                "total_spent": float(total_spent),
                "avg_spent": float(total_spent / count) if count > 0 else 0.0,
            }
        )

    # 2. 性別分析
    gender_choices = [
        ("male", "男性"),
        ("female", "女性"),
        ("other", "其他"),
        ("prefer_not_to_say", "不願透露"),
    ]

    gender_analysis = []
    for gender_code, gender_display in gender_choices:
        gender_customers = customers_qs.filter(gender=gender_code)
        total_spent = 0
        total_orders = 0

        for customer in gender_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()

        count = gender_customers.count()
        gender_analysis.append(
            {
                "gender": gender_code,
                "gender_display": gender_display,
                "count": count,
                "total_spent": float(total_spent),
                "avg_spent": float(total_spent / count) if count > 0 else 0.0,
                "avg_orders": float(total_orders / count) if count > 0 else 0.0,
            }
        )

    # 3. 產品偏好分析
    product_categories = [
        "電子產品",
        "服飾配件",
        "居家用品",
        "美妝保養",
        "運動健身",
        "書籍文具",
        "食品飲料",
        "旅遊票券",
        "汽車用品",
        "寵物用品",
    ]

    product_preferences = []
    total_customers_with_preferences = (
        customers_qs.exclude(product_categories_interest__exact="[]")
        .exclude(product_categories_interest__isnull=True)
        .count()
    )

    for category in product_categories:
        # 使用 JSON 查詢來找到包含此類別的客戶
        interested_customers = customers_qs.extra(
            where=["JSON_SEARCH(product_categories_interest, 'one', %s) IS NOT NULL"],
            params=[category],
        )

        total_spent = 0
        for customer in interested_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
            total_spent += customer_total

        count = interested_customers.count()
        product_preferences.append(
            {
                "category": category,
                "count": count,
                "percentage": float(count / total_customers_with_preferences * 100)
                if total_customers_with_preferences > 0
                else 0.0,
                "avg_spent": float(total_spent / count) if count > 0 else 0.0,
                "total_spent": float(total_spent),
            }
        )

    # 4. 季節性偏好分析
    seasonal_choices = [
        ("spring", "春季購買"),
        ("summer", "夏季購買"),
        ("autumn", "秋季購買"),
        ("winter", "冬季購買"),
        ("year_round", "全年均勻"),
    ]

    seasonal_analysis = []
    total_customers_with_seasonal = (
        customers_qs.exclude(seasonal_purchase_pattern__isnull=True)
        .exclude(seasonal_purchase_pattern__exact="")
        .count()
    )

    for season_code, season_display in seasonal_choices:
        season_customers = customers_qs.filter(seasonal_purchase_pattern=season_code)
        total_spent = 0
        total_orders = 0

        for customer in season_customers:
            customer_orders = Order.objects.filter(customer=customer)
            customer_total = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
            total_spent += customer_total
            total_orders += customer_orders.count()

        count = season_customers.count()
        seasonal_analysis.append(
            {
                "season": season_code,
                "season_display": season_display,
                "count": count,
                "percentage": float(count / total_customers_with_seasonal * 100)
                if total_customers_with_seasonal > 0
                else 0.0,
                "avg_spent": float(total_spent / count) if count > 0 else 0.0,
                "total_spent": float(total_spent),
                "avg_orders": float(total_orders / count) if count > 0 else 0.0,
            }
        )

    # 5. 客戶細分矩陣數據
    customer_segments = []

    # 計算客戶等級
    def get_customer_tier(total_spent, total_orders):
        if total_spent >= 60000:
            return "白金客戶"
        if total_spent >= 20000 and total_orders >= 1:
            return "黃金客戶"
        if total_spent >= 5000 and total_orders >= 2:
            return "白銀客戶"
        if total_spent > 0 and total_orders >= 1:
            return "一般客戶"
        return "潛在客戶"

    for customer in customers_qs.filter(age__isnull=False)[
        :100
    ]:  # 限制返回數量以提高性能
        customer_orders = Order.objects.filter(customer=customer)
        total_spent = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
        total_orders = customer_orders.count()

        customer_segments.append(
            {
                "age": customer.age,
                "total_spent": float(total_spent),
                "total_orders": total_orders,
                "full_name": customer.full_name,
                "gender": customer.gender or "unknown",
                "tier": get_customer_tier(total_spent, total_orders),
            }
        )

    # 6. 客戶來源分析
    customer_sources = list(
        customers_qs.values("source").annotate(count=Count("id")).order_by("-count")
    )

    # 7. 客戶等級分析
    customer_tiers = []
    tier_counts = {
        "白金客戶": 0,
        "黃金客戶": 0,
        "白銀客戶": 0,
        "一般客戶": 0,
        "潛在客戶": 0,
    }
    tier_colors = {
        "白金客戶": "#8B5CF6",
        "黃金客戶": "#F59E0B",
        "白銀客戶": "#6B7280",
        "一般客戶": "#10B981",
        "潛在客戶": "#EF4444",
    }

    for customer in customers_qs:
        customer_orders = Order.objects.filter(customer=customer)
        total_spent = customer_orders.aggregate(Sum("total"))["total__sum"] or 0
        total_orders = customer_orders.count()

        # 計算客戶等級
        if total_spent >= 60000:
            tier = "白金客戶"
        elif total_spent >= 20000 and total_orders >= 1:
            tier = "黃金客戶"
        elif total_spent >= 5000 and total_orders >= 2:
            tier = "白銀客戶"
        elif total_spent > 0 and total_orders >= 1:
            tier = "一般客戶"
        else:
            tier = "潛在客戶"

        tier_counts[tier] += 1

    for tier, count in tier_counts.items():
        if count > 0:
            customer_tiers.append(
                {"tier": tier, "count": count, "color": tier_colors[tier]}
            )

    # 8. 數據概覽
    overview = {
        "total_customers": customers_qs.count(),
        "customers_with_age": customers_qs.exclude(age__isnull=True).count(),
        "customers_with_gender": customers_qs.exclude(gender__isnull=True)
        .exclude(gender__exact="")
        .count(),
        "customers_with_preferences": total_customers_with_preferences,
        "customers_with_seasonal": total_customers_with_seasonal,
        "avg_age": float(
            customers_qs.exclude(age__isnull=True).aggregate(Avg("age"))["age__avg"]
            or 0
        ),
    }

    # 計算資料完整度
    total_fields = (
        4  # age, gender, product_categories_interest, seasonal_purchase_pattern
    )
    completed_fields = 0
    if overview["customers_with_age"] > 0:
        completed_fields += 1
    if overview["customers_with_gender"] > 0:
        completed_fields += 1
    if overview["customers_with_preferences"] > 0:
        completed_fields += 1
    if overview["customers_with_seasonal"] > 0:
        completed_fields += 1

    overview["data_completeness"] = float(completed_fields / total_fields * 100)

    analytics = {
        "age_analysis": age_analysis,
        "gender_analysis": gender_analysis,
        "product_preferences": product_preferences,
        "seasonal_analysis": seasonal_analysis,
        "customer_segments": customer_segments,
        "customer_sources": customer_sources,
        "customer_tiers": customer_tiers,
        "overview": overview,
    }

    return Response(analytics)


def calculate_avg_clv(customers_qs):
    """
    計算平均客戶生命週期價值 (CLV)

    正確公式：
    1. 平均客單價 = 該期間總購買金額 ÷ 該期間總訂單數
    2. 平均消費頻率 = 該期間總訂單數 ÷ 該期間消費客戶數
    3. 顧客價值 = 平均消費頻率 × 平均客單價
    4. 平均顧客壽命 = 每位顧客的消費時間長度 ÷ 顧客數
    5. CLV = 顧客價值 × 平均顧客壽命
    """

    customers_with_orders = customers_qs.filter(orders__isnull=False).distinct()

    if not customers_with_orders.exists():
        return 0

    # 1. 計算平均客單價 (Average Purchase Value)
    # 該期間總購買金額 ÷ 該期間總訂單數
    total_revenue = (
        Order.objects.filter(customer__in=customers_with_orders).aggregate(
            Sum("total")
        )["total__sum"]
        or 0
    )
    total_orders = Order.objects.filter(customer__in=customers_with_orders).count()
    avg_purchase_value = float(total_revenue) / total_orders if total_orders > 0 else 0

    # 2. 計算平均消費頻率 (Average Purchase Frequency)
    # 該期間總訂單數 ÷ 該期間消費客戶數
    avg_purchase_frequency = float(total_orders) / customers_with_orders.count()

    # 3. 計算顧客價值 (Customer Value)
    # 平均消費頻率 × 平均客單價
    customer_value = avg_purchase_frequency * avg_purchase_value

    # 4. 計算平均顧客壽命 (Average Customer Lifespan)
    # 使用更合理的壽命計算邏輯，避免數字過大
    total_lifespan_days = 0
    lifespan_customer_count = 0

    for customer in customers_with_orders:
        customer_orders = customer.orders.all()
        if customer_orders.count() > 1:  # 至少要有2筆訂單才能計算壽命
            first_order = customer_orders.earliest("order_date")
            last_order = customer_orders.latest("order_date")
            lifespan_days = (
                last_order.order_date.date() - first_order.order_date.date()
            ).days
            # 限制最大壽命為2年（730天），避免測試數據造成的異常大值
            lifespan_days = min(max(lifespan_days, 30), 730)
            total_lifespan_days += lifespan_days
            lifespan_customer_count += 1
        else:
            # 單次購買客戶，假設壽命為90天（3個月）
            total_lifespan_days += 90
            lifespan_customer_count += 1

    # 平均顧客壽命（以年為單位，最大限制為2年）
    avg_customer_lifespan_months = (
        (total_lifespan_days / lifespan_customer_count / 30)
        if lifespan_customer_count > 0
        else 3
    )
    avg_customer_lifespan_months = min(avg_customer_lifespan_months, 24)  # 最大2年
    avg_customer_lifespan_years = avg_customer_lifespan_months / 12  # 轉換為年

    # 5. 計算 CLV = 年化顧客價值 × 平均顧客壽命(年)
    clv = customer_value * avg_customer_lifespan_years

    # Debug: 列印計算過程，幫助診斷問題
    print("DEBUG CLV 計算過程:")
    print(f"  客戶數: {customers_with_orders.count()}")
    print(f"  總營收: ${total_revenue:,.2f}")
    print(f"  總訂單數: {total_orders}")
    print(f"  平均客單價: ${avg_purchase_value:,.2f}")
    print(f"  平均消費頻率: {avg_purchase_frequency:.2f}")
    print(f"  顧客價值: ${customer_value:,.2f}")
    print(
        f"  平均顧客壽命: {avg_customer_lifespan_months:.2f} 個月 ({avg_customer_lifespan_years:.2f} 年)"
    )
    print(f"  最終 CLV: ${clv:,.2f}")
    print("=" * 50)

    return clv


def calculate_avg_purchase_frequency(customers_qs):
    """
    計算平均購買頻率（每月訂單數）
    """
    from datetime import date

    # 計算有訂單的客戶數和總訂單數
    customers_with_orders = customers_qs.filter(orders__isnull=False).distinct()

    if not customers_with_orders.exists():
        return 0

    total_orders = Order.objects.filter(customer__in=customers_with_orders).count()

    # 計算平均客戶生命週期（月）
    total_months = 0
    customer_count = 0

    for customer in customers_with_orders:
        # 計算客戶從註冊到現在的月數
        customer_age_days = (date.today() - customer.created_at.date()).days
        customer_age_months = max(customer_age_days / 30, 1)  # 至少1個月
        total_months += customer_age_months
        customer_count += 1

    if customer_count == 0:
        return 0

    avg_customer_age_months = total_months / customer_count
    avg_orders_per_customer = total_orders / customer_count

    # 平均每月購買次數 = 平均訂單數 / 平均客戶年齡(月)
    return (
        avg_orders_per_customer / avg_customer_age_months
        if avg_customer_age_months > 0
        else 0
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_clv_analytics(request):
    """
    客戶生命週期價值 (CLV) 專門分析
    """
    from django.db.models import Max, Min

    # 取得篩選參數
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    source = request.GET.get("source")

    # 基礎查詢集
    customers_qs = Customer.objects.filter(is_active=True)

    # 應用篩選條件
    if date_from:
        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__gte=date_from)
        except ValueError:
            pass

    if date_to:
        try:
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
            customers_qs = customers_qs.filter(created_at__date__lte=date_to)
        except ValueError:
            pass

    if source:
        customers_qs = customers_qs.filter(source=source)

    # 計算 CLV 相關指標
    customers_with_data = customers_qs.annotate(
        total_spent=Coalesce(
            Sum("orders__total"), Value(0), output_field=DecimalField()
        ),
        total_orders=Count("orders"),
        first_order_date=Min("orders__order_date"),
        last_order_date=Max("orders__order_date"),
        customer_age_days=timezone.now().date() - F("created_at__date"),
    ).filter(total_orders__gt=0)

    # 1. CLV 概覽統計
    # 重新計算不使用 annotated 字段的聚合
    total_customers = customers_qs.count()
    customers_with_orders = customers_qs.filter(orders__isnull=False).distinct().count()

    # 使用修正後的 CLV 計算公式（真正的生命週期價值）
    avg_clv = float(calculate_avg_clv(customers_qs))

    # 計算總 CLV（平均 CLV × 有消費客戶數）
    total_clv = avg_clv * customers_with_orders

    clv_overview = {
        "total_customers": total_customers,
        "customers_with_orders": customers_with_orders,
        "avg_clv": avg_clv,
        "median_clv": 0,  # 需要額外計算
        "total_clv": total_clv,
        "avg_order_value": float(
            Order.objects.filter(customer__in=customers_qs).aggregate(Avg("total"))[
                "total__avg"
            ]
            or 0
        ),
        "avg_purchase_frequency": float(calculate_avg_purchase_frequency(customers_qs)),
    }

    # 2. CLV 分布分析
    clv_segments = []
    clv_ranges = [
        ("低價值客戶", 0, 1000),
        ("中價值客戶", 1000, 5000),
        ("高價值客戶", 5000, 20000),
        ("頂級客戶", 20000, float("inf")),
    ]

    # 建立客戶消費額字典（用於分布分析）
    customer_clv_dict = {}
    for customer in customers_qs.filter(orders__isnull=False).distinct():
        # 使用客戶總消費額作為個人價值指標
        customer_total_spent = (
            customer.orders.aggregate(total=Sum("total"))["total"] or 0
        )
        customer_clv_dict[customer.id] = float(customer_total_spent)

    for segment_name, min_clv, max_clv in clv_ranges:
        segment_customers = []
        segment_total_value = 0

        for customer_id, clv in customer_clv_dict.items():
            if max_clv == float("inf"):
                if clv >= min_clv:
                    segment_customers.append(customer_id)
                    segment_total_value += clv
            elif min_clv <= clv < max_clv:
                segment_customers.append(customer_id)
                segment_total_value += clv

        count = len(segment_customers)
        total_customers_with_orders = len(customer_clv_dict)

        clv_segments.append(
            {
                "segment": segment_name,
                "count": count,
                "total_value": segment_total_value,
                "avg_clv": segment_total_value / count if count > 0 else 0,
                "percentage": round(count / total_customers_with_orders * 100, 1)
                if total_customers_with_orders > 0
                else 0,
            }
        )

    # 3. 按來源的 CLV 分析
    source_clv_dict = {}

    for customer in customers_qs.filter(orders__isnull=False).distinct():
        source = customer.source
        # 計算每個客戶的總消費額（作為個人 CLV 的簡化版本）
        customer_total_spent = (
            customer.orders.aggregate(total=Sum("total"))["total"] or 0
        )
        customer_orders = customer.orders.count()

        if source not in source_clv_dict:
            source_clv_dict[source] = {
                "customers": [],
                "total_spent": 0,
                "total_orders": 0,
            }

        source_clv_dict[source]["customers"].append(customer.id)
        source_clv_dict[source]["total_spent"] += float(customer_total_spent)
        source_clv_dict[source]["total_orders"] += customer_orders

    clv_by_source = []
    for source, data in source_clv_dict.items():
        count = len(data["customers"])

        # 計算該來源的真正 CLV（生命週期價值）
        source_customers_qs = customers_qs.filter(
            source=source, orders__isnull=False
        ).distinct()
        source_avg_clv = float(calculate_avg_clv(source_customers_qs))
        source_total_clv = source_avg_clv * count

        avg_orders = data["total_orders"] / count if count > 0 else 0

        clv_by_source.append(
            {
                "source": source,
                "count": count,
                "avg_clv": source_avg_clv,  # 真正的平均 CLV
                "total_clv": source_total_clv,  # 總 CLV
                "avg_orders": avg_orders,
            }
        )

    # 按平均 CLV 排序
    clv_by_source.sort(key=lambda x: x["avg_clv"], reverse=True)

    # 4. 頂級客戶列表 (總消費額前20名)
    # 排序客戶消費額字典並取前20名
    sorted_customers = sorted(
        customer_clv_dict.items(), key=lambda x: x[1], reverse=True
    )[:20]

    top_customers_list = []
    for customer_id, total_spent in sorted_customers:
        try:
            customer = Customer.objects.get(id=customer_id)
            customer_orders = customer.orders.count()

            customer_data = {
                "id": customer.id,
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "email": customer.email,
                "source": customer.source,
                "created_at": customer.created_at,
                "total_spent": float(total_spent),
                "total_orders": customer_orders,
                "full_name": f"{customer.first_name} {customer.last_name}",
                "avg_order_value": float(total_spent) / customer_orders
                if customer_orders > 0
                else 0,
            }
            top_customers_list.append(customer_data)
        except Customer.DoesNotExist:
            continue

    # 5. 月度 CLV 趨勢（新客戶的平均 CLV）
    monthly_trends = {}

    for customer in customers_qs.filter(orders__isnull=False).distinct():
        month = customer.created_at.strftime("%Y-%m")
        customer_total = customer.orders.aggregate(total=Sum("total"))["total"] or 0

        if month not in monthly_trends:
            monthly_trends[month] = {
                "new_customers": 0,
                "total_clv": 0,
                "customer_clvs": [],
            }

        monthly_trends[month]["new_customers"] += 1
        monthly_trends[month]["total_clv"] += float(customer_total)
        monthly_trends[month]["customer_clvs"].append(float(customer_total))

    monthly_clv_trend = []
    for month, data in sorted(monthly_trends.items()):
        avg_clv = (
            data["total_clv"] / data["new_customers"]
            if data["new_customers"] > 0
            else 0
        )

        monthly_clv_trend.append(
            {
                "month": month,
                "new_customers": data["new_customers"],
                "avg_clv": avg_clv,
                "total_clv": data["total_clv"],
            }
        )

    analytics = {
        "clv_overview": clv_overview,
        "clv_segments": clv_segments,
        "clv_by_source": clv_by_source,
        "top_customers": top_customers_list,
        "monthly_clv_trend": monthly_clv_trend,
    }

    return Response(analytics)
