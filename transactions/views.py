from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, TransactionItem, TransactionCategory
from .serializers import (
    TransactionListSerializer, TransactionDetailSerializer, TransactionCreateUpdateSerializer,
    TransactionCategorySerializer, TransactionItemSerializer
)


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    queryset = TransactionCategory.objects.all()
    serializer_class = TransactionCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('customer', 'category').prefetch_related('items')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'transaction_type', 'payment_method', 'category']
    search_fields = ['transaction_id', 'customer__first_name', 'customer__last_name', 'description']
    ordering_fields = ['transaction_date', 'total_amount', 'created_at']
    ordering = ['-transaction_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return TransactionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateUpdateSerializer
        return TransactionDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        total_revenue = queryset.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        total_transactions = queryset.count()
        completed_transactions = queryset.filter(status='completed').count()
        
        avg_transaction_value = queryset.filter(status='completed').aggregate(
            avg=Avg('total_amount')
        )['avg'] or 0
        
        today = timezone.now().date()
        this_month_revenue = queryset.filter(
            status='completed',
            transaction_date__year=today.year,
            transaction_date__month=today.month
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        payment_method_breakdown = queryset.filter(status='completed').values(
            'payment_method'
        ).annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total')
        
        status_breakdown = queryset.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_revenue': float(total_revenue),
            'total_transactions': total_transactions,
            'completed_transactions': completed_transactions,
            'avg_transaction_value': float(avg_transaction_value),
            'this_month_revenue': float(this_month_revenue),
            'payment_method_breakdown': [
                {
                    'payment_method': item['payment_method'],
                    'count': item['count'],
                    'total': float(item['total'])
                }
                for item in payment_method_breakdown
            ],
            'status_breakdown': list(status_breakdown)
        })

    @action(detail=False, methods=['get'])
    def revenue_trend(self, request):
        days = int(request.GET.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        daily_revenue = []
        current_date = start_date
        
        while current_date <= end_date:
            revenue = Transaction.objects.filter(
                status='completed',
                transaction_date__date=current_date
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            daily_revenue.append({
                'date': current_date.isoformat(),
                'revenue': float(revenue)
            })
            current_date += timedelta(days=1)
        
        return Response(daily_revenue)

    @action(detail=False, methods=['get'])
    def top_customers(self, request):
        limit = int(request.GET.get('limit', 10))
        
        top_customers = Transaction.objects.filter(
            status='completed'
        ).values(
            'customer__id',
            'customer__first_name',
            'customer__last_name',
            'customer__email'
        ).annotate(
            total_spent=Sum('total_amount'),
            transaction_count=Count('id')
        ).order_by('-total_spent')[:limit]
        
        return Response([
            {
                'customer_id': customer['customer__id'],
                'name': f"{customer['customer__first_name']} {customer['customer__last_name']}",
                'email': customer['customer__email'],
                'total_spent': float(customer['total_spent']),
                'transaction_count': customer['transaction_count']
            }
            for customer in top_customers
        ])