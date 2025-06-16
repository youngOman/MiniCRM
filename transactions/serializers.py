from rest_framework import serializers
from .models import Transaction, TransactionItem, TransactionCategory
from customers.serializers import CustomerListSerializer


class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        fields = ['id', 'name', 'description', 'created_at']


class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = [
            'id', 'product_name', 'product_sku', 'quantity', 
            'unit_price', 'total_price', 'created_at'
        ]


class TransactionListSerializer(serializers.ModelSerializer):
    customer = CustomerListSerializer(read_only=True)
    category = TransactionCategorySerializer(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'customer', 'transaction_type', 'category',
            'total_amount', 'payment_method', 'status', 'transaction_date',
            'created_by_name', 'created_at'
        ]


class TransactionDetailSerializer(serializers.ModelSerializer):
    customer = CustomerListSerializer(read_only=True)
    category = TransactionCategorySerializer(read_only=True)
    items = TransactionItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'customer', 'transaction_type', 'category',
            'amount', 'tax_amount', 'discount_amount', 'total_amount',
            'payment_method', 'payment_reference', 'status', 'description',
            'notes', 'transaction_date', 'due_date', 'items',
            'created_by_name', 'updated_by_name', 'created_at', 'updated_at'
        ]


class TransactionCreateUpdateSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, required=False)

    class Meta:
        model = Transaction
        fields = [
            'customer', 'transaction_type', 'category', 'amount', 'tax_amount',
            'discount_amount', 'payment_method', 'payment_reference', 'status',
            'description', 'notes', 'transaction_date', 'due_date', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        transaction = Transaction.objects.create(**validated_data)
        
        for item_data in items_data:
            TransactionItem.objects.create(transaction=transaction, **item_data)
        
        return transaction

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                TransactionItem.objects.create(transaction=instance, **item_data)
        
        return instance