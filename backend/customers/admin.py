from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'company', 'source', 'is_active', 'created_at']
    list_filter = ['source', 'is_active', 'country', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    fieldsets = [
        ('Personal Information', {
            'fields': ['first_name', 'last_name', 'email', 'phone']
        }),
        ('Company Information', {
            'fields': ['company']
        }),
        ('Address', {
            'fields': ['address', 'city', 'state', 'zip_code', 'country']
        }),
        ('Marketing', {
            'fields': ['source', 'tags', 'notes']
        }),
        ('Status', {
            'fields': ['is_active']
        }),
        ('Audit', {
            'fields': ['created_at', 'updated_at', 'created_by', 'updated_by'],
            'classes': ['collapse']
        })
    ]
