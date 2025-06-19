from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_orders = serializers.ReadOnlyField()
    total_spent = serializers.ReadOnlyField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'company',
            'address', 'city', 'state', 'zip_code', 'country', 'source', 'tags', 'notes',
            'is_active', 'total_orders', 'total_spent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'company',
            'address', 'city', 'state', 'zip_code', 'country', 'source', 'tags', 'notes',
            'is_active'
        ]