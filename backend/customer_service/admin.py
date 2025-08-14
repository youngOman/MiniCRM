from django.contrib import admin
from .models import (
    ServiceTicket,
    ServiceNote,
    KnowledgeBase,
    KnowledgeBaseCategory,
    FAQ,
)


@admin.register(KnowledgeBaseCategory)
class KnowledgeBaseCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "parent", "sort_order", "is_active", "created_at"]
    list_filter = ["is_active", "parent"]
    search_fields = ["name", "description"]
    ordering = ["sort_order", "name"]


class ServiceNoteInline(admin.TabularInline):
    model = ServiceNote
    extra = 0
    readonly_fields = ["created_at", "created_by"]


@admin.register(ServiceTicket)
class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = [
        "ticket_number",
        "title",
        "customer",
        "category",
        "priority",
        "status",
        "assigned_to",
        "created_at",
    ]
    list_filter = ["status", "priority", "category", "assigned_to", "created_at"]
    search_fields = [
        "ticket_number",
        "title",
        "customer__first_name",
        "customer__last_name",
        "customer__email",
    ]
    readonly_fields = ["ticket_number", "created_at", "updated_at"]
    ordering = ["-created_at"]
    inlines = [ServiceNoteInline]

    fieldsets = (
        ("基本資訊", {"fields": ("ticket_number", "customer", "title", "description")}),
        ("分類和優先級", {"fields": ("category", "priority", "status", "tags")}),
        ("處理資訊", {"fields": ("assigned_to", "created_by")}),
        (
            "時間記錄",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                    "first_response_at",
                    "resolved_at",
                    "closed_at",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "滿意度",
            {
                "fields": ("satisfaction_rating", "satisfaction_comment"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(ServiceNote)
class ServiceNoteAdmin(admin.ModelAdmin):
    list_display = [
        "ticket",
        "note_type",
        "created_by",
        "created_at",
        "is_visible_to_customer",
    ]
    list_filter = ["note_type", "is_visible_to_customer", "created_at"]
    search_fields = ["ticket__ticket_number", "content"]
    readonly_fields = ["created_at", "created_by"]
    ordering = ["-created_at"]


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "category",
        "content_type",
        "is_public",
        "is_featured",
        "view_count",
        "updated_at",
    ]
    list_filter = ["content_type", "category", "is_public", "is_featured", "is_active"]
    search_fields = ["title", "content", "summary", "tags"]
    readonly_fields = [
        "view_count",
        "helpful_count",
        "not_helpful_count",
        "created_at",
        "updated_at",
    ]
    ordering = ["-updated_at"]

    fieldsets = (
        ("基本資訊", {"fields": ("title", "summary", "content")}),
        ("分類和標籤", {"fields": ("category", "content_type", "tags")}),
        ("權限設定", {"fields": ("is_public", "is_featured", "is_active")}),
        (
            "統計資訊",
            {
                "fields": ("view_count", "helpful_count", "not_helpful_count"),
                "classes": ("collapse",),
            },
        ),
        (
            "時間記錄",
            {
                "fields": ("created_by", "updated_by", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = [
        "question",
        "category",
        "is_featured",
        "is_active",
        "view_count",
        "created_at",
    ]
    list_filter = ["category", "is_featured", "is_active"]
    search_fields = ["question", "answer"]
    readonly_fields = ["view_count", "created_at", "updated_at"]
    ordering = ["-is_featured", "sort_order"]

    fieldsets = (
        ("基本資訊", {"fields": ("question", "answer", "category")}),
        ("設定", {"fields": ("is_active", "is_featured", "sort_order")}),
        ("統計", {"fields": ("view_count",), "classes": ("collapse",)}),
    )
