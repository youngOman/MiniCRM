from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters_drf
from django.db.models import Sum, Count, Value, DecimalField
from django.db.models.functions import Coalesce
from .models import Customer
from .serializers import CustomerSerializer, CustomerCreateUpdateSerializer


# 多新增一個篩選器，讓使用者可以根據創建日期範圍來過濾客戶資料
class CustomerFilter(filters_drf.FilterSet):
    date_from = filters_drf.DateFilter(
        field_name="created_at", lookup_expr="gte"
    )  # 大於等於創建日期
    date_to = filters_drf.DateFilter(
        field_name="created_at", lookup_expr="lte"
    )  # 小於等於創建日期

    class Meta:
        model = Customer
        fields = [
            "source",
            "is_active",
            "city",
            "state",
            "country",
            "date_from",
            "date_to",
        ]


class CustomerViewSet(viewsets.ModelViewSet):
    # 保留基本的 queryset 屬性給 DRF 路由使用
    queryset = Customer.objects.all()
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = CustomerFilter
    search_fields = ["first_name", "last_name", "email", "company", "phone"]
    # 加入 annotated_total_spent 和 annotated_total_orders 到可排序欄位
    ordering_fields = [
        "created_at",
        "updated_at",
        "annotated_total_spent",
        "annotated_total_orders",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        自定義 queryset，加入計算欄位以支援 total_spent 和 total_orders 排序
        這樣就可以在前端使用 ?ordering=total_spent 或 ?ordering=-total_spent 來排序
        """
        queryset = Customer.objects.all()

        # 使用 Django ORM 的聚合功能計算每個客戶的總消費額和總訂單數
        # 這樣就可以在資料庫層面進行排序，而不需要在 Python 層面處理
        queryset = queryset.annotate(
            # 計算總消費額：將該客戶所有訂單的 total 欄位相加
            # 使用 Coalesce 處理 NULL 值，如果 Sum 結果是 NULL（沒有訂單）就設為 0
            annotated_total_spent=Coalesce(
                Sum("orders__total"),
                Value(0),
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            # 計算總訂單數：計算該客戶的訂單數量
            # 使用不同名稱避免與模型 property 衝突
            annotated_total_orders=Count("orders"),
        )

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CustomerCreateUpdateSerializer
        return CustomerSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["get"])
    def orders(self, request, pk=None):
        customer = self.get_object()
        orders = customer.orders.all()
        # Import here to avoid circular import
        from orders.serializers import OrderSerializer

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def transactions(self, request, pk=None):
        customer = self.get_object()
        transactions = customer.transactions.all()
        # Import here to avoid circular import
        from transactions.serializers import TransactionSerializer

        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
