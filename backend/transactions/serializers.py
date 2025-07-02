from rest_framework import serializers
from .models import Transaction
from customers.serializers import CustomerSerializer


class TransactionSerializer(serializers.ModelSerializer):
    customer_info = CustomerSerializer(source='customer', read_only=True)
    order_info = serializers.SerializerMethodField()
    amount = serializers.FloatField()
    fee_amount = serializers.FloatField()
    net_amount = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'customer', 'customer_info', 'order', 'order_info',
            'transaction_type', 'payment_method', 'status', 'amount', 'fee_amount',
            'net_amount', 'currency', 'gateway_transaction_id', 'gateway_response',
            'description', 'notes', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['transaction_id', 'net_amount', 'created_at', 'updated_at']
    
    def get_order_info(self, obj):
        if obj.order:
            return {
                'id': obj.order.id,
                'order_number': obj.order.order_number,
                'status': obj.order.status,
                'total': float(obj.order.total)
            }
        return None


class TransactionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'customer', 'order', 'transaction_type', 'payment_method', 'status',
            'amount', 'fee_amount', 'currency', 'gateway_transaction_id',
            'gateway_response', 'description', 'notes', 'processed_at'
        ]