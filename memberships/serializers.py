from rest_framework import serializers
from .models import Membership, MembershipTier, MembershipHistory
from customers.serializers import CustomerListSerializer


class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipTier
        fields = [
            'id', 'name', 'description', 'minimum_spent', 'discount_percentage',
            'benefits', 'color', 'priority', 'is_active', 'created_at', 'updated_at'
        ]


class MembershipHistorySerializer(serializers.ModelSerializer):
    previous_tier = MembershipTierSerializer(read_only=True)
    new_tier = MembershipTierSerializer(read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = MembershipHistory
        fields = [
            'id', 'previous_tier', 'new_tier', 'change_reason',
            'change_date', 'changed_by_name'
        ]


class MembershipListSerializer(serializers.ModelSerializer):
    customer = CustomerListSerializer(read_only=True)
    tier = MembershipTierSerializer(read_only=True)
    is_expired = serializers.ReadOnlyField()
    days_until_expiry = serializers.ReadOnlyField()

    class Meta:
        model = Membership
        fields = [
            'id', 'customer', 'tier', 'membership_number', 'join_date',
            'expiry_date', 'status', 'points_balance', 'total_spent_lifetime',
            'is_expired', 'days_until_expiry', 'created_at'
        ]


class MembershipDetailSerializer(serializers.ModelSerializer):
    customer = CustomerListSerializer(read_only=True)
    tier = MembershipTierSerializer(read_only=True)
    history = MembershipHistorySerializer(many=True, read_only=True)
    is_expired = serializers.ReadOnlyField()
    days_until_expiry = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'customer', 'tier', 'membership_number', 'join_date',
            'expiry_date', 'status', 'points_earned', 'points_redeemed',
            'points_balance', 'total_spent_lifetime', 'notes', 'history',
            'is_expired', 'days_until_expiry', 'created_by_name',
            'updated_by_name', 'created_at', 'updated_at'
        ]


class MembershipCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = [
            'customer', 'tier', 'join_date', 'expiry_date', 'status',
            'points_earned', 'points_redeemed', 'notes'
        ]

    def validate(self, data):
        if data.get('points_redeemed', 0) > data.get('points_earned', 0):
            raise serializers.ValidationError(
                "Points redeemed cannot exceed points earned."
            )
        return data