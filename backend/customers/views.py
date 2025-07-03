from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters_drf
from .models import Customer
from .serializers import CustomerSerializer, CustomerCreateUpdateSerializer


class CustomerFilter(filters_drf.FilterSet):
    date_from = filters_drf.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = filters_drf.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Customer
        fields = ['source', 'is_active', 'city', 'state', 'country', 'date_from', 'date_to']


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['first_name', 'last_name', 'email', 'company', 'phone']
    ordering_fields = ['first_name', 'last_name', 'email', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        customer = self.get_object()
        orders = customer.orders.all()
        # Import here to avoid circular import
        from orders.serializers import OrderSerializer
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        customer = self.get_object()
        transactions = customer.transactions.all()
        # Import here to avoid circular import
        from transactions.serializers import TransactionSerializer
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
