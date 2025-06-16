from rest_framework import serializers
from .models import Customer, CustomerTag, CustomerSource


class CustomerTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTag
        fields = ['id', 'name', 'color', 'created_at']


class CustomerSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerSource
        fields = ['id', 'name', 'description', 'created_at']


class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_spent = serializers.ReadOnlyField()
    transaction_count = serializers.ReadOnlyField()
    last_transaction_date = serializers.ReadOnlyField()
    tags = CustomerTagSerializer(many=True, read_only=True)
    source = CustomerSourceSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'company', 'status', 'source', 'tags', 'total_spent', 
            'transaction_count', 'last_transaction_date', 'created_at'
        ]


class CustomerDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_spent = serializers.ReadOnlyField()
    transaction_count = serializers.ReadOnlyField()
    last_transaction_date = serializers.ReadOnlyField()
    tags = CustomerTagSerializer(many=True, read_only=True)
    source = CustomerSourceSerializer(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'gender', 'date_of_birth', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country', 'company', 'job_title',
            'status', 'source', 'tags', 'notes', 'profile_image',
            'total_spent', 'transaction_count', 'last_transaction_date',
            'created_by_name', 'updated_by_name', 'created_at', 'updated_at'
        ]


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'gender', 'date_of_birth',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code',
            'country', 'company', 'job_title', 'status', 'source', 'notes',
            'profile_image', 'tag_ids'
        ]

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        customer = Customer.objects.create(**validated_data)
        
        if tag_ids:
            customer.tags.set(tag_ids)
        
        return customer

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        
        return instance