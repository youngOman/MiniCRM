from customers.serializers import CustomerSerializer
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    FAQ,
    KnowledgeBase,
    KnowledgeBaseCategory,
    ServiceNote,
    ServiceTicket,
)


class UserSerializer(serializers.ModelSerializer):
    """用戶序列化器"""

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class ServiceNoteSerializer(serializers.ModelSerializer):
    """客服記錄序列化器"""

    created_by_info = UserSerializer(source="created_by", read_only=True)

    class Meta:
        model = ServiceNote
        fields = [
            "id",
            "content",
            "note_type",
            "is_visible_to_customer",
            "attachments",
            "created_at",
            "created_by",
            "created_by_info",
        ]
        read_only_fields = ["created_at", "created_by"]


class ServiceTicketListSerializer(serializers.ModelSerializer):
    """客服工單列表序列化器"""

    customer_info = CustomerSerializer(source="customer", read_only=True)
    assigned_to_info = UserSerializer(source="assigned_to", read_only=True)
    created_by_info = UserSerializer(source="created_by", read_only=True)
    notes_count = serializers.SerializerMethodField()

    class Meta:
        model = ServiceTicket
        fields = [
            "id",
            "ticket_number",
            "title",
            "category",
            "priority",
            "status",
            "customer",
            "customer_info",
            "assigned_to",
            "assigned_to_info",
            "created_by",
            "created_by_info",
            "created_at",
            "updated_at",
            "notes_count",
            "satisfaction_rating",
        ]

    def get_notes_count(self, obj):
        return obj.notes.count()


class ServiceTicketDetailSerializer(serializers.ModelSerializer):
    """客服工單詳情序列化器"""

    customer_info = CustomerSerializer(source="customer", read_only=True)
    assigned_to_info = UserSerializer(source="assigned_to", read_only=True)
    created_by_info = UserSerializer(source="created_by", read_only=True)
    notes = ServiceNoteSerializer(many=True, read_only=True)
    response_time_display = serializers.SerializerMethodField()
    resolution_time_display = serializers.SerializerMethodField()

    class Meta:
        model = ServiceTicket
        fields = [
            "id",
            "ticket_number",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "customer",
            "customer_info",
            "assigned_to",
            "assigned_to_info",
            "created_by",
            "created_by_info",
            "created_at",
            "updated_at",
            "first_response_at",
            "resolved_at",
            "closed_at",
            "tags",
            "satisfaction_rating",
            "satisfaction_comment",
            "notes",
            "response_time_display",
            "resolution_time_display",
        ]
        read_only_fields = ["ticket_number", "created_at", "updated_at", "created_by"]

    def get_response_time_display(self, obj) -> str | None:
        """格式化首次回應時間"""
        if obj.response_time:
            total_seconds = int(obj.response_time.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}小時{minutes}分鐘"
        return None

    def get_resolution_time_display(self, obj) -> str | None:
        """格式化解決時間"""
        if obj.resolution_time:
            total_seconds = int(obj.resolution_time.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            if hours > 24:
                days = hours // 24
                remaining_hours = hours % 24
                return f"{days}天{remaining_hours}小時{minutes}分鐘"
            return f"{hours}小時{minutes}分鐘"
        return None


class ServiceTicketCreateUpdateSerializer(serializers.ModelSerializer):
    """客服工單建立/更新序列化器"""

    class Meta:
        model = ServiceTicket
        fields = [
            "title",
            "description",
            "category",
            "priority",
            "status",
            "customer",
            "assigned_to",
            "tags",
            "satisfaction_rating",
            "satisfaction_comment",
        ]

    def create(self, validated_data):
        # 設定建立者
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class KnowledgeBaseCategorySerializer(serializers.ModelSerializer):
    """知識庫分類序列化器"""

    children = serializers.SerializerMethodField()
    articles_count = serializers.SerializerMethodField()

    class Meta:
        model = KnowledgeBaseCategory
        fields = [
            "id",
            "name",
            "description",
            "parent",
            "sort_order",
            "is_active",
            "children",
            "articles_count",
        ]

    def get_children(self, obj):
        if obj.children.exists():
            return KnowledgeBaseCategorySerializer(
                obj.children.filter(is_active=True), many=True
            ).data
        return []

    def get_articles_count(self, obj):
        return obj.knowledgebase_set.filter(is_active=True).count()


class KnowledgeBaseListSerializer(serializers.ModelSerializer):
    """知識庫列表序列化器"""

    category_info = KnowledgeBaseCategorySerializer(source="category", read_only=True)
    created_by_info = UserSerializer(source="created_by", read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            "id",
            "title",
            "summary",
            "category",
            "category_info",
            "content_type",
            "tags",
            "is_public",
            "is_featured",
            "created_by",
            "created_by_info",
            "updated_at",
            "view_count",
            "helpfulness_ratio",
        ]


class KnowledgeBaseDetailSerializer(serializers.ModelSerializer):
    """知識庫詳情序列化器"""

    category_info = KnowledgeBaseCategorySerializer(source="category", read_only=True)
    created_by_info = UserSerializer(source="created_by", read_only=True)
    updated_by_info = UserSerializer(source="updated_by", read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            "id",
            "title",
            "content",
            "summary",
            "category",
            "category_info",
            "content_type",
            "tags",
            "is_public",
            "is_featured",
            "is_active",
            "created_by",
            "created_by_info",
            "updated_by",
            "updated_by_info",
            "created_at",
            "updated_at",
            "view_count",
            "helpful_count",
            "not_helpful_count",
            "helpfulness_ratio",
        ]
        read_only_fields = ["created_by", "created_at", "view_count"]


class KnowledgeBaseCreateUpdateSerializer(serializers.ModelSerializer):
    """知識庫建立/更新序列化器"""

    class Meta:
        model = KnowledgeBase
        fields = [
            "title",
            "content",
            "summary",
            "category",
            "content_type",
            "tags",
            "is_public",
            "is_featured",
            "is_active",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        validated_data["updated_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)


class FAQSerializer(serializers.ModelSerializer):
    """FAQ 序列化器"""

    category_info = KnowledgeBaseCategorySerializer(source="category", read_only=True)
    created_by_info = UserSerializer(source="created_by", read_only=True)

    class Meta:
        model = FAQ
        fields = [
            "id",
            "question",
            "answer",
            "category",
            "category_info",
            "is_active",
            "is_featured",
            "sort_order",
            "view_count",
            "created_by",
            "created_by_info",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "view_count"]


class FAQCreateUpdateSerializer(serializers.ModelSerializer):
    """FAQ 建立/更新序列化器"""

    class Meta:
        model = FAQ
        fields = [
            "question",
            "answer",
            "category",
            "is_active",
            "is_featured",
            "sort_order",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
