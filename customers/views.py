from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q
from .models import Customer, CustomerTag, CustomerSource
from .serializers import (
    CustomerListSerializer, CustomerDetailSerializer, CustomerCreateUpdateSerializer,
    CustomerTagSerializer, CustomerSourceSerializer
)


class CustomerTagViewSet(viewsets.ModelViewSet):
    queryset = CustomerTag.objects.all()
    serializer_class = CustomerTagSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class CustomerSourceViewSet(viewsets.ModelViewSet):
    queryset = CustomerSource.objects.all()
    serializer_class = CustomerSourceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related('source').prefetch_related('tags')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'tags']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'company']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        total_customers = queryset.count()
        active_customers = queryset.filter(status='active').count()
        new_customers_this_month = queryset.filter(
            created_at__month=request.GET.get('month', 
                                            timezone.now().month)
        ).count()
        
        top_sources = CustomerSource.objects.annotate(
            customer_count=Count('customer')
        ).order_by('-customer_count')[:5]
        
        status_breakdown = queryset.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'new_customers_this_month': new_customers_this_month,
            'top_sources': [
                {'name': source.name, 'count': source.customer_count}
                for source in top_sources
            ],
            'status_breakdown': list(status_breakdown)
        })

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        customer = self.get_object()
        transactions = customer.transactions.all()
        
        from transactions.serializers import TransactionListSerializer
        serializer = TransactionListSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def membership(self, request, pk=None):
        customer = self.get_object()
        if hasattr(customer, 'membership'):
            from memberships.serializers import MembershipDetailSerializer
            serializer = MembershipDetailSerializer(customer.membership)
            return Response(serializer.data)
        return Response({'detail': 'No membership found'}, status=404)