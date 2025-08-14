from rest_framework import serializers
from .models import Order, OrderItem
from customers.serializers import CustomerSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    unit_price = serializers.FloatField()
    total_price = serializers.FloatField(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["total_price", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    customer_info = CustomerSerializer(source="customer", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    subtotal = serializers.FloatField()
    tax_amount = serializers.FloatField()
    shipping_amount = serializers.FloatField()
    discount_amount = serializers.FloatField()
    total = serializers.FloatField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer",
            "customer_info",
            "status",
            "order_date",
            "subtotal",
            "tax_amount",
            "shipping_amount",
            "discount_amount",
            "total",
            "shipping_address",
            "billing_address",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["order_number", "total", "created_at", "updated_at"]


class OrderCreateUpdateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = [
            "customer",
            "status",
            "subtotal",
            "tax_amount",
            "shipping_amount",
            "discount_amount",
            "shipping_address",
            "billing_address",
            "notes",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

        # Update order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle items if provided
        if items_data:
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        return instance
