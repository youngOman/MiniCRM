from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    # 使用 SerializerMethodField 來取得 annotated 欄位或 property 作為後備
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    def get_total_orders(self, obj):
        """
        優先使用 annotated_total_orders，如果沒有則使用 property
        """
        return getattr(obj, 'annotated_total_orders', obj.total_orders_property)
    
    def get_total_spent(self, obj):
        """
        優先使用 annotated_total_spent，如果沒有則使用 property
        """
        annotated_value = getattr(obj, 'annotated_total_spent', None)
        if annotated_value is not None:
            return float(annotated_value)
        return float(obj.total_spent_property)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'company',
            'address', 'city', 'state', 'zip_code', 'country', 'source', 'tags', 'notes',
            'age', 'gender', 'product_categories_interest', 'seasonal_purchase_pattern',
            'is_active', 'total_orders', 'total_spent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'company',
            'address', 'city', 'state', 'zip_code', 'country', 'source', 'tags', 'notes',
            'age', 'gender', 'product_categories_interest', 'seasonal_purchase_pattern',
            'is_active'
        ]