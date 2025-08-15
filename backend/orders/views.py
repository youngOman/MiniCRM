from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Order, OrderItem
from .serializers import (
    OrderCreateUpdateSerializer,
    OrderItemSerializer,
    OrderSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("customer").prefetch_related("items")
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status", "customer", "order_date"]
    search_fields = [
        "order_number",
        "customer__first_name",
        "customer__last_name",
        "customer__email",
    ]
    ordering_fields = ["order_number", "order_date", "total", "status"]
    ordering = ["-order_date"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return OrderCreateUpdateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.select_related("order")
    serializer_class = OrderItemSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["order", "product_sku"]
    search_fields = ["product_name", "product_sku"]
    ordering_fields = ["product_name", "quantity", "unit_price", "total_price"]
    ordering = ["-created_at"]
